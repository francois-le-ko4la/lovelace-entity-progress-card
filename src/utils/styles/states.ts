import { css } from './css-tag.js';
import { CARD } from '../parameters.js';

const STATES_CSS = css`
/* =============================================================================
   BADGE
   ============================================================================= */

.${CARD.htmlStructure.elements.badge.container.class} {
  display: none;
  align-items: center;
  justify-content: center;
  position: absolute;
  z-index: 2;
  top: var(--badge-offset);
  right: var(--badge-offset);
  inset-inline-end: var(--badge-offset);
  inset-inline-start: initial;
  width: var(--badge-size);
  height: var(--badge-size);
  border-radius: 50%;
  background-color: var(${CARD.style.dynamic.badge.backgroundColor.var}, ${CARD.style.dynamic.badge.backgroundColor.default});
}

.${CARD.htmlStructure.elements.badge.container.class} .${CARD.htmlStructure.elements.badge.icon.class} {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--badge-icon-size);
  height: var(--badge-icon-size);
  color: var(${CARD.style.dynamic.badge.color.var}, ${CARD.style.dynamic.badge.color.default});
}

/* =============================================================================
   VISIBILITY CONTROLS
   ============================================================================= */

.${CARD.style.dynamic.hiddenComponent.icon.class} :is(.${CARD.htmlStructure.sections.icon.class}, .${CARD.htmlStructure.elements.shape.class}),
.${CARD.style.dynamic.hiddenComponent.name.class} .${CARD.htmlStructure.elements.nameContent.class},
.${CARD.style.dynamic.hiddenComponent.secondary_info.class} .${CARD.htmlStructure.elements.secondaryInfoWrapper.class},
.${CARD.style.dynamic.hiddenComponent.progress_bar.class} .${CARD.htmlStructure.elements.progressBar.bar.class} {
  display: none;
}

/* Shape transparency when hidden */
.${CARD.style.dynamic.hiddenComponent.shape.class} .${CARD.htmlStructure.elements.shape.class}::before {
  --shape-background-color: transparent;
}

/* hide: progress_bar only hides the fill: .bar-container, the flex item
   actually reserving height/min-width in the row, never collapsed on its own.
   --current-specific-progress-container-height is the top-priority slot
   .bar-container's height checks first, so this wins over any
   bar_position/bar_size rule. min-width/flex-grow reset alongside it so a
   shared row doesn't keep reserving width for an empty container. */
.${CARD.style.dynamic.hiddenComponent.progress_bar.class} .${CARD.htmlStructure.elements.progressBar.container.class} {
  --current-specific-progress-container-height: 0px;
  min-width: 0;
  flex-grow: 0;
}

/* bar_position: icon draws the bar as a ring on the shape, not as .bar. */
ha-card.${CARD.style.dynamic.barAroundIcon}.${CARD.style.dynamic.hiddenComponent.progress_bar.class} .${CARD.htmlStructure.elements.shape.class}::after {
  content: none;
}
ha-card.${CARD.style.dynamic.barAroundIcon}.${CARD.style.dynamic.hiddenComponent.progress_bar.class}:not(.progress-badge) .${CARD.htmlStructure.elements.shape.class} {
  --current-shape-size: var(--shape-default-size);
}

/* Show elements when needed */
.${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class} .${CARD.htmlStructure.elements.badge.container.class} {
  display: flex;
}

/* =============================================================================
   INTERACTIVE STATES
   ============================================================================= */
.${CARD.style.dynamic.clickable.card}:hover,
.${CARD.style.dynamic.clickable.icon} .${CARD.htmlStructure.sections.icon.class}:hover {
  cursor: pointer;
}

/* Suppress card-level ripple when card has no action */
${CARD.htmlStructure.card.element}:not(.${CARD.style.dynamic.clickable.card}) {
  --ha-ripple-hover-opacity: 0;
  --ha-ripple-pressed-opacity: 0;
}

/* =============================================================================
   single line
   ============================================================================= */
.overlay.single-line {
  --group-max-width: 100%;
  --group-width: 100%;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
}

.overlay.single-line .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-max-width: none;
  margin-right: 7px;
}

/* =============================================================================
   VERTICAL TRANSFORMATION - BOTTOM-TO-TOP ORIENTATION
   ============================================================================= */

.vertical.up-orientation .container {
  height: 100%;
}

/* === prefers-reduced-motion === */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0ms !important;
    scroll-behavior: auto !important;
  }
}
`;

export { STATES_CSS };
