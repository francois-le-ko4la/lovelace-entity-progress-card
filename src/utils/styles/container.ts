import { css } from './css-tag.js';
import { CARD } from '../parameters.js';

const CONTAINER_CSS = css`
/* =============================================================================
   MAIN CONTAINER
   ============================================================================= */

.${CARD.htmlStructure.sections.container.class} {
  display: flex;
  flex-direction: var(--current-container-flex-direction, row);
  align-items: center;
  justify-content: center;
  gap: var(--current-container-gap, var(--spacing));
  width: 100%;
  height: 100%;
  overflow: var(--current-container-overflow, visible);
  /* --current-specific-padding-top: a dedicated override slot (see
     .rainbow-full-bar below) - a name nothing else declares can't be shadowed
     by an intermediate element redeclaring the same variable. */
  padding-top: var(--current-specific-padding-top, var(--current-container-padding-top, 0));
  box-sizing: var(--current-container-box-sizing, content-box);
  flex-wrap: var(--current-container-flex-wrap, nowrap);
  /* Transparent to clicks by default (ha-tile-container's .content does the
     same): anything not explicitly re-enabled falls through to .ripple-zone
     underneath instead of being captured here. Inherited by descendants. */
  pointer-events: none;
}

.horizontal {
  --current-container-flex-direction: row;
  --current-container-padding-top: 0;
  --current-container-overflow: visible;
  --current-container-gap: var(--spacing);
  --current-container-box-sizing: content-box;
  --current-container-flex-wrap: wrap;
}

.vertical {
  --current-container-flex-direction: column;
  --current-container-overflow: hidden;
  --current-container-gap: var(--spacing);
  --current-container-box-sizing: border-box;
  --current-container-flex-wrap: nowrap;
}

.vertical.default {
  --current-container-padding-top: var(--progress-size);
}

/* The badge sits --badge-offset outside the icon's own box, and vertical clips
   its container: since 1.6.1 a vertical card is exactly as tall as its parts,
   so only .vertical.default's own padding above still leaves the overhang any
   room - every other bar_position cut its top edge off. Written against the
   container and not ha-card, which carries .vertical too: the container
   redeclares the variable for itself, so a card-level rule never reaches it.
   ha-card's own overflow: hidden still holds the outer edge. */
.${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class}
  .${CARD.htmlStructure.sections.container.class}.vertical,
ha-card.${CARD.style.dynamic.barAroundIcon} .${CARD.htmlStructure.sections.container.class}.vertical {
  /* bar_position: icon's ring overhangs the icon's box the same way. */
  --current-container-overflow: visible;
}

.${CARD.htmlStructure.sections.container.class}.vertical.up-orientation.overlay {
  --current-container-gap: 9.5px;
}

.type-entities .${CARD.htmlStructure.sections.container.class} {
  --current-container-gap: var(--gap-entities);
}

.${CARD.style.dynamic.marginless} .${CARD.htmlStructure.sections.container.class} {
  --current-container-padding-top: 0;
}

/* =============================================================================
   TOP, BELOW & BOTTOM
   ============================================================================= */

ha-card:is(.bottom, .top, .below) {
  --group-max-width: 100%;
  --group-width: 100%;
}

ha-card.below {
  --current-card-padding: var(--spacing);
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: space-between;
  gap: var(--spacing);
}

ha-card.below > .container {
  flex: 1 1 auto;
  min-height: 0;
}

ha-card.vertical.xlarge.below .container {
  --current-container-padding-top: 0;
}

ha-card.below .${CARD.htmlStructure.elements.progressBar.container.class} {
  --current-progress-container-height: var(--progress-size);
}

ha-card.vertical.xlarge.below .${CARD.htmlStructure.elements.progressBar.container.class} {
  margin: 0;
}

.below-container {
  width: 100%;
  display: flex;
  overflow: hidden;
  /* This box hard-codes the bar's row height independently of
     --current-progress-container-height, so the rainbow_full + vertical +
     below override further down needs its own fallback slot here too. */
  height: var(--current-specific-progress-container-height, var(--progress-size));
  flex-shrink: 0;
}

.horizontal.xlarge .container {
  align-content: center;
}

.bottom-container, .top-container {
  position: absolute;
  width: 100%;
  left: 0;
}

.top-container {
  top: 0;
}

.bottom-container {
  bottom: 0;
}

.bottom-container .bar-container,
.top-container .bar-container {
  height: var(--progress-size);
}

ha-card.background {
  --progress-size: 100%;
  --progress-container-height: 100%;
}

.background-container {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  z-index: 0;
}

.background .${CARD.htmlStructure.sections.container.class} {
  position: relative;
  z-index: 1;
}

/* The bar is appended after everything (see wrapWithBarPosition) and .container
   is positioned here, so both painted over the card ripple and swallowed the
   hover feedback. Above both, which is where every other position has it: there
   .container is unpositioned, hence below the ripple to begin with. */
.background .${CARD.htmlStructure.sections.rippleZone.class} {
  z-index: 2;
}

:is(.background-container)
  :is(.${CARD.htmlStructure.elements.progressBar.bar.class},
    .${CARD.htmlStructure.elements.progressBar.inner.class}) {
  --bar-radius: 0;
  --inner-radius: 0;
}
`;

export { CONTAINER_CSS };
