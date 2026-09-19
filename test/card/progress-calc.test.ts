import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PercentHelper } from '../../src/card/progress-calc.js';

describe('percent - plain linear min/max/current', () => {
  test('42 out of 0-100 is 42%', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.current = 42;
    assert.equal(helper.percent, 42);
  });

  test('a non-zero-based range is still linear', () => {
    const helper = new PercentHelper();
    helper.min = 50;
    helper.max = 150;
    helper.current = 92;
    assert.equal(helper.percent, 42);
  });

  test('reversed swaps current for (max - current) before computing percent', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.current = 42;
    helper.isReversed = true;
    assert.equal(helper.percent, 58);
  });

  test('min === max is invalid - percent is null, not NaN', () => {
    const helper = new PercentHelper();
    helper.min = 50;
    helper.max = 50;
    helper.current = 50;
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
    assert.equal(helper.percent, 50);
  });

  test('a value at or below min clamps to 0%, never NaN', () => {
    const helper = new PercentHelper();
    helper.min = 1;
    helper.max = 100;
    helper.scale = 'log';
    helper.current = 0;
    assert.equal(helper.percent, 0);
  });

  test('log scale silently falls back to linear when min is not positive', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.scale = 'log';
    helper.current = 42;
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
    assert.equal(helper.percent, 50);
  });

  test('below the zero value, percent goes negative, measured against (zero - min)', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.isCenterZero = true;
    helper.zeroValue = 50;
    helper.current = 25;
    assert.equal(helper.percent, -50);
  });

  test('growthPercentValue is the % change relative to the zero value, not the bar percent', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.isCenterZero = true;
    helper.zeroValue = 50;
    helper.current = 75;
    assert.equal(helper.growthPercentValue, 50);
  });

  test('growthPercentValue falls back to percent when zeroValue is 0 (division would be undefined)', () => {
    const helper = new PercentHelper();
    helper.min = -100;
    helper.max = 100;
    helper.isCenterZero = true;
    helper.zeroValue = 0;
    helper.current = 50;
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

/*
 * Characterisation tests: everything below freezes behaviour that nothing
 * else asserts, ahead of splitting this class into a pure math core, an
 * orchestrator and a formatter. They describe what the class does today -
 * corners included - so the split can be proven to change nothing.
 */

describe('decimal - how the percent is rounded', () => {
  test('defaults to 0 decimals, so a third of the range reads as a whole number', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 3;
    helper.current = 1;
    assert.equal(helper.percent, 33);
  });

  test('decimal widens the rounding of the stored percent', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 3;
    helper.current = 1;
    helper.decimal = 2;
    assert.equal(helper.percent, 33.33);
  });

  // Surprising, and deliberately frozen here: a refused write does not keep
  // the last accepted value, it reverts to the one the helper was constructed
  // with (TypedValueHelper reads #defaultValue whenever the last assignment
  // was invalid). Worth knowing before the split moves this logic.
  test('a refused decimal reverts to the construction default, not the last good value', () => {
    const helper = new PercentHelper();
    helper.decimal = 2;
    helper.decimal = -1;
    assert.equal(helper.decimal, 0);
  });
});

describe('percent is derived, not cached', () => {
  // This assertion used to say the opposite: percent was a cached field, and
  // a value written after refresh() was not reflected until the next one.
  // The cache is gone with refresh() itself - there is no longer a moment
  // where what the object reports disagrees with what it was given.
  test('a value written is reflected on the next read, with nothing to call', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.current = 10;
    assert.equal(helper.percent, 10);
    helper.current = 90;
    assert.equal(helper.percent, 90);
  });
});

describe('range, actual and correctedValue - the public math surface', () => {
  test('range is the plain span outside center_zero', () => {
    const helper = new PercentHelper();
    helper.min = 20;
    helper.max = 80;
    assert.equal(helper.range, 60);
  });

  test('range is the arm the current value sits on under center_zero', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.isCenterZero = true;
    helper.zeroValue = 20;
    helper.current = 60;
    assert.equal(helper.range, 80); // upper arm: max - zero
    helper.current = 10;
    assert.equal(helper.range, 20); // lower arm: zero - min
  });

  test('actual mirrors the value against max when reversed', () => {
    const helper = new PercentHelper();
    helper.max = 100;
    helper.current = 30;
    assert.equal(helper.actual, 30);
    helper.isReversed = true;
    assert.equal(helper.actual, 70);
  });

  test('correctedValue is measured from the zero value, or from min', () => {
    const helper = new PercentHelper();
    helper.min = 10;
    helper.max = 100;
    helper.current = 40;
    assert.equal(helper.correctedValue, 30);
    helper.isCenterZero = true;
    helper.zeroValue = 25;
    assert.equal(helper.correctedValue, 15);
  });
});

describe('growthPercentValue and processedValue', () => {
  test('growthPercentValue is null while the range is invalid', () => {
    const helper = new PercentHelper();
    helper.min = 50;
    helper.max = 50;
    assert.equal(helper.growthPercentValue, null);
  });

  test('processedValue is the percent for the default unit', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 200;
    helper.current = 50;
    assert.equal(helper.processedValue, 25);
  });

  test('processedValue is the raw value once a real unit is set', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 200;
    helper.current = 50;
    helper.unit = 'W';
    assert.equal(helper.processedValue, 50);
  });

  test('processedValue is the growth ratio under center_zero + growthPercent', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.isCenterZero = true;
    helper.zeroValue = 40;
    helper.growthPercent = true;
    helper.current = 60;
    assert.equal(helper.processedValue, 50); // (60-40)/40
  });
});

describe('valueForThemes - which number a theme is compared against', () => {
  test('a custom theme always reads the raw value, unit notwithstanding', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 200;
    helper.current = 50;
    helper.unit = '°F';
    assert.equal(helper.valueForThemes(true, false), 50);
  });

  test('a Fahrenheit value is converted to Celsius for a built-in theme', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 200;
    helper.current = 212;
    helper.unit = '°F';
    assert.equal(helper.valueForThemes(false, false), 100);
  });

  test('a percentage-based theme reads the percent, not the value', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 200;
    helper.current = 50;
    helper.unit = 'W';
    assert.equal(helper.valueForThemes(false, true), 25);
  });

  test('the default unit sends the percent even to a value-based theme', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 200;
    helper.current = 50;
    assert.equal(helper.valueForThemes(false, false), 25);
  });
});

describe('toString - what the card actually prints', () => {
  test('an impossible range prints Div0 rather than a number', () => {
    const helper = new PercentHelper();
    helper.min = 50;
    helper.max = 50;
    assert.equal(helper.toString(), 'Div0');
  });

  test('the default unit prints the percent with its sign glued on', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.current = 42;
    assert.equal(helper.toString(), '42%');
  });

  test('a timer unit prints a clock reading, not a percentage', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 7200;
    helper.current = 3661;
    helper.isTimer = true;
    helper.unit = 'timer';
    assert.equal(helper.hasTimerUnit, true);
    assert.equal(helper.toString(), '01:01:01');
  });

  test('a flex timer drops the hours below one hour', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 7200;
    helper.current = 61;
    helper.isTimer = true;
    helper.unit = 'flextimer';
    assert.equal(helper.hasFlexTimerUnit, true);
    assert.equal(helper.toString(), '01:01');
  });

  test('a timer unit without isTimer is just a unit like any other', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 7200;
    helper.current = 3661;
    helper.unit = 'timer';
    assert.equal(helper.hasTimerOrFlexTimerUnit, false);
  });
});

describe('configure - the nine options assembled in one call', () => {
  test('every key reaches the value the getters report', () => {
    const helper = new PercentHelper();
    helper.configure({
      unitSpacing: 'no-space',
      hasDisabledUnit: false,
      isCenterZero: true,
      zeroValue: 25,
      growthPercent: true,
      scale: 'log',
      compact: true,
      sign: true,
      unitPosition: 'before',
    });
    assert.equal(helper.isCenterZero, true);
    assert.equal(helper.zeroValue, 25);
    assert.equal(helper.growthPercent, true);
    assert.equal(helper.scale, 'log');
  });

  test('hasDisabledUnit blanks the unit without forgetting it', () => {
    const helper = new PercentHelper();
    helper.unit = 'W';
    helper.configure({
      unitSpacing: 'auto',
      hasDisabledUnit: true,
      isCenterZero: false,
      zeroValue: 0,
      growthPercent: false,
      scale: 'linear',
      compact: false,
      sign: false,
      unitPosition: 'after',
    });
    assert.equal(helper.unit, '');
  });

  test('center_zero disables the log scale, which has no meaning across two arms', () => {
    const helper = new PercentHelper();
    helper.min = 1;
    helper.max = 100;
    helper.scale = 'log';
    helper.isCenterZero = true;
    helper.zeroValue = 10;
    assert.equal(helper.isLogScale, false);
  });

  test('an unknown scale falls back to linear rather than being stored', () => {
    const helper = new PercentHelper();
    helper.scale = 'quadratic';
    assert.equal(helper.scale, 'linear');
  });
});

describe('calcWatermark - the shapes a threshold can arrive in', () => {
  test('a nullish threshold reads as zero, not NaN', () => {
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    assert.equal(helper.calcWatermark(null), 0);
    assert.equal(helper.calcWatermark(undefined), 0);
  });

  test('a threshold is projected on its own arm, not on the current valueticks', () => {
    // current stays at 0 (below the zero value) while the threshold is above
    // it: the two arms are chosen independently.
    const helper = new PercentHelper();
    helper.min = 0;
    helper.max = 100;
    helper.isCenterZero = true;
    helper.zeroValue = 20;
    assert.equal(helper.calcWatermark(10), 25); // lower arm: (10-20)/20 -> -50 -> 50-25
  });
});
