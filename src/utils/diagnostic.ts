/*
 * The `window.EPB_DIAG.dump()` diagnostic helper: run in the browser console
 * on a dashboard that has the card, it prints an anonymized environment/
 * registration report to paste into a bug report. Installed once at load by
 * index.ts (installDiagnostic). See docs/troubleshooting.md.
 */

import { VERSION, CARD_CONTEXT, HA_SELECTOR_TAG, HA_ACTION_HANDLER_TAG } from './parameters.js';
import { CONSTRUCTED_SHEETS, CONSTRUCTIBLE_STYLESHEETS } from './styles.js';
import { HassProviderSingleton } from './hass-provider.js';

interface RegisteredEntry {
  type: string;
  version?: string;
}

declare global {
  interface Window {
    EPB_DIAG?: {
      version: string;
      dump: () => string;
    };
    customCards?: RegisteredEntry[];
    customBadges?: RegisteredEntry[];
    customCardFeatures?: RegisteredEntry[];
  }
}

function installDiagnostic(): void {
  if (window.EPB_DIAG) return;
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
      // CONSTRUCTED_SHEETS fills lazily on first card render, so an empty map
      // means "no card built yet" (e.g. noRegistration mode, or dump() run
      // before any card mounted) - not a legacy fallback. Report the browser
      // capability, and only claim the active path once a sheet actually exists.
      const anyConstructed = CONSTRUCTED_SHEETS.size > 0 && [...CONSTRUCTED_SHEETS.values()].some(Boolean);
      const constructedCss = !CONSTRUCTIBLE_STYLESHEETS
        ? 'per-card fallback (browser lacks constructible stylesheets)'
        : anyConstructed
          ? 'shared (modern)'
          : 'supported, none built yet';
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
        `constructed CSS: ${constructedCss}`,
        '=========================================',
      ].join('\n');
      console.info(report);
      return report;
    },
  });
}

export { installDiagnostic };
