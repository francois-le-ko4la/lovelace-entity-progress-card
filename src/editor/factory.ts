/*
 * EditorFactory: builds the field-definition tree
 * (general/content/theme/interactions sections) that EditorBase renders, per
 * card type (card/badge/template/badgeTemplate).
 */

import {
  CARD,
  HA_CONTEXT,
  MIN_VALUE_ENTITY_PATH,
  MAX_VALUE_ENTITY_PATH,
  WATERMARK_ENTITY_PATHS,
  ALERT_ABOVE_ENTITY_PATH,
  ALERT_BELOW_ENTITY_PATH,
} from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { HassProviderSingleton } from '../utils/hass-provider.js';
import type { LovelaceConfig, Config } from '../utils/types.js';
import { parseLength, serializeLength, convertLengthValue } from '../utils/length.js';
import { parseDuration, serializeDuration } from '../utils/duration.js';
import {
  statusLabelObj,
  rewrapStatusLabel,
  isMarkOverride,
  SCHEMA_DEFAULTS,
  schemaOptions,
  DENSITY_COMPACT_BAR_POSITIONS,
  DENSITY_MODES,
  type SchemaVariant,
  type WatermarkMark,
} from '../card/schema.js';

// hide's chips in the order the editor shows them; the set itself comes from
// the schema (see hideChipsItems).
// Hiding a component takes its own settings with it: nothing left to paint on
// is nothing left to configure. One table rather than forty scattered showIf
// clauses - the rule reads at a glance, and a new field joins it in one line.
//
// Static `hide` only. A Jinja one can flip on any push and its result is
// unknowable here, so it never gates anything: those fields must stay
// reachable. Same static/dynamic split as ViewCore.isStaticallyHidden, which
// is what decides whether the markup is dropped or merely hidden.
//
// What is deliberately NOT here: anything that also feeds the number. A hidden
// bar still leaves bar_stack, center_zero, bar_scale and min/max deciding what
// the value reads, and `theme` still colours the icon. Showing an inert field
// is a nuisance; hiding one that still does something is a bug.
const ICON_FIELDS = [
  'icon',
  'color',
  'icon_animation',
  'icon_animation_mode',
  'icon_animation_jinja',
  'force_circular_background_mode',
  // The badge lives inside the icon section (StructureElements.iconSection),
  // and the icon's own gestures have nothing left to aim at.
  'badge.toggle',
  'badge_icon',
  'badge.color_toggle',
  'badge_color',
  'icon_tap_action',
  'icon_hold_action',
  'icon_double_tap_action',
];
const VALUE_FIELDS = ['value_compact', 'value_sign', 'decimal'];
const UNIT_FIELDS = ['unit', 'unit_position', 'unit_spacing'];
const BAR_FIELDS = [
  'bar_group',
  'bar_position',
  'bar_orientation',
  'bar_size',
  'bar_color',
  'bar_color_mode',
  'bar_segments',
  'bar_single_line',
  'text_shadow',
  'interpolate',
  'bar_max_width_toggle',
  'bar_max_width',
  'bar_max_width_custom',
  'bar_max_width_unit',
  'bar_effect_mode',
  'bar_effect_chips',
  'bar_effect',
  'reverse_secondary_info_row',
];

const HIDE_DEPENDENTS: Record<string, string[]> = {
  icon: ICON_FIELDS,
  shape: ['force_circular_background_mode'],
  name: ['name', 'name_info'],
  value: VALUE_FIELDS,
  unit: UNIT_FIELDS,
  // The whole group goes, so everything printed inside it goes too.
  secondary_info: [...VALUE_FIELDS, ...UNIT_FIELDS, 'state_content', 'custom_info', 'reverse_secondary_info_row'],
  // Marks are painted ON the bar - watermark and peak_marker leave with it.
  progress_bar: BAR_FIELDS,
};

// field name -> the hide targets that leave it nothing to do.
const HIDE_GATES = new Map<string, string[]>();
for (const [target, fields] of Object.entries(HIDE_DEPENDENTS)) {
  for (const field of fields) HIDE_GATES.set(field, [...(HIDE_GATES.get(field) ?? []), target]);
}
// watermark.* / peak_marker.* are dozens of fields under two prefixes - matched
// rather than listed, so a new mark option is covered the day it is written.
const BAR_MARK_PREFIXES = ['watermark.', 'watermark_', 'peak_marker.', 'peak_marker_'];

const hidesAny = (config: LovelaceConfig, targets: string[]) =>
  is.array(config.hide) && targets.some((target) => config.hide.includes(target));

const gateOnHide = <T extends Record<string, { fields: Record<string, unknown> }>>(tree: T): T => {
  for (const section of Object.values(tree)) {
    for (const [name, field] of Object.entries(section.fields)) {
      const targets = BAR_MARK_PREFIXES.some((prefix) => name.startsWith(prefix))
        ? ['progress_bar']
        : HIDE_GATES.get(name);
      if (!targets) continue;
      const def = field as { showIf?: (c: LovelaceConfig, n: Config) => boolean };
      const own = def.showIf;
      def.showIf = (c: LovelaceConfig, n: Config) => !hidesAny(c, targets) && (own ? own(c, n) : true);
    }
  }
  return tree;
};

// One literal per section title: build()/buildFeature()/buildMulti() each
// name the same handful.
const TITLE = {
  content: 'editor.title.content',
  theme: 'editor.title.theme',
  watermark: 'editor.title.watermark',
  peakMarker: 'editor.title.peak_marker',
  indicators: 'editor.title.indicators',
  alerts: 'editor.title.alerts',
  layout: 'editor.title.layout',
  interaction: 'editor.title.interaction',
} as const;

// The panels markers() splits into, in the order it returns them - the one
// list buildMultiRow reads to carry them over.
const MARKER_SECTIONS = ['watermark', 'peak_marker', 'indicators', 'alerts'] as const;
// What a Multi Feature row has no schema for (YamlSchemaFactory.multiFeatureRow
// deletes trend_indicator/status_label/badge_*/alert_when): a 42px slice has no
// corner to annotate, no frame to color and no pill to light up.
const FEATURE_ROW_DROPPED_SECTIONS: readonly string[] = ['indicators', 'alerts'];

// A variant with none of a family's fields gets no panel rather than an empty
// one (a Badge has no peak marker, a Feature has no alert).
const nonEmptySections = <T extends Record<string, { fields: Record<string, unknown> }>>(sections: T): T =>
  Object.fromEntries(Object.entries(sections).filter(([, def]) => Object.keys(def.fields).length > 0)) as T;

// Which schema variant validates a plain card/badge/template editor - the
// dropdown lists and hide chips read their options off it. Out of theme()'s
// own body, where it was four inline branches of cognitive load.
const cardVariant = (template: boolean, badge: boolean): SchemaVariant =>
  badge ? (template && 'badgeTemplate') || 'badge' : (template && 'template') || 'card';

const HIDE_DISPLAY_ORDER = ['icon', 'shape', 'name', 'value', 'unit', 'secondary_info', 'progress_bar'];

// The two densities that collapse the card to a single row, and so leave
// multiline nothing to wrap onto.
const DENSITY_SINGLE_ROW = ['compact', 'single_line'];

// Field definitions are heterogeneous option bags (showIf/resolveVirtual/
// onVirtualChange/width/target/... vary per field) - kept as `Record<string,
// any>` rather than one interface trying to cover every combination
// EditorBase/EditorDOMHelper actually consume.
const field =
  (type: string) =>
  (name: string, o: Record<string, unknown> = {}) => ({ name, type, ...o });

// Subtraction with a tripwire: a field that isn't there any more means the
// card moved or renamed it, and a silent no-op would quietly hand a Multi row
// an option its schema rejects on save. Loud is the point.
const dropFields = <S extends { fields: Record<string, unknown> }>(section: S, keys: string[]): S => {
  const fields = { ...section.fields };
  for (const key of keys) {
    if (!(key in fields)) throw new Error(`buildMultiRow: no field named ${key} to drop`);
    delete fields[key];
  }
  return { ...section, fields };
};

const EditorFieldsType = {
  entity: field('entity'),
  entityName: field('entity_name'),
  stateContent: field('state_content'),
  text: field('text'),
  number: field('number'),
  slider: field('slider'),
  decimal: field('decimal'),
  toggle: field('toggle'),
  tpl: field('template'),
  action: field('action'),
  select: (name: string, o: Record<string, unknown> = {}) => ({ name, type: name, ...o }),
  templateOrType: (name: string, template: boolean, type: string, o: Record<string, unknown> = {}) =>
    field(template ? 'template' : type)(name, o),
  sectionLabel: field('section_label'),
};

// The 5 master toggles (watermark/peak_marker/badge/status_label/alert_when)
// render as an Enabled/Disabled pill instead of a plain switch - visually
// distinct from the plain toggles nested under them once on. The three that
// own a whole panel pass noLabel: their panel title already names them.
const enabledToggleField = (
  name: string,
  resolveEnabled: (c: LovelaceConfig) => boolean,
  onChange: (enabled: boolean, config: LovelaceConfig) => LovelaceConfig,
  extra: Record<string, unknown> = {},
) => ({
  [name]: {
    name,
    type: 'enabled_toggle',
    virtual: true,
    resolveVirtual: (c: LovelaceConfig) => (resolveEnabled(c) ? 'enabled' : 'disabled'),
    onVirtualChange: (value: 'enabled' | 'disabled', config: LovelaceConfig) => onChange(value === 'enabled', config),
    ...extra,
  },
});

// Standard/entity/Jinja: a 2-state toggle can't express three mutually
// exclusive shapes of one value (min_value/max_value below, watermark.low/
// high and alert_when.above/below via nestedValueField). The mode left
// behind is stashed in its own `_..._draft` key and restored when
// re-entered; `read`/`write` are the only per-call-site difference.
const valueModeField = (
  modeType: string,
  read: (c: LovelaceConfig) => unknown,
  write: (c: LovelaceConfig, value: unknown) => Record<string, unknown>,
  draftPrefix: string,
  opts: { showIf?: (c: LovelaceConfig) => boolean; standardDefault?: number } = {},
) => {
  const numberDraftKey = `_${draftPrefix}_number_draft`;
  const entityDraftKey = `_${draftPrefix}_entity_draft`;
  const jinjaDraftKey = `_${draftPrefix}_jinja_draft`;
  return {
    [modeType]: {
      name: modeType,
      type: modeType,
      virtual: true,
      ...(opts.showIf && { showIf: opts.showIf }),
      resolveVirtual: (c: LovelaceConfig) => {
        const current = read(c) as { jinja?: string } | undefined;
        return is.nonEmptyString(current?.jinja) ? 'jinja' : is.plainObject(current) ? 'entity' : 'standard';
      },
      onVirtualChange: (mode: 'entity' | 'jinja' | 'standard', config: LovelaceConfig) => {
        const current = read(config) as { jinja?: string } | number | undefined;
        // Whatever `current` already is gets stashed into its own draft
        // slot before switching away - the mode not being entered keeps (or
        // refreshes) its draft, the one being entered consumes its own.
        const numberDraft = is.number(current) ? current : config[numberDraftKey];
        const entityDraft =
          is.plainObject(current) && !is.nonEmptyString(current?.jinja) ? current : config[entityDraftKey];
        const jinjaDraft =
          is.plainObject(current) && is.nonEmptyString(current?.jinja) ? current.jinja : config[jinjaDraftKey];
        if (mode === 'entity') {
          return {
            ...config,
            ...write(config, entityDraft ?? { entity: '' }),
            [numberDraftKey]: numberDraft,
            [entityDraftKey]: undefined,
            [jinjaDraftKey]: jinjaDraft,
          };
        }
        if (mode === 'jinja') {
          return {
            ...config,
            ...write(config, jinjaDraft ? { jinja: jinjaDraft } : { jinja: '{{ }}' }),
            [numberDraftKey]: numberDraft,
            [jinjaDraftKey]: undefined,
            [entityDraftKey]: entityDraft,
          };
        }
        return {
          ...config,
          ...write(config, numberDraft ?? opts.standardDefault),
          [numberDraftKey]: undefined,
          [entityDraftKey]: entityDraft,
          [jinjaDraftKey]: jinjaDraft,
        };
      },
    },
  };
};

// Shared by min_value/max_value below: both share the exact same explicit
// shape (number (legacy) | { entity, attribute } | { jinja }, see schema.ts
// and config-helpers.js's checkValueConfig) and, unlike watermark.low/high
// (see wmSide below), sit at the top level of the config - one dot-path deep
// at most - so entity/attribute/jinja can stay plain dot-path fields instead
// of virtual ones.
const valueField = (
  key: 'min_value' | 'max_value',
  entityPath: string,
  numberOverrides: Record<string, unknown> = {},
) => {
  const modeType = `${key}_mode`;
  const attrType = `${key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())}Attribute`;
  return {
    ...valueModeField(
      modeType,
      (c) => c[key],
      (c, v) => ({ [key]: v }),
      key,
    ),
    [key]: EditorFieldsType.number(key, { showIf: (c: LovelaceConfig) => !is.plainObject(c[key]), ...numberOverrides }),
    [entityPath]: EditorFieldsType.entity(entityPath, {
      noLabel: true,
      showIf: (c: LovelaceConfig) => is.plainObject(c[key]) && !is.nonEmptyString(c[key].jinja),
    }),
    [`${key}.attribute`]: EditorFieldsType.select(`${key}.attribute`, {
      type: attrType,
      selectorOf: entityPath,
      labelKey: 'attribute',
      showIf: (c: LovelaceConfig) => is.plainObject(c[key]) && is.nonEmptyString(c[key].entity),
    }),
    [`${key}.jinja`]: EditorFieldsType.tpl(`${key}.jinja`, {
      noLabel: true,
      helper: true,
      helperKey: 'returns_number',
      showIf: (c: LovelaceConfig) => is.nonEmptyString(c[key]?.jinja),
    }),
  };
};

const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

// Shared by watermark.low/high and alert_when.above/below.
const nestedValueField = (
  parentKey: string,
  key: string,
  entityPath: string,
  isEnabled: (c: LovelaceConfig) => boolean,
  defaultVal?: number,
  nestedUnder?: string,
  // eslint-disable-next-line max-params -- 4 required + 2 defaulted trailing.
) => {
  // Dot form: slots this virtual field's own translation next to its sibling
  // low_toggle/above, same parentKey.key group - not an untied flat key.
  const modeType = `${parentKey}.${key}_mode`;
  const attrType = `${toCamel(parentKey)}${key.charAt(0).toUpperCase() + key.slice(1)}Attribute`;
  const entityFieldName = `${parentKey}.${key}_entity`;
  // readValue/writeValue: with nestedUnder (watermark.low/.high - the value
  // sits one level deeper than alert_when.above/.below's, wrapped alongside
  // as/opacity/color siblings, see types.watermarkMark), a short-form value
  // (no wrapper) still reads fine, but every write settles into the wrapped
  // form from then on, preserving whatever siblings already exist.
  // isMarkOverride (not a bare nestedUnder-in-raw check): the only real
  // caller here is watermark, and an override object with no `value` set
  // yet (type/color touched first) must still read/write as one - see
  // schema.ts's own isMarkOverride comment for why the naive check broke it.
  const readValue = (c: LovelaceConfig): unknown => {
    const raw = c[parentKey]?.[key];
    if (!nestedUnder) return raw;
    return isMarkOverride(raw as WatermarkMark) ? (raw as Record<string, unknown>)[nestedUnder] : raw;
  };
  const writeValue = (c: LovelaceConfig, newValue: unknown) => {
    if (!nestedUnder) return { ...c[parentKey], [key]: newValue };
    const raw = c[parentKey]?.[key];
    const wrapper = isMarkOverride(raw as WatermarkMark) ? raw : {};
    return { ...c[parentKey], [key]: { ...wrapper, [nestedUnder]: newValue } };
  };
  const ent = (c: LovelaceConfig) =>
    is.plainObject(readValue(c)) && !is.nonEmptyString((readValue(c) as { jinja?: string })?.jinja);
  const tpl = (c: LovelaceConfig) => is.nonEmptyString((readValue(c) as { jinja?: string } | undefined)?.jinja);
  return {
    ...valueModeField(modeType, readValue, (c, v) => ({ [parentKey]: writeValue(c, v) }), `${parentKey}_${key}`, {
      showIf: isEnabled,
      standardDefault: defaultVal,
    }),
    [`${parentKey}.${key}`]: EditorFieldsType.number(`${parentKey}.${key}`, {
      showIf: (c: LovelaceConfig) => isEnabled(c) && !is.plainObject(readValue(c)),
      // defaultVal is only ever a real number for watermark (alert_when's own
      // above/below have none) - shows once the mark has no explicit value.
      ...(is.number(defaultVal) && { placeholder: () => String(defaultVal) }),
      // nestedUnder only: parentKey.key is now 2 levels past the value (see
      // writeValue) - past what the generic dot-path field resolves, so this
      // goes through the same virtual read/write as every other field here.
      ...(nestedUnder && {
        virtual: true,
        resolveVirtual: (c: LovelaceConfig) => (is.number(readValue(c)) ? readValue(c) : ''),
        onVirtualChange: (value: number, config: LovelaceConfig) => ({
          ...config,
          [parentKey]: writeValue(config, value),
        }),
      }),
    }),
    [entityFieldName]: EditorFieldsType.entity(entityFieldName, {
      virtual: true,
      noLabel: true,
      showIf: (c: LovelaceConfig) => isEnabled(c) && ent(c),
      resolveVirtual: (c: LovelaceConfig) => (readValue(c) as { entity?: string } | undefined)?.entity ?? '',
      onVirtualChange: (value: string, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: writeValue(config, value ? { ...(readValue(config) as object), entity: value } : defaultVal),
      }),
    }),
    [`${parentKey}.${key}_attribute`]: EditorFieldsType.select(`${parentKey}.${key}_attribute`, {
      type: attrType,
      virtual: true,
      selectorOf: entityPath,
      labelKey: 'attribute',
      showIf: (c: LovelaceConfig) =>
        isEnabled(c) && ent(c) && is.nonEmptyString((readValue(c) as { entity?: string })?.entity),
      resolveVirtual: (c: LovelaceConfig) => (readValue(c) as { attribute?: string } | undefined)?.attribute ?? '',
      onVirtualChange: (value: string, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: writeValue(config, { ...(readValue(config) as object), attribute: value || undefined }),
      }),
    }),
    // Virtual (not a plain dot-path field): the template string lives 2 levels
    // deep (<parentKey>.<key>.jinja, one more with nestedUnder), past what the
    // generic nested-field machinery (#resolveValue/#handleNestedField)
    // resolves — this reads/writes that path directly.
    [`${parentKey}_${key}_jinja`]: EditorFieldsType.tpl(`${parentKey}_${key}_jinja`, {
      noLabel: true,
      virtual: true,
      helper: true,
      helperKey: 'returns_number',
      showIf: (c: LovelaceConfig) => isEnabled(c) && tpl(c),
      resolveVirtual: (c: LovelaceConfig) => (readValue(c) as { jinja?: string } | undefined)?.jinja ?? '',
      onVirtualChange: (value: string, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: writeValue(config, { jinja: value }),
      }),
    }),
  };
};

// Cascades a watermark-level field (type/opacity/color) from low/high's own
// override down to the shared global value - same fallback the runtime
// itself applies (see schema.ts's markType/markOpacity/markColor).
const watermarkEffective = (config: LovelaceConfig, side: 'low' | 'high', field: CascadeField) => {
  const mark = config.watermark?.[side] as WatermarkMark;
  const own = isMarkOverride(mark) ? mark[field] : undefined;
  return own ?? config.watermark?.[field];
};

// Every attribute a mark can override on its parent. Not all of them exist on
// both families - each adapter declares its own list below - but the machinery
// is the same for all: read own, fall back to the parent's, factorise back up
// once every mark agrees.
type CascadeField = 'type' | 'opacity' | 'color' | 'as' | 'line_size';

// One cascading attribute: which input builds it, and which label it borrows.
// `labelKey` defaults to the field's own name, which is also its translation
// key - the two that differ say so.
type CascadeSpec = {
  field: CascadeField;
  build: (name: string, opts: Record<string, unknown>) => Record<string, unknown>;
  opts?: Record<string, unknown>;
  labelKey?: string;
  placeholder?: boolean;
  // A select has no greyed placeholder to show what it inherits with - left
  // empty it reads as "unset" while the card draws the default. Spells the
  // inherited value out as a real one instead.
  showsDefault?: boolean;
  // An extra condition on top of the mark's own enabled gate. Only line_size
  // has one (a thickness means nothing on a mark that isn't drawn as a line),
  // and it needs the adapter to answer for the right mark - hence a factory,
  // not a plain predicate.
  gate?: <K extends string>(adapter: OverrideCascadeAdapter<K>, key: K | null) => (config: LovelaceConfig) => boolean;
  // Which half of a mark's block the field belongs to: 'value' is how its
  // threshold is read and sits with the threshold itself, 'look' is how it is
  // drawn. Both builders render one section at a time.
  section?: 'value' | 'look';
};

// Everything that differs between watermark's low/high sides and peak_marker's
// min/max/average marks - the field machinery below is shared verbatim.
type OverrideCascadeAdapter<K extends string> = {
  parentKey: string;
  keys: readonly K[];
  extractOwn: (rawMark: unknown, field: CascadeField) => unknown;
  rewrap: (key: K, rawMark: unknown, patch: Record<string, unknown>) => unknown;
  // A key's value for `field` once its own override and the parent's global
  // value have been resolved in that order.
  effective: (config: LovelaceConfig, key: K, field: CascadeField) => unknown;
  defaults: Record<string, unknown>;
  // A hidden mark has no opinion: peak_marker's three are shown one at a time
  // as often as not, and counting an absent one as "disagrees" kept every
  // value stuck on its own mark, global side empty.
  isActive: (config: LovelaceConfig, key: K) => boolean;
  // What this family lets a mark override. watermark has `as` (its thresholds
  // are user-supplied, so how to read them is a choice); peak_marker's come
  // from history and have nothing to interpret.
  cascade: readonly CascadeSpec[];
};

// The marks the cascade answers to: a hidden one is left exactly as it is,
// both as a voter and as a value to rewrite (`false` through rewrap would
// come back shown).
const activeKeys = <K extends string>(adapter: OverrideCascadeAdapter<K>, config: LovelaceConfig): K[] =>
  adapter.keys.filter((k) => adapter.isActive(config, k));

// Once every shown key explicitly overrides `field` away from the shared
// global value, nothing reads the global one anymore - dropped so the YAML
// doesn't carry a dead default around.
const pruneGlobalOverride = <K extends string>(
  adapter: OverrideCascadeAdapter<K>,
  config: LovelaceConfig,
  field: CascadeField,
): LovelaceConfig => {
  const { parentKey, extractOwn } = adapter;
  const globalVal = config[parentKey]?.[field];
  if (globalVal === undefined) return config;
  const active = activeKeys(adapter, config);
  const diverges = (k: K) => {
    const own = extractOwn(config[parentKey]?.[k], field);
    return own !== undefined && own !== globalVal;
  };
  if (active.length === 0 || active.some((k) => !diverges(k))) return config;
  return { ...config, [parentKey]: { ...config[parentKey], [field]: undefined } };
};

// Opposite direction: once two or more shown keys explicitly agree on the same
// value, it moves to the global field and each of them drops its own (the
// adapter's own `rewrap` cleans the now-undefined key out). A single shown
// mark keeps its value where it is - nothing to share it with yet, and
// hoisting it would silently pre-color the next mark switched on.
const factorizeGlobalOverride = <K extends string>(
  adapter: OverrideCascadeAdapter<K>,
  config: LovelaceConfig,
  field: CascadeField,
): LovelaceConfig => {
  const { parentKey, extractOwn, rewrap } = adapter;
  const active = activeKeys(adapter, config);
  if (active.length < 2) return config;
  const values = active.map((k) => extractOwn(config[parentKey]?.[k], field));
  const [shared] = values;
  if (shared === undefined || values.some((v) => v !== shared)) return config;
  const patched = Object.fromEntries(active.map((k) => [k, rewrap(k, config[parentKey]?.[k], { [field]: undefined })]));
  return { ...config, [parentKey]: { ...config[parentKey], ...patched, [field]: shared } };
};

// A greyed hint only helps if it is what the field would actually use: the
// value inherited from just above, not the schema's own default two levels up.
const inheritedHint = (value: unknown): string => (value === undefined ? '' : String(value));

// What a mark is drawn as, its own override and the family's global value
// resolved in that order - `null` asks the family itself, which answers for
// whichever of its shown marks draws a line.
const drawsLine = <K extends string>(adapter: OverrideCascadeAdapter<K>, key: K | null) => {
  const typeOf = (c: LovelaceConfig, k: K) => adapter.effective(c, k, 'type') ?? adapter.defaults.type;
  return (c: LovelaceConfig) =>
    key === null ? activeKeys(adapter, c).some((k) => typeOf(c, k) === 'line') : typeOf(c, key) === 'line';
};

// The look (or value) fields a single mark can override, each cascading to the
// parent's own global value - identical for watermark and peak_marker.
const overrideCascadeFields = <K extends string>(
  adapter: OverrideCascadeAdapter<K>,
  key: K,
  isEnabled: (c: LovelaceConfig) => boolean,
  section: 'value' | 'look',
) => {
  const build = ({
    field,
    build: fieldDef,
    opts: fieldOpts = {},
    labelKey,
    placeholder = true,
    showsDefault,
    gate,
  }: CascadeSpec) => {
    const extra = gate?.(adapter, key);
    return fieldDef(`${adapter.parentKey}.${key}_${field}`, {
      ...fieldOpts,
      virtual: true,
      showIf: (c: LovelaceConfig) => isEnabled(c) && (!extra || extra(c)),
      width: 'half',
      // The same generic word for every mark (Type/Opacity/Color), like the
      // parent-level trio: which mark it is shows in the group, not the label.
      labelKey: labelKey ?? field,
      // Shows what this mark inherits while it overrides nothing - the global
      // value if the family has one, the schema default otherwise.
      ...(placeholder && {
        placeholder: (c: LovelaceConfig) => inheritedHint(c[adapter.parentKey]?.[field] ?? adapter.defaults[field]),
      }),
      resolveVirtual: (c: LovelaceConfig) =>
        adapter.effective(c, key, field) ?? (showsDefault ? adapter.defaults[field] : undefined),
      onVirtualChange: (value: unknown, config: LovelaceConfig) => {
        const patched = {
          ...config,
          [adapter.parentKey]: {
            ...config[adapter.parentKey],
            [key]: adapter.rewrap(key, config[adapter.parentKey]?.[key], { [field]: value }),
          },
        };
        return pruneGlobalOverride(adapter, factorizeGlobalOverride(adapter, patched, field), field);
      },
    });
  };
  return Object.fromEntries(
    adapter.cascade
      .filter((spec) => (spec.section ?? 'look') === section)
      .map((spec) => [`${adapter.parentKey}.${key}_${spec.field}`, build(spec)]),
  );
};

// The trio every mark family shares, spelled once. Each adapter appends its
// own extras rather than restating these.
const SHARED_CASCADE = (selectType: string): CascadeSpec[] => [
  { field: 'type', build: EditorFieldsType.select, opts: { type: selectType }, showsDefault: true },
  // Only exists for a mark drawn as a line; the row it shares with type closes
  // itself when it goes (see EDITOR_BASE_STYLE).
  { field: 'line_size', build: EditorFieldsType.text, gate: drawsLine },
  { field: 'opacity', build: EditorFieldsType.decimal, opts: { type: 'opacity' } },
  {
    field: 'color',
    build: (name, opts) => EditorFieldsType.templateOrType(name, false, 'color', opts),
    labelKey: 'mark_color',
  },
];

// Per-mark show/hide toggle: the hidden value is parked in an ephemeral draft
// and restored on the way back, same as every other draft in this file.
const markToggleField = <K extends string>(
  adapter: OverrideCascadeAdapter<K>,
  key: K,
  gate: (c: LovelaceConfig) => boolean,
  isShown: (c: LovelaceConfig) => boolean,
  shownValue: unknown,
) => {
  const { parentKey } = adapter;
  const toggleKey = `${parentKey}.${key}_toggle`;
  const draftKey = `_${parentKey}_${key}_hidden_draft`;
  return {
    [toggleKey]: EditorFieldsType.toggle(toggleKey, {
      virtual: true,
      showIf: gate,
      resolveVirtual: isShown,
      onVirtualChange: (value: boolean, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: { ...config[parentKey], [key]: value ? (config[draftKey] ?? shownValue) : false },
        [draftKey]: value ? undefined : config[parentKey]?.[key],
      }),
    }),
  };
};

// The global value every mark's own override cascades from - built from the
// same cascade declaration, one level up, so a family that gains an attribute
// gains both levels at once.
const globalMarkFields = <K extends string>(
  adapter: OverrideCascadeAdapter<K>,
  showIf: (c: LovelaceConfig) => boolean,
  section: 'value' | 'look',
) => {
  const { parentKey, defaults } = adapter;
  return Object.fromEntries(
    adapter.cascade
      .filter((spec) => (spec.section ?? 'look') === section)
      .map((spec) => {
        const extra = spec.gate?.(adapter, null);
        return [
          `${parentKey}.${spec.field}`,
          spec.build(`${parentKey}.${spec.field}`, {
            ...spec.opts,
            // The same generic word at both levels (Type/Opacity/Color/Line
            // size): which mark it is shows in the group, not the label.
            labelKey: spec.labelKey ?? spec.field,
            showIf: (c: LovelaceConfig) => showIf(c) && (!extra || extra(c)),
            width: 'half',
            // Same reason as the marks' own selects: watermark.type has no
            // schema default to fall back on (see schema.ts's watermarkSchema),
            // so the negotiated config leaves it empty and only `default`
            // fills it in.
            ...(spec.showsDefault && { default: () => defaults[spec.field] }),
            ...(spec.placeholder !== false && { placeholder: () => inheritedHint(defaults[spec.field]) }),
          }),
        ];
      }),
  );
};

// Master on/off for an option parked in an ephemeral `_<key>_draft` while off.
// `initial` is a factory: each card gets its own object, never a shared one.
const draftToggle =
  (key: string, initial: () => unknown) =>
  (value: boolean, config: LovelaceConfig): LovelaceConfig => {
    const draftKey = `_${key}_draft`;
    return {
      ...config,
      [key]: value ? config[draftKey] || initial() : undefined,
      [draftKey]: value ? undefined : (config[key] ?? config[draftKey]),
    };
  };

// Drops a patched key when undefined (rewrapPeakMark's precedent), and wraps
// a bare `true` mark as `{ value: defaultVal, ...patch }` - `true` itself
// isn't a valid ValueConfig once nested under `value`.
const rewrapMark = (mark: unknown, patch: Record<string, unknown>, defaultVal: number): unknown => {
  const markAsWm = mark as WatermarkMark;
  const value = is.boolean(mark) ? defaultVal : mark;
  const merged: Record<string, unknown> = { ...(isMarkOverride(markAsWm) ? markAsWm : { value }), ...patch };
  return Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined));
};

const WM_SIDES = ['low', 'high'] as const;
const WM_DEFAULTS: Record<(typeof WM_SIDES)[number], number> = {
  low: SCHEMA_DEFAULTS.watermark.low,
  high: SCHEMA_DEFAULTS.watermark.high,
};
const WATERMARK_CASCADE: OverrideCascadeAdapter<(typeof WM_SIDES)[number]> = {
  parentKey: 'watermark',
  keys: WM_SIDES,
  extractOwn: (rawMark, field) => {
    const mark = rawMark as WatermarkMark;
    return isMarkOverride(mark) ? mark[field] : undefined;
  },
  rewrap: (side, rawMark, patch) => rewrapMark(rawMark, patch, WM_DEFAULTS[side]),
  effective: watermarkEffective,
  isActive: (config, side) => config.watermark?.[side] !== false,
  defaults: SCHEMA_DEFAULTS.watermark,
  cascade: [
    ...SHARED_CASCADE('watermark_type'),
    // watermark's own: how to read a threshold the user typed. Borrows
    // 'unit' as its label, as its hand-built predecessor did.
    // Not a look: it says how the threshold next to it is read, so it sits
    // with the threshold rather than among the drawing options.
    {
      field: 'as',
      build: EditorFieldsType.select,
      opts: { type: 'watermark_as' },
      labelKey: 'unit',
      showsDefault: true,
      section: 'value',
    },
  ],
};

// watermark.low/high are now types.watermarkMark: false (hidden) | value |
// { value, as, type, opacity, color } - `false` replaces disable_low/high.
// type/opacity/color each cascade from the matching global watermark.*
// field (see themeWatermarkFields) until a side explicitly overrides it.
const wmSide = (side: 'low' | 'high', defaultVal: number) => {
  const entityPath = WATERMARK_ENTITY_PATHS[side];
  const isShown = (c: LovelaceConfig) => WATERMARK_CASCADE.isActive(c, side);
  const isEnabled = (c: LovelaceConfig) => Boolean(c.watermark) && isShown(c);
  return {
    ...markToggleField(WATERMARK_CASCADE, side, (c: LovelaceConfig) => Boolean(c.watermark), isShown, defaultVal),
    ...nestedValueField('watermark', side, entityPath, isEnabled, defaultVal, 'value'),
    ...overrideCascadeFields(WATERMARK_CASCADE, side, isEnabled, 'value'),
    ...overrideCascadeFields(WATERMARK_CASCADE, side, isEnabled, 'look'),
  };
};

// Mirrors _fetchHistory's own eligibility check (cards.ts): sensor/number
// only, no attribute override, not timer/counter/duration - recorder keeps
// no attribute history and those domains/device_class have no numeric trend.
const peakMarkerEligible = (c: LovelaceConfig): boolean => {
  if (!is.nonEmptyString(c.entity) || is.nonEmptyString(c.attribute)) return false;
  const domain = HassProviderSingleton.getEntityDomain(c.entity);
  if (domain === 'timer' || domain === 'counter') return false;
  return (
    HassProviderSingleton.getInstance().getEntityProp(c.entity, 'device_class') !== HA_CONTEXT.entity.type.duration
  );
};

// peak_marker.min/max/average: boolean | string (color shorthand) | { type?,
// opacity?, color? } (types.peakMark, schema.ts) - simpler than wmSide, no
// entity/jinja/value, just a show toggle + overrides cascading from the
// global peak_marker.type/.opacity (mirrors view.ts's resolve()).
const peakMarkObj = (mark: unknown): Record<string, unknown> =>
  is.plainObject(mark) ? mark : is.string(mark) ? { color: mark } : {};

// Collapses to the simplest equivalent shape - color alone stays the string
// shorthand (types.peakMark()'s own short form), nothing left reverts to
// bare `true` (shown, all defaults).
const rewrapPeakMark = (mark: unknown, patch: Record<string, unknown>): unknown => {
  const merged: Record<string, unknown> = { ...peakMarkObj(mark), ...patch };
  const keys = Object.keys(merged).filter((k) => merged[k] !== undefined);
  if (keys.length === 0) return true;
  if (keys.length === 1 && keys[0] === 'color') return merged.color;
  return merged;
};

const peakMarkEffective = (config: LovelaceConfig, mark: 'min' | 'max' | 'average', field: CascadeField) =>
  peakMarkObj(config.peak_marker?.[mark])[field] ?? config.peak_marker?.[field];

const PEAK_MARKS = ['min', 'max', 'average'] as const;
const PEAK_MARKER_CASCADE: OverrideCascadeAdapter<(typeof PEAK_MARKS)[number]> = {
  parentKey: 'peak_marker',
  keys: PEAK_MARKS,
  extractOwn: (rawMark, field) => peakMarkObj(rawMark)[field],
  rewrap: (_mark, rawMark, patch) => rewrapPeakMark(rawMark, patch),
  effective: peakMarkEffective,
  isActive: (config, mark) => {
    const raw = config.peak_marker?.[mark];
    return raw !== undefined && raw !== false;
  },
  defaults: SCHEMA_DEFAULTS.peakMarker,
  // No `as`: a peak's value comes from history, there is no threshold to read
  // one way or the other.
  cascade: SHARED_CASCADE('peak_marker_type'),
};

const peakMark = (mark: 'min' | 'max' | 'average') => {
  const isShown = (c: LovelaceConfig) => PEAK_MARKER_CASCADE.isActive(c, mark);
  const isEnabled = (c: LovelaceConfig) => peakMarkerEligible(c) && Boolean(c.peak_marker) && isShown(c);
  const gate = (c: LovelaceConfig) => peakMarkerEligible(c) && Boolean(c.peak_marker);
  return {
    ...markToggleField(PEAK_MARKER_CASCADE, mark, gate, isShown, true),
    ...overrideCascadeFields(PEAK_MARKER_CASCADE, mark, isEnabled, 'look'),
  };
};

// A duration string ("2h") nested one level under parentKey, as a
// number+unit composite - same slider+dropdown split as lengthField, minus
// the calc()/custom fallback (types.duration only ever produces this shape).
// Shared by peak_marker.window (required) and trend_indicator.window
// (optional, gated by its own reveal toggle) - showIf decides which.
const durationFields = (parentKey: string, key: string, showIf: (c: LovelaceConfig) => boolean) => {
  const fullKey = `${parentKey}.${key}`;
  const parsed = (c: LovelaceConfig) => parseDuration(c[parentKey]?.[key]);
  return {
    [fullKey]: {
      name: fullKey,
      type: (c: LovelaceConfig) => `duration:${parsed(c).unit}`,
      virtual: true,
      labelKey: 'window',
      width: 'grow',
      showIf,
      resolveVirtual: (c: LovelaceConfig) => parsed(c).value,
      onVirtualChange: (value: number, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: { ...config[parentKey], [key]: serializeDuration(value, parsed(config).unit) },
      }),
    },
    [`${fullKey}_unit`]: {
      name: `${fullKey}_unit`,
      type: 'duration_unit',
      virtual: true,
      noLabel: true,
      required: true,
      isInGroup: 'length-unit',
      width: '90px',
      showIf,
      resolveVirtual: (c: LovelaceConfig) => parsed(c).unit,
      onVirtualChange: (unit: string, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: { ...config[parentKey], [key]: serializeDuration(parsed(config).value, unit) },
      }),
    },
  };
};

// alert_when.above/.below - same explicit shape as min_value/max_value/
// watermark.low/high, via the shared nestedValueField above. Unlike
// watermark there's no per-side disable toggle or _as/_color options - just
// the value itself - and no numeric default to fall back to (alert_when.
// above/below are genuinely optional).
// Simple mode only - Advanced mode (alert_when.jinja) replaces above/below
// as the trigger entirely, see alertModeField below.
const isAlertSimple = (c: LovelaceConfig) => Boolean(c.alert_when) && !is.nonEmptyString(c.alert_when?.jinja);

const alertField = (side: 'above' | 'below') => {
  const entityPath = side === 'above' ? ALERT_ABOVE_ENTITY_PATH : ALERT_BELOW_ENTITY_PATH;
  return nestedValueField('alert_when', side, entityPath, isAlertSimple);
};

// Shared master on/off toggle - same draft precedent as status_label_toggle.
const alertToggleField = () => ({
  ...enabledToggleField(
    'alert_when.toggle',
    (c) => Boolean(c.alert_when),
    draftToggle('alert_when', () => ({})),
    { noLabel: true },
  ),
});

// Simple (above/below) vs Advanced (alert_when.jinja) - unlike valueField's
// standard/entity/jinja triad, this swaps which *fields* are shown rather
// than one field's own representation, so above/below/jinja each keep their
// own draft slot restored on the way back into their mode.
const alertModeField = () => {
  const aboveDraftKey = '_alert_when_above_draft';
  const belowDraftKey = '_alert_when_below_draft';
  const jinjaDraftKey = '_alert_when_jinja_draft';
  return {
    trigger: {
      name: 'trigger',
      type: 'trigger',
      virtual: true,
      showIf: (c: LovelaceConfig) => Boolean(c.alert_when),
      resolveVirtual: (c: LovelaceConfig) => (is.nonEmptyString(c.alert_when?.jinja) ? 'advanced' : 'simple'),
      onVirtualChange: (mode: 'simple' | 'advanced', config: LovelaceConfig) => {
        const alert = config.alert_when ?? {};
        const aboveDraft = alert.above !== undefined ? alert.above : config[aboveDraftKey];
        const belowDraft = alert.below !== undefined ? alert.below : config[belowDraftKey];
        const jinjaDraft = is.nonEmptyString(alert.jinja) ? alert.jinja : config[jinjaDraftKey];
        return {
          ...config,
          alert_when:
            mode === 'advanced'
              ? { ...alert, above: undefined, below: undefined, jinja: jinjaDraft || '{{ }}' }
              : { ...alert, above: aboveDraft, below: belowDraft, jinja: undefined },
          [aboveDraftKey]: mode === 'advanced' ? aboveDraft : undefined,
          [belowDraftKey]: mode === 'advanced' ? belowDraft : undefined,
          [jinjaDraftKey]: mode === 'advanced' ? undefined : jinjaDraft,
        };
      },
    },
  };
};

// Auto (the domain's own shape) vs always Forced - an Auto/Forced pill
// rather than a switch, like every other master toggle. Its own field so
// theme() and buildMulti() share one definition.
const circularBackgroundField = () => ({
  force_circular_background_mode: {
    name: 'force_circular_background_mode',
    type: 'force_circular_background_mode',
    target: 'force_circular_background',
    virtual: true,
    resolveVirtual: (c: LovelaceConfig) => (c.force_circular_background ? 'forced' : 'auto'),
    onVirtualChange: (mode: 'auto' | 'forced', config: LovelaceConfig) => ({
      ...config,
      force_circular_background: mode === 'forced',
    }),
  },
});

// center_zero: boolean | {value, growth_percent} - shared by theme() and
// Feature's own build below, no template/badge distinction needed.
const centerZeroFields = () => ({
  center_zero: EditorFieldsType.toggle('center_zero', {
    virtual: true,
    resolveVirtual: (c: LovelaceConfig) => Boolean(c.center_zero),
    onVirtualChange: (value: boolean, config: LovelaceConfig) => ({
      ...config,
      center_zero: value ? (is.plainObject(config.center_zero) ? config.center_zero : true) : false,
    }),
  }),
  center_zero_value: EditorFieldsType.number('center_zero_value', {
    target: 'center_zero',
    showIf: (c: LovelaceConfig) => Boolean(c.center_zero),
    virtual: true,
    resolveVirtual: (c: LovelaceConfig) => (is.plainObject(c.center_zero) ? (c.center_zero.value ?? 0) : 0),
    onVirtualChange: (value: number, config: LovelaceConfig) => {
      const growthPercent = is.plainObject(config.center_zero) ? Boolean(config.center_zero.growth_percent) : false;
      return {
        ...config,
        center_zero: value || growthPercent ? { value: Number(value) || 0, growth_percent: growthPercent } : true,
      };
    },
  }),
  center_zero_growth_percent: EditorFieldsType.toggle('center_zero_growth_percent', {
    target: 'center_zero',
    showIf: (c: LovelaceConfig) => Boolean(c.center_zero),
    virtual: true,
    resolveVirtual: (c: LovelaceConfig) =>
      is.plainObject(c.center_zero) ? Boolean(c.center_zero.growth_percent) : false,
    onVirtualChange: (value: boolean, config: LovelaceConfig) => {
      const currentValue = is.plainObject(config.center_zero) ? (config.center_zero.value ?? 0) : 0;
      return {
        ...config,
        center_zero: currentValue || value ? { value: currentValue, growth_percent: value } : true,
      };
    },
  }),
});

// Simple (array) vs Advanced (Jinja string) toggle, shared by bar_effect_mode
// and hide_mode below - restores whichever shape was left behind via its own
// draft.
const arrayOrJinjaModeField = (key: string) => {
  const modeType = `${key}_mode`;
  const arrayDraftKey = `_${key}_array_draft`;
  const jinjaDraftKey = `_${key}_jinja_draft`;
  return {
    [modeType]: {
      name: modeType,
      type: modeType,
      virtual: true,
      resolveVirtual: (c: LovelaceConfig) => (is.nonEmptyString(c[key]) ? 'advanced' : 'simple'),
      onVirtualChange: (mode: 'simple' | 'advanced', config: LovelaceConfig) => {
        const current = config[key];
        const arrayDraft = is.array(current) ? current : config[arrayDraftKey];
        const jinjaDraft = is.nonEmptyString(current) ? current : config[jinjaDraftKey];
        return {
          ...config,
          [key]: mode === 'advanced' ? jinjaDraft || '{{ }}' : (arrayDraft ?? []),
          [arrayDraftKey]: mode === 'advanced' ? arrayDraft : undefined,
          [jinjaDraftKey]: mode === 'advanced' ? undefined : jinjaDraft,
        };
      },
    },
  };
};

const EditorFactory = {
  general: (template: boolean) => ({
    flat: true,
    fields: {
      entity: EditorFieldsType.entity('entity', { required: !template }),
      // Off by default: a now()/utcnow()-driven Jinja field already gets a
      // free once-a-minute refresh from HA's own render_template push
      // (issue #127) - this opts into a forced resubscribe every second
      // instead, for a real ticking countdown. Not tied to `entity` being a
      // timer. See schema.ts's fast_refresh.
      ...(template && {
        fast_refresh: EditorFieldsType.toggle('fast_refresh', {
          showIf: (c: LovelaceConfig) => Boolean(c.entity),
        }),
      }),
      ...(!template && {
        attribute: EditorFieldsType.select('attribute', {
          type: 'attribute',
          selectorOf: 'entity',
          showIf: (c: LovelaceConfig) => Boolean(c.entity),
        }),
        bar_stack_mode: {
          name: 'bar_stack_mode',
          type: 'bar_stack_mode',
          virtual: true,
          showIf: (c: LovelaceConfig) => is.nonEmptyArray(c.bar_stack?.entities),
          resolveVirtual: (c: LovelaceConfig) => c.bar_stack?.mode ?? 'stacked',
          onVirtualChange: (mode: 'stacked' | 'proportional' | 'net', config: LovelaceConfig) => ({
            ...config,
            bar_stack: { ...config.bar_stack, mode },
          }),
        },
        // CF5 - issue (major) resolved - a flat 'bar_stack' field name meant
        // the generic round-trip resolver (#resolveValue, run on every
        // setConfig - not just this field's own onChange) read config.bar_stack
        // as a whole (the {mode, entities} object, not the array the row
        // editor's `value` setter expects) and reset it to [] on every single
        // re-render, making any just-added row vanish from the editor
        // immediately. The dot-path name routes through the existing generic
        // nested-field read/write (#resolveValue / #handleNestedField) instead,
        // exactly like watermark.low or min_value.attribute - entities are read
        // from and written to bar_stack.entities directly, and bar_stack.mode
        // is left untouched by construction (no custom onChange/onClear needed
        // to preserve it).
        'bar_stack.entities': {
          name: 'bar_stack.entities',
          type: 'bar_stack_editor',
        },
      }),
    },
  }),

  content: (template: boolean, badge: boolean) => ({
    title: TITLE.content,
    icon: HA_CONTEXT.icons.textShort,
    fields: {
      ...(template
        ? {
            name: EditorFieldsType.tpl('name'),
          }
        : {
            name: EditorFieldsType.entityName('name', { context: { entity: 'entity' } }),
            name_info: EditorFieldsType.tpl('name_info', {
              helper: true,
            }),
          }),
      ...(template
        ? {
            secondary: EditorFieldsType.tpl('secondary'),
            // Badge/badgeTemplate opt out (see YamlSchemaFactory's own
            // .delete(['multiline'])): the row is too small for a second line
            // there. density: compact/single_line clear it too (see
            // schema.ts's applyDensityRule).
            ...(!badge
              ? {
                  multiline: EditorFieldsType.toggle('multiline', {
                    showIf: (c: LovelaceConfig) => !DENSITY_SINGLE_ROW.includes(c.density as string),
                  }),
                }
              : {}),
            percent: EditorFieldsType.tpl('percent'),
          }
        : {
            // Two half-half rows. unit/decimal stretch on their own once
            // unit_spacing/unit_position hide with the unit (see
            // EDITOR_BASE_STYLE) - nothing to compute here.
            ...(() => {
              const unitSpacingShown = (c: LovelaceConfig) =>
                !(c.disable_unit || (is.array(c.hide) && c.hide.includes('unit')));
              return {
                unit: EditorFieldsType.text('unit', {
                  width: 'half',
                  placeholder: (_c: LovelaceConfig, neg: Config) => (neg?.resolvedUnit as string) ?? '',
                }),
                unit_position: EditorFieldsType.select('unit_position', {
                  type: 'unit_position',
                  labelKey: 'position',
                  width: 'half',
                  showIf: unitSpacingShown,
                }),
                // disable_unit is deprecated (see
                // BaseConfigHelper.#logDeprecatedOption): 'unit' is now just
                // another hide target, folded into hide by _customizeConfig.
                // The disable_unit check here only matters for a legacy raw
                // config on first load, before that fold has round-tripped
                // through the editor's own config-changed.
                unit_spacing: EditorFieldsType.select('unit_spacing', {
                  type: 'unit_spacing',
                  width: 'half',
                  showIf: unitSpacingShown,
                }),
                decimal: EditorFieldsType.decimal('decimal', {
                  width: 'half',
                  placeholder: (_c: LovelaceConfig, neg: Config) =>
                    neg?.resolvedDecimal == null ? '' : String(neg.resolvedDecimal),
                }),
              };
            })(),
            value_compact: EditorFieldsType.toggle('value_compact'),
            value_sign: EditorFieldsType.toggle('value_sign'),
            // A 2-state toggle can't represent 3 mutually exclusive modes
            // (standard/entity/Jinja) - a single-select chip group replaces
            // the previous pair of toggles, which could both show at once.
            // min_value/max_value's shape is explicit too: a bare number is
            // the fixed value, { entity, attribute }/{ jinja } replace what
            // used to be sniffed at runtime via is.jinja().
            ...valueField('min_value', MIN_VALUE_ENTITY_PATH, {
              default: (c: LovelaceConfig) => (c.center_zero ? -100 : 0),
            }),
            ...valueField('max_value', MAX_VALUE_ENTITY_PATH),
            state_content: EditorFieldsType.stateContent('state_content', { context: { filter_entity: 'entity' } }),
            custom_info: EditorFieldsType.tpl('custom_info', {
              helper: true,
            }),
            // Badge opts out (see YamlSchemaFactory's own
            // .delete(['multiline'])): the row is too small for a second line
            // there. density: compact/single_line clear it too (see
            // schema.ts's applyDensityRule).
            ...(!badge
              ? {
                  multiline: EditorFieldsType.toggle('multiline', {
                    showIf: (c: LovelaceConfig) => !DENSITY_SINGLE_ROW.includes(c.density as string),
                  }),
                }
              : {}),
            reverse: EditorFieldsType.toggle('reverse', {
              showIf: (c: LovelaceConfig) =>
                Boolean(c.entity) && HassProviderSingleton.getEntityDomain(c.entity) === 'timer',
            }),
          }),
    },
  }),

  // A theme is either a preset (dropdown, existing behavior) or a custom set of
  // color zones — ThemeManager.configure() always lets a valid custom_theme win
  // over theme when both happen to be set, so the editor makes that an explicit
  // either/or via mode chips rather than letting the two silently race. Pulled
  // out of theme() itself so that factory's own cognitive complexity doesn't
  // grow with this trio's own ternaries. CF5 - issue (major) resolved -
  // switching modes used to hard-clear the field being left behind (theme when
  // entering custom, custom_theme when leaving it), destroying a
  // carefully-built zone list the moment someone peeked at a preset and came
  // back. The inactive side is now parked in a `_`-prefixed draft (same
  // ephemeral mechanism as _visible_actions) and restored when re-selected.
  themeModeFields: (template: boolean) =>
    template
      ? // Template has no custom_theme (no min_value/max_value to project real-value
        // zones onto) - just the plain select, restricted to percent: true
        // themes (see schema.ts's own theme field and base.ts's
        // theme_percent_only selector).
        {
          theme: {
            name: 'theme',
            type: 'theme_percent_only',
            // Without onClear, #handleStdField writes theme: '' instead of
            // deleting the key - every is.nullish(c.theme) check downstream
            // then reads '' as "a theme IS set", stuck permanently since ''
            // persists across reloads. bar_color_mode goes with it, or the
            // stale value would linger in the saved config.
            onClear: (config: LovelaceConfig) => {
              const rest = { ...config };
              delete rest.theme;
              delete rest.bar_color_mode;
              return rest;
            },
          },
        }
      : {
          theme_mode: {
            name: 'theme_mode',
            type: 'theme_mode',
            labelKey: 'theme',
            virtual: true,
            // is.array (not is.nonEmptyArray): a freshly-entered custom mode
            // starts as an empty [] before the user adds a first zone, and must
            // still read as 'custom'.
            resolveVirtual: (c: LovelaceConfig) => (is.array(c.custom_theme) ? 'custom' : 'preset'),
            onVirtualChange: (mode: 'custom' | 'preset', config: LovelaceConfig) => {
              const wantsCustom = mode === 'custom';
              const nextTheme = wantsCustom ? undefined : (config._theme_draft ?? config.theme);
              // Switching to custom is always "a theme is active" (even an
              // empty just-entered [] counts, see themeActive/resolveVirtual
              // above) - switching to preset only still is if the restored
              // draft actually held a real theme. Neither `theme` nor
              // `custom_theme`'s own onClear runs on this path (both are
              // rewritten inline here, not cleared), so bar_color_mode/
              // interpolate need the same cleanup spelled out again.
              const stillActive = wantsCustom || !is.nullish(nextTheme);
              return {
                ...config,
                theme: nextTheme,
                _theme_draft: wantsCustom ? (config.theme ?? config._theme_draft) : undefined,
                custom_theme: wantsCustom ? (config._custom_theme_draft ?? config.custom_theme ?? []) : undefined,
                _custom_theme_draft: wantsCustom ? undefined : (config.custom_theme ?? config._custom_theme_draft),
                ...(stillActive ? {} : { bar_color_mode: undefined, interpolate: undefined }),
              };
            },
          },
          theme: EditorFieldsType.select('theme', {
            showIf: (c: LovelaceConfig) => !is.array(c.custom_theme),
            // See the template branch's own onClear above for why this
            // matters: without it, clearing the dropdown writes theme: ''
            // instead of deleting the key, which reads as "a theme IS set"
            // everywhere else that checks is.nullish(c.theme). Removing a
            // theme takes bar_color_mode/interpolate down with it too - both
            // are meaningless without one, and would otherwise linger unseen
            // in the saved config (their own showIf already hides them).
            onClear: (config: LovelaceConfig) => {
              const rest = { ...config };
              delete rest.theme;
              delete rest.bar_color_mode;
              delete rest.interpolate;
              return rest;
            },
          }),
          custom_theme: {
            name: 'custom_theme',
            type: 'custom_theme_editor',
            showIf: (c: LovelaceConfig) => is.array(c.custom_theme),
            // Same reasoning as theme's own onClear right above - a custom
            // theme counts as "a theme is active" too, so losing it should
            // clear bar_color_mode/interpolate the same way.
            onClear: (config: LovelaceConfig) => {
              const rest = { ...config };
              delete rest.custom_theme;
              delete rest.bar_color_mode;
              delete rest.interpolate;
              return rest;
            },
          },
        },

  // Badge/BadgeTemplate schemas reject some enum members that only make
  // sense with a `layout`/`bar_position` a badge doesn't have (see
  // YamlSchemaFactory.badge) - swaps in the matching restricted select type
  // instead of a range check inline in theme() below.
  badgeRestrictedType: (badge: boolean, restrictedType: string) => (badge ? { type: restrictedType } : {}),

  // A CSS-length option (e.g. min_width) edited as a number+unit composite: a
  // slider (value) + a unit dropdown, both virtual over the single string
  // config key. A value that isn't a plain number+unit (calc(), auto…) falls
  // back to a raw text field. See utils/length.ts. Config stays a string, so
  // the schema is unchanged. `badge` narrows the unit list (px/% only) and
  // enables the px<->% conversion (its % is redefined, see core.ts / #124).
  lengthField: (
    key: string,
    opts: {
      units: string[];
      convertRef?: number;
      showIf?: (c: LovelaceConfig) => boolean;
      noLabel?: boolean;
      customToggle?: boolean;
    },
    // eslint-disable-next-line sonarjs/max-lines-per-function -- flat decl.
  ) => {
    const { units, convertRef, showIf, noLabel = false, customToggle = false } = opts;
    const read = (c: LovelaceConfig) => c[key];
    const write = (c: LovelaceConfig, value: unknown) => ({ ...c, [key]: value });
    const parsed = (c: LovelaceConfig) => parseLength(read(c));
    const gate = (c: LovelaceConfig) => (showIf ? showIf(c) : true);
    // The toggle only ever writes the literal 'auto' (see below) - a custom
    // value that came from elsewhere (YAML calc(), an unknown unit…) still
    // falls back to the raw text field below.
    const isAutoToggled = (c: LovelaceConfig) => customToggle && read(c) === 'auto';
    const hasUnit = units.length > 1; // a single unit (e.g. px) needs no dropdown
    const fields: Record<string, unknown> = {};
    if (customToggle) {
      // Lets the user reach 'auto' from the slider UI - without this, custom
      // mode (see length.ts) can only be entered by already having a
      // non-number+unit value in the config (e.g. set through YAML), never
      // discoverable from the visual editor alone.
      fields[`${key}_custom_toggle`] = {
        name: `${key}_custom_toggle`,
        target: key,
        type: 'toggle',
        virtual: true,
        showIf: gate,
        resolveVirtual: (c: LovelaceConfig) => parsed(c).custom,
        onVirtualChange: (value: boolean, config: LovelaceConfig) =>
          value ? write(config, 'auto') : write(config, undefined),
      };
    }
    fields[key] = {
      name: key,
      type: () => `length:${key}`,
      virtual: true,
      noLabel,
      labelKey: key,
      width: hasUnit ? 'grow' : 'full', // leave room for the 90px unit select + gap
      showIf: (c: LovelaceConfig) => !parsed(c).custom && gate(c),
      resolveVirtual: (c: LovelaceConfig) => {
        const parsedLength = parsed(c);
        return parsedLength.custom ? 0 : parsedLength.value;
      },
      onVirtualChange: (value: number, config: LovelaceConfig) => {
        const parsedLength = parsed(config);
        const unit = parsedLength.custom ? units[0] : parsedLength.unit;
        return write(config, serializeLength(value, unit));
      },
    };
    fields[`${key}_custom`] = {
      name: `${key}_custom`,
      target: key,
      type: 'text',
      virtual: true,
      noLabel,
      // Reuses the slider's own label: a `<key>_custom` translation never
      // existed, so this rendered unlabelled.
      labelKey: key,
      showIf: (c: LovelaceConfig) => parsed(c).custom && !isAutoToggled(c) && gate(c),
      resolveVirtual: (c: LovelaceConfig) => (typeof read(c) === 'string' ? (read(c) as string) : ''),
      onVirtualChange: (value: string, config: LovelaceConfig) => write(config, value || undefined),
    };
    if (hasUnit) {
      fields[`${key}_unit`] = {
        name: `${key}_unit`,
        target: key,
        type: () => `lengthUnit:${units.join(',')}`,
        virtual: true,
        noLabel: true,
        required: true,
        isInGroup: 'length-unit', // CSS aligns it with the (labelled) slider row
        width: '90px',
        showIf: (c: LovelaceConfig) => !parsed(c).custom && gate(c),
        resolveVirtual: (c: LovelaceConfig) => {
          const parsedLength = parsed(c);
          return parsedLength.custom ? units[0] : parsedLength.unit;
        },
        onVirtualChange: (rawUnit: string, config: LovelaceConfig) => {
          const parsedLength = parsed(config);
          if (parsedLength.custom) return config;
          const unit = rawUnit || units[0]; // clearing the dropdown falls back to the first unit
          const value = convertLengthValue(parsedLength.value, parsedLength.unit, unit, convertRef);
          return write(config, serializeLength(value, unit));
        },
      };
    }
    return fields;
  },

  // Every themeXxxFields() below is pulled out of theme() itself for the same
  // reason as themeModeFields above: keep each conditional block's own
  // ternaries out of theme()'s cognitive complexity budget.

  themeColorModeFields: (template: boolean) =>
    template
      ? {
          // No interpolate here (Template has no such field - schema.ts's
          // own template schema never declared one, unlike Card/Feature) -
          // ViewCore.templateThemeGradient/-DivergingGradient don't support
          // it either. custom_theme doesn't exist on Template (see theme()'s
          // own comment above), so showIf only ever checks c.theme.
          bar_color_mode: EditorFieldsType.select('bar_color_mode', {
            showIf: (c: LovelaceConfig) => !is.nullish(c.theme),
          }),
        }
      : {
          bar_color_mode: EditorFieldsType.select('bar_color_mode', {
            // center_zero no longer excludes this - see
            // ViewBase.themeDivergingGradient.
            showIf: (c: LovelaceConfig) => !is.nullish(c.theme) || is.nonEmptyArray(c.custom_theme),
            width: 'full',
            // Selecting a non-auto color mode is incompatible with
            // interpolate: clear it.
            onChange: (value: string | undefined, config: LovelaceConfig) =>
              value && value !== 'auto' ? { ...config, interpolate: undefined } : config,
          }),
          interpolate: EditorFieldsType.toggle('interpolate', {
            showIf: (c: LovelaceConfig) =>
              (!is.nullish(c.theme) || is.nonEmptyArray(c.custom_theme)) &&
              (is.nullish(c.bar_color_mode) || c.bar_color_mode === 'auto'),
            width: 'full',
          }),
        },

  themeCardOnlyFields: (
    template: boolean,
    badge: boolean,
    resetUpIfInvalid: (config: LovelaceConfig) => LovelaceConfig,
  ) =>
    badge
      ? {}
      : {
          // Half-width once a theme is active, to pair with `icon` once
          // `color` hides - same reasoning as bar_size's width function
          // below. Full-width on Template regardless of theme: `icon` is
          // always a full-width Jinja textarea there, never a partner to
          // pair with. Virtual: icon_animation is an enum name |
          // { effect, jinja } (schema.ts's enumOrJinjaTrigger) - this select
          // reads/writes `effect` in both shapes.
          icon_animation: EditorFieldsType.select('icon_animation', {
            virtual: true,
            // Template's own icon is a full-width Jinja textarea, never a row
            // partner - everywhere else this pairs with whatever is beside it,
            // and stretches by itself when nothing is (see EDITOR_BASE_STYLE).
            width: template ? 'full' : 'half',
            resolveVirtual: (c: LovelaceConfig) =>
              is.plainObject(c.icon_animation) ? (c.icon_animation.effect ?? '') : (c.icon_animation ?? ''),
            onVirtualChange: (value: string, config: LovelaceConfig) =>
              is.plainObject(config.icon_animation)
                ? { ...config, icon_animation: { ...config.icon_animation, effect: value || undefined } }
                : { ...config, icon_animation: value || undefined },
          }),
          // Switches icon_animation between its plain enum form and { effect,
          // jinja }: on, the jinja condition below decides whether `effect`
          // plays, replacing the automatic entity-based detection
          // (isEntityActive/isWashingMachineActive/isBatteryCharging - see
          // HABase._iconAnimationStyle) once it resolves.
          icon_animation_mode: {
            name: 'icon_animation_mode',
            type: 'icon_animation_mode',
            target: 'icon_animation',
            labelKey: 'trigger',
            virtual: true,
            resolveVirtual: (c: LovelaceConfig) => (is.plainObject(c.icon_animation) ? 'template' : 'auto'),
            onVirtualChange: (mode: 'auto' | 'template', config: LovelaceConfig) => {
              const current = config.icon_animation;
              const effect = is.plainObject(current) ? current.effect : current;
              const currentJinja = is.plainObject(current) ? current.jinja : undefined;
              return {
                ...config,
                icon_animation:
                  mode === 'template'
                    ? { effect, jinja: currentJinja || config._icon_animation_jinja_draft || '{{ }}' }
                    : effect || undefined,
                // Ephemeral - see valueField's own _<key>_jinja_draft
                // precedent.
                _icon_animation_jinja_draft:
                  mode === 'template' ? undefined : (currentJinja ?? config._icon_animation_jinja_draft),
              };
            },
          },
          icon_animation_jinja: EditorFieldsType.tpl('icon_animation_jinja', {
            target: 'icon_animation',
            virtual: true,
            noLabel: true,
            helper: true,
            showIf: (c: LovelaceConfig) => is.plainObject(c.icon_animation),
            resolveVirtual: (c: LovelaceConfig) =>
              is.plainObject(c.icon_animation) ? (c.icon_animation.jinja ?? '') : '',
            onVirtualChange: (value: string, config: LovelaceConfig) => {
              const current = config.icon_animation;
              const effect = is.plainObject(current) ? current.effect : current;
              return { ...config, icon_animation: { effect, jinja: value || '' } };
            },
          }),
          ...circularBackgroundField(),
          bar_group: EditorFieldsType.sectionLabel('bar_group'),
          bar_position: EditorFieldsType.select('bar_position', {
            // density: compact is the most restrictive case (top/bottom/
            // background only, see EditorFactory.applyDensityConstraints) and
            // wins outright; single_line has no placement to pick at all.
            // Otherwise compact_below only has a distinct effect with layout:
            // horizontal - not offered once vertical, same reasoning as
            // bar_orientation's 'up' just above.
            type: (c: LovelaceConfig) =>
              c.density === 'compact'
                ? 'bar_position_density_compact'
                : c.layout === 'vertical'
                  ? 'bar_position_no_compact_below'
                  : 'bar_position',
            labelKey: 'position',
            width: 'half',
            showIf: (c: LovelaceConfig) => c.density !== 'single_line',
            onChange: (_value: unknown, config: LovelaceConfig) =>
              EditorFactory.resetBarSizeIfInvalid(resetUpIfInvalid(config)),
          }),
        },

  // Both are badge-only (deleted from the badge schema, see
  // YamlSchemaFactory.badge). bar_single_line only ever applies via .overlay
  // (postProcess forces it back to false for any other bar_position);
  // text_shadow also applies via .background - text sits on top of the bar
  // there too, same legibility need.
  themeSingleLineShadowFields: (badge: boolean) =>
    badge
      ? {}
      : {
          // bar_single_line only ever shows for 'overlay', where text_shadow
          // is always shown too (its own condition includes 'overlay') - so
          // it always has that row partner and can stay a flat half-width.
          // text_shadow itself also shows alone for 'background' (no
          // bar_single_line there), so its own width stays conditional.
          bar_single_line: EditorFieldsType.toggle('bar_single_line', {
            showIf: (c: LovelaceConfig) => c.bar_position === 'overlay',
            width: 'half',
          }),
          text_shadow: EditorFieldsType.toggle('text_shadow', {
            showIf: (c: LovelaceConfig) => c.bar_position === 'overlay' || c.bar_position === 'background',
            width: 'half',
          }),
        },

  // bar_max_width only affects .horizontal.small/.medium/.large - the other
  // bar_position values render through a separate container, and
  // .horizontal.xlarge has no matching rule either (schema.ts's postProcess
  // clears it server-side for the same reason, this is the editor mirror).
  // Badge/badgeTemplate opt out entirely: without a 'layout' key they never
  // get the 'horizontal' class, so the option would be inert there.
  themeMaxWidthFields: (badge: boolean) => {
    if (badge) return {};
    const barMaxWidthAllowed = (c: LovelaceConfig) =>
      (c.layout ?? 'horizontal') === 'horizontal' &&
      (c.bar_position ?? 'default') === 'default' &&
      (c.bar_size ?? 'small') !== 'xlarge';
    return {
      bar_max_width_toggle: EditorFieldsType.toggle('bar_max_width_toggle', {
        virtual: true,
        showIf: barMaxWidthAllowed,
        resolveVirtual: (c: LovelaceConfig) => Boolean(c.bar_max_width),
        onVirtualChange: draftToggle('bar_max_width', () => '300px'),
      }),
      // The toggle above carries the "Bar max width" label, so the slider is
      // noLabel. Same length component as min_width/height, locked to px (a
      // single unit needs no dropdown).
      ...EditorFactory.lengthField('bar_max_width', {
        units: ['px', '%'],
        noLabel: true,
        showIf: (c: LovelaceConfig) => barMaxWidthAllowed(c) && Boolean(c.bar_max_width),
      }),
    };
  },

  // Not gated on `template` - watermarkSchema is the exact same shape for
  // Card and Template (see YamlSchemaFactory.card/.template), and wmSide's
  // toggle/entity/jinja machinery only ever reads config.watermark.*, so
  // nothing here is Card-specific.
  themeWatermarkFields: () => {
    const wm = (extra?: (c: LovelaceConfig) => boolean) => (c: LovelaceConfig) =>
      Boolean(c.watermark) && (extra ? extra(c) : true);
    return {
      ...enabledToggleField(
        'watermark.toggle',
        (c) => Boolean(c.watermark),
        draftToggle('watermark', () => ({})),
        { noLabel: true },
      ),
      ...globalMarkFields(WATERMARK_CASCADE, wm(), 'value'),
      // type/opacity have no schema default (see schema.ts's watermarkSchema) -
      // genuinely absent, so they show SCHEMA_DEFAULTS as a greyed placeholder.
      watermark_shared: EditorFieldsType.sectionLabel('watermark_shared', { labelKey: 'mark_defaults', showIf: wm() }),
      ...globalMarkFields(WATERMARK_CASCADE, wm(), 'look'),
      // ── LOW / HIGH groups (generated by wmSide) ────────────────────
      ...wmSide('low', 20),
      ...wmSide('high', 80),
    };
  },

  // peak_marker: min/max/average from HA history (Card only, cards.ts's
  // _seedPeakMarkerHistory) - toggle + window + the family's own global
  // cascade, then the 3 marks (peakMark).
  peakMarkerFields: () => {
    const showIf = (c: LovelaceConfig) => peakMarkerEligible(c) && Boolean(c.peak_marker);
    return {
      // Replaces the toggle entirely when an entity is picked but ineligible
      // (see peakMarkerEligible) - spells out the requirement instead of just
      // hiding the option with no explanation.
      peak_marker_unsupported: EditorFieldsType.sectionLabel('peak_marker_unsupported', {
        showIf: (c: LovelaceConfig) => is.nonEmptyString(c.entity) && !peakMarkerEligible(c),
      }),
      ...enabledToggleField(
        'peak_marker.toggle',
        (c) => Boolean(c.peak_marker),
        draftToggle('peak_marker', () => ({ window: SCHEMA_DEFAULTS.peakMarker.window })),
        { showIf: peakMarkerEligible, noLabel: true },
      ),
      ...durationFields('peak_marker', 'window', showIf),
      peak_marker_shared: EditorFieldsType.sectionLabel('peak_marker_shared', {
        labelKey: 'mark_defaults',
        showIf,
      }),
      ...globalMarkFields(PEAK_MARKER_CASCADE, showIf, 'look'),
      ...peakMark('min'),
      ...peakMark('max'),
      ...peakMark('average'),
    };
  },

  // trend_indicator: boolean | { window?, basis, threshold, colored,
  // up_color, down_color, flat_color } (Card + Template, schema.ts) - toggle
  // gates the feature, Simple/Advanced picks the plain boolean vs the object
  // form. window stays optional within Advanced (own reveal toggle), unlike
  // peak_marker's own required window.
  trendIndicatorFields: () => {
    const on = (c: LovelaceConfig) => Boolean(c.trend_indicator);
    const advanced = (c: LovelaceConfig) => is.plainObject(c.trend_indicator);
    return {
      ...enabledToggleField(
        'trend_indicator.toggle',
        on,
        draftToggle('trend_indicator', () => true),
      ),
      'trend_indicator.mode': {
        name: 'trend_indicator.mode',
        type: 'trend_indicator.mode',
        virtual: true,
        showIf: on,
        resolveVirtual: (c: LovelaceConfig) => (advanced(c) ? 'advanced' : 'simple'),
        onVirtualChange: (mode: 'simple' | 'advanced', config: LovelaceConfig) => ({
          ...config,
          // A first switch to Advanced lands on a windowed trend: the window
          // is the one setting that changes what the indicator measures
          // (history over that span, instead of the previous render alone),
          // so it is what Advanced is for. It also carries over Simple's own
          // built-in dead zone (CARD.config.trendIndicator.defaultThreshold)
          // as an explicit threshold - otherwise the schema's own Advanced
          // default (0, see types.trendIndicator) silently removes it on a
          // mere mode toggle. A later switch back restores the draft, window
          // included, whatever the user did with it.
          trend_indicator:
            mode === 'advanced'
              ? (config._trend_indicator_advanced_draft ?? {
                  window: SCHEMA_DEFAULTS.trendIndicator.window,
                  threshold: CARD.config.trendIndicator.defaultThreshold,
                })
              : true,
          _trend_indicator_advanced_draft: mode === 'advanced' ? undefined : config.trend_indicator,
        }),
      },
      'trend_indicator.window_toggle': {
        name: 'trend_indicator.window_toggle',
        type: 'toggle',
        virtual: true,
        showIf: advanced,
        resolveVirtual: (c: LovelaceConfig) => Boolean(c.trend_indicator?.window),
        onVirtualChange: (value: boolean, config: LovelaceConfig) => ({
          ...config,
          trend_indicator: {
            ...config.trend_indicator,
            window: value ? (config._trend_indicator_window_draft ?? SCHEMA_DEFAULTS.trendIndicator.window) : undefined,
          },
          _trend_indicator_window_draft: value ? undefined : config.trend_indicator?.window,
        }),
      },
      ...durationFields('trend_indicator', 'window', (c) => advanced(c) && Boolean(c.trend_indicator?.window)),
      'trend_indicator.basis': EditorFieldsType.select('trend_indicator.basis', {
        type: 'trend_indicator_basis',
        showIf: advanced,
        width: 'half',
        placeholder: () => SCHEMA_DEFAULTS.trendIndicator.basis,
      }),
      'trend_indicator.threshold': EditorFieldsType.decimal('trend_indicator.threshold', {
        showIf: advanced,
        width: 'half',
        placeholder: () => String(SCHEMA_DEFAULTS.trendIndicator.threshold),
      }),
      'trend_indicator.colored': EditorFieldsType.toggle('trend_indicator.colored', { showIf: advanced }),
      'trend_indicator.up_color': EditorFieldsType.templateOrType('trend_indicator.up_color', false, 'color', {
        showIf: advanced,
      }),
      'trend_indicator.down_color': EditorFieldsType.templateOrType('trend_indicator.down_color', false, 'color', {
        showIf: advanced,
      }),
      'trend_indicator.flat_color': EditorFieldsType.templateOrType('trend_indicator.flat_color', false, 'color', {
        showIf: advanced,
      }),
    };
  },

  themeBadgeIconColorFields: (badge: boolean) =>
    badge
      ? {}
      : {
          // badge_icon/badge_color are two independent optional strings, not
          // one nested map - each gets its own collapse-to-reveal toggle
          // instead of one shared toggle forcing both together. "Badge"
          // counts as on whenever EITHER field has a value - existing YAML
          // with only badge_color set still needs an active "Badge" toggle
          // with badge_icon's field visible, empty, ready to fill in.
          // badge_color_toggle nests under it (same showIf condition): a
          // badge color with no badge at all isn't offered as a starting
          // point. Turning "Badge" off clears both fields (the master
          // switch); "Independent color" keeps owning badge_color while
          // "Badge" stays on.
          // Ephemeral drafts - see valueField's own _<key>_jinja_draft
          // precedent. badge_color_toggle below shares _badge_color_draft:
          // whichever path last cleared badge_color, the same slot restores it.
          // The one master toggle owning two keys - badge_color has no default
          // of its own, so it only ever comes back from its draft.
          ...enabledToggleField(
            'badge.toggle',
            (c) => Boolean(c.badge_icon) || Boolean(c.badge_color),
            (value, config) =>
              draftToggle('badge_color', () => undefined)(
                value,
                draftToggle('badge_icon', () => '{{ }}')(value, config),
              ),
          ),
          badge_icon: EditorFieldsType.tpl('badge_icon', {
            noLabel: true,
            helper: true,
            showIf: (c: LovelaceConfig) => Boolean(c.badge_icon) || Boolean(c.badge_color),
          }),
          'badge.color_toggle': EditorFieldsType.toggle('badge.color_toggle', {
            virtual: true,
            showIf: (c: LovelaceConfig) => Boolean(c.badge_icon) || Boolean(c.badge_color),
            resolveVirtual: (c: LovelaceConfig) => Boolean(c.badge_color),
            onVirtualChange: draftToggle('badge_color', () => '{{ }}'),
          }),
          badge_color: EditorFieldsType.tpl('badge_color', {
            noLabel: true,
            helper: true,
            helperKey: 'color',
            showIf: (c: LovelaceConfig) => Boolean(c.badge_color),
          }),
        },

  // Template/BadgeTemplate: Jinja-only, no above/below/color/highlight/
  // animation/label - nothing static to pair a mode chip against.
  themeAlertFields: (template: boolean) =>
    template
      ? {
          ...alertToggleField(),
          'alert_when.jinja': EditorFieldsType.tpl('alert_when.jinja', {
            noLabel: true,
            helper: true,
            showIf: (c: LovelaceConfig) => Boolean(c.alert_when),
          }),
        }
      : {
          ...alertToggleField(),
          ...alertModeField(),
          ...alertField('above'),
          ...alertField('below'),
          'alert_when.jinja': EditorFieldsType.tpl('alert_when.jinja', {
            noLabel: true,
            helper: true,
            showIf: (c: LovelaceConfig) => is.nonEmptyString(c.alert_when?.jinja),
          }),
          'alert_when.color': EditorFieldsType.select('alert_when.color', {
            type: 'color',
            showIf: (c: LovelaceConfig) => Boolean(c.alert_when),
          }),
          'alert_when.highlight': EditorFieldsType.select('alert_when.highlight', {
            type: 'alert_highlight',
            showIf: (c: LovelaceConfig) => Boolean(c.alert_when),
            width: 'half',
          }),
          // 'ping' is selectable with any highlight: it's a box-shadow ring
          // burst around the whole card (see .alert-anim-ping), independent
          // of highlight's border-color/background-color.
          'alert_when.animation': EditorFieldsType.select('alert_when.animation', {
            type: 'alert_animation',
            showIf: (c: LovelaceConfig) => Boolean(c.alert_when),
            width: 'half',
          }),
          // Only shown for highlight: label - a fixed word for the status
          // pill (see schema.ts's alert_when.label), not Jinja like the
          // card-level label field. Full width, own row - unlike
          // color/highlight/animation, it's a free-text field, not a chip
          // pair that benefits from sharing a row.
          'alert_when.label': EditorFieldsType.text('alert_when.label', {
            showIf: (c: LovelaceConfig) => (c.alert_when as { highlight?: string })?.highlight === 'label',
            width: 'full',
          }),
        },

  // frameless/marginless: still valid for badges in the schema (raw YAML
  // still works) and documented as such - just not worth a control in the
  // badge editor, a deliberate choice, not a dead-CSS case. `height` is
  // genuinely deleted from the badge schema (see YamlSchemaFactory.badge).
  themeCardLayoutFields: (badge: boolean) =>
    badge
      ? {}
      : {
          frameless: EditorFieldsType.toggle('frameless', { width: 'half' }),
          marginless: EditorFieldsType.toggle('marginless', { width: 'half' }),
        },

  // A "Card size" toggle that reveals min_width (+ height on cards) without
  // forcing a value: `_show_size` is ephemeral UI state, same pattern as
  // `_visible_actions`. Also reads as on when a value already exists.
  cardSizeFields: (badge: boolean) => {
    const shown = (c: LovelaceConfig) => Boolean(c._show_size || c.min_width || c.height);
    return {
      card_size_toggle: {
        name: 'card_size_toggle',
        type: 'toggle',
        virtual: true,
        resolveVirtual: shown,
        onVirtualChange: (value: boolean, config: LovelaceConfig) =>
          value
            ? { ...config, _show_size: true }
            : { ...config, _show_size: undefined, min_width: undefined, height: undefined },
      },
      ...EditorFactory.lengthField(
        'min_width',
        badge
          ? { units: ['px', '%'], convertRef: 130, showIf: shown }
          : { units: ['px', 'em', 'rem', '%'], showIf: shown },
      ),
      ...(badge
        ? {}
        : EditorFactory.lengthField('height', { units: ['px', 'em', 'rem', '%'], showIf: shown, customToggle: true })),
    };
  },

  themeLayoutField: (badge: boolean, resetUpIfInvalid: (config: LovelaceConfig) => LovelaceConfig) =>
    badge
      ? {}
      : {
          layout: EditorFieldsType.select('layout', {
            // Picking vertical wins over a single_line card rather than being
            // undone by applyDensityConstraints on the next keystroke: the
            // density goes back to default, and its chip list loses
            // single_line for as long as the layout stays vertical.
            onChange: (value: unknown, config: LovelaceConfig) =>
              EditorFactory.resetCompactBelowIfInvalid(
                resetUpIfInvalid(
                  value === CARD.layout.orientations.vertical.label && config.density === 'single_line'
                    ? { ...config, density: undefined }
                    : config,
                ),
              ),
          }),
          density: {
            name: 'density',
            type: 'density',
            virtual: true,
            // single_line lays the card out as one horizontal row - there is
            // no vertical form of it to offer (see applyDensityRule).
            modes: (c: LovelaceConfig) =>
              c.layout === CARD.layout.orientations.vertical.label
                ? DENSITY_MODES.filter((mode) => mode !== 'single_line')
                : DENSITY_MODES,
            // 'default' resolves to no key at all, so a card that never left
            // it keeps a clean YAML.
            resolveVirtual: (c: LovelaceConfig) => (c.density as string) ?? 'default',
            onVirtualChange: (value: string, config: LovelaceConfig): LovelaceConfig => {
              const next = EditorFactory.applyDensityConstraints({
                ...config,
                density: value === 'default' ? undefined : value,
              });
              // A card in a Sections view carries its own explicit
              // grid_options, which always wins over getGridOptions()'s
              // computed default - so compact has to pin it by hand and stash
              // the previous value in _grid_options_draft (ephemeral, same
              // pattern as custom_theme's _theme_draft). single_line doesn't:
              // layout: horizontal is already 1 row / 2 columns.
              if (value === 'compact') {
                return {
                  ...next,
                  grid_options: { columns: Number(CARD.layout.gridColumnMultiplier), rows: 1 },
                  _grid_options_draft: config.grid_options,
                };
              }
              return config.density === 'compact'
                ? { ...next, grid_options: config._grid_options_draft, _grid_options_draft: undefined }
                : next;
            },
          },
        },

  // 'up' only has a visible effect in these two combinations (see
  // HACore#_addBaseClasses's vertical-bar/horizontal-bar decision) - shared by
  // bar_orientation's own dynamic type in theme() and the reset-on-change
  // hooks on bar_position (theme()) / layout (now in its own layout() panel,
  // see below - lifted out of theme()'s closure so both can reach it).
  upAllowed: (c: LovelaceConfig) =>
    (c.layout === 'vertical' && c.bar_position === 'overlay') || c.bar_position === 'background',

  // Shared by icon/bar_scale (theme()) and themeBarSizingFields below - a
  // built-in theme or a custom_theme zone list, either one counts.
  themeActive: (c: LovelaceConfig) => !is.nullish(c.theme) || is.array(c.custom_theme),

  // Shared by bar_segments's own showIf (themeBarSizingFields) and bar_scale
  // (theme()) - mirrors schema.ts's own applyBarSegmentsRule.
  barSegmentsVisible: (c: LovelaceConfig) =>
    c.bar_color_mode !== 'rainbow_full' && !is.nonEmptyArray(c.bar_stack?.entities),

  // Shared by bar_size's own showIf (themeBarSizingFields) and bar_scale
  // (theme()) - these 4 positions hard-override the bar's own thickness in
  // CSS regardless of bar_size (see schema.ts's applyBarSizeConflictRule).
  barSizeAllowed: (c: LovelaceConfig) => !['top', 'bottom', 'overlay', 'background'].includes(c.bar_position),

  resetUpIfInvalid: (config: LovelaceConfig) =>
    config.bar_orientation === 'up' && !EditorFactory.upAllowed(config)
      ? { ...config, bar_orientation: 'ltr' }
      : config,

  // Mirrors schema.ts's own applyBarSizeConflictRule: a stale bar_size left
  // over from before switching to one of these positions would otherwise
  // sit unused in the saved YAML, reappearing the moment bar_position
  // changes back - always cleared for all 4 positions now (top/bottom get
  // the schema's own forced xsmall regardless of what's saved here).
  resetBarSizeIfInvalid: (config: LovelaceConfig) =>
    !EditorFactory.barSizeAllowed(config) && !is.nullish(config.bar_size) ? { ...config, bar_size: undefined } : config,

  // Template rejects 'unit'; Badge/BadgeTemplate lack 'shape' (see schema.ts).
  // The set is the schema's own hide list for that variant - only the order is
  // the editor's: shape sits next to the icon it draws behind, not last where
  // it happened to be appended.
  hideChipsItems: (variant: SchemaVariant): string[] => {
    const allowed = new Set(schemaOptions(variant, 'hide'));
    return HIDE_DISPLAY_ORDER.filter((item) => allowed.has(item));
  },

  // compact_below (#123) mirrors 'up' above: only has a distinct effect with
  // layout: horizontal (see schema.ts's applyCompactBelowRule, the matching
  // save-time safety net) - falls back to 'default', not 'below': the two
  // are different bar placements that only coincide in horizontal.
  resetCompactBelowIfInvalid: (config: LovelaceConfig) =>
    config.bar_position === 'compact_below' && config.layout !== 'horizontal'
      ? { ...config, bar_position: 'default' }
      : config,

  // compact (issue #134) forces bar_position into {top, bottom, background},
  // whichever layout is already set; single_line takes the layout with it and
  // puts the bar back in the row. Both mirror schema.ts's applyDensityRule,
  // applied the moment density changes since neither value can drift into an
  // invalid one on its own afterwards.
  applyDensityConstraints: (config: LovelaceConfig): LovelaceConfig => {
    if (config.density === 'single_line') {
      return {
        ...config,
        layout: CARD.layout.orientations.horizontal.label,
        bar_position: undefined,
        multiline: undefined,
      };
    }
    if (config.density !== 'compact') return config;
    const next: LovelaceConfig = { ...config };
    if (!DENSITY_COMPACT_BAR_POSITIONS.includes(next.bar_position as string)) {
      next.bar_position = 'top';
    }
    return next;
  },

  // bar_orientation/bar_size/bar_color/bar_segments/bar_scale's row-partner
  // logic, pulled out of theme() for the same cognitive-complexity reason as
  // every other themeXxxFields() here. See each field's own width comment
  // for its pairing - bar_orientation stays a flat half, always.
  themeBarSizingFields: (template: boolean, badge: boolean, upAllowed: (c: LovelaceConfig) => boolean) => {
    const themeActive = EditorFactory.themeActive;
    // Mirrors bar_size's own showIf below - whenever bar_size is actually
    // visible at all, bar_single_line/text_shadow (the only other fields
    // that could otherwise land between it and bar_segments) are hidden by
    // construction (they need the exact bar_position values excluded here),
    // so bar_size and bar_segments are always neighbors when this is true.
    const barSizeAllowed = EditorFactory.barSizeAllowed;
    return {
      // Badge has no bar_position (where the label normally sits, see
      // themeCardOnlyFields) - bar_orientation is its first bar field.
      ...(badge ? { bar_group: EditorFieldsType.sectionLabel('bar_group') } : {}),
      bar_orientation: EditorFieldsType.select('bar_orientation', {
        // Badge/Badge Template have no bar_position/layout, so 'up' is
        // statically excluded there; elsewhere, only offered when upAllowed
        // (see postProcess for the matching runtime reset).
        type: badge
          ? 'bar_orientation_no_up'
          : (c: LovelaceConfig) => (upAllowed(c) ? 'bar_orientation' : 'bar_orientation_no_up'),
        width: 'half',
      }),
      bar_size: EditorFieldsType.select('bar_size', {
        ...EditorFactory.badgeRestrictedType(badge, 'bar_size_no_xlarge'),
        width: 'half',
        // top/bottom/overlay/background all hard-override the bar's own
        // thickness in CSS regardless of bar_size (see ha-card.overlay,
        // .bottom-container/.top-container, ha-card.background).
        showIf: barSizeAllowed,
      }),
      bar_color: EditorFieldsType.templateOrType('bar_color', template, 'color', {
        showIf: (c: LovelaceConfig) => !themeActive(c),
        // Full-width once bar_size (its row partner) hides for the same
        // bar_position values.
        ...(template ? { helper: true, helperKey: 'color' } : { width: 'half' }),
      }),
      ...EditorFactory.themeSingleLineShadowFields(badge),
      bar_segments: EditorFieldsType.number('bar_segments', {
        type: 'bar_segments',
        showIf: EditorFactory.barSegmentsVisible,
        width: 'half',
      }),
    };
  },

  // Simple (chips) vs Advanced (Jinja) - shared verbatim by theme() and
  // buildFeature() below.
  barEffectFields: () => ({
    ...arrayOrJinjaModeField('bar_effect'),
    bar_effect_chips: EditorFieldsType.select('bar_effect_chips', {
      type: 'effect_chips',
      target: 'bar_effect',
      showIf: (c: LovelaceConfig) => !is.nonEmptyString(c.bar_effect),
    }),
    bar_effect: EditorFieldsType.tpl('bar_effect', {
      noLabel: true,
      helper: true,
      showIf: (c: LovelaceConfig) => is.nonEmptyString(c.bar_effect),
    }),
  }),

  theme: (template: boolean, badge: boolean) => {
    const upAllowed = EditorFactory.upAllowed;
    const resetUpIfInvalid = EditorFactory.resetUpIfInvalid;
    return {
      title: TITLE.theme,
      icon: HA_CONTEXT.icons.listBox,
      fields: {
        ...EditorFactory.themeModeFields(template),
        ...EditorFactory.themeColorModeFields(template),
        // Half-width to pair with `color` below - but `color` hides once a
        // theme/custom_theme is active, so `icon` needs to reclaim the full
        // row then. Card: always half now, whether or not `color` is
        // actually showing (matches bar_orientation/bar_size below). Badge
        // keeps the old theme-aware behavior (full once `color` hides).
        icon: EditorFieldsType.templateOrType('icon', template, 'icon', {
          ...(template
            ? { helper: true }
            : {
                width: 'half',
              }),
        }),
        color: EditorFieldsType.templateOrType('color', template, 'color', {
          showIf: (c: LovelaceConfig) => is.nullish(c.theme) && !is.array(c.custom_theme),
          ...(template ? { helper: true } : { width: 'half' }),
        }),
        ...EditorFactory.themeCardOnlyFields(template, badge, resetUpIfInvalid),
        ...EditorFactory.themeBarSizingFields(template, badge, upAllowed),
        // Not in YamlSchemaFactory.template: percent comes straight from Jinja
        // there, so the log/linear min-max mapping this drives has nothing to
        // act on - showing it would silently do nothing on save (same trap as
        // #111's min_value/max_value on a template card).
        ...(!template
          ? {
              bar_scale: EditorFieldsType.select('bar_scale', {
                width: 'half',
                showIf: (c: LovelaceConfig) => !c.center_zero,
              }),
            }
          : {}),
        ...EditorFactory.themeMaxWidthFields(badge),
        reverse_secondary_info_row: EditorFieldsType.toggle('reverse_secondary_info_row', {
          // Badge/Badge Template have neither key at all (always undefined) but
          // structurally render exactly like layout: horizontal + bar_position:
          // default - the (?? 'horizontal') fallback (missing before) is what
          // actually lets it show and work for them, matching bar_position's
          // own fallback right next to it.
          showIf: (c: LovelaceConfig) =>
            (!c.bar_position || c.bar_position === 'default') && (c.layout ?? 'horizontal') === 'horizontal',
        }),
        // Used to be mutually exclusive with bar_color_mode (segment/rainbow
        // had no effect under center_zero) - now that
        // ViewBase.themeDivergingGradient supports both together, gating
        // this on bar_color_mode would just hide it with no way back.
        ...centerZeroFields(),
        ...EditorFactory.barEffectFields(),
        // ── Hide ─────────────────────────────────────────────────────────────
        ...arrayOrJinjaModeField('hide'),
        hide_chips: EditorFieldsType.select('hide_chips', {
          type: 'hide_chips',
          target: 'hide',
          showIf: (c: LovelaceConfig) => !is.nonEmptyString(c.hide),
          items: EditorFactory.hideChipsItems(cardVariant(template, badge)),
          // Meaningless once unit itself is hidden - drop the stale values
          // instead of leaving them saved but inert.
          onChange: (_value: unknown, config: LovelaceConfig) =>
            is.array(config.hide) && config.hide.includes('unit')
              ? { ...config, unit_spacing: undefined, unit_position: undefined }
              : config,
        }),
        hide: EditorFieldsType.tpl('hide', {
          noLabel: true,
          helper: true,
          showIf: (c: LovelaceConfig) => is.nonEmptyString(c.hide),
        }),
      },
    };
  },

  // The status pill: a bare string is the shorthand for { jinja }, so every
  // field here reads and writes through statusLabelObj/rewrapStatusLabel
  // rather than the generic dot-path machinery (see schema.ts).
  statusLabelFields: () => ({
    // Ephemeral - the whole object (jinja/position/color_source), not
    // just jinja, so re-enabling restores all three.
    ...enabledToggleField(
      'status_label.toggle',
      (c) => Boolean(c.status_label),
      draftToggle('status_label', () => ({})),
    ),
    // Virtual: status_label can be the bare-string shorthand (see
    // statusLabelObj/rewrapStatusLabel, schema.ts) - the generic
    // dot-path field machinery can't read/write through that.
    'status_label.jinja': {
      name: 'status_label.jinja',
      type: 'template',
      virtual: true,
      noLabel: true,
      helper: true,
      showIf: (c: LovelaceConfig) => Boolean(c.status_label),
      resolveVirtual: (c: LovelaceConfig) => statusLabelObj(c.status_label).jinja ?? '',
      onVirtualChange: (value: string, config: LovelaceConfig) => ({
        ...config,
        status_label: rewrapStatusLabel(config.status_label, { jinja: value }),
      }),
    },
    'status_label.position': {
      name: 'status_label.position',
      type: 'label_position',
      virtual: true,
      width: 'half',
      showIf: (c: LovelaceConfig) => Boolean(c.status_label),
      resolveVirtual: (c: LovelaceConfig) => statusLabelObj(c.status_label).position ?? 'right',
      onVirtualChange: (value: string, config: LovelaceConfig) => ({
        ...config,
        status_label: rewrapStatusLabel(config.status_label, { position: value }),
      }),
    },
    // Which color the pill falls back to (see HACore._repaintStatus
    // Label) when its own `jinja` doesn't return an explicit
    // {label, color} - 'bar' by default (schema.ts's own default).
    'status_label.color_source': {
      name: 'status_label.color_source',
      type: 'status_label_color_source',
      virtual: true,
      width: 'half',
      showIf: (c: LovelaceConfig) => Boolean(c.status_label),
      resolveVirtual: (c: LovelaceConfig) => statusLabelObj(c.status_label).color_source ?? 'bar',
      onVirtualChange: (value: string, config: LovelaceConfig) => ({
        ...config,
        status_label: rewrapStatusLabel(config.status_label, { color_source: value }),
      }),
    },
  }),

  // One panel per marker family, split out of the single "Markers" panel it
  // used to be: watermark and peak_marker each fill one on their own, the
  // three small ones share Indicators, alert_when keeps its own. Beyond the
  // scrolling, a collapsed panel is skipped by EditorDOMHelper.updateAll -
  // editing a watermark no longer re-evaluates every alert field on each
  // keystroke.
  markers: (template: boolean, badge: boolean) =>
    nonEmptySections({
      watermark: {
        title: TITLE.watermark,
        icon: HA_CONTEXT.icons.radar,
        fields: EditorFactory.themeWatermarkFields(),
      },
      peak_marker: {
        title: TITLE.peakMarker,
        icon: HA_CONTEXT.icons.chartBellCurve,
        // Card only (cards.ts's _seedPeakMarkerHistory, schema.ts's peakMarker
        // comment) - Badge/Template have no history-seeding pipeline.
        fields: !template && !badge ? EditorFactory.peakMarkerFields() : {},
      },
      // Three small families that annotate the card rather than mark the bar.
      // status_label sits before alert_when (next panel) on purpose:
      // alert_when.highlight: 'label' reuses this very pill.
      indicators: {
        title: TITLE.indicators,
        icon: HA_CONTEXT.icons.labelOutline,
        fields: {
          // Card + Template, not Badge (schema.ts's trendIndicator() usage).
          ...(!badge ? EditorFactory.trendIndicatorFields() : {}),
          // Jinja-driven, same "annotates the card" concern - moved out of
          // theme() for that reason (see themeBadgeIconColorFields).
          ...EditorFactory.themeBadgeIconColorFields(badge),
          // Card + Template only (same scope as trend_indicator, which shares
          // a corner with it, see schema.ts's applyLabelRule): too small a
          // scale to read well on a badge.
          ...(!badge ? EditorFactory.statusLabelFields() : {}),
        },
      },
      alerts: {
        title: TITLE.alerts,
        icon: HA_CONTEXT.icons.alertCircleOutline,
        fields: EditorFactory.themeAlertFields(template),
      },
    }),

  // Also split out of theme(): frameless/marginless/height/min_width/layout
  // are the card's own sizing/shape, a different concern from its color/bar
  // appearance above. Smaller win than markers() (5 fields vs ~28) but the
  // same grouping logic - and it's the natural conceptual home for these
  // regardless of the performance angle.
  layout: (badge: boolean) => ({
    title: TITLE.layout,
    icon: HA_CONTEXT.icons.aspectRatio,
    // Shape, then size, then frame: layout governs density (whose own chip
    // list answers to it), size only means something once the shape is
    // settled, and frameless/marginless change nothing inside the card.
    fields: {
      ...EditorFactory.themeLayoutField(badge, EditorFactory.resetUpIfInvalid),
      // min_width (+ height on cards) behind a "Card size" reveal toggle. Not
      // gated on `badge` for min_width - valid for badges too (not in
      // YamlSchemaFactory.badge's delete list).
      ...EditorFactory.cardSizeFields(badge),
      ...EditorFactory.themeCardLayoutFields(badge),
    },
  }),

  // `iconActions`: the icon's own gestures, and the "+" picker entries that
  // would offer them back. Off for a badge, and for a Multi Feature row whose
  // icon is a few pixels wide (YamlSchemaFactory.multiFeatureRow drops them
  // from its schema too).
  interactions: (badge: boolean, iconActions = !badge) => {
    // isActive: negotiated action differs from 'none'. isRevealed: manually
    // added via the "+" picker (_visible_actions, ephemeral UI state).
    // Boolean(...) guard: resolveVirtual below only has raw config, where an
    // untouched key is absent (undefined !== 'none' would read as "active").
    const isActive = (key: string) => (_: LovelaceConfig, n: Config) =>
      Boolean(n?.[key]?.action) && n[key].action !== 'none';
    const isRevealed = (key: string) => (c: LovelaceConfig) =>
      Array.isArray(c._visible_actions) && c._visible_actions.includes(key);
    const orRevealed =
      (key: string, pred: (c: LovelaceConfig, n: Config) => boolean) => (c: LovelaceConfig, n: Config) =>
        isRevealed(key)(c) || pred(c, n);
    const optionalKeys = iconActions
      ? ['hold_action', 'double_tap_action', 'icon_hold_action', 'icon_double_tap_action']
      : ['hold_action', 'double_tap_action'];
    // Hidden = neither active nor revealed. n defaults to c: resolveVirtual
    // has no negotiated, unlike showIf.
    const hiddenKeys = (c: LovelaceConfig, n: Config = c as unknown as Config) =>
      optionalKeys.filter((k) => !isRevealed(k)(c) && !isActive(k)(c, n));
    return {
      title: TITLE.interaction,
      icon: HA_CONTEXT.icons.gestureTapHold,
      fields: {
        tap_action: EditorFieldsType.action('tap_action', { labelKey: 'action.tap' }),
        hold_action: EditorFieldsType.action('hold_action', {
          labelKey: 'action.hold',
          showIf: orRevealed('hold_action', isActive('hold_action')),
        }),
        double_tap_action: EditorFieldsType.action('double_tap_action', {
          labelKey: 'action.double_tap',
          showIf: orRevealed('double_tap_action', isActive('double_tap_action')),
        }),
        ...(iconActions
          ? {
              icon_tap_action: EditorFieldsType.action('icon_tap_action', { labelKey: 'action.icon_tap' }),
              icon_hold_action: EditorFieldsType.action('icon_hold_action', {
                labelKey: 'action.icon_hold',
                showIf: orRevealed('icon_hold_action', isActive('icon_hold_action')),
              }),
              icon_double_tap_action: EditorFieldsType.action('icon_double_tap_action', {
                labelKey: 'action.icon_double_tap',
                showIf: orRevealed('icon_double_tap_action', isActive('icon_double_tap_action')),
              }),
            }
          : {}),
        action_picker: {
          name: 'action_picker',
          type: 'action_picker',
          virtual: true,
          items: optionalKeys,
          showIf: (c: LovelaceConfig, n: Config) => hiddenKeys(c, n).length > 0,
          resolveVirtual: (c: LovelaceConfig) => ({
            visible: Array.isArray(c._visible_actions) ? c._visible_actions : [],
            hidden: hiddenKeys(c),
          }),
          onVirtualChange: (value: string[], config: LovelaceConfig) => ({ ...config, _visible_actions: value }),
        },
      },
    };
  },

  // Named at this one external entry point (editors.ts) so a call site reads
  // as a card variant, not two opaque booleans - every internal helper below
  // keeps taking plain template/badge booleans, unchanged.
  build: ({ template, badge }: { template: boolean; badge: boolean }) =>
    gateOnHide({
      general: EditorFactory.general(template),
      content: EditorFactory.content(template, badge),
      theme: EditorFactory.theme(template, badge),
      ...EditorFactory.markers(template, badge),
      interactions: EditorFactory.interactions(badge),
      // Last on purpose: the card's own frame and sizing, after everything
      // that fills it.
      layout: EditorFactory.layout(badge),
    }),

  // Feature's own schema (YamlSchemaFactory.feature) has none of Card's
  // name/hide/actions/layout fields - built from the same shared field
  // helpers instead of reusing Card's own template/badge-shaped sections.
  buildFeature: () => {
    const general = EditorFactory.general(false);
    // Defaults to the parent Tile's own entity at runtime (see
    // EntityProgressFeatures's `set context`) - only override to show another.
    const entity = EditorFieldsType.entity('entity', { required: false, helper: true, helperKey: 'feature_entity' });
    const barSizeAllowed = EditorFactory.barSizeAllowed;
    const segmentsVisible = EditorFactory.barSegmentsVisible;
    return {
      general: { ...general, fields: { ...general.fields, entity } },
      content: {
        title: TITLE.content,
        icon: HA_CONTEXT.icons.textShort,
        fields: {
          ...valueField('min_value', MIN_VALUE_ENTITY_PATH, {
            default: (c: LovelaceConfig) => (c.center_zero ? -100 : 0),
          }),
          ...valueField('max_value', MAX_VALUE_ENTITY_PATH),
        },
      },
      theme: {
        title: TITLE.theme,
        icon: HA_CONTEXT.icons.listBox,
        fields: {
          ...EditorFactory.themeModeFields(false),
          ...EditorFactory.themeColorModeFields(false),
          bar_color: EditorFieldsType.templateOrType('bar_color', false, 'color', {
            showIf: (c: LovelaceConfig) => !EditorFactory.themeActive(c),
            width: 'half',
          }),
          bar_orientation: EditorFieldsType.select('bar_orientation', {
            type: 'bar_orientation_no_up',
            width: 'half',
          }),
          bar_size: EditorFieldsType.select('bar_size', { width: 'half', showIf: barSizeAllowed }),
          bar_position: EditorFieldsType.select('bar_position', {
            type: 'bar_position_feature',
            labelKey: 'position',
            width: 'half',
            onChange: (_value: unknown, config: LovelaceConfig) => EditorFactory.resetBarSizeIfInvalid(config),
          }),
          bar_segments: EditorFieldsType.number('bar_segments', {
            type: 'bar_segments',
            width: 'half',
            showIf: segmentsVisible,
          }),
          bar_scale: EditorFieldsType.select('bar_scale', {
            width: 'half',
            showIf: (c: LovelaceConfig) => !c.center_zero,
          }),
          ...centerZeroFields(),
          ...EditorFactory.barEffectFields(),
        },
      },
      watermark: {
        title: TITLE.watermark,
        icon: HA_CONTEXT.icons.radar,
        fields: EditorFactory.themeWatermarkFields(),
      },
      peak_marker: {
        title: TITLE.peakMarker,
        icon: HA_CONTEXT.icons.chartBellCurve,
        fields: EditorFactory.peakMarkerFields(),
      },
    };
  },

  // Hand-composed like buildFeature() above, and for the same reason: the
  // Multi's schema is card-shaped but drops whole families of fields (layout,
  // frame, Jinja text - see YamlSchemaFactory.multiRow), so reusing build()'s
  // own sections would offer options its schema rejects on save. Every field
  // here comes from the same shared helpers the card uses, never a copy.
  // What is NOT here is deliberate: the per-row options live in the rows list
  // (see EntityProgressMultiRowEditor), everything at this level is a shared
  // default a row may override.
  // The aggregator's own form, and nothing else: what a row can carry is
  // edited on the row (see buildMultiRow), then factorised up by the editor
  // once every row agrees on it (see MultiEditorBase). A shared option set
  // here instead would be a second place to change the same thing, and the
  // two would drift.
  buildMulti: (feature: boolean) => ({
    general: {
      flat: true,
      fields: {
        entities: { name: 'entities', type: 'multi_row_editor' },
      },
    },
    // The Sections grid row span, standalone card only - a Feature is always
    // exactly one HA feature row (see multi.ts's _applySizing). Genuinely the
    // aggregator's own, with nothing per-row to factorise from.
    ...(feature
      ? {}
      : {
          layout: {
            title: TITLE.layout,
            icon: HA_CONTEXT.icons.aspectRatio,
            fields: { rows: EditorFieldsType.number('rows', { width: 'half' }) },
          },
        }),
  }),

  // One row, edited whole behind the list's pencil - and a row IS a card
  // (multi.ts), so this is the card's own form minus what the row shape
  // settles for it, never a second form written by hand. Anything hand-written
  // here would drift the day a card option moves section, gains a placeholder
  // or grows a simple/advanced switch - which is exactly what it did.
  buildMultiRow: (feature: boolean) => {
    const card = EditorFactory.build({ template: false, badge: false });
    // The frame, the layout and where the bar sits are the aggregator's, not
    // the row's (YamlSchemaFactory.multiRow deletes the same set).
    // Key order is panel order (see EditorBase's own render loop) - the card's
    // own, minus the layout panel it no longer owns.
    return {
      general: card.general,
      content: dropFields(card.content, ['multiline']),
      theme: dropFields(card.theme, [
        'bar_position',
        // A few px of icon can't carry a circular background - gone from the
        // Feature row's own schema too (multiFeatureRow).
        ...(feature ? ['force_circular_background_mode'] : []),
      ]),
      ...Object.fromEntries(
        MARKER_SECTIONS.filter((key) => key in card && !(feature && FEATURE_ROW_DROPPED_SECTIONS.includes(key))).map(
          (key) => [key, card[key]],
        ),
      ),
      // Not dropFields(card.interactions): the "+" picker carries its own list
      // of optional actions, which has to lose the icon's too.
      interactions: feature ? EditorFactory.interactions(false, false) : card.interactions,
    };
  },
};

export { EditorFactory };
