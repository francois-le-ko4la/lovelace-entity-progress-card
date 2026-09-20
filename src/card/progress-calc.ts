/*
 * ProgressCalc assembles what the math needs and holds nothing derived;
 * ProgressMath (progress-math.ts) does the arithmetic. PercentHelper adds the
 * unit/timer formatting on top.
 */

import { CARD, CARD_CONTEXT } from '../utils/parameters.js';
import { assertDefined, is } from '../utils/common-checks.js';
import { traceInstance } from '../utils/log.js';
import { HassProviderSingleton } from '../utils/hass-provider.js';
import { NumberFormatter } from './formatting.js';
import { ProgressMath, type ProgressInput } from './progress-math.js';
import { DecimalHelper, UnitHelper, ValueHelper } from './value-primitives.js';

// current/min/max stay unknown on purpose: they come from entity state
// through EntityOrValue and are validated at runtime by ValueHelper. The
// config flags above them are guaranteed by the schema, so they are typed.
type ResolvedValues = { current: unknown; min: unknown; max: unknown; reversed?: boolean };
type ResolvedDisplay = { unit: string; decimal: number; isTimer: boolean };

class ProgressCalc {
  #min = new ValueHelper(CARD.config.value.min);
  #max = new ValueHelper(CARD.config.value.max);
  #current = new ValueHelper(0);
  #decimal = new DecimalHelper(CARD.config.decimal.percentage);
  #isReversed = false;
  #isCenterZero = false;
  #zeroValue = 0;
  #growthPercent = false;
  #scale = 'linear';

  constructor() {
    traceInstance(this, CARD_CONTEXT.debug.instances);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set isReversed(newValue: boolean | undefined) {
    this.#isReversed = newValue ?? CARD.config.reverse;
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

  set isCenterZero(newValue: boolean | undefined) {
    this.#isCenterZero = newValue ?? false;
  }

  get isCenterZero(): boolean {
    return this.#isCenterZero;
  }

  set zeroValue(newValue: number | undefined) {
    this.#zeroValue = newValue ?? 0;
  }

  get zeroValue(): number {
    return this.#zeroValue;
  }

  set growthPercent(newValue: boolean | undefined) {
    this.#growthPercent = newValue ?? false;
  }

  get growthPercent(): boolean {
    return this.#growthPercent;
  }

  set scale(newValue: string | undefined) {
    this.#scale = newValue === 'log' ? 'log' : 'linear';
  }

  get scale(): string {
    return this.#scale;
  }

  // Everything below is ProgressMath's answer to the inputs this class
  // assembles - no formula lives here any more. Rebuilt per read rather than
  // cached: nine setters would each have to invalidate it, and one missed
  // setter is stale math, the exact failure this split removes.
  get #math(): ProgressMath {
    return new ProgressMath(this.#input);
  }

  get #input(): ProgressInput {
    return {
      min: this.min,
      max: this.max,
      current: this.current,
      decimal: this.decimal,
      reversed: this.#isReversed,
      scale: this.#scale,
      centerZero: this.#isCenterZero ? { zeroValue: this.#zeroValue, growthPercent: this.#growthPercent } : null,
    };
  }

  get isLogScale(): boolean {
    return this.#math.isLogScale;
  }

  get actual(): number {
    return this.#math.actual;
  }

  get isValid(): boolean {
    return this.range !== 0;
  }

  get range(): number {
    return this.#math.range;
  }

  get correctedValue(): number {
    return this.#math.correctedValue;
  }

  get percent(): number | null {
    return this.#math.percent;
  }

  // A zero point of 0 makes the growth ratio undefined - the bar percentage
  // stands in, which is also what ProgressMath does with the same case.
  get growthPercentValue(): number | null {
    if (!this.isValid) return null;
    if (this.#zeroValue === 0) return this.percent;
    return this.#math.growthPercent;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  // The values a refresh re-resolves. A typed literal rather than
  // Object.assign on the instance: that spelling let a mistyped key create a
  // dead own property in silence.
  updateValues({ current, min, max, reversed }: ResolvedValues) {
    this.current = current;
    this.min = min;
    this.max = max;
    if (reversed !== undefined) this.isReversed = reversed;
  }

  calcWatermark(value: number | { current: number } | null | undefined): number {
    return this.#math.watermarkFor(is.number(value) ? value : (value?.current ?? 0));
  }
}

class PercentHelper extends ProgressCalc {
  #hassProvider: HassProviderSingleton = HassProviderSingleton.getInstance();
  #unit = new UnitHelper();
  #isTimer = false;
  #unitSpacing: string = CARD.config.unit.unitSpacing.auto;
  #unitPosition: string = CARD.config.unit.unitPosition.after;
  #compact = false;
  #sign = false;

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set isTimer(newValue: boolean | undefined) {
    this.#isTimer = newValue ?? false;
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

  // Everything a refresh re-resolves, values and display in one call. unit
  // and decimal belong here and not in configure(): each blends a config key
  // with live entity state (resolveDisplayUnit/resolveDisplayDecimal), and
  // that second half moves.
  updateResolved(values: ResolvedValues, display: ResolvedDisplay) {
    this.updateValues(values);
    this.isTimer = display.isTimer;
    this.unit = display.unit;
    this.decimal = display.decimal;
  }

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
    hasDisabledUnit: boolean | undefined;
    isCenterZero: boolean;
    zeroValue: number;
    growthPercent: boolean;
    scale: string | undefined;
    compact: boolean | undefined;
    sign: boolean | undefined;
    unitPosition: string;
  }) {
    this.#unitSpacing = unitSpacing;
    this.#unit.isDisabled = hasDisabledUnit;
    this.isCenterZero = isCenterZero;
    this.zeroValue = zeroValue;
    this.growthPercent = growthPercent;
    this.scale = scale;
    this.#compact = compact ?? false;
    this.#sign = sign ?? false;
    this.#unitPosition = unitPosition;
  }

  valueForThemes(isCustomTheme: boolean, valueBasedOnPercentage: boolean): number | null {
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
      return NumberFormatter.formatTiming(this.actual, this.decimal, {
        locale: this.#hassProvider.numberFormat,
        language: this.#hassProvider.language,
        flex: this.hasFlexTimerUnit,
        unitSpacing: this.#unitSpacing,
      });
    return NumberFormatter.formatValueAndUnit(this.processedValue, this.decimal, this.unit, {
      locale: this.#hassProvider.numberFormat,
      language: this.#hassProvider.language,
      unitSpacing: this.#unitSpacing,
      compact: this.#compact,
      sign: this.#sign,
      unitPosition: this.#unitPosition,
    });
  }
}

export { PercentHelper };
