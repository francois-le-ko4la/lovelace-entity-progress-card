/*
 * NumberFormatter: locale-aware value/unit and duration/timer formatting.
 * Static utility, no state.
 */

import { CARD } from '../utils/parameters.js';
import { has, is } from '../utils/common-checks.js';

/**
 * class for formatting value && unit.
 *
 * This class uses `Value`, `Unit`, and `Decimal` objects to manage and validate
 * its internal data.
 */
const NumberFormatter = {
  unitsNoSpace: {
    'fr-FR': new Set(['j', 'd', 'h', 'min', 'ms', 'μs', '°']),
    'de-DE': new Set(['d', 'h', 'min', 'ms', 'μs', '°']),
    'en-US': new Set(['d', 'h', 'min', 'ms', 'μs', '°', '%']),
  } as Record<string, Set<string>>,

  getSpaceCharacter(locale: string, unit: string): string {
    const set = NumberFormatter.unitsNoSpace[locale] || NumberFormatter.unitsNoSpace['en-US'];
    return set.has(unit.toLowerCase()) ? '' : CARD.config.unit.space;
  },

  formatValueAndUnit(
    value: number | null | undefined,
    decimal = 2,
    unit = '',
    locale = 'en-US',
    unitSpacing: string = CARD.config.unit.unitSpacing.auto,
    compact = false,
    sign = false,
    unitPosition: string = CARD.config.unit.unitPosition.after,
  ): string {
    if (is.nullish(value)) return '';

    // notation: 'compact' trims its own trailing zeros - forcing
    // minimumFractionDigits here would turn "1.2k" back into "1.20k".
    const formattedValue = new Intl.NumberFormat(locale, {
      ...(compact
        ? { notation: 'compact', minimumFractionDigits: 0, maximumFractionDigits: decimal }
        : { minimumFractionDigits: decimal, maximumFractionDigits: decimal, useGrouping: locale !== 'en' }),
      ...(sign ? { signDisplay: 'exceptZero' } : {}),
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

    return unitPosition === CARD.config.unit.unitPosition.before
      ? `${unit}${space}${formattedValue}`
      : `${formattedValue}${space}${unit}`;
  },

  formatTiming(
    totalSeconds: number,
    decimal = 0,
    locale = 'en-US',
    flex = false,
    unitSpacing: string = CARD.config.unit.unitSpacing.auto,
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
        return NumberFormatter.formatValueAndUnit(parseFloat(seconds), decimal, 's', locale, unitSpacing);
      if (totalSeconds < 3600) return `${pad(minutes)}:${seconds}`;
    }

    return [pad(hours), pad(minutes), seconds].join(':');
  },

  durationToSeconds(value: number, unit: string): number | null {
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
