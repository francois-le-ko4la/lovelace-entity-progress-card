/*
 * PeakTracker: sliding-window min, max and time-weighted mean for peak_marker.
 */

import { SampleRing } from './sample-ring.js';

type Sample = { t: number; value: number };
type Peaks = { min: number; max: number; average: number };

class PeakTracker {
  #windowMs: number;
  // Raw readings, not percents: Float64 keeps them exact.
  #ring = new SampleRing((length) => new Float64Array(length));

  constructor(windowMs: number) {
    this.#windowMs = windowMs;
  }

  seed(samples: Sample[]) {
    const sorted = samples.filter((sample) => Number.isFinite(sample.value)).sort((a, b) => a.t - b.t);
    this.#ring.reset(sorted.length);
    for (const sample of sorted) this.#ring.append(sample.t, sample.value);
  }

  // A refresh does not mean the value moved: the same reading extends the
  // last sample instead of adding one.
  push(value: number, now: number = Date.now()) {
    const size = this.#ring.size;
    if (!Number.isFinite(value) || (size > 0 && this.#ring.valueAt(size - 1) === value)) return;
    this.#ring.append(now, value);
  }

  // Each value weighs the time it held, as in HA's own statistics mean; the
  // one in effect when the window opens counts from there. null: no sample.
  peaks(now: number = Date.now()): Peaks | null {
    const windowStart = now - this.#windowMs;
    this.#evict(windowStart);
    const size = this.#ring.size;
    if (size === 0) return null;

    let min = Infinity;
    let max = -Infinity;
    let weighted = 0;
    for (let i = 0; i < size; i++) {
      const value = this.#ring.valueAt(i);
      if (value < min) min = value;
      if (value > max) max = value;
      const from = Math.max(this.#ring.timeAt(i), windowStart);
      const until = i + 1 < size ? Math.min(this.#ring.timeAt(i + 1), now) : now;
      weighted += value * Math.max(0, until - from);
    }
    const span = now - Math.max(this.#ring.timeAt(0), windowStart);
    return { min, max, average: span > 0 ? weighted / span : this.#ring.valueAt(size - 1) };
  }

  // Keeps the last sample at or before the window start: its value still
  // holds at the start, so it still counts.
  #evict(windowStart: number) {
    while (this.#ring.size > 1 && this.#ring.timeAt(1) <= windowStart) this.#ring.dropOldest();
  }
}

export { PeakTracker };
