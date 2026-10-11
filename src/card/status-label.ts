// The status pill shared by `status_label` and alert_when.highlight: 'label'.
// Holds what it last resolved and painted; HABase picks the owner.

import { CARD } from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { ThemeManager } from './theme-manager.js';
import type { DOMHelper } from './dom-helpers.js';

export class StatusLabel {
  readonly #dom: () => DOMHelper;
  // Null text = no push landed yet. Cached so the pill's bar color can refresh
  // on every pass: status_label may never push again after percent settles.
  #text: string | null = null;
  #color: string | null = null;
  // alert_when.highlight: 'label' owns the pill while claimed: a status push
  // would fight it over the same element on every refresh.
  #alertOwns = false;
  // Skips paint's forced reflow when neither text nor color changed.
  #painted: { text: string; color: string } | null = null;

  constructor(dom: () => DOMHelper) {
    this.#dom = dom;
  }

  get text(): string | null {
    return this.#text;
  }

  get color(): string | null {
    return this.#color;
  }

  // A plain return is the text; a native dict `{label, color}` sets both.
  // A null color means no override: the caller falls back to the bar's own.
  receive(content: unknown) {
    if (is.plainObject(content)) {
      this.#text = String(content.label ?? '').trim();
      // is.nonEmptyString: an explicit `color: ''` must fall back too.
      this.#color = ThemeManager.adaptColor(is.nonEmptyString(content.color) ? content.color : null);
    } else {
      this.#text = String(content ?? '').trim();
      this.#color = null;
    }
  }

  get alertOwns(): boolean {
    return this.#alertOwns;
  }

  claim(text: string, color: string) {
    this.#alertOwns = true;
    this.paint(text, color);
  }

  release() {
    this.#alertOwns = false;
  }

  clearStatus() {
    this.#text = null;
    this.#color = null;
  }

  forgetPaint() {
    this.#painted = null;
  }

  paint(text: string, color: string) {
    if (this.#painted?.text === text && this.#painted?.color === color) return;
    const dom = this.#dom();
    const key = CARD.htmlStructure.elements.label.class;
    dom.setText(key, text);
    const el = dom.get(key);
    if (!el || !text) return;
    // Scratch property: the browser normalizes the raw color into rgb(...).
    el.style.setProperty('outline-color', color);
    const components = ThemeManager.labelColorComponents(getComputedStyle(el).outlineColor);
    el.style.removeProperty('outline-color');
    // setConfig renders before HA inserts the card: a detached element resolves
    // nothing, and caching that first attempt left the pill grey for good.
    if (!components) return;
    this.#painted = { text, color };
    const label = CARD.style.dynamic.label;
    el.style.setProperty(label.r.var, String(components.r));
    el.style.setProperty(label.g.var, String(components.g));
    el.style.setProperty(label.b.var, String(components.b));
    el.style.setProperty(label.h.var, String(components.h));
    el.style.setProperty(label.s.var, String(components.s));
    el.style.setProperty(label.l.var, String(components.l));
  }
}
