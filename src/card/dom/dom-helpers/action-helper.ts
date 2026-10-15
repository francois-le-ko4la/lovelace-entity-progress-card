import { CARD_CONTEXT, HA_CONTEXT } from '../../../utils/parameters.js';
import { assertDefined } from '../../../utils/common-checks.js';
import { initLogger, type LoggerInstance } from '../../../utils/log.js';
import { type Config } from '../../../utils/types.js';

// Centralized handler for `xyz_action` logic. Deprecated for HA 2026.3+.

// `config` is the raw card config (entity + per-action `*_action` bags) -
// deliberately untyped: the action-config shape belongs to HA's own
// tap/hold/double-tap action schema, not something this helper defines.
interface ActionHandlerElement extends HTMLElement {
  bind(target: HTMLElement, options: { hasHold: boolean; hasDoubleClick: boolean }): void;
}

class ActionHelper {
  #target: HTMLElement | null = null;
  #config: Config | null = null;
  #fromIcon = false;
  #initialized = false;
  #disableIconTap = false;
  #iconClickSources = new Set(['shape', HA_CONTEXT.elements.svgIcon, 'img']);
  #debug = CARD_CONTEXT.debug.interactionHandler;
  #log: LoggerInstance | null = null;

  constructor(target: HTMLElement | null) {
    this.#target = target;
    this.#log = initLogger(this, 'ActionHelper', this.#debug, ['init']);
  }

  // CF5 - issue (major) resolved - the HA frontend creates <action-handler>
  // lazily; querySelector could return null and crash if this card loads before
  // any native card
  static #getActionHandler(): ActionHandlerElement {
    let handler = document.body.querySelector(HA_CONTEXT.elements.actionHandler) as ActionHandlerElement | null;
    if (!handler) {
      handler = document.createElement(HA_CONTEXT.elements.actionHandler) as unknown as ActionHandlerElement;
      document.body.appendChild(handler);
    }
    return handler;
  }

  init(config: Config, disableIconTap: boolean) {
    // Config and options are refreshed on every call (each connectedCallback);
    // listeners are attached once — see below.
    this.#config = config;
    this.#disableIconTap = disableIconTap;

    if (!this.#target) return;

    // CF5 - issue (major) resolved - init() runs on every connectedCallback
    // (view navigation, edit mode); listeners accumulated and a single tap
    // dispatched N hass-action events. init is now idempotent.
    if (this.#initialized) return;
    this.#initialized = true;

    ActionHelper.#getActionHandler().bind(this.#target, {
      hasHold: true,
      hasDoubleClick: true,
    });

    this.#target.addEventListener(
      'pointerdown',
      (ev) => {
        const localName = (ev.composedPath()[0] as HTMLElement).localName;
        this.#fromIcon = !this.#disableIconTap && this.#iconClickSources.has(localName);
      },
      { passive: true },
    );

    this.#target.addEventListener('action', (ev) => {
      this.#handleAction(ev as CustomEvent, this.#fromIcon);
    });
  }

  // Keyboard entry point for the icon's own action (Enter/Space while the
  // icon is focused - see .clickable-icon .shape's tabindex/role in
  // core.ts). Deliberately NOT a second <action-handler> binding on .shape:
  // its pointerdown listener would ALSO see and re-dispatch any real
  // mouse/touch click, since action-handler never calls stopPropagation() -
  // a double-fire, same class of bug as the card/icon ripple one fixed
  // earlier. Reuses #handleAction's own resolution instead, triggered from a
  // keydown. Only "tap" - Enter/Space has no hold/double-tap equivalent.
  triggerIconTap() {
    if (!this.#config) return;
    this.#handleAction(new CustomEvent('action', { detail: { action: 'tap' } }), true);
  }

  #handleAction(ev: CustomEvent, fromIcon: boolean) {
    // Only reachable via the 'action' listener attached in #attachListeners,
    // itself only wired up from init() once #config has already been set.
    const config = assertDefined(this.#config, 'ActionHelper.#handleAction called before init()');
    const action = ev.detail.action;
    const iconActionKey = `icon_${action}_action`;

    const actionConfig =
      fromIcon && config[iconActionKey]?.action !== 'none' ? config[iconActionKey] : config[`${action}_action`];

    this.#log?.debug(`action="${action}" fromIcon=${fromIcon} → resolved:`, actionConfig ?? '(none, ignored)');
    if (!actionConfig) return;

    this.#target?.dispatchEvent(
      new CustomEvent(HA_CONTEXT.events.action, {
        bubbles: true,
        composed: true,
        detail: {
          config: {
            entity: config.entity,
            tap_action: actionConfig,
          },
          action: 'tap',
        },
      }),
    );
  }
}

export { ActionHelper };
