import { HA_CONTEXT, CARD, HIDE_TARGETS, THEME_KEYS, PERCENT_THEME_KEYS } from '../../../utils/parameters.js';
import { is } from '../../../utils/common-checks.js';
import { types, barAligned, nameValidator } from './types.js';
import { type Path, SKIP_PROPERTY, type Validator } from './errors.js';
import {
  MARK_TYPES,
  BADGE_BAR_POSITIONS,
  BAR_ORIENTATIONS_BADGE,
  BADGE_BAR_SIZES,
  ROW_IDENTITY_FIELDS,
  VALUE_TEXT_FIELDS,
  BAR_SIZES,
  BAR_ORIENTATIONS_NO_UP,
  FEATURE_BAR_POSITIONS,
  UNIT_SPACINGS,
  BAR_ORIENTATIONS,
  BAR_COLOR_MODES,
  BAR_SCALES,
  BAR_POSITIONS,
  ICON_ANIMATIONS,
  DENSITY_MODES,
  ALERT_HIGHLIGHTS,
  ALERT_ANIMATIONS,
  BAR_STACK_MODES,
  BADGE_DELETED_FIELDS,
  hideTargetsWithout,
  ACTION_FIELDS,
  ICON_ACTION_FIELDS,
} from './enums.js';
import { struct } from './struct.js';

// Shared by card's own `hide` and multiRow's array-only variant below.
// The card's own hide - array or Jinja, so the editor keeps its simple/
// advanced switch - with a default, and an explicit `[]` that survives it:
// without
// that second half a default could never be turned off, since
// arrayWithValidatedElem reads an empty list as "nothing said" - which is the
// only way to ask a Feature row for its icon back.
const hideWithDefault = <T extends readonly unknown[]>(targets: T, fallback: T[number][]) => {
  const inner = types.jinjaOrArrayWithValidatedElem(targets);
  const fn = (value: unknown, path: Path = []) => {
    if (is.array(value) && value.length === 0) return [];
    const parsed = inner(value, path);
    return parsed === (SKIP_PROPERTY as unknown) ? fallback : parsed;
  };
  return Object.assign(fn, { allowedValues: targets, defaultValue: fallback });
};

// A Multi row is handed straight to its own entity-progress-card child, which
// runs the full card schema on it - postProcess included. Re-validating it
// here would duplicate that with a weaker engine (no postProcess), so this
// checks only the shape the aggregator itself reads and keeps the rest
// verbatim. Same per-item leniency as barStackEntity: one bad row drops, the
// others stand.
const multiRowEntry: Validator<unknown> = (value: unknown, _path: Path = []) => {
  if (is.nonEmptyString(value)) return value;
  if (is.plainObject(value) && is.nonEmptyString(value.entity)) return value;
  return SKIP_PROPERTY;
};

const barStackEntity = types.fallbackTo(
  types.object({
    entity: types.entityId,
    attribute: types.optionalString(),
    color: types.optionalString(),
    // 'net': subtracted from the algebraic total. 'stacked'/'proportional' +
    // center_zero: placed on the negative arm instead of the positive one.
    // No-op otherwise.
    subtract: types.optionalBooleanWithDefault(false),
  }),
  SKIP_PROPERTY,
);

const watermarkSchema = {
  // See types.watermarkMark: false (replaces disable_low/high) | value only |
  // { value, as, type, opacity, color }, omitted falling back to 20/80 so a
  // bare `watermark: {}` still shows both sides. type/opacity/color below
  // are each side's default until it overrides its own.
  low: types.watermarkMark(20),
  high: types.watermarkMark(80),
  // No *WithDefault here: staying genuinely absent (not pre-filled) lets the
  // editor tell "inert" apart from "still in use by one side" - real default
  // lives in SCHEMA_DEFAULTS.watermark (below) instead.
  opacity: types.optionalNumber(),
  color: types.optionalString(),
  type: types.optional(types.enums(MARK_TYPES)),
  line_size: types.optionalStringWithDefault('1px'),
  // Shared by both sides unless one says otherwise - same three-level shape
  // as type/opacity/color/line_size above it.
  as: types.enumsWithDefault(['auto', 'percent'], 'auto'),
};

// Narrowed for both badge variants: 'up' needs .vertical.overlay, 'xlarge' a
// 42px progress-container (past --ha-badge-size), 'shape' a circular bg.
const badgeOverrides = <T extends readonly string[]>(hideTargets: T) => ({
  // Its bar inline, or around its icon: no row to put it on top of.
  bar_position: types.enumsWithDefault(BADGE_BAR_POSITIONS, 'default'),
  bar_orientation: types.enumsWithDefault(BAR_ORIENTATIONS_BADGE, 'ltr'),
  bar_size: types.enumsWithDefault(BADGE_BAR_SIZES, 'small'),
  hide: types.jinjaOrArrayWithValidatedElem(hideTargets),
  layout: types.enumsWithDefault(['horizontal'], 'horizontal'),
});

/**
 * Builds the per-card-type YAML schemas (`card`, `badge`, `feature`,
 * `template`, `badgeTemplate`) from the `types`/`struct` primitives above.
 * Each static getter returns a `struct(...)`-validated schema, consumed by a
 * ConfigHelper's `_yamlSchema` (see config-helpers.js) to validate and
 * normalize a raw config.
 */
// A row schema turned into the stack's own: drop the four fields that
// identify one row rather than describing the stack - a name or an icon
// common to every row is a coincidence, never a default, see the editor's own
// NEVER_SHARED (multi-cascade.ts) - and add the entity list multi.ts spreads
// back into each child.
const asAggregator = (rowSchema: ReturnType<typeof struct>) =>
  rowSchema.delete([...ROW_IDENTITY_FIELDS]).extend({
    entities: types.optional(types.array(multiRowEntry)),
    // A stack is there to compare its bars: they line up unless told not to,
    // as the fixed value column of 1.6.1/1.6.2 had them.
    bar_aligned: barAligned(true),
  });

const YamlSchemaFactory = {
  // Derived from card, not written out: 15 of its 20 fields were byte-identical
  // copies, so a new card option had to be mirrored here by hand or silently
  // skip the Feature. The five that genuinely differ are extended below.
  get feature() {
    return YamlSchemaFactory.card
      .delete(
        [
          'name',
          ...VALUE_TEXT_FIELDS,
          'icon',
          'color',
          'bar_single_line',
          'bar_max_width',
          'bar_ring',
          'icon_animation',
          'density',
          'bar_aligned',
          'min_width',
          'height',
          'frameless',
          'marginless',
          'reverse',
          'reverse_secondary_info_row',
          'force_circular_background',
          'trend_indicator',
          'status_label',
          'text_shadow',
          'hide',
          'name_info',
          'custom_info',
          'multiline',
          'state_content',
          'badge_icon',
          'badge_color',
          'alert_when',
          'tap_action',
          'hold_action',
          'double_tap_action',
          'icon_tap_action',
          'icon_hold_action',
          'icon_double_tap_action',
        ],
        // A Feature defaults to bar_size: xlarge, which
        // applyBelowBarPositionRule would rewrite to a bar_position: below
        // that FEATURE_BAR_POSITIONS does not even offer.
        { allowBelowBarPosition: false },
      )
      .extend({
        // Optional, unlike every other variant: defaults to the parent Tile
        // own entity at runtime (see EntityProgressFeatures set context).
        entity: types.optional(types.entityId),
        // Tuned for the fixed 42px feature row, unlike card small.
        bar_size: types.enumsWithDefault(BAR_SIZES, 'xlarge'),
        bar_orientation: types.enumsWithDefault(BAR_ORIENTATIONS_NO_UP, 'ltr'),
        layout: types.enumsWithDefault(['horizontal'], 'horizontal'),
        bar_position: types.enumsWithDefault(FEATURE_BAR_POSITIONS, 'default'),
      })
      .reorder([
        'entity',
        'attribute',
        'min_value',
        'max_value',
        'bar_color',
        'bar_size',
        'bar_orientation',
        'layout',
        'bar_color_mode',
        'bar_scale',
        'bar_effect',
        'bar_position',
        'bar_segments',
        'center_zero',
        'theme',
        'custom_theme',
        'interpolate',
        'watermark',
        'peak_marker',
        'bar_stack',
      ]);
  },

  // eslint-disable-next-line sonarjs/max-lines-per-function -- flat field decl.
  get card() {
    return struct(
      types.object({
        // ─── Entity & Data ──────────────────────────────────────────────────
        entity: types.entityId,
        attribute: types.optionalString(),
        name: types.optional(nameValidator),
        decimal: types.decimal,
        unit: types.optionalString(),
        disable_unit: types.optionalBooleanWithDefault(false),
        unit_spacing: types.enumsWithDefault(UNIT_SPACINGS, 'auto'),
        unit_position: types.enumsWithDefault(['after', 'before'], 'after'),
        value_compact: types.optionalBooleanWithDefault(false),
        value_sign: types.optionalBooleanWithDefault(false),
        // Explicit shape instead of type-sniffing a scalar (number vs entity-id
        // string vs jinja-looking string), symmetric with max_value: min_value:
        // 10 | {entity, attribute} | {jinja}.
        min_value: types.optional(types.numericEntityOrJinja()),
        // Explicit shape, mirrors min_value: max_value: 10 | {entity,
        // attribute} | {jinja}. The legacy bare entity-id string is rewritten
        // into the map form by _customizeConfig before this schema ever sees it
        // (single call site, see BaseConfigHelper.set config), so no string
        // form is needed here.
        max_value: types.fallbackTo(types.numericEntityOrJinja(), 100),

        // ─── Appearance ─────────────────────────────────────────────────────
        icon: types.optionalString(),
        color: types.optionalString(),
        bar_color: types.optionalString(),
        bar_size: types.enumsWithDefault(BAR_SIZES, 'small'),
        bar_orientation: types.enumsWithDefault(BAR_ORIENTATIONS, 'ltr'),
        bar_color_mode: types.enumsWithDefault(BAR_COLOR_MODES, 'auto'),
        // Only engages outside center_zero with a well-formed positive range
        // (min > 0, max > min) — ProgressMath.isLogScale falls back to linear
        // otherwise, so an invalid combination degrades quietly instead of
        // producing NaN.
        bar_scale: types.enumsWithDefault(BAR_SCALES, 'linear'),
        // [('radius', 'glass', 'gradient', 'shimmer')]
        bar_effect: types.jinjaOrArrayWithValidatedElem(
          Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label),
        ),
        bar_position: types.enumsWithDefault(BAR_POSITIONS, 'default'),
        bar_single_line: types.optionalBooleanWithDefault(false),
        bar_max_width: types.optionalString(),
        bar_segments: types.optionalNumber(),
        // Degrees: start clockwise from the top (the zero, under center_zero),
        // gap = the arc left open. Only bar_position: icon draws a ring
        // (INERT_OPTIONS).
        bar_ring: types.optional(
          types.object({
            start: types.optionalNumberWithDefault(0),
            gap: types.optionalNumberWithDefault(0),
          }),
        ),
        // No forced default (like `theme`): unset stays absent. The legacy
        // 'none' value is stripped before validation (see config-helpers.ts).
        icon_animation: types.optional(types.enumOrJinjaTrigger(ICON_ANIMATIONS)),
        layout: types.enumsWithDefault(
          Object.values(CARD.layout.orientations).map((e) => e.label),
          'horizontal',
        ), // [('horizontal', 'vertical')]
        // 'compact' forces layout: horizontal and bar_position into
        // {top, bottom, background} - see applyDensityRule for the full
        // rewrite/clear list this triggers.
        density: types.enumsWithDefault(DENSITY_MODES, 'default'),
        bar_aligned: barAligned(false),
        min_width: types.optionalString(),
        height: types.optionalString(),
        frameless: types.optionalBooleanWithDefault(false),
        marginless: types.optionalBooleanWithDefault(false),
        reverse: types.optionalBooleanWithDefault(false),
        reverse_secondary_info_row: types.optionalBooleanWithDefault(false),
        force_circular_background: types.optionalBooleanWithDefault(false),
        center_zero: types.centerZero(),
        trend_indicator: types.trendIndicator(),
        peak_marker: types.peakMarker(),
        // jinja: Jinja-only, like name_info/custom_info - no separate enable
        // flag, a non-empty resolved value is the signal to show it.
        // Mutually exclusive with trend_indicator (HAS_EFFECT.trendIndicator):
        // both occupy the same top corner - position picks which side.
        status_label: types.statusLabel(),
        text_shadow: types.optionalBooleanWithDefault(false),

        // ─── Visibility & Content ───────────────────────────────────────────
        hide: types.jinjaOrArrayWithValidatedElem(HIDE_TARGETS),
        name_info: types.optionalString(),
        custom_info: types.optionalString(),
        // Badge/badgeTemplate opt out (see their own .delete(['multiline'])):
        // the row is too small for a second line there.
        multiline: types.optionalBooleanWithDefault(false),
        state_content: types.optional(types.fallbackTo(types.stateContent, SKIP_PROPERTY)),

        // ─── Badges ─────────────────────────────────────────────────────────
        badge_icon: types.optionalString(),
        badge_color: types.optionalString(),

        // ─── Theme & Watermark ──────────────────────────────────────────────
        theme: types.theme(THEME_KEYS),
        custom_theme: types.fallbackTo(types.customTheme, SKIP_PROPERTY),
        interpolate: types.optionalBooleanWithDefault(false),
        watermark: types.watermarkObject(watermarkSchema),
        alert_when: types.optional(
          types.object({
            // number (fixed) | { entity, attribute } | { jinja } - same
            // explicit shape as min_value/max_value/watermark.low/high (see
            // types.numericEntityOrJinja above), for the same reason: the
            // threshold can now come from another entity's state or a Jinja
            // template instead of only a fixed number.
            above: types.optional(types.numericEntityOrJinja()),
            below: types.optional(types.numericEntityOrJinja()),
            // Advanced mode: replaces above/below as the trigger (see
            // configuration.md#alert_when).
            jinja: types.optionalString(),
            color: types.optionalString(),
            // label: the status pill instead of tinting the whole card - only
            // shown while the alert is active, takes over the pill from a
            // plain `status_label:` Jinja if both are set (see
            // HACore._renderLabel's early-out). No visual effect on a Badge,
            // same as `status_label` itself (too small a scale).
            highlight: types.enumsWithDefault(ALERT_HIGHLIGHTS, 'border'),
            // Left genuinely optional (no forced default): the effective
            // default depends on `highlight` (border/label -> blink,
            // background -> static, both unchanged from pre-1.6 behavior)
            // and is resolved in CSS/ViewCore, not here - see .alert-active
            // in the stylesheet.
            animation: types.optional(types.enums(ALERT_ANIMATIONS)),
            // Plain string, not Jinja (unlike the card-level `status_label`):
            // the point here is a short, fixed word chosen once alongside
            // the threshold itself (e.g. "HIGH"), not a per-tick condition.
            label: types.optionalString(),
          }),
        ),

        // ─── Bar Stack ──────────────────────────────────────────────────────
        bar_stack: types.optional(
          types.object({
            mode: types.enumsWithDefault(BAR_STACK_MODES, 'stacked'),
            entities: types.optional(types.array(barStackEntity)),
          }),
        ),

        // ─── Actions ────────────────────────────────────────────────────────
        tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.moreInfo),
        hold_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        double_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_hold_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_double_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
      }),
    );
  },

  get badge() {
    return YamlSchemaFactory.card.delete(BADGE_DELETED_FIELDS).extend(badgeOverrides(hideTargetsWithout('shape')));
  },

  // Derived from .card: 39 of its 42 fields are identical validator calls -
  // only entity/name/theme/hide/alert_when differ, and fast_refresh/
  // secondary/percent are genuinely Template-only. .reorder() below just
  // matches this getter's field order to what it always was.
  get template() {
    return YamlSchemaFactory.card
      .delete([
        'attribute',
        ...VALUE_TEXT_FIELDS,
        'min_value',
        'max_value',
        'bar_scale',
        'reverse',
        'peak_marker',
        'name_info',
        'custom_info',
        'state_content',
        'custom_theme',
        'interpolate',
        'bar_stack',
      ])
      .extend({
        // Optional, unlike Card - Template has no natural single "entity is
        // the source of truth" mode, every display field is its own Jinja.
        entity: types.optional(types.entityId),
        // Off by default: a now()/utcnow() countdown already gets a free
        // once-a-minute refresh from HA's render_template push (#127) - this
        // opts into a forced resubscribe every second instead, for a real
        // ticking MM:SS countdown. Not tied to `entity` being a timer - any
        // now()-based Jinja field benefits the same way, explicit opt-in
        // since the display is arbitrary Jinja text with no unit to key off.
        fast_refresh: types.optionalBooleanWithDefault(false),
        // Plain Jinja string, unlike Card's `name` (a [{type,...}] token
        // array - meaningless once every display field is its own template).
        name: types.optionalString(),
        secondary: types.optionalString(),
        percent: types.optionalString(),
        // percent: true themes only - Template has no min_value/max_value to
        // project a real-value theme's zones onto (see ViewCore's own
        // #templateTheme/setTemplateThemeValue), it only ever has the
        // already-computed percent Jinja field. Wins over color/bar_color
        // when both apply, same precedence as Card's own ViewBase.iconColor
        // (theme.iconColor || config.color).
        theme: types.theme(PERCENT_THEME_KEYS),
        // Re-declared without 'unit' - Template has no `unit`/`disable_unit`
        // (deleted above) to hide in the first place.
        hide: types.jinjaOrArrayWithValidatedElem(hideTargetsWithout('unit')),
        // Jinja-only - see configuration.md#alert_when.
        alert_when: types.optional(types.object({ jinja: types.optionalString() })),
      })
      .reorder([
        'entity',
        'fast_refresh',
        'name',
        'secondary',
        'multiline',
        'percent',
        'icon',
        'color',
        'bar_color',
        'theme',
        'bar_color_mode',
        'bar_size',
        'bar_orientation',
        'bar_effect',
        'bar_position',
        'bar_single_line',
        'bar_max_width',
        'bar_segments',
        'bar_ring',
        'icon_animation',
        'layout',
        'density',
        'bar_aligned',
        'min_width',
        'height',
        'frameless',
        'marginless',
        'reverse_secondary_info_row',
        'force_circular_background',
        'center_zero',
        'trend_indicator',
        'status_label',
        'text_shadow',
        'hide',
        'badge_icon',
        'badge_color',
        'watermark',
        'alert_when',
        ...ACTION_FIELDS,
      ]);
  },

  // A Multi row IS an entity-progress-card (see multi.ts) - so this is the
  // card, minus only what the row shape has already settled on its behalf:
  // its frame, its layout, and where the bar sits. Everything else it keeps,
  // Jinja text fields included, because everything else still means the same
  // thing on a row as on a card - and its editor is the card's own form minus
  // the same sections (see EditorFactory.buildMultiRow).
  get multiRow() {
    return YamlSchemaFactory.card.delete([
      'layout',
      'density',
      'bar_position',
      'bar_single_line',
      'multiline',
      'min_width',
      'height',
      'frameless',
      'marginless',
    ]);
  },

  // A Feature's rows are a fraction of a single 42px HA row, so their icon
  // lands at a few px (see multi.ts's rowMetrics). Too small to aim at, and
  // too small for a circular background to read as one: both notions go from
  // the ROW, not from the aggregator - it is the row that would have offered
  // them, in its own editor and its own hide chips. The Card's rows have the
  // room and keep all three.
  get multiFeatureRow() {
    return YamlSchemaFactory.multiRow
      .delete([
        ...ICON_ACTION_FIELDS,
        'force_circular_background',
        // Everything that annotates a corner of the card, and the alert with
        // them: a Feature row is a slice of a single 42px HA row, with no
        // corner to annotate, no frame to color and an icon a badge cannot
        // sit on.
        'trend_indicator',
        'status_label',
        'badge_icon',
        'badge_color',
        'alert_when',
      ])
      .extend({
        // Hidden by default, not forced: a Feature's rows split one 42px HA
        // row between them, so an icon and a name do not fit unless the
        // stack is short. `hide: []` asks for them back.
        hide: hideWithDefault(hideTargetsWithout('shape'), ['icon', 'name']),
      });
  },

  get multiAggregator() {
    return asAggregator(YamlSchemaFactory.multiRow);
  },

  get multiCard() {
    return YamlSchemaFactory.multiAggregator.extend({
      // Grid rows the card occupies; one per entity when unset.
      rows: types.optional(types.number),
    });
  },

  // Same, minus `rows`: a Multi Feature is always exactly one HA feature row,
  // never more (see EntityProgressMultiFeature._applySizing). Everything else
  // it drops, it drops because its rows do (multiFeatureRow above).
  get multiFeature() {
    return asAggregator(YamlSchemaFactory.multiFeatureRow);
  },

  // Same badge shape as .badge above, applied to .template instead of .card -
  // `hide` drops 'unit' too, which Template has no key for.
  get badgeTemplate() {
    return YamlSchemaFactory.template
      .delete(BADGE_DELETED_FIELDS)
      .extend(badgeOverrides(hideTargetsWithout('unit', 'shape')));
  },
};

export { YamlSchemaFactory };
