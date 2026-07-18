/*
 * All CSS for the card and the visual editor: CARD_CSS (the
 * card/badge/feature/template stylesheet), the editor components' own styles,
 * and the Constructable-Stylesheet caching helpers that let every card instance
 * share one parsed sheet instead of re-parsing per instance.
 */

import { CARD } from './parameters.js';

const css = (strings, ...values) => strings.reduce((acc, s, i) => acc + s + (i < values.length ? values[i] : ''), '');

const CARD_CSS = css`
/* =============================================================================
   PARAMS
   ============================================================================= */

:host {
  /* === SPACING VARIABLES === */
  --spacing: var(--epb-spacing, 10px);
  --gap-entities: 16px;

  /* === SIZE VARIABLES === */
  --shape-default-size: var(--epb-shape-size, 36px);
  --icon-default-size: var(--epb-icon-size, 24px);
  --entities-shape-size: 40px;
  --badge-size: 16px;
  --badge-icon-size: 12px;
  --badge-offset: -3px;
  --progress-size-xs: 6px;
  --progress-size-s: 8px;
  --progress-size-m: 12px;
  --progress-size-l: 16px;
  --progress-size-xl: 42px;
  --progress-size-overlay: 36px;

  /* === HEIGHT VARIABLES === */
  --name-height: 20px;
  --detail-height: 16px;
  --entities-height: 22.4px;
  --entities-card-min-height: 44.8px;
  --vertical-name-large-height: 18px;
  --progress-container-height: 16px;

  /* === COLOR OPACITY VARIABLES === */
  --shape-opacity: 20%;

  /* === TRANSITION VARIABLES === */
  --progress-transition: var(--epb-progress-transition, 0.5s cubic-bezier(0.4, 0, 0.2, 1));

  /* === TYPOGRAPHY VARIABLES === */
  --name-letter-spacing: 0.1px;
  --detail-letter-spacing: 0.4px;

  /* === LAYOUT VARIABLES === */
  --vertical-gap: 1px;

  /* === HA RIPPLE === */
  --ha-ripple-hover-opacity: 0.04;
  --ha-ripple-pressed-opacity: 0.12;

  /* === BORDER RADIUS === */
  --ha-standard-border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
}

.${CARD.style.bar.sizeOptions.small.label} {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-s));
}

.${CARD.style.bar.sizeOptions.medium.label} {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-m));
}

.${CARD.style.bar.sizeOptions.large.label} {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-l));
}

.${CARD.style.bar.sizeOptions.xlarge.label} {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-xl));
  --progress-container-height: var(--progress-size-xl);
}

ha-card.overlay {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-overlay));
  --progress-container-height: var(--epb-progress-bar-size, var(--progress-size-overlay));
}

.bottom-container, .top-container {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-xs));
  --progress-container-height: var(--progress-size-xs);
}

/* A Feature's row height must not shrink to the bar's own thickness
   (bar_size only sets --progress-size above) - HA reserves a fixed row
   regardless, and .progress-container already centers the bar inside it
   (align-items/justify-content: center). --feature-height is HA's own
   variable for a card-feature row (see hui-card-features.ts); reading it
   live keeps us in sync with HA/theme overrides instead of a static copy.
   Placed after the bar_size/xlarge rules above so it always wins for the
   'default' bar_position. .top-container/.bottom-container ('top'/'bottom'
   bar_position - the only other values the Feature schema allows) are
   separate child elements that re-declare --progress-container-height
   themselves, so this doesn't reach them - #fixCardStyles already handles
   sizing for those overlay-style positions. */
.entity-progress-feature {
  --progress-container-height: var(--feature-height, 42px);
}

/* =============================================================================
   BASE CARD
   ============================================================================= */

${CARD.htmlStructure.card.element} {
  --ha-ripple-color: var(--epb-icon-and-shape-color, var(--icon-and-shape-color, var(--state-icon-color)));
  /* Re-declared here (not only :host) so card_mod overrides set on ha-card are seen:
     var() substitution happens on the declaring element, and ha-card is where users
     apply per-card styles. The :host declarations keep theme-level overrides working. */
  --spacing: var(--epb-spacing, 10px);
  --shape-default-size: var(--epb-shape-size, 36px);
  --icon-default-size: var(--epb-icon-size, 24px);
  --progress-transition: var(--epb-progress-transition, 0.5s cubic-bezier(0.4, 0, 0.2, 1));
  --current-card-min-width: var(${CARD.style.dynamic.card.minWidth.var}, 100%);
  --current-card-min-height: 0;
  --current-card-height: var(${CARD.style.dynamic.card.height.var}, 100%);
  --current-card-padding: 0 var(--spacing);
  --current-card-margin: 0 auto;
  --current-card-border-radius: var(--ha-standard-border-radius);

  display: flex;
  align-items: center;
  justify-content: center;
  position: relative; /* permet top/bottom */
  margin: var(--current-card-margin);
  padding: var(--current-card-padding);
  min-width: var(--epb-card-width, var(--current-card-min-width));
  width: var(--epb-card-width, auto);
  min-height: var(--current-card-min-height);
  height: var(--epb-card-height, var(--current-card-height));
  border-radius: var(--epb-card-border-radius, var(--current-card-border-radius));
  border-width: var(--epb-card-border-width, var(--ha-card-border-width, 1px));
  border-color: var(--epb-card-border-color, var(--ha-card-border-color, var(--divider-color, #e0e0e0)));
  border-style: var(--epb-card-border-style, solid);
  overflow: hidden;
  font-family: var(--epb-card-font-family, var(--ha-font-family-body));
  -moz-osx-font-smoothing: var(--ha-font-smoothing);
  -webkit-font-smoothing: antialiased;
  transition-property: background-color, box-shadow, border-color;
}

.horizontal {
  --current-card-min-height: var(${CARD.style.dynamic.card.height.var}, ${CARD.layout.orientations.horizontal.minHeight});
  --current-card-padding: 0 var(--spacing);
}

.vertical {
  --current-card-min-height: var(${CARD.style.dynamic.card.height.var}, ${CARD.layout.orientations.vertical.minHeight});
  --current-card-padding: var(--spacing);
}

.marginless {
  --current-card-min-height: unset;
  --current-card-padding: 0;
  --current-card-margin: 0;
}

/* === BADGE === */
.progress-badge {
  --current-card-height: var(--ha-badge-size, 36px);
  --current-card-min-height: var(--ha-badge-size, 36px);
  --current-card-min-width: var(--card-min-width, var(--ha-badge-size, 130px));
  --current-card-border-radius: var(--ha-badge-border-radius,calc(var(--ha-badge-size,36px)/ 2));
}

/* === TYPE: PICTURE-ELEMENTS === */
.type-picture-elements {
  --current-card-min-width: var(${CARD.style.dynamic.card.minWidth.var}, 200px);
}

/* === FRAMELESS & ENTITIES STYLES === */
.type-entities,
.type-custom-vertical-stack-in-card,
.${CARD.style.dynamic.frameless.class} {
  --ha-card-background: transparent;
  --ha-card-border-width: 0;
  --ha-card-box-shadow: none;
}

.type-entities {
  --current-card-padding: 0;
  --current-card-margin: 0;
  --ha-ripple-hover-opacity: 0;
  --ha-ripple-pressed-opacity: 0;
  --current-card-height: var(--entities-card-min-height); /* 44.8 px*/
  --current-card-min-height: var(--entities-card-min-height);
  
  transition: none !important;
}

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
  padding-top: var(--current-container-padding-top, 0);
  box-sizing: var(--current-container-box-sizing, content-box);
  flex-wrap: var(--current-container-flex-wrap, nowrap);
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

.${CARD.htmlStructure.sections.container.class}.vertical.up-orientation.overlay {
  --current-container-gap: 9.5px;
}

.type-entities .${CARD.htmlStructure.sections.container.class} {
  --current-container-gap: var(--gap-entities);
}

.${CARD.style.dynamic.marginless.class} .${CARD.htmlStructure.sections.container.class} {
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
  height: var(--progress-size);
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

:is(.background-container)
  :is(.${CARD.htmlStructure.elements.progressBar.bar.class},
    .${CARD.htmlStructure.elements.progressBar.inner.class}) {
  --bar-radius: 0;
  --inner-radius: 0;
}


/* =============================================================================
   TREND
   ============================================================================= */

.trend-indicator,
.trend-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--badge-size);
  height: var(--badge-size);
}

.trend-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
}

.trend-icon {
  color: var(--state-icon-color);
}

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

.${CARD.layout.orientations.vertical.label}.${CARD.style.dynamic.marginless.class} .${CARD.htmlStructure.sections.icon.class} {
  margin-top: unset !important;
}

/* === SHAPE & ICON === */
.${CARD.htmlStructure.elements.shape.class} {
  --current-shape-background-color: color-mix(in srgb, var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default})) var(--shape-opacity), transparent);
  --ha-ripple-hover-opacity: 0.15;

  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--current-shape-size);
  height: var(--current-shape-size);
  border-radius: 50%;
  background-color: var(--current-shape-background-color);
}

.type-entities .${CARD.htmlStructure.elements.shape.class} {
  --ha-ripple-hover-opacity: 0;
  --ha-ripple-pressed-opacity: 0;
  --current-shape-background-color: transparent;
}

.${CARD.htmlStructure.elements.icon.class},
.custom-icon-img {
  --current-icon-size: var(--icon-default-size);

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
  --current-icon-size: 18px;
  --mdc-icon-size: var(--current-icon-size);
  --ha-icon-display: flex;
  height: var(--current-icon-size);
  width: var(--current-icon-size);
  display: flex;
  align-items: center;
  justify-content: center;
}


.${CARD.htmlStructure.elements.icon.class} {
  color: var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}));
}

.custom-icon-img {
  border-radius: 50%;
  object-fit: cover;
}

/* =============================================================================
   CONTENT SECTION (TEXT CONTENT)
   ============================================================================= */

.${CARD.htmlStructure.sections.content.class} {
  --current-content-height: calc(var(--name-height) + var(--detail-height));

  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: var(--current-content-flex-grow);
  flex-shrink: 1;
  width: var(--current-content-width);
  height: var(--current-content-height);
  gap: var(--current-content-gap, 0);
  min-width: 0;
  overflow: hidden;
  position: relative; /* overlay */
}

ha-card.horizontal .${CARD.htmlStructure.sections.content.class} {
  --current-content-width: calc(100% - 56px);
  --current-content-flex-grow: 1;
  --current-content-gap: 0;
}

ha-card.vertical .${CARD.htmlStructure.sections.content.class} {
  --current-content-width: 100%;
  --current-content-flex-grow: 0;
  --current-content-gap: var(--vertical-gap);
}

ha-card.vertical.default .${CARD.htmlStructure.sections.content.class} {
  --current-content-height: calc(var(--name-height) + var(--detail-height) + var(--progress-size));
}

ha-card.type-entities .${CARD.htmlStructure.sections.content.class} {
  --current-content-height: unset;
}

.progress-badge .${CARD.htmlStructure.sections.content.class} {
  --current-content-height: unset;
}

.overlay .${CARD.htmlStructure.sections.content.class} {
  --current-content-height: var(--progress-size);
}

.vertical.up-orientation.overlay .${CARD.htmlStructure.sections.content.class} {
  --current-content-flex-grow: 1;
  --current-content-width: var(--epb-progress-bar-size, 50%);
  --current-content-height: 100%;
}

/* === TEXT ELEMENTS === */

.${CARD.htmlStructure.elements.nameContent.class},
.${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  /* flex layout, dimensions, overflow, alignement*/
  display: flex;
  z-index: 1;
  align-items: var(--group-align-items, center);
  justify-content: var(--group-justify-content, flex-start);
  flex-grow: var(--group-flex-grow, initial);
  width: var(--group-width, auto);
  min-width: var(--group-min-width, 0);
  max-width: var(--group-max-width, none);
  height: var(--group-height);
  line-height: var(--group-height); /*fix size*/
  overflow: var(--group-overflow, hidden);
  text-align: var(--group-text-align, left);
  box-sizing: var(--group-box-sizing, content-box);
  margin-left: var(--group-margin-left);
}

.${CARD.htmlStructure.elements.nameContent.class} {
  --group-height: var(--name-height);
}

.${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-height: var(--detail-height);
  --group-min-width: 45px;
  --group-max-width: 60%;
}

.progress-badge .${CARD.htmlStructure.elements.nameContent.class} {
  --group-height: 10px;
  font-size: 10px;
}

.progress-badge .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-min-width: unset;
  --group-max-width: unset;
}

ha-card:is(.vertical, .xlarge, .bottom, .top) .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-min-width: 100%;
  --group-max-width: 100%;
}

.row-reverse .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-min-width: unset;
}

.${CARD.layout.orientations.vertical.label} {
  --group-justify-content: center;
  --group-width: 100%;
  --group-max-width: 100%;
  --group-flex-grow: 0;
  --group-text-align: center;
  --group-box-sizing: border-box;
}

.${CARD.layout.orientations.vertical.label} .${CARD.style.bar.sizeOptions.large.label} {
  --name-height: var(--vertical-name-large-height);
}

.overlay :is(.${CARD.htmlStructure.elements.nameContent.class}, .${CARD.htmlStructure.elements.secondaryInfoWrapper.class}) {
  --group-margin-left: 7px;
}
.vertical.up-orientation.overlay :is(.${CARD.htmlStructure.elements.nameContent.class}, .${CARD.htmlStructure.elements.secondaryInfoWrapper.class}) {
  --group-margin-left: 0;
}

.ellipsis-wrapper {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  line-height: 100%;
  width: 100%;
}

.ellipsis-wrapper span {
  display: inline;
}

.${CARD.htmlStructure.elements.nameValue.class},
.${CARD.htmlStructure.elements.secondaryInfoValue.class} {
  color: var(--text-color);
  font-size: var(--text-font-size);
  font-weight: var(--text-font-weight);
  height: var(--text-height);
  line-height: var(--text-line-height);
  letter-spacing: var(--text-letter-spacing);
  margin-right: var(--text-margin-right);
  text-shadow: var(--text-shadow);
}

.${CARD.htmlStructure.elements.nameValue.class} {
  --text-color: var(--epb-name-color, var(--primary-text-color));
  --text-font-size: var(--epb-name-font-size, var(--ha-font-size-m));
  --text-font-weight: var(--epb-name-font-weight, var(--ha-font-weight-medium));
  --text-height: var(--name-height);
  --text-line-height: var(--name-height);
  --text-letter-spacing: var(--epb-name-letter-spacing, var(--name-letter-spacing));
  --text-margin-right: 0;
}

.${CARD.htmlStructure.elements.secondaryInfoValue.class} {
  /* Now a div (see CARD.htmlStructure.elements.secondaryInfoValue): it's the direct
     block-level parent of the extra/main spans, so it - not just the outer
     .ellipsis-wrapper - needs its own single-line ellipsis truncation. */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  --text-color: var(--epb-detail-color, var(--primary-text-color));
  --text-font-size: var(--epb-detail-font-size, var(--ha-font-size-s));
  --text-font-weight: var(--epb-detail-font-weight, var(--ha-font-weight-body));
  --text-height: var(--detail-height);
  --text-line-height: var(--detail-height);
  --text-letter-spacing: var(--epb-detail-letter-spacing, var(--detail-letter-spacing));
  --text-margin-right: 0;
}

.progress-badge .${CARD.htmlStructure.elements.nameValue.class} {
  --text-color: var(--epb-name-color, var(--secondary-text-color));
  --text-font-size: var(--epb-name-font-size, 10px);
  --text-font-weight: var(--ha-font-weight-medium);
  --text-height: 10px;
  --text-line-height: 10px;
  --text-margin-right: 5px;
  --text-letter-spacing: var(--name-letter-spacing);
}

.progress-badge .${CARD.htmlStructure.elements.secondaryInfoValue.class} {
  --text-color: var(--primary-text-color);
  --text-font-size: var(--ha-badge-font-size, var(--ha-font-size-s));
  --text-font-weight: var(--ha-font-weight-medium);
  --text-height: var(--text-font-size);
  --text-line-height: var(--ha-line-height-condensed);
  --text-letter-spacing: var(--name-letter-spacing);
}

.type-entities :is(.${CARD.htmlStructure.elements.nameValue.class}, 
                    .${CARD.htmlStructure.elements.secondaryInfoValue.class}) {
  --text-height: var(--entities-height);
  --text-font-weight: var(--ha-font-weight-normal);
  --text-line-height: var(--ha-line-height-normal);
}

.type-entities .${CARD.htmlStructure.elements.secondaryInfoValue.class} {
  --text-color: var(--secondary-text-color);
  --text-font-size: var(--ha-font-size-m);
}

:is(.overlay, .background).text-shadow :is(.${CARD.htmlStructure.elements.nameValue.class},
                    .${CARD.htmlStructure.elements.secondaryInfoValue.class}) {
  --text-shadow: 1px 1px 2px var(--card-background-color);
}

/* === SECONDARY INFO === */
.${CARD.htmlStructure.elements.secondaryInfo.class} {
  display: flex;
  flex-direction: var(--current-secondary-info-flex-direction);
  align-items: var(--current-secondary-info-align-items);
  gap: var(--current-secondary-info-gap, var(--spacing));
  width: var(--current-secondary-info-width, auto);
  min-width: var(--current-secondary-info-min-width, auto);
  justify-content: space-between;
}

.secondary-info-wrapper:has(.secondary-info-extra-1:empty):has(.secondary-info-main:empty) {
  display: none;
}

.${CARD.layout.orientations.horizontal.label} {
  --current-secondary-info-flex-direction: var(--secondary-info-row-reverse, row);
  --current-secondary-info-align-items: stretch;
  --current-secondary-info-gap: var(--spacing);
  --current-secondary-info-width: auto;
  --current-secondary-info-min-width: auto;
}

.${CARD.layout.orientations.vertical.label} {
  --current-secondary-info-flex-direction: column;
  --current-secondary-info-align-items: center;
  --current-secondary-info-gap: unset;
  --current-secondary-info-width: 100%;
  --current-secondary-info-min-width: 0;
}

.progress-badge {
  --current-secondary-info-gap: 5px;
}

/* === MULTILINE SECONDARY INFO ===
   Two independent single-line boxes stacked in the wrapper (see
   StructureElements.secondaryInfoLine) instead of one box trying to hold two
   roles at once - each line keeps its own ellipsis truncation via the shared
   .ellipsis-wrapper rules, and neither touches the progress bar's own sizing.
   10px/line (20px total). Rather than growing the card by those extra 4px,
   --name-height gives up the same 4px it doesn't need (name stays single-line,
   never short on room) to --detail-height, so .content-section's own height
   formula (name + detail) is untouched - the card's total height doesn't
   change at all. */
ha-card.info-multiline {
  --name-height: 16px;
  --detail-height: 20px;
}

.info-multiline .secondary-info-wrapper {
  flex-direction: column;
  /* --group-justify-content/--group-align-items, not the properties directly: this is
     the same --group-* indirection .secondary-info-wrapper's own base rule already reads
     (see "flex layout, dimensions, overflow, alignement" above) - overriding the variable
     keeps this a one-line diff against that rule instead of a second, competing source of
     truth for the same properties. */
  --group-justify-content: center;
  --group-align-items: stretch;
  gap: 0;
  /* Without this, mobile/Chromium font-boosting (text autosizing) bumps a small
     declared size up to whatever it judges "readable" for the container width -
     seen in the wild inflating 8px to ~10.5px, which no longer fits the budget. */
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

.info-multiline .secondary-info-wrapper > .ellipsis-wrapper {
  height: 10px;
  line-height: 0.95;
  margin: 0;
  padding: 0;
}

.info-multiline .secondary-info-wrapper .secondary-info-value {
  --text-height: 10px;
  --text-line-height: 0.95;
  --text-font-size: 10px;
}

.info-multiline .secondary-info-wrapper:has(.secondary-info-extra-1:empty):has(.secondary-info-extra-2:empty):not(:has(.secondary-info-main:not(:empty))) {
  display: none;
}

.info-multiline .secondary-info .bar-container {
  /* .secondary-info stretches its children by default (see --current-secondary-info-align-items
     above) so the bar would otherwise be pulled to the 2-line wrapper's height. */
  align-self: center;
}

/* =============================================================================
   PROGRESS BAR
   ============================================================================= */

/* ==== CONTAINER === */

.${CARD.htmlStructure.elements.progressBar.container.class} {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  height: var(--type-entities-combined-line-height, var(--current-progress-container-height));
}

.overlay .${CARD.htmlStructure.elements.progressBar.container.class} {
  position: absolute;
  width: 100%;
  height: 100%;
}

.${CARD.layout.orientations.horizontal.label}.${CARD.style.bar.sizeOptions.small.label} .${CARD.htmlStructure.elements.progressBar.container.class},
.${CARD.layout.orientations.horizontal.label}.${CARD.style.bar.sizeOptions.medium.label} .${CARD.htmlStructure.elements.progressBar.container.class},
.${CARD.layout.orientations.horizontal.label}.${CARD.style.bar.sizeOptions.large.label} .${CARD.htmlStructure.elements.progressBar.container.class} {
  max-width: var(--progress-bar-max-width, unset);
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
  --inner-transform: translateX(100%); /* même direction de masquage qu'à value=0 une fois "ready" */
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
  --inner-transform: translateY(-100%); /* même direction de masquage qu'à value=0 une fois "ready" */
  --inner-border-radius: 0 0 var(--_r) var(--_r);
}
.vertical-bar.center-zero.transition-ready .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-transform: translateY(calc((1 - var(--inner-size, 0)) * -100%));
}

/**
 * --- inner size/background (auto-clamped per zone: irrelevant zone resolves to
 * 0) ---
 */
.${CARD.htmlStructure.elements.progressBar.inner.class}.positive {
  --inner-size: var(${CARD.style.dynamic.progressBar.stackSizePos.var}, max(var(${CARD.style.dynamic.progressBar.value.var}, 0), 0));
  --inner-background: var(--epb-progress-bar-color, var(--progress-effect, var(${CARD.style.dynamic.progressBar.stackGradientPos.var}, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default}))));
}
.center-zero .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-size: var(${CARD.style.dynamic.progressBar.stackSizeNeg.var}, max(calc(var(${CARD.style.dynamic.progressBar.value.var}, 0) * -1), 0));
  --inner-background: var(--epb-progress-bar-color, var(--progress-effect-neg, var(${CARD.style.dynamic.progressBar.stackGradientNeg.var}, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default}))));
}

/* === ORIENTATION === */
.${CARD.style.dynamic.progressBar.orientation.rtl} .${CARD.htmlStructure.elements.progressBar.bar.class} {
  transform: scaleX(-1);
}

/* === SEGMENTED BAR (bar_segments: N) ===
   Discrete blocks (battery cells / signal bars) via a mask on the whole bar:
   both the track and the fill are chopped, so the cells read as real cells.
   The mask uses the element itself as reference (no fixed pixel width needed);
   gap is fixed at 2px inside each 100%/N cell.
   border-radius is forced to 0: the container also clips via border-radius
   (overflow: hidden), and that curve was cutting into the first/last mask
   stripe near the rounded corner — a cell there looked truncated compared to
   the others. Flush ends read like real battery/signal-bar hardware anyway. */
.bar-segmented .${CARD.htmlStructure.elements.progressBar.bar.class} {
  border-radius: 0;
  -webkit-mask-image: repeating-linear-gradient(
    to right,
    #000 0,
    #000 calc(100% / var(--bar-segments, 10) - 2px),
    transparent calc(100% / var(--bar-segments, 10) - 2px),
    transparent calc(100% / var(--bar-segments, 10))
  );
  mask-image: repeating-linear-gradient(
    to right,
    #000 0,
    #000 calc(100% / var(--bar-segments, 10) - 2px),
    transparent calc(100% / var(--bar-segments, 10) - 2px),
    transparent calc(100% / var(--bar-segments, 10))
  );
}

.vertical-bar.bar-segmented .${CARD.htmlStructure.elements.progressBar.bar.class} {
  -webkit-mask-image: repeating-linear-gradient(
    to bottom,
    #000 0,
    #000 calc(100% / var(--bar-segments, 10) - 2px),
    transparent calc(100% / var(--bar-segments, 10) - 2px),
    transparent calc(100% / var(--bar-segments, 10))
  );
  mask-image: repeating-linear-gradient(
    to bottom,
    #000 0,
    #000 calc(100% / var(--bar-segments, 10) - 2px),
    transparent calc(100% / var(--bar-segments, 10) - 2px),
    transparent calc(100% / var(--bar-segments, 10))
  );
}

/**
 * === ICON ANIMATION (icon_animation:
 * spin|pulse|bounce|shake|ping|reveal|washing_machine|battery_charging;
 * battery_charging triggers on a charging attribute, the rest on active
 * state) ===
 */
@keyframes epb-icon-spin {
  to { transform: rotate(360deg); }
}

@keyframes epb-icon-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.7; }
}

@keyframes epb-icon-bounce {
  0% { transform: scale3d(1, 1, 1); }
  7% { transform: scale3d(1.25, 0.75, 1); }
  10% { transform: scale3d(0.75, 1.25, 1); }
  12% { transform: scale3d(1.15, 0.85, 1); }
  16% { transform: scale3d(0.95, 1.05, 1); }
  19% { transform: scale3d(1.05, 0.95, 1); }
  25% { transform: scale3d(1, 1, 1); }
}

@keyframes epb-icon-shake {
  0%, 100% { transform: translate(0, 0) rotate(0); }
  20% { transform: translate(0.4px, -0.4px) rotate(-4deg); }
  40% { transform: translate(-0.4px, 0.4px) rotate(4deg); }
  60% { transform: translate(0.4px, 0.4px) rotate(-4deg); }
  80% { transform: translate(-0.4px, -0.4px) rotate(4deg); }
}

/**
 * ring bursts from the shape's own border, using the same icon/shape color as
 * everywhere else
 */
@keyframes epb-icon-ping {
  60% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default})) 70%, transparent);
  }
  100% { box-shadow: 0 0 5px 15px transparent; }
}

@keyframes epb-icon-reveal {
  0% { clip-path: circle(0% at 50% 85%); }
  20% { clip-path: circle(30% at 50% 85%); }
  40% { clip-path: circle(55% at 50% 85%); }
  60% { clip-path: circle(80% at 50% 85%); }
}

/* porthole wipe, mid-cycle only - the implicit 0%/100% (no clip-path, icon
   fully visible) is the resting frame; paired with epb-icon-shake (already
   defined above) on .icon-anim-washing-machine for the drum-spin look */
@keyframes epb-icon-drum {
  50% {
    clip-path: polygon(0 0, 0 100%, 35% 100%, 34% 68%, 60% 41%, 71% 56%, 65% 74%, 47% 79%, 32% 69%, 35% 100%, 100% 100%, 100% 0);
  }
}

/* battery-bolt fill wipe: a clip-path window sliding down the icon, repeating
   - the 80%-100% hold is the pause between charge sweeps
   - the bolt's x-edges are CSS vars (--epb-charge-x1/x2, default 34%/67%) so
     .icon-anim-battery-charging-shifted can compensate for icon variants
     (battery-charging-*, battery-bluetooth-*) whose glyph isn't centered the
     same way the plain battery outline is - see ViewCore.isBatteryIconShifted */
@keyframes epb-icon-charge {
  0%, 80% { clip-path: inset(0 0 0 0); }
  10% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) 29%, var(--epb-charge-x2, 67%) 29%,
      var(--epb-charge-x2, 67%) 89%, var(--epb-charge-x1, 34%) 89%, var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  20% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) 29%, var(--epb-charge-x2, 67%) 29%,
      var(--epb-charge-x2, 67%) 79%, var(--epb-charge-x1, 34%) 79%, var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  30% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) 29%, var(--epb-charge-x2, 67%) 29%,
      var(--epb-charge-x2, 67%) 69%, var(--epb-charge-x1, 34%) 69%, var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  40% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) 29%, var(--epb-charge-x2, 67%) 29%,
      var(--epb-charge-x2, 67%) 59%, var(--epb-charge-x1, 34%) 59%, var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  50% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) 29%, var(--epb-charge-x2, 67%) 29%,
      var(--epb-charge-x2, 67%) 49%, var(--epb-charge-x1, 34%) 49%, var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  60% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) 29%, var(--epb-charge-x2, 67%) 29%,
      var(--epb-charge-x2, 67%) 39%, var(--epb-charge-x1, 34%) 39%, var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  70% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) 29%, var(--epb-charge-x2, 67%) 29%,
      var(--epb-charge-x2, 67%) 29%, var(--epb-charge-x1, 34%) 29%, var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
}

.icon-anim-spin .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-spin 2s linear infinite;
}

.icon-anim-pulse .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-pulse 1.6s ease-in-out infinite;
}

.icon-anim-bounce .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-bounce 3s ease infinite;
  transform-origin: 50% 90%;
}

.icon-anim-shake .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-shake 800ms ease-in-out infinite;
  transform-origin: 50% 110%;
}

.icon-anim-ping .${CARD.htmlStructure.elements.shape.class} {
  animation: epb-icon-ping 2s infinite;
}

.icon-anim-washing-machine .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-shake 400ms ease-in-out infinite, epb-icon-drum 2s ease infinite;
  transform-origin: 50% 110%;
}

.icon-anim-reveal .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-reveal 2s steps(1) infinite;
}

.icon-anim-battery-charging .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-charge 3s linear infinite;
}

/* Placeholder offset for battery-charging/battery-bluetooth icon variants -
   needs live tuning against the actual glyph, see ViewCore.isBatteryIconShifted */
.icon-anim-battery-charging-shifted .${CARD.htmlStructure.elements.icon.class} {
  --epb-charge-x1: 17%;
  --epb-charge-x2: 50%;
}

/* === ALERT (alert_when: {above/below, color, highlight, animation}) ===
   highlight: border (default) colors the border; background tints the card
   background instead and leaves the border neutral.
   animation: static (no motion) / blink (pulse) / ping (border ring burst,
   border target only - see ViewCore.alertAnimation for the background
   fallback). Omitting it keeps the pre-1.6 defaults: blink for border,
   static for background.
   The global prefers-reduced-motion block (animation-iteration-count: 1)
   stops blink/ping after a single, near-instant pass; the border/background
   base color from .alert-active(.alert-background) remains, so the alert
   stays visible without the motion. */
@keyframes epb-alert-border {
  0%, 100% { border-color: var(--alert-color-final); }
  50% { border-color: var(--epb-card-border-color, var(--ha-card-border-color, var(--divider-color, #e0e0e0))); }
}

@keyframes epb-alert-background {
  0%, 100% { background-color: color-mix(in srgb, var(--alert-color-final) 15%, var(--ha-card-background, var(--card-background-color))); }
  50% { background-color: var(--ha-card-background, var(--card-background-color)); }
}

/* ring bursts from the card's own border, reusing the epb-icon-ping technique */
@keyframes epb-alert-ping {
  60% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--alert-color-final) 70%, transparent);
  }
  100% { box-shadow: 0 0 5px 15px transparent; }
}

.alert-active {
  --alert-color-final: var(--alert-color, var(--error-color, #db4437));
  border-color: var(--alert-color-final);
}

.alert-active.alert-anim-blink {
  animation: epb-alert-border 1.2s ease-in-out infinite;
}

.alert-active.alert-anim-ping {
  animation: epb-alert-ping 1.5s ease-out infinite;
}

.alert-active.alert-background {
  border-color: var(--epb-card-border-color, var(--ha-card-border-color, var(--divider-color, #e0e0e0)));
  background-color: color-mix(in srgb, var(--alert-color-final) 15%, var(--ha-card-background, var(--card-background-color)));
}

.alert-active.alert-background.alert-anim-blink {
  animation: epb-alert-background 1.2s ease-in-out infinite;
}

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

.vertical.up-orientation.${CARD.style.dynamic.progressBar.effect.glass.class} {
  --progress-effect: linear-gradient(0deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  --progress-effect-neg: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
}

/* ----- gradient / gradient-reverse ----- */
.${CARD.style.dynamic.progressBar.effect.gradient.class},
.${CARD.style.dynamic.progressBar.effect.gradientReverse.class} {
  --progress-effect-gradient: linear-gradient(
    90deg,
    color-mix(in srgb, white 40%, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})),
    var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})
  );
  --progress-effect-gradient-rev: linear-gradient(
    270deg,
    color-mix(in srgb, white 40%, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})),
    var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})
  );
}

.vertical.up-orientation.${CARD.style.dynamic.progressBar.effect.gradient.class},
.vertical.up-orientation.${CARD.style.dynamic.progressBar.effect.gradientReverse.class} {
  --progress-effect-gradient: linear-gradient(
    0deg,
    color-mix(in srgb, white 40%, var(--progress-bar-color, var(--state-icon-color))),
    var(--progress-bar-color, var(--state-icon-color))
  );
  --progress-effect-gradient-rev: linear-gradient(
    180deg,
    color-mix(in srgb, white 40%, var(--progress-bar-color, var(--state-icon-color))),
    var(--progress-bar-color, var(--state-icon-color))
  );
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
) .${CARD.htmlStructure.elements.progressBar.inner.class}.positive {
  --inner-background: var(--epb-progress-bar-color, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default}));
}

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

/* --- Horizontal positive: gradient on ::before, scaleX from right --- */
.horizontal-bar:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.positive::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--epb-progress-bar-color, var(--progress-effect));
  transform-origin: right center;
  transform: scaleX(var(--inner-size, 0));
  will-change: transform;
}

/**
 * --- Horizontal center-zero negative: gradient on ::before, scaleX from left
 * ---
 */
.horizontal-bar.center-zero:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.negative::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--epb-progress-bar-color, var(--progress-effect-neg));
  transform-origin: left center;
  transform: scaleX(var(--inner-size, 0));
  will-change: transform;
}

/* --- Vertical positive: gradient on ::before, scaleY from top --- */
.vertical-bar:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.positive::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--epb-progress-bar-color, var(--progress-effect));
  transform-origin: center top;
  transform: scaleY(var(--inner-size, 0));
  will-change: transform;
}

/**
 * --- Vertical center-zero negative: gradient on ::before, scaleY from bottom
 * ---
 */
.vertical-bar.center-zero:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.negative::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--epb-progress-bar-color, var(--progress-effect-neg));
  transform-origin: center bottom;
  transform: scaleY(var(--inner-size, 0));
  will-change: transform;
}

/**
 * --- Transition: sync ::before scale with .inner translate (transition-ready
 * only) ---
 */
.horizontal-bar.transition-ready:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.positive::before,
.horizontal-bar.center-zero.transition-ready:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.negative::before {
  transition: transform var(--progress-transition);
}

.vertical-bar.transition-ready:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.positive::before,
.vertical-bar.center-zero.transition-ready:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.negative::before {
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

/* horizontales */
.${CARD.style.dynamic.progressBar.effect.shimmer.class} {
  --shimmer-direction: 90deg;
  --shimmer-animation: shimmer-ltr;
}

.${CARD.style.dynamic.progressBar.effect.shimmerReverse.class} {
  --shimmer-direction: 90deg;
  --shimmer-animation: shimmer-rtl;
}

/* verticales */
.vertical.up-orientation.${CARD.style.dynamic.progressBar.effect.shimmer.class} {
  --shimmer-direction: 0deg;
  --shimmer-animation: shimmer-btt;
}

.vertical.up-orientation.${CARD.style.dynamic.progressBar.effect.shimmerReverse.class} {
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

.vertical.up-orientation.overlay .mark {
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

.vertical.up-orientation.overlay .${CARD.htmlStructure.elements.progressBar.zeroMark.class} {
  --mark-height: var(--epb-zero-mark-width, 1px);
  --mark-top: 50%;
}

/* --- Base watermark styles ---*/
.watermark {
  --wm-line-size: var(--epb-watermark-line-size, var(--watermark-line-size, 1px));
  --wm-circle-size: var(--watermark-circle-size, 5px);
  --wm-tri-size: var(--watermark-triangle-size, 8px);
  --wm-half-line: calc(var(--wm-line-size) /2);
  --wm-half-circle: calc(var(--wm-circle-size) / 2);
  --wm-half-tri: calc(var(--wm-tri-size) / 2);
}
.${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  --wm-value: var(--low-watermark-value, 20%);
  --wm-color: var(--epb-low-watermark-color, var(--low-watermark-color, var(--red-color)));
}
.${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --wm-value: var(--high-watermark-value, 80%);
  --wm-color: var(--epb-high-watermark-color, var(--high-watermark-color, var(--red-color)));
}
:is(.lwm-area, .lwm-blended, .lwm-line, .lwm-round) .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
:is(.hwm-area, .hwm-blended, .hwm-line, .hwm-round) .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-background: var(--wm-color);
}

/* ---------- show ---------- */
.show-lwm .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.show-hwm .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-display: flex;
}

/* ---------- Area, Blended, Striped positioning ---------- */
:is(.lwm-area, .lwm-blended, .lwm-striped) .${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  --mark-left: 0;
  --mark-width: var(--wm-value);
}
:is(.hwm-area, .hwm-blended, .hwm-striped) .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-right: 0;
  --mark-width: calc(100% - var(--wm-value));
}

.vertical.up-orientation.overlay:is(.lwm-area, .lwm-blended, .lwm-striped) .${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  --mark-height: var(--wm-value);
}
.vertical.up-orientation.overlay:is(.hwm-area, .hwm-blended, .hwm-striped) .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-bottom: var(--wm-value);
  --mark-height: calc(100% - var(--wm-value));
}

/* ---------- Blended ---------- */
.lwm-blended .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.hwm-blended .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  mix-blend-mode: hard-light;
}

/* ---------- Striped ---------- */
.lwm-striped .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.hwm-striped .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-background: repeating-linear-gradient(-45deg,
    var(--wm-color) 0,
    var(--wm-color) 3px,
    transparent 3px, transparent 6px);
}

/* ---------- Line ---------- */
.lwm-line .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.hwm-line .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --wm-position: calc(var(--wm-value) - var(--wm-half-line));
  --mark-width: var(--wm-line-size);
  --mark-left: var(--wm-position);
  border: none;
  transform: none;
}
.vertical.up-orientation.overlay.lwm-line .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.vertical.up-orientation.overlay.hwm-line .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-height: var(--wm-line-size);
  --mark-bottom: var(--wm-position);
}

/* ---------- Round ---------- */
.lwm-round .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.hwm-round .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-top: 50%;
  --mark-width: var(--wm-circle-size);
  --mark-height: var(--wm-circle-size);
  transform: translateY(-50%);
  border-radius: 50%;
  border: none;
}
.lwm-round .${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  --mark-left: calc(var(--wm-value) - var(--wm-half-circle));
}
.hwm-round .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-left: calc(var(--wm-value) - var(--wm-half-circle));
}
.vertical.up-orientation.overlay.lwm-round .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.vertical.up-orientation.overlay.hwm-round .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-left: 50%;
  --mark-right: auto;
  --mark-top: auto;
  --mark-bottom: calc(var(--wm-value) - var(--wm-half-circle));
  --mark-width: var(--wm-circle-size);
  transform: translateX(-50%);
}

/* ---------- Triangle ---------- */
.lwm-triangle .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.hwm-triangle .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-left: calc(var(--wm-value) - var(--wm-half-tri));
  --mark-width: 0;
  --mark-height: 0;
  --mark-background: transparent;
  border-top: var(--wm-tri-size) solid var(--wm-color);
  border-left: var(--wm-half-tri) solid transparent;
  border-right: var(--wm-half-tri) solid transparent;
}
.vertical.up-orientation.overlay.lwm-triangle .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.vertical.up-orientation.overlay.hwm-triangle .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-left: 0;
  --mark-bottom: calc(var(--wm-value) - var(--wm-half-tri));
  border-right: none;
  border-top: var(--wm-half-tri) solid transparent;
  border-left: var(--wm-tri-size) solid var(--wm-color);
  border-bottom: var(--wm-half-tri) solid transparent;
}

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
.${CARD.style.dynamic.hiddenComponent.progress_bar.class} .${CARD.htmlStructure.elements.progressBar.bar.class},
.${CARD.style.dynamic.hiddenComponent.shape.class} .${CARD.htmlStructure.elements.shape.class} ha-ripple {
  display: none;
}

/* Shape transparency when hidden */
.${CARD.style.dynamic.hiddenComponent.shape.class} .${CARD.htmlStructure.elements.shape.class} {
  background-color: transparent;
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

/* Suppress shape/icon ripple when icon has no action */
${CARD.htmlStructure.card.element}:not(.${CARD.style.dynamic.clickable.icon}) .${CARD.htmlStructure.elements.shape.class} {
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
   TRANSFORMATION VERTICALE - ORIENTATION DU BAS VERS LE HAUT
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

/******************************************************************************
 * 🛠️ Editor component styles
 ******************************************************************************/

const CHIPS_HOST_STYLE = css`
  :host { display: block; width: 100%; }
  .lbl { display: block; font-size: 1rem; font-weight: 400; line-height: 1.5;
    color: var(--primary-text-color); padding-bottom: 4px; }
  .chip-set { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip { display: inline-flex; align-items: center; height: 32px; padding: 0 16px; box-sizing: border-box;
    border: 1px solid var(--divider-color, #e0e0e0); border-radius: 8px; background: transparent;
    color: var(--primary-text-color); font-family: inherit; font-size: 14px; line-height: 1; cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s; }
  .chip:hover { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
  .chip.selected { background: var(--primary-color); border-color: var(--primary-color);
    color: var(--text-primary-color, #fff); }
`;

const BAR_STACK_EDITOR_STYLE = css`
  :host { display: block; width: 100%; }
  .lbl {
    display: block;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--primary-text-color);
    padding-bottom: 4px;
  }
  .row-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
  }
  .row-header { display: flex; align-items: center; justify-content: space-between; }
  .row-title { font-size: 0.9rem; color: var(--secondary-text-color); }
  .del-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--secondary-text-color);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    box-sizing: border-box;
  }
  .del-btn:hover { color: var(--primary-color); }
  .del-btn ha-svg-icon { width: 16px; height: 16px; }
  .add-row { display: flex; justify-content: flex-start; margin-top: 4px; }
`;

const CUSTOM_THEME_EDITOR_STYLE = css`
  :host { display: block; width: 100%; }
  .lbl {
    display: block;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--primary-text-color);
    padding-bottom: 4px;
  }
  .zone {
    display: flex;
    flex-direction: column;
    gap: 16px;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
  }
  .zone-header { display: flex; align-items: center; justify-content: space-between; }
  .zone-title { font-size: 0.9rem; color: var(--secondary-text-color); }
  .numbers-row { display: flex; gap: 16px; }
  .numbers-row > * { width: calc((100% - 16px) * 0.5); }
  .del-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--secondary-text-color);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    box-sizing: border-box;
  }
  .del-btn:hover { color: var(--primary-color); }
  .del-btn ha-svg-icon { width: 16px; height: 16px; }
  .add-row { display: flex; justify-content: flex-start; margin-top: 4px; }
`;

const EDITOR_BASE_STYLE = css`
  .editor { display: flex; flex-direction: column; gap: 16px; }
  .panel-body { display: flex; flex-direction: row; gap: 16px; flex-wrap: wrap; align-content: flex-start; padding: 8px 0; }
  .panel-body ha-selector.field-toggle { margin-block: -18px; }
  .migrate-header { display: flex; justify-content: flex-end; }
`;

/**
 * Shared constructed stylesheets (Constructable Stylesheets API).
 *
 * CF5 - issue (perf) resolved - each card instance used to create its own
 * <style> element holding the full ~47 KB CARD_CSS: N cards on a dashboard
 * meant N parses and N CSSOM copies, re-done on every editor keystroke
 * (setConfig → reset → render). A constructed CSSStyleSheet is parsed once
 * per unique CSS text and shared BY REFERENCE by every shadowRoot that
 * adopts it.
 *
 * Intent & constraints:
 * - Progressive enhancement ONLY. The README promises Firefox 94+ and
 *   Safari 15.4+, but `new CSSStyleSheet()` + `replaceSync` need
 *   Firefox 101 / Safari 16.4. Older engines (e.g. wall-mounted iPads
 *   stuck on iPadOS 15) must keep working: getSharedStyleSheet() returns
 *   null there and the caller falls back to the legacy per-instance
 *   <style> element — the exact pre-existing behavior, no better no worse.
 * - The cache is keyed by CSS text (not by class) so a future subclass
 *   overriding _cardStyle transparently gets its own shared sheet.
 * - adoptedStyleSheets survive `shadowRoot.innerHTML = ''` (reset()):
 *   adopting is done once per shadowRoot and needs no re-application on
 *   re-render.
 */
const CONSTRUCTED_SHEETS = new Map();
const getSharedStyleSheet = (cssText) => {
  if (CONSTRUCTED_SHEETS.has(cssText)) return CONSTRUCTED_SHEETS.get(cssText);
  let sheet = null;
  try {
    const constructed = new CSSStyleSheet();
    constructed.replaceSync(cssText);
    sheet = constructed;
  } catch {
    // Firefox < 101, Safari < 16.4 (not constructible) → keep null, legacy
    // <style> fallback
  }
  CONSTRUCTED_SHEETS.set(cssText, sheet);
  return sheet;
};

export { css };
export { CARD_CSS };
export { CHIPS_HOST_STYLE };
export { BAR_STACK_EDITOR_STYLE };
export { CUSTOM_THEME_EDITOR_STYLE };
export { EDITOR_BASE_STYLE };
export { CONSTRUCTED_SHEETS };
export { getSharedStyleSheet };
