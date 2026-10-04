// What the bundle does on load: register the types, expose window.EPB, print
// the console banner.

import { META, CARD_CONTEXT, CARD, suffixedName } from './utils/parameters.js';
import { RegistrationHelper } from './utils/register.js';
import { resolveEntitySuggestion } from './utils/entity-suggestions.js';
import { installDiagnostic, CONSOLE_GLOBAL, consoleHelper } from './utils/diagnostic.js';
import { audit } from './card/card-audit.js';
import { cards, inspect } from './card/doctor.js';
import {
  EntityProgressCard,
  EntityProgressBadge,
  EntityProgressFeatures,
  EntityProgressTemplateCard,
  EntityProgressTemplateBadge,
} from './card/cards.js';
import { EntityProgressMultiCard, EntityProgressMultiFeature } from './card/multi.js';

function registerComponents(): void {
  RegistrationHelper.registerCard(
    { ...META.types.card, getEntitySuggestion: resolveEntitySuggestion },
    EntityProgressCard,
  );
  RegistrationHelper.registerBadge(
    { ...META.types.badge, getEntitySuggestion: resolveEntitySuggestion },
    EntityProgressBadge,
  );
  RegistrationHelper.registerCard(META.types.template, EntityProgressTemplateCard);
  RegistrationHelper.registerBadge(META.types.badgeTemplate, EntityProgressTemplateBadge);
  RegistrationHelper.registerCardFeature(META.types.feature, EntityProgressFeatures);
  RegistrationHelper.registerCard(META.types.multiCard, EntityProgressMultiCard);
  RegistrationHelper.registerCardFeature(META.types.multiFeature, EntityProgressMultiFeature);
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
  } else if (CARD_CONTEXT.suffix) {
    const example = `custom:${suffixedName(META.types.card.typeName)}`;
    console.warn(
      `${CARD.console.suffixWarning}-${CARD_CONTEXT.suffix} (${example}…), console helper ${CONSOLE_GLOBAL}.`,
      CARD.console.warnCss,
    );
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

// A custom property only interpolates once its type is known, and @property in
// a shadow root is ignored: the ring's value is registered here, page-wide.
function registerRingValue(): void {
  try {
    globalThis.CSS?.registerProperty?.({
      name: CARD.style.dynamic.ringValue.var,
      syntax: '<number>',
      inherits: true,
      initialValue: '0',
    });
  } catch {
    // Another copy of the card on this page registered it first.
  }
}

function bootstrap(): void {
  registerComponents();
  registerRingValue();
  installDiagnostic({ audit, cards, inspect });
  announce();

  // noRegistration renders nothing, so the EPB.doctor.dump() cue never reaches
  // the reporter - emit the report automatically right after the banner (#108).
  if (CARD_CONTEXT.noRegistration) {
    consoleHelper()?.doctor.dump();
  }
}

export { bootstrap };
