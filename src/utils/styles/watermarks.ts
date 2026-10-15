import { css } from './css-tag.js';
import { CARD } from '../parameters.js';

const WATERMARKS_CSS = css`
/* =============================================================================
   WATERMARKS
   ============================================================================= */

/* low, high, center */
.mark {
  display: var(--mark-display, none);
  position: absolute;
  box-sizing: border-box;
  opacity: var(--epb-watermark-opacity, var(--watermark-opacity-value, 0.8));

  top: var(--mark-top, 0); /* Horizontal */
  bottom: var(--mark-bottom, auto);
  left: var(--mark-left, auto);
  right: var(--mark-right, auto);
  width: var(--mark-width, 100%);
  height: var(--mark-height, 100%);

  background: var(--mark-background);
}

.vertical-bar .mark {
  --mark-top: auto;
  --mark-bottom: 0;
  --mark-left: 0;
  --mark-width: 100%;
}

/* --- ZERO MARK -- */
.${CARD.htmlStructure.elements.progressBar.zeroMark.class} {
  --mark-display: flex;
  --mark-width: var(--epb-zero-mark-width, 1px);
  --mark-left: 50%;
  --mark-background: var(--epb-zero-mark-color, white);
}

.vertical-bar .${CARD.htmlStructure.elements.progressBar.zeroMark.class} {
  --mark-height: var(--epb-zero-mark-width, 1px);
  --mark-top: 50%;
}

/* Each mark carries its own thickness now, watermark and peak_marker alike -
   a peak line used to read --watermark-line-size through the shared .wm-line
   rule below, whatever the two had to do with each other. .wm-line itself is
   untouched: it still reads one variable, each mark just answers for its own.
   Per-mark value first, then its family's shared one, then the default.
   Qualified by .watermark, which every mark also carries: its own
   --wm-line-size declaration further down would otherwise win on source
   order alone and hand a peak mark the watermark family's thickness. */
.watermark.${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  --wm-line-size: var(--epb-watermark-line-size, var(--low-watermark-line-size, var(--watermark-line-size, 1px)));
}
.watermark.${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --wm-line-size: var(--epb-watermark-line-size, var(--high-watermark-line-size, var(--watermark-line-size, 1px)));
}
.watermark.${CARD.htmlStructure.elements.progressBar.minMarker.class} {
  --wm-line-size: var(--epb-peak-marker-line-size, var(--peak-min-line-size, var(--peak-marker-line-size, 1px)));
}
.watermark.${CARD.htmlStructure.elements.progressBar.maxMarker.class} {
  --wm-line-size: var(--epb-peak-marker-line-size, var(--peak-max-line-size, var(--peak-marker-line-size, 1px)));
}
.watermark.${CARD.htmlStructure.elements.progressBar.averageMarker.class} {
  --wm-line-size: var(--epb-peak-marker-line-size, var(--peak-average-line-size, var(--peak-marker-line-size, 1px)));
}

/* --- Base watermark styles ---*/
.watermark {
  --wm-line-size: var(--epb-watermark-line-size, var(--watermark-line-size, 1px));
  --wm-circle-size: var(--watermark-circle-size, 5px);
  --wm-tri-size: var(--watermark-triangle-size, 8px);
  --wm-half-line: calc(var(--wm-line-size) /2);
  --wm-half-tri-base: calc(var(--wm-tri-size) / 2);
  /* --wm-half-tri-base-modern only exists inside the @supports block below, so
     elsewhere it stays genuinely unset and var()'s fallback takes over. Every
     consumer keeps reading this one variable either way. */
  --wm-half-tri: var(--wm-half-tri-base-modern, var(--wm-half-tri-base));
}

/* Feature-gated via @supports rather than the usual "declare the consuming
   property twice": one custom property resolved once reads cleaner than
   duplicating every declaration touching --wm-half-tri. round() is CSS Values 4
   (Chrome/Edge 114+, Firefox 118+, Safari 16.4+), past the documented 94+
   floor. */
@supports (top: round(down, 1px, 1px)) {
  .watermark {
    --wm-half-tri-base-modern: round(down, calc(var(--wm-tri-size) / 2), 1px);
  }
}

/* top/bottom force a 6px bar, shorter than the default 8px triangle, whose tip
   .bar's overflow: hidden then clipped. 4px (even), not 5px: base is always
   wm-tri-size + 1, and only an even size keeps that base odd without round(). */
.top-container .watermark,
.bottom-container .watermark {
  --wm-tri-size: var(--watermark-triangle-size, 4px);
}

.${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  --wm-value: var(--low-watermark-value, 20%);
  --wm-value-num: var(--low-watermark-value-num, 20);
  --wm-color: var(--epb-low-watermark-color, var(--low-watermark-color, ${CARD.style.dynamic.watermark.low.color.default}));
  /* --epb-watermark-opacity (documented, shared) still overrides both sides
     when set; --epb-low-watermark-opacity is the new, more specific hook. */
  opacity: var(--epb-low-watermark-opacity, var(--epb-watermark-opacity, var(--low-watermark-opacity-value, 0.8)));
}
.${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --wm-value: var(--high-watermark-value, 80%);
  --wm-value-num: var(--high-watermark-value-num, 80);
  --wm-color: var(--epb-high-watermark-color, var(--high-watermark-color, ${CARD.style.dynamic.watermark.high.color.default}));
  opacity: var(--epb-high-watermark-opacity, var(--epb-watermark-opacity, var(--high-watermark-opacity-value, 0.8)));
}
.mark:is(.wm-area, .wm-blended, .wm-line, .wm-round) {
  --mark-background: var(--wm-color);
}

/* ---------- show ----------
   On the mark, like its shape class: one rule covers watermark, peak_marker
   and any future family. */
.mark.${CARD.style.dynamic.markShown} {
  --mark-display: flex;
}

/* ---------- Area, Blended, Striped positioning ---------- */
.${CARD.htmlStructure.elements.progressBar.lowWatermark.class}:is(.wm-area, .wm-blended, .wm-striped),
.${CARD.htmlStructure.elements.progressBar.minMarker.class}:is(.wm-area, .wm-blended, .wm-striped),
.${CARD.htmlStructure.elements.progressBar.averageMarker.class}:is(.wm-area, .wm-blended, .wm-striped) {
  --mark-left: 0;
  --mark-width: var(--wm-value);
}
.${CARD.htmlStructure.elements.progressBar.highWatermark.class}:is(.wm-area, .wm-blended, .wm-striped),
.${CARD.htmlStructure.elements.progressBar.maxMarker.class}:is(.wm-area, .wm-blended, .wm-striped) {
  --mark-right: 0;
  --mark-width: calc(100% - var(--wm-value));
}
/* The band spans two marks instead of anchoring to an edge - the only zone
   geometry the two families don't share. */
.${CARD.htmlStructure.elements.progressBar.rangeMarker.class} {
  --mark-left: var(--peak-min-value, 0%);
  --mark-width: calc(var(--peak-max-value, 100%) - var(--peak-min-value, 0%));
}

/* The horizontal rules above set the width from the value: a vertical zone
   spans the whole bar instead. */
.vertical-bar .${CARD.htmlStructure.elements.progressBar.lowWatermark.class}:is(.wm-area, .wm-blended, .wm-striped),
.vertical-bar .${CARD.htmlStructure.elements.progressBar.minMarker.class}:is(.wm-area, .wm-blended, .wm-striped),
.vertical-bar .${CARD.htmlStructure.elements.progressBar.averageMarker.class}:is(.wm-area, .wm-blended, .wm-striped) {
  --mark-width: 100%;
  --mark-height: var(--wm-value);
}
.vertical-bar .${CARD.htmlStructure.elements.progressBar.highWatermark.class}:is(.wm-area, .wm-blended, .wm-striped),
.vertical-bar .${CARD.htmlStructure.elements.progressBar.maxMarker.class}:is(.wm-area, .wm-blended, .wm-striped) {
  --mark-width: 100%;
  --mark-bottom: var(--wm-value);
  --mark-height: calc(100% - var(--wm-value));
}
.vertical-bar .${CARD.htmlStructure.elements.progressBar.rangeMarker.class} {
  --mark-left: auto;
  --mark-width: 100%;
  --mark-bottom: var(--peak-min-value, 0%);
  --mark-height: calc(var(--peak-max-value, 100%) - var(--peak-min-value, 0%));
}

/* ---------- Blended ---------- */
.mark.wm-blended {
  mix-blend-mode: hard-light;
}

/* ---------- Striped ---------- */
.mark.wm-striped {
  --mark-background: repeating-linear-gradient(-45deg,
    var(--wm-color) 0,
    var(--wm-color) 3px,
    transparent 3px, transparent 6px);
}

/* ---------- Line ---------- */
.mark.wm-line {
  --wm-position: calc(var(--wm-value) - var(--wm-half-line));
  --mark-width: var(--wm-line-size);
  --mark-left: var(--wm-position);
  border: none;
  transform: none;
}
/* Across the whole bar: wm-line's horizontal width and left would leave a 1px dash. */
.vertical-bar .mark.wm-line {
  --mark-width: 100%;
  --mark-left: 0;
  --mark-height: var(--wm-line-size);
  --mark-bottom: var(--wm-position);
}

/* ---------- Round ---------- */
/* Centered by translate, like .value-mark's own circle further down: every bar
   height is even and the circle odd, so a whole-pixel offset can only floor -
   1px more room above than below, flush with the edge at xsmall. A circle's
   edge is antialiased anyway, unlike wm-line's hard 1px one. */
.mark.wm-round {
  --mark-top: 50%;
  --mark-left: var(--wm-value);
  --mark-width: var(--wm-circle-size);
  --mark-height: var(--wm-circle-size);
  border-radius: 50%;
  border: none;
  transform: translate(-50%, -50%);
}
/* Anchored by --mark-bottom here, so the Y translate goes the other way. */
.vertical-bar .mark.wm-round {
  --mark-left: 50%;
  --mark-right: auto;
  --mark-top: auto;
  --mark-bottom: var(--wm-value);
  --mark-width: var(--wm-circle-size);
  transform: translate(-50%, 50%);
}

/* ---------- Triangle ---------- */
/* Widening the base by 1px on the side outside the position formula looks like
   it should move the apex, but doesn't: with width: 0 the apex sits where
   border-left ends, and --wm-half-tri cancels out of left + border-left. */
.mark.wm-triangle {
  --mark-left: calc(var(--wm-value) - var(--wm-half-tri));
  --mark-width: 0;
  --mark-height: 0;
  --mark-background: transparent;
  border-top: var(--wm-tri-size) solid var(--wm-color);
  border-left: var(--wm-half-tri) solid transparent;
  border-right: calc(var(--wm-half-tri) + 1px) solid transparent;
}
.vertical-bar .mark.wm-triangle {
  --mark-left: 0;
  --mark-bottom: calc(var(--wm-value) - var(--wm-half-tri));
  border-right: none;
  border-top: calc(var(--wm-half-tri) + 1px) solid transparent;
  border-left: var(--wm-tri-size) solid var(--wm-color);
  border-bottom: var(--wm-half-tri) solid transparent;
}
`;

export { WATERMARKS_CSS };
