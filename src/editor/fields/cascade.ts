import { WATERMARK_ENTITY_PATHS } from '../../utils/parameters.js';
import { type LovelaceConfig } from '../../utils/types.js';
import {
  SCHEMA_DEFAULTS,
  MARK_FIELDS,
  MARK_FACTORIZATION,
  markIds,
  type MarkField,
  type MarkFamily,
  type MarkId,
  type PeakPoint,
} from '../../card/config/schema.js';
import { type Factorization } from '../../card/config/factorization.js';
import { EditorFieldsType, LABEL_COLOR, PEAK_MARKS, peakMarkerOn, PEAK_SHARED_LABEL } from './base.js';
import { nestedValueField } from './value.js';

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

export { wmSide, peakRange, peakMark };
