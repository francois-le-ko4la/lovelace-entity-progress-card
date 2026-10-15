import { css } from './css-tag.js';
import { CARD } from '../parameters.js';

const BAR_CSS = css`
/* =============================================================================
   PROGRESS BAR
   ============================================================================= */

/* ==== CONTAINER === */

.${CARD.htmlStructure.elements.progressBar.container.class} {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  /* Positioning context for .value-mark (rainbow_full's marker) - it sits
     here rather than inside .bar precisely so it isn't clipped by .bar's own
     overflow: hidden (see StructureElements.progressBar). */
  position: relative;
  /* Without a floor the bar absorbed 100% of the horizontal squeeze while its
     row sibling already had one, shrinking to a sliver before the text gave up
     anything. min(X, 33%) couples the two floors (text caps lower at 25%: a
     squeezed bar loses its purpose, a label still has its ellipsis); 33%+25%
     leaves room for the row's own gap, which percentages don't account for. */
  min-width: min(var(--epb-progress-bar-min-width, 30px), 33%);
  /* A dedicated override slot, same idea as --current-specific-padding-top:
     --current-progress-container-height is *inherited*, and .container (an
     ancestor) carries the same 'vertical' class its generic rule keys off, so
     .container's own declaration always beat anything set further up. Still
     behind --type-entities-combined-line-height, the user's own override. */
  height: var(
    --type-entities-combined-line-height,
    var(--current-specific-progress-container-height, var(--current-progress-container-height))
  );
}

.overlay .${CARD.htmlStructure.elements.progressBar.container.class} {
  position: absolute;
  width: 100%;
  height: 100%;
}

/* .bar-container is absolutely positioned, so it never contributes to
   ha-card's own auto-height - fine for ltr/rtl, where the bar lies over content
   that already sizes the card. .vertical.up-orientation needs real vertical
   room, so it falls back to 100% instead of shrinking to content. */
.vertical.up-orientation.overlay {
  --current-height-fallback: 100%;
}

.${CARD.layout.orientations.horizontal.label}.${CARD.style.bar.sizeOptions.xsmall} .${CARD.htmlStructure.elements.progressBar.container.class},
.${CARD.layout.orientations.horizontal.label}.${CARD.style.bar.sizeOptions.small} .${CARD.htmlStructure.elements.progressBar.container.class},
.${CARD.layout.orientations.horizontal.label}.${CARD.style.bar.sizeOptions.medium} .${CARD.htmlStructure.elements.progressBar.container.class},
.${CARD.layout.orientations.horizontal.label}.${CARD.style.bar.sizeOptions.large} .${CARD.htmlStructure.elements.progressBar.container.class} {
  max-width: var(${CARD.style.dynamic.progressBar.maxWidth.var}, ${CARD.style.dynamic.progressBar.maxWidth.default});
}

.horizontal {
  --current-progress-container-height: var(--progress-container-height);
}
.vertical {
  --current-progress-container-height: var(--progress-size);
}

.vertical.xlarge .bar-container {
  margin-top: 23px;
}

/* ==== BAR === */
.${CARD.htmlStructure.elements.progressBar.bar.class} {
  --bar-radius: var(--ha-standard-border-radius);

  position: relative;
  height: var(--bar-height, var(--progress-size, 100%));
  max-height: var(--bar-max-height, var(--progress-size, 100%));
  width: 100%;
  flex-grow: var(--bar-flex-grow);
  overflow: hidden;
  background-color: var(${CARD.style.dynamic.progressBar.background.var}, var(--divider-color));
  border-radius: var(--epb-progress-bar-radius, var(--bar-radius));
}

.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.progressBar.bar.class} {
  --bar-flex-grow: 0;
}

.overlay .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.progressBar.bar.class} {
  --bar-height: 100%;
  --bar-max-height: 100%;
}

/* ==== HALF ZONES (center-zero clipping containers) === */
.${CARD.htmlStructure.elements.progressBar.half.class} {
  position: absolute;
  overflow: hidden;
}
.horizontal-bar .${CARD.htmlStructure.elements.progressBar.half.class} {
  top: 0;
  bottom: 0;
  width: 50%;
}
.horizontal-bar .${CARD.htmlStructure.elements.progressBar.half.class}.negative-zone { left: 0; }
.horizontal-bar .${CARD.htmlStructure.elements.progressBar.half.class}.positive-zone { right: 0; }

.vertical-bar .${CARD.htmlStructure.elements.progressBar.half.class} {
  left: 0;
  right: 0;
  height: 50%;
}
.vertical-bar .${CARD.htmlStructure.elements.progressBar.half.class}.positive-zone { top: 0; }
.vertical-bar .${CARD.htmlStructure.elements.progressBar.half.class}.negative-zone { bottom: 0; }

/* ==== INNER === */

/* --- Base ---*/
.${CARD.htmlStructure.elements.progressBar.inner.class} {
  --inner-radius: 0; /* radius value */
  --_r: var(--epb-progress-inner-radius, var(--inner-radius)); /* user choice Vs system value */
  --inner-border-radius: var(--_r); /* schema */

  position: absolute;
  inset: 0;

  background: var(--inner-background);
  border-radius: var(--inner-border-radius);

  transform: var(--inner-transform, translateX(-100%));
  will-change: transform;
  backface-visibility: hidden;
  contain: layout paint;
}

/* --- Animation ---*/
.horizontal-bar .${CARD.htmlStructure.elements.progressBar.inner.class} {
  --inner-transform: translateX(-100%);
}
.horizontal-bar.transition-ready .${CARD.htmlStructure.elements.progressBar.inner.class} {
  --inner-transform: translateX(calc((var(--inner-size, 0) - 1) * 100%));
  transition: transform var(--progress-transition);
}
.vertical-bar .${CARD.htmlStructure.elements.progressBar.inner.class} {
  --inner-transform: translateY(100%);
}
.vertical-bar.transition-ready .${CARD.htmlStructure.elements.progressBar.inner.class} {
  --inner-transform: translateY(calc((1 - var(--inner-size, 0)) * 100%));
  transition: transform var(--progress-transition);
}

/*  center zero - positiveInner (right half, grows from center to the right) */
.center-zero.horizontal-bar .${CARD.htmlStructure.elements.progressBar.inner.class}.positive {
  --inner-border-radius: 0 var(--_r) var(--_r) 0;
}

/* center zero - negativeInner (left half, grows from center to the left) */
.center-zero.horizontal-bar .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-transform: translateX(100%); /* same hiding direction as value=0 once "ready" */
  --inner-border-radius: var(--_r) 0 0 var(--_r);
}
.center-zero.horizontal-bar.transition-ready .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-transform: translateX(calc((1 - var(--inner-size, 0)) * 100%));
}

/* --- Vertical --- */
.vertical-bar .${CARD.htmlStructure.elements.progressBar.inner.class}.positive {
  --inner-border-radius: var(--_r) var(--_r) 0 0;
}
.vertical-bar.center-zero .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-transform: translateY(-100%); /* same hiding direction as value=0 once "ready" */
  --inner-border-radius: 0 0 var(--_r) var(--_r);
}
.vertical-bar.center-zero.transition-ready .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-transform: translateY(calc((1 - var(--inner-size, 0)) * -100%));
}

/* --inner-background lives on .bar/.bar-half.negative-zone, not .inner
   itself, so a sibling .segment-cell (bar_segments) can inherit it too -
   .inner reads the same value back below, just by inheritance now. */
.${CARD.htmlStructure.elements.progressBar.bar.class} {
  --inner-background: var(--epb-progress-bar-color, var(--progress-effect, var(${CARD.style.dynamic.progressBar.stackGradientPos.var}, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default}))));
}
.${CARD.htmlStructure.elements.progressBar.half.class}.negative-zone {
  --inner-background: var(--epb-progress-bar-color, var(--progress-effect-neg, var(${CARD.style.dynamic.progressBar.stackGradientNeg.var}, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default}))));
}
.${CARD.htmlStructure.elements.progressBar.inner.class}.positive {
  --inner-size: var(${CARD.style.dynamic.progressBar.stackSizePos.var}, max(var(${CARD.style.dynamic.progressBar.value.var}, 0), 0));
}
.center-zero .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-size: var(${CARD.style.dynamic.progressBar.stackSizeNeg.var}, max(calc(var(${CARD.style.dynamic.progressBar.value.var}, 0) * -1), 0));
}

/* === ORIENTATION === */
/* On .bar-container, not .bar: .value-mark (rainbow_full's marker) sits in the
   container as .bar's sibling to escape .bar's own overflow: hidden, so
   flipping only .bar left the marker on the wrong side of the mirrored fill.
   .bar is flex-centered in the container, so its own pixels are unchanged. */
.${CARD.style.dynamic.progressBar.orientation.rtl} .${CARD.htmlStructure.elements.progressBar.container.class} {
  transform: scaleX(-1);
}
`;

export { BAR_CSS };
