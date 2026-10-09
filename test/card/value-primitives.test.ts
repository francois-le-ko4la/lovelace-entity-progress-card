import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { UnitHelper } from '../../src/card/value-primitives.js';

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
