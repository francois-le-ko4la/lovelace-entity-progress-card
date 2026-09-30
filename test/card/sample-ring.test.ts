import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SampleRing } from '../../src/card/sample-ring.js';

const valuesOf = (ring: SampleRing) => Array.from({ length: ring.size }, (_, index) => ring.valueAt(index));

describe('SampleRing - order survives wrap-around and growth', () => {
  test('dropping the oldest then appending past capacity keeps oldest-first order', () => {
    const ring = new SampleRing((length) => new Float64Array(length));
    for (let index = 0; index < 60; index++) ring.append(index, index);
    for (let index = 0; index < 50; index++) ring.dropOldest();
    for (let index = 60; index < 200; index++) ring.append(index, index);
    const values = valuesOf(ring);
    assert.equal(ring.size, 150);
    assert.equal(values[0], 50);
    assert.equal(values[149], 199);
    assert.ok(values.every((value, index) => value === 50 + index && ring.timeAt(index) === value));
  });

  test('keepNewest keeps the most recent samples, in order', () => {
    const ring = new SampleRing((length) => new Float32Array(length));
    for (let index = 0; index < 5; index++) ring.append(index, index);
    ring.keepNewest(2);
    assert.deepEqual(valuesOf(ring), [3, 4]);
  });
});
