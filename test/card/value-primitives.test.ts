import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ValueHelper, DecimalHelper, UnitHelper } from '../../src/card/value-primitives.js';

describe('ValueHelper - self-validating number', () => {
  test('accepts a number at construction', () => {
    // isValid only reflects a later assignment through the `value` setter
    // (see TypedValueHelper's own doc comment) - the constructor sets the
    // fallback default directly, without going through it.
    const v = new ValueHelper(5);
    assert.equal(v.value, 5);
    assert.equal(v.isValid, false);
  });

  test('a later valid assignment replaces the current value', () => {
    const v = new ValueHelper(5);
    v.value = 10;
    assert.equal(v.value, 10);
  });

  test('an invalid assignment falls back to the constructor default, not the last valid value', () => {
    const v = new ValueHelper(5);
    v.value = 10;
    v.value = 'not a number';
    assert.equal(v.isValid, false);
    assert.equal(v.value, 5, 'falls back to the ORIGINAL constructor value (5), not the last good one (10)');
  });

  test('no constructor argument means no valid default either - value is null', () => {
    const v = new ValueHelper();
    assert.equal(v.value, null);
    assert.equal(v.isValid, false);
  });
});

describe('DecimalHelper - non-negative integer only', () => {
  test('accepts zero and positive integers', () => {
    const d = new DecimalHelper(0);
    assert.equal(d.value, 0);
    d.value = 3;
    assert.equal(d.value, 3);
  });

  test('rejects a fractional value', () => {
    const d = new DecimalHelper(2);
    d.value = 3.5;
    assert.equal(d.isValid, false);
    assert.equal(d.value, 2);
  });

  test('rejects a negative value', () => {
    const d = new DecimalHelper(2);
    d.value = -1;
    assert.equal(d.isValid, false);
    assert.equal(d.value, 2);
  });
});

describe('UnitHelper - string coercion, disable, timer detection', () => {
  test('defaults to the card-wide default unit when constructed', () => {
    const unit = new UnitHelper();
    assert.equal(unit.value, '%');
  });

  test('a nullish assignment resets to the default unit', () => {
    const unit = new UnitHelper();
    unit.value = 'kWh';
    assert.equal(unit.value, 'kWh');
    unit.value = null;
    assert.equal(unit.value, '%');
  });

  test('a non-string value (e.g. a numeric attribute) is coerced and trimmed', () => {
    const unit = new UnitHelper();
    unit.value = 42;
    assert.equal(unit.value, '42');
  });

  test('isDisabled forces an empty string from both value and toString(), without erasing the stored unit', () => {
    const unit = new UnitHelper();
    unit.value = 'kWh';
    unit.isDisabled = true;
    assert.equal(unit.value, '');
    assert.equal(unit.toString(), '');
    unit.isDisabled = false;
    assert.equal(unit.value, 'kWh', 'the underlying unit was preserved while disabled');
  });

  test('isTimerUnit/isFlexTimerUnit match case-insensitively', () => {
    const unit = new UnitHelper();
    unit.value = 'Timer';
    assert.equal(unit.isTimerUnit, true);
    assert.equal(unit.isFlexTimerUnit, false);
    unit.value = 'FlexTimer';
    assert.equal(unit.isFlexTimerUnit, true);
    assert.equal(unit.isTimerUnit, false);
    unit.value = 'kWh';
    assert.equal(unit.isTimerUnit, false);
    assert.equal(unit.isFlexTimerUnit, false);
  });
});
