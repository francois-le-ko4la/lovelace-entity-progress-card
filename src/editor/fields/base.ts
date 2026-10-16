import { type HideTarget } from '../../utils/parameters.js';
import { is } from '../../utils/common-checks.js';
import { type LovelaceConfig, type Config } from '../../utils/types.js';
import { type SchemaVariant, markIds, type PeakPoint } from '../../card/config/schema.js';
import { hasUsableHistory } from '../../card/values/entity-helper.js';

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
const BAR_MARK_PREFIXES = ['watermark.', 'watermark_', 'peak_marker.', 'peak_marker_', 'bar_ring.'];

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

const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

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

// A tile feature with no entity of its own renders its tile's (features.ts):
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

// min and max say the same word as the min_value/max_value options above, so
// they read the same key - average has no such twin and keeps its own.
const PEAK_SHARED_LABEL: Partial<Record<PeakPoint, string>> = {
  min: 'shared.min',
  max: 'shared.max',
};

// alert_when.above/.below - same explicit shape as min_value/max_value/
// watermark.low/high, via the shared nestedValueField above. Unlike
// watermark there's no per-side disable toggle or _as/_color options - just
// the value itself - and no numeric default to fall back to (alert_when.
// above/below are genuinely optional).
// Simple mode only - Advanced mode (alert_when.jinja) replaces above/below
// as the trigger entirely, see alertModeField below.
const isAlertSimple = (c: LovelaceConfig) => Boolean(c.alert_when) && !is.nonEmptyString(c.alert_when?.jinja);

// Anything past a bare `true` is spelled out as the object.
const writeCenterZero = (config: LovelaceConfig, zeroValue: number, growthPercent: boolean) => ({
  ...config,
  center_zero: zeroValue || growthPercent ? { value: zeroValue, growth_percent: growthPercent } : true,
});

// icon_animation is an effect name, or { effect, jinja }.
const animationEffect = (value: unknown) => (is.plainObject(value) ? value.effect : value);

const badgeShown = (c: LovelaceConfig) => Boolean(c.badge_icon) || Boolean(c.badge_color);

export {
  gateOnHide,
  HIDE_DEPENDENTS,
  BAR_MARK_PREFIXES,
  TITLE,
  MARKER_SECTIONS,
  FEATURE_ROW_DROPPED_SECTIONS,
  nonEmptySections,
  cardVariant,
  HIDE_DISPLAY_ORDER,
  DENSITY_SINGLE_ROW,
  dropFields,
  EditorFieldsType,
  enabledToggleField,
  toCamel,
  LABEL_COLOR,
  LABEL_POSITION,
  LABEL_ATTRIBUTE,
  SHARED_VALUE_LABEL,
  draftToggle,
  CONTEXT_ENTITY_KEY,
  effectiveEntity,
  peakMarkerEligible,
  peakMarkerOn,
  PEAK_MARKS,
  PEAK_SHARED_LABEL,
  isAlertSimple,
  writeCenterZero,
  animationEffect,
  badgeShown,
};
