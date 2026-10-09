import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ProgressMath,
  resolveProgressInput,
  type ProgressSettings,
  type RawProgress,
} from '../../src/card/progress-math.js';
import {
  formatProgress,
  hasFlexTimerUnit,
  hasTimerOrFlexTimerUnit,
  hasTimerUnit,
  processedValue,
  valueForThemes,
  type Progress,
  type ProgressDisplay,
} from '../../src/card/progress-display.js';
import { UnitHelper } from '../../src/card/value-primitives.js';

type Overrides = {
  raw?: Partial<RawProgress>;
  settings?: Partial<ProgressSettings>;
  display?: Partial<Omit<ProgressDisplay, 'unit'>>;
  unit?: string;
  disabledUnit?: boolean;
};

const progress = ({ raw, settings, display, unit, disabledUnit }: Overrides = {}): Progress => {
  const input = resolveProgressInput(
    { current: 0, min: 0, max: 100, decimal: 0, reversed: false, ...raw },
    { scale: undefined, centerZero: null, ...settings },
  );
  const unitHelper = new UnitHelper();
  if (unit !== undefined) unitHelper.value = unit;
  unitHelper.isDisabled = disabledUnit;
  return {
    input,
    math: new ProgressMath(input),
    display: {
      unit: unitHelper,
      isTimer: false,
      unitSpacing: 'auto',
      unitPosition: 'after',
      compact: false,
      sign: false,
      ...display,
    },
  };
};

describe('resolveProgressInput - what a refresh may hand over', () => {
  test('a value that is no number falls back to its default', () => {
    const { input } = progress({ raw: { current: 'abc', min: null, max: undefined } });
    assert.deepEqual([input.current, input.min, input.max], [0, 0, 100]);
  });

  test('decimal widens the rounding of the percent', () => {
    assert.equal(progress({ raw: { max: 3, current: 1 } }).math.percent, 33);
    assert.equal(progress({ raw: { max: 3, current: 1, decimal: 2 } }).math.percent, 33.33);
  });

  test('a refused decimal reverts to the default', () => {
    for (const decimal of [-1, 1.5, '2', null]) {
      assert.equal(progress({ raw: { decimal } }).input.decimal, 0);
    }
  });

  test('an unknown scale falls back to linear', () => {
    assert.equal(progress({ settings: { scale: 'quadratic' } }).input.scale, 'linear');
  });

  test('center_zero is carried whole, or not at all', () => {
    const centerZero = { zeroValue: 25, growthPercent: true };
    assert.deepEqual(progress({ settings: { centerZero } }).input.centerZero, centerZero);
    assert.equal(progress().input.centerZero, null);
  });
});

describe('processedValue - the number the card prints', () => {
  test('the percent for the default unit', () => {
    assert.equal(processedValue(progress({ raw: { max: 200, current: 50 } })), 25);
  });

  test('the raw value once a real unit is set', () => {
    assert.equal(processedValue(progress({ raw: { max: 200, current: 50 }, unit: 'W' })), 50);
  });

  test('the growth ratio under center_zero + growthPercent', () => {
    const settings = { centerZero: { zeroValue: 40, growthPercent: true } };
    assert.equal(processedValue(progress({ raw: { current: 60 }, settings })), 50); // (60-40)/40
  });
});

describe('valueForThemes - which number a theme is compared against', () => {
  const raw = { max: 200, current: 50 };

  test('a custom theme always reads the raw value, unit notwithstanding', () => {
    assert.equal(valueForThemes(progress({ raw, unit: '°F' }), true, false), 50);
  });

  test('a Fahrenheit value is converted to Celsius for a built-in theme', () => {
    assert.equal(valueForThemes(progress({ raw: { max: 200, current: 212 }, unit: '°F' }), false, false), 100);
  });

  test('a percentage-based theme reads the percent, not the value', () => {
    assert.equal(valueForThemes(progress({ raw, unit: 'W' }), false, true), 25);
  });

  test('the default unit sends the percent even to a value-based theme', () => {
    assert.equal(valueForThemes(progress({ raw }), false, false), 25);
  });
});

describe('formatProgress - what the card actually prints', () => {
  test('an impossible range prints Div0 rather than a number', () => {
    assert.equal(formatProgress(progress({ raw: { min: 50, max: 50 } })), 'Div0');
  });

  test('the default unit prints the percent with its sign glued on', () => {
    assert.equal(formatProgress(progress({ raw: { current: 42 } })), '42%');
  });

  test('a timer unit prints a clock reading, not a percentage', () => {
    const timer = progress({
      raw: { max: 7200, current: 3661 },
      display: { isTimer: true },
      unit: 'timer',
    });
    assert.equal(hasTimerUnit(timer), true);
    assert.equal(formatProgress(timer), '01:01:01');
  });

  test('a flex timer drops the hours below one hour', () => {
    const timer = progress({
      raw: { max: 7200, current: 61 },
      display: { isTimer: true },
      unit: 'flextimer',
    });
    assert.equal(hasFlexTimerUnit(timer), true);
    assert.equal(formatProgress(timer), '01:01');
  });

  test('a timer unit without isTimer is just a unit like any other', () => {
    assert.equal(hasTimerOrFlexTimerUnit(progress({ raw: { max: 7200, current: 3661 }, unit: 'timer' })), false);
  });

  test('a disabled unit blanks the unit without forgetting it', () => {
    const shown = progress({ unit: 'W', disabledUnit: true });
    assert.equal(shown.display.unit.value, '');
    assert.equal(shown.display.unit.isDisabled, true);
  });
});
