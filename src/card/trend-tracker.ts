/*
 * TrendTracker: bounded sample buffer + direction computation for
 * trend_indicator's object form ({window, basis, threshold}).
 */

import { SampleRing } from './sample-ring.js';

type Basis = 'average' | 'edge' | 'slope';
type Sample = { t: number; percent: number };
type Direction = 'up' | 'down' | 'flat';

type TrendTrackerOptions = {
  windowMs?: number | null;
  basis?: Basis;
  thresholdPoints?: number;
};

class TrendTracker {
  #windowMs: number | null;
  #basis: Basis;
  #thresholdPoints: number;
  // Percents: Float32 is all a bar position needs.
  #ring = new SampleRing((length) => new Float32Array(length));

  constructor({ windowMs = null, basis = 'average', thresholdPoints = 0 }: TrendTrackerOptions = {}) {
    this.#windowMs = windowMs;
    this.#basis = basis;
    this.#thresholdPoints = thresholdPoints;
  }

  // Bulk-loads samples (e.g. from HA's history API) before any live push -
  // out-of-order input is tolerated, sorted once here.
  seed(samples: Sample[]) {
    const sorted = [...samples].sort((a, b) => a.t - b.t);
    this.#ring.reset(sorted.length);
    for (const sample of sorted) this.#ring.append(sample.t, sample.percent);
    this.#evict(Date.now());
  }

  push(percent: number, now: number = Date.now()) {
    this.#ring.append(now, percent);
    this.#evict(now);
  }

  get hasEnoughData(): boolean {
    return this.#ring.size >= 2;
  }

  // null = not enough data yet (cold start, or window not covered by any
  // sample) - distinct from a genuinely flat reading, callers show the
  // existing "unknown" icon for it rather than asserting stability.
  direction(): Direction | null {
    if (!this.hasEnoughData) return null;
    const delta = this.#delta();
    // `delta === 0` on its own: threshold 0 is the object form's own schema
    // default, and `Math.abs(0) < 0` is false - a value that never moved used
    // to fall through to the 'down' arrow.
    if (delta === 0 || Math.abs(delta) < this.#thresholdPoints) return 'flat';
    return delta > 0 ? 'up' : 'down';
  }

  // The window slides with time too: a sample past it leaves even when no new
  // reading arrives to push it out.
  directionAt(now: number = Date.now()): Direction | null {
    this.#evict(now);
    return this.direction();
  }

  #evict(now: number) {
    if (this.#windowMs === null) {
      // No window (plain `trend_indicator: true`): point-to-point against
      // the last render only, unbounded accumulation would be pure waste.
      this.#ring.keepNewest(2);
      return;
    }
    const cutoff = now - this.#windowMs;
    while (this.#ring.size > 1 && this.#ring.timeAt(0) < cutoff) this.#ring.dropOldest();
  }

  // ─── COMPUTATION ──────────────────────────────────────────────────────────

  #delta(): number {
    const latest = this.#ring.valueAt(this.#ring.size - 1);
    if (this.#basis === 'edge') return latest - this.#ring.valueAt(0);
    if (this.#basis === 'slope') {
      const timeSpan = this.#ring.timeAt(this.#ring.size - 1) - this.#ring.timeAt(0);
      return timeSpan === 0 ? 0 : this.#slope() * timeSpan;
    }
    let sum = 0;
    for (let i = 0; i < this.#ring.size - 1; i++) sum += this.#ring.valueAt(i);
    return latest - sum / (this.#ring.size - 1);
  }

  // Least-squares slope (percent per ms) over the buffered samples.
  #slope(): number {
    const count = this.#ring.size;
    let sumTime = 0;
    let sumPercent = 0;
    for (let i = 0; i < count; i++) {
      sumTime += this.#ring.timeAt(i);
      sumPercent += this.#ring.valueAt(i);
    }
    const meanTime = sumTime / count;
    const meanPercent = sumPercent / count;
    let num = 0;
    let den = 0;
    for (let i = 0; i < count; i++) {
      const fromMean = this.#ring.timeAt(i) - meanTime;
      num += fromMean * (this.#ring.valueAt(i) - meanPercent);
      den += fromMean * fromMean;
    }
    return den === 0 ? 0 : num / den;
  }
}

export { TrendTracker };
export type { Basis as TrendBasis };
