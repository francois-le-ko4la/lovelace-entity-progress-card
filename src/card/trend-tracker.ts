/*
 * TrendTracker: bounded sample buffer + direction computation for
 * trend_indicator's object form ({window, basis, threshold}).
 */

type Basis = 'average' | 'edge' | 'slope';
type Sample = { t: number; percent: number };
type Direction = 'up' | 'down' | 'flat';

type TrendTrackerOptions = {
  windowMs?: number | null;
  basis?: Basis;
  thresholdPoints?: number;
};

const INITIAL_CAPACITY = 64;

class TrendTracker {
  #windowMs: number | null;
  #basis: Basis;
  #thresholdPoints: number;
  // Two parallel typed arrays rather than one Sample[]: a week-wide window on
  // a sensor reporting every 10s holds ~60k samples, and a V8 object per
  // sample costs ~50 bytes against 12 here. Timestamps stay Float64 - rounding
  // them to seconds would collapse two sub-second renders onto one x value and
  // hand `slope` a zero time span.
  #times = new Float64Array(INITIAL_CAPACITY);
  #percents = new Float32Array(INITIAL_CAPACITY);
  #head = 0;
  #size = 0;

  constructor({ windowMs = null, basis = 'average', thresholdPoints = 0 }: TrendTrackerOptions = {}) {
    this.#windowMs = windowMs;
    this.#basis = basis;
    this.#thresholdPoints = thresholdPoints;
  }

  // Bulk-loads samples (e.g. from HA's history API) before any live push -
  // out-of-order input is tolerated, sorted once here.
  seed(samples: Sample[]) {
    const sorted = [...samples].sort((a, b) => a.t - b.t);
    this.#reset(sorted.length);
    for (const sample of sorted) this.#append(sample.t, sample.percent);
    this.#evict(Date.now());
  }

  push(percent: number, now: number = Date.now()) {
    this.#append(now, percent);
    this.#evict(now);
  }

  get hasEnoughData(): boolean {
    return this.#size >= 2;
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

  // ─── RING ACCESS ──────────────────────────────────────────────────────────

  #slot(index: number): number {
    return (this.#head + index) % this.#times.length;
  }

  #timeAt(index: number): number {
    return this.#times[this.#slot(index)];
  }

  #percentAt(index: number): number {
    return this.#percents[this.#slot(index)];
  }

  #reset(capacity: number) {
    const size = Math.max(INITIAL_CAPACITY, capacity);
    this.#times = new Float64Array(size);
    this.#percents = new Float32Array(size);
    this.#head = 0;
    this.#size = 0;
  }

  #append(time: number, percent: number) {
    if (this.#size === this.#times.length) this.#grow();
    const slot = this.#slot(this.#size);
    this.#times[slot] = time;
    this.#percents[slot] = percent;
    this.#size++;
  }

  // Capacity is never capped: a window the user asked for must hold what it
  // covers, and silently shortening it would be a wrong reading rather than a
  // smaller one. Eviction reuses the freed slots, so this rarely runs twice.
  #grow() {
    const times = new Float64Array(this.#times.length * 2);
    const percents = new Float32Array(this.#percents.length * 2);
    for (let i = 0; i < this.#size; i++) {
      times[i] = this.#timeAt(i);
      percents[i] = this.#percentAt(i);
    }
    this.#times = times;
    this.#percents = percents;
    this.#head = 0;
  }

  #evict(now: number) {
    if (this.#windowMs === null) {
      // No window (plain `trend_indicator: true`): point-to-point against
      // the last render only, unbounded accumulation would be pure waste.
      if (this.#size > 2) {
        this.#head = this.#slot(this.#size - 2);
        this.#size = 2;
      }
      return;
    }
    const cutoff = now - this.#windowMs;
    while (this.#size > 1 && this.#timeAt(0) < cutoff) {
      this.#head = this.#slot(1);
      this.#size--;
    }
  }

  // ─── COMPUTATION ──────────────────────────────────────────────────────────

  #delta(): number {
    const latest = this.#percentAt(this.#size - 1);
    if (this.#basis === 'edge') return latest - this.#percentAt(0);
    if (this.#basis === 'slope') {
      const timeSpan = this.#timeAt(this.#size - 1) - this.#timeAt(0);
      return timeSpan === 0 ? 0 : this.#slope() * timeSpan;
    }
    let sum = 0;
    for (let i = 0; i < this.#size - 1; i++) sum += this.#percentAt(i);
    return latest - sum / (this.#size - 1);
  }

  // Least-squares slope (percent per ms) over the buffered samples.
  #slope(): number {
    const count = this.#size;
    let sumTime = 0;
    let sumPercent = 0;
    for (let i = 0; i < count; i++) {
      sumTime += this.#timeAt(i);
      sumPercent += this.#percentAt(i);
    }
    const meanTime = sumTime / count;
    const meanPercent = sumPercent / count;
    let num = 0;
    let den = 0;
    for (let i = 0; i < count; i++) {
      const fromMean = this.#timeAt(i) - meanTime;
      num += fromMean * (this.#percentAt(i) - meanPercent);
      den += fromMean * fromMean;
    }
    return den === 0 ? 0 : num / den;
  }
}

export { TrendTracker };
export type { Basis as TrendBasis };
