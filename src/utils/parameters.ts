/*
 * Entry/barrel for the static configuration, split across:
 *   - meta.ts        VERSION + card/badge/feature type metadata
 *   - ha-context.ts  HA_CONTEXT (HA integration constants)
 *   - card-config.ts CARD (the assembled config tree)
 *   - card-themes.ts THEME (theme presets)
 * This file keeps only what must live together with the build/release tooling
 * (the dev/debug CARD_CONTEXT block - scripts/check-release-flags.js and
 * scripts/lib/release-flags.js target DEBUG_DEFAULTS by name in THIS file) plus
 * the small shared constants, and re-exports everything so every existing
 * `from './parameters.js'` import keeps working unchanged. No logic, just data.
 */

import { VERSION, META } from './meta.js';
import { HA_CONTEXT } from './ha-context.js';
import { CARD, HIDE_TARGETS, type HideTarget } from './card-config.js';
import { THEME, THEME_KEYS, PERCENT_THEME_KEYS } from './card-themes.js';

// Injected by scripts/build.js - see development.md's Logging & debugging
// section for why baked in rather than URL-derived like `debug` below.
declare const __EPB_DEV_BUILD__: boolean;

// This build's own basename, without extension - the editor and its
// translation files ship beside the bundle under it (see scripts/build.js).
const BUNDLE_STEM = `entity-progress-card${__EPB_DEV_BUILD__ ? '_dev' : ''}`;
// CF5 - issue (low) resolved - an image or a fetch carrying the bundle's name
// could pick where its editor is imported from: only its own script counts.
const isBundleEntry = (entry: PerformanceEntry, stem: string): boolean => {
  const { initiatorType } = entry as PerformanceResourceTiming;
  if (initiatorType !== 'script' && initiatorType !== 'other') return false;
  try {
    return new URL(entry.name).pathname.endsWith(`/${stem}.js`);
  } catch {
    return false;
  }
};
// A stack frame names the file it runs from, query included: two copies of one
// file (a stable and a test one) each find their own. Never import.meta (#108).
const scriptUrlFromStack = (stack: string | undefined): string =>
  stack?.match(/(?:https?|file):\/\/[^\s()]+?(?=:\d+:\d+)/)?.[0] ?? '';
const MODULE_URL = (() => {
  try {
    const scriptSrc = (document.currentScript as HTMLScriptElement | null)?.src;
    if (scriptSrc) return scriptSrc;
    const ownUrl = scriptUrlFromStack(new Error().stack);
    if (ownUrl) return ownUrl;
    return performance.getEntriesByType('resource').find((entry) => isBundleEntry(entry, BUNDLE_STEM))?.name ?? '';
  } catch {
    return '';
  }
})();
// Loaded as a classic <script> (document.currentScript is set) rather than an
// ES module (import() → null). A classic-typed resource is deprecated by HA and
// used to freeze browser_mod popups (issue #108); we load fine either way now,
// but still warn the user to switch to "JavaScript Module" (see index.ts).
const IS_CLASSIC_SCRIPT = (() => {
  try {
    return document.currentScript !== null;
  } catch {
    return false;
  }
})();
const MODULE_PARAMS = (() => {
  try {
    return new URL(MODULE_URL).searchParams;
  } catch {
    return new URLSearchParams();
  }
})();

// Committed/shipped debug baseline - kept a plain all-false literal so
// scripts/check-release-flags.js can verify (and scripts/build.js --prod can
// force) it in a release. A ?debug= query only ever turns flags ON at
// runtime; it never rewrites this.
const DEBUG_DEFAULTS = {
  card: false,
  editor: false,
  interactionHandler: false,
  ressourceManager: false,
  hass: false,
  registration: false,
  instances: false,
  interference: false,
};

const DEBUG_AREAS = new Set(
  (MODULE_PARAMS.get('debug') ?? '')
    .split(',')
    .map((area) => area.trim())
    .filter(Boolean),
);
const debugOn = (area: keyof typeof DEBUG_DEFAULTS): boolean =>
  DEBUG_DEFAULTS[area] || DEBUG_AREAS.has('all') || DEBUG_AREAS.has(area);

// Derived from DEBUG_DEFAULTS's own keys so a new debug area only needs
// adding there, not duplicated here too.
const resolvedDebug = Object.fromEntries(
  (Object.keys(DEBUG_DEFAULTS) as (keyof typeof DEBUG_DEFAULTS)[]).map((area) => [area, debugOn(area)]),
) as Record<keyof typeof DEBUG_DEFAULTS, boolean>;

const DEV_MODE = __EPB_DEV_BUILD__ || MODULE_PARAMS.get('dev') === 'true';

// ?suffix=rc registers every element under a -rc name, beside an untouched
// install - a test copy of the shipped file. A dev build is the -dev one.
const SUFFIX_PATTERN = /^[a-z0-9]{1,16}$/;
const suffixOf = (params: URLSearchParams, dev: boolean): string => {
  const asked = params.get('suffix') ?? '';
  if (SUFFIX_PATTERN.test(asked)) return asked;
  return dev ? 'dev' : '';
};

const CARD_CONTEXT = {
  dev: DEV_MODE,
  suffix: suffixOf(MODULE_PARAMS, DEV_MODE),
  classicScript: IS_CLASSIC_SCRIPT,
  // ?noRegistration loads the whole module (banner, EPB, everything) but
  // defines zero custom elements and pushes nothing to customCards/Badges/
  // Features - a diagnostic knob for issue #108: if a freeze/clash disappears
  // with the module fully inert, it's our registration; if it persists, it's
  // the mere act of loading the bundle. URL-derived only, off unless asked.
  noRegistration: MODULE_PARAMS.has('noRegistration'),
  debug: resolvedDebug,
  // Where this bundle was served from, and under which name: the editor and
  // its translation files sit next to it (see sidecarUrl).
  moduleUrl: MODULE_URL,
  bundleStem: BUNDLE_STEM,
};

const suffixedName = (name: string): string => (CARD_CONTEXT.suffix ? `${name}-${CARD_CONTEXT.suffix}` : name);

const SEV = {
  info: 'info',
  warning: 'warning',
  error: 'error',
  debug: 'debug',
} as const;

const CONTENT_SLOT = '{{content}}';

const EDITOR_FIELD_NS = 'editor.field';
// Labels several fields answer to (see EditorBase#labelFor): their own
// group, so editing one in translations/ visibly edits every field using it.
const SHARED_LABEL_NS = 'editor.shared';
const SHARED_LABEL_PREFIX = 'shared.';

const EDITOR_FIELD_HELPER_NS = 'editor.field_helper';
const MIN_VALUE_ENTITY_PATH = 'min_value.entity';
const MAX_VALUE_ENTITY_PATH = 'max_value.entity';
// Not editor field names (low/high stay virtual fields, see factory.ts's
// wmSide): the wrapped form the editor writes. A hand-written short form
// resolves its own path inline in checkValueConfig.
const WATERMARK_ENTITY_PATHS = { low: 'watermark.low.value.entity', high: 'watermark.high.value.entity' } as const;
// Same reasoning: alert_when.above/.below stay virtual editor fields too.
const ALERT_ABOVE_ENTITY_PATH = 'alert_when.above.entity';
const ALERT_BELOW_ENTITY_PATH = 'alert_when.below.entity';

export { VERSION };
export { META };
export { CARD_CONTEXT };
export { suffixedName, isBundleEntry, scriptUrlFromStack, suffixOf };
export { HA_CONTEXT };
export { CARD };
export { HIDE_TARGETS };
export type { HideTarget };
export { THEME };
export { THEME_KEYS };
export { PERCENT_THEME_KEYS };
export { SEV };
export { CONTENT_SLOT };
export { EDITOR_FIELD_NS, SHARED_LABEL_NS, SHARED_LABEL_PREFIX };
export { EDITOR_FIELD_HELPER_NS };
export { MIN_VALUE_ENTITY_PATH };
export { MAX_VALUE_ENTITY_PATH };
export { WATERMARK_ENTITY_PATHS };
export { ALERT_ABOVE_ENTITY_PATH };
export { ALERT_BELOW_ENTITY_PATH };
