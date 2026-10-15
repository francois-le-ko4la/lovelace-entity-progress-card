import { css } from './css-tag.js';
import { CARD } from '../parameters.js';

const PARAMS_CSS = css`
/* =============================================================================
   PARAMS
   ============================================================================= */

:host {
  /* === SPACING VARIABLES === */
  --spacing: var(--epb-spacing, 10px);
  --gap-entities: 16px;

  /* === SIZE VARIABLES === */
  --shape-default-size: var(--epb-shape-size, var(--current-row-shape-size, 36px));
  --icon-default-size: var(--epb-icon-size, var(--current-row-icon-size, 24px));
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
  /* --current-row-* is the slot a host that owns its children's box writes
     into (EntityProgressMultiBase._distributeHeight, multi.ts): a Multi row
     gets its whole height imposed, so the icon, its shape and the text line
     have to be derived from it rather than standing at the card's own
     defaults. Behind --epb-*, never in front: a user override still wins. */
  --detail-height: var(--current-row-detail-height, 16px);
  --entities-height: 22.4px;
  --vertical-name-large-height: 18px;
  /* The row the bar is centred in, fixed in horizontal whatever bar_size is -
     so it needs the same --current-row-* slot as the text box above, or it
     alone overflows a row shorter than itself. .xlarge and .overlay still
     override it further down, unchanged. */
  --progress-container-height: var(--current-row-bar-box, 16px);

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
`;

export { PARAMS_CSS };
