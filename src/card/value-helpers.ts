/*
 * Computation helpers that turn a card's config + entity state into renderable
 * values: number/unit formatting, percent/progress math, theme color
 * resolution, and multi-entity (bar_stack) aggregation.
 */

import { CARD_CONTEXT, HA_CONTEXT, CARD, THEME, SEV } from '../utils/parameters.js';
import { is, has, assertDefined } from '../utils/common-checks.js';
import { Logger, type LoggerInstance } from '../utils/log.js';
import { HassProviderSingleton, type EntityState, type Hass } from '../utils/hass-provider.js';
import { StructureTemplates, type StructureOptions } from './structure.js';

// Theme "zones" come from either the built-in THEME table (parameters.ts) or
// a user's custom_theme YAML array - both are arrays of { min?, max?, color?,
// icon_color?, bar_color?, icon? } with slightly different optional fields
// (built-in entries always set icon/color, possibly to null; custom_theme
// zones may omit any of them), unified here rather than as two interfaces.
// One entry of the `name` config option's composition array (see
// EditorFieldsType.entityName / types.stateContent in schema.ts).
type NameToken = { type: string; text?: string };

type ThemeZone = {
  min?: number;
  max?: number;
  color?: string | null;
  icon_color?: string;
  bar_color?: string;
  icon?: string | null;
};

/**
 * Builds and caches a card type's DOM structure (`StructureTemplates[
 * cardType]`) as a `<template>`, cloned on each `render()`/`clone()` call
 * instead of re-parsing `innerHTML` every time. Cached per unique structure
 * options (barType, barPosition, layout, ...), since the markup only depends
 * on those, not on the entity's live state.
 */
class ObjStructure {
  // CF5 - issue (perf) resolved - card.innerHTML re-parsed the full HTML string
  // on every render (each card creation, each editor keystroke). The structure
  // is now built once per unique option set into a <template> and cloned
  // (~5-10x faster than parsing). The DOM depends on the config's structure
  // options (barType, barPosition, layout, ...), so the cache is keyed on the
  // exact options object: any setConfig producing different structure options
  // gets its own template, identical configs share one.
  #templates = new Map<string, HTMLTemplateElement>();
  _cardType: string;

  constructor(cardType: string) {
    this._cardType = cardType;
  }

  render(options: StructureOptions = {}): string {
    return (StructureTemplates as Record<string, (options: StructureOptions) => string>)[this._cardType](options);
  }

  clone(options: StructureOptions = {}): Node {
    // Options are small flat objects of primitives built in a fixed key order
    // by each class's _structureOptions getter -> JSON is a stable cache key.
    // The option space is bounded (a handful of enums/booleans), so is the
    // cache.
    const key = JSON.stringify(options);
    let tpl = this.#templates.get(key);
    if (!tpl) {
      tpl = document.createElement('template');
      tpl.innerHTML = this.render(options);
      this.#templates.set(key, tpl);
    }
    return tpl.content.cloneNode(true);
  }
}

/**
 * class for formatting value && unit.
 *
 * This class uses `Value`, `Unit`, and `Decimal` objects to manage and validate
 * its internal data.
 */
class NumberFormatter {
  static unitsNoSpace: Record<string, Set<string>> = {
    'fr-FR': new Set(['j', 'd', 'h', 'min', 'ms', 'μs', '°']),
    'de-DE': new Set(['d', 'h', 'min', 'ms', 'μs', '°']),
    'en-US': new Set(['d', 'h', 'min', 'ms', 'μs', '°', '%']),
  };

  static getSpaceCharacter(locale: string, unit: string): string {
    const set = NumberFormatter.unitsNoSpace[locale] || NumberFormatter.unitsNoSpace['en-US'];
    return set.has(unit.toLowerCase()) ? '' : CARD.config.unit.space;
  }

  static formatValueAndUnit(
    value: number | null | undefined,
    decimal = 2,
    unit = '',
    locale = 'en-US',
    unitSpacing: string = CARD.config.unit.unitSpacing.auto,
  ): string {
    if (is.nullish(value)) return '';

    const formattedValue = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimal,
      maximumFractionDigits: decimal,
      useGrouping: locale !== 'en',
    }).format(value);

    if (!unit) return formattedValue;

    const spaceMap: Record<string, string | (() => string)> = {
      space: CARD.config.unit.space,
      'no-space': '',
      auto: () => NumberFormatter.getSpaceCharacter(locale, unit),
    };
    const space = has.method(spaceMap, unitSpacing)
      ? (spaceMap[unitSpacing] as () => string)()
      : (spaceMap[unitSpacing] as string);

    return `${formattedValue}${space}${unit}`;
  }

  static formatTiming(
    totalSeconds: number,
    decimal = 0,
    locale = 'en-US',
    flex = false,
    unitSpacing: string = CARD.config.unit.unitSpacing.auto,
  ): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds: string = (totalSeconds % 60).toFixed(decimal);

    const pad = (value: string | number, length = 2) => String(value).padStart(length, '0');

    const [intPart, decimalPart] = seconds.split('.');
    seconds = decimalPart !== undefined ? `${pad(intPart)}.${decimalPart}` : pad(seconds);

    if (flex) {
      if (totalSeconds < 60)
        return NumberFormatter.formatValueAndUnit(parseFloat(seconds), decimal, 's', locale, unitSpacing);
      if (totalSeconds < 3600) return `${pad(minutes)}:${seconds}`;
    }

    return [pad(hours), pad(minutes), seconds].join(':');
  }

  static durationToSeconds(value: number, unit: string): number | null {
    switch (unit) {
      case 'd': // Jour
        return value * 86400; // 1 jour = 86400 secondes
      case 'h': // Heure
        return value * 3600; // 1 heure = 3600 secondes
      case 'min': // Minute
        return value * 60; // 1 minute = 60 secondes
      case 's': // Seconde
        return value; // 1 seconde = 1 seconde
      case 'ms': // Milliseconde
        return value * 0.001; // 1 milliseconde = 0.001 seconde
      case 'μs': // Microseconde
        return value * 0.000001; // 1 microseconde = 0.000001 seconde
      default:
        // CF5 - issue (critical) resolved - unknown/missing unit threw and
        // crashed the card; return null so the caller can flag the entity as
        // invalid
        return null;
    }
  }

  static convertDuration(duration: unknown): number {
    // CF5 - issue (critical) resolved - timer attributes (duration/remaining)
    // can be missing during HA startup; null.split() crashed the card
    if (!is.string(duration)) return 0;
    // CF5 - issue (minor) resolved - Python timedelta strings for timers over
    // 24h are "N day(s), H:MM:SS": the day prefix made every part NaN. Days are
    // now parsed, and any malformed remainder returns 0 instead of propagating
    // NaN.
    const dayMatch = duration.match(/^(\d+) days?, (.*)$/);
    const days = dayMatch ? parseInt(dayMatch[1], 10) : 0;
    const parts: number[] = (dayMatch ? dayMatch[2] : duration).split(':').map(Number);
    if (parts.length !== 3 || parts.some((p) => !Number.isFinite(p))) return 0;
    const [hours, minutes, seconds] = parts;

    return ((days * 24 + hours) * 3600 + minutes * 60 + seconds) * CARD.config.msFactor;
  }
}

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
  }: {
    unitSpacing: string;
    hasDisabledUnit: unknown;
    isCenterZero: unknown;
    zeroValue: unknown;
    growthPercent: unknown;
    scale: unknown;
  }) {
    this.#unitSpacing = unitSpacing;
    this.#unit.isDisabled = hasDisabledUnit;
    this.isCenterZero = isCenterZero;
    this.zeroValue = zeroValue;
    this.growthPercent = growthPercent;
    this.scale = scale;
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
    );
  }
}

/**
 * Manages the theme and its associated icon and color based on a percentage
 * value.
 */
class ThemeManager {
  #theme: string | null = null;
  #icon: string | null = null;
  #iconColor: string | null = null;
  #barColor: string | null = null;
  #value = 0;
  #isValid = false;
  #isLinear = false;
  #isBasedOnPercentage = false;
  #isCustomTheme = false;
  #currentStyle: ThemeZone[] | null = null;
  #interpolate = false;

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set theme(newTheme: unknown) {
    if (is.nullish(newTheme) || !has.validKey(THEME, newTheme)) {
      this.#reset();
      return;
    }
    this.#isValid = true;
    this.#theme = newTheme;
    this.#currentStyle = THEME[newTheme as keyof typeof THEME].style;
    this.#isLinear = THEME[newTheme as keyof typeof THEME].linear;
    this.#isBasedOnPercentage = THEME[newTheme as keyof typeof THEME].percent;
  }

  get theme(): string | null {
    return this.#theme;
  }

  // Only a presence/shape check: per-zone validity (numeric min < max, sorted)
  // is already guaranteed by the schema's customTheme validator, the sole path
  // a config reaches here through — see BaseConfigHelper.set config.
  set customTheme(newTheme: unknown) {
    if (!is.nonEmptyArray(newTheme)) return;
    this.#theme = CARD.theme.default;
    this.#currentStyle = newTheme as ThemeZone[];
    this.#isValid = true;
    this.#isLinear = false;
    this.#isCustomTheme = true;
  }

  get customTheme(): ThemeZone[] | null {
    return this.#currentStyle;
  }

  get isLinear(): boolean {
    return this.#isLinear;
  }

  get isBasedOnPercentage(): boolean {
    return this.#isBasedOnPercentage;
  }

  get isCustomTheme(): boolean {
    return this.#isCustomTheme;
  }

  get isValid(): boolean {
    return this.#isValid;
  }

  set value(newValue: number) {
    this.#value = newValue;
    this.#refresh();
  }

  get value(): number {
    return this.#value;
  }

  get icon(): string | null {
    return this.#icon;
  }

  get iconColor(): string | null {
    return this.#iconColor;
  }

  get barColor(): string | null {
    return this.#barColor;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  configure({ theme, customTheme, interpolate }: { theme: unknown; customTheme: unknown; interpolate: unknown }) {
    this.theme = theme;
    this.customTheme = customTheme;
    this.#interpolate = Boolean(interpolate);
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  #reset() {
    this.#icon = null;
    this.#barColor = null;
    this.#iconColor = null;
    this.#theme = null;
    this.#currentStyle = null;
    this.#value = 0;
    this.#isValid = false;
    this.#isLinear = false;
    this.#isBasedOnPercentage = false;
    this.#isCustomTheme = false;
    this.#interpolate = false;
  }

  #refresh() {
    if (!this.#isValid) return;
    const applyStyle = this.isLinear ? this.#setLinearStyle : this.#setStyle;
    applyStyle.call(this);
  }

  #setLinearStyle() {
    // #refresh() only calls this when #isValid is true, which is only ever
    // set alongside #currentStyle (see theme/customTheme setters).
    const style = assertDefined(this.#currentStyle, 'ThemeManager.#setLinearStyle called with no #currentStyle');
    const lastStep = style.length - 1;
    const thresholdSize = CARD.config.value.max / lastStep;
    const percentage = Math.max(0, Math.min(this.#value, CARD.config.value.max));
    const index = Math.min(Math.floor(percentage / thresholdSize), lastStep);
    const ratio = (percentage - index * thresholdSize) / thresholdSize;
    this.#applyColors(style[index], style[index + 1] ?? null, ratio);
  }

  #setStyle() {
    const style = assertDefined(this.#currentStyle, 'ThemeManager.#setStyle called with no #currentStyle');
    let themeData: ThemeZone | null = null;
    let nextThemeData: ThemeZone | null = null;
    let ratio = 0;

    if (this.#value >= (style[style.length - 1].max ?? Infinity)) {
      themeData = style[style.length - 1];
    } else if (this.#value < (style[0].min ?? -Infinity)) {
      themeData = style[0];
    } else {
      // custom_theme zones no longer have to tile perfectly (gaps are
      // tolerated), so a value can land in a gap between two of them —
      // themeData then stays null and #applyColors disengages the theme for
      // this render, deferring to whatever color source is next in priority
      // (see CardView.iconColor/barColor).
      const index = style.findIndex(
        (level) => this.#value >= (level.min ?? -Infinity) && this.#value < (level.max ?? Infinity),
      );
      if (index !== -1) {
        themeData = style[index];
        nextThemeData = style[index + 1] ?? null;
        ratio = (this.#value - (themeData.min ?? 0)) / ((themeData.max ?? 0) - (themeData.min ?? 0));
      }
    }

    this.#applyColors(themeData, nextThemeData, ratio);
  }

  #applyColors(themeData: ThemeZone | null, nextThemeData: ThemeZone | null, ratio: number) {
    if (!themeData) {
      this.#icon = null;
      this.#iconColor = null;
      this.#barColor = null;
      return;
    }
    this.#icon = themeData.icon || null;

    if (this.#interpolate && nextThemeData) {
      const color = ThemeManager.#interpolateColor(
        ThemeManager.adaptColor(themeData.icon_color || themeData.color || null),
        ThemeManager.adaptColor(nextThemeData.icon_color || nextThemeData.color || null),
        ratio,
      );
      const barColor = ThemeManager.#interpolateColor(
        ThemeManager.adaptColor(themeData.bar_color || themeData.color || null),
        ThemeManager.adaptColor(nextThemeData.bar_color || nextThemeData.color || null),
        ratio,
      );
      this.#iconColor = color;
      this.#barColor = barColor;
    } else {
      this.#iconColor = ThemeManager.adaptColor(themeData.icon_color || themeData.color || null);
      this.#barColor = ThemeManager.adaptColor(themeData.bar_color || themeData.color || null);
    }
  }

  static #interpolateColor(from: string | null, to: string | null, ratio: number): string | null {
    if (!from || !to) return null;
    const pct = Math.round(ratio * 100);
    return `color-mix(in srgb, ${to} ${pct}%, ${from})`; // from/to déjà adaptés
  }
  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  static adaptColor(curColor: string | null): string | null {
    return HA_CONTEXT.haColors.get(curColor as string) ?? curColor;
  }

  buildGradient(fillPercent: number, mode: string, defaultColor: string | null = null, isVertical = false) {
    const currentStyle = this.#currentStyle;
    if (!this.#isValid || !currentStyle || mode === 'auto') return null;
    if (!(fillPercent > 0)) return null;

    // For linear themes, derive min/max boundaries by splitting 0–100% equally.
    const style: ThemeZone[] = this.#isLinear
      ? currentStyle.map((level, i, arr) => ({
          ...level,
          min: (i / arr.length) * 100,
          max: ((i + 1) / arr.length) * 100,
        }))
      : currentStyle;

    const visible = style.filter((level) => (level.min ?? 0) < fillPercent);
    if (visible.length === 0) return null;

    // Inner element uses translateX((value-1)*100%), shifted left by
    // (100-fillPercent)%. A zone boundary at container position B → element
    // position B + offset. vertical-bar uses the exact same formula on
    // translateY instead (see the CSS on .vertical-bar .inner) - only the
    // gradient's own direction needs to follow, not this math.
    const offset = 100 - fillPercent;
    const toElemPos = (b: number) => `${(b + offset).toFixed(2)}%`;
    const direction = isVertical ? 'to top' : 'to right';
    // color is optional per zone now (see types.customTheme) — a color-less
    // zone falls back the same way iconColor/barColor already do: the entity's
    // own negotiated color (e.g. a cover is pink open / grey closed, see
    // EntityHelper.defaultColor), then the card's generic default, rather than
    // a flat neutral for every domain.
    const col = (level: ThemeZone) =>
      ThemeManager.adaptColor(level.bar_color || level.color || null) || defaultColor || CARD.style.color.default;

    if (mode === 'segment') {
      const stops = visible.flatMap((level, i) => {
        const start = i === 0 ? '0%' : toElemPos(level.min ?? 0);
        const end = (level.max ?? 0) >= fillPercent ? '100%' : toElemPos(level.max ?? 0);
        return [`${col(level)} ${start}`, `${col(level)} ${end}`];
      });
      return `linear-gradient(${direction}, ${stops.join(', ')})`;
    }

    if (mode === 'rainbow') {
      const first = col(visible[0]);
      const stops = [`${first} 0%`];
      if (offset > 0) stops.push(`${first} ${offset.toFixed(2)}%`);
      visible.forEach((level, i) => {
        if (i > 0) stops.push(`${col(level)} ${toElemPos(level.min ?? 0)}`);
      });
      stops.push(`${col(visible[visible.length - 1])} 100%`);
      return `linear-gradient(${direction}, ${stops.join(', ')})`;
    }

    return null;
  }
}

/**
 */
class ChangeTracker {
  #debug = CARD_CONTEXT.debug.hass;
  #log: LoggerInstance;
  #firstTime = true;
  #watchedEntities = new Set<string>();
  #entityCache: Record<string, EntityState | null> = {};
  #updated = false;
  #hassState = { isUpdated: false };

  constructor() {
    this.#log = Logger.create('ChangeTracker', this.#debug ? SEV.debug : SEV.info);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set hassState(hass: Hass) {
    this.#updated = false;
    if (!hass) return;

    if (this._hasChanged(hass)) {
      this._updateCache(hass);
      this.#updated = true;
      this.#log.debug('HASS need update...!');
    }
    this.#hassState = { isUpdated: this.#updated };
  }

  get hassState(): { isUpdated: boolean } {
    return this.#hassState;
  }

  get isUpdated(): boolean {
    return this.#updated;
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  _hasChanged(newHass: Hass): boolean {
    if (this.#firstTime) {
      this.#firstTime = false;
      return true;
    }
    // CF5 - issue (perf) resolved - previously returned true, running the full
    // refresh pipeline on every hass update of the whole install for cards with
    // no watched entity (Jinja-only template cards). Their content arrives
    // exclusively via push template subscriptions; nothing in the pipeline
    // reads hass directly. If a future render path does, revisit this.
    if (!is.nonEmptySet(this.#watchedEntities)) return false;

    for (const entityId of this.#watchedEntities) {
      const newState = newHass?.states?.[entityId];

      if (!newState) return true;
      // CF5 - issue (perf) resolved - HA state objects are immutable (the
      // frontend swaps in a new object on every change), so a reference check
      // replaces the two full JSON.stringify serializations previously run per
      // entity on every hass update
      if (newState !== this.#entityCache?.[entityId]) return true;
    }

    return false;
  }

  _updateCache(hass: Hass) {
    this.#entityCache = {};
    for (const entityId of this.#watchedEntities) {
      this.#entityCache[entityId] = hass.states?.[entityId] ?? null;
    }
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  watchEntity(entityId: string) {
    if (entityId) {
      this.#watchedEntities.add(entityId);
    }
  }

  resetWatchedEntities() {
    this.#watchedEntities.clear();
  }
}

/**
 * Helper class for managing entities. This class validates and retrieves
 * information from Home Assistant if it's an entity.
 */
// Entity state/attributes/name-tokens all come from HA's own runtime data
// (hass.states, hass.entities...) - kept as `any` throughout rather than
// hand-modeling home-assistant-frontend's types, same rationale as
// hass-provider.ts's own `#hass: any`.
class EntityHelper {
  #hassProvider: HassProviderSingleton = HassProviderSingleton.getInstance();
  #isValid = false;
  #value: any = {};
  #entityId: string | null = null;
  #attribute: string | null = null;
  #color: string | null = null;
  #subtract = false;
  #isMain = false;
  #state: string | null = null;
  #domain: string | null = null;
  #entityType: string | null = null;
  #entityTypeFlags: Record<string, boolean> = {
    isTimer: false,
    isDuration: false,
    isNumber: false,
    isCounter: false,
    isSynced: false,
  };
  #stateContent: string[] = [];
  #nameTokens: NameToken[] | null = null;
  static #handleRefreshType = new Map<string, (self: EntityHelper) => void>([
    [HA_CONTEXT.entity.type.timer, (self) => self._manageTimerEntity()],
    [HA_CONTEXT.entity.type.duration, (self) => self._manageDurationEntity()],
    [HA_CONTEXT.entity.type.counter, (self) => self._manageCounterAndNumberEntity('minimum', 'maximum')],
    [HA_CONTEXT.entity.type.number, (self) => self._manageCounterAndNumberEntity('min', 'max')],
    [HA_CONTEXT.entity.type.default, (self) => self._manageStdEntity()],
  ]);

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set entityId(newValue: string) {
    this.#entityId = newValue;
    this.#nameTokens = null;
    this.#entityType = null;
    this.#entityTypeFlags.isSynced = false;
    this.#value = 0;
    this.#domain = HassProviderSingleton.getEntityDomain(newValue);
    this.#isValid = this.#hassProvider.hasEntity(this.#entity);
  }

  get entityId(): string | null {
    return this.#entityId;
  }

  // Every other method below only ever runs after entityId has been set (the
  // setter is always the first thing called on a fresh EntityHelper - see
  // EntityOrValue.set value / EntityCollectionHelper.addEntity) - this getter
  // documents and enforces that precondition once, instead of a bare
  // `this.#entityId!` at every hassProvider call site.
  get #entity(): string {
    return assertDefined(this.#entityId, 'EntityHelper method called before entityId was set');
  }

  set attribute(newValue: string | null) {
    this.#attribute = newValue;
  }

  get attribute(): string | null {
    return this.#attribute;
  }

  set color(newValue: string | null) {
    this.#color = newValue ?? null;
  }

  get color(): string | null {
    return this.#color;
  }

  set subtract(newValue: unknown) {
    this.#subtract = Boolean(newValue);
  }

  get subtract(): boolean {
    return this.#subtract;
  }

  set isMain(newValue: unknown) {
    this.#isMain = Boolean(newValue);
  }

  get isMain(): boolean {
    return this.#isMain;
  }

  set nameTokens(tok: unknown) {
    this.#nameTokens = is.nonEmptyArray(tok) ? (tok as NameToken[]) : null;
  }

  get nameTokens(): NameToken[] | null {
    return this.#nameTokens;
  }

  set stateContent(val: string[]) {
    this.#stateContent = val;
  }

  get stateContent(): string[] {
    return this.#stateContent;
  }

  get value(): any {
    return this.#isValid ? this.#value : 0;
  }

  get state(): string | null {
    return this.#state;
  }

  get isValid(): boolean {
    return this.#isValid;
  }

  get isAvailable(): boolean {
    return this.#hassProvider.isEntityAvailable(this.#entity);
  }

  get attributes(): Record<string, number> {
    return this.#isValid &&
      !this.entityType.isCounter &&
      !this.entityType.isNumber &&
      !this.entityType.isDuration &&
      !this.entityType.isTimer
      ? this.#hassProvider.getNumericAttributes(this.#entity)
      : {};
  }

  get hasAttribute(): boolean {
    return this.#isValid && Object.keys(this.attributes).length > 0;
  }

  get defaultAttribute(): string | null {
    return HA_CONTEXT.attributeMapping[this.#domain as keyof typeof HA_CONTEXT.attributeMapping]?.attribute ?? null;
  }

  get name(): string {
    return this.#hassProvider.getEntityProp(this.#entity, 'friendly_name');
  }

  _nameResolver(): string {
    const resolvers: Record<string, (item: NameToken) => string | null> = {
      text: (item) => item.text ?? null,
      entity: () => this.#hassProvider.getEntityName(this.#entity),
      device: () => this.#hassProvider.getEntityDevice(this.#entity),
      area: () => this.#hassProvider.getEntityArea(this.#entity),
      floor: () => this.#hassProvider.getEntityFloor(this.#entity),
    };

    const tokens = assertDefined(this.#nameTokens, 'EntityHelper._nameResolver() called with no tokens set');

    return tokens
      .map((item) => {
        const resolver = resolvers[item.type];
        if (!resolver) return null;
        try {
          return resolver(item);
        } catch {
          return null;
        }
      })
      .filter((v) => is.nonEmptyString(v))
      .join(' ');
  }

  get nameComposition(): string {
    return this.#nameTokens ? this._nameResolver() : this.name;
  }

  get stateObj(): EntityState | null {
    return this.#hassProvider.getEntityStateObj(this.#entity);
  }

  get formatedEntityState(): string {
    return this.#hassProvider.getEntityProp(this.#entity, 'state', true);
  }

  get unit(): string | null {
    if (!this.#isValid) return null;
    if (this.entityType.isTimer) return CARD.config.unit.flexTimer;
    if (this.entityType.isDuration) return CARD.config.unit.second;
    if (this.entityType.isCounter) return CARD.config.unit.disable;

    return this.#hassProvider.getEntityProp(this.#entity, 'unit_of_measurement');
  }

  get precision(): number | null {
    return this.#isValid ? (this.#hassProvider.getEntityProp(this.#entity, 'display_precision') ?? null) : null;
  }

  get entityType(): Record<string, boolean> {
    if (!this.#entityTypeFlags.isSynced) {
      const type = this.getEntityType();
      const key = `is${type.charAt(0).toUpperCase() + type.slice(1)}`;
      this.#entityTypeFlags = { isTimer: false, isDuration: false, isNumber: false, isCounter: false, isSynced: true };
      this.#entityTypeFlags[key] = true;
    }
    return this.#entityTypeFlags;
  }

  get hasShapeByDefault(): boolean {
    return [HA_CONTEXT.entity.type.light, HA_CONTEXT.entity.type.fan].includes(this.#domain as string);
  }

  get defaultColor(): string | null {
    const colorMap: Record<string, string> = {
      [HA_CONTEXT.entity.type.timer]:
        this.value?.state === HA_CONTEXT.entity.state.active ? CARD.style.color.active : CARD.style.color.inactive,
      [HA_CONTEXT.entity.type.cover]: this.value > 0 ? CARD.style.color.coverActive : CARD.style.color.inactive,
      [HA_CONTEXT.entity.type.light]: this.value > 0 ? CARD.style.color.lightActive : CARD.style.color.inactive,
      // state, not value: a fan on a dynamic preset (e.g. "auto") is genuinely
      // on but its percentage attribute can legitimately read 0 - the fan
      // decides its own speed rather than reporting a fixed one.
      [HA_CONTEXT.entity.type.fan]:
        this.state === HA_CONTEXT.entity.state.on ? CARD.style.color.fanActive : CARD.style.color.inactive,
      [HA_CONTEXT.entity.type.climate]: this.#getClimateColor(),
      [HA_CONTEXT.entity.class.battery]: this.#getBatteryColor(),
    };

    return (
      colorMap[this.#domain as string] ??
      colorMap[this.#hassProvider.getEntityProp(this.#entity, 'device_class')] ??
      null
    );
  }

  get stateContentToString(): string {
    const results: string[] = [];

    for (const attr of this.#stateContent) {
      switch (attr) {
        case 'state':
          results.push(this.#hassProvider.getEntityProp(this.#entity, 'state', true));
          break;
        case 'device_name':
          results.push(this.#hassProvider.getEntityDevice(this.#entity) ?? '');
          break;
        case 'area_name':
          results.push(this.#hassProvider.getEntityArea(this.#entity) ?? '');
          break;
        default:
          results.push(this.#hassProvider.getEntityProp(this.#entity, attr, true));
          break;
      }
    }

    return results.length !== 0 ? results.join(CARD.config.separator) : '';
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  getEntityType(): string {
    this.#entityType ??= EntityHelper.#handleRefreshType.has(this.#domain as string)
      ? (this.#domain as string)
      : this.#hassProvider.getEntityProp(this.#entity, 'device_class') === HA_CONTEXT.entity.type.duration &&
          !this.#attribute
        ? HA_CONTEXT.entity.type.duration
        : HA_CONTEXT.entity.type.default;

    return this.#entityType;
  }

  refresh() {
    this.#isValid = this.#hassProvider.hasEntity(this.#entity);

    if (!this.#isValid) {
      this.#state = HA_CONTEXT.entity.state.notFound;
      return;
    }

    if (this.#attribute)
      // CF5 - issue (major) resolved - getEntityAttribute returns null (never
      // undefined) when missing, so this check always passed and invalid
      // attributes produced NaN downstream
      this.#isValid = this.#hassProvider.getEntityAttribute(this.#entity, this.#attribute) !== null;

    this.#state = this.#hassProvider.getEntityProp(this.#entity, 'state');
    if (!this.isValid || !this.isAvailable) return;

    const type = this.getEntityType();
    const handler = assertDefined(
      EntityHelper.#handleRefreshType.get(type) ?? EntityHelper.#handleRefreshType.get(HA_CONTEXT.entity.type.default),
      `EntityHelper: no refresh handler for '${type}' and no default handler registered`,
    );
    handler(this);
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  _manageStdEntity() {
    this.#attribute =
      this.#attribute ||
      HA_CONTEXT.attributeMapping[this.#domain as keyof typeof HA_CONTEXT.attributeMapping]?.attribute;
    if (!this.#attribute) {
      this.#value = parseFloat(this.#state as string) || 0;
      return;
    }

    const attrValue = this.#hassProvider.getEntityAttribute(this.#entity, this.#attribute);

    if (is.numericString(attrValue) || is.number(attrValue)) {
      this.#value = parseFloat(String(attrValue));
      if (
        this.#domain === HA_CONTEXT.attributeMapping.light.label &&
        this.#attribute === HA_CONTEXT.attributeMapping.light.attribute
      ) {
        this.#value = (100 * this.#value) / 255;
      }
    } else {
      // Si l'attribut n'est pas trouvé, définir un comportement
      this.#value = 0;
      this.#isValid = false;
    }
  }

  _manageTimerEntity() {
    let duration: number;
    let elapsed: number;
    switch (this.#state) {
      case HA_CONTEXT.entity.state.idle: {
        // elapsed/duration aren't real millisecond durations here (no timer
        // is running) - just the generic [0, 100] placeholder range.
        // Pre-multiplied so the shared `/ CARD.config.msFactor` below cancels
        // out to that same [0, 100] range instead of collapsing it to
        // [0, 0.1], which sent anything reading this.#value (e.g. a
        // watermark's high/low position) wildly out of bounds.
        elapsed = CARD.config.value.min * CARD.config.msFactor;
        duration = CARD.config.value.max * CARD.config.msFactor;
        break;
      }
      case HA_CONTEXT.entity.state.active: {
        const finished_at = new Date(this.#hassProvider.getEntityProp(this.#entity, 'finishes_at')).getTime();
        duration = NumberFormatter.convertDuration(this.#hassProvider.getEntityProp(this.#entity, 'duration'));
        const started_at = finished_at - duration;
        const now = new Date().getTime();
        elapsed = now - started_at;
        break;
      }
      case HA_CONTEXT.entity.state.paused: {
        const remaining = NumberFormatter.convertDuration(this.#hassProvider.getEntityProp(this.#entity, 'remaining'));
        duration = NumberFormatter.convertDuration(this.#hassProvider.getEntityProp(this.#entity, 'duration'));
        elapsed = duration - remaining;
        break;
      }
      default:
        throw new Error('Timer entity - Unknown case');
    }
    this.#value = {
      current: elapsed / CARD.config.msFactor,
      min: CARD.config.value.min,
      max: duration / CARD.config.msFactor,
      state: this.#state,
    };
  }

  _manageCounterAndNumberEntity(min: string, max: string) {
    this.#value = {
      current: parseFloat(this.#state as string),
      min: this.#hassProvider.getEntityAttribute(this.#entity, min),
      max: this.#hassProvider.getEntityAttribute(this.#entity, max),
    };
  }

  _manageDurationEntity() {
    const unit = this.#hassProvider.getEntityProp(this.#entity, 'unit_of_measurement');
    const value = parseFloat(this.#state as string);
    // CF5 - issue (critical) resolved - getEntityProp returns null (never
    // undefined), so the guard never matched and a missing unit crashed in
    // durationToSeconds
    const seconds = is.nullish(unit) ? null : NumberFormatter.durationToSeconds(value, unit);
    this.#value = seconds ?? 0;
    this.#isValid = seconds !== null;
  }

  #getClimateColor(): string {
    const climateColorMap: Record<string, string> = {
      heat_cool: CARD.style.color.active,
      dry: CARD.style.color.climate.dry,
      cool: CARD.style.color.climate.cool,
      heat: CARD.style.color.climate.heat,
      fan_only: CARD.style.color.climate.fanOnly,
    };
    return climateColorMap[this.#state as string] || CARD.style.color.inactive;
  }

  #getBatteryColor(): string {
    if (!this.#value || this.#value <= 30) return CARD.style.color.battery.low;
    if (this.#value <= 70) return CARD.style.color.battery.medium;
    return CARD.style.color.battery.high;
  }
}

/**
 * Helper class for managing entities collection.
 */

class EntityCollectionHelper {
  #entities: EntityHelper[] = [];
  #mode = 'stacked';

  static #numericValue(helper: EntityHelper): number {
    const value = helper.value;
    return is.number(value) ? value : (value?.current ?? 0);
  }

  // Width/share math always wants a magnitude - a negative raw value must never
  // turn into a negative width (nonsensical for a gradient stop or an arm
  // size).
  static #magnitude(helper: EntityHelper): number {
    return Math.abs(EntityCollectionHelper.#numericValue(helper));
  }

  // An entity counts as a negative contributor if explicitly marked `subtract`,
  // or if its own raw value is already negative (e.g. a grid-power sensor
  // signed by convention - see the `net` mode note in configuration.md).
  // Checking both - rather than just blindly negating when `subtract` is set -
  // means `subtract: true` on an already-negative value can't double-negate it
  // back to positive.
  static #isNegative(helper: EntityHelper): boolean {
    return helper.subtract || EntityCollectionHelper.#numericValue(helper) < 0;
  }

  static #magnitudeSum(entities: EntityHelper[]): number {
    return entities.reduce((sum, helper) => sum + EntityCollectionHelper.#magnitude(helper), 0);
  }

  static #splitByNegative(entities: EntityHelper[]): { positive: EntityHelper[]; negative: EntityHelper[] } {
    return {
      positive: entities.filter((helper) => !EntityCollectionHelper.#isNegative(helper)),
      negative: entities.filter((helper) => EntityCollectionHelper.#isNegative(helper)),
    };
  }

  set mode(newMode: string) {
    this.#mode = ['proportional', 'net'].includes(newMode) ? newMode : 'stacked';
  }

  get mode(): string {
    return this.#mode;
  }

  addEntity(
    entityId: string,
    attribute: string | null = null,
    color: string | null = null,
    subtract = false,
    isMain = false,
  ) {
    const helper = new EntityHelper();
    helper.entityId = entityId;
    if (attribute) helper.attribute = attribute;
    if (color) helper.color = color;
    helper.subtract = subtract;
    helper.isMain = isMain;
    this.#entities.push(helper);
  }

  refreshAll() {
    this.#entities.forEach((helper) => helper.refresh());
  }

  // Plain magnitude sum, mode-agnostic - the fill amount for
  // 'stacked'/'proportional' (both centered and not) and the non-centered
  // text/value. See getNetValue() for the sign-aware total ('net' mode, and
  // 'stacked'/'proportional' + center_zero's label).
  getTotalValue(): number {
    return EntityCollectionHelper.#magnitudeSum(this.getAvailableEntities());
  }

  getAvailableEntities(): EntityHelper[] {
    return this.#entities.filter((helper) => helper.isValid && helper.isAvailable);
  }

  // Algebraic total (positive arm's magnitude sum minus negative arm's): 'net'
  // mode's own total, and also what 'stacked'/'proportional' should show as
  // their text/value once center_zero splits them into two arms - a single flat
  // "88%" reading makes no sense once the bar itself is showing two
  // independent, possibly-opposing lengths (see ViewBase).
  getNetValue(): number {
    const { positive, negative } = EntityCollectionHelper.#splitByNegative(this.getAvailableEntities());
    return EntityCollectionHelper.#magnitudeSum(positive) - EntityCollectionHelper.#magnitudeSum(negative);
  }

  // Auto-shaded fallback (darkest -> pure base color, by position among
  // entities lacking an explicit color) for an entity with no color override -
  // the only differentiation available before bar_stack.entities[].color
  // existed. The main entity is never part of this: it always keeps its own
  // negotiated curColor, unshaded, regardless of its position in the collection
  // (index 0 in 'stacked', last in 'proportional' - shading by raw position
  // used to darken whichever one landed first).
  static #entityColor(helper: EntityHelper, index: number, total: number, curColor: string): string {
    if (helper.isMain) return curColor;
    if (helper.color) return ThemeManager.adaptColor(helper.color) ?? curColor;
    const whitePercent = Math.round((1 - index / (total - 1 || 1)) * 50); // de 50 → 0
    return `color-mix(in srgb, ${curColor} ${100 - whitePercent}%, black ${whitePercent}%)`;
  }

  getEntitiesColor(curColor: string | null, progressRatio = 1, range = 0, isVertical = false): string | null {
    const available = this.getAvailableEntities();
    if (!available.length || !curColor) return null;
    return this.#mode === 'stacked'
      ? EntityCollectionHelper.#stackedGradient(available, curColor, progressRatio, range, isVertical)
      : EntityCollectionHelper.#proportionalGradient(available, curColor, progressRatio, range, isVertical);
  }

  // 'stacked'/'proportional' + center_zero only ('net' has its own
  // single-segment path, see ViewBase.barColor): entities split into two
  // independent arms (see #splitByNegative), each laid out with the exact same
  // per-mode algorithm as the non-centered case (on magnitudes, see
  // #magnitude), just scoped to its own half-range (max-zeroValue /
  // zeroValue-min).
  getDivergingGradients(curColor: string | null, { min, max, zeroValue }: Record<string, number>, isVertical = false) {
    const available = this.getAvailableEntities();
    if (!available.length || !curColor) return null;

    const build =
      this.#mode === 'stacked' ? EntityCollectionHelper.#stackedGradient : EntityCollectionHelper.#proportionalGradient;
    const arm = (entities: EntityHelper[], range: number) => {
      if (!entities.length || range <= 0) return { gradient: null, size: 0 };
      const size = Math.min(1, Math.max(0, EntityCollectionHelper.#magnitudeSum(entities) / range));
      return { gradient: build(entities, curColor, size, range, isVertical), size };
    };

    const { positive, negative } = EntityCollectionHelper.#splitByNegative(available);
    const pos = arm(positive, max - zeroValue);
    const neg = arm(negative, zeroValue - min);
    return { posGradient: pos.gradient, negGradient: neg.gradient, posSize: pos.size, negSize: neg.size };
  }

  // 'proportional' mode (legacy `additions` behavior, a.k.a. "100% stacked"):
  // each entity's share is renormalized against the combined total, so the
  // visible fill is always divided between entities regardless of how that
  // total compares to min_value/max_value.
  static #proportionalGradient(
    available: EntityHelper[],
    curColor: string,
    progressRatio: number,
    _range: number,
    isVertical = false,
  ): string | null {
    const total = EntityCollectionHelper.#magnitudeSum(available);
    if (total === 0) return null;

    const shadeTotal = available.filter((helper) => !helper.isMain).length;
    let shadeIndex = 0;
    const gradientStops: string[] = [];
    // With translateX-based fill, the inner element is 100% wide but only the
    // rightmost progressRatio% is visible. Segment stops must be offset so that
    // they land inside the visible portion instead of starting from position 0.
    const offset = (1 - progressRatio) * 100;
    let currentPosition = offset;

    available.forEach((helper) => {
      const share = (EntityCollectionHelper.#magnitude(helper) / total) * 100;
      const color = EntityCollectionHelper.#entityColor(helper, shadeIndex, shadeTotal, curColor);
      if (!helper.isMain) shadeIndex++;
      const end = currentPosition + share * progressRatio;

      gradientStops.push(`${color} ${currentPosition.toFixed(2)}%`, `${color} ${end.toFixed(2)}%`);
      currentPosition = end;
    });

    return `linear-gradient(${isVertical ? 'to top' : 'to right'}, ${gradientStops.join(', ')})`;
  }

  // 'stacked' mode: each entity occupies its own literal width on the card's
  // min_value/ max_value scale (not renormalized against the others) - entities
  // placed in list order, starting right after the previous one. Leftover space
  // past the last entity stays empty (no gap-filling color), and entities are
  // clipped/skipped once the cumulative width reaches 100% instead of shrinking
  // everyone to fit.
  static #stackedGradient(
    available: EntityHelper[],
    curColor: string,
    progressRatio: number,
    range: number,
    isVertical = false,
  ): string | null {
    if (!range) return null;

    const shadeTotal = available.filter((helper) => !helper.isMain).length;
    let shadeIndex = 0;
    const gradientStops: string[] = [];
    const offset = (1 - progressRatio) * 100;
    let currentPosition = offset;

    for (let i = 0; i < available.length && currentPosition < 100; i++) {
      const helper = available[i];
      const width = (EntityCollectionHelper.#magnitude(helper) / range) * 100;
      const color = EntityCollectionHelper.#entityColor(helper, shadeIndex, shadeTotal, curColor);
      if (!helper.isMain) shadeIndex++;
      const end = Math.min(100, currentPosition + width);

      gradientStops.push(`${color} ${currentPosition.toFixed(2)}%`, `${color} ${end.toFixed(2)}%`);
      currentPosition = end;
    }

    return gradientStops.length
      ? `linear-gradient(${isVertical ? 'to top' : 'to right'}, ${gradientStops.join(', ')})`
      : null;
  }

  get count(): number {
    return this.#entities.length;
  }

  clear() {
    this.#entities = [];
  }
}

/**
 * Represents either an entity ID or a direct value. This class validates the
 * provided value and retrieves information from Home Assistant if it's an
 * entity.
 */
class EntityOrValue {
  #activeHelper: EntityHelper | ValueHelper | null = null;
  #isEntity = false;

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  #entity(): EntityHelper | null {
    return this.#isEntity ? (this.#activeHelper as EntityHelper) : null;
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set value(newValue: unknown) {
    if (is.string(newValue)) {
      if (!(this.#activeHelper instanceof EntityHelper)) {
        this.#activeHelper = new EntityHelper();
        this.#isEntity = true;
      }
      this.#activeHelper.entityId = newValue;
    } else if (is.number(newValue)) {
      if (!(this.#activeHelper instanceof ValueHelper)) {
        this.#activeHelper = new ValueHelper();
        this.#isEntity = false;
      }
      this.#activeHelper.value = newValue;
    } else {
      this.#activeHelper = null;
      this.#isEntity = false;
    }
  }

  get value(): any {
    return this.#activeHelper?.value ?? null;
  }

  get isEntity(): boolean {
    return this.#isEntity;
  }

  get isValid(): boolean {
    return this.#activeHelper?.isValid ?? false;
  }

  get isAvailable(): boolean {
    if (!this.#activeHelper) return false;
    return this.#isEntity
      ? (this.#activeHelper as EntityHelper).isAvailable || this.#activeHelper.isValid
      : this.#activeHelper.isValid;
  }

  get state(): string | null {
    return this.#entity()?.state ?? null;
  }

  get precision(): number | null {
    return this.#entity()?.precision ?? null;
  }

  get name(): string | null {
    return this.#entity()?.name ?? null;
  }

  get nameComposition(): string | null {
    return this.#entity()?.nameComposition ?? null;
  }

  get formatedEntityState(): string | null {
    return this.#entity()?.formatedEntityState ?? null;
  }

  get stateContent(): string[] | null {
    return this.#entity()?.stateContent ?? null;
  }

  set stateContent(newValue: string[]) {
    const entity = this.#entity();
    if (entity) entity.stateContent = newValue;
  }

  get stateContentToString(): string | null {
    return this.#entity()?.stateContentToString ?? null;
  }

  get entityType(): Record<string, boolean> {
    return (
      this.#entity()?.entityType ?? {
        isTimer: false,
        isDuration: false,
        isNumber: false,
        isCounter: false,
        isSynced: false,
      }
    );
  }

  get hasShapeByDefault(): boolean {
    return this.#entity()?.hasShapeByDefault ?? false;
  }

  get defaultColor(): string | null | false {
    return this.#entity()?.defaultColor ?? false;
  }

  get hasAttribute(): boolean {
    return this.#entity()?.hasAttribute ?? false;
  }

  get defaultAttribute(): string | null {
    return this.#entity()?.defaultAttribute ?? null;
  }

  get attributes(): Record<string, number> | null {
    return this.#entity()?.attributes ?? null;
  }

  get unit(): string | null {
    return this.#entity()?.unit ?? null;
  }

  get stateObj(): EntityState | null {
    return this.#entity()?.stateObj ?? null;
  }

  get nameTokens(): NameToken[] | null {
    return this.#entity()?.nameTokens ?? null;
  }

  set nameTokens(tok: unknown) {
    const entity = this.#entity();
    if (entity) entity.nameTokens = tok;
  }

  get attribute(): string | null {
    return this.#entity()?.attribute ?? null;
  }

  set attribute(newValue: string | null) {
    const entity = this.#entity();
    if (entity) entity.attribute = newValue;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh() {
    this.#entity()?.refresh();
  }
}

export { ObjStructure };
export { NumberFormatter };
export { TypedValueHelper };
export { ValueHelper };
export { DecimalHelper };
export { UnitHelper };
export { ProgressCalc };
export { PercentHelper };
export { ThemeManager };
export { ChangeTracker };
export { EntityHelper };
export { EntityCollectionHelper };
export { EntityOrValue };
