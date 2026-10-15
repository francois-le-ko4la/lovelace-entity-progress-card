// alert_when.above/.below on the view side (Card only; the template schema has
// just the Jinja trigger). Same shape as WatermarkView.

import { boundFrom, refreshBound, usableBoundValue, type Bound } from './bound-value.js';
import type { JinjaState } from './jinja-state.js';

type BoundConfig = Parameters<typeof boundFrom>[0];
type AlertBoundsDeps = {
  config: () => { above?: BoundConfig; below?: BoundConfig } | undefined;
  jinjaState: JinjaState;
};

export class AlertBounds {
  readonly #deps: AlertBoundsDeps;
  #above: Bound = null;
  #below: Bound = null;

  constructor(deps: AlertBoundsDeps) {
    this.#deps = deps;
  }

  apply() {
    const alertWhen = this.#deps.config();
    this.#above = boundFrom(alertWhen?.above, null);
    this.#below = boundFrom(alertWhen?.below, null);
  }

  refresh() {
    refreshBound(this.#above);
    refreshBound(this.#below);
  }

  // In the entity's native unit; a Jinja push wins over the configured bound.
  get above() {
    return this.#deps.jinjaState.alertAbove ?? usableBoundValue(this.#above);
  }

  get below() {
    return this.#deps.jinjaState.alertBelow ?? usableBoundValue(this.#below);
  }
}
