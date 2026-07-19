/*
 * Shared runtime helpers: ResourceManager (timers/observers cleanup), DOMHelper
 * (cached element/style/class updates), and ActionHelper (tap/hold/double-tap
 * dispatch).
 */

import { CARD_CONTEXT, HA_SVG_ICON_TAG, HA_ACTION_HANDLER_TAG } from '../utils/parameters.js';
import { is, assertDefined } from '../utils/common-checks.js';
import { initLogger, type LoggerInstance } from '../utils/log.js';
import type { Config } from '../utils/types.js';

type CleanupFn = () => void;

/**
 * Manage ressources: interval, timeout, listener, subscription.
 */
class ResourceManager {
  #debug = CARD_CONTEXT.debug.ressourceManager;
  #log: LoggerInstance | null = null;
  #resources = new Map<string, CleanupFn>();
  #throttles = new Map<string, { lastCall: number }>();

  constructor() {
    this.#log = initLogger(this, this.#debug, ['add', 'remove', 'cleanup']);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  get list() {
    return [...this.#resources.keys()];
  }

  get count() {
    return this.#resources.size;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  add(cleanupFn: CleanupFn, id?: string): string {
    if (!is.func(cleanupFn)) {
      throw new Error('Resource must be a function');
    }
    const finalId = id || this.#generateUniqueId();
    if (this.#resources.has(finalId)) {
      this.remove(finalId);
      this.#log?.debug(`Remove: ${finalId}`);
    }
    this.#resources.set(finalId, cleanupFn);
    this.#log?.debug(`Set: ${finalId}`);

    return finalId;
  }

  setInterval(handler: () => void, timeout: number, id: string): string {
    this.#log?.debug('Starting interval with id:', id);
    const timerId = setInterval(handler, timeout);
    this.#log?.debug('Timer started with timerId:', timerId);

    this.add(() => {
      this.#log?.debug('Stopping interval with id:', id);
      clearInterval(timerId);
    }, id);

    return id;
  }

  has(id: string): boolean {
    return this.#resources.has(id); // Vérifie si un ID existe dans la Map
  }

  setTimeout(handler: () => void, timeout: number, id?: string): string {
    this.#log?.debug('Starting timeout with id:', id);
    const timerId = setTimeout(handler, timeout);
    this.#log?.debug('Timeout started with timerId:', timerId);
    return this.add(() => clearTimeout(timerId), id);
  }

  addEventListener(
    target: EventTarget,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
    id?: string,
  ): string {
    target.addEventListener(event, handler, options);
    return this.add(() => target.removeEventListener(event, handler, options), id);
  }

  addSubscription(unsubscribeFn: () => void, id?: string): string {
    return this.add(() => {
      unsubscribeFn();
    }, id);
  }

  throttle(fn: () => void, delay: number, id: string) {
    if (!this.#throttles.has(id)) {
      this.#throttles.set(id, { lastCall: 0 });
      this.add(() => this.resetThrottle(id), id);
    }

    const context = assertDefined(this.#throttles.get(id), `ResourceManager.throttle: no throttle state for '${id}'`);
    const now = Date.now();

    if (now - context.lastCall >= delay) {
      context.lastCall = now;
      fn();
      this.#log?.debug('Throttle function - ', id);
    }
  }

  throttleDebounce(fn: () => void, delay: number, id: string) {
    const now = Date.now();
    const keys = {
      throttle: `${id}-throttle`,
      debounce: `${id}-debounce`,
    };

    // Throttle — exec if time is over
    if (!this.#throttles.has(keys.throttle)) {
      this.#throttles.set(keys.throttle, { lastCall: 0 });
      this.add(() => this.resetThrottle(keys.throttle), keys.throttle);
    }

    const context = assertDefined(
      this.#throttles.get(keys.throttle),
      `ResourceManager.throttleDebounce: no throttle state for '${keys.throttle}'`,
    );

    // CF5 - issue (medium) resolved - the trailing timer was scheduled
    // unconditionally, so a single isolated call always ran fn() twice (leading
    // + trailing). The trailing run now only catches calls rejected by the
    // throttle, and a leading run cancels any pending trailing.
    if (now - context.lastCall >= delay) {
      context.lastCall = now;
      if (this.#resources.has(keys.debounce)) this.remove(keys.debounce);
      fn();
      this.#log?.debug('ThrottleDebounce immediate - ', id);
      return;
    }

    // Debounce — catch up throttled calls after delay
    if (this.#resources.has(keys.debounce)) {
      this.remove(keys.debounce);
    }
    this.setTimeout(
      () => {
        context.lastCall = Date.now();
        fn();
        this.#log?.debug('ThrottleDebounce trailing - ', id);
      },
      delay,
      keys.debounce,
    );
  }

  resetThrottle(id: string) {
    this.#throttles.delete(id);
  }

  remove(id: string) {
    const cleanupFn = this.#resources.get(id);
    if (cleanupFn) {
      try {
        cleanupFn();
      } catch (e) {
        console.error(`[ResourceManager] Error while removing '${id}'`, e);
      }
      this.#resources.delete(id);
      this.#log?.debug(`Removed: ${id}`);
    }
  }

  cleanup() {
    for (const [id, cleanupFn] of this.#resources) {
      try {
        cleanupFn();
      } catch (e) {
        console.error(`[ResourceManager] Error while clearing '${id}'`, e);
      }
      this.#log?.debug(`Cleared: ${id}`);
    }
    this.#resources.clear();
    this.#throttles.clear();
    this.#log?.debug('All resources cleared.');
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  #generateUniqueId(): string {
    let id: string;
    do {
      id = Math.random().toString(36).slice(2, 8);
    } while (this.#resources.has(id));
    return id;
  }
}

/**
 * Manages DOM elements, RAF queue, and applied values cache.
 *
 * // Init
 * this._dom = new DOMHelper();
 * this._dom.register("card",  this.shadowRoot.querySelector(".card"));
 * this._dom.register("title", this.shadowRoot.querySelector(".title"));
 *
 * // Mises à jour — dédupliquées + batchées automatiquement
 * this._dom.setStyle("card",  "--color-bg", "#fff");
 * this._dom.setText ("title", "Température");
 * this._dom.setHTML  ("card",  "<span>...</span>");
 *
 * // Destroy
 * this._dom.destroy();
 */
type UpdateFn = () => void;
type CacheValue = string | number | boolean | null | undefined;

// _domElements is typed `any` (not HTMLElement) because EditorDOMHelper
// (src/editor/dom-helper.ts) registers custom elements accessed through it
// with dynamic, editor-specific properties (hass, value, selector, context,
// _fieldDef, updateConfig) that don't exist on the base DOM type.
class DOMHelper {
  #debug = CARD_CONTEXT.debug.ressourceManager;
  #log: LoggerInstance | null = null;
  _domElements: Map<string, any>;
  _appliedValues: Map<string, CacheValue>;
  _pendingUpdates: Map<string, UpdateFn>;
  _rafScheduled: boolean;

  constructor() {
    this.#log = initLogger(this, this.#debug, ['register', 'unregister', 'destroy']);
    this._domElements = new Map(); // key → HTMLElement
    this._appliedValues = new Map(); // "key:prop" → last applied value
    this._pendingUpdates = new Map(); // "key:prop" → pending update function
    this._rafScheduled = false;
  }

  // ─── Element registration ─────────────────────────────────────────────────

  /**
   * Registers a DOM element under a given key.
   */
  register(key: string, element: HTMLElement) {
    this.#log?.debug('DOMHelper.register(key, element):', { key, element });
    this._domElements.set(key, element);
  }

  /**
   * Returns the DOM element associated with the given key.
   */
  get(key: string): HTMLElement | undefined {
    return this._domElements.get(key);
  }

  /**
   * Unregisters a DOM element and clears its associated cache entries.
   */
  unregister(key: string) {
    this._domElements.delete(key);
    for (const cacheKey of this._appliedValues.keys()) {
      if (cacheKey.startsWith(`${key}:`)) {
        this._appliedValues.delete(cacheKey);
      }
    }
  }

  // ─── RAF queue ────────────────────────────────────────────────────────────

  /**
   * Enqueues a DOM update identified by a unique key + prop combination. If the
   * same key:prop is enqueued multiple times, only the latest function runs.
   * Schedules a single RAF flush if not already pending.
   */
  enqueue(key: string, prop: string, updateFn: UpdateFn) {
    this._pendingUpdates.set(`${key}:${prop}`, updateFn);

    if (!this._rafScheduled) {
      this._rafScheduled = true;
      requestAnimationFrame(() => this._flush());
    }
  }

  /**
   * Flushes all pending updates in a single RAF callback.
   */
  _flush() {
    const updates = this._pendingUpdates;
    this._pendingUpdates = new Map();
    this._rafScheduled = false;

    updates.forEach((fn) => fn());
  }

  // ─── DOM helpers with cache ───────────────────────────────────────────────

  /**
   * Sets a CSS custom property on the element registered under the given key.
   * Skipped if the value matches the cache — no DOM read required.
   */
  setStyle(key: string, prop: string, value: CacheValue) {
    if (is.nullish(value)) return;
    const cacheKey = `${key}:style:${prop}`;
    if (this._appliedValues.get(cacheKey) === value) return;

    const el = this._domElements.get(key);
    if (!el) return;

    this.enqueue(key, `style:${prop}`, () => {
      el.style.setProperty(prop, String(value));
      this._appliedValues.set(cacheKey, value);
    });
  }

  /**
   * Removes a previously-set CSS custom property. setStyle() never unsets a
   * value on its own (it only skips nullish writes), so a property that was
   * conditionally set on an earlier render (e.g. the bar_stack diverging-arm
   * gradient) needs this to go away once the condition no longer applies -
   * otherwise it stays stuck from a stale render.
   */
  removeStyle(key: string, prop: string) {
    const cacheKey = `${key}:style:${prop}`;
    if (!this._appliedValues.has(cacheKey)) return;

    const el = this._domElements.get(key);
    if (!el) return;

    this.enqueue(key, `style:${prop}`, () => {
      el.style.removeProperty(prop);
      this._appliedValues.delete(cacheKey);
    });
  }

  /**
   * Sets a CSS custom property synchronously — no RAF, no cache check, no
   * queue. Use when immediate DOM update is required.
   */
  setStyleNow(key: string, prop: string, value: CacheValue) {
    if (is.nullish(value)) return;

    const el = this._domElements.get(key);
    if (!el) return;

    el.style.setProperty(prop, String(value));
    this._appliedValues.set(`${key}:style:${prop}`, value); // ← met à jour le cache après
  }

  /**
   * Sets the text content of the element registered under the given key.
   * Skipped if the value matches the cache.
   */
  setText(key: string, value: CacheValue) {
    if (is.nullish(value)) return;
    const cacheKey = `${key}:text`;
    if (this._appliedValues.get(cacheKey) === value) return;

    const el = this._domElements.get(key);
    if (!el) return;

    this.enqueue(key, 'text', () => {
      el.textContent = String(value);
      this._appliedValues.set(cacheKey, value);
    });
  }

  // CF5 - issue (security) resolved - Jinja results are injected via innerHTML
  // and may interpolate attacker-influenceable strings (media titles, network
  // device names…); allowlist sanitization keeps the HTML formatting feature
  // while neutralizing script execution No BR here on purpose: name/name_info
  // have no multiline option at all (see
  // StructureElements.secondaryInfoWrapperMinimal) and must never wrap, while
  // custom_info/secondary's own <br> is already consumed by
  // HABase#_splitAtFirstBreak before it ever reaches this sanitizer - a literal
  // <br> surviving to this point would only ever be an unhandled edge case, not
  // a feature to preserve.
  static #SAFE_HTML_TAGS = new Set(['B', 'I', 'U', 'SPAN', 'DIV']);
  static #SAFE_STYLE_PROPS = new Set(['color', 'background-color']);
  static #DROP_CONTENT_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'NOSCRIPT']);

  static sanitizeHTML(value: CacheValue): string {
    const html = String(value);
    if (!html.includes('<')) return html; // fast path: no markup, nothing to sanitize
    const body = new DOMParser().parseFromString(html, 'text/html').body;
    DOMHelper.#sanitizeNode(body);
    return body.innerHTML;
  }

  static #sanitizeNode(node: ParentNode) {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) continue;
      if (child.nodeType !== Node.ELEMENT_NODE || DOMHelper.#DROP_CONTENT_TAGS.has(child.nodeName)) {
        child.remove(); // comments, script/style & co: dropped entirely, content included
        continue;
      }
      const el = child as Element;
      if (!DOMHelper.#SAFE_HTML_TAGS.has(el.tagName)) {
        DOMHelper.#sanitizeNode(el);
        el.replaceWith(...el.childNodes); // unknown tag: unwrap, keep sanitized children
        continue;
      }
      DOMHelper.#scrubAttributes(el);
      DOMHelper.#sanitizeNode(el);
    }
  }

  static #scrubAttributes(el: Element) {
    const htmlEl = el as HTMLElement;
    for (const attr of [...el.attributes]) {
      if (attr.name === 'class') continue; // kept for user Jinja markup relying on class-based styling (e.g. card_mod); classes cannot execute code
      if (attr.name !== 'style') {
        el.removeAttribute(attr.name); // on* handlers, href, src…
        continue;
      }
      const kept = [...htmlEl.style]
        .filter((prop) => DOMHelper.#SAFE_STYLE_PROPS.has(prop))
        .map((prop) => `${prop}: ${htmlEl.style.getPropertyValue(prop)}`)
        .join('; ');
      if (kept) el.setAttribute('style', kept);
      else el.removeAttribute('style');
    }
  }

  /**
   * Sets the inner HTML of the element registered under the given key.
   * Content is sanitized (tag/attribute allowlist) before injection.
   * Skipped if the value matches the cache.
   */
  setHTML(key: string, value: CacheValue) {
    if (is.nullish(value)) return;
    const cacheKey = `${key}:html`;
    if (this._appliedValues.get(cacheKey) === value) return;

    const el = this._domElements.get(key);
    if (!el) return;

    this.enqueue(key, 'html', () => {
      el.innerHTML = DOMHelper.sanitizeHTML(value);
      this._appliedValues.set(cacheKey, value);
    });
  }

  /**
   * Toggles a CSS class on the element registered under the given key.
   * Skipped if the state matches the cache.
   */
  toggleClass(key: string, className: string | undefined, force: boolean) {
    if (!className) return;
    const cacheKey = `${key}:class:${className}`;
    if (this._appliedValues.get(cacheKey) === force) return;

    const el = this._domElements.get(key);
    if (!el) return;

    this.enqueue(key, `class:${className}`, () => {
      el.classList.toggle(className, force);
      this._appliedValues.set(cacheKey, force);
    });
  }

  /**
   * Adds one or more CSS classes to the element registered under the given key.
   * Batched via the RAF queue.
   */
  addClass(key: string, ...classes: (string | false | null | undefined)[]) {
    const el = this._domElements.get(key);
    if (!el) return;

    const filtered = classes.filter(Boolean) as string[];
    if (!filtered.length) return;

    this.enqueue(key, `addClass:${filtered.join(',')}`, () => {
      el.classList.add(...filtered);
    });
  }

  /**
   * Sets an attribute on the element registered under the given key.
   * Skipped if the value matches the cache.
   */
  setAttribute(key: string, attr: string, value: CacheValue) {
    if (is.nullish(value)) return;
    const cacheKey = `${key}:attr:${attr}`;
    if (this._appliedValues.get(cacheKey) === value) return;

    const el = this._domElements.get(key);
    if (!el) return;

    this.enqueue(key, `attr:${attr}`, () => {
      el.setAttribute(attr, String(value));
      this._appliedValues.set(cacheKey, value);
    });
  }
  // ─── Walkthrough ──────────────────────────────────────────────────────────

  static walkUpThroughShadow(node: Node | null, selector: string): HTMLElement | null {
    if (!node) return null;
    if (node instanceof ShadowRoot) return DOMHelper.walkUpThroughShadow(node.host, selector);
    if (node instanceof HTMLElement && node.matches(selector)) return node;
    return DOMHelper.walkUpThroughShadow(node.parentNode, selector);
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  /**
   * Clears all internal state: elements, cache, and pending updates.
   * Should be called when the component is destroyed.
   */
  destroy() {
    this._domElements.clear();
    this._appliedValues.clear();
    this._pendingUpdates.clear();
    this._rafScheduled = false;
  }
}

/**
 * Centralized handler for `xyz_action` logic.
 * Deprecated for HA 2026.3+
 *
 * 📌 Purpose: - Encapsulates and manages the execution, validation, and
 * dispatch of `xyz_action`. - Promotes reusable, maintainable logic for
 * action-related features.
 */

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
  #iconClickSources = new Set(['shape', HA_SVG_ICON_TAG, 'img']);

  constructor(target: HTMLElement | null) {
    this.#target = target;
  }

  // CF5 - issue (major) resolved - the HA frontend creates <action-handler>
  // lazily; querySelector could return null and crash if this card loads before
  // any native card
  static #getActionHandler(): ActionHandlerElement {
    let handler = document.body.querySelector(HA_ACTION_HANDLER_TAG) as ActionHandlerElement | null;
    if (!handler) {
      handler = document.createElement(HA_ACTION_HANDLER_TAG) as unknown as ActionHandlerElement;
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

  #handleAction(ev: CustomEvent, fromIcon: boolean) {
    // Only reachable via the 'action' listener attached in #attachListeners,
    // itself only wired up from init() once #config has already been set.
    const config = assertDefined(this.#config, 'ActionHelper.#handleAction called before init()');
    const action = ev.detail.action;
    const iconActionKey = `icon_${action}_action`;

    const actionConfig =
      fromIcon && config[iconActionKey]?.action !== 'none' ? config[iconActionKey] : config[`${action}_action`];

    if (!actionConfig) return;

    this.#target?.dispatchEvent(
      new CustomEvent('hass-action', {
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

export { ResourceManager };
export { DOMHelper };
export { ActionHelper };
