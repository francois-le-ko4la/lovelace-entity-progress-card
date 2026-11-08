// window.EPB (EPB_DEV, EPB_RC… under a suffix), the card's browser console
// helper: version, help() and the doctor tools - see troubleshooting.md.

import { VERSION, CARD_CONTEXT, HA_CONTEXT, isBundleEntry } from './parameters.js';
import { CONSTRUCTED_SHEETS, CONSTRUCTIBLE_STYLESHEETS } from './styles.js';
import { currentHass, editorFileReport, sidecarUrl } from './hass-provider.js';

interface RegisteredEntry {
  type: string;
  version?: string;
}

type Doctor = {
  dump: () => Promise<string>;
  audit: () => Promise<string>;
  cards: () => HTMLElement[];
  inspect: (target: unknown) => Record<string, unknown> | null;
  jinja: (target: unknown) => Record<string, unknown>[] | null;
  history: (target: unknown) => Record<string, unknown> | null;
  copy: (target: unknown) => string | null;
};
// What the card side brings: it reads card code, which utils/ doesn't.
type CardTools = Omit<Doctor, 'dump'>;
type ConsoleHelper = {
  version: string;
  help: () => string;
  debug: (areas?: string | false) => string;
  doctor: Doctor;
};
// What 1.6.2 published, kept as an alias: version and dump, audit added since.
type LegacyDiagnostic = { version: string } & Doctor;
type BrandVersion = { brand: string; version: string };
type UaHints = {
  brands?: BrandVersion[];
  fullVersionList?: BrandVersion[];
  uaFullVersion?: string;
  platform?: string;
  platformVersion?: string;
};
type UaData = Pick<UaHints, 'brands' | 'platform'> & { getHighEntropyValues: (hints: string[]) => Promise<UaHints> };

// One global per copy, suffixed like its element names: two bundles loaded side
// by side each answer for themselves.
const SUFFIX_KEY = CARD_CONTEXT.suffix ? `_${CARD_CONTEXT.suffix.toUpperCase()}` : '';
const CONSOLE_GLOBAL: `EPB${string}` = `EPB${SUFFIX_KEY}`;
const LEGACY_GLOBAL: `EPB_DIAG${string}` = `EPB_DIAG${SUFFIX_KEY}`;

declare global {
  interface Window {
    [helper: `EPB${string}`]: ConsoleHelper | LegacyDiagnostic | undefined;
    customCards?: RegisteredEntry[];
    customBadges?: RegisteredEntry[];
    customCardFeatures?: RegisteredEntry[];
  }
}

// Chrome freezes its User-Agent at the major version, Windows at NT 10.0: only
// Client Hints still carry the real ones, and only over https.
let uaHints: UaHints | null = null;

// Asked once at load, so the editor's copy stays synchronous: Safari refuses a
// clipboard write that follows an await.
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

// HA imports module resources (no <script> tag): only Resource Timing sees
// their URLs.
const bundleUrls = (): string[] => [
  ...new Set(
    performance
      .getEntriesByType('resource')
      .filter((entry) => isBundleEntry(entry, CARD_CONTEXT.bundleStem))
      .map(({ name }) => name),
  ),
];

// What dump() prints - also what the editor's issue report opens with, minus
// the digests (see requestUaHints).
function environmentReport(extraLines: string[] = []): string {
  const hass = currentHass();
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
    `card version   : ${VERSION}${CARD_CONTEXT.dev ? ' (dev mode)' : ''}${CARD_CONTEXT.suffix ? `, names -${CARD_CONTEXT.suffix}` : ''}`,
    `HA core        : ${hass?.config?.version ?? 'unknown (no hass yet)'}`,
    // Two different sources under one label otherwise: a dump taken
    // before any card holds hass reports the browser, not Home Assistant.
    `language       : ${hass?.locale?.language ?? `${navigator.language} (browser, no hass yet)`}`,
    `browser        : ${browserOf(uaHints, window.isSecureContext)}`,
    `user agent     : ${navigator.userAgent}`,
    `dark mode      : ${window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? 'n/a'}`,
    `reduced motion : ${window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? 'n/a'}`,
    `EPB registered : ${epbEntries.map((card) => `${card.type}@${card.version ?? '?'}`).join(', ') || 'none'}`,
    `duplicate load : ${duplicates ? `⚠️ YES — remove one of the resources: ${bundleUrls().join(', ') || 'URLs unknown'}` : 'no'}`,
    `HA elements    : ha-card=${Boolean(customElements.get('ha-card'))} ha-selector=${Boolean(customElements.get(HA_CONTEXT.elements.selector))} action-handler=${Boolean(customElements.get(HA_CONTEXT.elements.actionHandler))}`,
    `constructed CSS: ${constructedCss}`,
    `editor         : ${editorFileReport()}`,
    `audit          : run ${CONSOLE_GLOBAL}.doctor.audit() to list cards to review`,
    ...extraLines,
    '=========================================',
  ].join('\n');
}

// The first 12 hex digits of the file as served, to hold against the digest
// GitHub shows beside a release asset.
const DIGEST_LENGTH = 12;
const digestOf = async (url: string): Promise<string> => {
  if (!globalThis.crypto?.subtle) return 'unavailable (https only)';
  try {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) return `unavailable (HTTP ${response.status})`;
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', await response.arrayBuffer()));
    return [...digest]
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, DIGEST_LENGTH);
  } catch {
    return 'unavailable';
  }
};

const digestLines = async (): Promise<string[]> => {
  const editorUrl = sidecarUrl('editor.js');
  const [card, editor] = await Promise.all([digestOf(CARD_CONTEXT.moduleUrl), digestOf(editorUrl)]);
  return [`sha-256 card   : ${card} — ${CARD_CONTEXT.moduleUrl || 'URL unknown'}`, `sha-256 editor : ${editor}`];
};

const COMMANDS: [string, string][] = [
  ['version', 'the version running'],
  ['doctor.dump()', 'environment report, to paste into an issue'],
  ['doctor.audit()', 'every card, on every dashboard, to review'],
  ['doctor.cards()', 'the cards on this page, numbered'],
  ['doctor.inspect(n | $0)', 'one of them: its value, range and config'],
  ['doctor.jinja(n | $0)', 'its Jinja fields: subscribed or not, last result or error'],
  ['doctor.history(n | $0)', 'the samples behind its trend_indicator and peak_marker'],
  ['doctor.copy(n | $0)', 'an issue report for it: environment and commented YAML'],
  ['debug(areas | false)', 'debug areas kept across reloads (card,editor… or all); false clears'],
  ['help()', 'this list'],
];
const helpText = (): string => {
  const width = Math.max(...COMMANDS.map(([command]) => command.length));
  return [
    '=== Entity Progress Card — console ===',
    ...COMMANDS.map(([command, what]) => `${CONSOLE_GLOBAL}.${command.padEnd(width)}  ${what}`),
  ].join('\n');
};

const printed = (report: string): string => {
  console.info(report);
  return report;
};

const DEBUG_AREA_NAMES = [...Object.keys(CARD_CONTEXT.debug), 'all'];
const storage = (): Storage | null => {
  try {
    return localStorage;
  } catch {
    return null;
  }
};

// Flags are read when a card is built: a change waits for the next reload.
const debug = (areas?: string | false): string => {
  const store = storage();
  if (!store) return printed('debug: this browser blocks localStorage, use ?debug= on the resource URL.');
  const key = CARD_CONTEXT.debugStorageKey;
  if (areas === undefined) return printed(`debug: saved ${store.getItem(key) || 'none'}`);
  if (areas === false) {
    store.removeItem(key);
    return printed('debug: cleared, reload the page to apply.');
  }
  const asked = areas
    .split(',')
    .map((area) => area.trim())
    .filter(Boolean);
  const unknown = asked.filter((area) => !DEBUG_AREA_NAMES.includes(area));
  if (asked.length === 0 || unknown.length > 0) {
    return printed(`debug: unknown area ${unknown.join(', ') || '(none)'}; one of ${DEBUG_AREA_NAMES.join(', ')}.`);
  }
  store.setItem(key, asked.join(','));
  return printed(`debug: ${asked.join(', ')} saved, reload the page to apply.`);
};

// The first copy of a name keeps it, locked: a second load of the same bundle
// is what dump() reports as a duplicate, not a reason to swap the helper.
const publish = (name: string, descriptor: PropertyDescriptor): void => {
  if (name in window) return;
  Object.defineProperty(window, name, descriptor);
};

function installDiagnostic(cardTools: CardTools): void {
  if (CONSOLE_GLOBAL in window) return;
  requestUaHints();
  const doctor: Doctor = Object.freeze({
    dump: async () => printed(environmentReport(await digestLines())),
    ...cardTools,
  });
  const helper: ConsoleHelper = Object.freeze({ version: VERSION, help: () => printed(helpText()), debug, doctor });
  publish(CONSOLE_GLOBAL, { value: helper });
  let warned = false;
  const legacy: LegacyDiagnostic = Object.freeze({ version: VERSION, ...doctor });
  publish(LEGACY_GLOBAL, {
    get: () => {
      if (!warned) console.warn(`${LEGACY_GLOBAL} is now ${CONSOLE_GLOBAL}.doctor - try ${CONSOLE_GLOBAL}.help().`);
      warned = true;
      return legacy;
    },
  });
}

const consoleHelper = (): ConsoleHelper | undefined => window[CONSOLE_GLOBAL] as ConsoleHelper | undefined;

export { installDiagnostic, environmentReport, browserOf, CONSOLE_GLOBAL, consoleHelper };
