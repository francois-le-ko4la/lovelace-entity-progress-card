import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PercentHelper } from '../../src/card/progress-calc.js';

describe('percent - plain linear min/max/current', () => {
  test('42 out of 0-100 is 42%', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.current = 42;
    helper.refresh();
    assert.equal(helper.percent, 42);
  });

  test('a non-zero-based range is still linear', () => {
    const helper = new PercentHelper();
    helper.min = 50;
    helper.max = 150;
    helper.current = 92;
    helper.refresh();
    assert.equal(helper.percent, 42);
  });

  test('reversed swaps current for (max - current) before computing percent', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.current = 42;
    helper.isReversed = true;
    helper.refresh();
    assert.equal(helper.percent, 58);
  });

  test('min === max is invalid - percent is null, not NaN', () => {
    const helper = new PercentHelper();
    helper.min = 50;
    helper.max = 50;
    helper.current = 50;
    helper.refresh();
    assert.equal(helper.isValid, false);
    assert.equal(helper.percent, null);
  });
});

describe('percent - log scale', () => {
  test('the geometric midpoint of a 1-100 log range is 50%', () => {
    const helper = new PercentHelper();
    helper.min = 1;
    helper.max = 100;
    helper.scale = 'log';
    helper.current = 10;
    helper.refresh();
    assert.equal(helper.percent, 50);
  });

  test('a value at or below min clamps to 0%, never NaN', () => {
    const helper = new PercentHelper();
    helper.min = 1;
    helper.max = 100;
    helper.scale = 'log';
    helper.current = 0;
    helper.refresh();
    assert.equal(helper.percent, 0);
  });

  test('log scale silently falls back to linear when min is not positive', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.scale = 'log';
    helper.current = 42;
    helper.refresh();
    assert.equal(helper.isLogScale, false);
    assert.equal(helper.percent, 42);
  });
});

describe('percent - center_zero', () => {
  test('above the zero value, percent is measured against (max - zero)', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.isCenterZero = true;
    helper.zeroValue = 50;
    helper.current = 75;
    helper.refresh();
    assert.equal(helper.percent, 50);
  });

  test('below the zero value, percent goes negative, measured against (zero - min)', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.isCenterZero = true;
    helper.zeroValue = 50;
    helper.current = 25;
    helper.refresh();
    assert.equal(helper.percent, -50);
  });

  test('growthPercentValue is the % change relative to the zero value, not the bar percent', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.isCenterZero = true;
    helper.zeroValue = 50;
    helper.current = 75;
    helper.refresh();
    assert.equal(helper.growthPercentValue, 50);
  });

  test('growthPercentValue falls back to percent when zeroValue is 0 (division would be undefined)', () => {
    const helper = new PercentHelper();
    helper.min = -100;
    helper.max = 100;
    helper.isCenterZero = true;
    helper.zeroValue = 0;
    helper.current = 50;
    helper.refresh();
    assert.equal(helper.growthPercentValue, helper.percent);
  });

  test('calcWatermark halves the raw percent and re-centers it around 50', () => {
    // Asymmetric range (zero at 20, not the midpoint) so the halving/
    // re-centering math can't be mistaken for a coincidental 1:1 mapping.
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.isCenterZero = true;
    helper.zeroValue = 20;
    assert.equal(helper.calcWatermark(60), 75); // +50% of the upper half (20-100) -> 50+50/2
  });
});

describe('calcWatermark - non-center_zero, plain projection onto the bar scale', () => {
  test('projects a raw value onto the 0-100 bar scale like percent would', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    assert.equal(helper.calcWatermark(20), 20);
  });

  test('accepts the {current} value-object shape used by entity-sourced watermarks', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    assert.equal(helper.calcWatermark({ current: 20 }), 20);
  });
});
