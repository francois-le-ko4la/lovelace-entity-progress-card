import { css } from './css-tag.js';
import { CARD } from '../parameters.js';

const RAINBOW_CSS = css`
/* =============================================================================
   RAINBOW FULL BAR (bar_color_mode: rainbow_full)
   The track shows the whole gradient and a .mark-based marker tracks the value
   off --progress-bar-value - no dedicated JS wiring, purely CSS.
   center_zero is wired differently: its per-arm gradients never reach .bar
   (they go through --stack-gradient-pos/-neg, read only by .inner.positive/
   .negative), so .inner can't be hidden here - its reveal is forced fully open
   instead and only the marker moves.
   ============================================================================= */

.rainbow-full-bar:not(.${CARD.style.dynamic.progressBar.centerZero})
  .${CARD.htmlStructure.elements.progressBar.inner.class} {
  display: none;
}

.rainbow-full-bar:not(.${CARD.style.dynamic.progressBar.centerZero})
  .${CARD.htmlStructure.elements.progressBar.bar.class} {
  ${CARD.style.dynamic.progressBar.background.var}: transparent;
  background-image: var(--epb-progress-bar-color, var(${CARD.style.dynamic.progressBar.color.var}, none));
}

.${CARD.style.dynamic.progressBar.centerZero}.rainbow-full-bar
  .${CARD.htmlStructure.elements.progressBar.inner.class} {
  --inner-size: 1;
}

/* A narrow pill on the fill axis rather than a disc, centered via top: 50% +
   transform (not top: 0/height: 100%): it lives in .bar-container, which for
   the smallest bar_size is barely taller than the bar itself.
   Self-relative (100% minus 2x the ring, a box-shadow drawn outside the box),
   not a fixed px: .bar-container's height varies by more than bar_size alone,
   and --type-entities-combined-line-height lets a user pin it elsewhere again.
   Any fixed height clipped or shifted the moment one of those differed. */
.${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --mark-top: 50%;
  --mark-height: calc(100% - 2px);
  /* Internal, bar_size-scaled defaults - never set by JS, only the inner
     fallback of the public --epb-rainbow-marker-* var so a card_mod override
     wins regardless of bar_size. xsmall/small deliberately stay at 5px/1px. */
  --mark-width: var(--epb-rainbow-marker-size, var(--rainbow-marker-width, 5px));
  /* The ring is a box-shadow, outside box-sizing, so it isn't part of
     --mark-width - extracted here so --mark-left's clamp can account for the
     footprint it adds. */
  --mark-border-width: var(--epb-rainbow-marker-border-width, var(--rainbow-marker-border-width, 1px));
  /* Clamped, not the raw position: centered via translate(-50%, -50%), a bare
     0%/100% pushed half the marker's footprint (--mark-width plus the ring)
     past the container's edge, clipped by .content-section's overflow: hidden.
     A no-op over most of the range - only the very ends freeze at the bound. */
  --mark-left: clamp(
    calc(var(--mark-width) / 2 + var(--mark-border-width)),
    calc(var(${CARD.style.dynamic.progressBar.value.var}, 0) * 100%),
    calc(100% - var(--mark-width) / 2 - var(--mark-border-width))
  );
  /* Whatever color the icon currently shows (theme zone/custom_theme/color
     override - see ThemeManager#setStyle) rather than a flat neutral, same
     "current color" source label's own pill background already uses. */
  --mark-background: var(--epb-rainbow-marker-color, var(${CARD.style.dynamic.iconAndShape.color.var}, white));
  box-sizing: border-box;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  border: none;
  /* "Glass pin": a spread box-shadow ring (no layout impact) plus a soft
     shadow. Blur is tied to --mark-border-width, not a fixed offset: the
     margin reserved above is sized from that same variable, so a bigger or
     offset shadow overflowed and clipped at the bottom. */
  box-shadow:
    0 0 0 var(--mark-border-width) var(--epb-rainbow-marker-border-color, rgba(255, 255, 255, 0.9)),
    0 0 var(--mark-border-width) rgba(0, 0, 0, 0.35);
  /* Own dedicated var (matches --epb-rainbow-marker-size/-color/-border-*
     above) rather than a bare literal - full opacity by default, unlike the
     watermarks' translucent one, but still overridable without colliding
     with an unrelated rule targeting the bare opacity property. */
  opacity: var(--epb-rainbow-marker-opacity, 1);
}

.rainbow-full-bar .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --mark-display: flex;
}

/* vertical gives the bar row only the bar's thickness: 16px here keeps the
   marker a pill. When: schema.ts raisesRainbowFullRow (.rainbow-full-raised);
   .vertical/.rainbow-full-bar, implied, keep the old size selectors' specificity. */
ha-card.vertical.default.rainbow-full-bar.rainbow-full-raised {
  --current-specific-progress-container-height: 16px;
  --current-specific-padding-top: 16px;
}
ha-card.vertical.default.rainbow-full-bar.rainbow-full-raised .${CARD.htmlStructure.sections.content.class} {
  --current-content-height: calc(var(--name-height) + var(--detail-height) + 16px);
}

/* bar_position: below puts the bar in its own sibling (.below-container), so
   there's no padding-top/content-height sum to correct - just the same
   container-height forcing on both boxes that hard-code the bar's row height
   here. Neither inherits --current-progress-container-height the way .default's
   .container does, so .below-container needs its own fallback slot too. */
ha-card.vertical.below.rainbow-full-bar.rainbow-full-raised {
  --current-specific-progress-container-height: 16px;
}

/* top/bottom force a 6px bar (xsmall scale). A self-relative fit reads poorly
   there - the 4px marker's fill often lands on a same-hued patch of gradient -
   so a small fixed floor lets it overshoot the bar; the containers don't clip. */
.rainbow-full-bar .top-container .${CARD.htmlStructure.elements.progressBar.valueMarker.class},
.rainbow-full-bar .bottom-container .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --mark-height: max(calc(100% - 2px), 10px);
}

/* From medium up the bar gets chunkier while the marker stayed at xsmall's
   scale. --mark-height gains 2x the ring width: below medium the 14px floor has
   slack for it, above it 100% has none and the ring clipped instead of capping. */
.rainbow-full-bar.${CARD.style.bar.sizeOptions.medium} .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --rainbow-marker-width: 7px;
  --rainbow-marker-border-width: 1.5px;
  --mark-height: calc(100% - 3px);
}
.rainbow-full-bar.${CARD.style.bar.sizeOptions.large} .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --rainbow-marker-width: 9px;
  --rainbow-marker-border-width: 2px;
  --mark-height: calc(100% - 4px);
}
.rainbow-full-bar.${CARD.style.bar.sizeOptions.xlarge} .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --rainbow-marker-width: 12px;
  --rainbow-marker-border-width: 3px;
  --mark-height: calc(100% - 6px);
}

/* A Feature's row height is fixed regardless of bar_size (--feature-height), so
   the "100%"-relative rules above left the mark one height at every size.
   Re-anchored to the same per-size container height Card itself uses. */
.entity-progress-feature.rainbow-full-bar .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --mark-height: calc(var(--progress-size-l) - 2px);
}
.entity-progress-feature.rainbow-full-bar.${CARD.style.bar.sizeOptions.medium} .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --mark-height: calc(var(--progress-size-l) - 3px);
}
.entity-progress-feature.rainbow-full-bar.${CARD.style.bar.sizeOptions.large} .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --mark-height: calc(var(--progress-size-l) - 4px);
}
.entity-progress-feature.rainbow-full-bar.${CARD.style.bar.sizeOptions.xlarge} .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --mark-height: calc(var(--progress-size-xl) - 6px);
}

/* bar_position: top/bottom forces --progress-container-height back down to
   xs regardless of bar_size (.top-container/.bottom-container above) - same
   specificity as the per-size rules just above (so source order decides),
   restoring the same row-relative floor Card's own top/bottom rule uses. */
.entity-progress-feature.rainbow-full-bar .top-container .${CARD.htmlStructure.elements.progressBar.valueMarker.class},
.entity-progress-feature.rainbow-full-bar .bottom-container .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --mark-height: max(calc(100% - 2px), 10px);
}

/* Fixed at xlarge (12px, 3px ring) rather than graduated by bar_size: a
   vertical bar (overlay or background) is a full-height strip at every size, so a
   smaller marker would look undersized against it. -6px matches 2x the ring. */
.vertical-bar.rainbow-full-bar .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --mark-top: auto;
  --mark-left: 50%;
  --mark-width: calc(100% - 6px);
  --mark-height: var(--epb-rainbow-marker-size, 12px);
  --mark-bottom: calc(var(${CARD.style.dynamic.progressBar.value.var}, 0) * 100%);
  --rainbow-marker-border-width: 3px;
  transform: translate(-50%, 50%);
}

/* center_zero's arms are a fixed 50/50 split of the bar, and
   --progress-bar-value is signed here (-1..1), so 0 always lands the marker at
   the visual center whatever min_value/max_value/center_zero_value say. */
.${CARD.style.dynamic.progressBar.centerZero}.rainbow-full-bar .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  /* Same clamp reasoning as the base rule's own --mark-left above (ring
     width included), just centered on 50% (signed -1..1 value) instead of
     running 0-100%. */
  --mark-left: clamp(
    calc(var(--mark-width) / 2 + var(--mark-border-width)),
    calc(50% + (var(${CARD.style.dynamic.progressBar.value.var}, 0) * 50%)),
    calc(100% - var(--mark-width) / 2 - var(--mark-border-width))
  );
}
.vertical-bar.${CARD.style.dynamic.progressBar.centerZero}.rainbow-full-bar .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  /* --mark-left stays 50%: it's the cross axis here, unrelated to center_zero,
     which only moves the fill axis (--mark-bottom when vertical). Resetting it
     to 0 shoved the pill half a bar-width left, off past the bar's edge. */
  --mark-bottom: calc(50% + (var(${CARD.style.dynamic.progressBar.value.var}, 0) * 50%));
}
`;

export { RAINBOW_CSS };
