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
import { THEME } from './card-themes.js';

// dev / debug are read from the module's own served URL (import.meta.url) at
// load, instead of being edited into this file and rebuilt to flip them:
//   - dev:   the file is served as *_dev.js, or the resource URL carries a
//            ?dev query param. Drives the `-dev` suffix on every registered
//            element name, so a dev build coexists with the shipped one.
//   - debug: ?debug=card,hass (or ?debug=all) turns on per-area console
//            logging on top of DEBUG_DEFAULTS below.
// import.meta.url is guarded: if the module is ever evaluated where
// import.meta is unavailable, dev is off and only DEBUG_DEFAULTS apply - the
// safe shipped state. In an esbuild bundle import.meta.url resolves to the
// loaded bundle's own URL (not a per-source path), which is exactly the
// served resource URL we want to read here.
const MODULE_URL = (() => {
  try {
    return import.meta.url;
  } catch {
    return '';
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

const CARD_CONTEXT = {
  dev: /_dev\.js(?:$|\?)/.test(MODULE_URL) || MODULE_PARAMS.has('dev'),
  // ?noRegistration loads the whole module (banner, EPB_DIAG, everything) but
  // defines zero custom elements and pushes nothing to customCards/Badges/
  // Features - a diagnostic knob for issue #108: if a freeze/clash disappears
  // with the module fully inert, it's our registration; if it persists, it's
  // the mere act of loading the bundle. URL-derived only, off unless asked.
  noRegistration: MODULE_PARAMS.has('noRegistration'),
  debug: {
    card: debugOn('card'),
    editor: debugOn('editor'),
    interactionHandler: debugOn('interactionHandler'),
    ressourceManager: debugOn('ressourceManager'),
    hass: debugOn('hass'),
    registration: debugOn('registration'),
    instances: debugOn('instances'),
    interference: debugOn('interference'),
  },
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
const MIN_VALUE_ENTITY_PATH = 'min_value.entity';
const MAX_VALUE_ENTITY_PATH = 'max_value.entity';
// Not an editor field name (watermark.low/.high's entity/attribute/jinja stay
// virtual fields, see editor/factory.ts's wmSide - the generic dot-path field
// machinery only resolves one level of nesting, and watermark.low is already
// one level deep under `watermark`). Used as a plain config-path string
// instead: HaSelector's selectorOf (arbitrary-depth reduce, unlike field
// names) and _checkHAEnvironment's error paths.
const WATERMARK_LOW_ENTITY_PATH = 'watermark.low.entity';
const WATERMARK_HIGH_ENTITY_PATH = 'watermark.high.entity';
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
export { SEV };
export { CONTENT_SLOT };
export { VALUE_CHANGED_EVENT };
export { HA_SELECTOR_TAG };
export { HA_SVG_ICON_TAG };
export { HA_ACTION_HANDLER_TAG };
export { EDITOR_FIELD_NS };
export { MIN_VALUE_ENTITY_PATH };
export { MAX_VALUE_ENTITY_PATH };
export { WATERMARK_LOW_ENTITY_PATH };
export { WATERMARK_HIGH_ENTITY_PATH };
export { ALERT_ABOVE_ENTITY_PATH };
export { ALERT_BELOW_ENTITY_PATH };
