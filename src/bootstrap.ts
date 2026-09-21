// What both bundle entry points do: register the types, expose
// window.EPB_DIAG, print the console banner.

import { META, CARD_CONTEXT, CARD } from './utils/parameters.js';
import { RegistrationHelper } from './utils/register.js';
import { resolveEntitySuggestion } from './utils/entity-suggestions.js';
import { installDiagnostic } from './utils/diagnostic.js';
import {
  EntityProgressCard,
  EntityProgressBadge,
  EntityProgressFeatures,
  EntityProgressTemplateCard,
  EntityProgressTemplateBadge,
} from './card/cards.js';
import { EntityProgressMultiCard, EntityProgressMultiFeature } from './card/multi.js';

// A parameter, not an import: editors.ts/chips.ts/list-editors.ts call
// defineElement() at module level, so no build flag can tree-shake them away.
type EditorSet = {
  card: CustomElementConstructor;
  badge: CustomElementConstructor;
  template: CustomElementConstructor;
  badgeTemplate: CustomElementConstructor;
  feature: CustomElementConstructor;
  multiCard: CustomElementConstructor;
  multiFeature: CustomElementConstructor;
};

function registerComponents(editors: EditorSet | null): void {
  RegistrationHelper.registerCard(
    { ...META.types.card, getEntitySuggestion: resolveEntitySuggestion },
    EntityProgressCard,
    editors?.card,
  );
  RegistrationHelper.registerBadge(
    { ...META.types.badge, getEntitySuggestion: resolveEntitySuggestion },
    EntityProgressBadge,
    editors?.badge,
  );
  RegistrationHelper.registerCard(META.types.template, EntityProgressTemplateCard, editors?.template);
  RegistrationHelper.registerBadge(META.types.badgeTemplate, EntityProgressTemplateBadge, editors?.badgeTemplate);
  RegistrationHelper.registerCardFeature(META.types.feature, EntityProgressFeatures, editors?.feature);
  RegistrationHelper.registerCard(META.types.multiCard, EntityProgressMultiCard, editors?.multiCard);
  RegistrationHelper.registerCardFeature(META.types.multiFeature, EntityProgressMultiFeature, editors?.multiFeature);
}

function announce(): void {
  console.groupCollapsed(CARD.console.message, CARD.console.css);
  // eslint-disable-next-line no-console -- startup banner, not a debug leftover
  console.log(CARD.console.link);
  console.groupEnd();

  // dev/debug are derived from the served URL (see CARD_CONTEXT in
  // parameters.ts) - warn loudly when either is active so a ?dev=true /
  // ?debug=… configuration is never running silently mistaken for the shipped
  // build.
  if (CARD_CONTEXT.dev) {
    console.warn(CARD.console.devWarning, CARD.console.warnCss);
  }
  // Loaded as a classic <script> (deprecated resource type). Harmless now the
  // bundle no longer uses import.meta, but it used to freeze browser_mod popups
  // (#108) - nudge the user to "JavaScript Module". Skipped in dev: the dev
  // build is loaded classic on purpose (?dev=true reads
  // document.currentScript).
  if (CARD_CONTEXT.classicScript && !CARD_CONTEXT.dev) {
    console.warn(CARD.console.classicResourceWarning, CARD.console.warnCss);
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
}

function bootstrap(editors: EditorSet | null): void {
  registerComponents(editors);
  installDiagnostic();
  announce();

  // noRegistration renders nothing, so the EPB_DIAG.dump() cue never reaches
  // the reporter - emit the report automatically right after the banner (#108).
  if (CARD_CONTEXT.noRegistration) {
    (window.EPB_DIAG_DEV ?? window.EPB_DIAG)?.dump();
  }
}

export { bootstrap };
