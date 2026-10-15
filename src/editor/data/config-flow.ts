/*
 * Pure steps of the editor's config round trip: which keys changed, what a
 * write parks or migrates, and the order the config leaves in.
 */

import { is } from '../../utils/common-checks.js';
import { type LovelaceConfig } from '../../utils/types.js';
import { BaseConfigHelper } from '../../card/config/config-helpers.js';
import {
  THEME_ALIASES,
  ACTION_FIELDS,
  OPTIONS_WITHOUT_EFFECT,
  translateOrientation,
} from '../../card/config/schema.js';

const isInert = (config: LovelaceConfig, { key, hasEffect }: (typeof OPTIONS_WITHOUT_EFFECT)[number]) =>
  !is.nullish(config[key]) && !hasEffect(config);

// An option with no effect leaves the YAML for an _inert_draft, and comes back
// once it has one again - unless set anew in between.
const parkInertOptions = (config: LovelaceConfig): LovelaceConfig => {
  const next = { ...config };
  for (const option of OPTIONS_WITHOUT_EFFECT) {
    const { key, hasEffect, fallback } = option;
    const draftKey = `_${key}_inert_draft`;
    const value = next[key];
    const draft = next[draftKey];
    if (!is.nullish(value)) {
      if (!isInert(next, option)) {
        Reflect.deleteProperty(next, draftKey);
        continue;
      }
      if (value !== fallback) next[draftKey] = value;
      Reflect.deleteProperty(next, key);
    } else if (!is.nullish(draft) && hasEffect({ ...next, [key]: draft })) {
      next[key] = draft;
      Reflect.deleteProperty(next, draftKey);
    }
  }
  return next;
};

// Switching to or from a ring carries the orientation over (ltr <-> clockwise).
const translateRingOrientation = (config: LovelaceConfig): LovelaceConfig =>
  is.nullish(config.bar_orientation) ? config : { ...config, bar_orientation: translateOrientation(config) };

const assignOrUnset = <T extends object>(target: T, key: string, value: unknown): T => {
  const next = { ...target };
  if (is.nullishOrEmptyString(value)) Reflect.deleteProperty(next, key);
  else (next as Record<string, unknown>)[key] = value;
  return next;
};

// Leaf keys no other field reads; an allowlist, so an absent key takes the full
// walk. 'unit' is out on purpose: decimal's placeholder derives from it.
const ISOLATED_KEYS: ReadonlySet<string> = new Set([
  'name',
  'name_info',
  'secondary',
  'custom_info',
  'multiline',
  'unit_spacing',
  'decimal',
  'icon',
  'icon_animation',
  'color',
  'bar_color',
  'bar_scale',
  'bar_segments',
  'bar_single_line',
  'interpolate',
  'text_shadow',
  'reverse',
  'reverse_secondary_info_row',
  'force_circular_background',
  'frameless',
  'marginless',
  'fast_refresh',
  'height',
  'min_width',
  'badge_icon',
  'badge_color',
  ...ACTION_FIELDS,
]);

// Keys that differ between two configs, ignoring _-prefixed editor UI state.
const changedTopLevelKeys = (next: LovelaceConfig, prev: LovelaceConfig | undefined): Set<string> => {
  const changed = new Set<string>();
  const keys = new Set([...Object.keys(next), ...Object.keys(prev ?? {})].filter((k) => !k.startsWith('_')));
  for (const key of keys) {
    if (JSON.stringify(next[key]) !== JSON.stringify(prev?.[key])) changed.add(key);
  }
  return changed;
};

// Cosmetic key order: `type`, `entity` on top, HA's meta keys at the bottom.
const TOP_KEYS = ['type', 'entity'];
const BOTTOM_KEYS = ['layout_options', 'grid_options', 'view_layout', 'visibility', 'disabled'];

const canonicalOrder = (config: LovelaceConfig): LovelaceConfig => {
  const isAnchor = (key: string) => TOP_KEYS.includes(key) || BOTTOM_KEYS.includes(key);
  const ordered: Record<string, unknown> = {};
  for (const key of TOP_KEYS) if (key in config) ordered[key] = config[key];
  for (const key of Object.keys(config)) if (!isAnchor(key)) ordered[key] = config[key];
  for (const key of BOTTOM_KEYS) if (key in config) ordered[key] = config[key];
  return ordered as LovelaceConfig;
};

// Defaults (unit, decimal, range) are negotiated off the entity the card
// actually renders.
const withContextEntity = (config: LovelaceConfig, inherited: unknown): LovelaceConfig => {
  if (is.nonEmptyString(config.entity) || !is.nonEmptyString(inherited)) return config;
  return { ...config, entity: inherited } as LovelaceConfig;
};

// The active helper's own migrations, so a Multi row migrates what its button
// flags. navigate_to/show_more_info are dropped: inert since v1.2.0.
const migrateDeprecatedConfig = (config: LovelaceConfig, configHelper: BaseConfigHelper): LovelaceConfig => {
  let migrated = (configHelper.constructor as typeof BaseConfigHelper)._customizeConfig(config);
  const themeAlias = THEME_ALIASES[migrated.theme];
  if (themeAlias) migrated = { ...migrated, theme: themeAlias };
  if (migrated.navigate_to !== undefined) migrated = { ...migrated, navigate_to: undefined };
  if (migrated.show_more_info !== undefined) migrated = { ...migrated, show_more_info: undefined };
  return migrated;
};

export {
  ISOLATED_KEYS,
  assignOrUnset,
  canonicalOrder,
  changedTopLevelKeys,
  isInert,
  migrateDeprecatedConfig,
  parkInertOptions,
  translateRingOrientation,
  withContextEntity,
};
