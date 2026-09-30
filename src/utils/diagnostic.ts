// window.EPB_DIAG (EPB_DIAG_DEV in a dev build): dump() and cardAudit(), for
// the browser console - see docs/troubleshooting.md.

import { VERSION, LIGHT_BUILD, CARD_CONTEXT, HA_SELECTOR_TAG, HA_ACTION_HANDLER_TAG } from './parameters.js';
import { CONSTRUCTED_SHEETS, CONSTRUCTIBLE_STYLESHEETS } from './styles.js';
import { HassProviderSingleton } from './hass-provider.js';

interface RegisteredEntry {
  type: string;
  version?: string;
}

type Diagnostic = { version: string; dump: () => string; cardAudit: () => Promise<string> };
type BrandVersion = { brand: string; version: string };
type UaHints = {
  brands?: BrandVersion[];
  fullVersionList?: BrandVersion[];
  uaFullVersion?: string;
  platform?: string;
  platformVersion?: string;
};
type UaData = Pick<UaHints, 'brands' | 'platform'> & { getHighEntropyValues: (hints: string[]) => Promise<UaHints> };

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

// Chrome freezes its User-Agent at the major version, Windows at NT 10.0: only
// Client Hints still carry the real ones, and only over https.
let uaHints: UaHints | null = null;

// Asked once at load, so dump() and the editor's copy stay synchronous: Safari
// refuses a clipboard write that follows an await.
const requestUaHints = async (): Promise<void> => {
  const uaData = (navigator as Navigator & { userAgentData?: UaData }).userAgentData;
  if (!uaData) return;
  try {
    const hints = await uaData.getHighEntropyValues(['fullVersionList', 'platformVersion']);
    // Chrome < 98 predates fullVersionList, and answers only the hints asked:
    // its uaFullVersion (deprecated since), brands and platform off uaData.
    const legacy = hints.fullVersionList ? {} : await uaData.getHighEntropyValues(['uaFullVersion']);
    uaHints = { brands: uaData.brands, platform: uaData.platform, ...hints, ...legacy };
  } catch {
    uaHints = null;
  }
};

// The made-up brands Chrome mixes into the list on purpose ("Not)A;Brand",
// " Not;A Brand").
const GREASE_BRAND = /^[^a-z]*not[^a-z]*a[^a-z]*brand[^a-z]*$/i;
// https://learn.microsoft.com/microsoft-edge/web-platform/how-to-detect-win11
const WINDOWS_11_PLATFORM = 13;

const platformOf = ({ platform = 'unknown OS', platformVersion = '' }: UaHints): string => {
  if (platform !== 'Windows') return `${platform} ${platformVersion}`.trim();
  const major = Number.parseInt(platformVersion, 10);
  return `${major >= WINDOWS_11_PLATFORM ? 'Windows 11' : 'Windows 10 or older'} (${platformVersion})`;
};

const brandOf = (list: BrandVersion[] = []): BrandVersion | undefined => {
  const real = list.filter(({ brand }) => !GREASE_BRAND.test(brand));
  return real.find(({ brand }) => brand !== 'Chromium') ?? real[0];
};

const nameOf = (hints: UaHints): string => {
  const full = brandOf(hints.fullVersionList);
  if (full) return `${full.brand} ${full.version}`;
  const major = brandOf(hints.brands);
  return major ? `${major.brand} ${hints.uaFullVersion ?? major.version}` : 'see user agent';
};

const browserOf = (hints: UaHints | null, secure: boolean): string => {
  if (!hints) return secure ? 'see user agent' : 'see user agent (no exact version over http)';
  return `${nameOf(hints)} — ${platformOf(hints)}`;
};

// What dump() prints - also what the editor's issue report opens with.
function environmentReport(): string {
  const hass = HassProviderSingleton.getInstance().hass;
  // Badges and features register in lists of their own (RegistrationHelper).
  // One type listed twice is the resource loaded twice: HACS plus a manual one.
  const allRegistered = [
    ...(window.customCards ?? []),
    ...(window.customBadges ?? []),
    ...(window.customCardFeatures ?? []),
  ];
  const epbEntries = allRegistered.filter((card) => card.type?.startsWith('entity-progress'));
  const duplicates = epbEntries.length !== new Set(epbEntries.map((card) => card.type)).size;
  // Filled on the first card render: empty means no card built yet, not the
  // fallback - so the browser's capability until then.
  const anyConstructed = CONSTRUCTED_SHEETS.size > 0 && [...CONSTRUCTED_SHEETS.values()].some(Boolean);
  const constructedCss = !CONSTRUCTIBLE_STYLESHEETS
    ? 'per-card fallback (browser lacks constructible stylesheets)'
    : anyConstructed
      ? 'shared (modern)'
      : 'supported, none built yet';
  return [
    '=== Entity Progress Card — diagnostic ===',
    `card version   : ${VERSION}${LIGHT_BUILD ? ' light' : ''}${CARD_CONTEXT.dev ? ' (dev mode)' : ''}`,
    `HA core        : ${hass?.config?.version ?? 'unknown (no hass yet)'}`,
    // Two different sources under one label otherwise: a dump taken
    // before any card holds hass reports the browser, not Home Assistant.
    `language       : ${hass?.locale?.language ?? `${navigator.language} (browser, no hass yet)`}`,
    `browser        : ${browserOf(uaHints, window.isSecureContext)}`,
    `user agent     : ${navigator.userAgent}`,
    `dark mode      : ${window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? 'n/a'}`,
    `reduced motion : ${window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? 'n/a'}`,
    `EPB registered : ${epbEntries.map((card) => `${card.type}@${card.version ?? '?'}`).join(', ') || 'none'}`,
    `duplicate load : ${duplicates ? '⚠️ YES — remove one of the two resources!' : 'no'}`,
    `HA elements    : ha-card=${Boolean(customElements.get('ha-card'))} ha-selector=${Boolean(customElements.get(HA_SELECTOR_TAG))} action-handler=${Boolean(customElements.get(HA_ACTION_HANDLER_TAG))}`,
    `constructed CSS: ${constructedCss}`,
    `card audit     : run ${DIAG_GLOBAL}.cardAudit() to list cards to review`,
    '=========================================',
  ].join('\n');
}

// cardAudit comes from the caller: it reads card code, which utils/ doesn't.
function installDiagnostic(cardAudit: () => Promise<string>): void {
  if (window[DIAG_GLOBAL]) return;
  requestUaHints();
  window[DIAG_GLOBAL] = Object.freeze({
    version: VERSION,
    cardAudit,
    dump() {
      const report = environmentReport();
      console.info(report);
      return report;
    },
  });
}

export { installDiagnostic, environmentReport, browserOf };
