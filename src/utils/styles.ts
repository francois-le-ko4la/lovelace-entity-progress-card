/*
 * All CSS for the card and the visual editor: CARD_CSS (the
 * card/badge/feature/template stylesheet), the editor components' own styles,
 * and the Constructable-Stylesheet caching helpers that let every card instance
 * share one parsed sheet instead of re-parsing per instance.
 */

import { CARD } from './parameters.js';

/**
 * Identity tag - behaves exactly like an untagged template literal at
 * runtime. Marks a template literal as CSS so the build script
 * (scripts/build.js) can find and minify it without needing to know each
 * variable/usage by name.
 */
const css = (strings: TemplateStringsArray, ...values: unknown[]): string =>
  strings.reduce((acc, s, i) => acc + s + (i < values.length ? values[i] : ''), '');

// glass/gradient/gradient_reverse all paint the same ::before layer - one
// fragment instead of the same 3-class :is() list spelled out 8 times below.
const BAR_EFFECT_GRADIENTS = `:is(.${CARD.style.dynamic.progressBar.effect.glass.class}, .${CARD.style.dynamic.progressBar.effect.gradient.class}, .${CARD.style.dynamic.progressBar.effect.gradientReverse.class})`;

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
  --vertical-gap: 0px;

  /* === HA RIPPLE === */
  --ha-ripple-hover-opacity: 0.04;
  --ha-ripple-pressed-opacity: 0.12;

  /* === BORDER RADIUS === */
  --ha-standard-border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
  /* CF5 - issue (medium) resolved - --feature-border-radius was referenced by
     the RADIUS EFFECT rule below but never defined, so a Feature's bar radius
     resolved invalid and fell back to 0 (always square, whatever the theme).
     Same theme chain as the card's own bar, still overridable by card_mod. */
  --feature-border-radius: var(--ha-standard-border-radius);
}

.${CARD.style.bar.sizeOptions.xsmall} {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-xs));
}

.${CARD.style.bar.sizeOptions.small} {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-s));
}

.${CARD.style.bar.sizeOptions.medium} {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-m));
}

.${CARD.style.bar.sizeOptions.large} {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-l));
}

.${CARD.style.bar.sizeOptions.xlarge} {
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

/* A Feature's row height must not shrink to the bar's thickness: HA reserves a
   fixed row and .progress-container already centers the bar inside it.
   --feature-height is HA's own card-feature variable (hui-card-features.ts),
   read live so theme overrides follow. top/bottom re-declare it themselves. */
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
  /* --current-embed-*: fed by the .type-entities/.type-picture-elements
     input rules below (single declaration point for the terminal vars
     stays here - those rules only ever set the -embed- input, never
     -card-height/-card-min-width directly anymore). */
  --current-card-min-width: var(${CARD.style.dynamic.card.minWidth.var}, var(--current-embed-min-width, 100%));
  /* --min-grid-rows arrives from JS as a plain number; the row math stays here,
     on HA's own Sections formula (hui-grid-section.ts .card.fit-rows):
     N*(row+gap) - gap. --row-size is HA's inline value and wins whenever
     grid_options.rows is a number; 56px/8px are HA's defaults for views that
     set neither. --min-grid-rows-fallback covers the frame before JS runs. */
  --current-card-height: var(
    ${CARD.style.dynamic.card.height.var},
    var(
      --current-embed-height,
      calc(
        (var(--row-size, var(--min-grid-rows, var(--min-grid-rows-fallback, 1))) * (var(--ha-section-grid-row-height, 56px) + var(--ha-section-grid-row-gap, 8px))) -
          var(--ha-section-grid-row-gap, 8px)
      )
    )
  );
  --current-card-padding: 0 var(--spacing);
  --current-card-margin: 0 auto;
  --current-card-border-radius: var(--ha-standard-border-radius);

  display: flex;
  align-items: center;
  justify-content: center;
  position: relative; /* positioning context for top/bottom */
  margin: var(--current-card-margin);
  padding: var(--current-card-padding);
  min-width: var(--epb-card-width, var(--current-card-min-width));
  width: var(--epb-card-width, auto);
  /* min-height, not height (issue #131): a fixed height plus overflow: hidden
     clips content that legitimately grew - the OS "larger text" setting scales
     font-size but nothing in px. Protects the *unconfigured* default only. */
  min-height: var(--epb-card-height, var(--current-card-height));
  /* An explicit height: config wins outright everywhere (Sections, Masonry,
     embedded), unlike min-height above - too small for the content means it
     clips, and that is the user's call. Deliberately not scoped to a
     detectable container: that depended on which one card_mod happens to patch
     (verified live: entities yes, type: grid no). --card-height is only ever
     set inline when config.height is truthy. */
  height: var(--card-height, var(--current-height-fallback, auto));
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
  --current-card-padding: 0 var(--spacing);
}

.vertical {
  --min-grid-rows-fallback: 2;
  --current-card-padding: var(--spacing);
}

/* The formula lives solely on the base ${CARD.htmlStructure.card.element} type
   selector (0-0-1); .marginless is a class (0-1-0), so it wins on specificity
   alone regardless of source order. */
.marginless {
  --current-card-height: unset;
  --current-card-padding: 0;
  --current-card-margin: 0;
}

/* === BADGE === */
.progress-badge {
  --current-card-height: var(--ha-badge-size, 36px);
  --current-card-min-width: var(--card-min-width, var(--ha-badge-size, 130px));
  --current-card-border-radius: var(--ha-badge-border-radius,calc(var(--ha-badge-size,36px)/ 2));
}

/* === TYPE: PICTURE-ELEMENTS === */
/* Embedded-context input only (see --current-embed-min-width in the base
   ha-card rule above, the single place the terminal var is set) - HA marks
   the ancestor card with this same class, .type-entities below relies on
   the exact same convention. */
.type-picture-elements {
  --current-embed-min-width: 200px;
}

/* === FRAMELESS & ENTITIES STYLES === */
.type-entities,
.type-custom-vertical-stack-in-card,
.${CARD.style.dynamic.frameless} {
  --ha-card-background: transparent;
  --ha-card-border-width: 0;
  --ha-card-box-shadow: none;
}

/* Embedded-context input only - the base ha-card rule is the single place the
   terminal height var is set. auto, not a px guess: a native entity row's own
   height varies (with secondary_info, among others), so there is no right
   constant; an explicit height: config is how a user pins one. */
.type-entities {
  --current-card-padding: 0;
  --current-card-margin: 0;
  --ha-ripple-hover-opacity: 0;
  --ha-ripple-pressed-opacity: 0;
  --current-embed-height: auto;

  transition: none !important;
}

/* Same value as --text-height, so .bar-container matches the row's own text
   line-height instead of the generic 16px and centers against a native
   entities row. :not(.xlarge)/:not(.background): both force a taller
   container height of their own, which this would squeeze back to 22.4px. */
.type-entities:not(.xlarge):not(.background) {
  --current-specific-progress-container-height: var(--entities-height);
}

/* =============================================================================
   RIPPLE ZONE (card-level <ha-ripple> - see CARD.htmlStructure.sections
   .rippleZone for why it is a sibling of .container, not a child)
   ============================================================================= */

.${CARD.htmlStructure.sections.rippleZone.class} {
  position: absolute;
  inset: 0;
  /* Same var() chain ha-card's own border-radius reads (styles.ts's own
     ${CARD.htmlStructure.card.element} rule), not "inherit" - confirmed
     live that inherit wasn't giving this the same curve as ha-card's own
     corners, cutting into the :focus-visible border below at each corner. */
  border-radius: var(--epb-card-border-radius, var(--current-card-border-radius));
  overflow: hidden;
}

/* No action configured on the card itself - nothing for this to catch, and
   left alone it would otherwise still intercept every click that falls
   through .container (pointer-events: none below), silently swallowing
   clicks that should have gone nowhere instead of doing nothing visibly. */
${CARD.htmlStructure.card.element}:not(.${CARD.style.dynamic.clickable.card}) .${CARD.htmlStructure.sections.rippleZone.class} {
  pointer-events: none;
}

/* This card's click target is .ripple-zone, not ha-card (see card-config.ts),
   so its focus ring lives here. A real border, not box-shadow/outline: both get
   clipped by this element's own overflow: hidden, a border is part of the box.
   Kept inside the inset: 0 box too - bleeding out to ha-card's own edge gets
   clipped by ha-card's overflow: hidden (confirmed live, corners cut). */
.${CARD.htmlStructure.sections.rippleZone.class}:focus-visible {
  outline: none;
  border: 2px solid var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}));
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
  color: var(--epb-trend-icon-color, var(${CARD.style.dynamic.trendIndicator.color.var}, var(--state-icon-color)));
}

/* =============================================================================
   STATUS LABEL
   ============================================================================= */

/* GitHub-label-style pill, mutually exclusive with .trend-indicator
   (schema.ts's applyLabelRule). Same recipe as Primer's own dark-theme issue
   labels (@primer/react IssueLabelToken.module.css): a translucent tint for the
   background, border/text the same hue lightened just enough to stay legible.
   --epb-label-color/-background-color/-border-color override each separately. */
.status-label {
  --label-perceived-lightness: calc(
    ((var(${CARD.style.dynamic.label.r.var}, ${CARD.style.dynamic.label.r.default}) * 0.2126) +
      (var(${CARD.style.dynamic.label.g.var}, ${CARD.style.dynamic.label.g.default}) * 0.7152) +
      (var(${CARD.style.dynamic.label.b.var}, ${CARD.style.dynamic.label.b.default}) * 0.0722)) / 255
  );
  --label-lightness-threshold: 0.6;
  --label-lightness-switch: max(
    0,
    min(calc(1 / (var(--label-lightness-threshold) - var(--label-perceived-lightness))), 1)
  );
  --label-lighten-by: calc(
    ((var(--label-lightness-threshold) - var(--label-perceived-lightness)) * 100) * var(--label-lightness-switch)
  );

  position: absolute;
  top: 4px;
  right: 4px;
  max-width: calc(100% - 8px);
  z-index: 1;
  box-sizing: border-box;
  padding: 0 4px;
  border-radius: 999px;
  /* Same 10px used by multiline's own secondary-info-value (see
     .info-multiline .secondary-info-wrapper .secondary-info-value) - a
     smaller, established "compact text" reference instead of matching
     secondary_info's own full size. */
  font-size: 10px;
  font-weight: var(--ha-font-weight-medium);
  line-height: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid
    var(
      --epb-label-border-color,
      hsla(
        var(${CARD.style.dynamic.label.h.var}, ${CARD.style.dynamic.label.h.default}),
        calc(var(${CARD.style.dynamic.label.s.var}, ${CARD.style.dynamic.label.s.default}) * 1%),
        calc((var(${CARD.style.dynamic.label.l.var}, ${CARD.style.dynamic.label.l.default}) + var(--label-lighten-by)) * 1%),
        0.3
      )
    );
  background-color: var(
    --epb-label-background-color,
    rgba(
      var(${CARD.style.dynamic.label.r.var}, ${CARD.style.dynamic.label.r.default}),
      var(${CARD.style.dynamic.label.g.var}, ${CARD.style.dynamic.label.g.default}),
      var(${CARD.style.dynamic.label.b.var}, ${CARD.style.dynamic.label.b.default}),
      0.18
    )
  );
  color: var(
    --epb-label-color,
    hsl(
      var(${CARD.style.dynamic.label.h.var}, ${CARD.style.dynamic.label.h.default}),
      calc(var(${CARD.style.dynamic.label.s.var}, ${CARD.style.dynamic.label.s.default}) * 1%),
      calc((var(${CARD.style.dynamic.label.l.var}, ${CARD.style.dynamic.label.l.default}) + var(--label-lighten-by)) * 1%)
    )
  );
}

.status-label:empty {
  display: none;
}

/* label_position: left - swaps which corner the pill sits in (see
   HACore._addBaseClasses). right stays the plain default above, no class
   needed for it. */
ha-card.label-left .status-label {
  right: auto;
  left: 4px;
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
  background-color: var(--shape-hover-color, var(--shape-background-color, var(--epb-icon-shape-color, var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default})))));
  opacity: var(--epb-icon-shape-opacity, var(--shape-opacity));
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
  color: var(--epb-icon-color, var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default})));
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
  /* min-height, not height (issue #131): calibrated for the default font scale,
     so the look is unchanged; a scaled-up OS font size grows the box instead of
     clipping text mid-glyph. Excluded for .vertical.up-orientation.overlay,
     which clears it back to auto - a re-declared height isn't enough, min-height
     keeps applying alongside it and measurably changed this item's size. */
  min-height: var(--current-content-height);
  gap: var(--current-content-gap, 0);
  min-width: 0;
  overflow: hidden;
  position: relative; /* overlay */
}

ha-card.horizontal .${CARD.htmlStructure.sections.content.class} {
  --current-content-width: calc(100% - 56px);
  --current-content-flex-grow: 1;
  --current-content-gap: 0;
  /* Cap the fixed name+detail height (36px) to the card so an explicit small
     card height shrinks the content-section instead of overflowing into the
     card's overflow:hidden and clipping the bar. justify-content:center then
     recenters the visible content (a lone bar) in the reduced box. */
  max-height: 100%;
}

/* hide: icon reclaims the 56px column .content's width otherwise always
   deducts for it (see the base rule above) - consistent with every other
   hide target below: hiding a field always gives its space back, nothing
   stays reserved for something that's gone. */
ha-card.horizontal.${CARD.style.dynamic.hiddenComponent.icon.class} .${CARD.htmlStructure.sections.content.class} {
  --current-content-width: 100%;
}

/* --current-content-height sums --name-height + --detail-height
   unconditionally - with hide: name the row's DOM goes but its share of that
   height didn't, leaving the survivor centered in empty space (issue #129).
   Horizontal-only: vertical still needs the full box for overlay/background. */
ha-card.horizontal.${CARD.style.dynamic.hiddenComponent.name.class} .${CARD.htmlStructure.sections.content.class} {
  --name-height: 0px;
}

/* Only zero --detail-height when the row actually goes empty: with
   bar_position: default the bar renders inside that same row, so zeroing it
   starved the row and .content's flex-shrink then ate --name-height too (a
   regression from the #129 fix). Hence :not(.default), or the bar hidden too. */
ha-card.horizontal.${CARD.style.dynamic.hiddenComponent.secondary_info.class}:is(:not(.default), .${CARD.style.dynamic.hiddenComponent.progress_bar.class}) .${CARD.htmlStructure.sections.content.class} {
  --detail-height: 0px;
}

ha-card.vertical .${CARD.htmlStructure.sections.content.class} {
  --current-content-width: 100%;
  --current-content-flex-grow: 0;
  --current-content-gap: var(--vertical-gap);
}

ha-card.vertical.default .${CARD.htmlStructure.sections.content.class} {
  /* Includes .content's 2 x 1px flex gaps: without them this floor ran 2px
     short (44px predicted vs 46px measured), so grid_options: rows: auto
     never landed on a clean row multiple. */
  --current-content-height: calc(
    var(--name-height) + var(--detail-height) + var(--progress-size) + (2 * var(--vertical-gap))
  );
}

/* Not .default-scoped (unlike --progress-size below): the base .content
   --name-height/--detail-height sum also applies to bar_position: top/
   bottom/background - .default-only left a hidden row reserved there too,
   stealing space from the icon under a small explicit height (#139). */
ha-card.vertical.${CARD.style.dynamic.hiddenComponent.name.class} .${CARD.htmlStructure.sections.content.class} {
  --name-height: 0px;
}

ha-card.vertical.${CARD.style.dynamic.hiddenComponent.secondary_info.class} .${CARD.htmlStructure.sections.content.class} {
  --detail-height: 0px;
}

/* General, not layout-scoped: name+secondary_info both invisible (explicit
   hide, or secondary_info auto-blanked below) still leaves .content a real
   flex item, biasing the centered icon off (#139). default/overlay/
   compact_below excluded - .content still hosts the bar or fill there. */
ha-card:not(.default):not(.overlay):not(.compact_below).${CARD.style.dynamic.hiddenComponent.name.class}:is(.${CARD.style.dynamic.hiddenComponent.secondary_info.class}, .secondary-info-blank) .${CARD.htmlStructure.sections.content.class} {
  display: none;
}

/* .vertical only: minGridRows()'s 1-row floor (56px default) minus the
   default 36px shape leaves 20px for padding+border - 2px short of the
   usual 2x10px --spacing, so the icon-only row grows past its reserved row.
   9px (not 10px) makes it fit exactly, assuming the default shape size. */
ha-card.vertical:not(.default):not(.overlay):not(.compact_below).${CARD.style.dynamic.hiddenComponent.name.class}:is(.${CARD.style.dynamic.hiddenComponent.secondary_info.class}, .secondary-info-blank) {
  --current-card-padding: 9px;
}

/* Zeroing --progress-size collapses both the content-height formula's share
   and .bar-container's own height, which would otherwise sit there empty. */
ha-card.vertical.default.${CARD.style.dynamic.hiddenComponent.progress_bar.class} {
  --progress-size: 0px;
}

/* That padding-top reserves room for the bar below the icon+text block, so it
   goes with the bar. hide: icon gets no equivalent - unrelated to the icon. */
ha-card.vertical.default.${CARD.style.dynamic.hiddenComponent.progress_bar.class} .${CARD.htmlStructure.sections.container.class} {
  --current-container-padding-top: 0;
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
  /* Exclusion from the base rule's min-height (issue #131): the overlay bar
     here is position: absolute; height: 100%, which only resolves against a
     definite height. min-height: auto actually removes the constraint - leaving
     it alongside height measurably changed this item's size next to its
     non-shrinking icon sibling. */
  min-height: auto;
  height: var(--current-content-height);
}

/* === TEXT ELEMENTS === */

.${CARD.htmlStructure.elements.nameContent.class},
.${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  /* flex layout, dimensions, overflow, alignment */
  display: flex;
  z-index: 1;
  align-items: var(--group-align-items, center);
  justify-content: var(--group-justify-content, flex-start);
  flex-grow: var(--group-flex-grow, initial);
  width: var(--group-width, auto);
  min-width: var(--group-min-width, 0);
  max-width: var(--group-max-width, none);
  /* min-height + a real line-height, not one pinned to it (issue #131, see
     .content): unchanged at the default font scale, grows only if a larger OS
     font size needs it. Not excluded for .vertical.up-orientation.overlay
     unlike .content: this wrapper isn't a flex item competing with the icon. */
  min-height: var(--group-height);
  line-height: max(var(--group-height), 1.2em);
  overflow: var(--group-overflow, hidden);
  text-align: var(--group-text-align, left);
  box-sizing: var(--group-box-sizing, content-box);
  margin-left: var(--group-margin-left);
  margin-right: var(--group-margin-right);
}

.${CARD.htmlStructure.elements.nameContent.class} {
  --group-height: var(--name-height);
}

.${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-height: var(--detail-height);
  /* The 45px floor holds while the row can spare it, else a quarter. Lower
     than the bar's own 33% cap: text can still ellipsis, a squeezed bar
     stops meaning anything. */
  --group-min-width: min(45px, 25%);
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

/* Same set as StructureElements.createSecondaryInfo's excludedPositions
   (structure.ts): only bar_position: default puts the bar in .secondary-info's
   row, so every other position gets the row's full width. */
ha-card:is(.vertical, .xlarge, .below, .bottom, .top, .overlay, .background) .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-min-width: 100%;
  --group-max-width: 100%;
}

.row-reverse .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-min-width: unset;
}

/* bar_position: compact_below (#123) is a real, separate DOM shape, not a CSS
   rearrangement (StructureElements.createContentBody): .name and
   .secondary-info share a wrapper row, the bar is a sibling row below.
   Horizontal-only (schema.ts's applyCompactBelowRule) - vertical already
   stacks the three narrowly, with no shared row to switch to. */
ha-card.horizontal.compact_below .${CARD.htmlStructure.sections.content.class} {
  --current-content-height: calc(
    max(var(--name-height), var(--detail-height)) + var(--current-progress-container-height)
  );
}
ha-card.horizontal.compact_below .${CARD.htmlStructure.sections.nameSecondaryRow.class} {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing);
  /* baseline, not center: .name and .secondary-info-wrapper render at
     different font sizes (--ha-font-size-m vs -s) - centering each box
     still centers two differently-sized line boxes on their own midpoints,
     not on a shared text baseline, leaving the glyphs visibly offset. */
  align-items: baseline;
}
ha-card.horizontal.compact_below .${CARD.htmlStructure.elements.nameContent.class} {
  --group-flex-grow: 1;
  --group-min-width: 0;
  --group-max-width: none;
}
ha-card.horizontal.compact_below .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-min-width: unset;
  --group-max-width: unset;
}
ha-card.horizontal.compact_below .${CARD.htmlStructure.elements.progressBar.container.class} {
  min-width: unset;
}

.${CARD.layout.orientations.vertical.label} {
  --group-justify-content: center;
  --group-width: 100%;
  --group-max-width: 100%;
  --group-flex-grow: 0;
  --group-text-align: center;
  --group-box-sizing: border-box;
}

.${CARD.layout.orientations.vertical.label} .${CARD.style.bar.sizeOptions.large} {
  --name-height: var(--vertical-name-large-height);
}

.overlay :is(.${CARD.htmlStructure.elements.nameContent.class}, .${CARD.htmlStructure.elements.secondaryInfoWrapper.class}) {
  --group-margin-left: 7px;
  --group-margin-right: 10px;
}
.vertical.up-orientation.overlay :is(.${CARD.htmlStructure.elements.nameContent.class}, .${CARD.htmlStructure.elements.secondaryInfoWrapper.class}) {
  --group-margin-left: 0;
  --group-margin-right: 0;
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
  /* min-height, not height (issue #131, see .content): --text-height stays the
     floor at the default font scale, a larger OS font size grows this box
     instead of clipping text mid-glyph. Not excluded for vertical+up+overlay -
     see .name-content's comment on why this level has no flex conflict. */
  min-height: var(--text-height);
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
  /* max(), not a straight swap to another token (issue #131): pinning
     line-height to the box's own px floor clips the text as soon as OS font
     scaling needs a taller line. max() keeps --name-height as the floor and
     only grows past it via the em term, which tracks the real font-size. */
  --text-line-height: max(var(--name-height), 1.2em);
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
  /* See .name-value's own --text-line-height comment (issue #131) - same
     max(fixed-floor, em-term) reasoning. */
  --text-line-height: max(var(--detail-height), 1.2em);
  --text-letter-spacing: var(--epb-detail-letter-spacing, var(--detail-letter-spacing));
  --text-margin-right: 0;
}

.progress-badge .${CARD.htmlStructure.elements.nameValue.class} {
  --text-color: var(--epb-name-color, var(--secondary-text-color));
  --text-font-size: var(--epb-name-font-size, 10px);
  --text-font-weight: var(--ha-font-weight-medium);
  --text-height: 10px;
  --text-line-height: max(10px, 1.2em);
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
  /* Same shrink-under-pressure idea as the text/bar min-width coupling above:
     the gap gives up a few px once the row gets tight. */
  gap: min(var(--current-secondary-info-gap, var(--spacing)), 6%);
  width: var(--current-secondary-info-width, auto);
  min-width: var(--current-secondary-info-min-width, auto);
  justify-content: space-between;
}

/* .secondary-info-blank is pushed by
   HABase#_updateSecondaryInfoWrapperVisibility (core.ts) whenever every info
   line is empty, single or multiline - one rule instead of two. Class-based on
   purpose: :has() needs Firefox 121+, past this card's documented 94+ floor. */
.secondary-info-blank .secondary-info-wrapper {
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
   Two stacked single-line boxes (StructureElements.secondaryInfoLine), each
   with its own ellipsis. --name-height gives its spare 4px to --detail-height
   so the card's total height doesn't change. */
ha-card.info-multiline {
  --name-height: 16px;
  --detail-height: 20px;
}

.info-multiline .secondary-info-wrapper {
  flex-direction: column;
  /* The --group-* indirection .secondary-info-wrapper's base rule already
     reads - keeps this a one-line diff instead of a competing source. */
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

/* === SEGMENTED BAR (bar_segments: N, HABase#_buildSegmentCells) ===
   N real cells with a real flex gap, not a divider painted over the fill (a
   divider landing on a marker hid it). border-radius forced to 0 on .bar:
   its rounded corner would round the first/last cell unevenly. */
.bar-segmented .${CARD.htmlStructure.elements.progressBar.bar.class} {
  border-radius: 0;
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
  /* Each opaque cell paints over its own share of this - only the real gaps
     between them show it, reading as a cut to the card rather than to
     .bar's own track color. */
  background-color: var(--ha-card-background, var(--card-background-color));
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

/* Shared sonar ring (icon + alert ping). Color via a custom property: a
   color-mix() inside the frame kills the animation on Chrome 92 (issue #128). */
@keyframes epb-ping {
  60% {
    box-shadow: 0 0 0 0 var(--epb-ping-color);
  }
  100% { box-shadow: 0 0 5px var(--epb-ping-spread, 15px) transparent; }
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

/* battery-bolt fill wipe, 80%-100% holds between sweeps. The bolt's edges are
   vars (--epb-charge-x1/x2/y1) so .icon-anim-battery-charging-shifted can
   compensate off-center glyph variants - see ViewCore.isBatteryIconShifted. */
@keyframes epb-icon-charge {
  0%, 80% { clip-path: inset(0 0 0 0); }
  10% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) var(--epb-charge-y1, 29%),
      var(--epb-charge-x2, 67%) var(--epb-charge-y1, 29%), var(--epb-charge-x2, 67%) calc(var(--epb-charge-y1, 29%) + 60%),
      var(--epb-charge-x1, 34%) calc(var(--epb-charge-y1, 29%) + 60%), var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  20% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) var(--epb-charge-y1, 29%),
      var(--epb-charge-x2, 67%) var(--epb-charge-y1, 29%), var(--epb-charge-x2, 67%) calc(var(--epb-charge-y1, 29%) + 50%),
      var(--epb-charge-x1, 34%) calc(var(--epb-charge-y1, 29%) + 50%), var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  30% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) var(--epb-charge-y1, 29%),
      var(--epb-charge-x2, 67%) var(--epb-charge-y1, 29%), var(--epb-charge-x2, 67%) calc(var(--epb-charge-y1, 29%) + 40%),
      var(--epb-charge-x1, 34%) calc(var(--epb-charge-y1, 29%) + 40%), var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  40% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) var(--epb-charge-y1, 29%),
      var(--epb-charge-x2, 67%) var(--epb-charge-y1, 29%), var(--epb-charge-x2, 67%) calc(var(--epb-charge-y1, 29%) + 30%),
      var(--epb-charge-x1, 34%) calc(var(--epb-charge-y1, 29%) + 30%), var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  50% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) var(--epb-charge-y1, 29%),
      var(--epb-charge-x2, 67%) var(--epb-charge-y1, 29%), var(--epb-charge-x2, 67%) calc(var(--epb-charge-y1, 29%) + 20%),
      var(--epb-charge-x1, 34%) calc(var(--epb-charge-y1, 29%) + 20%), var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  60% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) var(--epb-charge-y1, 29%),
      var(--epb-charge-x2, 67%) var(--epb-charge-y1, 29%), var(--epb-charge-x2, 67%) calc(var(--epb-charge-y1, 29%) + 10%),
      var(--epb-charge-x1, 34%) calc(var(--epb-charge-y1, 29%) + 10%), var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  70% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) var(--epb-charge-y1, 29%),
      var(--epb-charge-x2, 67%) var(--epb-charge-y1, 29%), var(--epb-charge-x2, 67%) var(--epb-charge-y1, 29%),
      var(--epb-charge-x1, 34%) var(--epb-charge-y1, 29%), var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
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
  --epb-ping-color: var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}));

  animation: epb-ping 2s infinite;
  /* box-shadow isn't compositor-only: the browser repaints every frame of the
     infinite animation - will-change isolates that cost to this element. */
  will-change: box-shadow;
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
  --epb-charge-x1: 17.5%;
  --epb-charge-x2: 50.5%;
  --epb-charge-y1: 25%;
}

/* === ALERT (alert_when: {above/below, color, highlight, animation}) ===
   highlight: border colors the border, background tints the card instead.
   ping is border-only (ViewCore.alertAnimation falls back for background).
   Under prefers-reduced-motion the base color stays, so the alert still reads. */
@keyframes epb-alert-border {
  0%, 100% { border-color: var(--alert-color-final); }
  50% { border-color: var(--epb-card-border-color, var(--ha-card-border-color, var(--divider-color, #e0e0e0))); }
}

/* Base tier: an opacity-animated ::before overlay instead of animating
   background-color on ha-card each frame, which isn't compositor-only (same
   reasoning as epb-ping's own rewrite above). ha-card goes neutral for the
   duration so the overlay reads the same. The modern tier keeps its original
   color-mix() animation and switches the overlay off instead. */
@keyframes epb-alert-background {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0; }
}

@keyframes epb-alert-background-modern {
  0%, 100% { background-color: color-mix(in srgb, var(--alert-color-final) 15%, var(--ha-card-background, var(--card-background-color))); }
  50% { background-color: var(--ha-card-background, var(--card-background-color)); }
}

/* highlight: label's own pill-scoped variant - the card-border modes above
   blink the border, this one blinks the pill instead. */
@keyframes epb-alert-label-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.alert-active {
  --alert-color-final: var(--alert-color, var(--error-color, #db4437));
  border-color: var(--alert-color-final);
}

/* :not(.alert-label): that mode neutralizes border-color itself (see
   .alert-active.alert-label below) and animates .status-label instead -
   without this exclusion, the border would still blink/ping underneath a
   pill that's supposed to be carrying the alert on its own. */
.alert-active.alert-anim-blink:not(.alert-label) {
  animation: epb-alert-border 1.2s ease-in-out infinite;
}

.alert-active.alert-anim-ping:not(.alert-label) {
  --epb-ping-color: var(--alert-color-final);

  animation: epb-ping 1.5s ease-out infinite;
  /* Same box-shadow repaint cost as icon-anim-ping above, but on the whole
     card rather than a small icon - more noticeable, so worth the same hint. */
  will-change: box-shadow;
}

/* Same overlay-vs-background-color reasoning as epb-alert-background's own
   comment above - old engines get this fixed-opacity tint instead. */
.alert-active.alert-background {
  border-color: var(--epb-card-border-color, var(--ha-card-border-color, var(--divider-color, #e0e0e0)));
  background-color: var(--ha-card-background, var(--card-background-color));
}

.alert-active.alert-background::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: var(--alert-color-final);
  opacity: var(--epb-alert-background-opacity, 0.15);
  pointer-events: none;
}

@supports (background: color-mix(in srgb, red, blue)) {
  .alert-active.alert-background::before {
    content: none;
  }

  .alert-active.alert-background {
    background-color: color-mix(in srgb, var(--alert-color-final) 15%, var(--ha-card-background, var(--card-background-color)));
  }
}

/* Blink: the overlay above swaps its fixed opacity for the animated one
   instead of getting a whole separate layer. */
.alert-active.alert-background.alert-anim-blink::before {
  animation: epb-alert-background 1.2s ease-in-out infinite;
}

@supports (background: color-mix(in srgb, red, blue)) {
  /* Modern tier: the original background-color + color-mix() animation on
     ha-card itself, unchanged - overlay already off (see above). */
  .alert-active.alert-background.alert-anim-blink {
    animation: epb-alert-background-modern 1.2s ease-in-out infinite;
  }
}

/* highlight: label - the status pill (HACore._applyAlertLabel) carries the
   alert, so the card's own border/background stays neutral here and blink/ping
   target .status-label. :not(.alert-label) on the rules above keeps this mode
   from also pulsing a border. --alert-color-final is inherited from
   .alert-active, custom properties crossing the descendant boundary. */
.alert-active.alert-label {
  border-color: var(--epb-card-border-color, var(--ha-card-border-color, var(--divider-color, #e0e0e0)));
}

.alert-active.alert-label.alert-anim-blink .status-label {
  animation: epb-alert-label-blink 1.2s ease-in-out infinite;
}

.alert-active.alert-label.alert-anim-ping .status-label {
  --epb-ping-color: var(--alert-color-final);
  --epb-ping-spread: 8px;

  animation: epb-ping 1.5s ease-out infinite;
  will-change: box-shadow;
}

/* Modern tier for every epb-ping consumer at once: the ring takes a 70% alpha
   wherever color-mix() resolves, staying solid everywhere else (issue #128). */
@supports (background: color-mix(in srgb, red, blue)) {
  .icon-anim-ping .${CARD.htmlStructure.elements.shape.class} {
    --epb-ping-color: color-mix(in srgb, var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default})) 70%, transparent);
  }

  .alert-active.alert-anim-ping:not(.alert-label),
  .alert-active.alert-label.alert-anim-ping .status-label {
    --epb-ping-color: color-mix(in srgb, var(--alert-color-final) 70%, transparent);
  }
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

.vertical.up-orientation.${CARD.style.dynamic.progressBar.effect.gradient.class},
.vertical.up-orientation.${CARD.style.dynamic.progressBar.effect.gradientReverse.class} {
  --progress-effect-gradient: var(--progress-effect-gradient-up-modern, linear-gradient(0deg, rgba(255, 255, 255, 0.4), transparent));
  --progress-effect-gradient-rev: var(--progress-effect-gradient-rev-up-modern, linear-gradient(180deg, rgba(255, 255, 255, 0.4), transparent));
}

@supports (background: color-mix(in srgb, red, blue)) {
  .vertical.up-orientation.${CARD.style.dynamic.progressBar.effect.gradient.class},
  .vertical.up-orientation.${CARD.style.dynamic.progressBar.effect.gradientReverse.class} {
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
/* Whole-pixel centering (same reasoning as bar_segments' dividers): this is a
   real box, so /2 or translate(-50%) is fractional at the odd 5px default and
   can blur or drift half a device pixel. Assumes an odd circle size. */
.lwm-round .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.hwm-round .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-top: calc(50% - (var(--wm-circle-size) - 1px) / 2);
  --mark-width: var(--wm-circle-size);
  --mark-height: var(--wm-circle-size);
  border-radius: 50%;
  border: none;
}
.lwm-round .${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  --mark-left: calc(var(--wm-value) - (var(--wm-circle-size) - 1px) / 2);
}
.hwm-round .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-left: calc(var(--wm-value) - (var(--wm-circle-size) - 1px) / 2);
}
.vertical.up-orientation.overlay.lwm-round .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.vertical.up-orientation.overlay.hwm-round .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-left: calc(50% - (var(--wm-circle-size) - 1px) / 2);
  --mark-right: auto;
  --mark-top: auto;
  --mark-bottom: calc(var(--wm-value) - (var(--wm-circle-size) - 1px) / 2);
  --mark-width: var(--wm-circle-size);
}

/* ---------- Triangle ---------- */
/* Widening the base by 1px on the side outside the position formula looks like
   it should move the apex, but doesn't: with width: 0 the apex sits where
   border-left ends, and --wm-half-tri cancels out of left + border-left. */
.lwm-triangle .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.hwm-triangle .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-left: calc(var(--wm-value) - var(--wm-half-tri));
  --mark-width: 0;
  --mark-height: 0;
  --mark-background: transparent;
  border-top: var(--wm-tri-size) solid var(--wm-color);
  border-left: var(--wm-half-tri) solid transparent;
  border-right: calc(var(--wm-half-tri) + 1px) solid transparent;
}
.vertical.up-orientation.overlay.lwm-triangle .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.vertical.up-orientation.overlay.hwm-triangle .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-left: 0;
  --mark-bottom: calc(var(--wm-value) - var(--wm-half-tri));
  border-right: none;
  border-top: calc(var(--wm-half-tri) + 1px) solid transparent;
  border-left: var(--wm-tri-size) solid var(--wm-color);
  border-bottom: var(--wm-half-tri) solid transparent;
}

/* =============================================================================
   PEAK MARKER (peak_marker: min/max/average from HA history)
   Each mark can have its own type/opacity (unlike watermark's shared low/
   high type), so the type classes below key off the mark, not the card.
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

.show-peak-min .${CARD.htmlStructure.elements.progressBar.minMarker.class},
.show-peak-max .${CARD.htmlStructure.elements.progressBar.maxMarker.class},
.show-peak-avg .${CARD.htmlStructure.elements.progressBar.averageMarker.class} {
  --mark-display: flex;
}

/* ---------- Line ---------- */
.peak-min-line .${CARD.htmlStructure.elements.progressBar.minMarker.class},
.peak-max-line .${CARD.htmlStructure.elements.progressBar.maxMarker.class},
.peak-avg-line .${CARD.htmlStructure.elements.progressBar.averageMarker.class} {
  --wm-position: calc(var(--wm-value) - var(--wm-half-line));
  --mark-width: var(--wm-line-size);
  --mark-left: var(--wm-position);
  --mark-background: var(--wm-color);
  border: none;
  transform: none;
}
.vertical.up-orientation.overlay.peak-min-line .${CARD.htmlStructure.elements.progressBar.minMarker.class},
.vertical.up-orientation.overlay.peak-max-line .${CARD.htmlStructure.elements.progressBar.maxMarker.class},
.vertical.up-orientation.overlay.peak-avg-line .${CARD.htmlStructure.elements.progressBar.averageMarker.class} {
  --mark-height: var(--wm-line-size);
  --mark-bottom: var(--wm-position);
}

/* ---------- Round ---------- */
.peak-min-round .${CARD.htmlStructure.elements.progressBar.minMarker.class},
.peak-max-round .${CARD.htmlStructure.elements.progressBar.maxMarker.class},
.peak-avg-round .${CARD.htmlStructure.elements.progressBar.averageMarker.class} {
  --mark-top: calc(50% - (var(--wm-circle-size) - 1px) / 2);
  --mark-left: calc(var(--wm-value) - (var(--wm-circle-size) - 1px) / 2);
  --mark-width: var(--wm-circle-size);
  --mark-height: var(--wm-circle-size);
  --mark-background: var(--wm-color);
  border-radius: 50%;
  border: none;
}
.vertical.up-orientation.overlay.peak-min-round .${CARD.htmlStructure.elements.progressBar.minMarker.class},
.vertical.up-orientation.overlay.peak-max-round .${CARD.htmlStructure.elements.progressBar.maxMarker.class},
.vertical.up-orientation.overlay.peak-avg-round .${CARD.htmlStructure.elements.progressBar.averageMarker.class} {
  --mark-left: calc(50% - (var(--wm-circle-size) - 1px) / 2);
  --mark-right: auto;
  --mark-top: auto;
  --mark-bottom: calc(var(--wm-value) - (var(--wm-circle-size) - 1px) / 2);
  --mark-width: var(--wm-circle-size);
}

/* ---------- Triangle ---------- */
.peak-min-triangle .${CARD.htmlStructure.elements.progressBar.minMarker.class},
.peak-max-triangle .${CARD.htmlStructure.elements.progressBar.maxMarker.class},
.peak-avg-triangle .${CARD.htmlStructure.elements.progressBar.averageMarker.class} {
  --mark-left: calc(var(--wm-value) - var(--wm-half-tri));
  --mark-width: 0;
  --mark-height: 0;
  --mark-background: transparent;
  border-top: var(--wm-tri-size) solid var(--wm-color);
  border-left: var(--wm-half-tri) solid transparent;
  border-right: calc(var(--wm-half-tri) + 1px) solid transparent;
}
.vertical.up-orientation.overlay.peak-min-triangle .${CARD.htmlStructure.elements.progressBar.minMarker.class},
.vertical.up-orientation.overlay.peak-max-triangle .${CARD.htmlStructure.elements.progressBar.maxMarker.class},
.vertical.up-orientation.overlay.peak-avg-triangle .${CARD.htmlStructure.elements.progressBar.averageMarker.class} {
  --mark-left: 0;
  --mark-bottom: calc(var(--wm-value) - var(--wm-half-tri));
  border-right: none;
  border-top: calc(var(--wm-half-tri) + 1px) solid transparent;
  border-left: var(--wm-tri-size) solid var(--wm-color);
  border-bottom: var(--wm-half-tri) solid transparent;
}

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

/* vertical reserves only the bar's own thickness for its row (no 16px cushion
   like horizontal gets), and .container's padding-top scales with that same raw
   size. Both are forced up to 16px here, through the dedicated
   --current-specific-* slots (immune to being shadowed by an intermediate
   element), so the marker gets room to stay a pill instead of shrinking to a
   circle. large already reaches 16px natively; ViewCore.minGridRows reserves
   the extra grid row this needs. */
ha-card.vertical.default.rainbow-full-bar.${CARD.style.bar.sizeOptions.xsmall},
ha-card.vertical.default.rainbow-full-bar.${CARD.style.bar.sizeOptions.small},
ha-card.vertical.default.rainbow-full-bar.${CARD.style.bar.sizeOptions.medium} {
  --current-specific-progress-container-height: 16px;
  --current-specific-padding-top: 16px;
}
ha-card.vertical.default.rainbow-full-bar.${CARD.style.bar.sizeOptions.xsmall} .${CARD.htmlStructure.sections.content.class},
ha-card.vertical.default.rainbow-full-bar.${CARD.style.bar.sizeOptions.small} .${CARD.htmlStructure.sections.content.class},
ha-card.vertical.default.rainbow-full-bar.${CARD.style.bar.sizeOptions.medium} .${CARD.htmlStructure.sections.content.class} {
  --current-content-height: calc(var(--name-height) + var(--detail-height) + 16px);
}

/* bar_position: below puts the bar in its own sibling (.below-container), so
   there's no padding-top/content-height sum to correct - just the same
   container-height forcing on both boxes that hard-code the bar's row height
   here. Neither inherits --current-progress-container-height the way .default's
   .container does, so .below-container needs its own fallback slot too. */
ha-card.vertical.below.rainbow-full-bar.${CARD.style.bar.sizeOptions.xsmall},
ha-card.vertical.below.rainbow-full-bar.${CARD.style.bar.sizeOptions.small},
ha-card.vertical.below.rainbow-full-bar.${CARD.style.bar.sizeOptions.medium} {
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
   vertical + up + overlay bar is a full-height strip at every size, so a
   smaller marker would look undersized against it. -6px matches 2x the ring. */
.vertical.up-orientation.overlay.rainbow-full-bar .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
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
.vertical.up-orientation.overlay.${CARD.style.dynamic.progressBar.centerZero}.rainbow-full-bar .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  /* --mark-left stays 50%: it's the cross axis here, unrelated to center_zero,
     which only moves the fill axis (--mark-bottom when vertical). Resetting it
     to 0 shoved the pill half a bar-width left, off past the bar's edge. */
  --mark-bottom: calc(50% + (var(${CARD.style.dynamic.progressBar.value.var}, 0) * 50%));
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

/******************************************************************************
 * 🛠️ Editor component styles
 ******************************************************************************/

// Shared by CHIPS_HOST_STYLE/BAR_STACK_EDITOR_STYLE/CUSTOM_THEME_EDITOR_STYLE
// below - each is its own shadow root's stylesheet, so plain string sharing
// (not a CSS-level mechanism) is enough, no cascade-order risk.
const LABEL_STYLE = `.lbl {
    display: block;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--primary-text-color);
    padding-bottom: 4px;
  }`;

// Shared by BAR_STACK_EDITOR_STYLE/CUSTOM_THEME_EDITOR_STYLE below - each
// row's own delete button and the "+ Add..." row beneath the list.
const ROW_DELETE_STYLE = `.del-btn {
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
  .add-row { display: flex; justify-content: flex-start; margin-top: 4px; }`;

const CHIPS_HOST_STYLE = css`
  :host {
    display: block;
    width: 100%;
    /* "loud" = selected, "normal" = standby (ha-button.ts's own mapping). */
    --chip-accent: var(--wa-color-brand-fill-loud, var(--primary-color));
    --chip-accent-text: var(--wa-color-brand-on-loud, var(--text-primary-color, #fff));
    --chip-standby: var(--wa-color-brand-fill-normal, var(--secondary-background-color));
    --chip-standby-text: var(--wa-color-brand-on-normal, var(--primary-text-color));
    --chip-standby-hover: var(--ha-color-fill-primary-normal-hover, var(--divider-color));
    --chip-accent-hover: var(--ha-color-fill-primary-loud-hover, var(--primary-color));
  }
  ${LABEL_STYLE}
  /* Segmented (2-mode) sets read as one control, not a stacked list - label
     and pill share a row, set on the host itself (see chips.ts). */
  :host(.inline-row) { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  :host(.inline-row) .lbl {
    padding-bottom: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  :host(.inline-row) .chip-set.segmented { flex-shrink: 0; }
  .chip-set { display: flex; flex-wrap: wrap; gap: 8px; }
  /* Solid standby/accent fills everywhere, not an opacity-layer tint -
     that layer didn't repaint live on a theme switch (see :host's tokens). */
  .chip { position: relative; display: inline-flex; align-items: center; height: 32px; padding: 0 16px; box-sizing: border-box;
    border: none; border-radius: 8px; font-family: inherit; font-size: 14px; line-height: 1; font-weight: 500; cursor: pointer;
    background: var(--chip-standby); color: var(--chip-standby-text);
    transition: background-color 0.15s; }
  .chip:hover { background: var(--chip-standby-hover); }
  .chip.selected { background: var(--chip-accent); color: var(--chip-accent-text); font-weight: 700; }
  .chip.selected:hover { background: var(--chip-accent-hover); }
  .chip.forced { cursor: default; opacity: 0.7; }
  .chip.forced:hover { background: var(--chip-accent); }
  /* 2-mode sets fuse into one pill instead of separate chips. */
  .chip-set.segmented { display: inline-flex; flex-wrap: nowrap; gap: 0; border-radius: 999px; overflow: hidden; }
  .chip-set.segmented .chip { border-radius: 0; }
`;

const BAR_STACK_EDITOR_STYLE = css`
  :host { display: block; width: 100%; }
  ${LABEL_STYLE}
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
  ${ROW_DELETE_STYLE}
`;

const ACTION_PICKER_STYLE = css`
  :host { display: block; width: 100%; }
  .picker { position: relative; display: inline-flex; }
  .menu {
    display: none;
    position: absolute;
    bottom: calc(100% + 4px);
    left: 0;
    z-index: 10;
    flex-direction: column;
    gap: 2px;
    width: max-content;
    min-width: 200px;
    max-width: min(90vw, 320px);
    padding: 4px;
    box-sizing: border-box;
    background: var(--card-background-color, #fff);
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.24);
  }
  .menu.open { display: flex; }
  .menu-item {
    all: unset;
    box-sizing: border-box;
    width: 100%;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: inherit;
    font-size: 14px;
    color: var(--primary-text-color);
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .menu-item:hover, .menu-item:focus-visible { background: var(--secondary-background-color); }
`;

const CUSTOM_THEME_EDITOR_STYLE = css`
  :host { display: block; width: 100%; }
  ${LABEL_STYLE}
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
  ${ROW_DELETE_STYLE}
`;

const EDITOR_BASE_STYLE = css`
  /* padding-bottom matches the 16px gap between top-level items - without it the
     last panel sits flush against the editor's bottom edge. */
  .editor { display: flex; flex-direction: column; gap: 16px; padding-bottom: 16px; }
  .panel-body { display: flex; flex-direction: row; gap: 16px; flex-wrap: wrap; align-content: flex-start; padding: 8px 0; }
  /* min-width: auto (flex default) lets a narrow field wrap its label to
     2 lines instead of eliding - throws its row height off from siblings. */
  .panel-body > * { min-width: 0; }
  .panel-body ha-selector.field-toggle { margin-block: -18px; }
  .panel-body ha-selector.length-unit { align-self: flex-end; margin-block-end: 8px; }
  .section-label {
    display: block;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--primary-text-color);
  }
  .migrate-header { display: flex; justify-content: flex-end; }
`;

/**
 * Shared constructed stylesheets (Constructable Stylesheets API).
 *
 * CF5 - issue (perf) resolved - each instance used to hold its own <style>
 * element with the full ~55 KB CARD_CSS, so N cards meant N parses and N CSSOM
 * copies, redone on every editor keystroke. A constructed sheet is parsed once
 * per unique CSS text and shared by reference by every shadowRoot adopting it.
 *
 * Progressive enhancement only: `new CSSStyleSheet()` needs Firefox 101 /
 * Safari 16.4, past the README's own 94+/15.4+ promise, so older engines (a
 * wall-mounted iPad on iPadOS 15) get null here and fall back to the legacy
 * per-instance <style>. The cache is keyed by CSS text, not by class, so a
 * subclass overriding _cardStyle gets its own sheet; adoptedStyleSheets survive
 * reset()'s `innerHTML = ''`, so adopting happens once per shadowRoot.
 */
const CONSTRUCTED_SHEETS = new Map<string, CSSStyleSheet | null>();
const getSharedStyleSheet = (cssText: string): CSSStyleSheet | null => {
  if (CONSTRUCTED_SHEETS.has(cssText)) return CONSTRUCTED_SHEETS.get(cssText) ?? null;
  let sheet: CSSStyleSheet | null = null;
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

// Browser capability probe, independent of whether any card has been built yet
// (CONSTRUCTED_SHEETS fills lazily on first render, so an empty map means "none
// built", NOT "unsupported"). Mirrors getSharedStyleSheet's exact requirement:
// construct + replaceSync. Used by the diagnostic dump to tell a genuine legacy
// fallback apart from a not-yet-rendered state.
const CONSTRUCTIBLE_STYLESHEETS = (() => {
  try {
    // Split like getSharedStyleSheet above (not a chained call) so
    // eslint-plugin-compat doesn't misflag this feature-detection probe.
    const probe = new CSSStyleSheet();
    probe.replaceSync('');
    return true;
  } catch {
    return false;
  }
})();

export { CARD_CSS };
export { CHIPS_HOST_STYLE };
export { BAR_STACK_EDITOR_STYLE };
export { ACTION_PICKER_STYLE };
export { CUSTOM_THEME_EDITOR_STYLE };
export { EDITOR_BASE_STYLE };
export { CONSTRUCTED_SHEETS };
export { CONSTRUCTIBLE_STYLESHEETS };
export { getSharedStyleSheet };
