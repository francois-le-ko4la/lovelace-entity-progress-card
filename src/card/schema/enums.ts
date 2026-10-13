import { CARD, HIDE_TARGETS, THEME } from '../../utils/parameters.js';
import { is } from '../../utils/common-checks.js';

// Deprecated theme names, remapped for this session by types.theme below and
// rewritten for good by the editor's "Migrate config" button (see EditorBase).
const THEME_ALIASES: Record<string, string> = {
  battery: 'optimal_when_high',
  memory: 'optimal_when_low',
  cpu: 'optimal_when_low',
};

// Every enum below is both what the schema accepts and the order the editor's
// dropdown lists it in. None is `as const`: they must keep inferring string[].
const BAR_SIZES = Object.values(CARD.style.bar.sizeOptions);

// No 'xlarge': it would demand a 42px bar inside a badge capped at ~36px.
const BADGE_BAR_SIZES = ['xsmall', 'small', 'medium', 'large'];

// A ring is turned clockwise or not: bar_position: icon imposes these two in
// place of ltr/rtl, and anything else the other way (translateOrientation).
const RING_ORIENTATIONS = ['clockwise', 'counterclockwise'];

const BAR_ORIENTATIONS = ['ltr', 'rtl', 'up', 'down', ...RING_ORIENTATIONS];

// 'up'/'down' need .vertical.overlay, which Badge/Badge Template/Feature lack.
const BAR_ORIENTATIONS_NO_UP = ['ltr', 'rtl'];

const BAR_ORIENTATIONS_BADGE = [...BAR_ORIENTATIONS_NO_UP, ...RING_ORIENTATIONS];

const BAR_POSITIONS = ['default', 'below', 'compact_below', 'top', 'bottom', 'overlay', 'background', 'icon'];

// The bar drawn as a ring around the icon: nothing straight to mark or cut.
const BAR_AROUND_ICON = 'icon';

const BADGE_BAR_POSITIONS = ['default', BAR_AROUND_ICON];

const ORIENTATION_AROUND_ICON: Record<string, string> = { ltr: 'clockwise', rtl: 'counterclockwise' };

const ORIENTATION_STRAIGHT: Record<string, string> = { clockwise: 'ltr', counterclockwise: 'rtl' };

const FEATURE_BAR_POSITIONS = ['default', 'top', 'bottom'];

// The positions density: compact leaves standing - not schema truth (the
// schema accepts all of BAR_POSITIONS and rewrites to 'top' instead, see
// applyDensityRule), so the editor and the view share this list rather than
// deriving one.
const DENSITY_COMPACT_BAR_POSITIONS = ['top', 'bottom', 'background'];

const HORIZONTAL = CARD.layout.orientations.horizontal.label;

// 'single_line' lays icon, name, secondary and bar out as four siblings on one
// row - a shape only 'horizontal' has, hence the forcing in applyDensityRule.
const DENSITY_MODES = ['default', 'compact', 'single_line'];

const BAR_COLOR_MODES = ['auto', 'segment', 'rainbow', 'rainbow_full'];

const BAR_SCALES = ['linear', 'log'];

const BAR_STACK_MODES = ['stacked', 'proportional', 'net'];

// The six interaction fields, shared by the badge schema's own delete list,
// SCHEMA_DEFAULTS below and the editor's isolated-keys set.
const ICON_ACTION_FIELDS = ['icon_tap_action', 'icon_hold_action', 'icon_double_tap_action'] as const;

const ACTION_FIELDS = ['tap_action', 'hold_action', 'double_tap_action', ...ICON_ACTION_FIELDS] as const;

const UNIT_SPACINGS = Object.values(CARD.config.unit.unitSpacing);

// One list for both families: what a mark can look like never depended on
// where its value comes from. MARK_ZONE_TYPES is the subset that paints a
// region instead of a point - all peak_marker.range can be.
const MARK_TYPES = ['blended', 'area', 'striped', 'triangle', 'round', 'line'];

// The one spelling of peak_marker's default window: the schema turns it into
// seconds, SCHEMA_DEFAULTS hands the editor the YAML form of the same thing.
const PEAK_WINDOW_DEFAULT = '2h';

// peak_marker.range's fallback shape, spelled once for the schema-default
// table, the view's own resolution and the renderer's guard alike.
const PEAK_RANGE_TYPE_DEFAULT = 'area';

const MARK_ZONE_TYPES = ['area', 'blended', 'striped'];

const ALERT_HIGHLIGHTS = ['border', 'background', 'label'];

const ALERT_ANIMATIONS = ['static', 'blink', 'ping'];

const ICON_ANIMATIONS = ['spin', 'pulse', 'bounce', 'shake', 'ping', 'reveal', 'washing_machine', 'battery_charging'];

// Every other animation above plays while the entity is simply active, and
// core.ts derives its class from this very list. These two answer to their own
// condition instead (a running program reported as a plain sensor, a charging
// attribute) - see HABase._iconAnimationStyle. An animation added above with
// no entry here is wired to the active-entity trigger by default.
const OWN_TRIGGER_ANIMATIONS = ['washing_machine', 'battery_charging'];

// A raw-value theme's own scale (temperature's -50..100°C): its lowest and
// highest zone bounds. null for a percent theme, whose zones carry none.
const rawThemeRange = (themeName: unknown): { min: number | null; max: number | null } | null => {
  const theme = THEME[themeName as keyof typeof THEME];
  if (!theme || theme.percent !== false || !is.nonEmptyArray(theme.style)) return null;
  // Cast: percent === false rules out the zone-less `light` shape at runtime,
  // but TS still unions every theme's zones - the key isn't known statically.
  const zones = theme.style as { min?: unknown; max?: unknown }[];
  const mins = zones.map((zone) => zone.min).filter(is.number);
  const maxes = zones.map((zone) => zone.max).filter(is.number);
  return { min: mins.length ? Math.min(...mins) : null, max: maxes.length ? Math.max(...maxes) : null };
};

// Every hide target but those a variant has nothing to hide for.
const hideTargetsWithout = (...absent: string[]) => HIDE_TARGETS.filter((target) => !absent.includes(target));

// What a row IS, never how the stack looks: meaningless above one row, so
// absent from both aggregator schemas.
const ROW_IDENTITY_FIELDS = ['entity', 'attribute', 'name', 'icon'] as const;

// The aggregator's own keys: never a row's.
const AGGREGATOR_FIELDS = ['entities', 'rows', 'type'] as const;

// The options that format a value as text - Feature and Template show none.
const VALUE_TEXT_FIELDS = [
  'decimal',
  'unit',
  'disable_unit',
  'unit_spacing',
  'unit_position',
  'value_compact',
  'value_sign',
];

// Dropped from Badge and Badge Template alike - deleting a key the source
// schema doesn't have is a no-op, so one list serves both.
const BADGE_DELETED_FIELDS = [
  // A badge has no layout/height/icon action/inner badge of its own, and
  // every key after them only ever acts through one of those.
  'badge_icon',
  'badge_color',
  'force_circular_background',
  'layout',
  'density',
  'bar_aligned',
  'height',
  'icon_tap_action',
  'icon_hold_action',
  'icon_double_tap_action',
  'multiline',
  'icon_animation',
  'bar_max_width',
  'bar_single_line',
  'text_shadow',
  // Design choice, not dead CSS: an arrow icon or a status pill doesn't read at
  // --ha-badge-size (~36px), and peak_marker's history seeding is Card-only.
  'trend_indicator',
  'peak_marker',
  'status_label',
];

export {
  THEME_ALIASES,
  BAR_SIZES,
  BADGE_BAR_SIZES,
  RING_ORIENTATIONS,
  BAR_ORIENTATIONS,
  BAR_ORIENTATIONS_NO_UP,
  BAR_ORIENTATIONS_BADGE,
  BAR_POSITIONS,
  BAR_AROUND_ICON,
  BADGE_BAR_POSITIONS,
  ORIENTATION_AROUND_ICON,
  ORIENTATION_STRAIGHT,
  FEATURE_BAR_POSITIONS,
  DENSITY_COMPACT_BAR_POSITIONS,
  HORIZONTAL,
  DENSITY_MODES,
  BAR_COLOR_MODES,
  BAR_SCALES,
  BAR_STACK_MODES,
  ICON_ACTION_FIELDS,
  ACTION_FIELDS,
  UNIT_SPACINGS,
  MARK_TYPES,
  PEAK_WINDOW_DEFAULT,
  PEAK_RANGE_TYPE_DEFAULT,
  MARK_ZONE_TYPES,
  ALERT_HIGHLIGHTS,
  ALERT_ANIMATIONS,
  ICON_ANIMATIONS,
  OWN_TRIGGER_ANIMATIONS,
  rawThemeRange,
  hideTargetsWithout,
  ROW_IDENTITY_FIELDS,
  AGGREGATOR_FIELDS,
  VALUE_TEXT_FIELDS,
  BADGE_DELETED_FIELDS,
};
