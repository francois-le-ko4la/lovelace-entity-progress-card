// alert_when on the card side: the alert classes, --alert-color and the pill
// the alert takes over with highlight: 'label'. The view resolves, this paints.

import { CARD } from '../utils/parameters.js';
import { ThemeManager } from './theme-manager.js';
import type { DOMHelper } from './dom-helpers.js';
import type { StatusLabel } from './status-label.js';
import type { ViewCore } from './view.js';

type AlertDeps = {
  view: () => ViewCore;
  dom: () => DOMHelper;
  toggleClasses: (style: Map<string, boolean>) => void;
  statusLabel: StatusLabel;
  repaintStatusLabel: () => void;
};

export class Alert {
  readonly #deps: AlertDeps;

  constructor(deps: AlertDeps) {
    this.#deps = deps;
  }

  get classes(): Map<string, boolean> {
    const view = this.#deps.view();
    const active = view.isAlertActive;
    return new Map([
      ['alert-active', active],
      ['alert-background', active && view.resolvedAlertHighlight === 'background'],
      ['alert-label', active && view.resolvedAlertHighlight === 'label'],
      ['alert-anim-blink', active && view.alertAnimation === 'blink'],
      ['alert-anim-ping', active && view.alertAnimation === 'ping'],
    ]);
  }

  apply() {
    this.#deps.toggleClasses(this.classes);
    this.#applyLabel();
    // Re-applied here too (not just _addBaseParameter's one-time build pass)
    // so Advanced mode's color override reaches border/background on push.
    this.#deps
      .dom()
      .setStyle(
        CARD.htmlStructure.card.element,
        '--alert-color',
        ThemeManager.adaptColor(this.#deps.view().resolvedAlertColor),
      );
  }

  // Advanced mode's own trigger (schema.ts's alert_when.jinja), shared by every
  // variant, unlike above/below (_renderJinjaNumber, Card-only).
  receiveJinja(content: unknown) {
    const view = this.#deps.view();
    if (!view.hasJinjaAlertWhen) return;
    view.jinjaState.setAlertResult(content);
    this.apply();
  }

  // Inactive: hands the pill back to status_label instead of blanking it.
  #applyLabel() {
    const { statusLabel } = this.#deps;
    const view = this.#deps.view();
    if (view.resolvedAlertHighlight !== 'label') {
      statusLabel.release();
      return;
    }
    if (!view.isAlertActive) {
      statusLabel.release();
      this.#deps.repaintStatusLabel();
      return;
    }
    statusLabel.claim(
      view.resolvedAlertLabel.trim(),
      ThemeManager.adaptColor(view.resolvedAlertColor) ?? CARD.style.color.default,
    );
  }
}
