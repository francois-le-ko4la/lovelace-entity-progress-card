import { CARD, CARD_CONTEXT } from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { traceInstance } from '../utils/log.js';

class UnitHelper {
  #value: string = CARD.config.unit.default;
  #isDisabled = false;

  constructor() {
    traceInstance('UnitHelper', CARD_CONTEXT.debug.instances);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set value(newValue: unknown) {
    // CF5 - issue (critical) resolved - some integrations expose a non-string
    // unit_of_measurement; .trim() crashed and the ?? fallback was dead code
    this.#value = is.nullish(newValue) ? CARD.config.unit.default : String(newValue).trim();
  }

  get value(): string {
    return this.#isDisabled ? '' : this.#value;
  }

  set isDisabled(newValue: unknown) {
    this.#isDisabled = is.boolean(newValue) ? newValue : false;
  }

  get isDisabled(): boolean {
    return this.#isDisabled;
  }

  get isTimerUnit(): boolean {
    return this.#value.toLowerCase() === CARD.config.unit.timer;
  }

  get isFlexTimerUnit(): boolean {
    return this.#value.toLowerCase() === CARD.config.unit.flexTimer;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  toString(): string {
    return this.value;
  }
}

export { UnitHelper };
