import { is } from '../../../utils/common-checks.js';

// The shape every numericEntityOrJinja()-typed field produces (min_value/
// max_value/watermark.low/.high/alert_when.above/.below) - flattened
// (entity/attribute/jinja all optional siblings on one object) rather than
// the discriminated union the validator itself actually checks, matching
// boundFrom's own parameter shape. Exported
// so consumers can read one sub-field without re-deriving the same
// union-narrowing check each time (see entityOf/attributeOf/jinjaOf below).
type ValueConfig = number | { entity?: string; attribute?: string; jinja?: string } | undefined;

const entityOf = (cfg: ValueConfig): string | undefined => (is.plainObject(cfg) ? (cfg.entity as string) : undefined);

const attributeOf = (cfg: ValueConfig): string | undefined =>
  is.plainObject(cfg) ? (cfg.attribute as string) : undefined;

const jinjaOf = (cfg: ValueConfig): string | undefined => (is.plainObject(cfg) ? (cfg.jinja as string) : undefined);

// watermark.low/.high's own shape (types.watermarkMark): false (hidden) |
// true | ValueConfig (value only) | { value, as, type, opacity, color }
// (per-mark override). mark*() reads through it the same way entityOf/etc.
// do above.
type WatermarkMarkOverride = {
  value?: ValueConfig;
  as?: string;
  type?: string;
  opacity?: number;
  color?: string;
  line_size?: string;
};

type WatermarkMark = boolean | ValueConfig | WatermarkMarkOverride;

// A peak mark carries no threshold of its own (its value is the measured
// min/max/average) and takes a bare string as a color shorthand. Everything
// else it can override is WatermarkMarkOverride's, so the mark* helpers below
// serve both - see Mark.
type PeakMark = boolean | string | WatermarkMarkOverride | undefined;

type Mark = WatermarkMark | PeakMark;

// Discriminates the override object from ValueConfig's own {entity,
// attribute,jinja} shape - both are plain objects, so this checks for the
// absence of ValueConfig's own keys rather than the presence of `value`:
// `{ color: 'white' }` alone (no `value`) is still an override, defaulting
// its threshold like `watermark: {}` itself always has.
const isMarkOverride = (mark: Mark): mark is WatermarkMarkOverride =>
  is.plainObject(mark) && !('entity' in mark) && !('jinja' in mark);

// Nests a flattened `{ entity, attribute, color }` under `value` - otherwise
// the union's bare-ValueConfig branch matches first and drops `color`.
const nestValueShapeUnderValue = (mark: unknown): unknown => {
  if (!is.plainObject(mark)) return mark;
  const { entity, attribute, jinja, ...rest } = mark as Record<string, unknown>;
  if ((entity === undefined && jinja === undefined) || Object.keys(rest).length === 0) return mark;
  return { ...rest, value: { ...(entity !== undefined ? { entity, attribute } : { jinja }) } };
};

const markShown = (mark: WatermarkMark): boolean => mark !== false;

// What a mark holds, wrapper or not. markValue below adds the default and the
// boolean branch on top; callers that only need the unwrap use this, rather
// than spelling the ternary out again in their own module.
const markInner = (mark: Mark): unknown => (isMarkOverride(mark) ? mark.value : mark);

const markValue = (mark: WatermarkMark, defaultValue: number): ValueConfig =>
  isMarkOverride(mark)
    ? ((mark.value as ValueConfig) ?? defaultValue)
    : is.boolean(mark)
      ? defaultValue
      : (mark as ValueConfig);

// Every field a mark carries at two levels - its own, else its family's - and
// whether the family's stands in for it. The one table the card resolves a mark
// by (resolveMarkField) and the editor cascades it by (factory.ts): a field
// known to one side only was how watermark.as came to be ignored.
const MARK_FIELD_NAMES = ['type', 'line_size', 'opacity', 'color', 'as'] as const;

type MarkField = (typeof MARK_FIELD_NAMES)[number];

type MarkFieldRules = Partial<Record<MarkField, boolean>>;

const POINT_MARK: MarkFieldRules = { type: true, line_size: true, opacity: true, color: true };

const MARK_FIELDS = {
  watermark: { low: { ...POINT_MARK, as: true }, high: { ...POINT_MARK, as: true } },
  // The band's type is a zone shape, never the family's point one.
  peak_marker: {
    min: POINT_MARK,
    max: POINT_MARK,
    average: POINT_MARK,
    range: { type: false, opacity: true, color: true },
  },
} satisfies Record<string, Record<string, MarkFieldRules>>;

type MarkFamily = keyof typeof MARK_FIELDS;

// A family's marks, as the table lists them - the one list of them there is.
type MarkId<F extends MarkFamily> = keyof (typeof MARK_FIELDS)[F] & string;

const markIds = <F extends MarkFamily>(family: F): MarkId<F>[] => Object.keys(MARK_FIELDS[family]) as MarkId<F>[];

// peak_marker's points - every mark but the band.
type PeakPoint = Exclude<MarkId<'peak_marker'>, 'range'>;

// What a mark sets itself: an override's field, or a peak mark's bare string,
// the shorthand for its color.
const markOwn = (mark: Mark, field: MarkField): unknown => {
  if (isMarkOverride(mark)) return mark[field];
  return field === 'color' && is.string(mark) ? mark : undefined;
};

// A watermark's low/high exist unless turned off; a peak mark exists only once
// set. `false` is the editor's explicit "hidden" state (types.peakMark()'s
// boolean branch) - distinct from absent, which is also hidden.
const peakMarkShown = (mark: PeakMark): boolean => isMarkOverride(mark) || (mark !== undefined && mark !== false);

// status_label: string (shorthand for { jinja }) | { jinja, position,
// color_source } - same idea as badge_icon/badge_color, already bare Jinja
// strings, applied here since real usage is 100% jinja-only in practice.
type StatusLabelObj = { jinja?: string; position?: string; color_source?: string };

const statusLabelObj = (sl: unknown): StatusLabelObj => (is.plainObject(sl) ? sl : is.string(sl) ? { jinja: sl } : {});

// Collapses back to the bare string once only `jinja` is left set.
const rewrapStatusLabel = (sl: unknown, patch: Partial<StatusLabelObj>): unknown => {
  const merged: StatusLabelObj = { ...statusLabelObj(sl), ...patch };
  const keys = (Object.keys(merged) as (keyof StatusLabelObj)[]).filter((k) => merged[k] !== undefined);
  return keys.length === 1 && keys[0] === 'jinja' ? merged.jinja : merged;
};

// ─── Mark factorisation ─────────────────────────────────────────────────────
// Each family read and written by the one mechanism (factorization.ts), its
// rules taken from MARK_FIELDS - the card resolves with it, the editor settles.

type Rec = Record<string, unknown>;

// A watermark side in object form, the overrides merged in: a bare threshold
// moves under `value`, `true` takes the side's default.
const rewrapMark = (mark: unknown, patch: Rec, defaultVal: number): unknown => {
  const value = is.boolean(mark) ? defaultVal : mark;
  const merged: Rec = { ...(isMarkOverride(mark as WatermarkMark) ? (mark as Rec) : { value }), ...patch };
  return Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined));
};

// A peak mark's shortest shape: color alone stays the string shorthand
// (types.peakMark), nothing left goes back to bare `true`.
const peakMarkObj = (mark: unknown): Rec => (is.plainObject(mark) ? mark : is.string(mark) ? { color: mark } : {});

const rewrapPeakMark = (mark: unknown, patch: Rec): unknown => {
  const merged: Rec = { ...peakMarkObj(mark), ...patch };
  const keys = Object.keys(merged).filter((k) => merged[k] !== undefined);
  if (keys.length === 0) return true;
  if (keys.length === 1 && keys[0] === 'color') return merged.color;
  return Object.fromEntries(keys.map((k) => [k, merged[k]]));
};

const MARK_FIELD_KEYS = new Set<string>(MARK_FIELD_NAMES);

export {
  entityOf,
  attributeOf,
  jinjaOf,
  isMarkOverride,
  nestValueShapeUnderValue,
  markShown,
  markInner,
  markValue,
  MARK_FIELDS,
  markIds,
  markOwn,
  peakMarkShown,
  statusLabelObj,
  rewrapStatusLabel,
  rewrapMark,
  rewrapPeakMark,
  MARK_FIELD_KEYS,
};
export type {
  ValueConfig,
  WatermarkMark,
  PeakMark,
  Mark,
  MarkField,
  MarkFieldRules,
  MarkFamily,
  MarkId,
  PeakPoint,
  Rec,
};
