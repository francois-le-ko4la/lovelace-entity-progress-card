import { css } from './css-tag.js';
import { CARD } from '../parameters.js';

const BASE_CSS = css`
/* =============================================================================
   BASE CARD
   ============================================================================= */

${CARD.htmlStructure.card.element} {
  --ha-ripple-color: var(--epb-icon-and-shape-color, var(--icon-and-shape-color, var(--state-icon-color)));
  /* Re-declared here (not only :host) so card_mod overrides set on ha-card are seen:
     var() substitution happens on the declaring element, and ha-card is where users
     apply per-card styles. The :host declarations keep theme-level overrides working. */
  --spacing: var(--epb-spacing, 10px);
  --shape-default-size: var(--epb-shape-size, var(--current-row-shape-size, 36px));
  --icon-default-size: var(--epb-icon-size, var(--current-row-icon-size, 24px));
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
  /* The fourth thing ha-card paints (see its own :host). A transparent
     background does not stop a filter: a glass theme sets this globally, and a
     nested frameless card kept frosting whatever it sat on. */
  --ha-card-backdrop-filter: none;
  /* A real property, not a variable: --epb-card-border-width leads ha-card's
     own border-width chain and it inherits, so a card_mod setting it on a
     parent reinstated a border on every frameless card nested inside - Multi
     rows included, which force frameless precisely so no frame is drawn. */
  border-width: 0;
}

/* The same frost, painted where no variable can reach it: a glass theme
   (card_mod) decorates ha-card::before and ::after, so a nested card inherits
   chrome meant for a top-level one. !important because those rules carry it too,
   and our adopted sheet cascades after the <style> injected in this same root. */
:is(.type-entities, .type-custom-vertical-stack-in-card, .${CARD.style.dynamic.frameless})::before,
:is(.type-entities, .type-custom-vertical-stack-in-card, .${CARD.style.dynamic.frameless})::after {
  content: none !important;
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
`;

export { BASE_CSS };
