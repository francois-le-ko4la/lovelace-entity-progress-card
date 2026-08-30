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

class TrendTracker {
  #windowMs: number | null;
  #basis: Basis;
  #thresholdPoints: number;
  #samples: Sample[] = [];

  constructor({ windowMs = null, basis = 'average', thresholdPoints = 0 }: TrendTrackerOptions = {}) {
    this.#windowMs = windowMs;
    this.#basis = basis;
    this.#thresholdPoints = thresholdPoints;
  }

  // Bulk-loads samples (e.g. from HA's history API) before any live push -
  // out-of-order input is tolerated, sorted once here.
  seed(samples: Sample[]) {
    this.#samples = [...samples].sort((a, b) => a.t - b.t);
    this.#evict(Date.now());
  }

  push(percent: number, now: number = Date.now()) {
    this.#samples.push({ t: now, percent });
    this.#evict(now);
  }

  get hasEnoughData(): boolean {
    return this.#samples.length >= 2;
  }

  // null = not enough data yet (cold start, or window not covered by any
  // sample) - distinct from a genuinely flat reading, callers show the
  // existing "unknown" icon for it rather than asserting stability.
  direction(): Direction | null {
    if (!this.hasEnoughData) return null;
    const delta = this.#delta();
    if (Math.abs(delta) < this.#thresholdPoints) return 'flat';
    return delta > 0 ? 'up' : 'down';
  }

  #evict(now: number) {
    if (this.#windowMs === null) {
      // No window (plain `trend_indicator: true`): point-to-point against
      // the last render only, unbounded accumulation would be pure waste.
      if (this.#samples.length > 2) this.#samples.splice(0, this.#samples.length - 2);
      return;
    }
    const cutoff = now - this.#windowMs;
    while (this.#samples.length > 1 && this.#samples[0].t < cutoff) this.#samples.shift();
  }

  #delta(): number {
    const latest = this.#samples[this.#samples.length - 1].percent;
    if (this.#basis === 'edge') return latest - this.#samples[0].percent;
    if (this.#basis === 'slope') {
      const timeSpan = this.#samples[this.#samples.length - 1].t - this.#samples[0].t;
      return timeSpan === 0 ? 0 : TrendTracker.#slope(this.#samples) * timeSpan;
    }
    const priors = this.#samples.slice(0, -1);
    return latest - priors.reduce((sum, s) => sum + s.percent, 0) / priors.length;
  }

  // Least-squares slope (percent per ms) over the buffered samples.
  static #slope(samples: Sample[]): number {
    const n = samples.length;
    const meanT = samples.reduce((sum, s) => sum + s.t, 0) / n;
    const meanP = samples.reduce((sum, s) => sum + s.percent, 0) / n;
    let num = 0;
    let den = 0;
    for (const s of samples) {
      num += (s.t - meanT) * (s.percent - meanP);
      den += (s.t - meanT) ** 2;
    }
    return den === 0 ? 0 : num / den;
  }
}

export { TrendTracker };
export type { Basis as TrendBasis };
