import { is, jinjaKind } from '../../../utils/common-checks.js';
import { HA_CONTEXT, CARD } from '../../../utils/parameters.js';
import type { HomeAssistant } from '../../../utils/hass-provider.js';
import type { LoggerInstance } from '../../../utils/log.js';
import type { Config } from '../../../utils/types.js';
import type { ResourceManager } from '../../dom/dom-helpers.js';
import { markInner, type WatermarkMark } from '../../config/schema.js';

type JinjaMessage = { result?: unknown; error?: unknown };

// What the subscriptions need from the card that owns them.
interface JinjaSubscriptionsHost {
  hass: () => HomeAssistant | undefined | null;
  resourceManager: () => ResourceManager | null;
  isConnected: () => boolean;
  log: () => LoggerInstance | null;
  ensureResourceManager: () => void;
  config: () => Config;
  handlers: (content?: unknown) => Record<string, () => void>;
  canProcess: () => boolean;
  context: () => { entity?: string };
  onFailure: (key: string, message: string) => void;
  report: (message: string, detail?: unknown) => void;
}

class JinjaSubscriptions {
  readonly #host: JinjaSubscriptionsHost;
  // CF5 - issue (perf) resolved - signature (template + entity) of each live or
  // in-flight subscription: skips the unsubscribe/resubscribe on every refresh.
  #templateSignatures = new Map<string, string>();
  // Signatures HA rejected as un-renderable, one per field: any edit changes
  // the signature and retries by construction.
  #failedSignatures = new Map<string, string>();

  constructor(host: JinjaSubscriptionsHost) {
    this.#host = host;
  }

  get keys(): string[] {
    return [...this.#templateSignatures.keys()];
  }

  // Most Jinja options are flat strings; min_value and watermark.low/.high use
  // a { jinja } map (markInner); status_label's bare string IS the target.
  get validFields(): Record<string, string> {
    const host = this.#host;
    const rawValueFor = (key: string) => {
      const config = host.config();
      const raw = key.includes('.')
        ? key
            .split('.')
            .reduce<unknown>((obj, k) => (is.string(obj) ? obj : (obj as Record<string, unknown>)?.[k]), config)
        : config[key];
      const unwrapped = markInner(raw as WatermarkMark);
      return is.plainObject(unwrapped) ? (unwrapped.jinja ?? '') : unwrapped || '';
    };
    const handlers = host.handlers();
    const result = Object.fromEntries(
      Object.keys(handlers)
        .map((key) => [key, rawValueFor(key)])
        .filter(([, value]) => is.nonEmptyString(value)),
    );
    host.log()?.debug('validJinjaFields: ', { handler: handlers, config: host.config(), result });
    return result;
  }

  process() {
    const host = this.#host;
    const log = host.log();
    if (!host.canProcess()) {
      log?.debug('❌ Jinja processing skipped - validation failed');
      return;
    }

    log?.debug('✅ Processing Jinja fields');

    host.resourceManager()?.throttleDebounce(
      () => {
        const templates = this.validFields;
        this.#cleanupOrphans(templates);
        for (const [key, template] of Object.entries(templates)) {
          if (is.nonEmptyString(template)) this.subscribe(key, template);
        }
      },
      300,
      'jinjaProcess',
    );
  }

  // CF5 - issue (perf) resolved - a field removed from the config kept pushing
  // into a DOM that no longer expects it until disconnect.
  #cleanupOrphans(templates: Record<string, string>) {
    for (const subscriptionKey of this.keys) {
      const key = subscriptionKey.slice('template-'.length);
      if (!is.nonEmptyString(templates[key])) {
        this.#host.resourceManager()?.remove(subscriptionKey);
        this.forget(subscriptionKey);
      }
    }
  }

  #onMessage(key: string, msg: JinjaMessage) {
    if (is.nullish(msg.error)) this.render(key, msg.result);
    else this.#host.onFailure(key, String(msg.error));
  }

  // A multi-step script can push one intermediate result per entity change
  // (issue #135): debounced per key, the last push wins.
  render(key: string, content: unknown) {
    const host = this.#host;
    host.log()?.debug('📎 HACore._renderJinja():', { key, content });
    host.resourceManager()?.setTimeout(() => this.#apply(key, content), 80, `jinja-render-${key}`);
  }

  #apply(key: string, content: unknown) {
    const handler = this.#host.handlers(content)[key];

    if (handler) {
      // CF5 - issue (critical) resolved - a render handler exception must not
      // crash the card from the WebSocket callback.
      try {
        handler();
      } catch (error) {
        this.#host.log()?.error(`Jinja - render failed for ${key}:`, error);
      }
    } else {
      console.error(`Jinja - Unknown case: ${key}`);
    }
  }

  // Forces a fresh subscription per field: a now()/utcnow() template does not
  // re-evaluate by itself between HA's pushes.
  resubscribeAll() {
    for (const [key, template] of Object.entries(this.validFields)) {
      if (is.nonEmptyString(template)) this.subscribe(key, template, true);
    }
  }

  get watching(): boolean {
    const resourceManager = this.#host.resourceManager();
    return Boolean(resourceManager?.has(CARD.network.disconnected) && resourceManager?.has(CARD.network.ready));
  }

  unwatch() {
    const resourceManager = this.#host.resourceManager();
    if (!resourceManager) return;
    resourceManager.remove(CARD.network.disconnected);
    resourceManager.remove(CARD.network.ready);
  }

  watch() {
    const host = this.#host;
    const resourceManager = host.resourceManager();
    const hass = host.hass();
    // #87: conditionally hiding/re-showing the card (visibility + an
    // input_text helper) could leave resourceManager or hass momentarily null.
    if (!resourceManager || !hass) return;
    this.unwatch();
    resourceManager.addEventListener(
      hass.connection,
      'disconnected',
      () => {
        host.log()?.debug('🔌 WebSocket disconnected');
        for (const key of Object.keys(this.validFields)) {
          host.resourceManager()?.remove(`template-${key}`);
        }
        // Every subscription is dead server-side, and a template that failed
        // while HA was going down deserves another try.
        this.clear();
      },
      { passive: true },
      CARD.network.disconnected,
    );

    resourceManager.addEventListener(
      hass.connection,
      'ready',
      () => {
        host.log()?.debug('🔁 WebSocket ready — reprocessing templates');
        host.ensureResourceManager();
        this.process();
      },
      { passive: true },
      CARD.network.ready,
    );
  }

  forget(subscriptionKey: string) {
    this.#templateSignatures.delete(subscriptionKey);
  }

  // A new config empties the views' pushed state: subscribe again so HA sends
  // it back. The keys stay, so a field the config dropped is still cleaned up.
  invalidate() {
    for (const subscriptionKey of this.#templateSignatures.keys()) this.#templateSignatures.set(subscriptionKey, '');
  }

  clear() {
    this.#templateSignatures.clear();
    this.#failedSignatures.clear();
  }

  // HA's 'template_error' also covers a render that blew its time budget:
  // only a real TemplateError is deterministic, a timeout stays retryable.
  static #isTemplateError(error: unknown): boolean {
    const { code, message } = (error ?? {}) as { code?: string; message?: string };
    return code === 'template_error' && !String(message ?? '').includes('Exceeded maximum execution time');
  }

  async subscribe(key: string, template: string, force = false) {
    const host = this.#host;
    const log = host.log();
    log?.debug('📎 JinjaSubscriptions.subscribe:', { key, template });
    const subscriptionKey = `template-${key}`;

    const hass = host.hass();
    if (!hass?.connection?.connected) {
      log?.debug(`[Template ${key}] WebSocket not connected, skipping subscription.`);
      return;
    }
    log?.debug('network ok...');

    if (!host.resourceManager()) {
      log?.debug(`[Template ${key}] ResourceManager is null, skipping subscription.`);
      return;
    }

    // CF5 - issue (perf) resolved - skip an identical live or in-flight one;
    // reserving the signature before the await also avoids a duplicate.
    // `force` (_onAutoRefreshTick) bypasses it on purpose: a now() template
    // does not re-push by itself (issue #127).
    const signature = `${template}\u0000${host.context().entity ?? ''}`;
    if (!force && this.#templateSignatures.get(subscriptionKey) === signature) {
      log?.debug(`[Template ${key}] Identical subscription live or in-flight, skipping.`);
      return;
    }
    // HA already refused this exact template: editing it changes the signature
    // and lifts the block.
    if (this.#failedSignatures.get(subscriptionKey) === signature) {
      log?.debug(`[Template ${key}] Rejected by HA and unchanged since, skipping.`);
      return;
    }
    // An unclosed delimiter can only be refused: recorded like an HA rejection.
    if (jinjaKind(template) === 'malformed') {
      this.#failedSignatures.set(subscriptionKey, signature);
      host.onFailure(key, 'unclosed delimiter');
      host.report(
        `${key}: the Jinja template has an unclosed delimiter and was not sent to Home Assistant. ` +
          'Please close it ({{ ... }}, {% ... %} or {# ... #}). This field stays empty until the template changes.',
        template,
      );
      return;
    }
    this.#templateSignatures.set(subscriptionKey, signature);

    try {
      log?.debug('key:', key);
      log?.debug('template:', template);

      const unsub = await hass.connection.subscribeMessage(
        (msg: unknown) => this.#onMessage(key, msg as JinjaMessage),
        {
          type: HA_CONTEXT.ws.renderTemplate,
          template,
          variables: host.context(),
        },
      );

      if (this.#templateSignatures.get(subscriptionKey) !== signature) {
        // A newer subscription attempt superseded this one while we awaited.
        unsub();
        return;
      }
      const resourceManager = host.resourceManager();
      if (!resourceManager) {
        log?.debug(`[Template ${key}] ResourceManager became null during subscription, cleaning up.`);
        unsub();
        this.#templateSignatures.delete(subscriptionKey);
        return;
      } else if (!host.isConnected()) {
        unsub();
        this.#templateSignatures.delete(subscriptionKey);
        return;
      } else {
        resourceManager.remove(subscriptionKey);
        resourceManager.addSubscription(unsub, subscriptionKey);
      }
    } catch (error) {
      // Allow a retry on the next processing cycle.
      if (this.#templateSignatures.get(subscriptionKey) === signature) this.#templateSignatures.delete(subscriptionKey);
      // Only a template-level rejection is deterministic; a transport failure
      // must stay retryable, or a valid template dies for the session.
      if (JinjaSubscriptions.#isTemplateError(error)) {
        this.#failedSignatures.set(subscriptionKey, signature);
        host.onFailure(key, (error as { message?: string })?.message ?? String(error));
      }
      host.report(
        `${key}: Home Assistant rejected the Jinja template (${(error as { message?: string })?.message ?? error}). ` +
          'Please check its syntax. This field stays empty until the template changes.',
        error,
      );
    }
  }
}

export { JinjaSubscriptions };
