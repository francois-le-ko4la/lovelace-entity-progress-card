import { is } from '../../../utils/common-checks.js';
import { type LovelaceConfig, type Config, type FieldDef } from '../../../utils/types.js';

// What an unset field hands its element: an empty string, except where the
// element reads its default from a nullish value (ha-color-picker's `??`).
const EMPTY_IS_UNDEFINED = new Set(['toggle', 'number', 'decimal', 'color_state_default']);

// A dot-path field name ('watermark.low') addresses a nested config key.
function splitFieldName(name: string): { parentKey: string; childKey: string | null } {
  const [parentKey, childKey] = name.includes('.') ? name.split('.') : [name, null];
  return { parentKey, childKey };
}

// `config` is either source: resolveValue picks negotiated or raw per field
// type before calling this.
function fallbackOf(def: FieldDef, config: LovelaceConfig | Config, empty: unknown): unknown {
  if (def.default === undefined) return empty;
  return is.func(def.default) ? def.default(config) : def.default;
}

function resolveValue(def: FieldDef, rawConfig: LovelaceConfig, negotiated: Config | null = null): unknown {
  const empty = EMPTY_IS_UNDEFINED.has(def.type as string) ? undefined : '';
  if (!rawConfig) return empty;

  // Virtual fields derive their value from raw config (explicit user state).
  if (def.virtual && def.resolveVirtual) return def.resolveVirtual(rawConfig);

  // Raw config for template/action/custom_theme_editor (a half-typed row must
  // not vanish) and entity (a feature's negotiated one may be its tile's).
  const config =
    negotiated && def.name !== 'entity' && !['template', 'action', 'custom_theme_editor'].includes(def.type)
      ? negotiated
      : rawConfig;

  const { parentKey, childKey } = splitFieldName(def.name);
  const key = def.target ?? def.name;
  const fallback = fallbackOf(def, config, empty);

  const val = childKey !== null ? config[parentKey]?.[childKey] : config[key];
  return val !== undefined ? val : fallback;
}

export { resolveValue, splitFieldName };
