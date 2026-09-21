/*
 * The `window.EPB_DIAG.dump()` diagnostic helper - `EPB_DIAG_DEV` in a dev
 * build: run in the browser console
 * on a dashboard that has the card, it prints an anonymized environment/
 * registration report to paste into a bug report. Installed once at load by
 * index.ts (installDiagnostic). See docs/troubleshooting.md.
 */

import { VERSION, LIGHT_BUILD, CARD_CONTEXT, HA_SELECTOR_TAG, HA_ACTION_HANDLER_TAG } from './parameters.js';
import { CONSTRUCTED_SHEETS, CONSTRUCTIBLE_STYLESHEETS } from './styles.js';
import { HassProviderSingleton } from './hass-provider.js';

interface RegisteredEntry {
  type: string;
  version?: string;
}

type Diagnostic = { version: string; dump: () => string };

// One global per build, mirroring devName()'s own -dev suffix on the element
// names: a dev bundle loaded beside the shipped one used to lose the race and
// leave the console answering for the other file.
const DIAG_GLOBAL = CARD_CONTEXT.dev ? 'EPB_DIAG_DEV' : 'EPB_DIAG';

declare global {
  interface Window {
    EPB_DIAG?: Diagnostic;
    EPB_DIAG_DEV?: Diagnostic;
    customCards?: RegisteredEntry[];
    customBadges?: RegisteredEntry[];
    customCardFeatures?: RegisteredEntry[];
  }
}

function installDiagnostic(): void {
  if (window[DIAG_GLOBAL]) return;
  window[DIAG_GLOBAL] = Object.freeze({
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
      // CONSTRUCTED_SHEETS fills lazily on first card render, so an empty map
      // means "no card built yet" (e.g. noRegistration mode, or dump() run
      // before any card mounted) - not a legacy fallback. Report the browser
      // capability, and only claim the active path once a sheet exists.
      const anyConstructed = CONSTRUCTED_SHEETS.size > 0 && [...CONSTRUCTED_SHEETS.values()].some(Boolean);
      const constructedCss = !CONSTRUCTIBLE_STYLESHEETS
        ? 'per-card fallback (browser lacks constructible stylesheets)'
        : anyConstructed
          ? 'shared (modern)'
          : 'supported, none built yet';
      const report = [
        '=== Entity Progress Card — diagnostic ===',
        `card version   : ${VERSION}${LIGHT_BUILD ? ' light' : ''}${CARD_CONTEXT.dev ? ' (dev mode)' : ''}`,
        `HA core        : ${hass?.config?.version ?? 'unknown (no hass yet)'}`,
        // Two different sources under one label otherwise: a dump taken
        // before any card holds hass reports the browser, not Home Assistant.
        `language       : ${hass?.locale?.language ?? `${navigator.language} (browser, no hass yet)`}`,
        `browser        : ${navigator.userAgent}`,
        `dark mode      : ${window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? 'n/a'}`,
        `reduced motion : ${window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? 'n/a'}`,
        `EPB registered : ${epbEntries.map((card) => `${card.type}@${card.version ?? '?'}`).join(', ') || 'none'}`,
        `duplicate load : ${duplicates ? '⚠️ YES — remove one of the two resources!' : 'no'}`,
        `HA elements    : ha-card=${Boolean(customElements.get('ha-card'))} ha-selector=${Boolean(customElements.get(HA_SELECTOR_TAG))} action-handler=${Boolean(customElements.get(HA_ACTION_HANDLER_TAG))}`,
        `constructed CSS: ${constructedCss}`,
        '=========================================',
      ].join('\n');
      console.info(report);
      return report;
    },
  });
}

export { installDiagnostic };
