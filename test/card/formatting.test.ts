import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { NumberFormatter } from '../../src/card/formatting.js';

describe('formatValueAndUnit - value/decimal formatting', () => {
  test('null/undefined value formats to an empty string', () => {
    assert.equal(NumberFormatter.formatValueAndUnit(null), '');
    assert.equal(NumberFormatter.formatValueAndUnit(undefined), '');
  });

  test('respects the requested decimal precision', () => {
    assert.equal(NumberFormatter.formatValueAndUnit(42.5, 1), '42.5');
    assert.equal(NumberFormatter.formatValueAndUnit(42, 2), '42.00');
  });

  test('locale-aware grouping/decimal separators (de-DE: "." group, "," decimal)', () => {
    assert.equal(NumberFormatter.formatValueAndUnit(1234.5, 1, '', { locale: 'de-DE' }), '1.234,5');
  });

  test('compact notation trims trailing zeros instead of padding to the requested decimal', () => {
    assert.equal(NumberFormatter.formatValueAndUnit(1234, 0, '', { compact: true }), '1K');
  });

  test('sign: true shows +/- but never on exactly zero', () => {
    assert.equal(NumberFormatter.formatValueAndUnit(5, 0, '', { sign: true }), '+5');
    assert.equal(NumberFormatter.formatValueAndUnit(-5, 0, '', { sign: true }), '-5');
    assert.equal(NumberFormatter.formatValueAndUnit(0, 0, '', { sign: true }), '0');
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

  test('the no-space unit set is locale-specific (j is French-only)', () => {
    assert.equal(NumberFormatter.formatValueAndUnit(5, 0, 'j', { locale: 'fr-FR' }), '5j');
    assert.equal(NumberFormatter.formatValueAndUnit(5, 0, 'j', { locale: 'de-DE' }), '5 j');
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
    // 's' isn't in the no-space unit set (only 'ms'/'μs' are) - a real space
    // is expected here, not a typo.
    assert.equal(NumberFormatter.formatTiming(45, 0, { flex: true }), '45 s');
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
    assert.equal(NumberFormatter.convertDuration(undefined), 0);
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
