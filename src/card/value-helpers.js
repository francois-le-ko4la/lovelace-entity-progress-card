/*
 * Computation helpers that turn a card's config + entity state into renderable
 * values: number/unit formatting, percent/progress math, theme color
 * resolution, and multi-entity (bar_stack) aggregation.
 */

import { CARD_CONTEXT, HA_CONTEXT, CARD, THEME, SEV } from '../utils/parameters.js';
import { is, has } from '../utils/common-checks.js';
import { Logger } from '../utils/log.js';
import { HassProviderSingleton } from '../utils/hass-provider.js';
import { StructureTemplates } from './structure.js';

/******************************************************************************
 * 🛠️ ObjStructure
 * ============================================================================
 *
 * ✅ Builds and caches a card type's DOM structure (`StructureTemplates[
 * cardType]`) as a `<template>`, cloned on each `render()`/`clone()` call
 * instead of re-parsing `innerHTML` every time. Cached per unique structure
 * options (barType, barPosition, layout, ...), since the markup only depends
 * on those, not on the entity's live state.
 *
 * @class
 */
class ObjStructure {
  // CF5 - issue (perf) resolved - card.innerHTML re-parsed the full HTML string
  // on every render (each card creation, each editor keystroke). The structure
  // is now built once per unique option set into a <template> and cloned
  // (~5-10x faster than parsing). The DOM depends on the config's structure
  // options (barType, barPosition, layout, ...), so the cache is keyed on the
  // exact options object: any setConfig producing different structure options
  // gets its own template, identical configs share one.
  #templates = new Map();

  constructor(cardType) {
    this._cardType = cardType;
  }

  render(options = {}) {
    return StructureTemplates[this._cardType](options);
  }

  clone(options = {}) {
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

/******************************************************************************
 * 🛠️ NumberFormatter
 * ============================================================================
 *
 * ✅ class for formatting value && unit.
 *
 * This class uses `Value`, `Unit`, and `Decimal` objects to manage and validate
 * its internal data.
 *
 * @class
 */
class NumberFormatter {
  static unitsNoSpace = {
    'fr-FR': new Set(['j', 'd', 'h', 'min', 'ms', 'μs', '°']),
    'de-DE': new Set(['d', 'h', 'min', 'ms', 'μs', '°']),
    'en-US': new Set(['d', 'h', 'min', 'ms', 'μs', '°', '%']),
  };

  static getSpaceCharacter(locale, unit) {
    const set = NumberFormatter.unitsNoSpace[locale] || NumberFormatter.unitsNoSpace['en-US'];
    return set.has(unit.toLowerCase()) ? '' : CARD.config.unit.space;
  }

  static formatValueAndUnit(
    value,
    decimal = 2,
    unit = '',
    locale = 'en-US',
    unitSpacing = CARD.config.unit.unitSpacing.auto,
  ) {
    if (is.nullish(value)) return '';

    const formattedValue = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimal,
      maximumFractionDigits: decimal,
      useGrouping: locale !== 'en',
    }).format(value);

    if (!unit) return formattedValue;

    const spaceMap = {
      space: CARD.config.unit.space,
      'no-space': '',
      auto: () => NumberFormatter.getSpaceCharacter(locale, unit),
    };
    const space = has.method(spaceMap, unitSpacing) ? spaceMap[unitSpacing]() : spaceMap[unitSpacing];

    return `${formattedValue}${space}${unit}`;
  }
  static formatTiming(
    totalSeconds,
    decimal = 0,
    locale = 'en-US',
    flex = false,
    unitSpacing = CARD.config.unit.unitSpacing.auto,
  ) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = (totalSeconds % 60).toFixed(decimal);

    const pad = (value, length = 2) => String(value).padStart(length, '0');

    const [intPart, decimalPart] = seconds.split('.');
    seconds = decimalPart !== undefined ? `${pad(intPart)}.${decimalPart}` : pad(seconds);

    if (flex) {
      if (totalSeconds < 60)
        return NumberFormatter.formatValueAndUnit(parseFloat(seconds), decimal, 's', locale, unitSpacing);
      if (totalSeconds < 3600) return `${pad(minutes)}:${seconds}`;
    }

    return [pad(hours), pad(minutes), seconds].join(':');
  }
  static durationToSeconds(value, unit) {
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
  static convertDuration(duration) {
    // CF5 - issue (critical) resolved - timer attributes (duration/remaining)
    // can be missing during HA startup; null.split() crashed the card
    if (!is.string(duration)) return 0;
    // CF5 - issue (minor) resolved - Python timedelta strings for timers over
    // 24h are "N day(s), H:MM:SS": the day prefix made every part NaN. Days are
    // now parsed, and any malformed remainder returns 0 instead of propagating
    // NaN.
    const dayMatch = duration.match(/^(\d+) days?, (.*)$/);
    const days = dayMatch ? parseInt(dayMatch[1], 10) : 0;
    const parts = (dayMatch ? dayMatch[2] : duration).split(':').map(Number);
    if (parts.length !== 3 || parts.some((p) => !Number.isFinite(p))) return 0;
    const [hours, minutes, seconds] = parts;

    return ((days * 24 + hours) * 3600 + minutes * 60 + seconds) * CARD.config.msFactor;
  }
}

/******************************************************************************
 * 🛠️ TypedValueHelper
 * ============================================================================
 *
 * ✅ Base class for a self-validating typed value: stores a value only if
 * `_validate()` (overridden per subclass) accepts it, otherwise falls back
 * to the constructor's initial value. `isValid` reflects the last assignment.
 *
 * @class
 * @abstract
 */

class TypedValueHelper {
  #value = null;
  #isValid = false;
  #defaultValue = null;

  constructor(newValue = null) {
    if (this._validate(newValue)) this.#defaultValue = newValue;
  }

  set value(newValue) {
    this.#isValid = this._validate(newValue);
    this.#value = this.#isValid ? newValue : null;
  }
  get value() {
    return this.#isValid ? this.#value : this.#defaultValue;
  }
  get isValid() {
    return this.#isValid;
  }

  _validate(_value) {
    return false;
  }
}

/**
 * ✅ TypedValueHelper accepting any finite number.
 * @class
 * @extends TypedValueHelper
 */
class ValueHelper extends TypedValueHelper {
  _validate(v) {
    return is.number(v);
  }
}

/******************************************************************************
 * 🛠️ DecimalHelper
 * ============================================================================
 *
 * ✅ Represents a non-negative integer value that can be valid or invalid.
 *
 * @class
 */
class DecimalHelper extends TypedValueHelper {
  _validate(v) {
    return Number.isInteger(v) && v >= 0;
  }
}

/******************************************************************************
 * 🛠️ UnitHelper
 * ============================================================================
 *
 * ✅ Represents a unit of measurement, stored as a string.
 *
 * @class
 */
class UnitHelper {
  #value = CARD.config.unit.default;
  #isDisabled = false;

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set value(newValue) {
    // CF5 - issue (critical) resolved - some integrations expose a non-string
    // unit_of_measurement; .trim() crashed and the ?? fallback was dead code
    this.#value = is.nullish(newValue) ? CARD.config.unit.default : String(newValue).trim();
  }
  get value() {
    return this.#isDisabled ? '' : this.#value;
  }
  set isDisabled(newValue) {
    this.#isDisabled = is.boolean(newValue) ? newValue : false;
  }
  get isDisabled() {
    return this.#isDisabled;
  }
  get isTimerUnit() {
    return this.#value.toLowerCase() === CARD.config.unit.timer;
  }
  get isFlexTimerUnit() {
    return this.#value.toLowerCase() === CARD.config.unit.flexTimer;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  toString() {
    return this.#isDisabled ? '' : this.#value;
  }
}

/******************************************************************************
 * 🛠️ PercentHelper
 * ============================================================================
 *
 * ✅ class for calculating and formatting percentages.
 *
 * @class
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

  set isReversed(newValue) {
    this.#isReversed = is.boolean(newValue) ? newValue : CARD.config.reverse;
  }
  get isReversed() {
    return this.#isReversed;
  }

  set min(newValue) {
    this.#min.value = newValue;
  }
  get min() {
    return this.#min.value;
  }

  set max(newValue) {
    this.#max.value = newValue;
  }
  get max() {
    return this.#max.value;
  }

  set current(newCurrent) {
    this.#current.value = newCurrent;
  }
  get current() {
    return this.#current.value;
  }

  set decimal(newValue) {
    this.#decimal.value = newValue;
  }
  get decimal() {
    return this.#decimal.value;
  }

  set isCenterZero(newValue) {
    this.#isCenterZero = is.boolean(newValue) ? newValue : false;
  }
  get isCenterZero() {
    return this.#isCenterZero;
  }

  set zeroValue(newValue) {
    this.#zeroValue = is.number(newValue) ? newValue : 0;
  }
  get zeroValue() {
    return this.#zeroValue;
  }

  set growthPercent(newValue) {
    this.#growthPercent = is.boolean(newValue) ? newValue : false;
  }
  get growthPercent() {
    return this.#growthPercent;
  }

  set scale(newValue) {
    this.#scale = newValue === 'log' ? 'log' : 'linear';
  }
  get scale() {
    return this.#scale;
  }

  // log scale requires a well-formed positive range (log(0) or log(negative) is
  // undefined) — center_zero's own zeroValue/min/max split has no meaningful
  // log equivalent either, so both silently fall back to plain linear math in
  // #percentForValue rather than producing NaN.
  get isLogScale() {
    return this.#scale === 'log' && !this.isCenterZero && this.min > 0 && this.max > this.min;
  }

  get actual() {
    return this.#isReversed ? this.max - this.current : this.current;
  }
  get isValid() {
    return this.range !== 0;
  }
  get range() {
    if (!this.isCenterZero) return this.max - this.min;
    return this.current >= this.#zeroValue ? this.max - this.#zeroValue : this.#zeroValue - this.min;
  }
  get correctedValue() {
    return this.isCenterZero ? this.current - this.#zeroValue : this.actual - this.min;
  }
  get percent() {
    return this.isValid ? this.#percent : null;
  }

  /**
   * Pourcentage de croissance/décroissance par rapport à la valeur de centrage
   * (`zeroValue`), indépendant du ratio de remplissage de la barre (`percent`).
   * N'a de sens que si `isCenterZero` et `growthPercent` sont actifs, et que
   * `zeroValue` n'est pas 0 (sinon le ratio est mathématiquement indéfini — on
   * retombe alors sur `percent`).
   */
  get growthPercentValue() {
    if (!this.isValid) return null;
    if (this.#zeroValue === 0) return this.percent;
    return Number((((this.current - this.#zeroValue) / this.#zeroValue) * 100).toFixed(this.decimal));
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh() {
    const currentValue = this.isCenterZero ? this.current : this.actual;
    this.#percent = this.isValid ? Number(this.#percentForValue(currentValue).toFixed(this.decimal)) : 0;
  }

  calcWatermark(value) {
    const numericValue = is.number(value) ? value : (value?.current ?? 0);
    const percent = this.#percentForValue(numericValue);
    return this.isCenterZero ? 50 + percent / 2 : percent;
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  #percentForValue(value) {
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

/******************************************************************************
 * 🛠️ PercentHelper
 * ============================================================================
 *
 * ✅ class for calculating and formatting percentages.
 *
 * @class
 */
class PercentHelper extends ProgressCalc {
  #hassProvider = null;
  #unit = new UnitHelper();
  #isTimer = false;
  #unitSpacing = CARD.config.unit.unitSpacing.auto;

  constructor() {
    super();
    this.#hassProvider = HassProviderSingleton.getInstance();
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set isTimer(newValue) {
    this.#isTimer = is.boolean(newValue) ? newValue : false;
  }
  get isTimer() {
    return this.#isTimer;
  }

  get unit() {
    return this.#unit.value;
  }
  set unit(newValue) {
    this.#unit.value = newValue ?? '';
  }

  get hasTimerUnit() {
    return this.#isTimer && this.#unit.isTimerUnit;
  }
  get hasFlexTimerUnit() {
    return this.#isTimer && this.#unit.isFlexTimerUnit;
  }
  get hasTimerOrFlexTimerUnit() {
    return this.hasTimerUnit || this.hasFlexTimerUnit;
  }

  get processedValue() {
    if (this.unit !== CARD.config.unit.default) return this.actual;
    return this.isCenterZero && this.growthPercent ? this.growthPercentValue : this.percent;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  configure({ unitSpacing, hasDisabledUnit, isCenterZero, zeroValue, growthPercent, scale }) {
    this.#unitSpacing = unitSpacing;
    this.#unit.isDisabled = hasDisabledUnit;
    this.isCenterZero = isCenterZero;
    this.zeroValue = zeroValue;
    this.growthPercent = growthPercent;
    this.scale = scale;
  }

  valueForThemes(isCustomTheme, valueBasedOnPercentage) {
    /*
     * Calculates the value to display based on the selected theme and unit
     * system.
     *
     * - If the unit is Fahrenheit, the temperature is converted to Celsius
     * before returning. - If the theme is linear or the unit is the default,
     * the percentage value is returned.
     */
    let value = this.actual;
    if (isCustomTheme) return value;
    if (this.unit === CARD.config.unit.fahrenheit) value = ((value - 32) * 5) / 9;
    return valueBasedOnPercentage || [CARD.config.unit.default, CARD.config.unit.disable].includes(this.unit)
      ? this.percent
      : value;
  }

  toString() {
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

/******************************************************************************
 * 🛠️ ThemeManager
 * ============================================================================
 *
 * ✅ Manages the theme and its associated icon and color based on a percentage
 * value.
 *
 * @class
 */
class ThemeManager {
  #theme = null;
  #icon = null;
  #iconColor = null;
  #barColor = null;
  #value = 0;
  #isValid = false;
  #isLinear = false;
  #isBasedOnPercentage = false;
  #isCustomTheme = false;
  #currentStyle = null;
  #interpolate = false;

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set theme(newTheme) {
    if (is.nullish(newTheme) || !has.validKey(THEME, newTheme)) {
      this.#reset();
      return;
    }
    this.#isValid = true;
    this.#theme = newTheme;
    this.#currentStyle = THEME[newTheme].style;
    this.#isLinear = THEME[newTheme].linear;
    this.#isBasedOnPercentage = THEME[newTheme].percent;
  }
  get theme() {
    return this.#theme;
  }
  // Only a presence/shape check: per-zone validity (numeric min < max, sorted)
  // is already guaranteed by the schema's customTheme validator, the sole path
  // a config reaches here through — see BaseConfigHelper.set config.
  set customTheme(newTheme) {
    if (!is.nonEmptyArray(newTheme)) return;
    this.#theme = CARD.theme.default;
    this.#currentStyle = newTheme;
    this.#isValid = true;
    this.#isLinear = false;
    this.#isCustomTheme = true;
  }
  get customTheme() {
    return this.#currentStyle;
  }
  get isLinear() {
    return this.#isLinear;
  }
  get isBasedOnPercentage() {
    return this.#isBasedOnPercentage;
  }
  get isCustomTheme() {
    return this.#isCustomTheme;
  }
  get isValid() {
    return this.#isValid;
  }
  set value(newValue) {
    this.#value = newValue;
    this.#refresh();
  }
  get value() {
    return this.#value;
  }
  get icon() {
    return this.#icon;
  }
  get iconColor() {
    return this.#iconColor;
  }
  get barColor() {
    return this.#barColor;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  configure({ theme, customTheme, interpolate }) {
    this.theme = theme;
    this.customTheme = customTheme;
    this.#interpolate = interpolate;
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  #reset() {
    [
      this.#icon,
      this.#barColor,
      this.#iconColor,
      this.#theme,
      this.#currentStyle,
      this.#value,
      this.#isValid,
      this.#isLinear,
      this.#isBasedOnPercentage,
      this.#isCustomTheme,
      this.#interpolate,
    ] = [null, null, null, null, null, 0, false, false, false, false, false];
  }
  #refresh() {
    if (!this.#isValid) return;
    const applyStyle = this.isLinear ? this.#setLinearStyle : this.#setStyle;
    applyStyle.call(this);
  }

  #setLinearStyle() {
    const lastStep = this.#currentStyle.length - 1;
    const thresholdSize = CARD.config.value.max / lastStep;
    const percentage = Math.max(0, Math.min(this.#value, CARD.config.value.max));
    const index = Math.min(Math.floor(percentage / thresholdSize), lastStep);
    const ratio = (percentage - index * thresholdSize) / thresholdSize;
    this.#applyColors(this.#currentStyle[index], this.#currentStyle[index + 1] ?? null, ratio);
  }

  #setStyle() {
    let [themeData, nextThemeData, ratio] = [null, null, 0];

    if (this.#value >= this.#currentStyle[this.#currentStyle.length - 1].max) {
      themeData = this.#currentStyle[this.#currentStyle.length - 1];
    } else if (this.#value < this.#currentStyle[0].min) {
      themeData = this.#currentStyle[0];
    } else {
      // custom_theme zones no longer have to tile perfectly (gaps are
      // tolerated), so a value can land in a gap between two of them —
      // themeData then stays null and #applyColors disengages the theme for
      // this render, deferring to whatever color source is next in priority
      // (see CardView.iconColor/barColor).
      const index = this.#currentStyle.findIndex((level) => this.#value >= level.min && this.#value < level.max);
      if (index !== -1) {
        themeData = this.#currentStyle[index];
        nextThemeData = this.#currentStyle[index + 1] ?? null;
        ratio = (this.#value - themeData.min) / (themeData.max - themeData.min);
      }
    }

    this.#applyColors(themeData, nextThemeData, ratio);
  }

  #applyColors(themeData, nextThemeData, ratio) {
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
  static #interpolateColor(from, to, ratio) {
    if (!from || !to) return null;
    const pct = Math.round(ratio * 100);
    return `color-mix(in srgb, ${to} ${pct}%, ${from})`; // from/to déjà adaptés
  }
  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  static adaptColor(curColor) {
    return HA_CONTEXT.haColors.get(curColor) ?? curColor;
  }

  buildGradient(fillPercent, mode, defaultColor = null, isVertical = false) {
    if (!this.#isValid || !this.#currentStyle || mode === 'auto') return null;
    if (!(fillPercent > 0)) return null;

    // For linear themes, derive min/max boundaries by splitting 0–100% equally.
    const style = this.#isLinear
      ? this.#currentStyle.map((level, i, arr) => ({
          ...level,
          min: (i / arr.length) * 100,
          max: ((i + 1) / arr.length) * 100,
        }))
      : this.#currentStyle;

    const visible = style.filter((level) => level.min < fillPercent);
    if (visible.length === 0) return null;

    // Inner element uses translateX((value-1)*100%), shifted left by
    // (100-fillPercent)%. A zone boundary at container position B → element
    // position B + offset. vertical-bar uses the exact same formula on
    // translateY instead (see the CSS on .vertical-bar .inner) - only the
    // gradient's own direction needs to follow, not this math.
    const offset = 100 - fillPercent;
    const toElemPos = (b) => `${(b + offset).toFixed(2)}%`;
    const direction = isVertical ? 'to top' : 'to right';
    // color is optional per zone now (see types.customTheme) — a color-less
    // zone falls back the same way iconColor/barColor already do: the entity's
    // own negotiated color (e.g. a cover is pink open / grey closed, see
    // EntityHelper.defaultColor), then the card's generic default, rather than
    // a flat neutral for every domain.
    const col = (level) =>
      ThemeManager.adaptColor(level.bar_color || level.color) || defaultColor || CARD.style.color.default;

    if (mode === 'segment') {
      const stops = visible.flatMap((level, i) => {
        const start = i === 0 ? '0%' : toElemPos(level.min);
        const end = level.max >= fillPercent ? '100%' : toElemPos(level.max);
        return [`${col(level)} ${start}`, `${col(level)} ${end}`];
      });
      return `linear-gradient(${direction}, ${stops.join(', ')})`;
    }

    if (mode === 'rainbow') {
      const first = col(visible[0]);
      const stops = [`${first} 0%`];
      if (offset > 0) stops.push(`${first} ${offset.toFixed(2)}%`);
      visible.forEach((level, i) => {
        if (i > 0) stops.push(`${col(level)} ${toElemPos(level.min)}`);
      });
      stops.push(`${col(visible[visible.length - 1])} 100%`);
      return `linear-gradient(${direction}, ${stops.join(', ')})`;
    }

    return null;
  }
}

/******************************************************************************
 * 🛠️ ChangeTracker
 * ============================================================================
 */
class ChangeTracker {
  #debug = CARD_CONTEXT.debug.hass;
  #log = null;
  #firstTime = true;
  #watchedEntities = new Set();
  #entityCache = {};
  #updated = false;
  #hassState = { isUpdated: false };

  constructor() {
    this.#log = Logger.create('ChangeTracker', this.#debug ? SEV.debug : SEV.info);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set hassState(hass) {
    this.#updated = false;
    if (!hass) return;

    if (this._hasChanged(hass)) {
      this._updateCache(hass);
      this.#updated = true;
      this.#log.debug('HASS need update...!');
    }
    this.#hassState = { isUpdated: this.#updated };
  }

  get hassState() {
    return this.#hassState;
  }

  get isUpdated() {
    return this.#updated;
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  _hasChanged(newHass) {
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

  _updateCache(hass) {
    this.#entityCache = {};
    for (const entityId of this.#watchedEntities) {
      this.#entityCache[entityId] = hass.states?.[entityId] ?? null;
    }
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  watchEntity(entityId) {
    if (entityId) {
      this.#watchedEntities.add(entityId);
    }
  }

  resetWatchedEntities() {
    this.#watchedEntities.clear();
  }
}

/******************************************************************************
 * 🛠️ EntityHelper
 * ============================================================================
 *
 * ✅ Helper class for managing entities. This class validates and retrieves
 * information from Home Assistant if it's an entity.
 *
 * @class
 */
class EntityHelper {
  #hassProvider = null;
  #isValid = false;
  #value = {};
  #entityId = null;
  #attribute = null;
  #color = null;
  #subtract = false;
  #isMain = false;
  #state = null;
  #domain = null;
  #entityType = null;
  #entityTypeFlags = { isTimer: false, isDuration: false, isNumber: false, isCounter: false, isSynced: false };
  #stateContent = [];
  #nameTokens = null;
  static #handleRefreshType = new Map([
    [HA_CONTEXT.entity.type.timer, (self) => self._manageTimerEntity()],
    [HA_CONTEXT.entity.type.duration, (self) => self._manageDurationEntity()],
    [HA_CONTEXT.entity.type.counter, (self) => self._manageCounterAndNumberEntity('minimum', 'maximum')],
    [HA_CONTEXT.entity.type.number, (self) => self._manageCounterAndNumberEntity('min', 'max')],
    [HA_CONTEXT.entity.type.default, (self) => self._manageStdEntity()],
  ]);

  constructor() {
    this.#hassProvider = HassProviderSingleton.getInstance();
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set entityId(newValue) {
    this.#entityId = newValue;
    this.#nameTokens = null;
    this.#entityType = null;
    this.#entityTypeFlags.isSynced = false;
    this.#value = 0;
    this.#domain = HassProviderSingleton.getEntityDomain(newValue);
    this.#isValid = this.#hassProvider.hasEntity(this.#entityId);
  }

  get entityId() {
    return this.#entityId;
  }
  set attribute(newValue) {
    this.#attribute = newValue;
  }
  get attribute() {
    return this.#attribute;
  }
  set color(newValue) {
    this.#color = newValue ?? null;
  }
  get color() {
    return this.#color;
  }
  set subtract(newValue) {
    this.#subtract = Boolean(newValue);
  }
  get subtract() {
    return this.#subtract;
  }
  set isMain(newValue) {
    this.#isMain = Boolean(newValue);
  }
  get isMain() {
    return this.#isMain;
  }
  set nameTokens(tok) {
    this.#nameTokens = is.nonEmptyArray(tok) ? tok : null;
  }
  get nameTokens() {
    return this.#nameTokens;
  }
  set stateContent(val) {
    this.#stateContent = val;
  }
  get stateContent() {
    return this.#stateContent;
  }
  get value() {
    return this.#isValid ? this.#value : 0;
  }
  get state() {
    return this.#state;
  }
  get isValid() {
    return this.#isValid;
  }
  get isAvailable() {
    return this.#hassProvider.isEntityAvailable(this.#entityId);
  }
  get attributes() {
    return this.#isValid &&
      !this.entityType.isCounter &&
      !this.entityType.isNumber &&
      !this.entityType.isDuration &&
      !this.entityType.isTimer
      ? this.#hassProvider.getNumericAttributes(this.#entityId)
      : {};
  }
  get hasAttribute() {
    return this.#isValid && Object.keys(this.attributes).length > 0;
  }
  get defaultAttribute() {
    return HA_CONTEXT.attributeMapping[this.#domain]?.attribute ?? null;
  }
  get name() {
    return this.#hassProvider.getEntityProp(this.#entityId, 'friendly_name');
  }
  _nameResolver() {
    const resolvers = {
      text: (item) => item.text,
      entity: () => this.#hassProvider.getEntityName(this.entityId),
      device: () => this.#hassProvider.getEntityDevice(this.entityId),
      area: () => this.#hassProvider.getEntityArea(this.entityId),
      floor: () => this.#hassProvider.getEntityFloor(this.entityId),
    };

    return this.#nameTokens
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
  get nameComposition() {
    return this.#nameTokens ? this._nameResolver() : this.name;
  }
  get stateObj() {
    return this.#hassProvider.getEntityStateObj(this.#entityId);
  }
  get formatedEntityState() {
    return this.#hassProvider.getEntityProp(this.#entityId, 'state', true);
  }
  get unit() {
    if (!this.#isValid) return null;
    if (this.entityType.isTimer) return CARD.config.unit.flexTimer;
    if (this.entityType.isDuration) return CARD.config.unit.second;
    if (this.entityType.isCounter) return CARD.config.unit.disable;

    return this.#hassProvider.getEntityProp(this.#entityId, 'unit_of_measurement');
  }
  get precision() {
    return this.#isValid ? (this.#hassProvider.getEntityProp(this.#entityId, 'display_precision') ?? null) : null;
  }
  get entityType() {
    if (!this.#entityTypeFlags.isSynced) {
      const type = this.getEntityType();
      const key = `is${type.charAt(0).toUpperCase() + type.slice(1)}`;
      this.#entityTypeFlags = { isTimer: false, isDuration: false, isNumber: false, isCounter: false, isSynced: true };
      this.#entityTypeFlags[key] = true;
    }
    return this.#entityTypeFlags;
  }
  get hasShapeByDefault() {
    return [HA_CONTEXT.entity.type.light, HA_CONTEXT.entity.type.fan].includes(this.#domain);
  }
  get defaultColor() {
    const colorMap = {
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

    return colorMap[this.#domain] ?? colorMap[this.#hassProvider.getEntityProp(this.#entityId, 'device_class')] ?? null;
  }
  get stateContentToString() {
    const results = [];

    for (const attr of this.#stateContent) {
      switch (attr) {
        case 'state':
          results.push(this.#hassProvider.getEntityProp(this.#entityId, 'state', true));
          break;
        case 'device_name':
          results.push(this.#hassProvider.getEntityDevice(this.entityId));
          break;
        case 'area_name':
          results.push(this.#hassProvider.getEntityArea(this.#entityId));
          break;
        default:
          results.push(this.#hassProvider.getEntityProp(this.#entityId, attr, true));
          break;
      }
    }

    return results.length !== 0 ? results.join(CARD.config.separator) : '';
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  getEntityType() {
    this.#entityType ??= EntityHelper.#handleRefreshType.has(this.#domain)
      ? this.#domain
      : this.#hassProvider.getEntityProp(this.#entityId, 'device_class') === HA_CONTEXT.entity.type.duration &&
          !this.#attribute
        ? HA_CONTEXT.entity.type.duration
        : HA_CONTEXT.entity.type.default;

    return this.#entityType;
  }

  refresh() {
    this.#isValid = this.#hassProvider.hasEntity(this.#entityId);

    if (!this.#isValid) {
      this.#state = HA_CONTEXT.entity.state.notFound;
      return;
    }

    if (this.#attribute)
      // CF5 - issue (major) resolved - getEntityAttribute returns null (never
      // undefined) when missing, so this check always passed and invalid
      // attributes produced NaN downstream
      this.#isValid = this.#hassProvider.getEntityAttribute(this.#entityId, this.#attribute) !== null;

    this.#state = this.#hassProvider.getEntityProp(this.#entityId, 'state');
    if (!this.isValid || !this.isAvailable) return;

    const type = this.getEntityType();
    const handler =
      EntityHelper.#handleRefreshType.get(type) ?? EntityHelper.#handleRefreshType.get(HA_CONTEXT.entity.type.default);
    handler(this);
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  _manageStdEntity() {
    this.#attribute = this.#attribute || HA_CONTEXT.attributeMapping[this.#domain]?.attribute;
    if (!this.#attribute) {
      this.#value = parseFloat(this.#state) || 0;
      return;
    }

    const attrValue = this.#hassProvider.getEntityAttribute(this.#entityId, this.#attribute);

    if (is.numericString(attrValue) || is.number(attrValue)) {
      this.#value = parseFloat(attrValue);
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
    // eslint-disable-next-line no-useless-assignment
    let [duration, elapsed] = [null, null];
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
        const finished_at = new Date(this.#hassProvider.getEntityProp(this.#entityId, 'finishes_at')).getTime();
        duration = NumberFormatter.convertDuration(this.#hassProvider.getEntityProp(this.#entityId, 'duration'));
        const started_at = finished_at - duration;
        const now = new Date().getTime();
        elapsed = now - started_at;
        break;
      }
      case HA_CONTEXT.entity.state.paused: {
        const remaining = NumberFormatter.convertDuration(
          this.#hassProvider.getEntityProp(this.#entityId, 'remaining'),
        );
        duration = NumberFormatter.convertDuration(this.#hassProvider.getEntityProp(this.#entityId, 'duration'));
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
  _manageCounterAndNumberEntity(min, max) {
    this.#value = {
      current: parseFloat(this.#state),
      min: this.#hassProvider.getEntityAttribute(this.#entityId, min),
      max: this.#hassProvider.getEntityAttribute(this.#entityId, max),
    };
  }
  _manageDurationEntity() {
    const unit = this.#hassProvider.getEntityProp(this.#entityId, 'unit_of_measurement');
    const value = parseFloat(this.#state);
    // CF5 - issue (critical) resolved - getEntityProp returns null (never
    // undefined), so the guard never matched and a missing unit crashed in
    // durationToSeconds
    const seconds = is.nullish(unit) ? null : NumberFormatter.durationToSeconds(value, unit);
    this.#value = seconds ?? 0;
    this.#isValid = seconds !== null;
  }

  #getClimateColor() {
    const climateColorMap = {
      heat_cool: CARD.style.color.active,
      dry: CARD.style.color.climate.dry,
      cool: CARD.style.color.climate.cool,
      heat: CARD.style.color.climate.heat,
      fan_only: CARD.style.color.climate.fanOnly,
    };
    return climateColorMap[this.#state] || CARD.style.color.inactive;
  }

  #getBatteryColor() {
    if (!this.#value || this.#value <= 30) return CARD.style.color.battery.low;
    if (this.#value <= 70) return CARD.style.color.battery.medium;
    return CARD.style.color.battery.high;
  }
}

/******************************************************************************
 * 🛠️ EntityCollectionHelper
 * ============================================================================
 *
 * ✅ Helper class for managing entities collection.
 *
 * @class
 */

class EntityCollectionHelper {
  #entities = [];
  #mode = 'stacked';

  static #numericValue(helper) {
    const value = helper.value;
    return is.number(value) ? value : (value?.current ?? 0);
  }

  // Width/share math always wants a magnitude - a negative raw value must never
  // turn into a negative width (nonsensical for a gradient stop or an arm
  // size).
  static #magnitude(helper) {
    return Math.abs(EntityCollectionHelper.#numericValue(helper));
  }

  // An entity counts as a negative contributor if explicitly marked `subtract`,
  // or if its own raw value is already negative (e.g. a grid-power sensor
  // signed by convention - see the `net` mode note in configuration.md).
  // Checking both - rather than just blindly negating when `subtract` is set -
  // means `subtract: true` on an already-negative value can't double-negate it
  // back to positive.
  static #isNegative(helper) {
    return helper.subtract || EntityCollectionHelper.#numericValue(helper) < 0;
  }

  static #magnitudeSum(entities) {
    return entities.reduce((sum, helper) => sum + EntityCollectionHelper.#magnitude(helper), 0);
  }

  static #splitByNegative(entities) {
    return {
      positive: entities.filter((helper) => !EntityCollectionHelper.#isNegative(helper)),
      negative: entities.filter((helper) => EntityCollectionHelper.#isNegative(helper)),
    };
  }

  set mode(newMode) {
    this.#mode = ['proportional', 'net'].includes(newMode) ? newMode : 'stacked';
  }
  get mode() {
    return this.#mode;
  }

  addEntity(entityId, attribute = null, color = null, subtract = false, isMain = false) {
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
  getTotalValue() {
    return EntityCollectionHelper.#magnitudeSum(this.getAvailableEntities());
  }
  getAvailableEntities() {
    return this.#entities.filter((helper) => helper.isValid && helper.isAvailable);
  }

  // Algebraic total (positive arm's magnitude sum minus negative arm's): 'net'
  // mode's own total, and also what 'stacked'/'proportional' should show as
  // their text/value once center_zero splits them into two arms - a single flat
  // "88%" reading makes no sense once the bar itself is showing two
  // independent, possibly-opposing lengths (see ViewBase).
  getNetValue() {
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
  static #entityColor(helper, index, total, curColor) {
    if (helper.isMain) return curColor;
    if (helper.color) return ThemeManager.adaptColor(helper.color) ?? curColor;
    const whitePercent = Math.round((1 - index / (total - 1 || 1)) * 50); // de 50 → 0
    return `color-mix(in srgb, ${curColor} ${100 - whitePercent}%, black ${whitePercent}%)`;
  }

  getEntitiesColor(curColor, progressRatio = 1, range = 0, isVertical = false) {
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
  getDivergingGradients(curColor, { min, max, zeroValue }, isVertical = false) {
    const available = this.getAvailableEntities();
    if (!available.length || !curColor) return null;

    const build =
      this.#mode === 'stacked' ? EntityCollectionHelper.#stackedGradient : EntityCollectionHelper.#proportionalGradient;
    const arm = (entities, range) => {
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
  static #proportionalGradient(available, curColor, progressRatio, _range, isVertical = false) {
    const total = EntityCollectionHelper.#magnitudeSum(available);
    if (total === 0) return null;

    const shadeTotal = available.filter((helper) => !helper.isMain).length;
    let shadeIndex = 0;
    const gradientStops = [];
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
  static #stackedGradient(available, curColor, progressRatio, range, isVertical = false) {
    if (!range) return null;

    const shadeTotal = available.filter((helper) => !helper.isMain).length;
    let shadeIndex = 0;
    const gradientStops = [];
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

  get count() {
    return this.#entities.length;
  }

  clear() {
    this.#entities = [];
  }
}

/******************************************************************************
 * 🛠️ EntityOrValue
 * ============================================================================
 *
 * ✅ Represents either an entity ID or a direct value. This class validates the
 * provided value and retrieves information from Home Assistant if it's an
 * entity.
 *
 * @class
 */
class EntityOrValue {
  #activeHelper = null;
  #isEntity = false;

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  #entity() {
    return this.#isEntity ? this.#activeHelper : null;
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set value(newValue) {
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

  get value() {
    return this.#activeHelper?.value ?? null;
  }
  get isEntity() {
    return this.#isEntity;
  }
  get isValid() {
    return this.#activeHelper?.isValid ?? false;
  }
  get isAvailable() {
    if (!this.#activeHelper) return false;
    return this.#isEntity ? this.#activeHelper.isAvailable || this.#activeHelper.isValid : this.#activeHelper.isValid;
  }

  get state() {
    return this.#entity()?.state ?? null;
  }
  get precision() {
    return this.#entity()?.precision ?? null;
  }
  get name() {
    return this.#entity()?.name ?? null;
  }
  get nameComposition() {
    return this.#entity()?.nameComposition ?? null;
  }
  get formatedEntityState() {
    return this.#entity()?.formatedEntityState ?? null;
  }
  get stateContent() {
    return this.#entity()?.stateContent ?? null;
  }
  set stateContent(newValue) {
    const entity = this.#entity();
    if (entity) entity.stateContent = newValue;
  }
  get stateContentToString() {
    return this.#entity()?.stateContentToString ?? null;
  }
  get entityType() {
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
  get hasShapeByDefault() {
    return this.#entity()?.hasShapeByDefault ?? false;
  }
  get defaultColor() {
    return this.#entity()?.defaultColor ?? false;
  }
  get hasAttribute() {
    return this.#entity()?.hasAttribute ?? false;
  }
  get defaultAttribute() {
    return this.#entity()?.defaultAttribute ?? null;
  }
  get attributes() {
    return this.#entity()?.attributes ?? null;
  }
  get unit() {
    return this.#entity()?.unit ?? null;
  }
  get stateObj() {
    return this.#entity()?.stateObj ?? null;
  }
  get nameTokens() {
    return this.#entity()?.nameTokens ?? null;
  }
  set nameTokens(tok) {
    const entity = this.#entity();
    if (entity) entity.nameTokens = tok;
  }
  get attribute() {
    return this.#entity()?.attribute ?? null;
  }
  set attribute(newValue) {
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
