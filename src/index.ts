/*
 * Entity Progress Card - a set of custom Lovelace elements for Home Assistant
 * that show an entity's value as a progress bar with an icon, name and
 * secondary info. Author: ko4la. Docs & source:
 * https://github.com/francois-le-ko4la/lovelace-entity-progress-card/
 *
 * Ships five element types from one bundle: the card, a badge, an in-tile
 * feature, and Jinja-template variants of the card and badge - each with its
 * own visual editor. Zero runtime dependencies (no Lit, no external sanitizer,
 * no CDN request): plain HTMLElement subclasses with hand-rolled batching/
 * change-tracking/style-sharing helpers. Highlights: entity-, number- or
 * Jinja-driven min/max/watermark/alert thresholds; theme presets and custom
 * themes with segment/rainbow gradients; center-zero diverging bars; bar_stack
 * aggregation; URL-derived per-area console logging and dev mode (?debug=…,
 * …_dev.js/?dev); and the window.EPB_DIAG.dump() diagnostic.
 *
 * This file is the bundle entry point: it registers every card/badge/feature
 * type with Home Assistant, exposes window.EPB_DIAG, and prints the console
 * banner. Runs once, on load.
 */

import { META, CARD_CONTEXT, CARD } from './utils/parameters.js';
import { RegistrationHelper } from './utils/register.js';
import { installDiagnostic } from './utils/diagnostic.js';
import {
  EntityProgressCard,
  EntityProgressBadge,
  EntityProgressFeatures,
  EntityProgressTemplateCard,
  EntityProgressTemplateBadge,
} from './card/cards.js';
import {
  EntityProgressCardEditor,
  EntityProgressBadgeEditor,
  EntityProgressTemplateEditor,
  EntityProgressBadgeTemplateEditor,
} from './editor/editors.js';

/******************************************************************************
 * 🔧 Register components
 */

RegistrationHelper.registerCard(META.types.card, EntityProgressCard, EntityProgressCardEditor);
RegistrationHelper.registerBadge(META.types.badge, EntityProgressBadge, EntityProgressBadgeEditor);
RegistrationHelper.registerCard(META.types.template, EntityProgressTemplateCard, EntityProgressTemplateEditor);
RegistrationHelper.registerBadge(
  META.types.badgeTemplate,
  EntityProgressTemplateBadge,
  EntityProgressBadgeTemplateEditor,
);
RegistrationHelper.registerCardFeature(META.types.feature, EntityProgressFeatures);

/******************************************************************************
 * 🔧 Diagnostic helper — window.EPB_DIAG.dump(), see utils/diagnostic.ts
 */

installDiagnostic();

/******************************************************************************
 * 🔧 Show module info
 */

console.groupCollapsed(CARD.console.message, CARD.console.css);
// eslint-disable-next-line no-console -- startup banner, not a debug leftover
console.log(CARD.console.link);
console.groupEnd();

// dev/debug are derived from the served URL (see CARD_CONTEXT in
// parameters.ts) - warn loudly when either is active so a *_dev.js / ?dev /
// ?debug=… configuration is never running silently mistaken for the shipped
// build.
if (CARD_CONTEXT.dev) {
  console.warn(CARD.console.devWarning, CARD.console.warnCss);
}
if (CARD_CONTEXT.noRegistration) {
  console.warn(CARD.console.noRegistrationWarning, CARD.console.warnCss);
}
const activeDebugAreas = Object.entries(CARD_CONTEXT.debug)
  .filter(([, on]) => on)
  .map(([area]) => area);
if (activeDebugAreas.length > 0) {
  console.warn(
    `${CARD.console.debugWarning}${activeDebugAreas.join(', ')}${CARD.console.debugWarningHint}`,
    CARD.console.warnCss,
  );
}

// noRegistration renders nothing, so the EPB_DIAG.dump() cue never reaches the
// reporter - emit the report automatically right after the banner (#108).
if (CARD_CONTEXT.noRegistration) {
  window.EPB_DIAG?.dump();
}
