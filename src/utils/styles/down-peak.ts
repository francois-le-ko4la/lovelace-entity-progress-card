import { css } from './css-tag.js';
import { CARD } from '../parameters.js';
import { BAR_EFFECT_GRADIENTS, DOWN_BAR } from './shared.js';

const DOWN_PEAK_CSS = css`
/* =============================================================================
   DOWN (bar_orientation: down) - up mirrored top to bottom, by anchors and
   translate directions: a transform on .bar-container left the fill invisible
   in some Firefox/HA setups. The vertical-bar rules above stay the reference.
   ============================================================================= */
${DOWN_BAR} .${CARD.htmlStructure.elements.progressBar.half.class}.positive-zone { top: auto; bottom: 0; }
${DOWN_BAR} .${CARD.htmlStructure.elements.progressBar.half.class}.negative-zone { top: 0; bottom: auto; }

${DOWN_BAR} .${CARD.htmlStructure.elements.progressBar.inner.class} { --inner-transform: translateY(-100%); }
${DOWN_BAR}.transition-ready .${CARD.htmlStructure.elements.progressBar.inner.class} {
  --inner-transform: translateY(calc((var(--inner-size, 0) - 1) * 100%));
}
${DOWN_BAR} .${CARD.htmlStructure.elements.progressBar.inner.class}.positive { --inner-border-radius: 0 0 var(--_r) var(--_r); }
${DOWN_BAR}.${CARD.style.dynamic.progressBar.centerZero} .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-transform: translateY(100%);
  --inner-border-radius: var(--_r) var(--_r) 0 0;
}
${DOWN_BAR}.${CARD.style.dynamic.progressBar.centerZero}.transition-ready .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-transform: translateY(calc((1 - var(--inner-size, 0)) * 100%));
}

${DOWN_BAR} .${CARD.htmlStructure.elements.progressBar.segments.class} { flex-direction: column; }
${DOWN_BAR} .${CARD.htmlStructure.elements.progressBar.half.class}.negative-zone .${CARD.htmlStructure.elements.progressBar.segments.class} { flex-direction: column-reverse; }
${DOWN_BAR} .${CARD.htmlStructure.elements.progressBar.segmentCell.class}::before {
  background-position-y: calc(var(--segment-index, 0) / (var(--bar-segments, 2) - 1) * 100%);
}
${DOWN_BAR} .${CARD.htmlStructure.elements.progressBar.half.class}.negative-zone .${CARD.htmlStructure.elements.progressBar.segmentCell.class}::before {
  background-position-y: calc((1 - var(--segment-index, 0) / (var(--bar-segments, 2) - 1)) * 100%);
}
${DOWN_BAR} .${CARD.htmlStructure.elements.progressBar.bar.class} > .${CARD.htmlStructure.elements.progressBar.segments.class} .${CARD.htmlStructure.elements.progressBar.segmentCell.class}::before,
${DOWN_BAR} .${CARD.htmlStructure.elements.progressBar.half.class}.positive-zone .${CARD.htmlStructure.elements.progressBar.segmentCell.class}::before {
  clip-path: inset(0 0 calc(100% - var(--segment-fill)) 0);
}
${DOWN_BAR} .${CARD.htmlStructure.elements.progressBar.half.class}.negative-zone .${CARD.htmlStructure.elements.progressBar.segmentCell.class}::before {
  clip-path: inset(calc(100% - var(--segment-fill)) 0 0 0);
}

.vertical.down-orientation.${CARD.style.dynamic.progressBar.effect.glass.class} {
  --progress-effect: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  --progress-effect-neg: linear-gradient(0deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
}
.vertical.down-orientation.${CARD.style.dynamic.progressBar.effect.gradient.class},
.vertical.down-orientation.${CARD.style.dynamic.progressBar.effect.gradientReverse.class} {
  --progress-effect-gradient: var(--progress-effect-gradient-down-modern, linear-gradient(180deg, rgba(255, 255, 255, 0.4), transparent));
  --progress-effect-gradient-rev: var(--progress-effect-gradient-rev-down-modern, linear-gradient(0deg, rgba(255, 255, 255, 0.4), transparent));
}
@supports (background: color-mix(in srgb, red, blue)) {
  .vertical.down-orientation.${CARD.style.dynamic.progressBar.effect.gradient.class},
  .vertical.down-orientation.${CARD.style.dynamic.progressBar.effect.gradientReverse.class} {
    --progress-effect-gradient-down-modern: linear-gradient(
      180deg,
      color-mix(in srgb, white 40%, var(--progress-bar-color, var(--state-icon-color))),
      var(--progress-bar-color, var(--state-icon-color))
    );
    --progress-effect-gradient-rev-down-modern: linear-gradient(
      0deg,
      color-mix(in srgb, white 40%, var(--progress-bar-color, var(--state-icon-color))),
      var(--progress-bar-color, var(--state-icon-color))
    );
  }
}
${DOWN_BAR}${BAR_EFFECT_GRADIENTS} .${CARD.htmlStructure.elements.progressBar.inner.class}.positive::before { transform-origin: center bottom; }
${DOWN_BAR}.${CARD.style.dynamic.progressBar.centerZero}${BAR_EFFECT_GRADIENTS} .${CARD.htmlStructure.elements.progressBar.inner.class}.negative::before { transform-origin: center top; }
.vertical.down-orientation.${CARD.style.dynamic.progressBar.effect.shimmer.class} {
  --shimmer-direction: 180deg;
  --shimmer-animation: shimmer-ttb;
}
.vertical.down-orientation.${CARD.style.dynamic.progressBar.effect.shimmerReverse.class} {
  --shimmer-direction: 180deg;
  --shimmer-animation: shimmer-btt;
}

${DOWN_BAR} .mark {
  --mark-top: 0;
  --mark-bottom: auto;
}
${DOWN_BAR} .${CARD.htmlStructure.elements.progressBar.highWatermark.class}:is(.wm-area, .wm-blended, .wm-striped),
${DOWN_BAR} .${CARD.htmlStructure.elements.progressBar.maxMarker.class}:is(.wm-area, .wm-blended, .wm-striped) {
  --mark-top: var(--wm-value);
  --mark-height: calc(100% - var(--wm-value));
}
${DOWN_BAR} .${CARD.htmlStructure.elements.progressBar.rangeMarker.class} {
  --mark-top: var(--peak-min-value, 0%);
  --mark-bottom: auto;
}
${DOWN_BAR} .mark.wm-line {
  --mark-top: var(--wm-position);
  --mark-bottom: auto;
}
${DOWN_BAR} .mark.wm-round {
  --mark-top: var(--wm-value);
  --mark-bottom: auto;
  transform: translate(-50%, -50%);
}
${DOWN_BAR} .mark.wm-triangle {
  --mark-top: calc(var(--wm-value) - var(--wm-half-tri));
  --mark-bottom: auto;
}

/* =============================================================================
   PEAK MARKER (peak_marker: min/max/average from HA history)
   Each mark carries its own type/opacity, unlike watermark's shared low/high
   type - only the value/color inputs live here, the shapes are shared above.
   ============================================================================= */

.${CARD.htmlStructure.elements.progressBar.minMarker.class} {
  --wm-value: var(--peak-min-value, 0%);
  --wm-value-num: var(--peak-min-value-num, 0);
  --wm-color: var(--epb-peak-min-color, var(--peak-min-color, ${CARD.style.dynamic.peakMarker.min.color.default}));
  opacity: var(--epb-peak-min-opacity, var(--peak-min-opacity-value, 0.8));
}
.${CARD.htmlStructure.elements.progressBar.maxMarker.class} {
  --wm-value: var(--peak-max-value, 100%);
  --wm-value-num: var(--peak-max-value-num, 100);
  --wm-color: var(--epb-peak-max-color, var(--peak-max-color, ${CARD.style.dynamic.peakMarker.max.color.default}));
  opacity: var(--epb-peak-max-opacity, var(--peak-max-opacity-value, 0.8));
}
.${CARD.htmlStructure.elements.progressBar.averageMarker.class} {
  --wm-value: var(--peak-average-value, 50%);
  --wm-value-num: var(--peak-average-value-num, 50);
  --wm-color: var(--epb-peak-average-color, var(--peak-average-color, ${CARD.style.dynamic.peakMarker.average.color.default}));
  opacity: var(--epb-peak-average-opacity, var(--peak-average-opacity-value, 0.8));
}

.${CARD.htmlStructure.elements.progressBar.rangeMarker.class} {
  --wm-color: var(--epb-peak-range-color, var(--peak-range-color, ${CARD.style.dynamic.peakMarker.range.color.default}));
  opacity: var(--epb-peak-range-opacity, var(--peak-range-opacity-value, 0.8));
}

/* Line, round and triangle come from the shared .mark.wm-* rules above, and so
   do area, blended and striped - a peak mark takes all six now. */
`;

export { DOWN_PEAK_CSS };
