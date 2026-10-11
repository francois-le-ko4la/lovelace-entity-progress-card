// peak_marker (Card only) on the view side: seeded from history by HACore, then
// fed on every refresh. The tracker holds raw values, `positions` percents.

import { is } from '../utils/common-checks.js';
import {
  MARK_FACTORIZATION,
  PEAK_RANGE_TYPE_DEFAULT,
  peakMarkShown,
  type MarkField,
  type PeakMark,
  type PeakPoint,
} from './schema.js';
import { ThemeManager } from './value-helpers.js';
import { PeakTracker } from './peak-tracker.js';
import type { Reading } from './entity-helper.js';

type PeakMarkType = 'line' | 'round' | 'triangle' | 'blended' | 'area' | 'striped';
type PeakZoneType = 'area' | 'blended' | 'striped';
// peak_marker.range - no value of its own: it spans min to max. The family's
// own `type` can't be its fallback (a line is not a zone), so 'area' is.
type ResolvedPeakZone = {
  shown: boolean;
  type: PeakZoneType;
  opacity: number;
  color: string | null;
};
// One resolved peak_marker.min/.max/.average - shown=false still carries a
// type/opacity/value so callers never need an extra null-check per field.
type ResolvedPeakMark = {
  shown: boolean;
  type: PeakMarkType;
  opacity: number;
  color: string | null;
  line_size: string;
  value: number;
};
export type ResolvedPeakMarker = {
  min: ResolvedPeakMark;
  max: ResolvedPeakMark;
  average: ResolvedPeakMark;
  range: ResolvedPeakZone;
};

type PeakDeps = {
  config: () => unknown;
  reading: () => Reading;
  toPercent: (rawValue: number) => number;
};

export class PeakMarkerView {
  readonly #deps: PeakDeps;
  #tracker: PeakTracker | null = null;
  #positions: { min: number; max: number; average: number } | null = null;

  constructor(deps: PeakDeps) {
    this.#deps = deps;
  }

  get seeded(): boolean {
    return this.#tracker !== null;
  }

  seed(points: { t: number; value: number }[]) {
    const window = (this.#deps.config() as { window?: unknown } | undefined)?.window;
    if (!is.number(window)) return;
    this.#tracker = new PeakTracker(window * 1000);
    this.#tracker.seed(points);
    this.update();
  }

  // Before a re-seed: a previous entity's or window's marks must not linger.
  clear() {
    this.#tracker = null;
    this.#positions = null;
  }

  update() {
    if (!this.#tracker) return;
    const reading = this.#deps.reading();
    if (reading.kind === 'scalar' && is.number(reading.value)) this.#tracker.push(reading.value);
    const peaks = this.#tracker.peaks();
    this.#positions = peaks && {
      min: this.#deps.toPercent(peaks.min),
      max: this.#deps.toPercent(peaks.max),
      average: this.#deps.toPercent(peaks.average),
    };
  }

  get resolved(): ResolvedPeakMarker | null {
    const config = this.#deps.config();
    const positions = this.#positions;
    if (!positions || !is.plainObject(config)) return null;
    // The same table and resolver as the watermark (MARK_FIELDS): a peak mark
    // differs only in existing solely once set.
    const field = (key: string, name: MarkField) =>
      MARK_FACTORIZATION.peak_marker.resolve({ peak_marker: config }, key, name);
    const color = (key: string) => ThemeManager.adaptColor((field(key, 'color') as string | undefined) ?? null);
    const resolve = (key: PeakPoint, value: number): ResolvedPeakMark => ({
      shown: peakMarkShown(config[key] as PeakMark),
      value,
      type: field(key, 'type') as PeakMarkType,
      opacity: field(key, 'opacity') as number,
      line_size: field(key, 'line_size') as string,
      color: color(key),
    });
    return {
      min: resolve('min', positions.min),
      max: resolve('max', positions.max),
      average: resolve('average', positions.average),
      range: {
        shown: peakMarkShown(config.range as PeakMark),
        type: (field('range', 'type') ?? PEAK_RANGE_TYPE_DEFAULT) as PeakZoneType,
        opacity: field('range', 'opacity') as number,
        color: color('range'),
      },
    };
  }
}
