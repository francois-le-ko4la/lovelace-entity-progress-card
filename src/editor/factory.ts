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
  type HideTarget,
} from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { HassProviderSingleton } from '../utils/hass-provider.js';
import type { LovelaceConfig, Config } from '../utils/types.js';
import { parseLength, serializeLength, convertLengthValue } from '../utils/length.js';
import { parseDuration, serializeDuration } from '../utils/duration.js';
import {
  entityOf,
  attributeOf,
  jinjaOf,
  statusLabelObj,
  rewrapStatusLabel,
  isMarkOverride,
  markInner,
  SCHEMA_DEFAULTS,
  schemaOptions,
  DENSITY_MODES,
  HAS_EFFECT,
  YamlSchemaFactory,
  densityOverrides,
  type SchemaVariant,
  type ValueConfig,
  type WatermarkMark,
  MARK_FIELDS,
  MARK_FACTORIZATION,
  markIds,
  type MarkField,
  type MarkFamily,
  type MarkId,
  type PeakPoint,
} from '../card/schema.js';
import type { Factorization } from '../card/factorization.js';
import { resolveCenterZero } from '../card/config-helpers.js';
import { hasUsableHistory } from '../card/entity-helper.js';
import { domainProfile } from '../card/ha-state.js';

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
  'icon_group',
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
  'bar_scale',
  'bar_single_line',
  'text_shadow',
  'interpolate',
  'bar_max_width_toggle',
  'bar_max_width',
  'bar_max_width_custom',
  'bar_max_width_unit',
  'bar_aligned',
  'bar_effect_mode',
  'bar_effect_chips',
  'bar_effect',
  'reverse_secondary_info_row',
];

const HIDE_DEPENDENTS: Record<HideTarget, string[]> = {
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

// The same targets as HIDE_TARGETS, in the editor's own order: shape sits next
// to the icon it draws behind, not last where the schema happened to append it.
// Membership is typed; that none is missing is asserted in schema.test.ts - a
// tuple can't state that about itself.
const HIDE_DISPLAY_ORDER: readonly HideTarget[] = [
  'icon',
  'shape',
  'name',
  'value',
  'unit',
  'secondary_info',
  'progress_bar',
];

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
    Reflect.deleteProperty(fields, key);
  }
  return { ...section, fields };
};

const EditorFieldsType = {
  entity: field('entity'),
  entityName: field('entity_name'),
  stateContent: field('state_content'),
  text: field('text'),
  number: field('number'),
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

type ValueSource = 'standard' | 'entity' | 'jinja';
const valueSourceOf = (value: unknown): ValueSource => {
  if (!is.plainObject(value)) return 'standard';
  return is.nonEmptyString(jinjaOf(value as ValueConfig)) ? 'jinja' : 'entity';
};

const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

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
      resolveVirtual: (c: LovelaceConfig) => valueSourceOf(read(c)),
      onVirtualChange: (mode: ValueSource, config: LovelaceConfig) => {
        const current = read(config);
        const source = valueSourceOf(current);
        // Whatever `current` already is gets stashed into its own draft
        // slot before switching away - the mode not being entered keeps (or
        // refreshes) its draft, the one being entered consumes its own.
        const numberDraft = is.number(current) ? current : config[numberDraftKey];
        const entityDraft = source === 'entity' ? current : config[entityDraftKey];
        const jinjaDraft = source === 'jinja' ? jinjaOf(current as ValueConfig) : config[jinjaDraftKey];
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
// min_value/max_value read the shared Minimum/Maximum label - the same words
// the peak marks use (see PEAK_SHARED_LABEL).
// The shared labels this file points at most (see editor.shared in the
// translations): named once rather than repeated at every field.
const LABEL_COLOR = 'shared.col';
const LABEL_POSITION = 'shared.pos';
const LABEL_ATTRIBUTE = 'shared.attr';

const SHARED_VALUE_LABEL = { min_value: 'shared.min', max_value: 'shared.max' } as const;

const valueField = (
  key: 'min_value' | 'max_value',
  entityPath: string,
  numberOverrides: Record<string, unknown> = {},
) => {
  const modeType = `${key}_mode`;
  const attrType = `${toCamel(key)}Attribute`;
  const modeFields = valueModeField(
    modeType,
    (c) => c[key],
    (c, v) => ({ [key]: v }),
    key,
  );
  return {
    ...modeFields,
    // The source selector carries the option name; the inputs under it are the
    // same value read three ways, so they go unlabelled like the entity one.
    [modeType]: { ...modeFields[modeType], labelKey: SHARED_VALUE_LABEL[key] },
    [key]: EditorFieldsType.number(key, {
      noLabel: true,
      showIf: (c: LovelaceConfig) => valueSourceOf(c[key]) === 'standard',
      ...numberOverrides,
    }),
    [entityPath]: EditorFieldsType.entity(entityPath, {
      noLabel: true,
      showIf: (c: LovelaceConfig) => valueSourceOf(c[key]) === 'entity',
    }),
    [`${key}.attribute`]: EditorFieldsType.select(`${key}.attribute`, {
      type: attrType,
      selectorOf: entityPath,
      labelKey: LABEL_ATTRIBUTE,
      showIf: (c: LovelaceConfig) => is.nonEmptyString(entityOf(c[key])),
    }),
    [`${key}.jinja`]: EditorFieldsType.tpl(`${key}.jinja`, {
      noLabel: true,
      helper: true,
      helperKey: 'returns_number',
      showIf: (c: LovelaceConfig) => valueSourceOf(c[key]) === 'jinja',
    }),
  };
};

const valueRangeFields = () => ({
  ...valueField('min_value', MIN_VALUE_ENTITY_PATH, { default: CARD.config.value.min }),
  ...valueField('max_value', MAX_VALUE_ENTITY_PATH),
});

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
  const attrType = `${toCamel(`${parentKey}_${key}`)}Attribute`;
  const entityFieldName = `${parentKey}.${key}_entity`;
  // readValue/writeValue: with nestedUnder (watermark.low/.high - the value
  // sits one level deeper than alert_when.above/.below's, wrapped alongside
  // as/opacity/color siblings, see types.watermarkMark), a short-form value
  // (no wrapper) still reads fine, but every write settles into the wrapped
  // form from then on, preserving whatever siblings already exist.
  // markInner/isMarkOverride (not a bare nestedUnder-in-raw check): the only
  // real caller here is watermark, and an override object with no `value` set
  // yet (type/color touched first) must still read/write as one - see
  // schema.ts's own isMarkOverride comment for why the naive check broke it.
  const readValue = (c: LovelaceConfig): ValueConfig => {
    const raw = c[parentKey]?.[key];
    if (!nestedUnder) return raw;
    return markInner(raw as WatermarkMark) as ValueConfig;
  };
  const writeValue = (c: LovelaceConfig, newValue: unknown) => {
    if (!nestedUnder) return { ...c[parentKey], [key]: newValue };
    const raw = c[parentKey]?.[key];
    const wrapper = isMarkOverride(raw as WatermarkMark) ? raw : {};
    return { ...c[parentKey], [key]: { ...wrapper, [nestedUnder]: newValue } };
  };
  const source = (c: LovelaceConfig) => valueSourceOf(readValue(c));
  return {
    ...valueModeField(modeType, readValue, (c, v) => ({ [parentKey]: writeValue(c, v) }), `${parentKey}_${key}`, {
      showIf: isEnabled,
      standardDefault: defaultVal,
    }),
    [`${parentKey}.${key}`]: EditorFieldsType.number(`${parentKey}.${key}`, {
      showIf: (c: LovelaceConfig) => isEnabled(c) && source(c) === 'standard',
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
      showIf: (c: LovelaceConfig) => isEnabled(c) && source(c) === 'entity',
      resolveVirtual: (c: LovelaceConfig) => entityOf(readValue(c)) ?? '',
      onVirtualChange: (value: string, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: writeValue(config, value ? { ...(readValue(config) as object), entity: value } : defaultVal),
      }),
    }),
    [`${parentKey}.${key}_attribute`]: EditorFieldsType.select(`${parentKey}.${key}_attribute`, {
      type: attrType,
      virtual: true,
      selectorOf: entityPath,
      labelKey: LABEL_ATTRIBUTE,
      showIf: (c: LovelaceConfig) =>
        isEnabled(c) && source(c) === 'entity' && is.nonEmptyString(entityOf(readValue(c))),
      resolveVirtual: (c: LovelaceConfig) => attributeOf(readValue(c)) ?? '',
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
      showIf: (c: LovelaceConfig) => isEnabled(c) && source(c) === 'jinja',
      resolveVirtual: (c: LovelaceConfig) => jinjaOf(readValue(c)) ?? '',
      onVirtualChange: (value: string, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: writeValue(config, { jinja: value }),
      }),
    }),
  };
};

// Every attribute a mark can override on its parent: which ones each mark has,
// and whether its family's stands in for it, is MARK_FIELDS (schema.ts) - the
// table the card resolves marks by too. Read own, fall back to the parent's,
// factorise back up once every mark reading it agrees.
type CascadeField = MarkField;

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
  gate?: <K extends string>(adapter: OverrideCascadeAdapter<K>, key: K) => (config: LovelaceConfig) => boolean;
  // Which half of a mark's block the field belongs to: 'value' is how its
  // threshold is read and sits with the threshold itself, 'look' is how it is
  // drawn. Both builders render one section at a time.
  section?: 'value' | 'look';
  // The marks this input is offered to, when not all of them: peak_marker's
  // band picks a zone shape, its points a point one - same field, two lists.
  keys?: readonly string[];
  // What it shows unset, when not the family's default (the band's type).
  fallback?: unknown;
};

// Everything that differs between watermark's low/high sides and peak_marker's
// min/max/average marks - the field machinery below is shared verbatim.
type OverrideCascadeAdapter<K extends string> = {
  parentKey: string;
  keys: readonly K[];
  // Reads and writes the family: MARK_FACTORIZATION (schema.ts), the card's.
  factorization: Factorization;
  defaults: Record<string, unknown>;
  // A hidden mark has no opinion: peak_marker's three are shown one at a time
  // as often as not, and counting an absent one as "disagrees" kept every
  // value stuck on its own mark, global side empty.
  isActive: (config: LovelaceConfig, key: K) => boolean;
  // Absent means hidden here (peak's marks are opt-in), so turning one off
  // drops the key; a watermark side is shown unless `false`, which it keeps.
  optIn?: boolean;
  // What this family lets a mark override. watermark has `as` (its thresholds
  // are user-supplied, so how to read them is a choice); peak_marker's come
  // from history and have nothing to interpret.
  cascade: readonly CascadeSpec[];
};

// The fields a mark carries, each with whether its family's stands in for it.
const rulesOf = <K extends string>(adapter: OverrideCascadeAdapter<K>, key: K): Partial<Record<MarkField, boolean>> =>
  (MARK_FIELDS[adapter.parentKey as MarkFamily] as Record<string, Partial<Record<MarkField, boolean>>>)[key] ?? {};
const inheritsField = <K extends string>(adapter: OverrideCascadeAdapter<K>, key: K, field: CascadeField) =>
  rulesOf(adapter, key)[field] === true;

// The mark's own override, else the family's when it inherits it - the very
// resolve the card draws the mark with.
const effectiveValue = <K extends string>(
  adapter: OverrideCascadeAdapter<K>,
  config: LovelaceConfig,
  key: K,
  field: CascadeField,
) => adapter.factorization.resolve(config, key, field);

// A greyed hint only helps if it is what the field would actually use: the
// value inherited from just above, not the schema's own default two levels up.
const inheritedHint = (value: unknown): string => (value === undefined ? '' : String(value));

// Whether a mark is drawn as a line - the one place its thickness means
// anything - by the type it really uses, inherited or not.
const drawsLine =
  <K extends string>(adapter: OverrideCascadeAdapter<K>, key: K) =>
  (c: LovelaceConfig) =>
    (effectiveValue(adapter, c, key, 'type') ?? adapter.defaults.type) === 'line';

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
    fallback,
  }: CascadeSpec) => {
    const extra = gate?.(adapter, key);
    const inherits = inheritsField(adapter, key, field);
    const unset = fallback ?? adapter.defaults[field];
    const inherited = (c: LovelaceConfig) => (inherits ? c[adapter.parentKey]?.[field] : undefined);
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
        placeholder: (c: LovelaceConfig) => inheritedHint(inherited(c) ?? unset),
      }),
      resolveVirtual: (c: LovelaceConfig) =>
        effectiveValue(adapter, c, key, field) ?? (showsDefault ? unset : undefined),
      onVirtualChange: (value: unknown, config: LovelaceConfig) =>
        adapter.factorization.setLocal(config, key, field, value) as LovelaceConfig,
    });
  };
  // Offered where the table gives the mark the field, and the input is meant
  // for that mark.
  const offered = (spec: CascadeSpec) => spec.field in rulesOf(adapter, key) && (!spec.keys || spec.keys.includes(key));
  return Object.fromEntries(
    adapter.cascade
      .filter((spec) => (spec.section ?? 'look') === section && offered(spec))
      .map((spec) => [`${adapter.parentKey}.${key}_${spec.field}`, build(spec)]),
  );
};

// What every mark looks like, whatever kind it is - the band included, which
// is why this stands on its own rather than inside SHARED_CASCADE below.
const MARK_APPEARANCE: CascadeSpec[] = [
  { field: 'opacity', build: EditorFieldsType.decimal, opts: { type: 'opacity' } },
  {
    field: 'color',
    build: (name, opts) => EditorFieldsType.templateOrType(name, false, 'color', opts),
    labelKey: LABEL_COLOR,
  },
];

const typeSpec = (selectType: string, extra: Partial<CascadeSpec> = {}): CascadeSpec => ({
  field: 'type',
  build: EditorFieldsType.select,
  opts: { type: selectType },
  showsDefault: true,
  ...extra,
});

// Only exists for a mark drawn as a line; the row it shares with type closes
// itself when it goes (see EDITOR_BASE_STYLE).
const LINE_SIZE_SPEC: CascadeSpec = { field: 'line_size', build: EditorFieldsType.text, gate: drawsLine };

// The trio every mark family shares, spelled once. Each adapter appends its
// own extras rather than restating these.
const SHARED_CASCADE = (type: CascadeSpec): CascadeSpec[] => [type, LINE_SIZE_SPEC, ...MARK_APPEARANCE];

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
  const hidden = adapter.optIn ? undefined : false;
  return {
    [toggleKey]: EditorFieldsType.toggle(toggleKey, {
      virtual: true,
      showIf: gate,
      resolveVirtual: isShown,
      onVirtualChange: (value: boolean, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: { ...config[parentKey], [key]: value ? (config[draftKey] ?? shownValue) : hidden },
        [draftKey]: value ? undefined : config[parentKey]?.[key],
      }),
    }),
  };
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

const WATERMARK_CASCADE: OverrideCascadeAdapter<MarkId<'watermark'>> = {
  parentKey: 'watermark',
  keys: markIds('watermark'),
  factorization: MARK_FACTORIZATION.watermark,
  isActive: (config, side) => MARK_FACTORIZATION.watermark.votes(config, side),
  defaults: SCHEMA_DEFAULTS.watermark,
  cascade: [
    ...SHARED_CASCADE(typeSpec('watermark_type')),
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
  const valueFields = nestedValueField('watermark', side, entityPath, isEnabled, defaultVal, 'value');
  // No label on either: the toggle right above names the side, and repeating it
  // twice under itself said nothing. Re-keyed, not appended - an existing key
  // keeps its position, hence the panel order.
  return {
    ...markToggleField(WATERMARK_CASCADE, side, (c: LovelaceConfig) => Boolean(c.watermark), isShown, defaultVal),
    ...valueFields,
    [`watermark.${side}`]: { ...valueFields[`watermark.${side}`], noLabel: true },
    [`watermark.${side}_mode`]: { ...valueFields[`watermark.${side}_mode`], noLabel: true },
    ...overrideCascadeFields(WATERMARK_CASCADE, side, isEnabled, 'value'),
    ...overrideCascadeFields(WATERMARK_CASCADE, side, isEnabled, 'look'),
  };
};

// A tile feature with no entity of its own renders its tile's (cards.ts):
// EditorBase keeps that one under this key, which never reaches the YAML.
const CONTEXT_ENTITY_KEY = '_context_entity';
const effectiveEntity = (c: LovelaceConfig): string | undefined => {
  if (is.nonEmptyString(c.entity)) return c.entity;
  const inherited = c[CONTEXT_ENTITY_KEY];
  return is.nonEmptyString(inherited) ? inherited : undefined;
};

const peakMarkerEligible = (c: LovelaceConfig): boolean => hasUsableHistory(effectiveEntity(c), c.attribute);
const peakMarkerOn = (c: LovelaceConfig) => peakMarkerEligible(c) && Boolean(c.peak_marker);

const PEAK_MARKS = markIds('peak_marker').filter((mark): mark is PeakPoint => mark !== 'range');
// The three marks and the band, one family: the band is a mark whose type is
// its own (a zone shape) and has no line - MARK_FIELDS says so, not a second
// adapter, so a family value it still reads is never dropped behind its back.
const PEAK_MARKER_CASCADE: OverrideCascadeAdapter<MarkId<'peak_marker'>> = {
  parentKey: 'peak_marker',
  keys: markIds('peak_marker'),
  factorization: MARK_FACTORIZATION.peak_marker,
  isActive: (config, mark) => MARK_FACTORIZATION.peak_marker.votes(config, mark),
  optIn: true,
  defaults: SCHEMA_DEFAULTS.peakMarker,
  // No `as`: a peak's value comes from history, there is no threshold to read
  // one way or the other.
  cascade: [
    typeSpec('peak_marker_type', { keys: PEAK_MARKS }),
    typeSpec('peak_range_type', { keys: ['range'], fallback: SCHEMA_DEFAULTS.peakMarker.rangeType }),
    LINE_SIZE_SPEC,
    ...MARK_APPEARANCE,
  ],
};

// Independent of min/max being drawn: the band spans their values, which are
// measured whether or not their own marks are shown.
const peakRange = () => {
  const isShown = (c: LovelaceConfig) => PEAK_MARKER_CASCADE.isActive(c, 'range');
  return {
    ...markToggleField(PEAK_MARKER_CASCADE, 'range', peakMarkerOn, isShown, true),
    ...overrideCascadeFields(PEAK_MARKER_CASCADE, 'range', (c) => peakMarkerOn(c) && isShown(c), 'look'),
  };
};

// min and max say the same word as the min_value/max_value options above, so
// they read the same key - average has no such twin and keeps its own.
const PEAK_SHARED_LABEL: Partial<Record<PeakPoint, string>> = {
  min: 'shared.min',
  max: 'shared.max',
};

const peakMark = (mark: PeakPoint) => {
  const isShown = (c: LovelaceConfig) => PEAK_MARKER_CASCADE.isActive(c, mark);
  const isEnabled = (c: LovelaceConfig) => peakMarkerOn(c) && isShown(c);
  const toggle = markToggleField(PEAK_MARKER_CASCADE, mark, peakMarkerOn, isShown, true);
  const toggleKey = `peak_marker.${mark}_toggle`;
  const shared = PEAK_SHARED_LABEL[mark];
  return {
    ...toggle,
    ...(shared ? { [toggleKey]: { ...toggle[toggleKey], labelKey: shared } } : {}),
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
// Badge and badgeTemplate opt out (see YamlSchemaFactory's own
// .delete(['multiline'])): the row is too small for a second line there.
// density: compact/single_line clear it too (see schema.ts's applyDensityRule).
const multilineField = (badge: boolean) =>
  badge
    ? {}
    : {
        multiline: EditorFieldsType.toggle('multiline', {
          showIf: (c: LovelaceConfig) => !DENSITY_SINGLE_ROW.includes(c.density as string),
        }),
      };

// Anything past a bare `true` is spelled out as the object.
const writeCenterZero = (config: LovelaceConfig, zeroValue: number, growthPercent: boolean) => ({
  ...config,
  center_zero: zeroValue || growthPercent ? { value: zeroValue, growth_percent: growthPercent } : true,
});

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
    resolveVirtual: (c: LovelaceConfig) => resolveCenterZero(c.center_zero).zeroValue,
    onVirtualChange: (value: number, config: LovelaceConfig) =>
      writeCenterZero(config, Number(value) || 0, resolveCenterZero(config.center_zero).growthPercent),
  }),
  center_zero_growth_percent: EditorFieldsType.toggle('center_zero_growth_percent', {
    target: 'center_zero',
    showIf: (c: LovelaceConfig) => Boolean(c.center_zero),
    virtual: true,
    resolveVirtual: (c: LovelaceConfig) => resolveCenterZero(c.center_zero).growthPercent,
    onVirtualChange: (value: boolean, config: LovelaceConfig) =>
      writeCenterZero(config, resolveCenterZero(config.center_zero).zeroValue, value),
  }),
});

// icon_animation is an effect name, or { effect, jinja }.
const animationEffect = (value: unknown) => (is.plainObject(value) ? value.effect : value);

const badgeShown = (c: LovelaceConfig) => Boolean(c.badge_icon) || Boolean(c.badge_color);

const barScaleField = () => ({
  bar_scale: EditorFieldsType.select('bar_scale', { width: 'half', showIf: (c: LovelaceConfig) => !c.center_zero }),
});

const barSegmentsField = () => ({
  bar_segments: EditorFieldsType.number('bar_segments', {
    type: 'bar_segments',
    width: 'half',
    showIf: HAS_EFFECT.barSegments,
  }),
});

// Virtual: status_label's bare-string shorthand is past what the generic
// dot-path machinery reads (see statusLabelObj/rewrapStatusLabel, schema.ts).
const statusLabelField = (
  key: 'jinja' | 'position' | 'color_source',
  fallback: string,
  opts: Record<string, unknown>,
) => {
  const name = `status_label.${key}`;
  return {
    [name]: {
      name,
      virtual: true,
      showIf: (c: LovelaceConfig) => Boolean(c.status_label),
      resolveVirtual: (c: LovelaceConfig) => statusLabelObj(c.status_label)[key] ?? fallback,
      onVirtualChange: (value: string, config: LovelaceConfig) => {
        const patch: Partial<Record<typeof key, string>> = {};
        patch[key] = value;
        return { ...config, status_label: rewrapStatusLabel(config.status_label, patch) };
      },
      ...opts,
    },
  };
};

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
      entity: EditorFieldsType.entity('entity', { labelKey: 'shared.ent', required: !template }),
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
          labelKey: LABEL_ATTRIBUTE,
          showIf: (c: LovelaceConfig) => Boolean(effectiveEntity(c)),
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
            ...multilineField(badge),
            percent: EditorFieldsType.tpl('percent'),
          }
        : {
            ...(() => {
              // disable_unit is deprecated (see
              // BaseConfigHelper.#logDeprecatedOption): 'unit' is now just
              // another hide target, folded into hide by _customizeConfig.
              // The disable_unit check here only matters for a legacy raw
              // config on first load, before that fold has round-tripped
              // through the editor's own config-changed.
              const unitSpacingShown = (c: LovelaceConfig) =>
                !(c.disable_unit || (is.array(c.hide) && c.hide.includes('unit')));
              return {
                decimal: EditorFieldsType.decimal('decimal', {
                  width: 'half',
                  placeholder: (_c: LovelaceConfig, neg: Config) =>
                    neg?.resolvedDecimal == null ? '' : String(neg.resolvedDecimal),
                }),
                unit: EditorFieldsType.text('unit', {
                  width: 'half',
                  placeholder: (_c: LovelaceConfig, neg: Config) => (neg?.resolvedUnit as string) ?? '',
                }),
                unit_position: EditorFieldsType.select('unit_position', {
                  type: 'unit_position',
                  labelKey: LABEL_POSITION,
                  width: 'half',
                  showIf: unitSpacingShown,
                }),
                unit_spacing: EditorFieldsType.select('unit_spacing', {
                  type: 'unit_spacing',
                  width: 'half',
                  showIf: unitSpacingShown,
                }),
              };
            })(),
            value_compact: EditorFieldsType.toggle('value_compact'),
            value_sign: EditorFieldsType.toggle('value_sign'),
            ...valueRangeFields(),
            state_content: EditorFieldsType.stateContent('state_content', { context: { filter_entity: 'entity' } }),
            custom_info: EditorFieldsType.tpl('custom_info', {
              helper: true,
            }),
            ...multilineField(badge),
            reverse: EditorFieldsType.toggle('reverse', {
              showIf: (c: LovelaceConfig) => {
                const entity = effectiveEntity(c);
                return (
                  entity !== undefined && domainProfile(HassProviderSingleton.getEntityDomain(entity)).kind === 'timer'
                );
              },
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
              return {
                ...config,
                theme: nextTheme,
                _theme_draft: wantsCustom ? (config.theme ?? config._theme_draft) : undefined,
                custom_theme: wantsCustom ? (config._custom_theme_draft ?? config.custom_theme ?? []) : undefined,
                _custom_theme_draft: wantsCustom ? undefined : (config.custom_theme ?? config._custom_theme_draft),
              };
            },
          },
          theme: EditorFieldsType.select('theme', {
            showIf: (c: LovelaceConfig) => !is.array(c.custom_theme),
          }),
          custom_theme: {
            name: 'custom_theme',
            type: 'custom_theme_editor',
            showIf: (c: LovelaceConfig) => is.array(c.custom_theme),
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
    // value omitted clears the key - same object either way, one less literal
    // `undefined` at the call sites that mean "unset".
    const write = (c: LovelaceConfig, value?: unknown) => ({ ...c, [key]: value });
    const parsed = (c: LovelaceConfig) => parseLength(read(c));
    const gate = (c: LovelaceConfig) => (showIf ? showIf(c) : true);
    // The toggle only ever writes the literal 'auto' (see below) - a custom
    // value that came from elsewhere (YAML calc(), an unknown unit…) still
    // falls back to the raw text field below.
    const isAutoToggled = (c: LovelaceConfig) => customToggle && read(c) === 'auto';
    const hasUnit = units.length > 1; // a single unit (e.g. px) needs no dropdown
    // Where the length goes while custom mode holds the key (see below).
    const customDraftKey = `_${key}_length_draft`;
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
          value
            ? { ...write(config, 'auto'), [customDraftKey]: read(config) }
            : { ...write(config, config[customDraftKey]), [customDraftKey]: undefined },
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
            showIf: HAS_EFFECT.barColorMode,
            width: 'full',
          }),
          interpolate: EditorFieldsType.toggle('interpolate', {
            showIf: HAS_EFFECT.interpolate,
            width: 'full',
          }),
        },

  themeCardOnlyFields: (template: boolean, badge: boolean) =>
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
            resolveVirtual: (c: LovelaceConfig) => animationEffect(c.icon_animation) ?? '',
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
              const effect = animationEffect(current);
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
            onVirtualChange: (value: string, config: LovelaceConfig) => ({
              ...config,
              icon_animation: { effect: animationEffect(config.icon_animation), jinja: value || '' },
            }),
          }),
          ...circularBackgroundField(),
          bar_group: EditorFieldsType.sectionLabel('bar_group', { labelKey: 'shared.bar' }),
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
            labelKey: LABEL_POSITION,
            width: 'half',
            showIf: (c: LovelaceConfig) => c.density !== 'single_line',
          }),
        },

  // Not on a badge: both are deleted from its schema (YamlSchemaFactory.badge).
  themeSingleLineShadowFields: (badge: boolean) =>
    badge
      ? {}
      : {
          // Both full width (the default): text_shadow shows alone under
          // 'background', where bar_single_line does not - and a half-width
          // toggle alone on its row only reads as a hole beside a long label.
          bar_single_line: EditorFieldsType.toggle('bar_single_line', { showIf: HAS_EFFECT.barSingleLine }),
          text_shadow: EditorFieldsType.toggle('text_shadow', { showIf: HAS_EFFECT.textShadow }),
        },

  // Not on a badge: without a 'layout' key it never gets the 'horizontal'
  // class, so the option would be inert there.
  themeMaxWidthFields: (badge: boolean) => {
    if (badge) return {};
    return {
      bar_max_width_toggle: EditorFieldsType.toggle('bar_max_width_toggle', {
        virtual: true,
        showIf: HAS_EFFECT.barMaxWidth,
        resolveVirtual: (c: LovelaceConfig) => Boolean(c.bar_max_width),
        onVirtualChange: draftToggle('bar_max_width', () => '300px'),
      }),
      // The toggle above carries the "Bar max width" label, so the slider is
      // noLabel. Same length component as min_width/height, locked to px (a
      // single unit needs no dropdown).
      ...EditorFactory.lengthField('bar_max_width', {
        units: ['px', '%'],
        noLabel: true,
        showIf: (c: LovelaceConfig) => HAS_EFFECT.barMaxWidth(c) && Boolean(c.bar_max_width),
      }),
    };
  },

  // Not gated on `template` - watermarkSchema is the exact same shape for
  // Card and Template (see YamlSchemaFactory.card/.template), and wmSide's
  // toggle/entity/jinja machinery only ever reads config.watermark.*, so
  // nothing here is Card-specific.
  themeWatermarkFields: () => {
    const watermarkOn = (c: LovelaceConfig) => Boolean(c.watermark);
    return {
      ...enabledToggleField(
        'watermark.toggle',
        watermarkOn,
        draftToggle('watermark', () => ({})),
        { noLabel: true },
      ),
      // No family-level fields: watermark.type/.color/... is where the sides'
      // agreement ends up (MARK_FACTORIZATION), edited on the sides themselves.
      // ── LOW / HIGH groups (generated by wmSide) ────────────────────
      ...wmSide('low', 20),
      ...wmSide('high', 80),
    };
  },

  // peak_marker: min/max/average from HA history (Card only, cards.ts's
  // _seedPeakMarkerHistoryOnce) - toggle + window + the family's own global
  // cascade, then the 3 marks (peakMark).
  peakMarkerFields: () => ({
    // Replaces the toggle entirely when an entity is picked but ineligible
    // (see peakMarkerEligible) - spells out the requirement instead of just
    // hiding the option with no explanation.
    peak_marker_unsupported: EditorFieldsType.sectionLabel('peak_marker_unsupported', {
      showIf: (c: LovelaceConfig) => Boolean(effectiveEntity(c)) && !peakMarkerEligible(c),
    }),
    ...enabledToggleField(
      'peak_marker.toggle',
      (c) => Boolean(c.peak_marker),
      draftToggle('peak_marker', () => ({ window: SCHEMA_DEFAULTS.peakMarker.window })),
      { showIf: peakMarkerEligible, noLabel: true },
    ),
    ...durationFields('peak_marker', 'window', peakMarkerOn),
    ...peakMark('min'),
    ...peakMark('max'),
    ...peakMark('average'),
    ...peakRange(),
  }),

  // trend_indicator: boolean | { window?, basis, threshold, colored,
  // up_color, down_color, flat_color } (Card + Template, schema.ts) - toggle
  // gates the feature, Simple/Advanced picks the plain boolean vs the object
  // form. window stays optional within Advanced (own reveal toggle), unlike
  // peak_marker's own required window.
  trendIndicatorFields: () => {
    const on = (c: LovelaceConfig) => Boolean(c.trend_indicator);
    const advanced = (c: LovelaceConfig) => is.plainObject(c.trend_indicator);
    const trendColor = (name: string) =>
      EditorFieldsType.templateOrType(name, false, 'color', { showIf: advanced, width: 'half' });
    return {
      ...enabledToggleField(
        'trend_indicator.toggle',
        on,
        draftToggle('trend_indicator', () => true),
        {
          showIf: HAS_EFFECT.trendIndicator,
        },
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
      'trend_indicator.up_color': trendColor('trend_indicator.up_color'),
      'trend_indicator.down_color': trendColor('trend_indicator.down_color'),
      'trend_indicator.flat_color': trendColor('trend_indicator.flat_color'),
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
          ...enabledToggleField('badge.toggle', badgeShown, (value, config) =>
            draftToggle('badge_color', () => undefined)(value, draftToggle('badge_icon', () => '{{ }}')(value, config)),
          ),
          badge_icon: EditorFieldsType.tpl('badge_icon', {
            noLabel: true,
            helper: true,
            showIf: badgeShown,
          }),
          'badge.color_toggle': EditorFieldsType.toggle('badge.color_toggle', {
            virtual: true,
            showIf: badgeShown,
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
            labelKey: LABEL_COLOR,
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
  // A badge takes both too (YamlSchemaFactory.badge keeps them).
  themeCardLayoutFields: () => ({
    frameless: EditorFieldsType.toggle('frameless', { width: 'half' }),
    marginless: EditorFieldsType.toggle('marginless', { width: 'half' }),
  }),

  // A "Card size" toggle that reveals min_width (+ height on cards) without
  // forcing a value: `_show_size` is ephemeral UI state, same pattern as
  // `_visible_actions`. Also reads as on when a value already exists.
  cardSizeFields: (badge: boolean) => {
    const shown = (c: LovelaceConfig) => Boolean(c._show_size || c.min_width || c.height);
    // Both lengths parked together while the section is off - same draft
    // precedent as every other toggle here, and closing the section used to
    // discard them outright.
    const draftKey = '_card_size_draft';
    const draftOf = (c: LovelaceConfig) => (is.plainObject(c[draftKey]) ? (c[draftKey] as object) : null);
    return {
      card_size_toggle: {
        name: 'card_size_toggle',
        type: 'toggle',
        virtual: true,
        resolveVirtual: shown,
        onVirtualChange: (value: boolean, config: LovelaceConfig) =>
          value
            ? {
                ...config,
                _show_size: true,
                // Nothing parked: open on the height the card already has, so
                // one opts into fixing it rather than inheriting a number.
                ...(draftOf(config) ?? (badge ? {} : { height: 'auto' })),
                [draftKey]: undefined,
              }
            : {
                ...config,
                _show_size: undefined,
                min_width: undefined,
                height: undefined,
                [draftKey]: { min_width: config.min_width, height: config.height },
              },
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

  themeLayoutField: (badge: boolean) =>
    badge
      ? {}
      : {
          layout: EditorFieldsType.select('layout', {
            // Picking vertical wins over a single_line card rather than being
            // undone by applyDensityConstraints on the next keystroke: the
            // density goes back to default, and its chip list loses
            // single_line for as long as the layout stays vertical.
            onChange: (value: unknown, config: LovelaceConfig) =>
              value === CARD.layout.orientations.vertical.label && config.density === 'single_line'
                ? { ...config, density: undefined }
                : config,
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

  // What the color pickers give way to: a custom theme counts from the moment
  // it is entered, zones or not (unlike HAS_EFFECT.barColorMode).
  themeActive: (c: LovelaceConfig) => !is.nullish(c.theme) || is.array(c.custom_theme),

  // Template rejects 'unit'; Badge/BadgeTemplate lack 'shape' (see schema.ts).
  // The set is the schema's own hide list for that variant - only the order is
  // the editor's: shape sits next to the icon it draws behind, not last where
  // it happened to be appended.
  hideChipsItems: (variant: SchemaVariant): string[] => {
    const allowed = new Set(schemaOptions(variant, 'hide'));
    return HIDE_DISPLAY_ORDER.filter((item) => allowed.has(item));
  },

  // The schema's own densityOverrides (issue #134), applied the moment density
  // changes; a forced default is written as no key, like an emptied field.
  applyDensityConstraints: (config: LovelaceConfig): LovelaceConfig => {
    const next = { ...config };
    for (const [key, value] of Object.entries(densityOverrides(config))) {
      if (value === YamlSchemaFactory.card.fieldDefault(key)) Reflect.deleteProperty(next, key);
      else next[key] = value;
    }
    return next;
  },

  // bar_orientation/bar_size/bar_color/bar_segments/bar_scale's row-partner
  // logic, pulled out of theme() for the same cognitive-complexity reason as
  // every other themeXxxFields() here. See each field's own width comment
  // for its pairing - bar_orientation stays a flat half, always.
  themeBarSizingFields: (template: boolean, badge: boolean) => {
    const themeActive = EditorFactory.themeActive;
    return {
      // A badge's bar_position (inline or around its icon) sits here, not in
      // themeCardOnlyFields, which carries every other card's.
      ...(badge
        ? {
            bar_group: EditorFieldsType.sectionLabel('bar_group', { labelKey: 'shared.bar' }),
            bar_position: EditorFieldsType.select('bar_position', {
              type: 'bar_position_badge',
              labelKey: LABEL_POSITION,
              width: 'half',
            }),
          }
        : {}),
      bar_orientation: EditorFieldsType.select('bar_orientation', {
        // Badge/Badge Template have no bar_position/layout: 'up' never applies.
        type: badge
          ? 'bar_orientation_no_up'
          : (c: LovelaceConfig) => (HAS_EFFECT.barOrientationUp(c) ? 'bar_orientation' : 'bar_orientation_no_up'),
        width: 'half',
      }),
      bar_size: EditorFieldsType.select('bar_size', {
        ...EditorFactory.badgeRestrictedType(badge, 'bar_size_no_xlarge'),
        width: 'half',
        // Shown, it always sits next to bar_segments: bar_single_line and
        // text_shadow need the very positions it is hidden in.
        showIf: HAS_EFFECT.barSize,
      }),
      bar_color: EditorFieldsType.templateOrType('bar_color', template, 'color_state_default', {
        // One 'Color' label for every color field: the panel it sits in says
        // which color it is, the field name would only repeat it.
        labelKey: LABEL_COLOR,
        showIf: (c: LovelaceConfig) => !themeActive(c),
        // Full-width once bar_size (its row partner) hides for the same
        // bar_position values.
        ...(template ? { helper: true, helperKey: 'color' } : { width: 'half' }),
      }),
      ...EditorFactory.themeSingleLineShadowFields(badge),
      ...barSegmentsField(),
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
    return {
      title: TITLE.theme,
      icon: HA_CONTEXT.icons.listBox,
      fields: {
        ...EditorFactory.themeModeFields(template),
        ...EditorFactory.themeColorModeFields(template),
        // Pendant to bar_group below: the panel runs theme, then the icon, then
        // the bar, and only the bar half said so.
        // The heading over the icon fields says the same word the icon field
        // itself does - one key, two places.
        icon_group: EditorFieldsType.sectionLabel('icon_group', { labelKey: 'icon' }),
        // Half-width to pair with `color` below - but `color` hides once a
        // theme/custom_theme is active, so `icon` needs to reclaim the full
        // row then. Card: always half now, whether or not `color` is
        // actually showing (matches bar_orientation/bar_size below). Badge
        // keeps the old theme-aware behavior (full once `color` hides).
        icon: EditorFieldsType.templateOrType('icon', template, 'icon', {
          ...(template
            ? // Right under the icon_group heading, which already says 'Icon' -
              // labelling it too said the word twice in a row.
              { helper: true, noLabel: true }
            : {
                width: 'half',
              }),
        }),
        color: EditorFieldsType.templateOrType('color', template, 'color_state_default', {
          labelKey: LABEL_COLOR,
          showIf: (c: LovelaceConfig) => !EditorFactory.themeActive(c),
          ...(template ? { helper: true } : { width: 'half' }),
        }),
        ...EditorFactory.themeCardOnlyFields(template, badge),
        ...EditorFactory.themeBarSizingFields(template, badge),
        // Not in YamlSchemaFactory.template: percent comes straight from Jinja
        // there, so the log/linear min-max mapping this drives has nothing to
        // act on - showing it would silently do nothing on save (same trap as
        // #111's min_value/max_value on a template card).
        ...(!template ? barScaleField() : {}),
        ...EditorFactory.themeMaxWidthFields(badge),
        reverse_secondary_info_row: EditorFieldsType.toggle('reverse_secondary_info_row', {
          showIf: HAS_EFFECT.reverseSecondaryInfoRow,
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
    ...statusLabelField('jinja', '', { type: 'template', noLabel: true, helper: true }),
    // Same word as the badge's own position field, one key for both.
    ...statusLabelField('position', 'right', { type: 'label_position', labelKey: LABEL_POSITION, width: 'half' }),
    // The pill's color when its jinja returns no {label, color}
    // (HACore._repaintStatusLabel).
    ...statusLabelField('color_source', 'bar', { type: 'status_label_color_source', width: 'half' }),
  }),

  // One panel per marker family, split out of the single "Markers" panel it
  // used to be: watermark and peak_marker each fill one on their own, the
  // three small ones share Indicators, alert_when keeps its own. Beyond the
  // scrolling, a collapsed panel is skipped by EditorDOMHelper.updateAll -
  // editing a watermark no longer re-evaluates every alert field on each
  // keystroke.
  // The bar's two marker panels. Shared because buildFeature() below composes
  // its own section list and would otherwise carry a second copy of their
  // title and icon - only what peak_marker has to show legitimately differs.
  markerPanels: (peakFields: Record<string, unknown>) => ({
    watermark: {
      title: TITLE.watermark,
      icon: HA_CONTEXT.icons.radar,
      fields: EditorFactory.themeWatermarkFields(),
    },
    peak_marker: {
      title: TITLE.peakMarker,
      icon: HA_CONTEXT.icons.chartBellCurve,
      fields: peakFields,
    },
  }),

  markers: (template: boolean, badge: boolean) =>
    nonEmptySections({
      // Card only (core.ts's _seedPeakMarkerHistoryOnce, schema.ts's peakMarker
      // comment) - Badge/Template have no history-seeding pipeline.
      ...EditorFactory.markerPanels(!template && !badge ? EditorFactory.peakMarkerFields() : {}),
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
          // Card + Template only, like trend_indicator whose corner it takes:
          // too small a scale to read well on a badge.
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
      ...EditorFactory.themeLayoutField(badge),
      // min_width (+ height on cards) behind a "Card size" reveal toggle. Not
      // gated on `badge` for min_width - valid for badges too (not in
      // YamlSchemaFactory.badge's delete list).
      ...EditorFactory.cardSizeFields(badge),
      ...EditorFactory.themeCardLayoutFields(),
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
      is.array(c._visible_actions) && c._visible_actions.includes(key);
    const isShown = (key: string) => (c: LovelaceConfig, n: Config) => isRevealed(key)(c) || isActive(key)(c, n);
    const optionalKeys = iconActions
      ? ['hold_action', 'double_tap_action', 'icon_hold_action', 'icon_double_tap_action']
      : ['hold_action', 'double_tap_action'];
    // Hidden = neither active nor revealed. n defaults to c: resolveVirtual
    // has no negotiated, unlike showIf.
    const hiddenKeys = (c: LovelaceConfig, n: Config = c as unknown as Config) =>
      optionalKeys.filter((k) => !isShown(k)(c, n));
    return {
      title: TITLE.interaction,
      icon: HA_CONTEXT.icons.gestureTapHold,
      fields: {
        tap_action: EditorFieldsType.action('tap_action', { labelKey: 'action.tap' }),
        hold_action: EditorFieldsType.action('hold_action', {
          labelKey: 'action.hold',
          showIf: isShown('hold_action'),
        }),
        double_tap_action: EditorFieldsType.action('double_tap_action', {
          labelKey: 'action.double_tap',
          showIf: isShown('double_tap_action'),
        }),
        ...(iconActions
          ? {
              icon_tap_action: EditorFieldsType.action('icon_tap_action', { labelKey: 'action.icon_tap' }),
              icon_hold_action: EditorFieldsType.action('icon_hold_action', {
                labelKey: 'action.icon_hold',
                showIf: isShown('icon_hold_action'),
              }),
              icon_double_tap_action: EditorFieldsType.action('icon_double_tap_action', {
                labelKey: 'action.icon_double_tap',
                showIf: isShown('icon_double_tap_action'),
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
            visible: is.array(c._visible_actions) ? c._visible_actions : [],
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
    const entity = EditorFieldsType.entity('entity', {
      labelKey: 'shared.ent',
      required: false,
      helper: true,
      helperKey: 'feature_entity',
    });
    return {
      general: { ...general, fields: { ...general.fields, entity } },
      content: {
        title: TITLE.content,
        icon: HA_CONTEXT.icons.textShort,
        fields: valueRangeFields(),
      },
      theme: {
        title: TITLE.theme,
        icon: HA_CONTEXT.icons.listBox,
        fields: {
          ...EditorFactory.themeModeFields(false),
          ...EditorFactory.themeColorModeFields(false),
          bar_color: EditorFieldsType.templateOrType('bar_color', false, 'color_state_default', {
            labelKey: LABEL_COLOR,
            showIf: (c: LovelaceConfig) => !EditorFactory.themeActive(c),
            width: 'half',
          }),
          bar_orientation: EditorFieldsType.select('bar_orientation', {
            type: 'bar_orientation_no_up',
            width: 'half',
          }),
          bar_size: EditorFieldsType.select('bar_size', { width: 'half', showIf: HAS_EFFECT.barSize }),
          bar_position: EditorFieldsType.select('bar_position', {
            type: 'bar_position_feature',
            labelKey: LABEL_POSITION,
            width: 'half',
          }),
          ...barSegmentsField(),
          ...barScaleField(),
          ...centerZeroFields(),
          ...EditorFactory.barEffectFields(),
        },
      },
      ...EditorFactory.markerPanels(EditorFactory.peakMarkerFields()),
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
    // The aggregator's own: rows, the grid span a Feature doesn't have (one HA
    // row, see _applySizing), and bar_aligned, which lines its rows up.
    layout: {
      title: TITLE.layout,
      icon: HA_CONTEXT.icons.aspectRatio,
      fields: {
        ...(feature ? {} : { rows: EditorFieldsType.number('rows', { width: 'half' }) }),
        // On when unset (the Multi's default); off writes false. A name written
        // in YAML survives an off/on. bar_max_width leaves nothing to align.
        bar_aligned: EditorFieldsType.toggle('bar_aligned', {
          virtual: true,
          showIf: (c: LovelaceConfig) => !c.bar_max_width,
          resolveVirtual: (c: LovelaceConfig) => Boolean(c.bar_aligned ?? true),
          onVirtualChange: (value: boolean, config: LovelaceConfig): LovelaceConfig => ({
            ...config,
            bar_aligned: value ? config._bar_aligned_draft : false,
            _bar_aligned_draft: value ? undefined : config.bar_aligned,
          }),
        }),
      },
    },
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

export { EditorFactory, effectiveEntity, CONTEXT_ENTITY_KEY };
