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
import { CARD } from './card-config.js';
import { THEME, PERCENT_THEME_KEYS } from './card-themes.js';

// Injected by scripts/build.js - see development.md's Logging & debugging
// section for why baked in rather than URL-derived like `debug` below.
declare const __EPB_DEV_BUILD__: boolean;

// document.currentScript.src, not import.meta.url - a bare import.meta is a
// parse-time SyntaxError on a classic-script load (issue #108). null for an
// ES-module load (the common HACS "JavaScript Module" type) - the Resource
// Timing API covers that instead, matched by this exact build's own filename
// so a dev+prod pair loaded side by side never cross-match.
const MODULE_URL = (() => {
  try {
    const scriptSrc = (document.currentScript as HTMLScriptElement | null)?.src;
    if (scriptSrc) return scriptSrc;
    const filename = `entity-progress-card${__EPB_DEV_BUILD__ ? '_dev' : ''}.js`;
    return performance.getEntriesByType('resource').find((entry) => entry.name.includes(filename))?.name ?? '';
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

const CARD_CONTEXT = {
  dev: __EPB_DEV_BUILD__ || MODULE_PARAMS.get('dev') === 'true',
  classicScript: IS_CLASSIC_SCRIPT,
  // ?noRegistration loads the whole module (banner, EPB_DIAG, everything) but
  // defines zero custom elements and pushes nothing to customCards/Badges/
  // Features - a diagnostic knob for issue #108: if a freeze/clash disappears
  // with the module fully inert, it's our registration; if it persists, it's
  // the mere act of loading the bundle. URL-derived only, off unless asked.
  noRegistration: MODULE_PARAMS.has('noRegistration'),
  debug: resolvedDebug,
};

const devName = (name: string): string => `${name}${CARD_CONTEXT.dev ? '-dev' : ''}`;

const SEV = {
  info: 'info',
  warning: 'warning',
  error: 'error',
  debug: 'debug',
} as const;

const CONTENT_SLOT = '{{content}}';

const VALUE_CHANGED_EVENT = 'value-changed';
const HA_SELECTOR_TAG = 'ha-selector';
const HA_SVG_ICON_TAG = 'ha-svg-icon';
const HA_ACTION_HANDLER_TAG = 'action-handler';
const EDITOR_FIELD_NS = 'editor.field';
const EDITOR_FIELD_HELPER_NS = 'editor.field_helper';
const MIN_VALUE_ENTITY_PATH = 'min_value.entity';
const MAX_VALUE_ENTITY_PATH = 'max_value.entity';
// Not an editor field name (watermark.low/.high's entity/attribute/jinja stay
// virtual fields, see editor/factory.ts's wmSide). The editor always wraps
// low/high as { value, as, opacity, color } once touched - a hand-written
// short (unwrapped) config resolves its own path inline in checkValueConfig.
const WATERMARK_LOW_ENTITY_PATH = 'watermark.low.value.entity';
const WATERMARK_HIGH_ENTITY_PATH = 'watermark.high.value.entity';
// Same reasoning as WATERMARK_LOW_ENTITY_PATH/WATERMARK_HIGH_ENTITY_PATH:
// alert_when.above/.below stay virtual editor fields (nested one level under
// alert_when, same depth as watermark.low).
const ALERT_ABOVE_ENTITY_PATH = 'alert_when.above.entity';
const ALERT_BELOW_ENTITY_PATH = 'alert_when.below.entity';

export { VERSION };
export { META };
export { CARD_CONTEXT };
export { devName };
export { HA_CONTEXT };
export { CARD };
export { THEME };
export { PERCENT_THEME_KEYS };
export { SEV };
export { CONTENT_SLOT };
export { VALUE_CHANGED_EVENT };
export { HA_SELECTOR_TAG };
export { HA_SVG_ICON_TAG };
export { HA_ACTION_HANDLER_TAG };
export { EDITOR_FIELD_NS };
export { EDITOR_FIELD_HELPER_NS };
export { MIN_VALUE_ENTITY_PATH };
export { MAX_VALUE_ENTITY_PATH };
export { WATERMARK_LOW_ENTITY_PATH };
export { WATERMARK_HIGH_ENTITY_PATH };
export { ALERT_ABOVE_ENTITY_PATH };
export { ALERT_BELOW_ENTITY_PATH };
