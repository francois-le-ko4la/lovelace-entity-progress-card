import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PercentHelper } from '../../src/card/progress-calc.js';

describe('percent - plain linear min/max/current', () => {
  test('42 out of 0-100 is 42%', () => {
    const p = new PercentHelper();
    p.min = 0;
    p.max = 100;
    p.current = 42;
    p.refresh();
    assert.equal(p.percent, 42);
  });

  test('a non-zero-based range is still linear', () => {
    const p = new PercentHelper();
    p.min = 50;
    p.max = 150;
    p.current = 92;
    p.refresh();
    assert.equal(p.percent, 42);
  });

  test('reversed swaps current for (max - current) before computing percent', () => {
    const p = new PercentHelper();
    p.min = 0;
    p.max = 100;
    p.current = 42;
    p.isReversed = true;
    p.refresh();
    assert.equal(p.percent, 58);
  });

  test('min === max is invalid - percent is null, not NaN', () => {
    const p = new PercentHelper();
    p.min = 50;
    p.max = 50;
    p.current = 50;
    p.refresh();
    assert.equal(p.isValid, false);
    assert.equal(p.percent, null);
  });
});

describe('percent - log scale', () => {
  test('the geometric midpoint of a 1-100 log range is 50%', () => {
    const p = new PercentHelper();
    p.min = 1;
    p.max = 100;
    p.scale = 'log';
    p.current = 10;
    p.refresh();
    assert.equal(p.percent, 50);
  });

  test('a value at or below min clamps to 0%, never NaN', () => {
    const p = new PercentHelper();
    p.min = 1;
    p.max = 100;
    p.scale = 'log';
    p.current = 0;
    p.refresh();
    assert.equal(p.percent, 0);
  });

  test('log scale silently falls back to linear when min is not positive', () => {
    const p = new PercentHelper();
    p.min = 0;
    p.max = 100;
    p.scale = 'log';
    p.current = 42;
    p.refresh();
    assert.equal(p.isLogScale, false);
    assert.equal(p.percent, 42);
  });
});

describe('percent - center_zero', () => {
  test('above the zero value, percent is measured against (max - zero)', () => {
    const p = new PercentHelper();
    p.min = 0;
    p.max = 100;
    p.isCenterZero = true;
    p.zeroValue = 50;
    p.current = 75;
    p.refresh();
    assert.equal(p.percent, 50);
  });

  test('below the zero value, percent goes negative, measured against (zero - min)', () => {
    const p = new PercentHelper();
    p.min = 0;
    p.max = 100;
    p.isCenterZero = true;
    p.zeroValue = 50;
    p.current = 25;
    p.refresh();
    assert.equal(p.percent, -50);
  });

  test('growthPercentValue is the % change relative to the zero value, not the bar percent', () => {
    const p = new PercentHelper();
    p.min = 0;
    p.max = 100;
    p.isCenterZero = true;
    p.zeroValue = 50;
    p.current = 75;
    p.refresh();
    assert.equal(p.growthPercentValue, 50);
  });

  test('growthPercentValue falls back to percent when zeroValue is 0 (division would be undefined)', () => {
    const p = new PercentHelper();
    p.min = -100;
    p.max = 100;
    p.isCenterZero = true;
    p.zeroValue = 0;
    p.current = 50;
    p.refresh();
    assert.equal(p.growthPercentValue, p.percent);
  });

  test('calcWatermark halves the raw percent and re-centers it around 50', () => {
    // Asymmetric range (zero at 20, not the midpoint) so the halving/
    // re-centering math can't be mistaken for a coincidental 1:1 mapping.
    const p = new PercentHelper();
    p.min = 0;
    p.max = 100;
    p.isCenterZero = true;
    p.zeroValue = 20;
    assert.equal(p.calcWatermark(60), 75); // +50% of the upper half (20-100) -> 50+50/2
  });
});

describe('calcWatermark - non-center_zero, plain projection onto the bar scale', () => {
  test('projects a raw value onto the 0-100 bar scale like percent would', () => {
    const p = new PercentHelper();
    p.min = 0;
    p.max = 100;
    assert.equal(p.calcWatermark(20), 20);
  });

  test('accepts the {current} value-object shape used by entity-sourced watermarks', () => {
    const p = new PercentHelper();
    p.min = 0;
    p.max = 100;
    assert.equal(p.calcWatermark({ current: 20 }), 20);
  });
});
