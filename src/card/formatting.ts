/*
 * NumberFormatter: locale-aware value/unit and duration/timer formatting.
 * Static utility, no state.
 */

import { CARD } from '../utils/parameters.js';
import { has, is } from '../utils/common-checks.js';

// A superset of Home Assistant's blank_before_percent.ts, whose own comment
// cites Wikipedia rather than locale data: its six are all confirmed by CLDR,
// but CLDR spaces ten more of the languages this card ships. Added only where
// unitDisplay short, narrow and style: 'percent' agree, so the card is never
// in contradiction with a native tile - only ahead of it.
const PERCENT_SPACED_LANGUAGES = new Set(
  // Home Assistant's own six first, then the ten CLDR adds.
  'cs de fi fr sk sv ca da es hr lt mk nb ro ru sl'.split(' '),
);
// Latin American Spanish glues the percent sign where es-ES spaces it, so the
// full tag is read before the base language it would otherwise fall back to.
const PERCENT_GLUED_LOCALES = new Set(['es-419']);
// The one place this card diverges from HA's blank_before_unit.ts: a duration
// stays compact, so a timer on a bar reads 1h23min and not 1 h 23 min.
const DURATION_UNITS = new Set(['j', 'd', 'h', 'min', 's', 'ms', 'μs']);

// Intl's compact notation abbreviates the WORD for a magnitude, per locale -
// 'тыс.' in Russian, 'tis.' in Czech, 'K' (kelvin's letter) in English. Only
// 3 of this card's 39 languages yield the SI 'k'. So a value carrying a unit
// is scaled here instead: SI prefixes are spelled the same in every language,
// and 1500 W is meant to read 1.5 kW, not 1.5 thousand W.
const SI_PREFIXES: readonly (readonly [string, number])[] = [
  ['T', 12],
  ['G', 9],
  ['M', 6],
  ['k', 3],
  ['', 0],
  ['m', -3],
];
// An allow list, never a generic parse: prefixing is wrong for m² and m³
// (km³ is 10⁹ m³, not 10³), meaningless for %, °C and ppm, and hPa's hecto
// is not a power of 1000. Only units that genuinely swing across decades.
// Three significant digits on a compacted mantissa, the most a bar can carry
// without the compaction losing its point.
const SIGNIFICANT_CAP = 2;
const SI_PREFIXABLE_UNITS = new Set(['W', 'Wh', 'VA', 'var', 'J', 'Hz', 'B', 'bit', 'A', 'V', 'Ω', 'Pa']);

/** Splits 'kWh' into its base and the exponent it already carries. */
const splitPrefixedUnit = (unit: string): { base: string; exponent: number } | null => {
  for (const [prefix, exponent] of SI_PREFIXES) {
    if (prefix && unit.startsWith(prefix) && SI_PREFIXABLE_UNITS.has(unit.slice(prefix.length))) {
      return { base: unit.slice(prefix.length), exponent };
    }
  }
  return SI_PREFIXABLE_UNITS.has(unit) ? { base: unit, exponent: 0 } : null;
};

const NumberFormatter = {
  // Keyed on the interface language, never on the number format: how a unit is
  // spaced is a typographic convention, unrelated to 1,234.56 vs 1 234,56.
  /**
   * Re-expresses a value on the SI scale that keeps its mantissa readable -
   * 1500 W as 1.5 kW, 0.5 W as 500 mW. null when the unit cannot take a
   * prefix, when there is none, or at zero, where no scale applies.
   */
  scaleToSiPrefix(value: number, unit: string): { value: number; unit: string } | null {
    const parsed = unit ? splitPrefixedUnit(unit) : null;
    if (parsed === null || value === 0 || !Number.isFinite(value)) return null;
    const magnitude = parsed.exponent + Math.log10(Math.abs(value));
    const lowest = SI_PREFIXES[SI_PREFIXES.length - 1][1];
    const highest = SI_PREFIXES[0][1];
    const step = Math.max(lowest, Math.min(highest, Math.floor(magnitude / 3) * 3));
    const prefix = SI_PREFIXES.find(([, exponent]) => exponent === step)?.[0] ?? '';
    return { value: value * 10 ** (parsed.exponent - step), unit: `${prefix}${parsed.base}` };
  },

  getSpaceCharacter(language: string, unit: string): string {
    // Case-sensitive: lowercasing collided the duration symbols with the SI
    // ones a capital tells apart - J joule with j day, S siemens with s, H
    // henry with h. Every duration symbol is lowercase already.
    if (DURATION_UNITS.has(unit) || unit === '°') return '';
    if (unit === '%') {
      if (PERCENT_GLUED_LOCALES.has(language)) return '';
      return PERCENT_SPACED_LANGUAGES.has(language.split('-')[0].toLowerCase()) ? CARD.config.unit.space : '';
    }
    return CARD.config.unit.space;
  },

  formatValueAndUnit(
    value: number | null | undefined,
    decimal = 2,
    unit = '',
    {
      locale = 'en-US',
      language = 'en',
      unitSpacing = CARD.config.unit.unitSpacing.auto,
      compact = false,
      sign = false,
      unitPosition = CARD.config.unit.unitPosition.after,
    }: {
      locale?: string;
      language?: string;
      unitSpacing?: string;
      compact?: boolean;
      sign?: boolean;
      unitPosition?: string;
    } = {},
  ): string {
    if (is.nullish(value)) return '';

    // Compact with a prefixable unit moves the scale into the unit itself and
    // leaves the number plain; everything else keeps Intl's own notation.
    const scaled = compact ? NumberFormatter.scaleToSiPrefix(value, unit) : null;
    const shownValue = scaled?.value ?? value;
    const shownUnit = scaled?.unit ?? unit;
    // A unit that cannot take a prefix gets no abbreviation either: Intl's
    // suffix is a word in most locales, and '1,6 k m³' is worse than '1600 m³'.
    const abbreviate = compact && scaled === null && !unit;
    // decimal is the precision of the raw value, where 1600 needs none, and a
    // compaction takes three significant digits away from it. Three are handed
    // back on the mantissa - 1650 W reads 1.65 kW, not 1.7 kW - rather than
    // every digit, which would make 1234567 W a longer 1.234567 MW. Trailing
    // zeros are trimmed after, so 1600 W stays 1.6 kW.
    const rescaled = abbreviate || (scaled !== null && scaled.unit !== unit);
    const mantissa = abbreviate
      ? shownValue / 10 ** (3 * Math.floor(Math.log10(Math.abs(shownValue)) / 3))
      : shownValue;
    const significant = rescaled && mantissa !== 0 ? 2 - Math.floor(Math.log10(Math.abs(mantissa))) : 0;
    const shownDecimal = Math.max(decimal, Math.min(SIGNIFICANT_CAP, significant));
    // notation: 'compact' trims its own trailing zeros - forcing
    // minimumFractionDigits here would turn "1.2k" back into "1.20k". The SI
    // path wants the same trimming, so it shares the branch.
    const formattedValue = new Intl.NumberFormat(locale, {
      ...(compact
        ? {
            ...(abbreviate ? { notation: 'compact' as const } : {}),
            minimumFractionDigits: 0,
            maximumFractionDigits: shownDecimal,
          }
        : { minimumFractionDigits: decimal, maximumFractionDigits: decimal, useGrouping: locale !== 'en' }),
      ...(sign ? { signDisplay: 'exceptZero' } : {}),
    }).format(shownValue);

    if (!shownUnit) return formattedValue;

    // Keyed off the table, not literals: its values are what the schema
    // validates (UNIT_SPACINGS), so a rename can't leave one unmapped here.
    const spacing = CARD.config.unit.unitSpacing;
    const spaceMap: Record<string, string | (() => string)> = {
      [spacing.space]: CARD.config.unit.space,
      [spacing.noSpace]: '',
      [spacing.auto]: () => NumberFormatter.getSpaceCharacter(language, shownUnit),
    };
    const space = has.method(spaceMap, unitSpacing)
      ? (spaceMap[unitSpacing] as () => string)()
      : (spaceMap[unitSpacing] as string);

    return unitPosition === CARD.config.unit.unitPosition.before
      ? `${shownUnit}${space}${formattedValue}`
      : `${formattedValue}${space}${shownUnit}`;
  },

  formatTiming(
    totalSeconds: number,
    decimal = 0,
    {
      locale = 'en-US',
      language = 'en',
      flex = false,
      unitSpacing = CARD.config.unit.unitSpacing.auto,
    }: { locale?: string; language?: string; flex?: boolean; unitSpacing?: string } = {},
  ): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    // Truncated, not rounded: hours/minutes above already floor, so a
    // rounding seconds component (toFixed rounds to nearest) disagreed with
    // them - e.g. 332.847s (5m32.847s truly elapsed) floors minutes to 5 but
    // rounded seconds to "33", showing "05:33" up to ~500ms before the true
    // 33rd second. A countdown should never show a value before it's
    // actually reached - a small epsilon guards against float precision
    // (332.847 * 1 landing on 32.99999999996 instead of 33).
    const secondsFactor = 10 ** decimal;
    let seconds: string = (Math.floor((totalSeconds % 60) * secondsFactor + 1e-9) / secondsFactor).toFixed(decimal);

    const pad = (value: string | number, length = 2) => String(value).padStart(length, '0');

    const [intPart, decimalPart] = seconds.split('.');
    seconds = decimalPart !== undefined ? `${pad(intPart)}.${decimalPart}` : pad(seconds);

    if (flex) {
      if (totalSeconds < 60)
        return NumberFormatter.formatValueAndUnit(parseFloat(seconds), decimal, 's', { locale, language, unitSpacing });
      if (totalSeconds < 3600) return `${pad(minutes)}:${seconds}`;
    }

    return [pad(hours), pad(minutes), seconds].join(':');
  },

  durationToSeconds(value: number, unit: string): number | null {
    // Own property only: `unit` comes from an integration's own
    // unit_of_measurement, and a prototype key ('constructor') would otherwise
    // resolve to a function and turn the result into NaN instead of null.
    const factor = has.own(CARD.config.duration.secondsPerUnit, unit)
      ? CARD.config.duration.secondsPerUnit[unit]
      : undefined;
    // CF5 - issue (critical) resolved - unknown/missing unit threw and crashed
    // the card; return null so the caller can flag the entity as invalid
    return factor === undefined ? null : value * factor;
  },

  convertDuration(duration: unknown): number {
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
  },
};

export { NumberFormatter };
