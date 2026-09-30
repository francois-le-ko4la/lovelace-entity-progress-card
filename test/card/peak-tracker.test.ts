import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PeakTracker } from '../../src/card/peak-tracker.js';

const HOUR = 3600000;
const DAY = 24 * HOUR;
const NOW = 1800000000000;
const TOLERANCE = 1e-9;

const peaksOf = (tracker: PeakTracker, now: number) => {
  const peaks = tracker.peaks(now);
  assert.ok(peaks, 'the tracker returned no peaks');
  return peaks;
};

describe('PeakTracker - average weighs time, not readings', () => {
  test('23 h at 20 then an hour of 100 readings around 55 averages 21.46, not 55', () => {
    const samples = [{ t: NOW - DAY, value: 20 }];
    for (let index = 0; index < 100; index++) {
      samples.push({ t: NOW - HOUR + index * (HOUR / 100), value: index % 2 === 0 ? 50 : 60 });
    }
    const tracker = new PeakTracker(DAY);
    tracker.seed(samples);
    assert.ok(Math.abs(peaksOf(tracker, NOW).average - (20 * 23 + 55) / 24) < TOLERANCE);
  });

  test('a history shorter than the window averages over what it covers', () => {
    const tracker = new PeakTracker(DAY);
    tracker.seed([{ t: NOW - HOUR, value: 10 }]);
    assert.equal(peaksOf(tracker, NOW).average, 10);
  });
});

describe('PeakTracker - the window slides', () => {
  test('the value in effect when the window opens still counts', () => {
    const tracker = new PeakTracker(DAY);
    tracker.seed([
      { t: NOW - 2 * DAY, value: 90 },
      { t: NOW - HOUR, value: 10 },
    ]);
    const peaks = peaksOf(tracker, NOW);
    assert.equal(peaks.max, 90);
    assert.equal(peaks.min, 10);
    assert.ok(Math.abs(peaks.average - (90 * 23 + 10) / 24) < TOLERANCE);
  });

  test('a maximum that leaves the window stops counting', () => {
    const tracker = new PeakTracker(2 * HOUR);
    tracker.seed([
      { t: NOW - HOUR, value: 90 },
      { t: NOW - HOUR / 2, value: 10 },
    ]);
    assert.equal(peaksOf(tracker, NOW).max, 90);
    assert.equal(peaksOf(tracker, NOW + 2 * HOUR).max, 10);
  });

  test('a live reading above the maximum raises it at once', () => {
    const tracker = new PeakTracker(DAY);
    tracker.seed([{ t: NOW - HOUR, value: 10 }]);
    tracker.push(95, NOW);
    assert.equal(peaksOf(tracker, NOW).max, 95);
  });
});

describe('PeakTracker - what it ignores', () => {
  test('a reading that is not a number, seeded or live', () => {
    const tracker = new PeakTracker(DAY);
    tracker.seed([
      { t: NOW - HOUR, value: 10 },
      { t: NOW - HOUR / 2, value: Number.NaN },
    ]);
    tracker.push(Number.POSITIVE_INFINITY, NOW);
    assert.deepEqual(peaksOf(tracker, NOW), { min: 10, max: 10, average: 10 });
  });

  test('no sample at all gives no peaks', () => {
    assert.equal(new PeakTracker(DAY).peaks(NOW), null);
  });
});
