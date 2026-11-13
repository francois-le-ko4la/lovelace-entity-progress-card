import { css } from './css-tag.js';
import { CARD } from '../parameters.js';
import { BAR_EFFECT_GRADIENTS } from './shared.js';

// One period of a wave crest, 14px tall, filled below the line.
const waveCrest = (width: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='14'>` +
      `<path d='M0 7Q${width / 4} 1 ${width / 2} 7T${width} 7V14H0Z'/></svg>`,
  )}")`;
// Chrome < 120 and Safari only read the prefixed mask properties.
const mask = (property: string, value: string) => `-webkit-mask-${property}: ${value}; mask-${property}: ${value};`;
// Up only: down fills from the top, and its crest would hang upside down.
const WAVE_INNER = `.vertical-bar:not(.${CARD.style.dynamic.progressBar.orientation.down}).${CARD.style.dynamic.progressBar.effect.wave.class} .${CARD.htmlStructure.elements.progressBar.inner.class}.positive`;
const BUBBLE = 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0 1.5px, transparent 2px) no-repeat';

const BAR_VARIANTS_CSS = css`
/* === RADIUS EFFECT === */
/* positiveInner / negativeInner */
.entity-progress-feature
  :is(.${CARD.htmlStructure.elements.progressBar.bar.class},
    .${CARD.htmlStructure.elements.progressBar.inner.class}) {
  --bar-radius: var(--feature-border-radius);
  --inner-radius: var(--feature-border-radius);
}

/* positiveInner / negativeInner */
:is(.top-container, .bottom-container)
  :is(.${CARD.htmlStructure.elements.progressBar.bar.class},
    .${CARD.htmlStructure.elements.progressBar.inner.class}) {
  --bar-radius: 0;
  --inner-radius: 0;
}

/* positiveInner / negativeInner */
.${CARD.style.dynamic.progressBar.effect.radius.class}
  :is(.${CARD.htmlStructure.elements.progressBar.inner.class}) {
  --inner-radius: var(--ha-standard-border-radius);
}

/* === VARIANTS === */
/* ----- glass ----- */
.${CARD.style.dynamic.progressBar.effect.glass.class} {
  --progress-effect: linear-gradient(90deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  --progress-effect-neg: linear-gradient(270deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
}

.vertical-bar.${CARD.style.dynamic.progressBar.effect.glass.class} {
  --progress-effect: linear-gradient(0deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  --progress-effect-neg: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
}

/* ----- gradient / gradient-reverse ----- */
/* Fallback: a translucent white overlay (rgba, no color-mix()), same technique
   as .glass - painted on .inner's ::before over its real color, so compositing
   lightens it without color-mix(). Modern tier gated behind @supports below. */
.${CARD.style.dynamic.progressBar.effect.gradient.class},
.${CARD.style.dynamic.progressBar.effect.gradientReverse.class} {
  --progress-effect-gradient: var(--progress-effect-gradient-modern, linear-gradient(90deg, rgba(255, 255, 255, 0.4), transparent));
  --progress-effect-gradient-rev: var(--progress-effect-gradient-rev-modern, linear-gradient(270deg, rgba(255, 255, 255, 0.4), transparent));
}

@supports (background: color-mix(in srgb, red, blue)) {
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class} {
    --progress-effect-gradient-modern: linear-gradient(
      90deg,
      color-mix(in srgb, white 40%, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})),
      var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})
    );
    --progress-effect-gradient-rev-modern: linear-gradient(
      270deg,
      color-mix(in srgb, white 40%, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})),
      var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})
    );
  }
}

.vertical-bar.${CARD.style.dynamic.progressBar.effect.gradient.class},
.vertical-bar.${CARD.style.dynamic.progressBar.effect.gradientReverse.class} {
  --progress-effect-gradient: var(--progress-effect-gradient-up-modern, linear-gradient(0deg, rgba(255, 255, 255, 0.4), transparent));
  --progress-effect-gradient-rev: var(--progress-effect-gradient-rev-up-modern, linear-gradient(180deg, rgba(255, 255, 255, 0.4), transparent));
}

@supports (background: color-mix(in srgb, red, blue)) {
  .vertical-bar.${CARD.style.dynamic.progressBar.effect.gradient.class},
  .vertical-bar.${CARD.style.dynamic.progressBar.effect.gradientReverse.class} {
    --progress-effect-gradient-up-modern: linear-gradient(
      0deg,
      color-mix(in srgb, white 40%, var(--progress-bar-color, var(--state-icon-color))),
      var(--progress-bar-color, var(--state-icon-color))
    );
    --progress-effect-gradient-rev-up-modern: linear-gradient(
      180deg,
      color-mix(in srgb, white 40%, var(--progress-bar-color, var(--state-icon-color))),
      var(--progress-bar-color, var(--state-icon-color))
    );
  }
}

.${CARD.style.dynamic.progressBar.effect.gradient.class} {
  --progress-effect: var(--progress-effect-gradient);
  --progress-effect-neg: var(--progress-effect-gradient-rev);
}

.${CARD.style.dynamic.progressBar.effect.gradientReverse.class} {
  --progress-effect: var(--progress-effect-gradient-rev);
  --progress-effect-neg: var(--progress-effect-gradient);
}

/* ----- gradient/glass: ::before compositor-only scale (no background-size repaint) -----
   .inner translates (GPU). ::before carries the gradient and scales via transform-origin,
   also GPU. Both share the same --progress-transition so they stay in perfect sync.
   .inner background is cleared to solid so the gradient doesn't double-render.          */

/* --- .inner background under the ::before layer ---
   gradient/gradient-reverse: opaque gradient on ::before → solid color underneath (no seams).
   glass: the effect IS a translucent white gradient over the track → .inner must stay
   transparent, otherwise the solid color underneath washes the effect out entirely. */
.horizontal-bar:is(
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.positive,
.vertical-bar:is(
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.positive,
.horizontal-bar.center-zero:is(
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.negative,
.vertical-bar.center-zero:is(
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-background: var(--epb-progress-bar-color, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default}));
}

.horizontal-bar.${CARD.style.dynamic.progressBar.effect.glass.class} .${CARD.htmlStructure.elements.progressBar.inner.class}.positive,
.vertical-bar.${CARD.style.dynamic.progressBar.effect.glass.class} .${CARD.htmlStructure.elements.progressBar.inner.class}.positive,
.horizontal-bar.center-zero.${CARD.style.dynamic.progressBar.effect.glass.class} .${CARD.htmlStructure.elements.progressBar.inner.class}.negative,
.vertical-bar.center-zero.${CARD.style.dynamic.progressBar.effect.glass.class} .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-background: transparent;
}

/* --- The gradient layer itself: one box, four scale directions below --- */
.horizontal-bar${BAR_EFFECT_GRADIENTS} .${CARD.htmlStructure.elements.progressBar.inner.class}.positive::before,
.horizontal-bar.center-zero${BAR_EFFECT_GRADIENTS} .${CARD.htmlStructure.elements.progressBar.inner.class}.negative::before,
.vertical-bar${BAR_EFFECT_GRADIENTS} .${CARD.htmlStructure.elements.progressBar.inner.class}.positive::before,
.vertical-bar.center-zero${BAR_EFFECT_GRADIENTS} .${CARD.htmlStructure.elements.progressBar.inner.class}.negative::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--epb-progress-bar-color, var(--progress-effect));
  will-change: transform;
}

/* --- Horizontal positive: scaleX from right --- */
.horizontal-bar${BAR_EFFECT_GRADIENTS} .${CARD.htmlStructure.elements.progressBar.inner.class}.positive::before {
  transform-origin: right center;
  transform: scaleX(var(--inner-size, 0));
}

/* --- Horizontal center-zero negative: scaleX from left --- */
.horizontal-bar.center-zero${BAR_EFFECT_GRADIENTS} .${CARD.htmlStructure.elements.progressBar.inner.class}.negative::before {
  background: var(--epb-progress-bar-color, var(--progress-effect-neg));
  transform-origin: left center;
  transform: scaleX(var(--inner-size, 0));
}

/* --- Vertical positive: scaleY from top --- */
.vertical-bar${BAR_EFFECT_GRADIENTS} .${CARD.htmlStructure.elements.progressBar.inner.class}.positive::before {
  transform-origin: center top;
  transform: scaleY(var(--inner-size, 0));
}

/* --- Vertical center-zero negative: scaleY from bottom --- */
.vertical-bar.center-zero${BAR_EFFECT_GRADIENTS} .${CARD.htmlStructure.elements.progressBar.inner.class}.negative::before {
  background: var(--epb-progress-bar-color, var(--progress-effect-neg));
  transform-origin: center bottom;
  transform: scaleY(var(--inner-size, 0));
}

/* --- Transition: sync ::before scale with .inner translate (transition-ready only) --- */
.horizontal-bar.transition-ready${BAR_EFFECT_GRADIENTS} .${CARD.htmlStructure.elements.progressBar.inner.class}.positive::before,
.horizontal-bar.center-zero.transition-ready${BAR_EFFECT_GRADIENTS} .${CARD.htmlStructure.elements.progressBar.inner.class}.negative::before,
.vertical-bar.transition-ready${BAR_EFFECT_GRADIENTS} .${CARD.htmlStructure.elements.progressBar.inner.class}.positive::before,
.vertical-bar.center-zero.transition-ready${BAR_EFFECT_GRADIENTS} .${CARD.htmlStructure.elements.progressBar.inner.class}.negative::before {
  transition: transform var(--progress-transition);
}

/* ----- shimmer / shimmer-reverse ----- */
.${CARD.style.dynamic.progressBar.effect.shimmer.class} .${CARD.htmlStructure.elements.progressBar.inner.class},
.${CARD.style.dynamic.progressBar.effect.shimmerReverse.class} .${CARD.htmlStructure.elements.progressBar.inner.class} {
  overflow: hidden;
  position: absolute;
}

.${CARD.style.dynamic.progressBar.effect.shimmer.class} .${CARD.htmlStructure.elements.progressBar.inner.class}::after,
.${CARD.style.dynamic.progressBar.effect.shimmerReverse.class} .${CARD.htmlStructure.elements.progressBar.inner.class}::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(var(--shimmer-direction, 90deg), transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: var(--shimmer-animation) 2s infinite;
  will-change: transform;
}

/* --- Horizontal --- */
.${CARD.style.dynamic.progressBar.effect.shimmer.class} {
  --shimmer-direction: 90deg;
  --shimmer-animation: shimmer-ltr;
}

.${CARD.style.dynamic.progressBar.effect.shimmerReverse.class} {
  --shimmer-direction: 90deg;
  --shimmer-animation: shimmer-rtl;
}

/* --- Vertical --- */
.vertical-bar.${CARD.style.dynamic.progressBar.effect.shimmer.class} {
  --shimmer-direction: 0deg;
  --shimmer-animation: shimmer-btt;
}

.vertical-bar.${CARD.style.dynamic.progressBar.effect.shimmerReverse.class} {
  --shimmer-direction: 0deg;
  --shimmer-animation: shimmer-ttb;
}

@keyframes shimmer-ltr {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes shimmer-rtl {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

@keyframes shimmer-btt {
  0% { transform: translateY(100%); }
  100% { transform: translateY(-100%); }
}

@keyframes shimmer-ttb {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

/* ----- wave ----- */
/* Two crests drifting apart (the back one paler) over the fill's top edge,
   and bubbles rising through it. */
@supports ((mask-image: none) or (-webkit-mask-image: none)) {
  ${WAVE_INNER} {
    background: none;
  }

  ${WAVE_INNER}::before,
  ${WAVE_INNER}::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    ${mask('repeat', 'repeat-x, no-repeat')}
  }

  ${WAVE_INNER}::before {
    background: var(--inner-background);
    opacity: 0.5;
    ${mask('image', `${waveCrest(90)}, linear-gradient(#000 0 0)`)}
    ${mask('size', '90px 14px, 100% 100%')}
    ${mask('position', '0 0, 0 13px')}
    animation: wave-back 4.5s linear infinite;
  }

  ${WAVE_INNER}::after {
    background:
      ${BUBBLE}, ${BUBBLE}, ${BUBBLE}, ${BUBBLE},
      linear-gradient(to bottom, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0) 18%, rgba(0, 0, 0, 0.28)),
      var(--inner-background);
    background-size: 6px 6px, 5px 5px, 6px 6px, 4px 4px, auto, auto;
    ${mask('image', `${waveCrest(120)}, linear-gradient(#000 0 0)`)}
    ${mask('size', '120px 14px, 100% 100%')}
    ${mask('position', '0 7px, 0 20px')}
    animation: wave-front 3s linear infinite, wave-bubbles 9s linear infinite;
  }
}

@keyframes wave-back {
  to { ${mask('position', '-90px 0, 0 13px')} }
}

@keyframes wave-front {
  to { ${mask('position', '120px 7px, 0 20px')} }
}

@keyframes wave-bubbles {
  from { background-position: 12% 120%, 38% 160%, 63% 110%, 86% 140%, 0 0, 0 0; }
  to { background-position: 12% -20%, 38% -40%, 63% -60%, 86% -30%, 0 0, 0 0; }
}
`;

export { BAR_VARIANTS_CSS };
