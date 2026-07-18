/*
 * Bundle entry point: registers every card/badge/feature type with Home
 * Assistant, exposes the window.EPB_DIAG diagnostic helper, and prints the
 * console banner. Runs once, on load.
 */

import { VERSION, META, CARD_CONTEXT, CARD, HA_SELECTOR_TAG, HA_ACTION_HANDLER_TAG } from './utils/parameters.js';
import { CONSTRUCTED_SHEETS } from './utils/styles.js';
import { RegistrationHelper } from './utils/register.js';
import { HassProviderSingleton } from './utils/hass-provider.js';
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
 * 🔧 Diagnostic helper — `window.EPB_DIAG.dump()` in the browser console
 * prints an anonymized environment report to paste into bug reports.
 */

if (!window.EPB_DIAG) {
  window.EPB_DIAG = Object.freeze({
    version: VERSION,
    dump() {
      const hass = HassProviderSingleton.getInstance().hass;
      // Multiple registrations of the same EPB type = duplicate resource (HACS
      // + manual), the classic root cause of "impossible" bugs. Surface it
      // front and center.
      // Badges/badgeTemplate register under window.customBadges and the tile
      // feature under window.customCardFeatures (see RegistrationHelper) -
      // window.customCards alone only ever surfaces card/template.
      const allRegistered = [
        ...(window.customCards ?? []),
        ...(window.customBadges ?? []),
        ...(window.customCardFeatures ?? []),
      ];
      const epbEntries = allRegistered.filter((card) => card.type?.startsWith('entity-progress'));
      const duplicates = epbEntries.length !== new Set(epbEntries.map((card) => card.type)).size;
      const report = [
        '=== Entity Progress Card — diagnostic ===',
        `card version   : ${VERSION}${CARD_CONTEXT.dev ? ' (dev mode)' : ''}`,
        `HA core        : ${hass?.config?.version ?? 'unknown (no hass yet)'}`,
        `language       : ${hass?.locale?.language ?? navigator.language}`,
        `browser        : ${navigator.userAgent}`,
        `dark mode      : ${window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? 'n/a'}`,
        `reduced motion : ${window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? 'n/a'}`,
        `EPB registered : ${epbEntries.map((card) => `${card.type}@${card.version ?? '?'}`).join(', ') || 'none'}`,
        `duplicate load : ${duplicates ? '⚠️ YES — remove one of the two resources!' : 'no'}`,
        `HA elements    : ha-card=${Boolean(customElements.get('ha-card'))} ha-selector=${Boolean(customElements.get(HA_SELECTOR_TAG))} action-handler=${Boolean(customElements.get(HA_ACTION_HANDLER_TAG))}`,
        `constructed CSS: ${CONSTRUCTED_SHEETS.size > 0 && [...CONSTRUCTED_SHEETS.values()].some(Boolean) ? 'shared (modern)' : 'per-card fallback'}`,
        '=========================================',
      ].join('\n');
      console.info(report);
      return report;
    },
  });
}

/******************************************************************************
 * 🔧 Show module info
 */

console.groupCollapsed(CARD.console.message, CARD.console.css);
// eslint-disable-next-line no-console -- startup banner, not a debug leftover
console.log(CARD.console.link);
console.groupEnd();
