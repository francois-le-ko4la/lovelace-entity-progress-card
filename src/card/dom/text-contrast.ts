// text_effect: contrast. Cached: getComputedStyle forces a reflow.

import { CARD } from '../../utils/parameters.js';
import { ThemeManager } from '../color/theme-manager.js';
import { contrastTextColor, fillEndColor } from '../color/text-contrast.js';
import type { ViewCore } from '../view/core.js';
import type { DOMHelper } from './dom-helpers.js';

export class TextContrast {
  readonly #dom: () => DOMHelper;
  readonly #view: () => ViewCore;
  #resolved: { fill: string; themeKey: string; color: string } | null = null;

  constructor(dom: () => DOMHelper, view: () => ViewCore) {
    this.#dom = dom;
    this.#view = view;
  }

  apply(gradient: string | null, barColor: string | null, themeKey: string) {
    const color =
      this.#view().config.text_effect === 'contrast'
        ? this.#colorFor(fillEndColor(gradient, barColor), themeKey)
        : null;
    this.#dom().setOrRemoveStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.textContrast.color.var, color);
  }

  #colorFor(fill: string | null, themeKey: string): string | null {
    if (!fill) return null;
    // var()/color-mix() fills resolve differently per theme: the theme is part of the key.
    if (this.#resolved?.fill === fill && this.#resolved.themeKey === themeKey) return this.#resolved.color;
    const el = this.#dom().get(CARD.htmlStructure.card.element);
    if (!el) return null;
    // Scratch property: the browser resolves var()/color-mix() to a colour.
    el.style.setProperty('outline-color', fill);
    const rgb = ThemeManager.labelColorComponents(getComputedStyle(el).outlineColor);
    el.style.removeProperty('outline-color');
    // A detached card resolves nothing: not cached, the next pass retries.
    if (!rgb) return null;
    const color = contrastTextColor(rgb);
    this.#resolved = { fill, themeKey, color };
    return color;
  }
}
