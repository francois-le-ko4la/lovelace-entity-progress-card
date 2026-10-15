import { css } from './css-tag.js';
import { CARD } from '../parameters.js';

const BAR_SEGMENTS_CSS = css`
/* === SEGMENTED BAR (bar_segments: N, buildSegmentCells) ===
   N real cells with a real flex gap, not a divider painted over the fill (a
   divider landing on a marker hid it). border-radius forced to 0 on .bar:
   its rounded corner would round the first/last cell unevenly. */
.bar-segmented .${CARD.htmlStructure.elements.progressBar.bar.class} {
  border-radius: 0;
  /* Each cell paints its own share of the track, so .bar's own would only
     ever show through the gaps - which is what makes them real holes. */
  background-color: transparent;
}

/* Replaced by the cell row in segmented mode - left visible, its own
   continuous fill would show right through every gap. */
.bar-segmented .${CARD.htmlStructure.elements.progressBar.inner.class} {
  display: none;
}

/* --bar-segments/gap live on .bar itself, not .segments - a watermark/
   peak_marker mark sits alongside .segments as .bar's own child, never
   inside it, so it can only ever inherit what .bar itself carries (see the
   mark compensation rules further down). */
.bar-segmented .${CARD.htmlStructure.elements.progressBar.bar.class} {
  /* Fixed fallback tier, superseded by the length-relative one below
     wherever it resolves. */
  --bar-segment-gap: 3px;
  --bar-segment-gap-final: var(--bar-segment-gap-modern, var(--bar-segment-gap));
  /* --epb-bar-segment-gap (theme.md) overrides the computed gap - read here
     too, or a themed gap would only move the real cells, not the marks. */
  --bar-segment-gap-effective: var(--epb-bar-segment-gap, var(--bar-segment-gap-final));
}

/* Modern tier, gated on round()/mod() (CSS Values 4), past the documented
   94+ floor. */
@supports (top: round(down, 1px, 1px)) {
  .bar-segmented .${CARD.htmlStructure.elements.progressBar.bar.class} {
    /* One segment's own share of the bar's length, clamped to [3px, 9px]. */
    --bar-segment-gap-floor: round(down, calc(100% / var(--bar-segments, 10) * 0.4), 1px);
    --bar-segment-gap-modern: clamp(
      3px,
      calc(var(--bar-segment-gap-floor) + 1px - mod(var(--bar-segment-gap-floor), 2px)),
      9px
    );
  }
}

.${CARD.style.bar.sizeOptions.medium} .${CARD.htmlStructure.elements.progressBar.bar.class},
.${CARD.style.bar.sizeOptions.large} .${CARD.htmlStructure.elements.progressBar.bar.class},
.${CARD.style.bar.sizeOptions.xlarge} .${CARD.htmlStructure.elements.progressBar.bar.class} {
  --bar-segment-gap: 5px;
}

/* top/bottom/overlay/background have no bar_size class to key off of above
   (schema.ts deletes it for these four) - fixed values instead. Plain
   descendant selectors, not compounded with .bar-segmented: .top-container/
   .bottom-container are a separate wrapper div, not a root class. */
.top-container .${CARD.htmlStructure.elements.progressBar.bar.class},
.bottom-container .${CARD.htmlStructure.elements.progressBar.bar.class} {
  --bar-segment-gap: 3px;
}

.overlay .${CARD.htmlStructure.elements.progressBar.bar.class},
.background .${CARD.htmlStructure.elements.progressBar.bar.class} {
  --bar-segment-gap: 5px;
}

.${CARD.htmlStructure.elements.progressBar.segments.class} {
  position: absolute;
  inset: 0;
  display: flex;
  pointer-events: none;
  gap: var(--bar-segment-gap-effective);
  /* Painted by nothing on purpose: copying the card color only reads as a cut
     while the card really is that color - frameless and any translucent card
     already make that false. Empty, the gap shows what is truly behind. */
}

/* --- Cell layout & windowing ---
   Only vertical (bottom-up) and the negative arm need an explicit direction.
   Fill lives on ::before: the cell's own background is the empty track. */
.${CARD.htmlStructure.elements.progressBar.segmentCell.class} {
  position: relative;
  flex: 1 1 0%;
  overflow: hidden;
  background-color: var(${CARD.style.dynamic.progressBar.background.var}, var(--divider-color));
}
.${CARD.htmlStructure.elements.progressBar.segmentCell.class}::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--inner-background);
}

.vertical-bar .${CARD.htmlStructure.elements.progressBar.segments.class} {
  flex-direction: column-reverse;
}
.horizontal-bar .${CARD.htmlStructure.elements.progressBar.half.class}.negative-zone .${CARD.htmlStructure.elements.progressBar.segments.class} {
  flex-direction: row-reverse;
}
.vertical-bar .${CARD.htmlStructure.elements.progressBar.half.class}.negative-zone .${CARD.htmlStructure.elements.progressBar.segments.class} {
  flex-direction: column;
}

/* background-size N cells wide turns the whole row back into one
   window onto --inner-background; -position places each cell at its own
   --segment-index-th slice. The two "flipped" cases mirror the
   flex-direction overrides just above - same anchor, opposite formula. */
.horizontal-bar .${CARD.htmlStructure.elements.progressBar.segmentCell.class}::before {
  background-size: calc(var(--bar-segments, 2) * 100%) 100%;
  background-position-x: calc(var(--segment-index, 0) / (var(--bar-segments, 2) - 1) * 100%);
}
.vertical-bar .${CARD.htmlStructure.elements.progressBar.segmentCell.class}::before {
  background-size: 100% calc(var(--bar-segments, 2) * 100%);
  background-position-y: calc((1 - var(--segment-index, 0) / (var(--bar-segments, 2) - 1)) * 100%);
}
.horizontal-bar .${CARD.htmlStructure.elements.progressBar.half.class}.negative-zone .${CARD.htmlStructure.elements.progressBar.segmentCell.class}::before {
  background-position-x: calc((1 - var(--segment-index, 0) / (var(--bar-segments, 2) - 1)) * 100%);
}
.vertical-bar .${CARD.htmlStructure.elements.progressBar.half.class}.negative-zone .${CARD.htmlStructure.elements.progressBar.segmentCell.class}::before {
  background-position-y: calc(var(--segment-index, 0) / (var(--bar-segments, 2) - 1) * 100%);
}

/* --- Fill amount & reveal ---
   One fill fraction for the whole row, off the same --progress-bar-value
   .inner reads. .bar > .segments excludes center_zero's arms, nested one
   level deeper via .bar-half. */
.${CARD.htmlStructure.elements.progressBar.bar.class}
  > .${CARD.htmlStructure.elements.progressBar.segments.class}
  .${CARD.htmlStructure.elements.progressBar.segmentCell.class} {
  --segment-fill: clamp(
    0%,
    calc((var(${CARD.style.dynamic.progressBar.value.var}, 0) * var(--bar-segments, 2) - var(--segment-index, 0)) * 100%),
    100%
  );
}

/* --arm-fill mirrors .inner.positive/.negative's own --inner-size exactly
   (a theme/bar_stack diverging size first, the signed value as fallback) -
   using only the fallback half broke a themed/stacked center_zero bar. */
.${CARD.htmlStructure.elements.progressBar.half.class}.positive-zone {
  --arm-fill: var(${CARD.style.dynamic.progressBar.stackSizePos.var}, max(var(${CARD.style.dynamic.progressBar.value.var}, 0), 0));
}
.${CARD.htmlStructure.elements.progressBar.half.class}.negative-zone {
  --arm-fill: var(${CARD.style.dynamic.progressBar.stackSizeNeg.var}, max(calc(var(${CARD.style.dynamic.progressBar.value.var}, 0) * -1), 0));
}
.${CARD.htmlStructure.elements.progressBar.half.class} .${CARD.htmlStructure.elements.progressBar.segmentCell.class} {
  --segment-fill: clamp(
    0%,
    calc((var(--arm-fill, 0) * var(--bar-segments, 2) - var(--segment-index, 0)) * 100%),
    100%
  );
}

/* Plain bar and the positive arm share an anchor but need separate selectors:
   .bar > .segments excludes center_zero's arms from the rule above, so the
   positive arm needs its own match. Grouped - identical formula. */
.horizontal-bar
  .${CARD.htmlStructure.elements.progressBar.bar.class}
  > .${CARD.htmlStructure.elements.progressBar.segments.class}
  .${CARD.htmlStructure.elements.progressBar.segmentCell.class}::before,
.horizontal-bar .${CARD.htmlStructure.elements.progressBar.half.class}.positive-zone .${CARD.htmlStructure.elements.progressBar.segmentCell.class}::before {
  clip-path: inset(0 calc(100% - var(--segment-fill)) 0 0);
}
.vertical-bar
  .${CARD.htmlStructure.elements.progressBar.bar.class}
  > .${CARD.htmlStructure.elements.progressBar.segments.class}
  .${CARD.htmlStructure.elements.progressBar.segmentCell.class}::before,
.vertical-bar .${CARD.htmlStructure.elements.progressBar.half.class}.positive-zone .${CARD.htmlStructure.elements.progressBar.segmentCell.class}::before {
  clip-path: inset(calc(100% - var(--segment-fill)) 0 0 0);
}
.horizontal-bar .${CARD.htmlStructure.elements.progressBar.half.class}.negative-zone .${CARD.htmlStructure.elements.progressBar.segmentCell.class}::before {
  clip-path: inset(0 0 0 calc(100% - var(--segment-fill)));
}
.vertical-bar .${CARD.htmlStructure.elements.progressBar.half.class}.negative-zone .${CARD.htmlStructure.elements.progressBar.segmentCell.class}::before {
  clip-path: inset(0 0 calc(100% - var(--segment-fill)) 0);
}

/* Gaps make cellWidth narrower than 100%/N, so every internal boundary sits
   left of the naive value% (only 0%/100% line up). Same slot/index/frac split
   as --segment-fill, applied to position: continuous within a cell. */
@supports (top: round(down, 1px, 1px)) {
  .bar-segmented.${CARD.style.dynamic.progressBar.centerZero} .${CARD.htmlStructure.elements.progressBar.bar.class} {
    --bar-segment-gap-cz-floor: round(down, calc(50% / var(--bar-segments, 10) * 0.4), 1px);
    --bar-segment-gap-cz-modern: clamp(
      3px,
      calc(var(--bar-segment-gap-cz-floor) + 1px - mod(var(--bar-segment-gap-cz-floor), 2px)),
      9px
    );
    --bar-segment-gap-cz-final: var(--bar-segment-gap-cz-modern, var(--bar-segment-gap));
    --bar-segment-gap-cz-effective: var(--epb-bar-segment-gap, var(--bar-segment-gap-cz-final));
  }

  .bar-segmented:not(.${CARD.style.dynamic.progressBar.centerZero}) .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
  .bar-segmented:not(.${CARD.style.dynamic.progressBar.centerZero}) .${CARD.htmlStructure.elements.progressBar.highWatermark.class},
  .bar-segmented:not(.${CARD.style.dynamic.progressBar.centerZero}) .${CARD.htmlStructure.elements.progressBar.minMarker.class},
  .bar-segmented:not(.${CARD.style.dynamic.progressBar.centerZero}) .${CARD.htmlStructure.elements.progressBar.maxMarker.class},
  .bar-segmented:not(.${CARD.style.dynamic.progressBar.centerZero}) .${CARD.htmlStructure.elements.progressBar.averageMarker.class} {
    --segment-slot: calc(var(--wm-value-num, 0) / 100 * var(--bar-segments, 2));
    --segment-cell-index: clamp(0, round(down, var(--segment-slot), 1), calc(var(--bar-segments, 2) - 1));
    --segment-frac: calc(var(--segment-slot) - var(--segment-cell-index));
    --segment-cell-width: calc(
      (100% - (var(--bar-segments, 2) - 1) * var(--bar-segment-gap-effective)) / var(--bar-segments, 2)
    );
    --wm-value: calc(
      var(--segment-cell-index) * (var(--segment-cell-width) + var(--bar-segment-gap-effective)) +
        var(--segment-frac) * var(--segment-cell-width)
    );
  }

  .bar-segmented.${CARD.style.dynamic.progressBar.centerZero} .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
  .bar-segmented.${CARD.style.dynamic.progressBar.centerZero} .${CARD.htmlStructure.elements.progressBar.highWatermark.class},
  .bar-segmented.${CARD.style.dynamic.progressBar.centerZero} .${CARD.htmlStructure.elements.progressBar.minMarker.class},
  .bar-segmented.${CARD.style.dynamic.progressBar.centerZero} .${CARD.htmlStructure.elements.progressBar.maxMarker.class},
  .bar-segmented.${CARD.style.dynamic.progressBar.centerZero} .${CARD.htmlStructure.elements.progressBar.averageMarker.class} {
    --segment-cell-width: calc(
      (50% - (var(--bar-segments, 2) - 1) * var(--bar-segment-gap-cz-effective)) / var(--bar-segments, 2)
    );
    --segment-slot-pos: calc(max(0, var(--wm-value-num, 0) - 50) * 2 / 100 * var(--bar-segments, 2));
    --segment-cell-index-pos: clamp(0, round(down, var(--segment-slot-pos), 1), calc(var(--bar-segments, 2) - 1));
    --segment-frac-pos: calc(var(--segment-slot-pos) - var(--segment-cell-index-pos));
    --segment-offset-pos: calc(
      var(--segment-cell-index-pos) * (var(--segment-cell-width) + var(--bar-segment-gap-cz-effective)) +
        var(--segment-frac-pos) * var(--segment-cell-width)
    );
    --segment-slot-neg: calc(max(0, 50 - var(--wm-value-num, 0)) * 2 / 100 * var(--bar-segments, 2));
    --segment-cell-index-neg: clamp(0, round(down, var(--segment-slot-neg), 1), calc(var(--bar-segments, 2) - 1));
    --segment-frac-neg: calc(var(--segment-slot-neg) - var(--segment-cell-index-neg));
    --segment-offset-neg: calc(
      var(--segment-cell-index-neg) * (var(--segment-cell-width) + var(--bar-segment-gap-cz-effective)) +
        var(--segment-frac-neg) * var(--segment-cell-width)
    );
    --wm-value: calc(50% + var(--segment-offset-pos, 0) - var(--segment-offset-neg, 0));
  }
}
`;

export { BAR_SEGMENTS_CSS };
