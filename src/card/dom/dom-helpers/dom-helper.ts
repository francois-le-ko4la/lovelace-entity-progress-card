import { CARD_CONTEXT } from '../../../utils/parameters.js';
import { is } from '../../../utils/common-checks.js';
import { initLogger, type LoggerInstance } from '../../../utils/log.js';

/**
 * Manages DOM elements, RAF queue, and applied values cache.
 *
 * // Init
 * this._dom = new DOMHelper();
 * this._dom.register("card",  this.shadowRoot.querySelector(".card"));
 * this._dom.register("title", this.shadowRoot.querySelector(".title"));
 *
 * // Updates - deduplicated + batched automatically
 * this._dom.setStyle("card",  "--color-bg", "#fff");
 * this._dom.setText ("title", "Temperature");
 * this._dom.setHTML  ("card",  "<span>...</span>");
 *
 * // Destroy
 * this._dom.destroy();
 */
type UpdateFn = () => void;

type CacheValue = string | number | boolean | null | undefined;

// The only two DOM writes this helper performs - shared by each method and its
// synchronous *Now counterpart, which differ solely in queued vs immediate.
const applyStyle =
  (prop: string) =>
  (el: HTMLElement, value: CacheValue): void => {
    el.style.setProperty(prop, String(value));
  };

const applyText = (el: HTMLElement, value: CacheValue): void => {
  el.textContent = String(value);
};

// _domElements is typed `any` (not HTMLElement) because EditorDOMHelper
// (src/editor/dom-helper.ts) registers custom elements accessed through it
// with dynamic, editor-specific properties (hass, value, selector, context,
// _fieldDef, updateConfig) that don't exist on the base DOM type.
class DOMHelper {
  #debug = CARD_CONTEXT.debug.ressourceManager;
  #log: LoggerInstance | null = null;
  // skipcq: JS-0323 -- elements carry ad-hoc props (_fieldDef, updateConfig)
  _domElements: Map<string, any>;
  _appliedValues: Map<string, CacheValue>;
  _pendingUpdates: Map<string, UpdateFn>;
  _rafScheduled: boolean;

  constructor() {
    this.#log = initLogger(this, 'DOMHelper', this.#debug, ['register', 'destroy']);
    this._domElements = new Map(); // key → HTMLElement
    this._appliedValues = new Map(); // "key:prop" → last applied value
    this._pendingUpdates = new Map(); // "key:prop" → pending update function
    this._rafScheduled = false;
  }

  // ─── Element registration ─────────────────────────────────────────────────

  register(key: string, element: HTMLElement) {
    this.#log?.debug('DOMHelper.register(key, element):', { key, element });
    this._domElements.set(key, element);
  }

  get(key: string): HTMLElement | undefined {
    return this._domElements.get(key);
  }

  // ─── RAF queue ────────────────────────────────────────────────────────────

  // Keyed by key+prop: enqueuing the same one twice overwrites, not queues -
  // only the latest function for that pair ever runs, in a single RAF flush.
  enqueue(key: string, prop: string, updateFn: UpdateFn) {
    this._pendingUpdates.set(`${key}:${prop}`, updateFn);

    if (!this._rafScheduled) {
      this._rafScheduled = true;
      requestAnimationFrame(() => this._flush());
    }
  }

  _flush() {
    const updates = this._pendingUpdates;
    this._pendingUpdates = new Map();
    this._rafScheduled = false;

    updates.forEach((fn) => fn());
  }

  // ─── DOM helpers with cache ───────────────────────────────────────────────

  // `_`-prefixed so EditorDOMHelper (src/editor/dom-helper.ts) can reuse it.
  // skipcq: JS-0323 -- el is whatever _domElements stores (see its own comment)
  _cachedUpdate(key: string, cacheSuffix: string, value: CacheValue, apply: (el: any, value: CacheValue) => void) {
    if (is.nullish(value)) return;
    const cacheKey = `${key}:${cacheSuffix}`;
    if (this._appliedValues.get(cacheKey) === value) {
      // Back to what is shown: a write still queued since would undo that.
      this._pendingUpdates.delete(cacheKey);
      return;
    }

    const el = this._domElements.get(key);
    if (!el) return;

    this.enqueue(key, cacheSuffix, () => {
      apply(el, value);
      this._appliedValues.set(cacheKey, value);
    });
  }

  // Sync counterpart to #cachedUpdate, for the *Now methods below - no RAF. A
  // write still queued for the same key is older: dropped, or the next frame
  // would put it back.
  #applyNow(
    key: string,
    cacheSuffix: string,
    value: CacheValue,
    apply: (el: HTMLElement, value: CacheValue) => void,
    skipUnchanged: boolean,
  ) {
    if (is.nullish(value)) return;
    const cacheKey = `${key}:${cacheSuffix}`;
    this._pendingUpdates.delete(cacheKey);
    if (skipUnchanged && this._appliedValues.get(cacheKey) === value) return;
    const el = this._domElements.get(key);
    if (!el) return;
    apply(el, value);
    this._appliedValues.set(cacheKey, value);
  }

  /**
   * Sets a CSS custom property on the element registered under the given key.
   * Skipped if the value matches the cache — no DOM read required.
   */
  setStyle(key: string, prop: string, value: CacheValue) {
    this._cachedUpdate(key, `style:${prop}`, value, applyStyle(prop));
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
   * setStyle, or removeStyle when the value is empty (nullish or '') - for a
   * property that must not outlive the render that set it.
   */
  setOrRemoveStyle(key: string, prop: string, value: CacheValue) {
    if (is.nullish(value) || value === '') this.removeStyle(key, prop);
    else this.setStyle(key, prop, value);
  }

  /**
   * Sets a CSS custom property synchronously — no RAF, no cache check, no
   * queue. Use when immediate DOM update is required. Never skipped: it
   * writes on Home Assistant's own elements, which HA restyles behind the
   * cache.
   */
  setStyleNow(key: string, prop: string, value: CacheValue) {
    this.#applyNow(key, `style:${prop}`, value, applyStyle(prop), false);
  }

  /**
   * Sets the text content of the element registered under the given key.
   * Skipped if the value matches the cache.
   */
  setText(key: string, value: CacheValue) {
    this._cachedUpdate(key, 'text', value, applyText);
  }

  /**
   * Sets the text content synchronously — no RAF, no queue. Skipped if the
   * value matches the cache, like setText.
   */
  setTextNow(key: string, value: CacheValue) {
    this.#applyNow(key, 'text', value, applyText, true);
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
  // #129 discussion: this filters by property NAME only, not value - none
  // of these execute code or load an external resource (unlike
  // background-image/content, deliberately excluded: url() could leak data).
  // `position`/`z-index` are a known, accepted exception: `position: fixed`
  // escapes the card's own `overflow: hidden` and could overlay the whole
  // dashboard (not just this card) - allowed anyway, by explicit request, in
  // favor of the simpler name-only filter over a value-level one.
  static #SAFE_STYLE_PROPS = new Set([
    'color',
    'background-color',
    'font-size',
    'font-weight',
    'text-align',
    'width',
    'display',
    'position',
    'z-index',
  ]);
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
    this._cachedUpdate(key, 'html', value, (el, v) => {
      el.innerHTML = DOMHelper.sanitizeHTML(v);
    });
  }

  /**
   * Toggles a CSS class on the element registered under the given key.
   * Skipped if the state matches the cache.
   */
  toggleClass(key: string, className: string | undefined, force: boolean) {
    if (!className) return;
    this._cachedUpdate(key, `class:${className}`, force, (el, value) => el.classList.toggle(className, Boolean(value)));
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
    this._cachedUpdate(key, `attr:${attr}`, value, (el, v) => el.setAttribute(attr, String(v)));
  }
  // ─── Walkthrough ──────────────────────────────────────────────────────────

  static walkUpThroughShadow(node: Node | null, selector: string): HTMLElement | null {
    if (!node) return null;
    if (node instanceof ShadowRoot) return DOMHelper.walkUpThroughShadow(node.host, selector);
    if (node instanceof HTMLElement && node.matches(selector)) return node;
    return DOMHelper.walkUpThroughShadow(node.parentNode, selector);
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  destroy() {
    this._domElements.clear();
    this._appliedValues.clear();
    this._pendingUpdates.clear();
    this._rafScheduled = false;
  }
}

export { DOMHelper };
export type { CacheValue };
