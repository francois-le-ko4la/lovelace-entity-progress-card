import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { nextOnGrid, relativeAge } from '../../src/utils/clock.js';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('nextOnGrid - the first grid instant strictly after now', () => {
  test('on whole steps from the origin', () => {
    assert.equal(nextOnGrid(2300, 0, SECOND), 3000);
    assert.equal(nextOnGrid(3000, 0, SECOND), 4000, 'a tick due exactly now is already past');
    assert.equal(nextOnGrid(10_450, 370, SECOND), 10_370 + SECOND);
  });

  test('half a step in', () => {
    assert.equal(nextOnGrid(2300, 0, SECOND, 0.5), 2500);
    assert.equal(nextOnGrid(2500, 0, SECOND, 0.5), 3500);
  });
});

describe('relativeAge - the reading, and the age it next changes at', () => {
  const cases: [string, number, number, Intl.RelativeTimeFormatUnit, number][] = [
    ['just now', 300, 0, 'second', SECOND],
    ['seconds truncate', 5900, 5, 'second', 6 * SECOND],
    ['59s turns into a minute at 60s', 59.5 * SECOND, 59, 'second', MINUTE],
    ['a minute rounds', MINUTE, 1, 'minute', 90 * SECOND],
    ['100s reads 2 minutes until 150s', 100 * SECOND, 2, 'minute', 150 * SECOND],
    ['59 minutes turns into an hour at 60', 59.7 * MINUTE, 60, 'minute', HOUR],
    ['2h10 reads 2 hours until 2h30', 130 * MINUTE, 2, 'hour', 150 * MINUTE],
    ['3 days', 3 * DAY, 3, 'day', 3.5 * DAY],
  ];
  for (const [label, age, value, unit, changesAtMs] of cases) {
    test(label, () => {
      assert.deepEqual(relativeAge(age), { value, unit, changesAtMs });
    });
  }

  test("a timestamp ahead of the browser's clock reads as no age yet", () => {
    assert.deepEqual(relativeAge(-4 * SECOND), { value: 0, unit: 'second', changesAtMs: SECOND });
  });
});
