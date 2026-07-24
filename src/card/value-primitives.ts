/*
 * Small self-validating value building blocks: TypedValueHelper (base) and the
 * numeric ValueHelper/DecimalHelper plus the string UnitHelper.
 */

import { CARD, CARD_CONTEXT } from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { traceInstance } from '../utils/log.js';

/**
 * Base class for a self-validating typed value: stores a value only if
 * `_validate()` (overridden per subclass) accepts it, otherwise falls back
 * to the constructor's initial value. `isValid` reflects the last assignment.
 *
 * @abstract
 */

class TypedValueHelper<T = unknown> {
  #value: T | null = null;
  #isValid = false;
  #defaultValue: T | null = null;

  constructor(newValue: unknown = null) {
    if (this._validate(newValue)) this.#defaultValue = newValue;
    traceInstance(this, CARD_CONTEXT.debug.instances);
  }

  set value(newValue: unknown) {
    this.#isValid = this._validate(newValue);
    this.#value = this._validate(newValue) ? newValue : null;
  }

  get value(): T | null {
    return this.#isValid ? this.#value : this.#defaultValue;
  }

  get isValid(): boolean {
    return this.#isValid;
  }

  _validate(_value: unknown): _value is T {
    return false;
  }
}

/**
 * TypedValueHelper accepting any finite number.
 *
 * @extends TypedValueHelper
 */
class ValueHelper extends TypedValueHelper<number> {
  _validate(v: unknown): v is number {
    return is.number(v);
  }
}

/**
 * Represents a non-negative integer value that can be valid or invalid.
 */
class DecimalHelper extends TypedValueHelper<number> {
  _validate(v: unknown): v is number {
    return Number.isInteger(v) && (v as number) >= 0;
  }
}

/**
 * Represents a unit of measurement, stored as a string.
 */
class UnitHelper {
  #value: string = CARD.config.unit.default;
  #isDisabled = false;

  constructor() {
    traceInstance(this, CARD_CONTEXT.debug.instances);
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
    return this.#isDisabled ? '' : this.#value;
  }
}

export { TypedValueHelper };
export { ValueHelper };
export { DecimalHelper };
export { UnitHelper };
