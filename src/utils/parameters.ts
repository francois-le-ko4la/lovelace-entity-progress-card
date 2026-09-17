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
// HA's own "the config changed" event, dispatched by EditorBase and caught by
// whoever hosts it (the card itself, or a row list hosting a sub-editor).
const CONFIG_CHANGED_EVENT = 'config-changed';
const HA_SELECTOR_TAG = 'ha-selector';
const HA_SVG_ICON_TAG = 'ha-svg-icon';
const HA_ACTION_HANDLER_TAG = 'action-handler';
const EDITOR_FIELD_NS = 'editor.field';
// Labels several fields answer to (see EditorBase#labelFor): their own
// group, so editing one in translations/ visibly edits every field using it.
const SHARED_LABEL_NS = 'editor.shared';
const SHARED_LABEL_PREFIX = 'shared.';

// Labels Home Assistant already names, borrowed from its own catalog so the
// editor speaks the vocabulary the user reads elsewhere - and follows
// its rewordings ('Tap Action' -> 'Tap behavior') for free. Grouped by family:
// a family resolves only if every key in it does, so an older HA that lacks
// one never shows half a panel in HA's words and half in ours. Our own table
// keeps the English value as the fallback (2 bytes per language once folded).
// Editor-only: on a dashboard the lovelace fragment may not be loaded.
const HA_EDITOR_NS = 'ui.panel.lovelace.editor.card.';
const HA_DEFAULT_KEY = 'ui.panel.lovelace.editor.action-editor.actions.default_action';
const HA_COND_NS = 'ui.panel.lovelace.editor.condition-editor.condition.numeric_state.';
// [HA key, English fallback]. The fallback lives here rather than in
// translations/: a string identical in all 39 languages is not a translation.
const HA_LABEL_FAMILIES: Record<string, Record<string, readonly [haKey: string, fallback: string]>> = {
  value: {
    'shared.ent': [`${HA_EDITOR_NS}generic.entity`, 'Entity'],
    'shared.attr': [`${HA_EDITOR_NS}generic.attribute`, 'Attribute'],
    'shared.min': [`${HA_EDITOR_NS}generic.minimum`, 'Minimum'],
    'shared.max': [`${HA_EDITOR_NS}generic.maximum`, 'Maximum'],
  },
  identity: {
    icon: [`${HA_EDITOR_NS}generic.icon`, 'Icon'],
    name: [`${HA_EDITOR_NS}generic.name`, 'Name'],
    theme: [`${HA_EDITOR_NS}generic.theme`, 'Theme'],
    unit: [`${HA_EDITOR_NS}generic.unit`, 'Unit'],
    entities: [`${HA_EDITOR_NS}generic.entities`, 'Entities'],
    hide_mode: ['ui.common.hide', 'Hide'],
  },
  cardActions: {
    'action.tap': [`${HA_EDITOR_NS}generic.tap_action`, 'Tap behavior'],
    'action.hold': [`${HA_EDITOR_NS}generic.hold_action`, 'Hold behavior'],
    'action.double_tap': [`${HA_EDITOR_NS}generic.double_tap_action`, 'Double tap behavior'],
  },
  iconActions: {
    'action.icon_tap': [`${HA_EDITOR_NS}tile.icon_tap_action`, 'Icon tap behavior'],
    'action.icon_hold': [`${HA_EDITOR_NS}tile.icon_hold_action`, 'Icon hold behavior'],
    'action.icon_double_tap': [`${HA_EDITOR_NS}tile.icon_double_tap_action`, 'Icon double tap behavior'],
  },
  layout: {
    layout: [`${HA_EDITOR_NS}tile.content_layout`, 'Content layout'],
    // The selector's two values share its label's family: they are borrowed
    // together or not at all (see BORROWED_OPTION_LABELS).
    'layout.horizontal': [`${HA_EDITOR_NS}tile.content_layout_options.horizontal`, 'Horizontal'],
    'layout.vertical': [`${HA_EDITOR_NS}tile.content_layout_options.vertical`, 'Vertical'],
  },
  // Alone in its family: six fields read it (bar_color, the icon color, the
  // mark colors, alert_when.color) - if HA stops resolving it, only those
  // fall back.
  color: {
    'shared.col': [`${HA_EDITOR_NS}tile.color`, 'Color'],
  },
  // HA names this word only in their secondary-info editor - an unrelated
  // corner of their catalog, but the same word this field needs.
  position: {
    'shared.pos': [`${HA_EDITOR_NS}entities.secondary_info_values.position`, 'Position'],
  },
  // One HA key for both selectors: they say the same word.
  defaults: {
    'bar_position.default': [HA_DEFAULT_KEY, 'Default'],
    'density.default': [HA_DEFAULT_KEY, 'Default'],
  },
  // Their numeric-condition editor: same semantics as alert_when.above/below,
  // word for word.
  thresholds: {
    'alert_when.above': [`${HA_COND_NS}above`, 'Above'],
    'alert_when.below': [`${HA_COND_NS}below`, 'Below'],
  },
  precision: {
    decimal: ['ui.dialogs.entity_registry.editor.precision', 'Display precision'],
  },
  stateContent: {
    state_content: [`${HA_EDITOR_NS}heading.entity_config.state_content`, 'State content'],
  },
  lists: {
    add_entity: ['ui.panel.lovelace.editor.entities.add', 'Add entity'],
    action_picker: ['ui.components.form-optional-actions.add', 'Add interaction'],
  },
  titles: {
    'title.content': [`${HA_EDITOR_NS}generic.content`, 'Content'],
    'title.interaction': [`${HA_EDITOR_NS}generic.interactions`, 'Interactions'],
  },
};
const EDITOR_FIELD_HELPER_NS = 'editor.field_helper';
const MIN_VALUE_ENTITY_PATH = 'min_value.entity';
const MAX_VALUE_ENTITY_PATH = 'max_value.entity';
// Not an editor field name (watermark.low/.high's entity/attribute/jinja stay
// virtual fields, see editor/factory.ts's wmSide). The editor always wraps
// low/high as { value, as, opacity, color } once touched - a hand-written
// short (unwrapped) config resolves its own path inline in checkValueConfig.
const WATERMARK_LOW_ENTITY_PATH = 'watermark.low.value.entity';
const WATERMARK_HIGH_ENTITY_PATH = 'watermark.high.value.entity';
// Keyed by side so a caller looping over ['low', 'high'] doesn't re-derive the
// pairing (config-helpers.ts's own checks, factory.ts's wmSide).
const WATERMARK_ENTITY_PATHS = { low: WATERMARK_LOW_ENTITY_PATH, high: WATERMARK_HIGH_ENTITY_PATH } as const;
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
export { HIDE_TARGETS };
export type { HideTarget };
export { THEME };
export { THEME_KEYS };
export { PERCENT_THEME_KEYS };
export { SEV };
export { CONTENT_SLOT };
export { CONFIG_CHANGED_EVENT };
export { VALUE_CHANGED_EVENT };
export { HA_SELECTOR_TAG };
export { HA_SVG_ICON_TAG };
export { HA_ACTION_HANDLER_TAG };
export { EDITOR_FIELD_NS, SHARED_LABEL_NS, SHARED_LABEL_PREFIX, HA_LABEL_FAMILIES };
export { EDITOR_FIELD_HELPER_NS };
export { MIN_VALUE_ENTITY_PATH };
export { MAX_VALUE_ENTITY_PATH };
export { WATERMARK_ENTITY_PATHS };
export { ALERT_ABOVE_ENTITY_PATH };
export { ALERT_BELOW_ENTITY_PATH };
