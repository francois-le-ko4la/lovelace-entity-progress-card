/*
 * The math on its own, built straight from an input. progress-calc.test.ts
 * asserts the same formulas through the class that assembles that input - the
 * two layers this split exists to separate.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ProgressMath, type ProgressInput } from '../../src/card/progress-math.js';

const input = (overrides: Partial<ProgressInput> = {}): ProgressInput => ({
  min: 0,
  max: 100,
  current: 0,
  decimal: 0,
  reversed: false,
  scale: 'linear',
  centerZero: null,
  ...overrides,
});

const math = (overrides: Partial<ProgressInput> = {}) => new ProgressMath(input(overrides));

describe('ProgressMath - every derived value off one input', () => {
  test('a plain range answers for all of them at once', () => {
    const result = math({ current: 42 });
    assert.deepEqual(
      {
        isValid: result.isValid,
        range: result.range,
        actual: result.actual,
        correctedValue: result.correctedValue,
        percent: result.percent,
        growthPercent: result.growthPercent,
      },
      { isValid: true, range: 100, actual: 42, correctedValue: 42, percent: 42, growthPercent: 42 },
    );
  });

  test('a degenerate range yields null percent, never NaN', () => {
    const result = math({ min: 50, max: 50, current: 50 });
    assert.equal(result.isValid, false);
    assert.equal(result.percent, null);
    assert.equal(result.growthPercent, null);
  });

  test('reversed measures what is left instead of what is done', () => {
    assert.equal(math({ current: 42, reversed: true }).percent, 58);
  });

  test('decimal is the rounding of the returned percent, nothing else', () => {
    assert.equal(math({ max: 3, current: 1 }).percent, 33);
    assert.equal(math({ max: 3, current: 1, decimal: 2 }).percent, 33.33);
  });
});

describe('the center_zero arm is chosen per value, not per card', () => {
  const centred = input({ centerZero: { zeroValue: 20, growthPercent: false }, current: 0 });

  // The rule the two readers disagree about on purpose: `range` asks about
  // `current`, percentFor asks about whatever it is projecting.
  test('range answers for the current value', () => {
    assert.equal(new ProgressMath({ ...centred, current: 60 }).range, 80); // upper arm
    assert.equal(new ProgressMath({ ...centred, current: 10 }).range, 20); // lower arm
  });

  test('percentFor answers for the value handed to it, current notwithstanding', () => {
    // current sits on the lower arm; both projections below are unaffected.
    assert.equal(new ProgressMath(centred).percentFor(60), 50); // (60-20)/80
    assert.equal(new ProgressMath(centred).percentFor(10), -50); // (10-20)/20
  });

  test('the zero value itself belongs to the upper arm', () => {
    assert.equal(new ProgressMath(centred).percentFor(20), 0);
    assert.equal(new ProgressMath({ ...centred, current: 20 }).range, 80);
  });

  test('a zero-width arm yields 0, not a division by zero', () => {
    const flat = input({ min: 20, max: 20, centerZero: { zeroValue: 20, growthPercent: false } });
    assert.equal(new ProgressMath(flat).percentFor(50), 0);
  });
});

describe('watermarkFor - projecting a threshold onto the bar', () => {
  test('outside center_zero it is the plain percentage', () => {
    assert.equal(math().watermarkFor(20), 20);
  });

  test('inside center_zero it is halved and re-centered on 50', () => {
    const centred = input({ centerZero: { zeroValue: 20, growthPercent: false } });
    assert.equal(new ProgressMath(centred).watermarkFor(60), 75);
    assert.equal(new ProgressMath(centred).watermarkFor(10), 25);
  });
});

describe('log scale - when it applies, and what it does when it does not', () => {
  test('the geometric midpoint of 1-100 sits at 50%', () => {
    assert.equal(math({ min: 1, scale: 'log', current: 10 }).percent, 50);
  });

  test('a value at or below min clamps to 0% rather than -Infinity', () => {
    assert.equal(math({ min: 1, scale: 'log', current: 0 }).percent, 0);
  });

  test('a non-positive min disqualifies the log scale', () => {
    const linear = input({ min: 0, scale: 'log', current: 42 });
    assert.equal(new ProgressMath(linear).isLogScale, false);
    assert.equal(new ProgressMath(linear).percent, 42);
  });

  test('center_zero disqualifies it too - two arms have no log equivalent', () => {
    assert.equal(math({ min: 1, scale: 'log', centerZero: { zeroValue: 10, growthPercent: false } }).isLogScale, false);
  });
});

describe('growthPercent - the change relative to the zero point', () => {
  test('is the ratio to the zero value when there is one', () => {
    const result = math({ centerZero: { zeroValue: 40, growthPercent: true }, current: 60 });
    assert.equal(result.growthPercent, 50);
  });

  test('falls back to the bar percentage when the zero value is 0', () => {
    const result = math({ min: -100, centerZero: { zeroValue: 0, growthPercent: true }, current: 50 });
    assert.equal(result.growthPercent, result.percent);
  });
});

describe('clampPercent - what a percentage may be on this bar', () => {
  test('a plain bar is held between 0 and 100', () => {
    assert.equal(ProgressMath.clampPercent(140, false), 100);
    assert.equal(ProgressMath.clampPercent(-40, false), 0);
    assert.equal(ProgressMath.clampPercent(42, false), 42);
  });

  test('center_zero opens the negative half, and no further', () => {
    assert.equal(ProgressMath.clampPercent(-140, true), -100);
    assert.equal(ProgressMath.clampPercent(-40, true), -40);
    assert.equal(ProgressMath.clampPercent(140, true), 100);
  });
});

describe('an inverted range is a supported way to mirror the scale', () => {
  // min > max is deliberate, not a malformed config: the negative range
  // cancels against the negative numerator, so the projection comes out
  // exactly mirrored. Written down because nothing else in the codebase says
  // so, and the mechanism is not obvious from reading percentFor alone.
  const inverted = (current: number) => math({ min: 100, max: 0, current });

  test('the two ends swap, and the midpoint stays put', () => {
    assert.equal(inverted(0).percent, 100);
    assert.equal(inverted(50).percent, 50);
    assert.equal(inverted(100).percent, 0);
  });

  test('the range is negative, and that does not make it invalid', () => {
    assert.equal(inverted(25).range, -100);
    assert.equal(inverted(25).isValid, true);
    assert.equal(inverted(25).percent, 75);
  });

  test('a value past the inverted bounds overshoots, and the bar clamps it', () => {
    assert.equal(inverted(120).percent, -20);
    assert.equal(ProgressMath.clampPercent(inverted(120).percent ?? 0, false), 0);
  });
});
