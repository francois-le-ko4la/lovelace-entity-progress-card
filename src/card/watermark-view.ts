// watermark on the view side: low/high bounds (a number, an entity, or Jinja)
// resolved into what Marks draws. Counterpart of PeakMarkerView.

import {
  markShown,
  markValue,
  MARK_FACTORIZATION,
  SCHEMA_DEFAULTS,
  type MarkField,
  type Infer,
  type YamlSchemaFactory,
} from './schema.js';
import { boundFrom, boundUsable, boundValue, refreshBound, type Bound } from './bound-value.js';
import { ThemeManager } from './value-helpers.js';
import type { JinjaState } from './jinja-state.js';

// Read off the schema, not restated: a field it gains is in the type at once.
type WatermarkConfig = NonNullable<Infer<typeof YamlSchemaFactory.card>['watermark']>;
type WatermarkType = 'blended' | 'area' | 'striped' | 'triangle' | 'round' | 'line';
type WatermarkSide = 'low' | 'high';

// type/opacity are never undefined here (unlike WatermarkConfig's own) -
// `resolved` always resolves them against SCHEMA_DEFAULTS.watermark first.
type ResolvedWatermarkMark = {
  shown: boolean;
  value: number;
  type: WatermarkType;
  opacity: number;
  color: string | null;
  line_size: string;
};
type ResolvedWatermark = {
  low: ResolvedWatermarkMark;
  high: ResolvedWatermarkMark;
  opacity: number;
  type: WatermarkType;
  line_size: string;
};

type WatermarkDeps = {
  config: () => WatermarkConfig | undefined;
  jinjaState: JinjaState;
  // How a raw value becomes a bar position: the view's scale, not the mark's.
  toPos: () => (value: number | null, side: WatermarkSide) => number;
};

const JINJA_PATH: Record<WatermarkSide, string> = { low: 'watermark.low', high: 'watermark.high' };

export class WatermarkView {
  readonly #deps: WatermarkDeps;
  #bounds: Record<WatermarkSide, Bound> = { low: null, high: null };

  constructor(deps: WatermarkDeps) {
    this.#deps = deps;
  }

  // On every config: the Jinja overrides are reset by the caller's JinjaState.
  apply() {
    const watermark = this.#deps.config();
    this.#bounds = {
      low: boundFrom(markValue(watermark?.low, SCHEMA_DEFAULTS.watermark.low), null),
      high: boundFrom(markValue(watermark?.high, SCHEMA_DEFAULTS.watermark.high), null),
    };
  }

  refresh() {
    refreshBound(this.#bounds.low);
    refreshBound(this.#bounds.high);
  }

  // A mark whose entity or Jinja is in a fault state is dropped; the bar stays.
  #usable(side: WatermarkSide): boolean {
    return boundUsable(this.#bounds[side]) && this.#deps.jinjaState.failure(JINJA_PATH[side]) === null;
  }

  get resolved(): ResolvedWatermark | null {
    const watermark = this.#deps.config();
    if (!watermark) return null;
    const { jinjaState } = this.#deps;
    const toPos = this.#deps.toPos();
    // type/opacity carry no schema default (see WatermarkConfig) - applied
    // here from SCHEMA_DEFAULTS.watermark instead.
    const globalType = watermark.type ?? SCHEMA_DEFAULTS.watermark.type;
    const globalOpacity = watermark.opacity ?? SCHEMA_DEFAULTS.watermark.opacity;
    const field = (side: WatermarkSide, name: MarkField) =>
      MARK_FACTORIZATION.watermark.resolve({ watermark }, side, name);
    const jinja: Record<WatermarkSide, number | null> = {
      low: jinjaState.watermarkLow,
      high: jinjaState.watermarkHigh,
    };
    const resolveMark = (side: WatermarkSide): ResolvedWatermarkMark => ({
      shown: markShown(watermark[side]) && this.#usable(side),
      value: toPos(jinja[side] ?? boundValue(this.#bounds[side]), side),
      type: (field(side, 'type') ?? globalType) as WatermarkType,
      opacity: (field(side, 'opacity') ?? globalOpacity) as number,
      color: ThemeManager.adaptColor((field(side, 'color') as string | undefined) ?? null),
      line_size: (field(side, 'line_size') ?? watermark.line_size) as string,
    });
    return {
      low: resolveMark('low'),
      high: resolveMark('high'),
      opacity: globalOpacity,
      type: globalType as WatermarkType,
      line_size: watermark.line_size,
    };
  }
}

export type { ResolvedWatermark, WatermarkConfig, WatermarkSide };
