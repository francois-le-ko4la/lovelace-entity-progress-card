// The bar's marks on the card side: watermark and peak marker classes and CSS
// variables. The view resolves them, this paints.

import { CARD } from '../utils/parameters.js';
import { SCHEMA_DEFAULTS, MARK_TYPES, MARK_ZONE_TYPES, PEAK_RANGE_TYPE_DEFAULT, jinjaOf, markValue } from './schema.js';
import type { Config } from '../utils/types.js';
import type { DOMHelper } from './dom-helpers.js';
import type { ViewBase, ViewCore, ResolvedWatermark } from './view.js';

type MarkDeps = {
  view: () => ViewCore;
  dom: () => DOMHelper;
};

// HABase's own number pipeline, with the content and the repaint already bound.
type ApplyJinjaNumber = (
  getJinja: (c: Config) => string | undefined,
  viewProp: 'watermarkLow' | 'watermarkHigh',
) => void;

type MarkVars = {
  value: { var: string };
  opacity: { var: string };
  color: { var: string };
  lineSize: { var: string };
};

type MarkValues = { value: number; opacity: number; color?: string | null; line_size: string };

export class Marks {
  readonly #deps: MarkDeps;

  constructor(deps: MarkDeps) {
    this.#deps = deps;
  }

  watermarkClasses() {
    const watermark = this.#deps.view().watermark;
    if (!watermark) return;

    const pb = CARD.htmlStructure.elements.progressBar;
    const ring = CARD.htmlStructure.elements.ringMarks;
    // The bar's mark and its ring twin: only one of them is ever built.
    (
      [
        [[pb.highWatermark.class, ring.high.class], watermark.high],
        [[pb.lowWatermark.class, ring.low.class], watermark.low],
      ] as const
    ).forEach(([keys, mark]) => {
      for (const markKey of keys) {
        this.#show(markKey, mark.shown);
        this.#shape(markKey, mark.type, MARK_TYPES, SCHEMA_DEFAULTS.watermark.type);
      }
    });
  }

  peakMarkerClasses() {
    const marker = this.#deps.view().entityView?.peakMarker;
    if (!marker) return;

    const pb = CARD.htmlStructure.elements.progressBar;
    const ring = CARD.htmlStructure.elements.ringMarks;
    // The bar's mark and its ring twin: only one of them is ever built.
    const markKeys = {
      min: [pb.minMarker.class, ring.min.class],
      max: [pb.maxMarker.class, ring.max.class],
      avg: [pb.averageMarker.class, ring.avg.class],
    };
    (
      [
        ['min', marker.min],
        ['max', marker.max],
        ['avg', marker.average],
      ] as const
    ).forEach(([key, mark]) => {
      for (const markKey of markKeys[key]) {
        this.#show(markKey, mark.shown);
        this.#shape(markKey, mark.type, MARK_TYPES, SCHEMA_DEFAULTS.peakMarker.type);
      }
    });
    for (const markKey of [pb.rangeMarker.class, ring.range.class]) {
      this.#show(markKey, marker.range.shown);
      this.#shape(markKey, marker.range.type, MARK_ZONE_TYPES, PEAK_RANGE_TYPE_DEFAULT);
    }
  }

  // The position itself is resolved in the repaint, from the view's watermark.
  static jinjaHandlers(applyJinjaNumber: ApplyJinjaNumber): Record<string, () => void> {
    return {
      'watermark.low': () =>
        applyJinjaNumber((c) => jinjaOf(markValue(c.watermark?.low, SCHEMA_DEFAULTS.watermark.low)), 'watermarkLow'),
      'watermark.high': () =>
        applyJinjaNumber((c) => jinjaOf(markValue(c.watermark?.high, SCHEMA_DEFAULTS.watermark.high)), 'watermarkHigh'),
    };
  }

  watermarkCSS(watermark: ResolvedWatermark | null) {
    if (!watermark) return;
    const dom = this.#deps.dom();
    const cardKey = CARD.htmlStructure.card.element;
    const wm = CARD.style.dynamic.watermark;
    (
      [
        [wm.low, watermark.low],
        [wm.high, watermark.high],
      ] as const
    ).forEach(([vars, mark]) => this.#markCSS(cardKey, vars, mark));
    dom.setStyle(cardKey, wm.opacity.var, watermark.opacity);
    dom.setStyle(cardKey, wm.lineSize.var, watermark.line_size);
  }

  peakMarkerCSS(marker: ViewBase['peakMarker']) {
    if (!marker) return;
    const dom = this.#deps.dom();
    const cardKey = CARD.htmlStructure.card.element;
    const pm = CARD.style.dynamic.peakMarker;
    (
      [
        [pm.min, marker.min],
        [pm.max, marker.max],
        [pm.average, marker.average],
      ] as const
    ).forEach(([vars, mark]) => this.#markCSS(cardKey, vars, mark));
    dom.setStyle(cardKey, pm.lineSize.var, this.#deps.view().config.peak_marker?.line_size);
    // Geometry excepted: the band reads --peak-min-value/--peak-max-value,
    // both set just above whether their own mark is drawn or not.
    dom.setStyle(cardKey, pm.range.opacity.var, marker.range.opacity);
    dom.setOrRemoveStyle(cardKey, pm.range.color.var, marker.range.color);
  }

  #show(markKey: string, shown: boolean) {
    this.#deps.dom().toggleClass(markKey, CARD.style.dynamic.markShown, shown);
  }

  // The shape class sits on the mark itself, so one CSS rule per shape serves
  // every family (watermark, peak_marker) instead of one per family x shape.
  #shape(markKey: string, type: string, shapes: readonly string[], fallback: string) {
    const shape = shapes.includes(type) ? type : fallback;
    // Every shape is toggled: toggleClass alone would leave the previous one.
    for (const candidate of shapes) this.#deps.dom().toggleClass(markKey, `wm-${candidate}`, candidate === shape);
  }

  // The bare-number `-num` companion is read by the bar_segments position
  // compensation (styles.ts), which needs a plain number, not a percentage.
  #markCSS(cardKey: string, vars: MarkVars, mark: MarkValues) {
    const dom = this.#deps.dom();
    dom.setStyle(cardKey, vars.value.var, `${mark.value}%`);
    dom.setStyle(cardKey, `${vars.value.var}-num`, mark.value);
    dom.setStyle(cardKey, vars.opacity.var, mark.opacity);
    dom.setStyle(cardKey, vars.lineSize.var, mark.line_size);
    dom.setOrRemoveStyle(cardKey, vars.color.var, mark.color);
  }
}
