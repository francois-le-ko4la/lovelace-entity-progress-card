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
  /* CF5 - issue (medium) resolved - --feature-border-radius was referenced
     (RADIUS EFFECT rule below) but never defined anywhere, so a Feature's own
     bar/inner radius resolved to guaranteed-invalid -> border-radius fell back
     to its initial value (0), always square regardless of theme. Unnoticed
     inside a tile (features commonly look flat there anyway), but visible once
     a Feature renders standalone. Same theme-matching chain as the standard
     card's own bar (--ha-standard-border-radius); still a public override hook
     for card_mod/theme, like --epb-progress-bar-radius. */
  --feature-border-radius: var(--ha-standard-border-radius);
}

.${CARD.style.bar.sizeOptions.xsmall.label} {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-xs));
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
  /* --current-embed-*: fed by the .type-entities/.type-picture-elements
     input rules below (single declaration point for the terminal vars
     stays here - those rules only ever set the -embed- input, never
     -card-height/-card-min-width directly anymore). */
  --current-card-min-width: var(${CARD.style.dynamic.card.minWidth.var}, var(--current-embed-min-width, 100%));
  /* --min-grid-rows: the row count itself, injected as a plain number by JS
     (HACore._addBaseParameter, from ViewCore.minGridRows, already
     orientation-aware) - the actual row-height math lives here instead, in
     CSS, the same HA Sections grid formula hui-grid-section.ts's own
     .card.fit-rows rule uses: N rows spanning N*(rowHeight+gap) - gap.
     --row-size (read first) is HA's own variable - set as an *inline*
     style on the .card wrapper whenever grid_options.rows resolves to an
     actual number, so it always wins and keeps our own floor in lock-step
     with whatever HA actually decided; only unset when rows resolves to
     "auto", where --min-grid-rows is what's left to fall back on. Reads
     HA's own row-height/gap vars (custom properties cross shadow
     boundaries) instead of a static copy, so a theme override of
     --ha-section-grid-row-height is followed instead of silently
     drifting; 56px/8px are HA's own defaults, kept as the fallback for
     Masonry/other views where those vars aren't set at all.
     --min-grid-rows-fallback: only used on the rare frame where JS hasn't
     run yet (--min-grid-rows itself unset) - .vertical sets it to 2 below,
     everything else (incl. .horizontal) leaves it at the default 1. Single
     declaration point for the whole formula: .horizontal/.vertical only
     ever feed this one small input now, never redeclare the formula. */
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
  position: relative; /* permet top/bottom */
  margin: var(--current-card-margin);
  padding: var(--current-card-padding);
  min-width: var(--epb-card-width, var(--current-card-min-width));
  width: var(--epb-card-width, auto);
  /* min-height, not height (issue #131): a fixed height caps the card at
     exactly that size, and with overflow: hidden below, content that needs
     more room - the OS/browser "larger text" accessibility setting scales
     font-size without scaling anything in px - gets clipped mid-glyph
     instead of the card growing to fit it. min-height keeps the same
     number in the normal case (identical chain, so nothing looks
     different) but never traps content that legitimately needs more space.
     This is the *unconfigured* default's protection - see height: right
     below for what happens once the user sets their own value on purpose. */
  min-height: var(--epb-card-height, var(--current-card-height));
  /* height: an explicit height: config is the user taking full, deliberate
     control of the card's size - once set, it wins outright everywhere
     (Sections, Masonry, embedded in any other card, detectable or not),
     not just a floor the content/embed-context chain above can still grow
     past. The user owns that choice entirely: if their number is too small
     for the actual content (a bigger OS/browser font-size setting
     included), it clips instead of growing, and that is on them - the
     opposite of min-height above, which protects the *unconfigured*
     default automatically without asking anything of the user.
     --card-height only ever gets set (inline, by JS) when config.height is
     truthy (see HACore._addBaseParameter) - the fallback here is a true
     no-op otherwise: height's own initial value is already auto, so
     nothing changes when height isn't configured, min-height above keeps
     driving everything exactly as it already did.
     Deliberately NOT scoped to any particular container: an earlier version
     of this only applied inside containers this card could detect via a
     card_mod class-injection convention (type-entities and friends) - that
     turned out to depend on which container card_mod happens to have a
     patch for (confirmed live: entities/picture-elements/
     vertical-stack-in-card/custom:button-card get it, type: grid and
     custom:combined-card don't, for unrelated reasons each), an
     unpredictable, undocumented dependency to build a feature on. Reading
     the same config-driven value unconditionally here sidesteps all of
     that - works the same everywhere, with or without card_mod.
     --current-height-fallback lets a specific context override what
     "unconfigured" resolves to (see .overlay below) without touching this
     rule again - still a single declaration point for height. */
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

/* --current-card-height's formula lives solely on the base
   ${CARD.htmlStructure.card.element} rule above (a type selector,
   specificity 0-0-1) - .marginless is a class selector (0-1-0), so it
   always wins on specificity alone, regardless of source order or which
   other class rules are declared where. */
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
.${CARD.style.dynamic.frameless.class} {
  --ha-card-background: transparent;
  --ha-card-border-width: 0;
  --ha-card-box-shadow: none;
}

/* Embedded-context input only (see --current-embed-height in the base
   ha-card rule above, the only place the terminal height var is set) -
   this class marks "embedded inside a hui-entities-card row", same
   convention as .type-picture-elements / .type-custom-vertical-stack-in-card
   above/below. --current-embed-height: auto, not a fixed px guess - a
   native HA entity row's own height isn't a constant either (it varies
   with whether secondary_info is shown, among other things), so there's no
   single "right" number to hardcode here. Content-driven sizing is the
   correct default; an explicit height: config (see the height: override
   rule below) is how a user pins an exact value if they want one. */
.type-entities {
  --current-card-padding: 0;
  --current-card-margin: 0;
  --ha-ripple-hover-opacity: 0;
  --ha-ripple-pressed-opacity: 0;
  --current-embed-height: auto;

  transition: none !important;
}

/* Same value as --text-height (see .type-entities's secondary-info rule) -
   without this, .bar-container stays at the generic 16px
   (--progress-container-height) instead of matching the row's own text
   line-height, so it doesn't end up vertically centered against a native
   entities row's actual content. :not(.xlarge) - xlarge already forces its
   own, taller --progress-container-height (--progress-size-xl, 42px) via
   the normal chain; --current-specific-progress-container-height sits ahead
   of that chain and would otherwise squeeze it down to this row's 22.4px
   regardless of bar_size. :not(.background) - same reasoning: bar_position:
   background forces --progress-container-height: 100% (see ha-card.background)
   through that same chain, to cover the whole card as a background fill -
   squeezed to 22.4px here, it stopped covering the card's actual bottom. */
.type-entities:not(.xlarge):not(.background) {
  --current-specific-progress-container-height: var(--entities-height);
}

/* =============================================================================
   RIPPLE ZONE (card-level <ha-ripple>'s own control - see
   CARD.htmlStructure.sections.rippleZone's own comment for why it's a
   sibling of .container instead of a bare child)
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

/* This card's own click target is .ripple-zone, not ha-card (see its own
   comment in card-config.ts for why) - so this is where its focus ring
   lives too. A real border, not box-shadow/outline: both of those get
   clipped by this element's own overflow: hidden (verified - it's not just
   an outline quirk, the spec clips box-shadow the same way), but a border
   is part of the box itself, never subject to its own overflow. Since
   .ripple-zone's edges are pinned by inset: 0 rather than an explicit
   width/height, adding a border eats inward from that fixed edge instead
   of growing the box.
   Stays fully inside .ripple-zone's own inset: 0 box on purpose - a
   negative margin to reach past it, all the way to ha-card's own outer
   edge (matching ha-tile-container's .background technique) sounds nicer,
   but ha-card has its own overflow: hidden (needed elsewhere - bars/images
   clipped to its rounded corners), which clips any child bleeding past its
   padding edge the same way .ripple-zone's own overflow: hidden clips its
   own box-shadow/outline - confirmed live, corners got cut. Sits just
   inside the card's existing border instead of visually replacing it. */
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
     .rainbow-full-bar's own rule below) - a brand new custom property
     name that nothing else declares, so it can't be shadowed by an
     intermediate element redeclaring the *same* variable the way
     --current-container-padding-top's own value used to be at risk of
     (see --current-specific-progress-container-height's comment below for
     that exact failure mode). */
  padding-top: var(--current-specific-padding-top, var(--current-container-padding-top, 0));
  box-sizing: var(--current-container-box-sizing, content-box);
  flex-wrap: var(--current-container-flex-wrap, nowrap);
  /* Transparent to clicks by default (ha-tile-container's own .content does
     the same) - a click anywhere that isn't over an explicitly re-enabled
     interactive descendant (.shape, only while .clickable-icon - see below)
     falls straight through to .ripple-zone underneath instead of this
     element (or a non-interactive .shape) capturing it first. Inherited by
     every descendant unless one opts back in. */
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
  /* --current-specific-progress-container-height: see the rainbow_full +
     vertical + below rule in the RAINBOW FULL BAR section further down -
     this box hard-codes the bar's row height independently of
     --current-progress-container-height/.bar-container's own height, so
     that override needs its own fallback slot here too. */
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
  color: var(--state-icon-color);
}

/* =============================================================================
   STATUS LABEL
   ============================================================================= */

/* GitHub-label-style pill (label option) - same corner as .trend-indicator,
   mutually exclusive with it (see schema.ts's applyLabelRule). Same recipe
   GitHub's own Primer design system uses for issue labels in dark mode (see
   @primer/react's IssueLabelToken.module.css @define-mixin
   darkThemeIssueLabel, and ThemeManager.labelColorComponents for where the
   --label-r/g/b/h/s/l inputs below come from): background stays a
   translucent tint of the resolved color, border/text are the same hue
   lightened just enough to stay legible against the card's dark background
   - already-light colors barely move, dark/saturated ones get lightened
   more. --epb-label-color/-background-color/-border-color let card_mod
   override any of the three independently, without touching how the other
   two get auto-derived. :empty covers a Jinja template that currently
   resolves to nothing (e.g. only shows a label past some threshold). */
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

.${CARD.layout.orientations.vertical.label}.${CARD.style.dynamic.marginless.class} .${CARD.htmlStructure.sections.icon.class} {
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

/* box-shadow, not border - .shape has an explicit width/height (no
   box-sizing: border-box), so a border would grow it on focus; box-shadow
   never participates in layout. Same technique/color source ha-tile-icon
   uses (verified against its own source: .container:focus-visible {
   box-shadow: 0 0 0 2px var(--tile-icon-color); }). No overflow: hidden on
   .shape, so nothing to clip here. */
.${CARD.htmlStructure.elements.shape.class}:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}));
}

/* Own layer for the tinted circle instead of background-color directly on
   .shape: opacity only ever fades the element carrying it *and its own
   descendants together, still composited as one flattened unit first* - it
   can never create contrast between a parent and a child of its own (the
   icon glyph, sharing this same color, would fade at the exact same rate
   and stay just as invisible against it). A childless ::before sidesteps
   that entirely: the icon (a real child of .shape, rendered after this in
   the same stacking context) stays fully opaque regardless, same technique
   ha-tile-icon uses (verified against its actual source) - opacity is all
   it needs too, no color-mix() anywhere. Plain opacity on a solid color is
   mathematically identical to color-mix(in srgb, color X%, transparent)
   for this exact "toward transparent" case (real difference only shows up
   mixing two actual colors in a perceptual space like oklch) - so there's
   nothing color-mix() would add here, and opacity is the cheaper of the
   two for the :hover/:active transitions below (compositor-only, no
   repaint, unlike animating a color-mix()-computed value would be). Works
   identically on every browser this card supports - no @supports/fallback
   tier needed at all. */
.${CARD.htmlStructure.elements.shape.class}::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  /* --shape-background-color: a dedicated override slot (same "own,
     specifically-named variable" pattern as --current-progress-container-
     height elsewhere) rather than a context redefining background-color
     directly - a bare property name is a much easier accidental collision
     target (any other rule, including a user's own card_mod, could target
     it for an unrelated reason) than a project-namespaced variable nothing
     else declares. */
  background-color: var(--shape-background-color, var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default})));
  opacity: var(--shape-opacity);
}

/* CSS-only click feedback (ha-tile-icon's own technique) instead of a second
   <ha-ripple> - only while the icon actually has an action of its own
   (.clickable-icon, same negotiated-action detection - domain defaults
   included - that already gates the ripple-zone fallthrough below and, on
   ha-card itself, the card's own ripple). pointer-events: auto opts back in
   from .container's own blanket none (see MAIN CONTAINER above) - without
   this the icon would be transparent to clicks too, falling through to the
   ripple-zone/card action underneath exactly like a non-interactive icon
   does on purpose. The opacity bump on hover (20% -> 35%, ha-tile-icon's own
   numbers) reaches ::before through plain custom-property inheritance. */
.${CARD.style.dynamic.clickable.icon} .${CARD.htmlStructure.elements.shape.class} {
  pointer-events: auto;
}

.${CARD.style.dynamic.clickable.icon} .${CARD.htmlStructure.elements.shape.class}:hover {
  --shape-opacity: 35%;
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
  /* min-height, not height (issue #131): --current-content-height is
     calibrated for the default font scale - at that scale this computes to
     the exact same box as before. If the OS/browser font-size setting is
     scaled up (Android's own "Font size" accessibility option, which grows
     rem-based text without growing anything sized in px), the name/detail
     rows below need more room than that fixed sum to avoid clipping text
     mid-glyph; min-height lets this box (and ha-card, already min-height
     itself) grow to fit them instead of clipping at a boundary sized for
     the default scale only. Excluded for .vertical.up-orientation.overlay
     (see its own override below, which also explicitly clears this back to
     min-height: auto - redeclaring height there isn't enough on its own,
     min-height stays a *separate* property that keeps applying alongside
     it, and coexisting with a non-shrinking icon sibling (flex-shrink: 0)
     that combination measurably changed this flex item's computed size in
     testing, not just in theory). */
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

/* --current-content-height (above) sums --name-height + --detail-height
   unconditionally - with hide: name (or secondary_info), the row's DOM
   disappears but its share of that fixed height didn't, leaving the
   remaining row centered with empty space above/below it (issue #129).
   Vertical also folds --progress-size into that sum for its overlay/
   background bar positioning, which still needs the full box regardless of
   hidden rows, so this is horizontal-only. */
ha-card.horizontal.${CARD.style.dynamic.hiddenComponent.name.class} .${CARD.htmlStructure.sections.content.class} {
  --name-height: 0px;
}

/* Only zero --detail-height when the secondary-info row actually goes empty.
   With bar_position: default (the .default class), the progress bar itself
   renders *inside* that same row, next to the text (see
   StructureElements.createSecondaryInfo) - hiding just the text there still
   leaves the bar needing its usual share of height. Zeroing it anyway starved
   the row, and .content's flex-shrink pulled height from --name-height too,
   shrinking the name (regression from the #129 fix). Only zero it when the
   bar isn't sharing the row: bar_position elsewhere (:not(.default), it
   renders in its own container) or progress_bar is hidden too. */
ha-card.horizontal.${CARD.style.dynamic.hiddenComponent.secondary_info.class}:is(:not(.default), .${CARD.style.dynamic.hiddenComponent.progress_bar.class}) .${CARD.htmlStructure.sections.content.class} {
  --detail-height: 0px;
}

ha-card.vertical .${CARD.htmlStructure.sections.content.class} {
  --current-content-width: 100%;
  --current-content-flex-grow: 0;
  --current-content-gap: var(--vertical-gap);
}

ha-card.vertical.default .${CARD.htmlStructure.sections.content.class} {
  /* name-content, secondary-info and the bar-container are 3 flex children
     of .content stacked with a 1px gap between each (--current-content-gap:
     var(--vertical-gap), set just above) - 2 gaps this sum never accounted
     for, so .content's real natural height always ran 2px (2 * 1px) taller
     than this min-height floor claimed. Harmless on its own (min-height
     just gets exceeded, nothing clips) but it means a card sized via
     grid_options: rows: auto never lands on a clean row multiple - fixed
     verified against real getBoundingClientRect() measurements (44px
     predicted vs 46px actual before this fix). */
  --current-content-height: calc(
    var(--name-height) + var(--detail-height) + var(--progress-size) + (2 * var(--vertical-gap))
  );
}

/* Vertical + default's 3 stacked rows (name/secondary-info/bar) never shared
   a row the way horizontal's default does (see .content's own comment
   above), so unlike horizontal's --detail-height exception, no bar_position/
   hide:progress_bar condition is needed here - each row's own term in the
   sum above can always be zeroed independently when that field is hidden.
   Doesn't re-account for the 2 fixed gaps (one fewer visible row also means
   one fewer real gap) - a few px of slack rather than pixel-perfect, revisit
   if it turns out to matter in practice. */
ha-card.vertical.default.${CARD.style.dynamic.hiddenComponent.name.class} .${CARD.htmlStructure.sections.content.class} {
  --name-height: 0px;
}

ha-card.vertical.default.${CARD.style.dynamic.hiddenComponent.secondary_info.class} .${CARD.htmlStructure.sections.content.class} {
  --detail-height: 0px;
}

/* --progress-size zeroed here (not just --current-content-height's own
   term) cascades down to .bar-container's own height too (.vertical
   { --current-progress-container-height: var(--progress-size); }) - one
   override collapses both the content-height formula's share AND the
   container that would otherwise sit there empty, fill already hidden by
   .hide-progress-bar's display:none elsewhere. */
ha-card.vertical.default.${CARD.style.dynamic.hiddenComponent.progress_bar.class} {
  --progress-size: 0px;
}

/* .vertical.default's own padding-top reserves room proportional to the bar
   (see its declaration above) so the icon+text block stays visually
   centered against just the text once the bar renders below it - once the
   bar itself is gone, nothing needs that room back. hide: icon deliberately
   does NOT get an equivalent override: this padding isn't about the icon at
   all, it stays regardless of icon visibility. */
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
  /* Exclusion from the base rule's min-height (issue #131, see its own
     comment): the overlay bar here is position: absolute; height: 100% -
     that only resolves against a containing block with a *definite*
     height. min-height: auto (its initial value), not just a re-declared
     height, actually removes the min-height constraint for this scope -
     leaving it in place alongside height (even at the same numeric value)
     measurably changed how this item's size interacted with its
     non-shrinking icon sibling (flex-shrink: 0) in testing. */
  min-height: auto;
  height: var(--current-content-height);
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
  /* min-height + a real line-height, not one forced equal to it (issue
     #131, see .content's own comment for the full reasoning): unchanged
     look at the default font scale, only grows if a larger OS/browser
     font-size setting needs more room than --group-height to avoid
     clipping. Not excluded for .vertical.up-orientation.overlay, unlike
     .content itself: this wrapper isn't a flex item competing with the
     icon section for space the way .content is (its own parent, .content,
     stays fixed-size there - see its exclusion), so it can safely grow on
     its own without the same flex/icon-sharing conflict. */
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
  /* min(45px, 25%): the 45px floor holds as long as the row (shared with
     the bar) is wide enough to spare it - once the row itself is narrower
     than 180px, it caps at a quarter instead. Deliberately lower than the
     bar's own cap (33%, see .progress-container): on a tight row the text
     can still fall back on its own ellipsis, but a bar squeezed thinner
     than its floor loses all its meaning as a progress indicator, so it
     gets the bigger guaranteed share once both floors can't fit alongside
     each other and the row's gap (--current-secondary-info-gap, 10px by
     default, not itself deducted from these percentages). */
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
   (structure.ts): the bar shares .secondary-info's row with the text only
   for bar_position: default - for below/top/bottom/overlay/background it
   renders elsewhere, so the text is the row's only occupant and can use its
   full width. Missing .below/.overlay/.background here left those three
   stuck at the same 45px-60% budget default (default) needs to leave room
   for a bar sharing the row - even though no bar was actually competing for
   space in their case. */
ha-card:is(.vertical, .xlarge, .below, .bottom, .top, .overlay, .background) .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-min-width: 100%;
  --group-max-width: 100%;
}

.row-reverse .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-min-width: unset;
}

/* bar_position: compact_below (#123) - a real, separate DOM shape (like
   below/top/bottom/overlay), not a CSS rearrangement of the default one: see
   StructureElements.createContentBody. .name and .secondary-info share a new
   wrapper row (.name-secondary-row, name left, secondary right); the bar is
   a sibling row below it, both stacked by .content-section's own existing
   flex-column (same mechanism bar_position: default already uses to stack
   .name above .secondary-info).
   Horizontal-only (see schema.ts's applyCompactBelowRule): vertical already
   stacks name/secondary/bar narrowly, with no "shared row" to switch to. */
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

.${CARD.layout.orientations.vertical.label} .${CARD.style.bar.sizeOptions.large.label} {
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
  /* min-height, not height (issue #131, see .content's own comment for the
     full reasoning): --text-height stays the floor for the default font
     scale (unchanged look), but a larger OS/browser font-size setting can
     grow this box instead of clipping the text mid-glyph against it. Not
     excluded for .vertical.up-orientation.overlay, unlike .content itself -
     see .name-content/.secondary-info-wrapper's own comment on why this
     level doesn't share .content's flex/icon-sharing conflict. */
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
  /* max(), not a straight swap to a different token (issue #131): forcing
     line-height to the same fixed px value as the box's own floor clips
     the text mid-glyph as soon as a larger font-size (OS/browser
     accessibility scaling) needs a taller line than that floor allows.
     max() keeps --name-height as an unconditional floor (identical look
     while nothing is scaled) and only grows past it via the em term
     (relative to this element's own actual font-size, so it tracks real
     scaling) once that's genuinely taller. */
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
  /* min(X, 6%): same shrink-under-pressure idea as the text/bar min-width
     coupling above - the gap between them (10px by default) holds at its
     full size while the row can spare it, and gives up a few px of its own
     once the row gets tight, instead of staying a fixed cost oblivious to
     how little room the text/bar floors already have to share. */
  gap: min(var(--current-secondary-info-gap, var(--spacing)), 6%);
  width: var(--current-secondary-info-width, auto);
  min-width: var(--current-secondary-info-min-width, auto);
  justify-content: space-between;
}

/* .secondary-info-blank: pushed by HABase#_updateSecondaryInfoWrapperVisibility
   (core.ts) whenever custom_info/secondary's line(s) and the main value line
   are all empty - single/multiline both covered there, so this one rule
   replaces what used to be two separate :has()-based rules here (one per
   mode). Kept class-based, not :has(), on purpose: :has() needs Firefox
   121+, past this card's documented 94+ floor. */
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
  /* Without this, the bar had no floor at all while its row sibling
     (.secondary-info-wrapper) already has one - compressing the card
     horizontally pushed 100% of the squeeze onto the bar (down to a
     near-invisible sliver) before the text ever gave up any of its own
     space. min(X, 33%) couples this floor with the text's own (see
     .secondary-info-wrapper, capped lower at 25% - a squeezed bar loses
     its whole purpose, a squeezed label still has ellipsis to fall back
     on): each holds its preferred minimum only while the row can spare it,
     and caps at its share once it can't. 33%+25% leaves room for the row's
     own gap (--current-secondary-info-gap, 10px by default) between this
     and the text, which percentages here don't account for on their own -
     two floors summing to exactly 100% would leave nothing for it, pushing
     the bar out past the card's own overflow: hidden by the gap's width.
     --epb-progress-bar-min-width stays card_mod-overridable for
     anyone who wants a different balance. */
  min-width: min(var(--epb-progress-bar-min-width, 30px), 33%);
  /* --current-specific-progress-container-height: a dedicated override
     slot, same idea as .container's own --current-specific-padding-top
     above - a fresh custom property nothing else declares. Needed because
     --current-progress-container-height is an *inherited* value, and
     .container (an ancestor of this element) carries the exact same
     'vertical' class its own generic rule keys off - a plain override on
     ha-card, however specific, never reached .bar-container: .container's
     own direct declaration of --current-progress-container-height always
     won over the inherited one from further up. Still behind
     --type-entities-combined-line-height, which stays the user's own
     override and wins over both. */
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

/* .bar-container above is absolutely positioned, so it never contributes to
   ha-card's own auto-height (height: var(--card-height, auto) on the base
   rule) - fine for ltr/rtl, where the bar just lies flat over content that
   already sizes the card. .vertical.up-orientation needs actual vertical
   room for the bar to be visible at all, so falls back to 100% (matching
   what an embedding container reserves) instead of shrinking to content. */
.vertical.up-orientation.overlay {
  --current-height-fallback: 100%;
}

.${CARD.layout.orientations.horizontal.label}.${CARD.style.bar.sizeOptions.xsmall.label} .${CARD.htmlStructure.elements.progressBar.container.class},
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
   N+1 real divs (.segment-divider - N-1 internal boundaries plus the bar's
   own two edges, see HABase#_buildSegmentDividers's own comment for why the
   edges are included too), not a CSS gradient/mask trick (tried, reverted -
   a repeating-linear-gradient sized to exactly N repeats should in theory
   include the two edge boundaries for free, but it rendered unreliably in
   practice - unresolved, not worth the fragility). Built directly in JS
   after this static template is cloned in (structure.ts itself never
   renders them - the template cache is keyed on structure options assumed
   to be a small, bounded set, and bar_segments ranges freely). Each carries
   its own --segment-position (a plain percentage along the bar, computed in
   JS); the rules below decide whether that's a left or a bottom offset
   depending on orientation - JS only ever needs to know "how far along the
   bar", never which axis. Appended after .inner in the DOM (same stacking
   context, later paints on top - no z-index needed), in the card's own
   background color, so each reads as a genuine cut through the bar/fill
   rather than a drawn line. border-radius is forced to 0 on .bar: it still
   clips via overflow: hidden with its normal rounded corner, and that curve
   rounds off the first/last cell unevenly compared to the others. */
.bar-segmented .${CARD.htmlStructure.elements.progressBar.bar.class} {
  border-radius: 0;
}

/* Wrapper grouping every .segment-divider (see HABase#_buildSegmentDividers)
   instead of leaving them loose alongside the watermark/zero/value marks
   that already live directly in .bar. inset: 0 keeps it (and everything
   positioned inside it) spanning the exact same box .bar itself does, so
   --segment-position below still means the same thing it would have meant
   positioned directly against .bar. */
.${CARD.htmlStructure.elements.progressBar.segments.class} {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.${CARD.htmlStructure.elements.progressBar.segmentDivider.class} {
  position: absolute;
  pointer-events: none;
  background: var(--ha-card-background, var(--card-background-color));
  /* Fixed, odd px values (not calc()-derived from --progress-size) - odd on
     purpose: each divider centers on its boundary via a whole-pixel offset
     below, and an even width would only have a symmetric half/half split
     available, fractional (sub-pixel) either way a boundary doesn't itself
     land on a whole device pixel. Doubled for medium/large/xlarge (a
     hairline that reads fine on a small bar disappears on a bigger one).
     This is the fallback tier - see --bar-segment-gap-final just below. */
  --bar-segment-gap: 3px;
  /* Resolves to the modern (length-relative) tier wherever it exists, the
     fixed odd tier everywhere else - --bar-segment-gap-modern is only ever
     declared inside the @supports block below, so on an engine that doesn't
     match it the property stays genuinely unset (not just "invalid"), and
     var()'s own fallback here does the rest - same shape as the watermark
     triangle's --wm-half-tri. Every consumer below (width/height/left/
     bottom) reads this single variable now instead of each duplicating both
     tiers itself. */
  --bar-segment-gap-final: var(--bar-segment-gap-modern, var(--bar-segment-gap));
}

/* Modern tier, feature-gated via @supports (see --bar-segment-gap-final
   above) instead of duplicating every consuming declaration - round()/mod()
   are CSS Values 4 (Chrome/Edge 114+, Firefox 118+, Safari 16.4+), past the
   documented 94+ floor; both ship together in every engine that has either,
   so testing round() alone is a reliable proxy for mod() too. */
@supports (top: round(down, 1px, 1px)) {
  .${CARD.htmlStructure.elements.progressBar.segmentDivider.class} {
    /* Scales with the bar's own LENGTH (one segment's own share of it)
       instead of the fixed thickness-based tiers above - 40% of one
       segment's cell width (100% / --bar-segments), floored to a whole px,
       nudged up by 1px when that lands even (needs to stay odd, same
       whole-pixel-centering reasoning as the fallback), then clamped to
       [3px, 9px] - floored so it stays visible with lots of segments,
       capped so a bar with very few segments (e.g. bar_segments: 2) doesn't
       turn into a huge divider with nothing bounding it. 3px/9px are both
       odd on purpose: clamp() only ever returns one of its three inputs
       verbatim, so as long as all three (the floor, the ceiling, and the
       already-oddified value) are odd, the result is guaranteed odd too -
       clamping AFTER the +1px nudge (not before) means that nudge can never
       push a ceiling-clamped value 1px past the ceiling. */
    --bar-segment-gap-floor: round(down, calc(100% / var(--bar-segments, 10) * 0.4), 1px);
    --bar-segment-gap-modern: clamp(
      3px,
      calc(var(--bar-segment-gap-floor) + 1px - mod(var(--bar-segment-gap-floor), 2px)),
      9px
    );
  }
}

.${CARD.style.bar.sizeOptions.medium.label} .${CARD.htmlStructure.elements.progressBar.segmentDivider.class},
.${CARD.style.bar.sizeOptions.large.label} .${CARD.htmlStructure.elements.progressBar.segmentDivider.class},
.${CARD.style.bar.sizeOptions.xlarge.label} .${CARD.htmlStructure.elements.progressBar.segmentDivider.class} {
  --bar-segment-gap: 5px;
}

/* top/bottom/overlay/background have no bar_size class at all to key off of
   above (schema.ts deletes bar_size entirely for these four - never a
   meaningful choice there, the editor hides the field too) - fixed values
   instead, same odd-width reasoning. below is deliberately NOT included
   here: unlike the other three, it keeps its real bar_size, so it already
   gets the right value from the rules above. */
.top-container .${CARD.htmlStructure.elements.progressBar.segmentDivider.class},
.bottom-container .${CARD.htmlStructure.elements.progressBar.segmentDivider.class} {
  --bar-segment-gap: 3px;
}

.overlay .${CARD.htmlStructure.elements.progressBar.segmentDivider.class},
.background .${CARD.htmlStructure.elements.progressBar.segmentDivider.class} {
  --bar-segment-gap: 5px;
}

.horizontal-bar .${CARD.htmlStructure.elements.progressBar.segmentDivider.class} {
  top: 0;
  bottom: 0;
  /* Not left: var(--segment-position) + transform: translateX(-50%) - -50%
     of an ODD width is itself a fractional (half-pixel) offset, reopening
     the exact sub-pixel problem the odd width was chosen to avoid.
     (--epb-bar-segment-gap - 1px) / 2 is a whole-number offset instead (1px
     for 3px, 2px for 5px): shifts left just enough that the divider's own
     center *pixel* - not its geometric center point - lands on
     --segment-position. --epb-bar-segment-gap: a card_mod override hook,
     same pattern as --epb-progress-bar-radius/--epb-progress-bar-min-width
     above - checked here at the single point both width and the centering
     math actually consume --bar-segment-gap-final, so a card_mod override
     always wins outright regardless of which tier (fixed or modern) would
     otherwise have set it. */
  left: calc(var(--segment-position) - (var(--epb-bar-segment-gap, var(--bar-segment-gap-final)) - 1px) / 2);
  width: var(--epb-bar-segment-gap, var(--bar-segment-gap-final));
}

.vertical-bar .${CARD.htmlStructure.elements.progressBar.segmentDivider.class} {
  left: 0;
  right: 0;
  /* bottom, not top: value/percent grows from the bottom up on a true
     vertical bar (see .vertical-bar .inner's own translateY), so
     --segment-position (also counted from 0%) needs the same reference
     edge. Same whole-pixel centering offset and --epb-bar-segment-gap
     override as the horizontal rule above. */
  bottom: calc(var(--segment-position) - (var(--epb-bar-segment-gap, var(--bar-segment-gap-final)) - 1px) / 2);
  height: var(--epb-bar-segment-gap, var(--bar-segment-gap-final));
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
 * everywhere else. Two full keyframes rather than a duplicated declaration
 * inside the frame: an engine that doesn't support color-mix() (Chrome/Edge <
 * 111, Firefox < 113, Safari < 16.2 - see issue #128) can drop the whole 60%
 * frame instead of just the invalid declaration, which silently kills the
 * animation entirely (confirmed live on Chrome 92) rather than just losing
 * the alpha blending. -modern is only picked up where @supports below can
 * confirm color-mix() actually resolves.
 */
@keyframes epb-icon-ping {
  60% {
    box-shadow: 0 0 0 0 var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}));
  }
  100% { box-shadow: 0 0 5px 15px transparent; }
}

@keyframes epb-icon-ping-modern {
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
   - the bolt's x-edges are CSS vars (--epb-charge-x1/x2, default 34%/67%) and
     its fixed top edge is --epb-charge-y1 (default 29%, the rest of each
     frame's vertical span is expressed as an offset from it via calc()) so
     .icon-anim-battery-charging-shifted can compensate for icon variants
     (battery-charging-*, battery-bluetooth-*) whose glyph isn't centered/
     positioned the same way the plain battery outline is - see
     ViewCore.isBatteryIconShifted */
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
  animation: epb-icon-ping 2s infinite;
  /* box-shadow isn't a compositor-only property like transform/opacity - the
     browser repaints on every frame of the (infinite) animation regardless.
     will-change lets it isolate that cost to this element up front instead of
     discovering it at the first animated frame. */
  will-change: box-shadow;
}

@supports (background: color-mix(in srgb, red, blue)) {
  .icon-anim-ping .${CARD.htmlStructure.elements.shape.class} {
    animation-name: epb-icon-ping-modern;
  }
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

/* Base tier: an opacity-animated overlay (::before, solid alert color)
   instead of animating background-color directly on ha-card each frame -
   background-color isn't compositor-only, so that repaints every frame
   (same reasoning as epb-icon-ping's own sonar-disc rewrite above). ha-card's
   own background-color goes neutral for the duration (see .alert-anim-blink
   below) so the overlay fading in/out over it reads the same as before.
   Modern tier (epb-alert-background-modern) is untouched - still the
   original background-color + color-mix() animation, which already worked
   well - the overlay is switched off there instead of running both. */
@keyframes epb-alert-background {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0; }
}

@keyframes epb-alert-background-modern {
  0%, 100% { background-color: color-mix(in srgb, var(--alert-color-final) 15%, var(--ha-card-background, var(--card-background-color))); }
  50% { background-color: var(--ha-card-background, var(--card-background-color)); }
}

/* ring bursts from the card's own border, reusing the epb-icon-ping technique.
   Fallback declared first (plain var(), no alpha) for engines that don't
   support color-mix() (Chrome/Edge < 111, Firefox < 113, Safari < 16.2 - see
   issue #128): they keep this ring solid instead of getting no ring at all,
   since ping mode has no other persistent visual once the animation itself
   can't run. color-mix() overrides it wherever it's understood. */
@keyframes epb-alert-ping {
  60% {
    box-shadow: 0 0 0 0 var(--alert-color-final);
  }
  100% { box-shadow: 0 0 5px 15px transparent; }
}

@keyframes epb-alert-ping-modern {
  60% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--alert-color-final) 70%, transparent);
  }
  100% { box-shadow: 0 0 5px 15px transparent; }
}

/* highlight: label's own pill-scoped variants - same idea as the two above,
   sized down for a small pill instead of the whole card border. */
@keyframes epb-alert-label-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes epb-alert-label-ping {
  60% {
    box-shadow: 0 0 0 0 var(--alert-color-final);
  }
  100% { box-shadow: 0 0 5px 8px transparent; }
}

@keyframes epb-alert-label-ping-modern {
  60% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--alert-color-final) 70%, transparent);
  }
  100% { box-shadow: 0 0 5px 8px transparent; }
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
  animation: epb-alert-ping 1.5s ease-out infinite;
  /* Same box-shadow repaint cost as icon-anim-ping above, but on the whole
     card rather than a small icon - more noticeable, so worth the same hint. */
  will-change: box-shadow;
}

@supports (background: color-mix(in srgb, red, blue)) {
  .alert-active.alert-anim-ping:not(.alert-label) {
    animation-name: epb-alert-ping-modern;
  }
}

/* Base tier: ha-card's own background stays neutral - a ::before overlay
   (solid alert color at a fixed low opacity) carries the tint instead,
   matching modern's 15% color-mix() look without needing color-mix() at
   all (old engines can't compute it - see issue #128). Modern tier
   (@supports below) is untouched - still color-mix() directly on ha-card's
   own background-color - the overlay is switched off there instead of
   stacking both. */
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
   alert instead of the card's own border/background, which stays neutral
   here (same reset .alert-background already uses). Blink/ping target
   .status-label itself rather than ha-card - :not(.alert-label) on the
   border/ping rules above keeps this mode from *also* pulsing a border
   nobody asked for. --alert-color-final is inherited from .alert-active
   above (a plain CSS custom property, crosses the .status-label descendant
   boundary same as anywhere else). */
.alert-active.alert-label {
  border-color: var(--epb-card-border-color, var(--ha-card-border-color, var(--divider-color, #e0e0e0)));
}

.alert-active.alert-label.alert-anim-blink .status-label {
  animation: epb-alert-label-blink 1.2s ease-in-out infinite;
}

.alert-active.alert-label.alert-anim-ping .status-label {
  animation: epb-alert-label-ping 1.5s ease-out infinite;
  will-change: box-shadow;
}

@supports (background: color-mix(in srgb, red, blue)) {
  .alert-active.alert-label.alert-anim-ping .status-label {
    animation-name: epb-alert-label-ping-modern;
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
/* Fallback: a translucent white overlay (rgba, no color-mix()) instead of
   the bar's own plain color - same technique .glass already uses above:
   this gradient is painted on .inner's own ::before, layered over its real
   solid color underneath (see "gradient/glass: ::before compositor-only
   scale" further down), so a partly-transparent white stop lightens it by
   simple compositing instead of needing color-mix() to compute a lightened
   color from scratch. Works on every browser this card supports - no gap
   left to fall back from. Modern tier (the real 2-stop color-mix()
   gradient) untouched, gated behind @supports below - it already looked
   right, no reason to touch it. */
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
  --wm-half-tri-base: calc(var(--wm-tri-size) / 2);
  /* Resolves to the modern (whole-pixel) tier wherever it exists, the plain
     fallback everywhere else - --wm-half-tri-base-modern is only ever
     declared inside the @supports block below, so on an engine that doesn't
     match it the property stays genuinely unset (not just "invalid"), and
     var()'s own fallback here does the rest. Every consumer below keeps
     reading this single variable, untouched either way. */
  --wm-half-tri: var(--wm-half-tri-base-modern, var(--wm-half-tri-base));
}

/* Modern tier, feature-gated via @supports rather than this file's usual
   "declare the consuming property twice" pattern (bar_segments' own gap) -
   a single custom property, resolved once above, reads cleaner here than
   duplicating every border/left/bottom declaration that touches
   --wm-half-tri. round() is CSS Values 4 (Chrome/Edge 114+, Firefox 118+,
   Safari 16.4+), past the documented 94+ floor. */
@supports (top: round(down, 1px, 1px)) {
  .watermark {
    --wm-half-tri-base-modern: round(down, calc(var(--wm-tri-size) / 2), 1px);
  }
}

/* top/bottom force the bar down to 6px (see .bottom-container/.top-container
   above) regardless of bar_size - the default 8px triangle is taller than
   that, so .bar's overflow: hidden was clipping its bottom tip, reading as a
   blunt/misplaced marker rather than a sharp one. Scoped to this context
   only (not bar_size: small, which stays the normal 8px bar): still resolves
   through --watermark-triangle-size first, so a user override wins here too.
   4px (even), not 5px: base = wm-tri-size + 1 always, so an odd base -
   without round() support needed to floor it there - only ever comes out of
   an even wm-tri-size (odd/2 stays fractional, flipping base's own parity
   the wrong way on an engine that can't round() it back down). */
.top-container .watermark,
.bottom-container .watermark {
  --wm-tri-size: var(--watermark-triangle-size, 4px);
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
/* Whole-pixel centering, same reasoning as bar_segments' dividers: this is a
   real box (--mark-width/height: wm-circle-size), not a border-triangle
   trick, so a plain /2 half or transform: translate(-50%) is fractional for
   an odd size (5px default) - either rounds independently on each edge and
   can blur/drift off-center by half a device pixel. (wm-circle-size - 1px) /
   2 lands on a whole pixel instead, both for the value-axis offset and for
   centering across the bar's own thickness (replaces the old top/left: 50% +
   transform: translate(-50%) pair below). Assumes an odd --watermark-circle-
   size, like the shipped default - same assumption bar_segments' own fixed
   gap tiers make. */
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
/* Base widened by 1px on the side that isn't part of the position formula
   (border-right here, border-top in the vertical rule below) - an odd total
   base by construction, no visual effect on the apex: with width:0 forcing
   the browser to expand the border-box to fit the borders anyway, the apex
   sits exactly at left + border-left (where border-left ends and
   border-right begins), never at the base's own midpoint - --wm-half-tri
   cancels out of "left: calc(value - half-tri)" + "border-left: half-tri"
   symbolically regardless of what border-right is set to. */
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
   RAINBOW FULL BAR (bar_color_mode: rainbow_full)
   The track always shows the theme's complete gradient (not just the filled
   portion) - .inner's normal reveal-by-translate sweep is hidden entirely,
   and a small marker (built on the same .mark mechanism as the watermarks
   above) tracks the current value's position instead. --progress-bar-value
   (0-1) is already set every render (see HACore._applyProgressCSS), so the
   marker needs no dedicated JS wiring of its own - purely CSS.

   center_zero is a different wiring: its two gradients (one per arm) never
   reach --progress-bar-color/.bar at all - HABase._updateCSS only ever
   passes bar.colorGradient (always null for center_zero, see
   ViewBase.colorGradient) as the plain single-arm gradient, and routes
   bar.themeDivergingGradient's own posGradient/negGradient through
   --epb-stack-gradient-pos/-neg instead (see
   HACore._applyDivergingBarStackCSS), which only .inner.positive/.inner.
   negative's own --inner-background ever reads. So for center_zero, .inner
   can't be hidden - it's kept, its normal value-scaled reveal (--inner-size)
   is forced to fully open instead, so both halves show their whole gradient
   plain and only the marker (below) still moves.
   ============================================================================= */

.rainbow-full-bar:not(.${CARD.style.dynamic.progressBar.centerZero.class})
  .${CARD.htmlStructure.elements.progressBar.inner.class} {
  display: none;
}

.rainbow-full-bar:not(.${CARD.style.dynamic.progressBar.centerZero.class})
  .${CARD.htmlStructure.elements.progressBar.bar.class} {
  --epb-progress-bar-background-color: transparent;
  background-image: var(--epb-progress-bar-color, var(${CARD.style.dynamic.progressBar.color.var}, none));
}

.${CARD.style.dynamic.progressBar.centerZero.class}.rainbow-full-bar
  .${CARD.htmlStructure.elements.progressBar.inner.class} {
  --inner-size: 1;
}

/* Narrow pill on the bar's own fill axis (like a fatter, moving version of
   the center-zero mark below) rather than a disc - full-height/width on the
   cross axis, narrow on the axis the value moves along. Centered via top:50%
   + transform rather than top:0/height:100%: this now lives in
   .bar-container (see StructureElements.progressBar), which for the
   smallest bar_size is barely taller than the bar itself.

   Self-relative (100% minus 2x the ring width, the ring being a
   box-shadow drawn *outside* the box - see below), not a fixed px number:
   .bar-container's actual height varies by more than bar_size alone (the
   generic 16px cushion horizontal gets for small vs vertical's own bare
   --progress-size, and --type-entities-combined-line-height - see .bar-
   container's own height rule above - lets a user pin it to yet another
   value entirely, taking priority over anything this file assumes). A
   fixed height that happened to match one specific case clipped or
   shifted the moment any of those differed - this always fits exactly
   whatever height actually applies, no matter the source, same formula
   medium/large/xlarge below already rely on. */
.${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --mark-top: 50%;
  --mark-height: calc(100% - 2px);
  /* --rainbow-marker-width/-border-width: internal, bar_size-scaled
     defaults (see the size rules below) - never set by JS, only ever the
     inner fallback of the public --epb-rainbow-marker-* var so a card_mod
     override always wins regardless of bar_size. xsmall/small don't set
     either (5px/1px, same numbers as before this got size-aware) - they
     already read clearly at that scale and were asked to stay untouched. */
  --mark-width: var(--epb-rainbow-marker-size, var(--rainbow-marker-width, 5px));
  --mark-left: calc(var(${CARD.style.dynamic.progressBar.value.var}, 0) * 100%);
  /* Whatever color the icon currently shows (theme zone/custom_theme/color
     override - see ThemeManager#setStyle) rather than a flat neutral, same
     "current color" source label's own pill background already uses. */
  --mark-background: var(--epb-rainbow-marker-color, var(${CARD.style.dynamic.iconAndShape.color.var}, white));
  box-sizing: border-box;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  border: none;
  /* "Glass pin": a thin ring (drawn as a spread box-shadow, not a real
     border - doesn't affect box-sizing/layout) instead of a solid outline,
     plus a soft drop shadow for a bit of lift/depth. The ring reads clearly
     against any of the gradient's own colors, light or dark - a solid black
     border read as a flat, cut-out sticker by comparison. */
  box-shadow:
    0 0 0 var(--epb-rainbow-marker-border-width, var(--rainbow-marker-border-width, 1px))
      var(--epb-rainbow-marker-border-color, rgba(255, 255, 255, 0.9)),
    0 2px 3px rgba(0, 0, 0, 0.35);
  /* Own dedicated var (matches --epb-rainbow-marker-size/-color/-border-*
     above) rather than a bare literal - full opacity by default, unlike the
     watermarks' translucent one, but still overridable without colliding
     with an unrelated rule targeting the bare opacity property. */
  opacity: var(--epb-rainbow-marker-opacity, 1);
}

.rainbow-full-bar .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --mark-display: flex;
}

/* layout: vertical reserves only the bar's own thin thickness for its row
   by default (--current-progress-container-height: var(--progress-size),
   6/8/12px for xsmall/small/medium - no generic 16px cushion the way
   horizontal gets there), and .container's own padding-top scales with
   that same raw size. Both forced up to that same 16px here (via the
   dedicated --current-specific-* overrides declared on .container/
   .bar-container above - immune to being shadowed by an intermediate
   element the way directly overriding --current-progress-container-height/
   --current-container-padding-top themselves would be, since nothing else
   declares these two names) so the marker (self-relative, see above) gets
   the same room to be a proper pill in both layouts instead of shrinking
   into a near-circle, and the row doesn't sit off from where large's
   already-16px row naturally lands. large already reaches 16px natively
   in vertical (--progress-size-l is 16px) - no forcing needed; xlarge is
   well past it already. ViewCore.minGridRows reserves one extra grid row
   for this same combination, so the card has the budget for the growth
   instead of squeezing it out of the rest of the layout. */
ha-card.vertical.default.rainbow-full-bar.${CARD.style.bar.sizeOptions.xsmall.label},
ha-card.vertical.default.rainbow-full-bar.${CARD.style.bar.sizeOptions.small.label},
ha-card.vertical.default.rainbow-full-bar.${CARD.style.bar.sizeOptions.medium.label} {
  --current-specific-progress-container-height: 16px;
  --current-specific-padding-top: 16px;
}
ha-card.vertical.default.rainbow-full-bar.${CARD.style.bar.sizeOptions.xsmall.label} .${CARD.htmlStructure.sections.content.class},
ha-card.vertical.default.rainbow-full-bar.${CARD.style.bar.sizeOptions.small.label} .${CARD.htmlStructure.sections.content.class},
ha-card.vertical.default.rainbow-full-bar.${CARD.style.bar.sizeOptions.medium.label} .${CARD.htmlStructure.sections.content.class} {
  --current-content-height: calc(var(--name-height) + var(--detail-height) + 16px);
}

/* bar_position: below puts the bar in its own sibling (.below-container),
   not inside .content - no padding-top/content-height sum to correct
   there (.content's own base formula never accounted for the bar to
   begin with), just the same container-height forcing, on both boxes
   that separately hard-code the bar's row height for this position (see
   ha-card.below .bar-container and .below-container's own height rule -
   neither goes through --current-progress-container-height/
   --progress-size via inheritance the way .default's .container does, so
   --current-specific-progress-container-height needs a fallback slot on
   .below-container too, added at its own rule below). */
ha-card.vertical.below.rainbow-full-bar.${CARD.style.bar.sizeOptions.xsmall.label},
ha-card.vertical.below.rainbow-full-bar.${CARD.style.bar.sizeOptions.small.label},
ha-card.vertical.below.rainbow-full-bar.${CARD.style.bar.sizeOptions.medium.label} {
  --current-specific-progress-container-height: 16px;
}

/* bar_position: top/bottom forces the bar down to 6px regardless of
   bar_size (see the .top-container/.bottom-container rule declaring
   --progress-size/--progress-container-height directly, further up) -
   the same xsmall scale (6px container, 1px ring). Purely self-relative
   (calc(100% - 2px), same as everywhere else) fit inside that 6px flush
   with the bar, but read poorly there: at 4px the marker's own fill
   (current color) often lands on a same-hued patch of the gradient right
   behind it, and the thin ring alone isn't enough contrast to save it. A
   small fixed floor lets it overshoot the 6px bar a little - not the full
   "always xlarge-sized" treatment vertical + up + overlay gets above,
   just enough to read clearly. .top-container/.bottom-container don't
   clip (position: absolute, no overflow: hidden), so the overshoot shows. */
.rainbow-full-bar .top-container .${CARD.htmlStructure.elements.progressBar.valueMarker.class},
.rainbow-full-bar .bottom-container .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --mark-height: max(calc(100% - 2px), 10px);
}

/* From medium up, the bar itself gets visibly chunkier while the marker
   stayed fixed at xsmall/small's own scale - a bit more width and a
   thicker border keep it from getting lost against the wider track.
   --mark-height also gets pulled in here by exactly 2x the ring width
   (the ring is a box-shadow, drawn *outside* the box, not counted in its
   own height): xsmall/small's height (max(100%, 14px)) has slack to spare
   from that floor alone (the bar itself is shorter than 14px, and the row
   around it taller still), but from medium up 100% already reaches or
   exceeds 14px, so the box has zero slack of its own and the ring
   overshoots past .bar-container's own bounds into whatever's flush
   against it - clipped instead of a clean rounded cap. */
.rainbow-full-bar.${CARD.style.bar.sizeOptions.medium.label} .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --rainbow-marker-width: 7px;
  --rainbow-marker-border-width: 1.5px;
  --mark-height: calc(100% - 3px);
}
.rainbow-full-bar.${CARD.style.bar.sizeOptions.large.label} .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --rainbow-marker-width: 9px;
  --rainbow-marker-border-width: 2px;
  --mark-height: calc(100% - 4px);
}
.rainbow-full-bar.${CARD.style.bar.sizeOptions.xlarge.label} .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --rainbow-marker-width: 12px;
  --rainbow-marker-border-width: 3px;
  --mark-height: calc(100% - 6px);
}

/* Always styled like xlarge here (12px wide, 3px ring), not scaled by
   bar_size the way the horizontal per-size rules further up are: a
   vertical + up + overlay bar is a full-height strip regardless of
   bar_size (see .vertical.up-orientation.overlay .content's own
   height: 100%), so it reads as "big" no matter what bar_size says -
   graduating the marker by bar_size the same way horizontal does would
   make it look undersized against that strip at anything below xlarge.
   --mark-width's -6px matches 2x the 3px ring, same ring-overshoot
   correction the horizontal per-size rules use, just fixed instead of
   graduated. */
.vertical.up-orientation.overlay.rainbow-full-bar .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --mark-top: auto;
  --mark-left: 50%;
  --mark-width: calc(100% - 6px);
  --mark-height: var(--epb-rainbow-marker-size, 12px);
  --mark-bottom: calc(var(${CARD.style.dynamic.progressBar.value.var}, 0) * 100%);
  --rainbow-marker-border-width: 3px;
  transform: translate(-50%, 50%);
}

/* center_zero: the two arms are a fixed 50/50 split of the bar (see
   .half's own width: 50% CSS, not proportional to the actual zero value's
   position) - --progress-bar-value is signed here (-1..1, see
   HABase._updateCSS/ViewBase.percent), so 0 always lands the marker at the
   visual center regardless of min_value/max_value/center_zero_value. */
.${CARD.style.dynamic.progressBar.centerZero.class}.rainbow-full-bar .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  --mark-left: calc(50% + (var(${CARD.style.dynamic.progressBar.value.var}, 0) * 50%));
}
.vertical.up-orientation.overlay.${CARD.style.dynamic.progressBar.centerZero.class}.rainbow-full-bar .${CARD.htmlStructure.elements.progressBar.valueMarker.class} {
  /* --mark-left stays the base rule's fixed 50% (it's the cross axis here -
     centers the pill across the bar's *width* - unrelated to center_zero,
     which only ever affects position along the *fill* axis: --mark-bottom
     for a vertical bar, --mark-left for a horizontal one, see the generic
     .center-zero rule above). Only --mark-bottom needs the center-zero
     formula. This rule used to also reset --mark-left to 0, which combined
     with the base rule's translateX(-50%) on a ~full-width box shoved the
     whole pill half the bar's width to the left - left edge off past the
     bar's own edge, right edge landing mid-bar instead of on the value. */
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

/* hide: progress_bar above only hides the fill (.bar) - .bar-container itself
   (the flex item actually reserving height/min-width in the row, e.g.
   sharing bar_position: default's row with secondary_info in horizontal)
   never collapsed on its own. --current-specific-progress-container-height
   is the dedicated top-priority slot .bar-container's own height already
   checks first (see its declaration above), so this wins regardless of
   which bar_position/bar_size rule would otherwise feed
   --current-progress-container-height on the same element. min-width/
   flex-grow reset alongside it so a shared row (horizontal.default) doesn't
   keep reserving width for a container with nothing left to show. */
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
  .chip { position: relative; display: inline-flex; align-items: center; height: 32px; padding: 0 16px; box-sizing: border-box;
    border: 1px solid var(--divider-color, #e0e0e0); border-radius: 8px; background: transparent;
    color: var(--primary-text-color); font-family: inherit; font-size: 14px; line-height: 1; cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s; }
  /* Own layer for the hover tint instead of background directly on .chip -
     opacity on .chip itself would fade its own text/border along with the
     tint (same reasoning as .shape::before - see styles.ts). A childless
     ::before sidesteps that, and works identically on every browser this
     card supports - no color-mix()/@supports/fallback tier needed at all. */
  .chip::before { content: ''; position: absolute; inset: 0; border-radius: inherit;
    background: var(--primary-text-color); opacity: 0; transition: opacity 0.15s; pointer-events: none; }
  .chip:hover::before { opacity: 0.08; }
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
  /* padding-bottom matches the same 16px used as the gap between every
     top-level item (panels, the migrate-config header) - without it the last
     panel's content sits flush against the editor's own bottom edge, unlike
     every other item which always has that much breathing room on at least
     one side. */
  .editor { display: flex; flex-direction: column; gap: 16px; padding-bottom: 16px; }
  .panel-body { display: flex; flex-direction: row; gap: 16px; flex-wrap: wrap; align-content: flex-start; padding: 8px 0; }
  .panel-body ha-selector.field-toggle { margin-block: -18px; }
  .panel-body ha-selector.length-unit { align-self: flex-end; margin-block-end: 8px; }
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

export { css };
export { CARD_CSS };
export { CHIPS_HOST_STYLE };
export { BAR_STACK_EDITOR_STYLE };
export { CUSTOM_THEME_EDITOR_STYLE };
export { EDITOR_BASE_STYLE };
export { CONSTRUCTED_SHEETS };
export { CONSTRUCTIBLE_STYLESHEETS };
export { getSharedStyleSheet };
