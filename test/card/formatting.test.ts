import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { NumberFormatter } from '../../src/card/formatting.js';
import { TRANSLATIONS_CARD } from '../../src/utils/translations.js';

describe('formatValueAndUnit - value/decimal formatting', () => {
  test('null/undefined value formats to an empty string', () => {
    const missing = undefined;
    assert.equal(NumberFormatter.formatValueAndUnit(null), '');
    assert.equal(NumberFormatter.formatValueAndUnit(missing), '');
  });

  test('respects the requested decimal precision', () => {
    assert.equal(NumberFormatter.formatValueAndUnit(42.5, 1), '42.5');
    assert.equal(NumberFormatter.formatValueAndUnit(42, 2), '42.00');
  });

  test('locale-aware grouping/decimal separators (de-DE: "." group, "," decimal)', () => {
    assert.equal(NumberFormatter.formatValueAndUnit(1234.5, 1, '', { locale: 'de-DE' }), '1.234,5');
  });

  test('compact notation trims trailing zeros instead of padding to the requested decimal', () => {
    assert.equal(NumberFormatter.formatValueAndUnit(1000, 0, '', { compact: true }), '1K');
  });

  test('a compacted mantissa carries three significant digits', () => {
    // decimal describes the raw value, where 1234 needs none. Compacting takes
    // three significant digits away, so 1K would be all that is left of it.
    const compact = (value: number, decimal = 0) =>
      NumberFormatter.formatValueAndUnit(value, decimal, '', { compact: true });
    assert.equal(compact(1234), '1.23K');
    assert.equal(compact(1650), '1.65K');
    assert.equal(compact(12340), '12.3K');
    assert.equal(compact(123400), '123K');
    // Three significant, never three decimal: the point is to stay short.
    assert.equal(compact(1234567), '1.23M');
    // An explicit decimal still wins when it asks for more.
    assert.equal(compact(1655, 3), '1.655K');
    // Nothing was scaled here, so the requested precision stands.
    assert.equal(compact(999), '999');
  });

  test('sign: true shows +/- but never on exactly zero', () => {
    assert.equal(NumberFormatter.formatValueAndUnit(5, 0, '', { sign: true }), '+5');
    assert.equal(NumberFormatter.formatValueAndUnit(-5, 0, '', { sign: true }), '-5');
    assert.equal(NumberFormatter.formatValueAndUnit(0, 0, '', { sign: true }), '0');
  });
});

// A sensor that reads 25 W in the morning and 1500 W at night cannot be served
// by Home Assistant's own per-entity unit choice, which is fixed. Intl's
// compact suffix is no help either: it abbreviates the WORD for a magnitude.
describe('formatValueAndUnit - compact scales a prefixable unit, not the number', () => {
  const compact = (value: number, unit: string, decimal = 1) =>
    NumberFormatter.formatValueAndUnit(value, decimal, unit, { locale: 'en-US', language: 'en', compact: true });

  test('the scale moves into the unit', () => {
    assert.equal(compact(25, 'W'), '25 W');
    assert.equal(compact(1500, 'W'), '1.5 kW');
    assert.equal(compact(1500000, 'W'), '1.5 MW');
  });

  test('the scaled mantissa keeps three significant digits', () => {
    // decimal 0 throughout: the raw watt reading needs no fraction of its own.
    assert.equal(compact(1650, 'W', 0), '1.65 kW');
    assert.equal(compact(1655, 'W', 0), '1.66 kW');
    assert.equal(compact(12340, 'W', 0), '12.3 kW');
    assert.equal(compact(123400, 'W', 0), '123 kW');
    assert.equal(compact(1234567, 'W', 0), '1.23 MW');
    // A trailing zero is still trimmed.
    assert.equal(compact(1000, 'W', 0), '1 kW');
    // An explicit decimal asking for more still wins over the cap.
    assert.equal(compact(123400, 'W', 1), '123.4 kW');
  });

  test('below the unit it goes down, not into decimals', () => {
    assert.equal(compact(0.5, 'W'), '500 mW');
  });

  test('a prefix already on the unit is carried, never doubled', () => {
    assert.equal(compact(1500, 'kW'), '1.5 MW');
    assert.equal(compact(1500, 'kWh'), '1.5 MWh');
  });

  test('zero has no scale', () => {
    assert.equal(compact(0, 'W'), '0 W');
  });

  test('a unit that cannot take a prefix is left alone, number included', () => {
    // km³ is 10⁹ m³ and hecto is not a power of 1000, so neither the unit nor
    // the number is abbreviated - '1.6k m³' would be worse than '1,600 m³'.
    for (const unit of ['m³', 'm²', '°C', 'ppm', 'hPa']) {
      assert.equal(compact(1600, unit), `1,600 ${unit}`);
    }
    // Same rule; the percent sign just carries no space in English.
    assert.equal(compact(1600, '%'), '1,600%');
  });

  test('without a unit, Intl keeps its own abbreviation', () => {
    assert.equal(compact(1600, ''), '1.6K');
  });

  test('the SI prefix is the same in every language', () => {
    for (const [language, locale] of [
      ['fr', 'fr-FR'],
      ['de', 'de-DE'],
      ['ru', 'ru-RU'],
      ['ro', 'ro-RO'],
    ] as [string, string][]) {
      const formatted = NumberFormatter.formatValueAndUnit(1600, 1, 'W', { locale, language, compact: true });
      assert.ok(formatted.endsWith('kW'), `${language} produced ${formatted}`);
    }
  });

  test('sign and unit position survive the scaling', () => {
    const options = { locale: 'en-US', language: 'en', compact: true };
    assert.equal(NumberFormatter.formatValueAndUnit(-1500, 1, 'W', { ...options, sign: true }), '-1.5 kW');
    assert.equal(NumberFormatter.formatValueAndUnit(1500, 1, 'W', { ...options, unitPosition: 'before' }), 'kW 1.5');
  });
});

describe('formatValueAndUnit - unit spacing/position', () => {
  test('a unit in the no-space set (e.g. %) sticks to the value by default', () => {
    assert.equal(NumberFormatter.formatValueAndUnit(42, 0, '%'), '42%');
  });

  test('a unit outside the no-space set gets a space by default', () => {
    assert.equal(NumberFormatter.formatValueAndUnit(42, 0, 'kWh'), '42 kWh');
  });

  test('unitSpacing: no-space overrides auto even for a spaced unit', () => {
    assert.equal(NumberFormatter.formatValueAndUnit(42, 0, 'kWh', { unitSpacing: 'no-space' }), '42kWh');
  });

  test('unitSpacing: space overrides auto even for a no-space unit', () => {
    assert.equal(NumberFormatter.formatValueAndUnit(42, 0, '%', { unitSpacing: 'space' }), '42 %');
  });

  test('unitPosition: before puts the unit ahead of the value', () => {
    assert.equal(NumberFormatter.formatValueAndUnit(42, 0, '$', { unitPosition: 'before' }), '$ 42');
  });

  test('unitPosition: before still honours the spacing rule', () => {
    assert.equal(NumberFormatter.formatValueAndUnit(42, 0, '%', { unitPosition: 'before', language: 'fr' }), '% 42');
  });
});

// Home Assistant's blank_before_unit.ts, which the card now mirrors so a bar
// reads like the tile beside it - plus this project's own duration exception.
describe('formatValueAndUnit - auto spacing follows the language, not the number format', () => {
  const auto = (unit: string, language?: string) =>
    NumberFormatter.formatValueAndUnit(42, 0, unit, language === undefined ? {} : { language });

  test("% takes a space in HA's own six", () => {
    for (const language of ['cs', 'de', 'fi', 'fr', 'sk', 'sv']) {
      assert.equal(auto('%', language), '42 %', `${language} should space the percent sign`);
    }
  });

  // HA's list comes from a Wikipedia article; these ten are what CLDR adds,
  // agreed by unitDisplay short, narrow and style: 'percent' alike.
  test('% takes a space in the ten CLDR adds on top', () => {
    for (const language of ['ca', 'da', 'es', 'hr', 'lt', 'mk', 'nb', 'ro', 'ru', 'sl']) {
      assert.equal(auto('%', language), '42 %', `${language} should space the percent sign`);
    }
  });

  test('% sticks to the value everywhere else', () => {
    for (const language of ['en', 'it', 'pt', 'nl', 'pl', 'ja', 'zh-Hans', 'tr', 'el']) {
      assert.equal(auto('%', language), '42%', `${language} should not space the percent sign`);
    }
  });

  test('a regional tag resolves to its base language', () => {
    assert.equal(auto('%', 'fr-CA'), '42 %');
    assert.equal(auto('%', 'en-GB'), '42%');
  });

  test('the degree sign never takes a space, whatever the language', () => {
    assert.equal(auto('°', 'fr'), '42°');
    assert.equal(auto('°', 'en'), '42°');
  });

  test('every other unit takes a space, in every language', () => {
    for (const language of ['en', 'fr', 'ja']) {
      assert.equal(auto('kWh', language), '42 kWh');
      assert.equal(auto('°C', language), '42 °C');
    }
  });

  test('a capital SI symbol is not mistaken for a duration', () => {
    // J joule vs j day, S siemens vs s second, H henry vs h hour, D darcy.
    for (const unit of ['J', 'S', 'H', 'D']) {
      assert.equal(auto(unit, 'en'), `42 ${unit}`, `${unit} is an SI symbol, not a duration`);
    }
  });

  test('a duration stays compact - the one divergence from HA', () => {
    for (const unit of ['d', 'h', 'min', 's', 'ms', 'μs']) {
      assert.equal(auto(unit, 'fr'), `42${unit}`, `${unit} should stay glued to the value`);
      assert.equal(auto(unit, 'en'), `42${unit}`, `${unit} should stay glued to the value`);
    }
  });

  test('the number format no longer decides the spacing', () => {
    // A French user on a US number format still reads "42 %".
    const formatted = NumberFormatter.formatValueAndUnit(42, 0, '%', { locale: 'en-US', language: 'fr' });
    assert.equal(formatted, '42 %');
  });
});

// The whole shipped language set, read from the generated table rather than
// retyped, so a new language joins this battery on its own.
describe('unit spacing - every shipped language, against CLDR', () => {
  const LANGUAGES = Object.keys(TRANSLATIONS_CARD);
  const spaced = (language: string, unit: string) => NumberFormatter.getSpaceCharacter(language, unit) !== '';

  // What CLDR thinks, or null when it has no opinion: the unit is outside
  // Intl's sanctioned list, or it renders as a word ('45 deg') whose spacing
  // says nothing about the symbol's.
  const INTL_UNIT: Record<string, string> = { '%': 'percent', '°C': 'celsius', '°': 'degree', kg: 'kilogram' };
  const cldrSpaces = (language: string, unit: string): boolean | null => {
    const id = INTL_UNIT[unit];
    if (!id) return null;
    const votes: boolean[] = [];
    for (const unitDisplay of ['short', 'narrow'] as const) {
      try {
        const parts = new Intl.NumberFormat(language, { style: 'unit', unit: id, unitDisplay }).formatToParts(1);
        if (parts.some((part) => part.type === 'unit' && part.value.length > 2)) continue;
        votes.push(parts.some((part) => part.type === 'literal' && /[\s\u00a0\u202f]/.test(part.value)));
      } catch {
        return null;
      }
    }
    if (votes.length === 0) return null;
    if (votes.every(Boolean)) return true;
    return votes.some(Boolean) ? null : false;
  };

  test('all 39 languages are covered', () => {
    assert.equal(LANGUAGES.length, 39);
  });

  test('% splits the set, and agrees with CLDR in every single language', () => {
    // The one unit whose spacing genuinely varies, and the one this card shows
    // most. A failure here means CLDR moved: update the list, do not relax it.
    const disagreeing = LANGUAGES.filter((language) => {
      const theirs = cldrSpaces(language, '%');
      return theirs !== null && theirs !== spaced(language, '%');
    });
    assert.deepEqual(disagreeing, []);
    // And it really is a split, not a constant dressed up as one.
    assert.ok(LANGUAGES.some((l) => spaced(l, '%')) && LANGUAGES.some((l) => !spaced(l, '%')));
  });

  test('W and m³ take a space everywhere - CLDR has no opinion on either', () => {
    for (const unit of ['W', 'm³']) {
      for (const language of LANGUAGES) {
        assert.ok(spaced(language, unit), `${language} should space ${unit}`);
        assert.equal(cldrSpaces(language, unit), null, `${unit} is not an Intl unit`);
      }
    }
  });

  test('° never takes a space, whatever CLDR says', () => {
    // SI's own and only exception (plane angle), and Home Assistant hardcodes
    // it the same way. CLDR spaces it in a few locales; we do not follow it
    // there - 45° is what every one of them actually writes.
    for (const language of LANGUAGES) {
      assert.equal(spaced(language, '°'), false, `${language} should glue the degree sign`);
    }
  });

  test('°C and kg always take a space, SI rather than local usage', () => {
    // CLDR glues °C in about half the set (English among them) and kg in
    // Korean; SI spaces both in every language, and so does a native tile.
    for (const unit of ['°C', 'kg']) {
      for (const language of LANGUAGES) {
        assert.ok(spaced(language, unit), `${language} should space ${unit}`);
      }
    }
  });

  test('es-419 glues the percent sign where es-ES spaces it', () => {
    assert.equal(spaced('es', '%'), true);
    assert.equal(spaced('es-419', '%'), false);
  });
});

describe('formatTiming - HH:MM:SS / flex countdown display', () => {
  test('formats a plain duration as HH:MM:SS', () => {
    assert.equal(NumberFormatter.formatTiming(3661), '01:01:01');
  });

  test('a fractional seconds part is padded and appended after the decimal point', () => {
    assert.equal(NumberFormatter.formatTiming(65.847, 1), '00:01:05.8');
  });

  test('seconds are truncated, never rounded up past the true elapsed second', () => {
    // 332.847s truly elapsed = 5m32.847s - rounding would show "05:33" up to
    // ~150ms before the 33rd second is actually reached.
    assert.equal(NumberFormatter.formatTiming(332.847), '00:05:32');
  });

  test('flex mode under 60s shows just the seconds, via formatValueAndUnit', () => {
    // Glued, like every other duration: 's' used to be the odd one out next to
    // 'ms' and 'μs', which were.
    assert.equal(NumberFormatter.formatTiming(45, 0, { flex: true }), '45s');
  });

  test('flex mode between 1 minute and 1 hour drops the hours prefix', () => {
    assert.equal(NumberFormatter.formatTiming(125, 0, { flex: true }), '02:05');
  });

  test('flex mode at 1 hour or more falls back to the full HH:MM:SS form', () => {
    assert.equal(NumberFormatter.formatTiming(3661, 0, { flex: true }), '01:01:01');
  });
});

describe('durationToSeconds - unit conversion, or null for an unknown unit', () => {
  test('converts every known unit to seconds', () => {
    assert.equal(NumberFormatter.durationToSeconds(1, 'd'), 86400);
    assert.equal(NumberFormatter.durationToSeconds(1, 'h'), 3600);
    assert.equal(NumberFormatter.durationToSeconds(1, 'min'), 60);
    assert.equal(NumberFormatter.durationToSeconds(1, 's'), 1);
    assert.equal(NumberFormatter.durationToSeconds(1, 'ms'), 0.001);
    assert.equal(NumberFormatter.durationToSeconds(1, 'μs'), 0.000001);
  });

  test('an unknown unit returns null instead of throwing (a missing entity unit must not crash the card)', () => {
    assert.equal(NumberFormatter.durationToSeconds(1, 'not-a-unit'), null);
  });
});

describe('convertDuration - HA timer duration/remaining attribute strings', () => {
  test('a non-string value (e.g. during HA startup) is treated as 0, not a crash', () => {
    const missing = undefined;
    assert.equal(NumberFormatter.convertDuration(missing), 0);
    assert.equal(NumberFormatter.convertDuration(null), 0);
  });

  test('parses a plain H:MM:SS string to milliseconds', () => {
    assert.equal(NumberFormatter.convertDuration('1:02:03'), (1 * 3600 + 2 * 60 + 3) * 1000);
  });

  test('parses the "N day(s), H:MM:SS" form Python timedelta uses past 24h', () => {
    assert.equal(NumberFormatter.convertDuration('2 days, 3:04:05'), ((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000);
    assert.equal(NumberFormatter.convertDuration('1 day, 0:00:00'), 24 * 3600 * 1000);
  });

  test('a malformed remainder returns 0 instead of propagating NaN', () => {
    assert.equal(NumberFormatter.convertDuration('not-a-duration'), 0);
    assert.equal(NumberFormatter.convertDuration('1:02'), 0);
  });
});
