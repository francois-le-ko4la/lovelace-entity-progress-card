import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { TrendTracker } from '../../src/card/trend-tracker.js';

const WINDOW = 2 * 60 * 60 * 1000;

// Samples are pushed with an explicit timestamp everywhere here: the default
// Date.now() would evict against the real clock and make a 2h window a
// moving target between two assertions in the same test.
const feed = (tracker: TrendTracker, points: [number, number][]) => {
  for (const [t, percent] of points) tracker.push(percent, t);
  return tracker;
};

describe('direction - not enough data', () => {
  test('an empty tracker knows nothing, and says so', () => {
    assert.equal(new TrendTracker().direction(), null);
  });

  test('one sample is still nothing - a direction needs two', () => {
    const tracker = feed(new TrendTracker(), [[1000, 50]]);
    assert.equal(tracker.hasEnoughData, false);
    assert.equal(tracker.direction(), null);
  });
});

describe('direction - threshold', () => {
  test('a value that never moved is flat, threshold 0 included', () => {
    const tracker = feed(new TrendTracker({ windowMs: WINDOW, thresholdPoints: 0 }), [
      [1000, 50],
      [2000, 50],
      [3000, 50],
    ]);
    assert.equal(tracker.direction(), 'flat');
  });

  test('threshold 0 lets the smallest real move through', () => {
    const up = feed(new TrendTracker({ windowMs: WINDOW, thresholdPoints: 0 }), [
      [1000, 50],
      [2000, 50.5],
    ]);
    const down = feed(new TrendTracker({ windowMs: WINDOW, thresholdPoints: 0 }), [
      [1000, 50],
      [2000, 49.5],
    ]);
    assert.equal(up.direction(), 'up');
    assert.equal(down.direction(), 'down');
  });

  test('a move smaller than the threshold reads as stable', () => {
    const tracker = feed(new TrendTracker({ windowMs: WINDOW, thresholdPoints: 2 }), [
      [1000, 50],
      [2000, 51],
    ]);
    assert.equal(tracker.direction(), 'flat');
  });

  test('a move equal to the threshold is a direction, not stability', () => {
    const tracker = feed(new TrendTracker({ windowMs: WINDOW, thresholdPoints: 2 }), [
      [1000, 50],
      [2000, 52],
    ]);
    assert.equal(tracker.direction(), 'up');
  });
});

describe('direction - basis', () => {
  // Dropped then came back to where it started: the three disagree here, and
  // that disagreement is the whole point of the option.
  const dipAndBack: [number, number][] = [
    [1000, 50],
    [2000, 30],
    [3000, 50],
  ];

  test('average measures against the mean of every earlier sample', () => {
    const tracker = feed(new TrendTracker({ windowMs: WINDOW, basis: 'average', thresholdPoints: 1 }), dipAndBack);
    // 50 - (50 + 30) / 2 = +10: above its own recent norm, not rising.
    assert.equal(tracker.direction(), 'up');
  });

  test('edge measures against the oldest sample, and ignores the dip', () => {
    const tracker = feed(new TrendTracker({ windowMs: WINDOW, basis: 'edge', thresholdPoints: 1 }), dipAndBack);
    assert.equal(tracker.direction(), 'flat');
  });

  test('slope fits every sample, so the dip cancels out too', () => {
    const tracker = feed(new TrendTracker({ windowMs: WINDOW, basis: 'slope', thresholdPoints: 1 }), dipAndBack);
    assert.equal(tracker.direction(), 'flat');
  });

  test('same two ends, different shape: edge is blind to what slope reads', () => {
    const points: [number, number][] = [
      [1000, 50],
      [2000, 60],
      [3000, 70],
      [4000, 50],
    ];
    const edge = feed(new TrendTracker({ windowMs: WINDOW, basis: 'edge', thresholdPoints: 1 }), points);
    const slope = feed(new TrendTracker({ windowMs: WINDOW, basis: 'slope', thresholdPoints: 1 }), points);
    // Both ends are 50, so edge has nothing to report; the fitted line still
    // rises, most of the window having sat above where it started.
    assert.equal(edge.direction(), 'flat');
    assert.equal(slope.direction(), 'up');
  });

  test('on a steady climb the three agree', () => {
    const climb: [number, number][] = [
      [1000, 10],
      [2000, 20],
      [3000, 30],
      [4000, 40],
    ];
    for (const basis of ['average', 'edge', 'slope'] as const) {
      const tracker = feed(new TrendTracker({ windowMs: WINDOW, basis, thresholdPoints: 1 }), climb);
      assert.equal(tracker.direction(), 'up', `${basis} should read up on a steady climb`);
    }
  });

  test('without a window the three are the same computation', () => {
    for (const basis of ['average', 'edge', 'slope'] as const) {
      const tracker = feed(new TrendTracker({ basis, thresholdPoints: 1 }), [
        [1000, 10],
        [2000, 80],
        [3000, 40],
      ]);
      // Only the last two samples survive, so every basis reduces to
      // 40 - 80 = -40 - the dip at 10 is gone either way.
      assert.equal(tracker.direction(), 'down', `${basis} should read the previous sample only`);
    }
  });
});

describe('the sample buffer', () => {
  test('no window keeps two samples, never more', () => {
    const tracker = feed(new TrendTracker({ thresholdPoints: 0 }), [
      [1000, 10],
      [2000, 20],
      [3000, 30],
      [4000, 30],
    ]);
    // The 10 and the 20 are gone: 30 against 30 is flat, not a climb.
    assert.equal(tracker.direction(), 'flat');
  });

  test('a windowed tracker drops what fell out of the window', () => {
    const tracker = new TrendTracker({ windowMs: 5000, basis: 'edge', thresholdPoints: 1 });
    feed(tracker, [
      [1000, 10],
      [2000, 50],
    ]);
    // 10_000 - 5000 = 5000: both samples above are older, only the new one
    // is left - one sample is not a direction.
    tracker.push(50, 10000);
    assert.equal(tracker.hasEnoughData, false);
    assert.equal(tracker.direction(), null);
  });

  test('seed() sorts what it is given and evicts on arrival', () => {
    const tracker = new TrendTracker({ windowMs: WINDOW, basis: 'edge', thresholdPoints: 1 });
    const now = Date.now();
    tracker.seed([
      { t: now - 1000, percent: 80 },
      { t: now - WINDOW * 2, percent: 10 },
      { t: now - 2000, percent: 50 },
    ]);
    // Out of order on the way in, and the sample older than the window is
    // dropped - so the oldest one edge reads is the 50, not the 10.
    assert.equal(tracker.direction(), 'up');
  });

  test('seed() replaces the buffer rather than adding to it', () => {
    const tracker = feed(new TrendTracker({ windowMs: WINDOW, basis: 'edge', thresholdPoints: 1 }), [
      [1000, 90],
      [2000, 90],
    ]);
    const now = Date.now();
    tracker.seed([
      { t: now - 2000, percent: 10 },
      { t: now - 1000, percent: 20 },
    ]);
    assert.equal(tracker.direction(), 'up');
  });
});
