// The inner badge on the icon: fed by the alert/state badge (`badgeInfo`) or
// by badge_icon/badge_color. Holds what each source last resolved; HABase
// decides when it may show at all.

import { CARD, HA_CONTEXT } from '../../utils/parameters.js';
import { is } from '../../utils/common-checks.js';
import { ThemeManager } from '../color/theme-manager.js';
import type { DOMHelper } from './dom-helpers.js';

export type BadgeInfo = { icon: string; color: string; backgroundColor: string };

export class BadgeIcon {
  readonly #dom: () => DOMHelper;
  // One cache per independent source: every push recomputes and repaints from
  // all three, never a one-off snapshot from whichever field last pushed.
  #icon: string | null = null;
  #iconObjectColor: string | null = null;
  #colorField: string | null = null;
  // Whether the last repaint left anything to show. Kept across an alert, which
  // returns before repainting.
  #hasIcon = false;
  #hasColor = false;

  constructor(dom: () => DOMHelper) {
    this.#dom = dom;
  }

  reset() {
    this.#icon = null;
    this.#iconObjectColor = null;
    this.#colorField = null;
    this.#hasIcon = false;
    this.#hasColor = false;
  }

  // The alert badge wins; else the custom one shows iff a source resolved on
  // the last repaint (raw config is always non-empty, so it proves nothing).
  show(alert: BadgeInfo | null | undefined) {
    if (alert) {
      this.#enable(true);
      this.#dom().setAttribute(
        CARD.htmlStructure.elements.badge.icon.class,
        CARD.style.icon.badge.default.attribute,
        alert.icon,
      );
      this.#setColor(alert.color, alert.backgroundColor);
      return;
    }
    this.#updateVisibility();
  }

  // A native dict return drives icon and color from one template
  // (docs/configuration.md, "Returning a native type"); a string is the icon.
  receiveIcon(content: unknown, alert: BadgeInfo | null | undefined) {
    const iconRaw = is.plainObject(content) ? content.icon : content;
    const colorRaw = is.plainObject(content) ? content.color : undefined;
    this.#icon = is.nonEmptyString(iconRaw) && iconRaw.includes(HA_CONTEXT.icons.prefix) ? iconRaw : null;
    this.#iconObjectColor = is.nonEmptyString(colorRaw) ? colorRaw : null;
    this.#repaint(alert);
  }

  receiveColor(content: unknown, alert: BadgeInfo | null | undefined) {
    this.#colorField = is.nonEmptyString(content) ? content : null;
    this.#repaint(alert);
  }

  // The icon object's color wins over badge_color. A null source is cleared
  // explicitly so the other source's earlier value can't stay stuck on screen.
  #repaint(alert: BadgeInfo | null | undefined) {
    if (!is.nullish(alert)) return; // alert -> cancel custom badge
    const icon = this.#icon;
    const color = this.#iconObjectColor ?? this.#colorField;
    this.#hasIcon = icon !== null;
    this.#hasColor = color !== null;
    this.#dom().setAttribute(
      CARD.htmlStructure.elements.badge.icon.class,
      CARD.style.icon.badge.default.attribute,
      icon ?? '',
    );
    if (color !== null) {
      this.#setColor('var(--white-color)', ThemeManager.adaptColor(color) as string);
    } else {
      this.#clearColor();
    }
    this.#updateVisibility();
  }

  #updateVisibility() {
    this.#enable(this.#hasIcon || this.#hasColor);
  }

  #enable(on: boolean) {
    this.#dom().toggleClass(
      CARD.htmlStructure.card.element,
      `${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class}`,
      on,
    );
  }

  #setColor(color: string, backgroundColor: string) {
    const dom = this.#dom();
    dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.badge.backgroundColor.var, backgroundColor);
    dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.badge.color.var, color);
  }

  // setStyle() never unsets on its own (see _applyDivergingBarStackCSS): a
  // color set a moment ago would stay once no source provides one.
  #clearColor() {
    const dom = this.#dom();
    dom.removeStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.badge.backgroundColor.var);
    dom.removeStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.badge.color.var);
  }
}
