/*
 * ProgressCalc / PercentHelper: min/max/value → percent math (center-zero,
 * scale, reverse) and the formatted value/unit string.
 */

import { CARD, CARD_CONTEXT } from '../utils/parameters.js';
import { assertDefined, is } from '../utils/common-checks.js';
import { traceInstance } from '../utils/log.js';
import { HassProviderSingleton } from '../utils/hass-provider.js';
import { NumberFormatter } from './formatting.js';
import { DecimalHelper, UnitHelper, ValueHelper } from './value-primitives.js';

/**
 * class for calculating and formatting percentages.
 */
class ProgressCalc {
  #min = new ValueHelper(CARD.config.value.min);
  #max = new ValueHelper(CARD.config.value.max);
  #current = new ValueHelper(0);
  #decimal = new DecimalHelper(CARD.config.decimal.percentage);
  #percent = 0;
  #isReversed = false;
  #isCenterZero = false;
  #zeroValue = 0;
  #growthPercent = false;
  #scale = 'linear';

  constructor() {
    traceInstance(this, CARD_CONTEXT.debug.instances);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set isReversed(newValue: unknown) {
    this.#isReversed = is.boolean(newValue) ? newValue : CARD.config.reverse;
  }

  get isReversed(): boolean {
    return this.#isReversed;
  }

  set min(newValue: unknown) {
    this.#min.value = newValue;
  }

  // #min/#max/#current/#decimal are all constructed with a valid numeric
  // default (see field initializers above), so .value is never null in
  // practice - asserted rather than typed `number | null` throughout
  // ProgressCalc's own math, which would otherwise need null-guards
  // everywhere for a case that can't occur.
  get min(): number {
    return assertDefined(this.#min.value, 'ProgressCalc.min read with no valid value or default');
  }

  set max(newValue: unknown) {
    this.#max.value = newValue;
  }

  get max(): number {
    return assertDefined(this.#max.value, 'ProgressCalc.max read with no valid value or default');
  }

  set current(newCurrent: unknown) {
    this.#current.value = newCurrent;
  }

  get current(): number {
    return assertDefined(this.#current.value, 'ProgressCalc.current read with no valid value or default');
  }

  set decimal(newValue: unknown) {
    this.#decimal.value = newValue;
  }

  get decimal(): number {
    return assertDefined(this.#decimal.value, 'ProgressCalc.decimal read with no valid value or default');
  }

  set isCenterZero(newValue: unknown) {
    this.#isCenterZero = is.boolean(newValue) ? newValue : false;
  }

  get isCenterZero(): boolean {
    return this.#isCenterZero;
  }

  set zeroValue(newValue: unknown) {
    this.#zeroValue = is.number(newValue) ? newValue : 0;
  }

  get zeroValue(): number {
    return this.#zeroValue;
  }

  set growthPercent(newValue: unknown) {
    this.#growthPercent = is.boolean(newValue) ? newValue : false;
  }

  get growthPercent(): boolean {
    return this.#growthPercent;
  }

  set scale(newValue: unknown) {
    this.#scale = newValue === 'log' ? 'log' : 'linear';
  }

  get scale(): string {
    return this.#scale;
  }

  // log scale requires a well-formed positive range (log(0) or log(negative) is
  // undefined) — center_zero's own zeroValue/min/max split has no meaningful
  // log equivalent either, so both silently fall back to plain linear math in
  // #percentForValue rather than producing NaN.
  get isLogScale(): boolean {
    return this.#scale === 'log' && !this.isCenterZero && this.min > 0 && this.max > this.min;
  }

  get actual(): number {
    return this.#isReversed ? this.max - this.current : this.current;
  }

  get isValid(): boolean {
    return this.range !== 0;
  }

  get range(): number {
    if (!this.isCenterZero) return this.max - this.min;
    return this.current >= this.#zeroValue ? this.max - this.#zeroValue : this.#zeroValue - this.min;
  }

  get correctedValue(): number {
    return this.isCenterZero ? this.current - this.#zeroValue : this.actual - this.min;
  }

  get percent(): number | null {
    return this.isValid ? this.#percent : null;
  }

  /**
   * Pourcentage de croissance/décroissance par rapport à la valeur de centrage
   * (`zeroValue`), indépendant du ratio de remplissage de la barre (`percent`).
   * N'a de sens que si `isCenterZero` et `growthPercent` sont actifs, et que
   * `zeroValue` n'est pas 0 (sinon le ratio est mathématiquement indéfini — on
   * retombe alors sur `percent`).
   */
  get growthPercentValue(): number | null {
    if (!this.isValid) return null;
    if (this.#zeroValue === 0) return this.percent;
    return Number((((this.current - this.#zeroValue) / this.#zeroValue) * 100).toFixed(this.decimal));
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh() {
    const currentValue = this.isCenterZero ? this.current : this.actual;
    this.#percent = this.isValid ? Number(this.#percentForValue(currentValue).toFixed(this.decimal)) : 0;
  }

  calcWatermark(value: number | { current: number } | null | undefined): number {
    const numericValue = is.number(value) ? value : (value?.current ?? 0);
    const percent = this.#percentForValue(numericValue);
    return this.isCenterZero ? 50 + percent / 2 : percent;
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  #percentForValue(value: number): number {
    if (this.isCenterZero) {
      const corrected = value - this.#zeroValue;
      const halfRange = corrected >= 0 ? this.max - this.#zeroValue : this.#zeroValue - this.min;
      return halfRange === 0 ? 0 : (corrected / halfRange) * 100;
    }
    if (this.isLogScale) {
      // Clamp below-range values to min before taking the log: value <= 0 would
      // otherwise produce NaN/-Infinity instead of the same "0%, let CSS clamp
      // it" behavior linear gets for a below-range value.
      const clamped = Math.max(value, this.min);
      return ((Math.log(clamped) - Math.log(this.min)) / (Math.log(this.max) - Math.log(this.min))) * 100;
    }
    const fullRange = this.max - this.min;
    return fullRange === 0 ? 0 : ((value - this.min) / fullRange) * 100;
  }
}

/**
 * class for calculating and formatting percentages.
 */
class PercentHelper extends ProgressCalc {
  #hassProvider: HassProviderSingleton = HassProviderSingleton.getInstance();
  #unit = new UnitHelper();
  #isTimer = false;
  #unitSpacing: string = CARD.config.unit.unitSpacing.auto;
  #unitPosition: string = CARD.config.unit.unitPosition.after;
  #compact = false;
  #sign = false;

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set isTimer(newValue: unknown) {
    this.#isTimer = is.boolean(newValue) ? newValue : false;
  }

  get isTimer(): boolean {
    return this.#isTimer;
  }

  get unit(): string {
    return this.#unit.value;
  }

  set unit(newValue: unknown) {
    this.#unit.value = newValue ?? '';
  }

  get hasTimerUnit(): boolean {
    return this.#isTimer && this.#unit.isTimerUnit;
  }

  get hasFlexTimerUnit(): boolean {
    return this.#isTimer && this.#unit.isFlexTimerUnit;
  }

  get hasTimerOrFlexTimerUnit(): boolean {
    return this.hasTimerUnit || this.hasFlexTimerUnit;
  }

  get processedValue(): number | null {
    if (this.unit !== CARD.config.unit.default) return this.actual;
    return this.isCenterZero && this.growthPercent ? this.growthPercentValue : this.percent;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  configure({
    unitSpacing,
    hasDisabledUnit,
    isCenterZero,
    zeroValue,
    growthPercent,
    scale,
    compact,
    sign,
    unitPosition,
  }: {
    unitSpacing: string;
    hasDisabledUnit: unknown;
    isCenterZero: unknown;
    zeroValue: unknown;
    growthPercent: unknown;
    scale: unknown;
    compact: unknown;
    sign: unknown;
    unitPosition: string;
  }) {
    this.#unitSpacing = unitSpacing;
    this.#unit.isDisabled = hasDisabledUnit;
    this.isCenterZero = isCenterZero;
    this.zeroValue = zeroValue;
    this.growthPercent = growthPercent;
    this.scale = scale;
    this.#compact = is.boolean(compact) ? compact : false;
    this.#sign = is.boolean(sign) ? sign : false;
    this.#unitPosition = unitPosition;
  }

  valueForThemes(isCustomTheme: boolean, valueBasedOnPercentage: boolean): number | null {
    /*
     * Calculates the value to display based on the selected theme and unit
     * system.
     *
     * - If the unit is Fahrenheit, the temperature is converted to Celsius
     * before returning. - If the theme is linear or the unit is the default,
     * the percentage value is returned.
     */
    let value: number | null = this.actual;
    if (isCustomTheme) return value;
    if (this.unit === CARD.config.unit.fahrenheit) value = ((value - 32) * 5) / 9;
    return valueBasedOnPercentage || [CARD.config.unit.default, CARD.config.unit.disable].includes(this.unit)
      ? this.percent
      : value;
  }

  toString(): string {
    if (!this.isValid) return 'Div0';
    if (this.hasTimerOrFlexTimerUnit)
      return NumberFormatter.formatTiming(
        this.actual,
        this.decimal,
        this.#hassProvider.numberFormat,
        this.hasFlexTimerUnit,
        this.#unitSpacing,
      );
    return NumberFormatter.formatValueAndUnit(
      this.processedValue,
      this.decimal,
      this.unit,
      this.#hassProvider.numberFormat,
      this.#unitSpacing,
      this.#compact,
      this.#sign,
      this.#unitPosition,
    );
  }
}

export { ProgressCalc };
export { PercentHelper };
