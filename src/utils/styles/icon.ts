import { css } from './css-tag.js';
import { CARD } from '../parameters.js';

const ICON_CSS = css`
/* =============================================================================
   ICON SECTION (ICON, SHAPE, BADGE)
   ============================================================================= */

.${CARD.htmlStructure.sections.icon.class} {
  --current-shape-size: var(--shape-default-size);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: var(--current-shape-size);
  height: var(--current-shape-size);
  flex-shrink: 0;
}

.type-entities .${CARD.htmlStructure.sections.icon.class} {
  --current-shape-size: var(--entities-shape-size);
}

.${CARD.layout.orientations.vertical.label}.${CARD.style.dynamic.marginless} .${CARD.htmlStructure.sections.icon.class} {
  margin-top: unset !important;
}

/* === SHAPE & ICON === */
.${CARD.htmlStructure.elements.shape.class} {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--current-shape-size);
  height: var(--current-shape-size);
  border-radius: 50%;
  transition: transform 180ms ease-in-out;
}

/* box-shadow, not border: .shape has an explicit width/height (no border-box),
   so a border would grow it on focus. Same technique and color source as
   ha-tile-icon (verified against its own source). */
.${CARD.htmlStructure.elements.shape.class}:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}));
}

/* Own layer for the tinted circle rather than background-color on .shape:
   opacity fades an element and its descendants as one flattened unit, so the
   icon glyph would fade with it. A childless ::before leaves the icon opaque -
   ha-tile-icon's own technique. Plain opacity is identical to a color-mix()
   toward transparent here, and cheaper for the :hover/:active transitions. */
.${CARD.htmlStructure.elements.shape.class}::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  /* --shape-background-color: a project-namespaced override slot rather than a
     context redefining background-color directly - a bare property name is a
     far easier accidental collision target (a user's card_mod included). */
  background-color: var(--shape-hover-color, var(--shape-background-color, var(--epb-icon-shape-color, var(--shape-fallback-color, var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}))))));
  opacity: var(--epb-icon-shape-opacity, var(--shape-opacity));
}

/* bar_position: icon - the fill drawn as a ring around the icon: a conic fill
   cut to a ring by a mask, off the same --progress-bar-value as the bar. */
/* Outside the shape, 2px off it: inside, the ring ate into the icon's room. */
ha-card.${CARD.style.dynamic.barAroundIcon} {
  --ring-width: var(--epb-progress-bar-size, 3px);
  --ring-offset: calc(var(--ring-width) + 2px);
}
ha-card.${CARD.style.dynamic.barAroundIcon}.xsmall { --ring-width: var(--epb-progress-bar-size, 2px); }
ha-card.${CARD.style.dynamic.barAroundIcon}.medium { --ring-width: var(--epb-progress-bar-size, 4px); }
ha-card.${CARD.style.dynamic.barAroundIcon}.large { --ring-width: var(--epb-progress-bar-size, 6px); }
ha-card.${CARD.style.dynamic.barAroundIcon}.xlarge { --ring-width: var(--epb-progress-bar-size, 8px); }
/* A card's ring keeps one outer size whatever its width: the shape gives way
   inside it, so the icon section - and the card - never move. */
ha-card.${CARD.style.dynamic.barAroundIcon}:not(.progress-badge) .${CARD.htmlStructure.elements.shape.class} {
  --current-shape-size: calc(44px - 2 * var(--ring-offset));
}
ha-card.${CARD.style.dynamic.barAroundIcon}.progress-badge {
  --ring-width: var(--epb-progress-bar-size, 4px);
}
/* Around a badge's 18px icon, each size reads one step thicker than a card's. */
ha-card.${CARD.style.dynamic.barAroundIcon}.progress-badge.xsmall { --ring-width: var(--epb-progress-bar-size, 3px); }
ha-card.${CARD.style.dynamic.barAroundIcon}.progress-badge.medium { --ring-width: var(--epb-progress-bar-size, 5px); }
ha-card.${CARD.style.dynamic.barAroundIcon}.progress-badge.large { --ring-width: var(--epb-progress-bar-size, 6px); }
ha-card.${CARD.style.dynamic.barAroundIcon} .${CARD.htmlStructure.elements.shape.class}::after {
  /* A colour, or a theme's zones as a conic gradient (ThemeManager, isRing). */
  --ring-paint: var(--epb-progress-bar-color, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default}));
  --ring-track: var(${CARD.style.dynamic.progressBar.background.var}, var(--divider-color));
  --ring-cut: calc(100% - var(--ring-width));
  /* bar_ring: the arc starts at --ring-start and spans --ring-span-ratio of the
     circle; what is left is the gap, painted over with the card's background. */
  --ring-span: calc(var(--ring-span-ratio, 1) * 360deg);
  --ring-fill: calc(var(${CARD.style.dynamic.ringValue.var}, 0) * var(--ring-span));
  /* The filled arc runs from --ring-from to --ring-to. */
  --ring-from: 0deg;
  --ring-to: var(--ring-fill);
  --ring-gap-cover: conic-gradient(from var(--ring-start, 0deg), transparent var(--ring-span), var(--ha-card-background, var(--card-background-color)) 0);
  content: '';
  position: absolute;
  inset: calc(-1 * var(--ring-offset));
  border-radius: 50%;
  pointer-events: none;
  /* Past the value: the track, over the card's own opaque background - a theme's
     track is translucent, and the zones painted underneath showed through it. */
  background:
    var(--ring-gaps, none),
    var(--ring-gap-cover),
    conic-gradient(from var(--ring-start, 0deg), var(--ring-track) var(--ring-from), transparent 0 var(--ring-to), var(--ring-track) 0),
    conic-gradient(from var(--ring-start, 0deg), var(--ha-card-background, var(--card-background-color)) var(--ring-from), transparent 0 var(--ring-to), var(--ha-card-background, var(--card-background-color)) 0),
    var(--ring-effect, none),
    var(--ring-paint);
  -webkit-mask: radial-gradient(farthest-side, transparent var(--ring-cut), #000 calc(var(--ring-cut) + 1px));
  mask: radial-gradient(farthest-side, transparent var(--ring-cut), #000 calc(var(--ring-cut) + 1px));
}
/* bar_segments: the arc cut into --ring-segments blocks, each gap a wedge of the
   card's background over fill and track alike (center_zero: N per arm). */
ha-card.${CARD.style.dynamic.barAroundIcon}.bar-segmented .${CARD.htmlStructure.elements.shape.class}::after {
  --ring-segment: calc(var(--ring-span) / var(--ring-segments, 1));
  --ring-half-gap: calc(var(--ring-segment) * 0.1);
  --ring-gaps: repeating-conic-gradient(
    from var(--ring-start, 0deg),
    var(--ha-card-background, var(--card-background-color)) 0 var(--ring-half-gap),
    transparent 0 calc(var(--ring-segment) - var(--ring-half-gap)),
    var(--ha-card-background, var(--card-background-color)) 0 var(--ring-segment)
  );
}
/* bar_effect: a white sweep along the filled arc. glass lets the track show
   through, like the bar's transparent .inner. */
ha-card.${CARD.style.dynamic.barAroundIcon}.${CARD.style.dynamic.progressBar.effect.glass.class} .${CARD.htmlStructure.elements.shape.class}::after {
  --ring-paint: var(--ring-track);
  --ring-effect: conic-gradient(from var(--ring-start, 0deg), rgba(255, 255, 255, 0.3) var(--ring-from), rgba(255, 255, 255, 0.1) var(--ring-to), transparent 0);
}
ha-card.${CARD.style.dynamic.barAroundIcon}.${CARD.style.dynamic.progressBar.effect.gradient.class} .${CARD.htmlStructure.elements.shape.class}::after {
  --ring-effect: conic-gradient(from var(--ring-start, 0deg), rgba(255, 255, 255, 0.4) var(--ring-from), transparent var(--ring-to));
}
ha-card.${CARD.style.dynamic.barAroundIcon}.${CARD.style.dynamic.progressBar.effect.gradientReverse.class} .${CARD.htmlStructure.elements.shape.class}::after {
  --ring-effect: conic-gradient(from var(--ring-start, 0deg), transparent var(--ring-from), rgba(255, 255, 255, 0.4) var(--ring-to));
}
/* center_zero: the zero sits mid-arc, the signed value grows each way from it
   by up to half the arc. */
ha-card.${CARD.style.dynamic.barAroundIcon}.center-zero .${CARD.htmlStructure.elements.shape.class}::after {
  --ring-half: calc(var(--ring-span) / 2);
  --ring-from: calc(var(--ring-half) - max(var(${CARD.style.dynamic.ringValue.var}, 0) * -1, 0) * var(--ring-half));
  --ring-to: calc(var(--ring-half) + max(var(${CARD.style.dynamic.ringValue.var}, 0), 0) * var(--ring-half));
}
ha-card.${CARD.style.dynamic.barAroundIcon}.center-zero {
  --ring-center: 1;
}
.${CARD.htmlStructure.elements.ringZero.class} {
  display: none;
}
/* The zero: a pill across the ring at the middle of the arc, like the bar's zero line. */
ha-card.${CARD.style.dynamic.barAroundIcon}.center-zero .${CARD.htmlStructure.elements.ringZero.class} {
  --ring-radius: calc(var(--current-shape-size) / 2 + var(--ring-offset) - var(--ring-width) / 2);
  display: block;
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 50%;
  width: var(--epb-zero-mark-width, 1px);
  height: calc(var(--ring-width) + 4px);
  background: var(--epb-zero-mark-color, white);
  pointer-events: none;
  transform: translate(-50%, -50%)
    rotate(calc((1 - var(--ring-flip, 1)) * var(--ring-axis, 0deg) + var(--ring-flip, 1) * (var(--ring-start, 0deg) + var(--ring-span-ratio, 1) * 180deg)))
    translateY(calc(-1 * var(--ring-radius)));
}
/* Held at 0 until the first paint, like the bar's .inner: transition-ready
   then releases the value, and the ring fills from empty. On .shape, a real
   element, where it is registered (bootstrap.ts); ::after inherits each step. */
ha-card.${CARD.style.dynamic.barAroundIcon} .${CARD.htmlStructure.elements.shape.class} {
  ${CARD.style.dynamic.ringValue.var}: 0;
}
/* Same timing as the bar; .shape's own press scale kept. */
ha-card.${CARD.style.dynamic.barAroundIcon}.transition-ready .${CARD.htmlStructure.elements.shape.class} {
  ${CARD.style.dynamic.ringValue.var}: var(${CARD.style.dynamic.progressBar.value.var}, 0);
  transition:
    transform 180ms ease-in-out,
    ${CARD.style.dynamic.ringValue.var} var(--progress-transition);
}
/* rainbow_full around the icon: every zone, all the way round, and a pill at
   the value instead of a fill - the bar's own value mark, bent onto the ring. */
ha-card.${CARD.style.dynamic.barAroundIcon}.rainbow-full-bar .${CARD.htmlStructure.elements.shape.class}::after {
  background: var(--ring-gap-cover), var(--ring-paint);
}
.${CARD.htmlStructure.elements.ringMark.class} {
  display: none;
}
ha-card.${CARD.style.dynamic.barAroundIcon}.rainbow-full-bar .${CARD.htmlStructure.elements.ringMark.class} {
  /* Mid-ring: the shape's half, out to the ring, back by half its width. */
  --ring-radius: calc(var(--current-shape-size) / 2 + var(--ring-offset) - var(--ring-width) / 2);
  --mark-border-width: var(--epb-rainbow-marker-border-width, 1px);
  display: block;
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 50%;
  width: var(--epb-rainbow-marker-size, 4px);
  height: calc(var(--ring-width) + 4px);
  box-sizing: border-box;
  border-radius: 999px;
  pointer-events: none;
  background: var(--epb-rainbow-marker-color, var(${CARD.style.dynamic.iconAndShape.color.var}, white));
  box-shadow:
    0 0 0 var(--mark-border-width) var(--epb-rainbow-marker-border-color, rgba(255, 255, 255, 0.9)),
    0 0 var(--mark-border-width) rgba(0, 0, 0, 0.35);
  opacity: var(--epb-rainbow-marker-opacity, 1);
  transform: translate(-50%, -50%) rotate(calc((1 - var(--ring-flip, 1)) * var(--ring-axis, 0deg) + var(--ring-flip, 1) * (var(--ring-start, 0deg) + (var(--ring-center, 0) * 0.5 + var(${CARD.style.dynamic.ringValue.var}, 0) * (1 - var(--ring-center, 0) * 0.5)) * var(--ring-span-ratio, 1) * 360deg)))
    translateY(calc(-1 * var(--ring-radius)));
}
/* counterclockwise: the ring is mirrored about its start axis. */
ha-card.${CARD.style.dynamic.barAroundIcon} {
  --ring-flip: var(--ring-rtl, 1);
}
ha-card.${CARD.style.dynamic.barAroundIcon}.${CARD.style.dynamic.progressBar.orientation.counterclockwise} {
  --ring-rtl: -1;
}
/* bar_position: icon - the bar's marks, a layer each round the ring, carrying
   the bar's own shown/wm-* classes (core.ts). Zones are arcs, points pills. */
.${CARD.htmlStructure.elements.ringMarks.low.class}, .${CARD.htmlStructure.elements.ringMarks.high.class}, .${CARD.htmlStructure.elements.ringMarks.range.class},
.${CARD.htmlStructure.elements.ringMarks.min.class}, .${CARD.htmlStructure.elements.ringMarks.max.class}, .${CARD.htmlStructure.elements.ringMarks.avg.class} {
  display: none;
}
ha-card.${CARD.style.dynamic.barAroundIcon} .${CARD.htmlStructure.elements.ringMarks.low.class} {
  --ring-mark-color: var(--epb-low-watermark-color, var(--low-watermark-color, ${CARD.style.dynamic.watermark.low.color.default}));
  --ring-mark-opacity: var(--epb-low-watermark-opacity, var(--epb-watermark-opacity, var(--low-watermark-opacity-value, 0.8)));
  --ring-mark-line: var(--epb-watermark-line-size, var(--low-watermark-line-size, var(--watermark-line-size, 2px)));
  --ring-mark-at: var(--low-watermark-value-num, 0);
  --ring-zone: conic-gradient(from var(--ring-start, 0deg), var(--ring-mark-color) 0 calc(var(--low-watermark-value, 0%) * var(--ring-span-ratio, 1)), transparent 0);
}
ha-card.${CARD.style.dynamic.barAroundIcon} .${CARD.htmlStructure.elements.ringMarks.high.class} {
  --ring-mark-color: var(--epb-high-watermark-color, var(--high-watermark-color, ${CARD.style.dynamic.watermark.high.color.default}));
  --ring-mark-opacity: var(--epb-high-watermark-opacity, var(--epb-watermark-opacity, var(--high-watermark-opacity-value, 0.8)));
  --ring-mark-line: var(--epb-watermark-line-size, var(--high-watermark-line-size, var(--watermark-line-size, 2px)));
  --ring-mark-at: var(--high-watermark-value-num, 100);
  --ring-zone: conic-gradient(from var(--ring-start, 0deg), transparent 0 calc(var(--high-watermark-value, 100%) * var(--ring-span-ratio, 1)), var(--ring-mark-color) 0 calc(100% * var(--ring-span-ratio, 1)), transparent 0);
}
ha-card.${CARD.style.dynamic.barAroundIcon} .${CARD.htmlStructure.elements.ringMarks.range.class} {
  --ring-mark-color: var(--epb-peak-range-color, var(--peak-range-color, ${CARD.style.dynamic.peakMarker.range.color.default}));
  --ring-mark-opacity: var(--epb-peak-range-opacity, var(--peak-range-opacity-value, 0.8));
  --ring-zone: conic-gradient(
    from var(--ring-start, 0deg),
    transparent 0 calc(var(--peak-min-value, 0%) * var(--ring-span-ratio, 1)),
    var(--ring-mark-color) 0 calc(var(--peak-max-value, 0%) * var(--ring-span-ratio, 1)),
    transparent 0
  );
}
ha-card.${CARD.style.dynamic.barAroundIcon} .${CARD.htmlStructure.elements.ringMarks.min.class} {
  --ring-mark-color: var(--epb-peak-min-color, var(--peak-min-color, ${CARD.style.dynamic.peakMarker.min.color.default}));
  --ring-mark-opacity: var(--epb-peak-min-opacity, var(--peak-min-opacity-value, 0.8));
  --ring-mark-line: var(--epb-peak-marker-line-size, var(--peak-min-line-size, var(--peak-marker-line-size, 2px)));
  --ring-mark-at: var(--peak-min-value-num, 0);
}
ha-card.${CARD.style.dynamic.barAroundIcon} .${CARD.htmlStructure.elements.ringMarks.max.class} {
  --ring-mark-color: var(--epb-peak-max-color, var(--peak-max-color, ${CARD.style.dynamic.peakMarker.max.color.default}));
  --ring-mark-opacity: var(--epb-peak-max-opacity, var(--peak-max-opacity-value, 0.8));
  --ring-mark-line: var(--epb-peak-marker-line-size, var(--peak-max-line-size, var(--peak-marker-line-size, 2px)));
  --ring-mark-at: var(--peak-max-value-num, 0);
}
ha-card.${CARD.style.dynamic.barAroundIcon} .${CARD.htmlStructure.elements.ringMarks.avg.class} {
  --ring-mark-color: var(--epb-peak-average-color, var(--peak-average-color, ${CARD.style.dynamic.peakMarker.average.color.default}));
  --ring-mark-opacity: var(--epb-peak-average-opacity, var(--peak-average-opacity-value, 0.8));
  --ring-mark-line: var(--epb-peak-marker-line-size, var(--peak-average-line-size, var(--peak-marker-line-size, 2px)));
  --ring-mark-at: var(--peak-average-value-num, 0);
}
ha-card.${CARD.style.dynamic.barAroundIcon} .${CARD.style.dynamic.markShown}:is(
    .${CARD.htmlStructure.elements.ringMarks.low.class}, .${CARD.htmlStructure.elements.ringMarks.high.class}, .${CARD.htmlStructure.elements.ringMarks.range.class},
    .${CARD.htmlStructure.elements.ringMarks.min.class}, .${CARD.htmlStructure.elements.ringMarks.max.class}, .${CARD.htmlStructure.elements.ringMarks.avg.class}
  ) {
  display: block;
  position: absolute;
  z-index: 1;
  pointer-events: none;
  opacity: var(--ring-mark-opacity);
}
/* A zone: the same ring, cut by the same mask, painted over its own arc. */
ha-card.${CARD.style.dynamic.barAroundIcon} :is(.${CARD.htmlStructure.elements.ringMarks.low.class}, .${CARD.htmlStructure.elements.ringMarks.high.class}, .${CARD.htmlStructure.elements.ringMarks.range.class}):is(.wm-area, .wm-blended, .wm-striped) {
  --ring-cut: calc(100% - var(--ring-width));
  inset: calc(-1 * var(--ring-offset));
  border-radius: 50%;
  background: var(--ring-zone);
  -webkit-mask: radial-gradient(farthest-side, transparent var(--ring-cut), #000 calc(var(--ring-cut) + 1px));
  mask: radial-gradient(farthest-side, transparent var(--ring-cut), #000 calc(var(--ring-cut) + 1px));
}
ha-card.${CARD.style.dynamic.barAroundIcon}
  :is(.${CARD.htmlStructure.elements.ringMarks.low.class}, .${CARD.htmlStructure.elements.ringMarks.high.class}, .${CARD.htmlStructure.elements.ringMarks.range.class}):is(.wm-area, .wm-blended, .wm-striped) {
  transform: rotate(calc((1 - var(--ring-flip, 1)) * var(--ring-axis, 0deg))) scaleX(var(--ring-flip, 1));
}
/* A point: a pill across the ring at its angle - a line keeps its own width,
   triangle and round become the rainbow_full marker's pin. */
ha-card.${CARD.style.dynamic.barAroundIcon}
  :is(.${CARD.htmlStructure.elements.ringMarks.low.class}, .${CARD.htmlStructure.elements.ringMarks.high.class}, .${CARD.htmlStructure.elements.ringMarks.min.class}, .${CARD.htmlStructure.elements.ringMarks.max.class}, .${CARD.htmlStructure.elements.ringMarks.avg.class}):is(.wm-line, .wm-triangle, .wm-round) {
  --ring-radius: calc(var(--current-shape-size) / 2 + var(--ring-offset) - var(--ring-width) / 2);
  left: 50%;
  top: 50%;
  width: var(--ring-mark-line);
  height: calc(var(--ring-width) + 4px);
  border-radius: 999px;
  background: var(--ring-mark-color);
  transform: translate(-50%, -50%) rotate(calc((1 - var(--ring-flip, 1)) * var(--ring-axis, 0deg) + var(--ring-flip, 1) * (var(--ring-start, 0deg) + var(--ring-mark-at) * var(--ring-span-ratio, 1) * 3.6deg)))
    translateY(calc(-1 * var(--ring-radius)));
}
ha-card.${CARD.style.dynamic.barAroundIcon}
  :is(.${CARD.htmlStructure.elements.ringMarks.low.class}, .${CARD.htmlStructure.elements.ringMarks.high.class}, .${CARD.htmlStructure.elements.ringMarks.min.class}, .${CARD.htmlStructure.elements.ringMarks.max.class}, .${CARD.htmlStructure.elements.ringMarks.avg.class}):is(.wm-triangle, .wm-round) {
  width: 4px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.9),
    0 0 1px rgba(0, 0, 0, 0.35);
}
/* Read out, never seen: the ring's progressbar for a screen reader. */
.${CARD.htmlStructure.elements.ringProgress.class} {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* Counter-clockwise: the whole ring mirrored about its start axis, zones included. */
ha-card.${CARD.style.dynamic.barAroundIcon} .${CARD.htmlStructure.elements.shape.class}::after {
  transform: rotate(calc((1 - var(--ring-flip, 1)) * var(--ring-axis, 0deg))) scaleX(var(--ring-flip, 1));
}

/* A tinted disc drawn at 20% over a bar that covers the whole card just shows
   the fill through and vanishes into it. An opaque layer under the tint (the
   glyph is a descendant, see structure.ts) composites to the same thing a
   color-mix() would, and needs no @supports of its own (issue #128). */
ha-card.background:not(.type-entities) .${CARD.htmlStructure.elements.shape.class} {
  background-color: var(--card-background-color);
}

/* CSS-only click feedback (ha-tile-icon's technique) instead of a second
   <ha-ripple>, and only while the icon has an action of its own.
   pointer-events: auto opts back in from .container's blanket none - without
   it the icon would fall through to the card action like a non-interactive
   one. 20% -> 35% on hover are ha-tile-icon's numbers, inherited by ::before. */
.${CARD.style.dynamic.clickable.icon} .${CARD.htmlStructure.elements.shape.class} {
  pointer-events: auto;
}

/* No fallback here is deliberate - unset --epb-icon-shape-hover-color makes
   --shape-hover-color invalid, so ::before's chain falls through untouched. */
.${CARD.style.dynamic.clickable.icon} .${CARD.htmlStructure.elements.shape.class}:hover {
  --shape-opacity: 35%;
  --shape-hover-color: var(--epb-icon-shape-hover-color);
}

.${CARD.style.dynamic.clickable.icon} .${CARD.htmlStructure.elements.shape.class}:active {
  transform: scale(1.2);
}

.type-entities .${CARD.htmlStructure.elements.shape.class}::before {
  --shape-background-color: transparent;
}

/* The fill covers the whole card here and the icon carries its very color. The
   disc takes the card back, opaque, so the icon reads against it as usual. */
ha-card.${CARD.style.dynamic.backgroundShape} .${CARD.htmlStructure.elements.shape.class} {
  --shape-fallback-color: var(--ha-card-background, var(--card-background-color));
  --shape-opacity: 100%;
}

.${CARD.htmlStructure.elements.icon.class},
.custom-icon-img {
  --current-icon-size: var(--icon-default-size);
  /* The box below only frames the glyph - what actually sizes it is HA's own
     --mdc-icon-size on the inner ha-state-icon, which otherwise stays at its
     24px default however small this box gets. Invisible at our own default
     (the two match), immediately visible once --current-icon-size is derived
     from something else - a Multi row's slice, see multi.ts's #rowMetrics.
     A custom property, so it reaches the inner element on its own. */
  --mdc-icon-size: var(--current-icon-size);

  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--current-icon-size);
  height: var(--current-icon-size);
}

.progress-badge .${CARD.htmlStructure.sections.icon.class},
.progress-badge .${CARD.htmlStructure.elements.icon.class},
.progress-badge .${CARD.htmlStructure.elements.shape.class},
.progress-badge .custom-icon-img {
  --current-icon-size: 18px;
  --current-shape-size: 18px;
}

.progress-badge .icon ha-state-icon {
  --ha-icon-display: flex;
  height: var(--current-icon-size);
  width: var(--current-icon-size);
  display: flex;
  align-items: center;
  justify-content: center;
}


.${CARD.htmlStructure.elements.icon.class} {
  color: var(--epb-icon-color, var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default})));
}

.custom-icon-img {
  border-radius: 50%;
  object-fit: cover;
}
`;

export { ICON_CSS };
