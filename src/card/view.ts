/*
 * The view layer: per-card-type classes that expose computed, ready-to-render
 * values (percent, colors, watermark position, trend...) derived from the
 * negotiated config and current entity state.
 */

import { HA_CONTEXT, CARD, CARD_CONTEXT } from '../utils/parameters.js';
import { resolveDisplayUnit, resolveDisplayDecimal } from '../utils/display-defaults.js';
import type { LovelaceConfig, Config } from '../utils/types.js';
import { is, assertDefined } from '../utils/common-checks.js';
import {
  entityOf,
  markShown,
  markValue,
  markAs,
  markType,
  markOpacity,
  markColor,
  SCHEMA_DEFAULTS,
  type WatermarkMark,
} from './schema.js';
import { cloneValue } from '../utils/browser-support.js';
import { traceInstance } from '../utils/log.js';
import { PercentHelper, ThemeManager, EntityCollectionHelper, EntityOrValue } from './value-helpers.js';
import { TrendTracker, type TrendBasis } from './trend-tracker.js';
import { HassProviderSingleton, type HomeAssistant } from '../utils/hass-provider.js';
import {
  BaseConfigHelper,
  CardConfigHelper,
  BadgeConfigHelper,
  FeatureConfigHelper,
  TemplateConfigHelper,
  BadgeTemplateConfigHelper,
} from './config-helpers.js';

// Mirrors schema.ts's watermarkSchema (see card/schema.ts) - the validated
// shape of config.watermark as it comes out of the schema. low/high are
// types.watermarkMark's own shape (see WatermarkMark in schema.ts) since the
// getters below immediately resolve them via markValue/markShown/etc.
type WatermarkType = 'blended' | 'area' | 'striped' | 'triangle' | 'round' | 'line';
type WatermarkConfig = {
  low: WatermarkMark;
  high: WatermarkMark;
  // No schema default (unlike low/high/line_size) - genuinely absent once
  // neither side needs it, see the `watermark` getter's own fallback to
  // SCHEMA_DEFAULTS.watermark for the real default.
  opacity?: number;
  color?: string;
  type?: WatermarkType;
  line_size: string;
};

// What ViewCore/ViewBase's `watermark` getter resolves each side to -
// consumed by HACore._applyWatermarkCSS/_handleWatermarkClasses (core.ts).
// type/opacity are never undefined here (unlike WatermarkConfig's own) -
// the getter always resolves them against SCHEMA_DEFAULTS.watermark first.
type ResolvedWatermarkMark = {
  shown: boolean;
  value: number;
  type: WatermarkType;
  opacity: number;
  color: string | null;
};
type ResolvedWatermark = {
  low: ResolvedWatermarkMark;
  high: ResolvedWatermarkMark;
  opacity: number;
  type: WatermarkType;
  line_size: string;
};

type PeakMarkType = 'line' | 'round' | 'triangle';
// One resolved peak_marker.min/.max/.average - shown=false still carries a
// type/opacity/value so callers never need an extra null-check per field.
type ResolvedPeakMark = { shown: boolean; type: PeakMarkType; opacity: number; color: string | null; value: number };

// Mirrors schema.ts's barStackEntity - one row of bar_stack.entities.
type BarStackEntityConfig = { entity: string; attribute?: string; color?: string; subtract?: boolean };

// Shared by ViewBase.themeDivergingGradient/ViewCore's own
// templateThemeDivergingGradient below - center_zero's two independent
// per-arm theme gradients, differing only in how each resolves its own
// window/valueRange/defaultColor.
const buildDivergingGradient = (params: {
  theme: ThemeManager;
  signedPercent: number;
  mode: string;
  defaultColor: string | null;
  isVertical: boolean;
  isSegmented: boolean;
  posWindow: [number, number];
  negWindow: [number, number];
  valueRange: { min: number; max: number } | null;
}) => {
  const { theme, signedPercent, mode, defaultColor, isVertical, isSegmented, posWindow, negWindow, valueRange } =
    params;
  // Capped at 100, not just floored at 0 - a raw/Jinja percent isn't bounded
  // the way ProgressCalc's own division is; posSize/negSize feed
  // --epb-stack-size-pos/-neg directly, and a value above 1 there pushes the
  // fill past .half's own overflow: hidden instead of just filling it.
  const posFill = Math.min(100, Math.max(0, signedPercent));
  const negFill = Math.min(100, Math.max(0, -signedPercent));
  const posGradient = theme.buildGradient(posFill, mode, {
    defaultColor,
    isVertical,
    window: posWindow,
    valueRange,
    isSegmented,
  });
  const negGradient = theme.buildGradient(negFill, mode, {
    defaultColor,
    isVertical,
    window: negWindow,
    valueRange,
    isSegmented,
  });
  if (!posGradient && !negGradient) return null;
  return { posGradient, negGradient, posSize: posFill / 100, negSize: negFill / 100 };
};

/**
 * A view class for rendering minimal cards in a user interface. This class
 * manages configuration, entity states, user interactions, and visual
 * appearance of cards including layouts, orientations, watermarks, and
 * interactive elements.
 *
 * ViewCore ├── ViewBase │ ├── CardView │ ├── BadgeView │ └── FeatureView ├──
 * CardTemplateView └── BadgeTemplateView
 *
 * @example
 * const cardView = new ViewCore();
 * cardView.config = {
 *   entity: 'sensor.temperature',
 *   layout: 'vertical',
 *   bar_orientation: 'rtl',
 *   force_circular_background: true,
 *   watermark: { low: 10, high: 30, type: 'gradient' }
 * };
 *
 * // Check if components are hidden
 * if (!cardView.hasComponentHiddenFlag('icon')) {
 *   // Render icon
 * }
 *
 * // Access computed properties
 * const hasShape = cardView.hasVisibleShape;
 * const isClickable = cardView.hasClickableCard;
 */
class ViewCore {
  _hassProvider = HassProviderSingleton.getInstance();
  _trendTracker: TrendTracker | null = null;
  _trendEntityId: string | null = null;
  // `declare`: ViewCore is never instantiated, every subclass assigns its own.
  declare _configHelper: BaseConfigHelper;
  _currentValue = new EntityOrValue();
  _lowValue = new EntityOrValue();
  _highValue = new EntityOrValue();
  // alert_when doesn't exist in the template schema, so these stay unset
  // (isAlertActive short-circuits on `!this.config?.alert_when` before ever
  // reading them) for ViewCore-only instances - declared here rather than on
  // ViewBase because isAlertActive/alertAnimation below are read
  // polymorphically through the shared _cardView reference (see
  // HACore._addBaseClasses), not just from card/badge.
  _aboveValue = new EntityOrValue();
  _belowValue = new EntityOrValue();
  // alert_when.above/.below resolved from a Jinja subscription; null = no
  // override
  #jinjaAlertAbove: number | null = null;
  #jinjaAlertBelow: number | null = null;
  // alert_when.jinja (Advanced mode) resolved trigger - true/an override
  // object mean active, false/empty/null mean inactive or not pushed yet.
  #jinjaAlertResult: boolean | Record<string, unknown> | null = null;
  // watermark.low/.high resolved from a Jinja subscription; null = no
  // override. Declared here (not ViewBase) for the same
  // read-polymorphically-through-_cardView reason as jinjaAlertAbove/Below
  // above - ViewCore's own watermark getter below reads these directly, and
  // Template (ViewCore's own direct subclass) needs to write to them too.
  #jinjaWatermarkLow: number | null = null;
  #jinjaWatermarkHigh: number | null = null;
  // icon_animation: { effect, jinja } mode - the jinja-resolved boolean that
  // decides whether `effect` plays, overriding HABase._iconAnimationStyle's
  // automatic entity-based detection. null = not in that mode, or not
  // resolved yet - declared here (not ViewBase) for the same
  // read-polymorphically-through-_cardView reason as jinjaAlertAbove/Below
  // above, since icon_animation applies to Template cards too (unlike
  // alert_when).
  #jinjaIconAnimationActive: boolean | null = null;
  // hide's Jinja-resolved state (see hasComponentHiddenFlag/setResolvedHide
  // below) - null means "no push has landed yet, fall back to config.hide"
  // (also what a plain static hide: [...] array stays at forever, since
  // nothing ever calls setResolvedHide for it).
  #resolvedHide: Set<string> | null = null;
  // Template's own theme support (percent: true themes only). Declared here
  // rather than ViewBase (which has its own separate #theme) since
  // CardTemplateView/BadgeTemplateView are ViewCore's direct siblings of
  // ViewBase, not descendants - this is the shared spot both reach. Inert on
  // ViewBase's own subclasses.
  #templateTheme = new ThemeManager();
  // Template's own plain color/bar_color Jinja (no theme active) - see
  // barColor/iconColor below. cards.ts's own handlers write straight to CSS
  // via _dom.setStyle only, so without caching it here too, status_label's
  // color_source: 'bar'/'icon' fallback had nothing to read - same class of
  // gap #templateTheme closes for the theme case.
  #templateColorValue: string | null = null;
  #templateBarColorValue: string | null = null;

  constructor() {
    traceInstance(this, CARD_CONTEXT.debug.instances);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set config(config: LovelaceConfig) {
    if (!config) {
      throw new Error(CARD.config.configError);
    }

    this._configHelper.config = config;
    Object.assign(this._currentValue, {
      value: this._configHelper.config.entity,
      stateContent: this._configHelper.stateContent,
    });
    // jinja mode is fed by the template subscription, not EntityOrValue - see
    // _applyWatermarkValues.
    ViewCore._applyWatermarkValues(this, this._configHelper.config?.watermark as WatermarkConfig | undefined);
    this.#jinjaIconAnimationActive = null;
    this.#resolvedHide = null;
    this.#templateColorValue = null;
    this.#templateBarColorValue = null;
  }

  get config(): Config {
    return this._configHelper.config;
  }

  // Mirrors HACore#_addBaseClasses's vertical-bar/horizontal-bar decision:
  // gradients are built left-to-right by default, but the bar fills
  // bottom-to-top in these two combinations, so the direction has to follow.
  // Lives here, not on ViewBase, so Template's own templateThemeGradient
  // below (on ViewCore, a ViewBase sibling) can read it too.
  get isVerticalBar(): boolean {
    return (
      this.config.bar_orientation === 'up' &&
      ((this.config.layout === 'vertical' && this.config.bar_position === 'overlay') ||
        this.config.bar_position === 'background')
    );
  }

  // Mirrors HACore#_buildSegmentCells's own active check - both need to
  // agree on when bar_segments actually renders real cells.
  get isSegmented(): boolean {
    return is.number(this.config.bar_segments) && this.config.bar_segments >= 2;
  }

  // Shared by watermark.low/high and #resolveMaxValue/#resolveMinValue
  // below: all four share the same "value config" shape (number | { entity,
  // attribute } | { jinja }, see schema.ts). Jinja mode resolves elsewhere
  // (#jinjaMaxValue/#jinjaMinValue/etc.), so it's null here on purpose.
  // `fallback` varies per caller: max_value defaults to CARD.config.value.max,
  // the other three stay null.
  static _resolveValueConfig(
    cfg: number | { entity?: string; attribute?: string; jinja?: string } | null | undefined,
    fallback: number | null,
  ): { value: number | string | null; attribute?: string } {
    const isObj = is.plainObject(cfg);
    const obj = cfg as { entity?: string; attribute?: string; jinja?: string };
    return {
      value: isObj ? (obj.jinja ? null : (obj.entity ?? fallback)) : ((cfg as number | null) ?? fallback),
      attribute: isObj ? obj.attribute : undefined,
    };
  }

  // Shared by ViewCore/ViewBase's own `set config` - watermark.low/.high
  // resolved into _lowValue/_highValue, jinja overrides reset to null.
  static _applyWatermarkValues(view: ViewCore, watermark: WatermarkConfig | undefined) {
    Object.assign(
      view._lowValue,
      ViewCore._resolveValueConfig(markValue(watermark?.low, SCHEMA_DEFAULTS.watermark.low), null),
    );
    view.jinjaWatermarkLow = null;
    Object.assign(
      view._highValue,
      ViewCore._resolveValueConfig(markValue(watermark?.high, SCHEMA_DEFAULTS.watermark.high), null),
    );
    view.jinjaWatermarkHigh = null;
  }

  refresh(hass: HomeAssistant) {
    this._hassProvider.hass = hass;
    this._currentValue.refresh();
    this._lowValue.refresh();
    this._highValue.refresh();
    // Computed once per refresh instead of live in isBatteryCharging: with
    // battery_adaptive, a single refresh reads it 3x (resolvedTheme +
    // icon-anim-battery-charging + its -shifted variant), each a same-device
    // entity scan without caching. Only scans when something can actually
    // read the result, or every card would pay for it on every hass update.
    this.#isBatteryChargingCache =
      this.iconAnimationEffect === 'battery_charging' || this.config?.theme === 'battery_adaptive'
        ? ViewCore.#computeIsBatteryCharging(this.entity as string)
        : false;
  }

  get entity(): string | null {
    return this.config?.entity ?? null;
  }

  // icon_animation: an enum name | { effect, jinja } - resolves either shape
  // to the effect actually chosen (see schema.ts's enumOrJinjaTrigger and
  // HABase._iconAnimationStyle, the sole consumer of both this and
  // jinjaIconAnimationActive below).
  get iconAnimationEffect(): string | null {
    const raw = this.config?.icon_animation;
    if (is.plainObject(raw)) return (raw as { effect?: string }).effect ?? null;
    return typeof raw === 'string' ? raw : null;
  }

  // Whether { effect, jinja } mode is configured at all, regardless of
  // whether a push has resolved yet - see HABase._iconAnimationStyle's own
  // comment on why this needs to be checked separately from
  // jinjaIconAnimationActive === null (which also means "no push yet",
  // not just "not in that mode").
  get hasJinjaIconAnimation(): boolean {
    const raw = this.config?.icon_animation;
    return is.plainObject(raw) && is.nonEmptyString((raw as { jinja?: string }).jinja);
  }

  get jinjaIconAnimationActive(): boolean | null {
    return this.#jinjaIconAnimationActive;
  }

  set jinjaIconAnimationActive(value: unknown) {
    this.#jinjaIconAnimationActive = is.boolean(value) ? value : null;
  }

  // Shared by ViewBase and the template views (CardTemplateView/
  // BadgeTemplateView) alike - a running timer entity doesn't push a new hass
  // state every second, and (for template views) HA's own render_template
  // push for a now()/utcnow() Jinja field only fires once a minute absent a
  // state change on a tracked entity (issue #127). Both cases rely on
  // config.entity being the timer, resolved into _currentValue above.
  get isActiveTimer(): boolean {
    return this._currentValue.entityType.isTimer && this._currentValue.state === HA_CONTEXT.entity.state.active;
  }

  // How often (ms) to locally re-drive a template's display; null = no local
  // loop needed. Default (fast_refresh unset/false) needs nothing - HA's own
  // render_template push already fires once a minute for a now()/utcnow()
  // field (#127), for free. `fast_refresh: true` opts into the same
  // 1s/round-second cadence ViewBase uses, via
  // EntityProgressTemplateBase._onAutoRefreshTick's forced resubscribe. Not
  // gated on isActiveTimer: any now()-driven Jinja field (sun.sun,
  // input_datetime...) needs the same push, so fast_refresh is the explicit
  // opt-in. ViewBase overrides this with unit-aware behavior instead.
  get autoRefreshInterval(): number | null {
    return this.config?.fast_refresh ? 1000 : null;
  }

  get cardSize(): number {
    return this.config
      ? (CARD.layout.orientations[this.config.layout as keyof typeof CARD.layout.orientations]?.grid?.grid_rows ?? 1)
      : CARD.layout.orientations.horizontal.grid.grid_rows;
  }

  // issue #133 - a hidden icon needing an extra row for bar_size: xlarge (or
  // bar_position: below) was a case the old ternary never composed with:
  // `hidden ? 1 : base + extraRow` let the hidden branch's flat 1
  // short-circuit extraRow entirely. Hiding the icon only changes the
  // *base* row count, never whether bar_size/bar_position need one more.
  //
  // Single source of truth for both consumers: HA's Sections grid
  // (cardLayoutOptions → getGridOptions) *and* HABase._addBaseParameter's
  // CSS min-height fallback (Masonry, embedded cards). Before this was
  // extracted, the CSS fallback had its own static formula, so the same
  // #133 squeeze could happen outside Sections, just unreported.
  get minGridRows(): number {
    if (!this.config) return CARD.layout.orientations.horizontal.grid.grid_min_rows;
    const layout = CARD.layout.orientations[this.config.layout as keyof typeof CARD.layout.orientations];
    // top/bottom/background overlay the bar on the icon row instead of
    // giving it one of their own (see styles.ts's .content display:none
    // rule, same three positions) - name+secondary_info both hidden then
    // leaves a single icon row to show, same as hide: icon itself.
    const contentCollapsed =
      this.config.layout === CARD.layout.orientations.vertical.label &&
      ['top', 'bottom', 'background'].includes(this.config.bar_position ?? '') &&
      this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.name.label) &&
      this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.secondary_info.label);
    const baseRows =
      this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.icon.label) || contentCollapsed
        ? 1
        : layout.grid.grid_min_rows;
    const needsExtraRow =
      this.config.bar_size === CARD.style.bar.sizeOptions.xlarge ||
      (this.config.layout === 'horizontal' && this.config.bar_position === 'below') ||
      (this.config.layout === 'vertical' &&
        ['default', 'below'].includes(this.config.bar_position ?? '') &&
        this.config.bar_size !== CARD.style.bar.sizeOptions.small &&
        this.config.bar_size !== CARD.style.bar.sizeOptions.xsmall) ||
      // rainbow_full's bar-row is forced up to horizontal's own 16px in
      // vertical layout too (see the matching CSS in styles.ts) for
      // xsmall/small/medium (large already reaches 16px natively there,
      // xlarge is well past it) - the extra row gives the card the budget
      // for that growth instead of squeezing it out of the rest of the
      // layout.
      (this.config.layout === 'vertical' &&
        this.config.bar_color_mode === 'rainbow_full' &&
        (this.config.bar_size === CARD.style.bar.sizeOptions.xsmall ||
          this.config.bar_size === CARD.style.bar.sizeOptions.small ||
          this.config.bar_size === CARD.style.bar.sizeOptions.medium));
    return baseRows + (needsExtraRow ? 1 : 0);
  }

  // issue #134: a compact-density card only needs 1 column's worth of width
  // (reported as 6/12 before gridColumnMultiplier) - no layout check needed,
  // vertical's own grid_min_columns is already 1 regardless of density.
  get minGridColumns(): number {
    if (!this.config) return CARD.layout.orientations.horizontal.grid.grid_min_columns;
    const layout = CARD.layout.orientations[this.config.layout as keyof typeof CARD.layout.orientations];
    if (this.config.density === 'compact') {
      return 1;
    }
    return layout.grid.grid_min_columns;
  }

  get cardLayoutOptions() {
    if (!this.config) return CARD.layout.orientations.horizontal.grid;
    const layout = cloneValue(CARD.layout.orientations[this.config.layout as keyof typeof CARD.layout.orientations]);
    layout.grid.grid_min_rows = this.minGridRows;
    layout.grid.grid_min_columns = this.minGridColumns;
    // density: compact pins the card to its smallest useful size outright -
    // default *and* ceiling, not just a narrower floor. Without a max,
    // Sections still lets it be dragged back out wider/taller by hand. A
    // card with its own explicit `grid_options` keeps it regardless - same
    // "explicit wins" precedent as `height`.
    if (this.config.density === 'compact') {
      layout.grid.grid_rows = this.minGridRows;
      layout.grid.grid_columns = this.minGridColumns;
      layout.grid.grid_max_rows = this.minGridRows;
      layout.grid.grid_max_columns = this.minGridColumns;
    }
    return layout.grid;
  }

  _getEntityColor(): string | null {
    if (this._currentValue.state === HA_CONTEXT.entity.state.unavailable) return CARD.style.color.unavailable;
    if (this._currentValue.state === HA_CONTEXT.entity.state.notFound) return CARD.style.color.notFound;
    return ThemeManager.adaptColor(this._currentValue.defaultColor || CARD.style.color.default);
  }

  // theme (percent: true only) wins outright when configured - same
  // precedence as ViewBase.iconColor's `theme.iconColor || config.color`.
  // Reading it here (not just from _managePercent's one-off push) is what
  // makes every other repaint (_updateCSS on every hass update) see the
  // themed color too, not just right after a percent Jinja push.
  get barColor(): string | null {
    if (this._configHelper.config.theme) return ThemeManager.adaptColor(this.templateThemeBarColor);
    if (this._configHelper.config.bar_color) return this.#templateBarColorValue;
    return this.entity ? this._getEntityColor() : null;
  }

  get iconColor(): string | null {
    if (this._configHelper.config.theme) return ThemeManager.adaptColor(this.templateThemeIconColor);
    if (this._configHelper.config.color) return this.#templateColorValue;
    return this.entity ? this._getEntityColor() : null;
  }

  // Called from cards.ts's own color/bar_color Jinja handlers, right
  // alongside (not instead of) their existing _dom.setStyle - see
  // #templateColorValue/-BarColorValue's own comment above.
  setTemplateColorValue(value: string | null) {
    this.#templateColorValue = value;
  }

  setTemplateBarColorValue(value: string | null) {
    this.#templateBarColorValue = value;
  }

  get hasClickableIcon(): boolean {
    return ViewCore.#hasAction([
      this._configHelper.action.icon.tap,
      this._configHelper.action.icon.hold,
      this._configHelper.action.icon.doubleTap,
    ]);
  }

  get hasClickableCard(): boolean {
    return ViewCore.#hasAction([
      this._configHelper.action.card.tap,
      this._configHelper.action.card.hold,
      this._configHelper.action.card.doubleTap,
    ]);
  }

  get hasReversedSecondaryInfoRow(): boolean {
    // Nullish-coalesced, not strict equality: Badge/Badge Template have
    // neither 'layout' nor 'bar_position' in their schema (always undefined
    // here), but structurally render exactly like layout: horizontal +
    // bar_position: default - the only shape they have. Treating "absent" as
    // invalid would make this permanently false for them despite the option
    // otherwise working fine.
    return (
      (this.config.layout ?? 'horizontal') === 'horizontal' &&
      (this.config.bar_position ?? 'default') === 'default' &&
      Boolean(this.config.reverse_secondary_info_row)
    );
  }

  get hasVisibleShape(): boolean {
    // this.config.force_circular_background === true
    return this.config.force_circular_background || this._hasDefaultShape || this._hasInteractiveShape;
  }

  get _hasDefaultShape(): boolean {
    return this._currentValue.hasShapeByDefault && ViewCore.#hasAction([this._configHelper.action.icon.tap]);
  }

  get _hasInteractiveShape(): boolean {
    return this._configHelper.action.icon.tap !== HA_CONTEXT.actions.none.action;
  }

  get hasWatermark(): boolean {
    return this.config.watermark !== undefined;
  }

  get barEffectsEnabled(): boolean {
    return this.config.bar_effect !== undefined;
  }

  // Shared by ViewCore.watermark/ViewBase.watermark below - only how a raw
  // value becomes a bar position (`toPos`) differs between them.
  static _buildResolvedWatermark({
    watermark,
    jinjaLow,
    jinjaHigh,
    lowValue,
    highValue,
    toPos,
  }: {
    watermark: WatermarkConfig;
    jinjaLow: number | null;
    jinjaHigh: number | null;
    lowValue: unknown;
    highValue: unknown;
    toPos: (value: unknown, mark: WatermarkMark) => number;
  }): ResolvedWatermark {
    // type/opacity carry no schema default (see WatermarkConfig) - applied
    // here from SCHEMA_DEFAULTS.watermark instead.
    const globalType = watermark.type ?? SCHEMA_DEFAULTS.watermark.type;
    const globalOpacity = watermark.opacity ?? SCHEMA_DEFAULTS.watermark.opacity;
    const resolveMark = (
      mark: WatermarkMark,
      jinjaOverride: number | null,
      resolvedValue: unknown,
    ): ResolvedWatermarkMark => ({
      shown: markShown(mark),
      value: toPos(jinjaOverride ?? resolvedValue, mark),
      type: markType(mark, globalType) as WatermarkType,
      opacity: markOpacity(mark, globalOpacity),
      color: ThemeManager.adaptColor(markColor(mark, watermark.color) ?? null),
    });
    return {
      low: resolveMark(watermark.low, jinjaLow, lowValue),
      high: resolveMark(watermark.high, jinjaHigh, highValue),
      opacity: globalOpacity,
      type: globalType as WatermarkType,
      line_size: watermark.line_size,
    };
  }

  get watermark(): ResolvedWatermark | null {
    const watermark = this.config.watermark as WatermarkConfig | undefined;
    if (!watermark) return null;
    // No full toPos/calcWatermark here (unlike ViewBase's override below) - a
    // ViewCore-direct instance (Template) has no min_value/max_value to
    // project onto, so `as` is moot. center_zero still needs the same
    // 50 + value/2 recenter percent itself gets in _managePercent, though -
    // without it a mark landed in the wrong half of the bar.
    const isCenterZero = Boolean(this.config.center_zero);
    const toPos = (value: unknown) => (isCenterZero ? 50 + (value as number) / 2 : (value as number));
    return ViewCore._buildResolvedWatermark({
      watermark,
      jinjaLow: this.#jinjaWatermarkLow,
      jinjaHigh: this.#jinjaWatermarkHigh,
      lowValue: this._lowValue.value,
      highValue: this._highValue.value,
      toPos,
    });
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  getTrend(currentPercent: number): string {
    const tracker = this.#ensureTrendTracker();
    tracker.push(currentPercent);
    // null (not enough data yet, cold start) falls back to 'flat' - the
    // question-mark 'error' icon would otherwise flash on every single
    // trend_indicator: true card until a second sample lands.
    return tracker.direction() ?? 'flat';
  }

  // History seeding (Card only, see HACore) - same lazy resolver as getTrend.
  seedTrend(samples: { t: number; percent: number }[]) {
    this.#ensureTrendTracker().seed(samples);
  }

  #ensureTrendTracker(): TrendTracker {
    const entity = this.config?.entity ?? null;
    if (this._trendTracker && this._trendEntityId === entity) return this._trendTracker;
    this._trendTracker = new TrendTracker(ViewCore.#trendTrackerOptions(this.config?.trend_indicator));
    this._trendEntityId = entity;
    return this._trendTracker;
  }

  static #trendTrackerOptions(config: unknown): {
    windowMs: number | null;
    basis: TrendBasis;
    thresholdPoints: number;
  } {
    if (!is.plainObject(config)) {
      return { windowMs: null, basis: 'average', thresholdPoints: CARD.config.trendIndicator.defaultThreshold };
    }
    const windowSeconds = config.window;
    return {
      windowMs: is.number(windowSeconds) ? windowSeconds * 1000 : null,
      basis: (config.basis as TrendBasis) ?? 'average',
      thresholdPoints: is.number(config.threshold) ? config.threshold : 0,
    };
  }

  // icon_animation only makes sense for domains with a real on/active vs
  // off/idle semantics (fan spinning, media playing…). A plain measurement
  // (sensor, battery %, input_number…) has no such state — without this gate a
  // battery sensor spun forever, since its numeric state never matched the
  // resting-state exclusion list below.
  static #ANIMATABLE_DOMAINS = new Set([
    'fan',
    'light',
    'switch',
    'climate',
    'humidifier',
    'vacuum',
    'media_player',
    'water_heater',
    'siren',
    'alarm_control_panel',
    'automation',
    'script',
    'input_boolean',
    'remote',
    'lock',
    'cover',
    'valve',
    'binary_sensor',
    'timer',
  ]);

  get isEntityActive(): boolean {
    if (!this._currentValue.isAvailable) return false;
    if (!ViewCore.#ANIMATABLE_DOMAINS.has(HassProviderSingleton.getEntityDomain(this.entity) ?? '')) return false;
    const state = String(this._currentValue.state ?? '').toLowerCase();
    return !['off', 'idle', 'standby', 'paused', 'closed', 'locked', 'docked', 'disarmed', 'none', ''].includes(state);
  }

  // No standard domain/state pair means "charging" the way isEntityActive's
  // resting-state list means "off" - it's usually an attribute on the entity
  // itself, and its name isn't standardized across integrations. Checked in
  // likelihood order; first one present wins. Covers both a boolean flag
  // (true) and a string status enum (e.g. battery_state: 'charging').
  static #CHARGING_ATTRIBUTES = ['battery_charging', 'charging', 'is_charging'];
  // Exact enum values, not a substring match: Renault's charge_state sensor
  // has both 'charge_in_progress' AND 'charge_ended'/'waiting_for_a_planned_
  // charge', all containing "charge" - a loose match would treat "finished"
  // as charging too. Same trap with MG SAIC's bmsChrgSts: "charging (ac/dc)"
  // is active, but "charging finished/stopped/fault/scheduled" all also
  // contain "charging" while meaning the opposite.
  static #CHARGING_STATES = new Set([
    'charging',
    'charge_in_progress',
    'v2g_charging_normal',
    'charging (ac)',
    'charging (dc)',
    'super offboard charging',
  ]);

  // EV integrations tend to report charging as the entity's own state, in
  // one of two shapes: a text status sensor (Tesla Fleet's
  // sensor.<car>_charging_state === 'charging') or, more canonically, a
  // binary_sensor with device_class: battery_charging (BYD's "is_charging",
  // 'on' means charging). The device_class check keeps a bare 'on' from
  // matching any unrelated on/off entity.
  static #entityReportsCharging(hassProvider: HassProviderSingleton, entityId: string): boolean {
    if (!hassProvider.isEntityAvailable(entityId)) return false;
    const state = String(hassProvider.getEntityProp(entityId, 'state') ?? '').toLowerCase();
    if (ViewCore.#CHARGING_STATES.has(state)) return true;
    if (state === 'on' && hassProvider.getEntityProp(entityId, 'device_class') === 'battery_charging') return true;
    return ViewCore.#CHARGING_ATTRIBUTES.some((attr) => {
      const value = hassProvider.getEntityAttribute(entityId, attr);
      return value === true || String(value).toLowerCase() === 'charging';
    });
  }

  // Trust the card's own `entity` first - a same-device sibling should never
  // shadow a signal already present on it. Falls back to scanning every
  // same-device entity (not just ones with "charg" in the id) for
  // integrations that split percentage and charging status: HA's Companion
  // App is the case that forced this - its charging entity is named
  // battery_state, no "charg" substring, but state is plain 'charging'.
  static #computeIsBatteryCharging(entity: string): boolean {
    const hassProvider = HassProviderSingleton.getInstance();
    if (ViewCore.#entityReportsCharging(hassProvider, entity)) return true;
    return hassProvider.getSameDeviceEntities(entity).some((id) => ViewCore.#entityReportsCharging(hassProvider, id));
  }

  #isBatteryChargingCache = false;

  get isBatteryCharging(): boolean {
    return this.#isBatteryChargingCache;
  }

  // battery_adaptive is a virtual theme name, never seen by ThemeManager:
  // it resolves to whichever real theme matches the entity's current
  // charging state (via isBatteryCharging, the same signal icon_animation:
  // battery_charging already relies on). critical_when_extreme while
  // charging (li-ion health favors staying mid-range over topping off to
  // 100%), critical_when_low once unplugged (only running out matters then).
  static #BATTERY_ADAPTIVE_THEMES = { charging: 'critical_when_extreme', discharging: 'critical_when_low' };

  get resolvedTheme(): string | undefined {
    const theme = this._configHelper.config.theme;
    if (theme !== 'battery_adaptive') return theme;
    return ViewCore.#BATTERY_ADAPTIVE_THEMES[this.isBatteryCharging ? 'charging' : 'discharging'];
  }

  // ─── Template's own theme support (percent themes only) ───────────────────
  // setTemplateThemeValue is only reached from _managePercent's own
  // `if (config.theme)` branch, not wired into the shared set config above.
  // #templateTheme.value stays memoized at the last-pushed percent, so
  // barColor/iconColor read the right color on *any* repaint - without this,
  // a plain hass update used to repaint and revert to the untheme'd default.

  setTemplateThemeValue(percent: number) {
    this.#templateTheme.value = percent;
  }

  // Re-resolved on every read, not just cached at setTemplateThemeValue's
  // push - resolvedTheme's battery_adaptive branch depends on
  // isBatteryCharging, which can flip without percent itself changing
  // (plugging in a charger while the reading briefly holds steady).
  // Reconfiguring costs a few property assignments only, cheap enough to
  // redo on every read instead of tracking a separate "did it change" flag.
  #refreshTemplateTheme() {
    this.#templateTheme.configure({ theme: this.resolvedTheme, customTheme: undefined, interpolate: false });
  }

  // null when no theme is configured (ThemeManager.iconColor/barColor
  // resolve to null then) - barColor/iconColor above fall back to the plain
  // color/bar_color Jinja fields in that case, same shape as ViewBase.
  // iconColor's own `theme.iconColor || config.color` (theme wins when both
  // apply).
  get templateThemeIconColor(): string | null {
    this.#refreshTemplateTheme();
    return this.#templateTheme.iconColor;
  }

  get templateThemeBarColor(): string | null {
    this.#refreshTemplateTheme();
    return this.#templateTheme.barColor;
  }

  // bar_color_mode's gradient equivalent of ViewBase.colorGradient, same
  // buildGradient this class's own templateThemeIconColor/-BarColor read
  // through #templateTheme - stands down for center_zero (templateTheme
  // DivergingGradient below owns that case instead), same convention as
  // colorGradient/themeDivergingGradient.
  get templateThemeGradient(): string | null {
    if (!this._configHelper.config.theme || this._configHelper.config.center_zero) return null;
    this.#refreshTemplateTheme();
    return this.#templateTheme.buildGradient(
      this.#templateTheme.value,
      this._configHelper.config.bar_color_mode ?? 'auto',
      {
        isVertical: this.isVerticalBar,
        isSegmented: this.isSegmented,
      },
    );
  }

  // center_zero's own equivalent of templateThemeGradient above - mirrors
  // ViewBase.themeDivergingGradient, but Template has no min_value/max_value
  // to derive a zeroPercent from: its percent field is -100..100 by
  // convention under center_zero, so zero sits at the fixed midpoint (50)
  // for a regular theme; a signed theme still spans -100..100 as one scale.
  get templateThemeDivergingGradient() {
    if (!this._configHelper.config.theme || !this._configHelper.config.center_zero) return null;
    this.#refreshTemplateTheme();
    const mode = this._configHelper.config.bar_color_mode ?? 'auto';
    const [posWindow, negWindow]: [[number, number], [number, number]] = this.#templateTheme.isSigned
      ? [
          [0, 100],
          [0, -100],
        ]
      : [
          [50, 100],
          [50, 0],
        ];
    return buildDivergingGradient({
      theme: this.#templateTheme,
      signedPercent: this.#templateTheme.value,
      mode,
      defaultColor: null,
      isVertical: this.isVerticalBar,
      isSegmented: this.isSegmented,
      posWindow,
      negWindow,
      valueRange: null,
    });
  }

  // epb-icon-charge's clip-path is calibrated to the plain "mdi:battery"
  // outline. MDI's charging/bluetooth battery variants (battery-charging-60,
  // battery-bluetooth...) draw a bolt or bluetooth glyph that shifts the
  // outline within the icon's viewBox, so the fill wipe no longer lines up on
  // those - the CSS applies a compensating offset via this flag instead of
  // changing which icon is shown.
  get isBatteryIconShifted(): boolean {
    const icon = this._configHelper.config.icon || this._hassProvider.getEntityProp(this.entity as string, 'icon');
    return is.nonEmptyString(icon) && /-charging-|-bluetooth$/i.test(icon);
  }

  // Home Connect's sensor.<appliance>_operation_state uses 'run', Miele's
  // sensor.<appliance>_status uses 'in_use' - both plain `sensor` entities,
  // which isEntityActive's domain gate deliberately excludes (see
  // #ANIMATABLE_DOMAINS). Checked in addition to, not instead of,
  // isEntityActive, so a binary_sensor/switch-based washing setup (e.g. a
  // smart-plug power monitor) keeps working exactly as before.
  static #WASHING_ACTIVE_STATES = new Set(['run', 'in_use']);

  static #sensorReportsWashing(hassProvider: HassProviderSingleton, entityId: string): boolean {
    if (!hassProvider.isEntityAvailable(entityId)) return false;
    if (HassProviderSingleton.getEntityDomain(entityId) !== 'sensor') return false;
    const state = String(hassProvider.getEntityProp(entityId, 'state') ?? '').toLowerCase();
    return ViewCore.#WASHING_ACTIVE_STATES.has(state);
  }

  // Same split as isBatteryCharging: the card's `entity` is usually the
  // progress value (Home Connect's program_progress %, Miele's elapsed_time),
  // not the status sensor carrying 'run'/'in_use' - a different entity on
  // the same device. No shared entity_id keyword across brands to filter on,
  // so the fallback checks every same-device sensor's state, not its name.
  get isWashingMachineActive(): boolean {
    if (this.isEntityActive) return true;
    const hassProvider = HassProviderSingleton.getInstance();
    const entity = this.entity as string;
    if (ViewCore.#sensorReportsWashing(hassProvider, entity)) return true;
    return hassProvider.getSameDeviceEntities(entity).some((id) => ViewCore.#sensorReportsWashing(hassProvider, id));
  }

  get jinjaAlertAbove(): number | null {
    return this.#jinjaAlertAbove;
  }

  set jinjaAlertAbove(value: unknown) {
    this.#jinjaAlertAbove = is.number(value) ? value : null;
  }

  get jinjaAlertBelow(): number | null {
    return this.#jinjaAlertBelow;
  }

  set jinjaAlertBelow(value: unknown) {
    this.#jinjaAlertBelow = is.number(value) ? value : null;
  }

  get hasJinjaAlertWhen(): boolean {
    return is.nonEmptyString(this.config?.alert_when?.jinja);
  }

  get jinjaAlertResult(): boolean | Record<string, unknown> | null {
    return this.#jinjaAlertResult;
  }

  set jinjaAlertResult(value: unknown) {
    this.#jinjaAlertResult = is.boolean(value) || is.plainObject(value) ? value : null;
  }

  get jinjaWatermarkLow(): number | null {
    return this.#jinjaWatermarkLow;
  }

  set jinjaWatermarkLow(value: unknown) {
    this.#jinjaWatermarkLow = is.number(value) ? value : null;
  }

  get jinjaWatermarkHigh(): number | null {
    return this.#jinjaWatermarkHigh;
  }

  set jinjaWatermarkHigh(value: unknown) {
    this.#jinjaWatermarkHigh = is.number(value) ? value : null;
  }

  /**
   * alert_when thresholds are expressed in the entity's native unit (like
   * watermark.low/high) - above/below resolve the same number (legacy) |
   * { entity, attribute } | { jinja } shape as watermark.low/high (see
   * _aboveValue/_belowValue, set from ViewBase.set config since alert_when
   * isn't in the template schema).
   */
  get isAlertActive(): boolean {
    const alert = this.config?.alert_when;
    if (!alert) return false;
    // Advanced mode: the trigger IS the jinja result, above/below never
    // consulted - true or an override object both mean active.
    if (this.hasJinjaAlertWhen) {
      const result = this.#jinjaAlertResult;
      return result === true || is.plainObject(result);
    }
    if (!this._currentValue.isAvailable) return false;
    const raw = this._currentValue.value;
    const value = is.number(raw) ? raw : raw?.current;
    if (!is.number(value)) return false;
    const above = this.#jinjaAlertAbove ?? this._aboveValue.value;
    const below = this.#jinjaAlertBelow ?? this._belowValue.value;
    return (is.number(above) && value > above) || (is.number(below) && value < below);
  }

  // Any key can be omitted - each resolved getter below falls back to config.
  get #alertOverride(): Record<string, unknown> {
    return is.plainObject(this.#jinjaAlertResult) ? this.#jinjaAlertResult : {};
  }

  get resolvedAlertColor(): string | null {
    const override = this.#alertOverride.color;
    return is.nonEmptyString(override) ? override : (this.config?.alert_when?.color ?? null);
  }

  get resolvedAlertHighlight(): string {
    const override = this.#alertOverride.highlight;
    return is.nonEmptyString(override) ? override : (this.config?.alert_when?.highlight ?? 'border');
  }

  get resolvedAlertLabel(): string {
    const override = this.#alertOverride.label;
    return is.nonEmptyString(override) ? override : (this.config?.alert_when?.label ?? '');
  }

  /**
   * Resolves the effective alert animation: an explicit `animation` wins;
   * otherwise falls back to the pre-1.6 default for the current `highlight`
   * (border -> blink, background -> static), so omitting it keeps old configs
   * looking exactly as before. `ping` is a box-shadow ring burst around the
   * whole card (see .alert-anim-ping) - independent of highlight's
   * border-color/background-color, so it applies the same regardless of
   * `highlight`.
   */
  get alertAnimation(): string | null {
    const alert = this.config?.alert_when;
    if (!alert) return null;
    const override = this.#alertOverride.animation;
    if (is.nonEmptyString(override)) return override;
    return alert.animation ?? (this.resolvedAlertHighlight === 'background' ? 'static' : 'blink');
  }

  // Single source of truth for "is X currently hidden": static `hide: [...]`
  // and Jinja `hide: "{{ ... }}"` alike (#resolvedHide caches a Jinja push,
  // config.hide covers the static-array case). density: compact + layout:
  // vertical forces name/secondary_info hidden ahead of both, unconditionally
  // - no room left for them at a single grid row (applyDensityRule).
  hasComponentHiddenFlag(component: string): boolean {
    if (
      this.config?.density === 'compact' &&
      this.config.layout === CARD.layout.orientations.vertical.label &&
      (component === CARD.style.dynamic.hiddenComponent.name.label ||
        component === CARD.style.dynamic.hiddenComponent.secondary_info.label)
    )
      return true;
    if (this.#resolvedHide) return this.#resolvedHide.has(component);
    return is.array(this.config?.hide) && this.config.hide.includes(component);
  }

  setResolvedHide(items: string[]): void {
    this.#resolvedHide = new Set(items);
  }

  static #hasAction(actions: (string | null)[]): boolean {
    return actions.some((action) => action !== HA_CONTEXT.actions.none.action);
  }
}
/**
 * A comprehensive base card view that extends ViewCore to manage all
 * information required for creating cards and badges. This class handles entity
 * states, theme management, percentage calculations, timers, and provides a
 * complete API for card rendering.
 *
 *       ViewCore
 *       │
 *       ├── ViewBase
 *       │   ├── CardView                  (CardConfigHelper)
 *       │   ├── BadgeView                 (BadgeConfigHelper)
 *       │   └── FeatureView               (FeatureConfigHelper)
 *       │
 *       └── (direct)
 *           ├── CardTemplateView          (TemplateConfigHelper)
 *           └── BadgeTemplateView         (BadgeTemplateConfigHelper)
 *
 * Manages the complete lifecycle of card display including:
 *  - Entity state management and validation
 *  - Theme and color management
 *  - Percentage and progress calculations
 *  - Timer and counter handling
 *  - Badge and watermark rendering
 *  - Multi-language support
 *  - Error state handling (unavailable, not found, unknown)
 *
 * @extends ViewCore
 * @example
 * const cardView = new ViewBase();
 * cardView.config = {
 *   entity: 'sensor.cpu_percent',
 *   name: 'CPU Usage',
 *   max_value: 100,
 *   unit: '%',
 *   color: '#ff6b6b',
 *   watermark: { low: 30, high: 80, type: 'gradient' }
 * };
 *
 * // Refresh with Home Assistant data
 * cardView.refresh(hass);
 *
 * // Access computed properties
 * const isReady = cardView.isAvailable;
 * const progress = cardView.percent;
 * const displayText = cardView.secondaryInfoMain;
 * const cardColor = cardView.iconColor;
 *
 * // Handle error states
 * if (cardView.hasStandardEntityError) {
 *   console.log('Entity has errors:', cardView.msg);
 * }
 *
 * // Timer-specific usage
 * if (cardView.isActiveTimer) {
 *   const interval = cardView.autoRefreshInterval;
 *   // Update UI at that refresh rate
 * }
 */
class ViewBase extends ViewCore {
  #percentHelper = new PercentHelper();
  #theme = new ThemeManager();
  #maxValue = new EntityOrValue();
  #minValue = new EntityOrValue();
  // min_value/max_value resolved from a Jinja subscription (standard cards);
  // null = no override
  #jinjaMinValue: number | null = null;
  #jinjaMaxValue: number | null = null;
  #entityCollection = new EntityCollectionHelper();

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  get hasValidatedConfig(): boolean {
    return this._configHelper.isValid;
  }

  get msg(): { content: string; sev: string } | null {
    return this._configHelper.msg;
  }

  set config(config: LovelaceConfig) {
    if (!config) {
      throw new Error(CARD.config.configError);
    }

    this._configHelper.config = config;

    const centerZero = this._configHelper.config.centerZero;

    // CF5 - issue (major) resolved - the collection was never cleared: every
    // setConfig (each editor keystroke) re-added all entities, inflating
    // getTotalValue() with duplicates
    this.#entityCollection.clear();
    if (is.nonEmptyArray(this._configHelper.config.bar_stack?.entities)) {
      const { mode, entities } = this._configHelper.config.bar_stack;
      this.#entityCollection.mode = mode;
      // entity is only ever optional on Template's own schema (no bar_stack
      // there at all) - genuinely required on Card/Badge/Feature, the only
      // three that reach this branch, just not provable from Config alone.
      const addMain = () =>
        this.#entityCollection.addEntity(
          assertDefined(this._configHelper.config.entity, 'bar_stack main entity requires config.entity'),
          { attribute: this._configHelper.config.attribute ?? null, isMain: true },
        );
      const addOne = ({ entity, attribute, color, subtract }: BarStackEntityConfig) =>
        this.#entityCollection.addEntity(entity, { attribute, color, subtract });
      // One consistent order: main entity first, then entities[] in list
      // order. Exception: without center_zero, `subtract` is otherwise a
      // silent no-op (no negative arm to place it in) - move subtract-marked
      // entities before the main entity as a visual tell. Based on the
      // static `subtract` flag only, since a live value isn't known yet here.
      if (!centerZero.enabled) {
        entities.filter((e: BarStackEntityConfig) => e.subtract).forEach(addOne);
        addMain();
        entities.filter((e: BarStackEntityConfig) => !e.subtract).forEach(addOne);
      } else {
        addMain();
        entities.forEach(addOne);
      }
    }

    this.#percentHelper.configure({
      unitSpacing: this._configHelper.config.unit_spacing ?? CARD.config.unit.unitSpacing.auto,
      // disable_unit is deprecated (folded into hide: ['unit', ...] by
      // _customizeConfig) but left untouched, and thus still checked here, when
      // hide is a Jinja template.
      hasDisabledUnit:
        this._configHelper.config.disable_unit ||
        this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.unit.label),
      isCenterZero: centerZero.enabled,
      zeroValue: centerZero.zeroValue,
      growthPercent: centerZero.growthPercent,
      scale: this._configHelper.config.bar_scale,
      compact: this._configHelper.config.value_compact,
      sign: this._configHelper.config.value_sign,
      unitPosition: this._configHelper.config.unit_position ?? CARD.config.unit.unitPosition.after,
    });

    this.#theme.configure({
      theme: this.resolvedTheme,
      customTheme: this._configHelper.config.custom_theme,
      interpolate: this._configHelper.config.interpolate,
    });

    Object.assign(this._currentValue, {
      value: this._configHelper.config.entity,
      nameTokens: this._configHelper.config.name,
      stateContent: this._configHelper.stateContent,
    });

    if (this._currentValue.entityType.isTimer) {
      this.#maxValue.value = CARD.config.value.max;
    } else {
      this._currentValue.attribute = this._configHelper.config.attribute ?? null;
      // max_value/min_value: number (legacy) | {value} | {entity, attribute} |
      // {jinja}. Jinja mode is fed by the template subscription
      // (#jinjaMaxValue/#jinjaMinValue), not by EntityOrValue — see
      // #resolveMaxValue/#resolveMinValue for the per-shape resolution, kept
      // out of this method to avoid nesting their ternaries in here.
      Object.assign(this.#maxValue, ViewBase.#resolveMaxValue(this._configHelper.config.max_value));
      this.#jinjaMaxValue = null;
      Object.assign(this.#minValue, ViewBase.#resolveMinValue(this._configHelper.config.min_value));
      this.#jinjaMinValue = null;
    }
    // Wired for timers too, unlike attribute/min/max (which a timer overrides).
    ViewCore._applyWatermarkValues(this, this._configHelper.config?.watermark as WatermarkConfig | undefined);
    // alert_when.above/.below: same shape and reasoning as watermark low/high
    // above - alert_when isn't overridden by the timer path either.
    // #jinjaAlertAbove/#jinjaAlertBelow live on ViewCore since isAlertActive
    // reads them polymorphically through the shared _cardView reference,
    // reset via the public setter rather than the private field.
    Object.assign(this._aboveValue, ViewCore._resolveValueConfig(this._configHelper.config?.alert_when?.above, null));
    this.jinjaAlertAbove = null;
    Object.assign(this._belowValue, ViewCore._resolveValueConfig(this._configHelper.config?.alert_when?.below, null));
    this.jinjaAlertBelow = null;
    this.jinjaAlertResult = null;
  }

  get config(): Config {
    return this._configHelper.config;
  }

  static #resolveMaxValue(
    maxCfg: number | { entity?: string; attribute?: string; jinja?: string } | null | undefined,
  ): { value: number | string | null; attribute?: string } {
    return ViewCore._resolveValueConfig(maxCfg, CARD.config.value.max);
  }

  static #resolveMinValue(
    minCfg: number | { entity?: string; attribute?: string; jinja?: string } | null | undefined,
  ): { value: number | string | null; attribute?: string } {
    return ViewCore._resolveValueConfig(minCfg, null);
  }

  #hasState(state: string | null): boolean {
    const toEVal = [this._currentValue, this.#maxValue];
    if (this.hasWatermark) toEVal.push(this._lowValue, this._highValue);
    if (this.config?.alert_when) toEVal.push(this._aboveValue, this._belowValue);
    return toEVal.some((v) => v.state === state);
  }

  get isUnknown(): boolean {
    return this.#hasState(HA_CONTEXT.entity.state.unknown);
  }

  get isUnavailable(): boolean {
    return this.#hasState(HA_CONTEXT.entity.state.unavailable);
  }

  get isNotFound(): boolean {
    return this.#hasState(HA_CONTEXT.entity.state.notFound);
  }

  get isAvailable(): boolean {
    // note: this used to test `this._configHelper.maxValue`, a getter that
    // never existed (always undefined), silently disabling the max-entity
    // availability check.
    const minIsEntity = is.nonEmptyString(entityOf(this._configHelper.config?.min_value));
    // Entity-mode only, like min_value/max_value above: in Jinja mode,
    // EntityOrValue never has an active helper (that value is resolved
    // separately via the template subscription, see #jinjaWatermarkLow/High),
    // so .isAvailable is always false there by construction - it must not
    // count against the card's own availability, or a Jinja watermark/alert
    // threshold would permanently hide the whole card.
    return !(
      !this._currentValue.isAvailable ||
      (!this.#maxValue.isAvailable && is.nonEmptyString(entityOf(this._configHelper.config?.max_value))) ||
      (!this.#minValue.isAvailable && minIsEntity) ||
      (!this._lowValue.isAvailable &&
        is.nonEmptyString(
          entityOf(markValue(this._configHelper.config?.watermark?.low, SCHEMA_DEFAULTS.watermark.low)),
        )) ||
      (!this._highValue.isAvailable &&
        is.nonEmptyString(
          entityOf(markValue(this._configHelper.config?.watermark?.high, SCHEMA_DEFAULTS.watermark.high)),
        )) ||
      (!this._aboveValue.isAvailable && is.nonEmptyString(entityOf(this._configHelper.config?.alert_when?.above))) ||
      (!this._belowValue.isAvailable && is.nonEmptyString(entityOf(this._configHelper.config?.alert_when?.below)))
    );
  }

  get hasStandardEntityError(): boolean {
    return this.isUnavailable || this.isNotFound || this.isUnknown;
  }

  // ─── Getters for card ─────────────────────────────────────────────────────

  get icon(): string | null {
    const notFound = this.isNotFound ? CARD.style.icon.notFound.icon : null;
    return notFound || this.#theme.icon || this._configHelper.config.icon || null;
  }

  get iconColor(): string | null {
    if (this.isUnavailable) return CARD.style.color.unavailable;
    if (this.isNotFound) return CARD.style.color.notFound;
    return (
      ThemeManager.adaptColor(this.#theme.iconColor || this._configHelper.config.color || null) ||
      this._currentValue.defaultColor ||
      CARD.style.color.default
    );
  }

  #curBarColor(): string | null {
    return (
      ThemeManager.adaptColor(this.#theme.barColor || this._configHelper.config.bar_color || null) ||
      this._currentValue.defaultColor ||
      CARD.style.color.default
    );
  }

  get barColor(): string | null {
    if (!this.isAvailable) return this.isUnknown ? CARD.style.color.default : CARD.style.color.disabled;
    const curColor = this.#curBarColor();
    // 'net' is always a single flat segment. The center_zero +
    // stacked/proportional case is handled separately by divergingBarStack (its
    // own CSS variables, two independent arms) - this path only owns the
    // non-centered multi-segment gradient and the plain fallback.
    return this.hasEntityCollection && this.#entityCollection.mode !== 'net' && !this.#percentHelper.isCenterZero
      ? this.#entityCollection.getEntitiesColor(
          curColor,
          this.percent / 100,
          this.#percentHelper.max - this.#percentHelper.min,
          this.isVerticalBar,
        )
      : curColor;
  }

  // 'stacked'/'proportional' + center_zero: two independent per-arm gradients
  // (see EntityCollectionHelper.getDivergingGradients). null when not
  // applicable, so callers can tell whether to apply or clear the dedicated CSS
  // variables.
  get divergingBarStack() {
    if (!this.isAvailable || !this.#percentHelper.isCenterZero) return null;
    if (!this.hasEntityCollection || this.#entityCollection.mode === 'net') return null;
    return this.#entityCollection.getDivergingGradients(
      this.#curBarColor(),
      {
        min: this.#percentHelper.min,
        max: this.#percentHelper.max,
        zeroValue: this.#percentHelper.zeroValue,
      },
      this.isVerticalBar,
    );
  }

  get colorGradient(): string | null {
    if (!this.isAvailable || this.#percentHelper.isCenterZero) return null;
    return this.#theme.buildGradient(
      this.#percentHelper.percent ?? 0,
      this._configHelper.config.bar_color_mode ?? 'auto',
      {
        defaultColor: this._currentValue.defaultColor || null,
        isVertical: this.isVerticalBar,
        valueRange: { min: this.#percentHelper.min, max: this.#percentHelper.max },
        isSegmented: this.isSegmented,
      },
    );
  }

  // center_zero's own equivalent of divergingBarStack above: two independent
  // per-arm theme gradients instead of one single-arm gradient, using the
  // same ThemeManager.buildGradient colorGradient calls, windowed to each
  // arm's own slice of the min_value/max_value scale. null when there's no
  // active theme gradient (bar_color_mode: auto, or no theme) - _updateCSS
  // only falls back to this when divergingBarStack doesn't already own the
  // CSS variables.
  get themeDivergingGradient() {
    if (!this.isAvailable || !this.#percentHelper.isCenterZero) return null;
    const { min, max, zeroValue, percent } = this.#percentHelper;
    if (max === min) return null;
    const zeroPercent = ((zeroValue - min) / (max - min)) * 100;
    const mode = this._configHelper.config.bar_color_mode ?? 'auto';
    // A signed theme (critical_when_extreme_center and friends) already spans
    // -100..100 as one continuous scale - [0, 100]/[0, -100] read its zone
    // numbers directly. A regular theme instead windows against zeroPercent,
    // mirroring the same zones onto each arm independently.
    const [posWindow, negWindow]: [[number, number], [number, number]] = this.#theme.isSigned
      ? [
          [0, 100],
          [0, -100],
        ]
      : [
          [zeroPercent, 100],
          [zeroPercent, 0],
        ];
    return buildDivergingGradient({
      theme: this.#theme,
      signedPercent: percent ?? 0,
      mode,
      defaultColor: this._currentValue.defaultColor || null,
      isVertical: this.isVerticalBar,
      isSegmented: this.isSegmented,
      posWindow,
      negWindow,
      valueRange: { min, max },
    });
  }

  get percent(): number {
    if (!this.isAvailable) return 0;
    return this.#percentHelper.isCenterZero
      ? Math.max(-100, Math.min(100, this.#percentHelper.percent ?? 0))
      : Math.max(0, Math.min(100, this.#percentHelper.percent ?? 0));
  }

  getTrend(): string {
    return super.getTrend(this.#percentHelper.percent ?? 0);
  }

  // Reuses the same min/max/center-zero math as the live percent, applied to
  // an arbitrary raw value - lets trend_indicator's history seeding (Card
  // only, HACore) reconstruct past percent from HA's own state history.
  percentForRawValue(value: number): number {
    return this.#percentHelper.calcWatermark(value);
  }

  // peak_marker's own history-derived positions (Card only, see HACore's
  // _seedPeakMarkerHistory) - percents already resolved at fetch time, set
  // once per window fetch rather than recomputed on every repaint.
  #peakMarker: { min: number; max: number; average: number } | null = null;

  // null clears a previous entity's marks before a re-seed (HACore's
  // _seedPeakMarkerHistoryOnce) - unlike TrendTracker, there's no live
  // recompute to fall back on between the clear and the next fetch resolving.
  setPeakMarker(marker: { min: number; max: number; average: number } | null) {
    this.#peakMarker = marker;
  }

  get peakMarker(): { min: ResolvedPeakMark; max: ResolvedPeakMark; average: ResolvedPeakMark } | null {
    if (!this.#peakMarker || !is.plainObject(this.config.peak_marker)) return null;
    const config = this.config.peak_marker;
    const globalColor = config.color as string | undefined;
    const resolve = (mark: unknown, value: number): ResolvedPeakMark => {
      const defaults = { type: config.type as PeakMarkType, opacity: config.opacity as number };
      if (is.plainObject(mark))
        return {
          shown: true,
          value,
          type: (mark.type as PeakMarkType) ?? defaults.type,
          opacity: (mark.opacity as number) ?? defaults.opacity,
          color: ThemeManager.adaptColor((mark.color as string) ?? globalColor ?? null),
        };
      return {
        // false is the editor's explicit "hidden" state (types.peakMark()'s
        // boolean branch) - distinct from absent, which is also hidden.
        shown: mark !== undefined && mark !== false,
        value,
        ...defaults,
        color: ThemeManager.adaptColor((is.string(mark) ? mark : globalColor) ?? null),
      };
    };
    return {
      min: resolve(config.min, this.#peakMarker.min),
      max: resolve(config.max, this.#peakMarker.max),
      average: resolve(config.average, this.#peakMarker.average),
    };
  }

  get secondaryInfoMain(): string | null {
    if (
      this.hasStandardEntityError ||
      (this._currentValue.entityType.isTimer && this._currentValue.value.state === HA_CONTEXT.entity.state.idle)
    )
      return this._currentValue.formatedEntityState;

    const additionalInfo = this._currentValue.stateContentToString;
    if (this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.value.label)) return additionalInfo;
    const valueInfo =
      this._currentValue.entityType.isDuration && !this._configHelper.config.unit
        ? this._currentValue.formatedEntityState
        : this.#percentHelper.toString();

    return additionalInfo === '' ? valueInfo : [additionalInfo, valueInfo].join(CARD.config.separator);
  }

  get name(): string | null {
    return is.nonEmptyArray(this._configHelper.config.name)
      ? this._currentValue.nameComposition
      : this._configHelper.config.name || this._currentValue.name || this._configHelper.config.entity || null;
  }

  get badgeInfo() {
    if (this.isNotFound) return CARD.style.icon.badge.notFound;
    if (this.isUnavailable) return CARD.style.icon.badge.unavailable;

    if (this._currentValue.entityType.isTimer) {
      const { state } = this._currentValue.value;
      const { paused, active } = HA_CONTEXT.entity.state;
      if (state === paused) return CARD.style.icon.badge.timer.paused;
      if (state === active) return CARD.style.icon.badge.timer.active;
    }
    return null;
  }

  get hasVisibleShape(): boolean {
    return this._hassProvider.hasNewShapeStrategy ? super.hasVisibleShape : true;
  }

  get timerIsReversed(): boolean {
    return (
      this._configHelper.config.reverse !== false && this._currentValue.value.state !== HA_CONTEXT.entity.state.idle
    );
  }

  get hasWatermark(): boolean {
    return this._configHelper.config.watermark !== undefined;
  }

  get watermark(): ResolvedWatermark | null {
    const watermark = this.config.watermark as WatermarkConfig | undefined;
    if (!watermark) return null;
    // A timer's own `max` isn't a stable scale the way a sensor's min/max is
    // - it's the running instance's actual duration (idle uses a [0, 100]
    // placeholder, see ViewCore#manageTimerEntity), so a raw watermark value
    // means a different position every run. 'auto' resolves to 'percent'
    // behavior for timers instead, so the configured value stays a stable
    // percentage regardless of how long any given run happens to be.
    const isTimer = this._currentValue.entityType.isTimer;
    // as: 'percent' skips calcWatermark's min/max projection (the value is
    // already a position), but under center_zero a position still needs the
    // same 50 + value/2 recenter calcWatermark itself applies - same bug as
    // ViewCore's own watermark getter, fixed there for the same reason.
    const toPos = (v: unknown, mark: WatermarkMark) => {
      const raw = v as number | { current: number } | null | undefined;
      if (isTimer) return is.number(raw) ? raw : (raw?.current ?? 0);
      if (markAs(mark) !== 'percent') return this.#percentHelper.calcWatermark(raw);
      const value = is.number(raw) ? raw : (raw?.current ?? 0);
      return this.#percentHelper.isCenterZero ? 50 + value / 2 : value;
    };
    return ViewCore._buildResolvedWatermark({
      watermark,
      jinjaLow: this.jinjaWatermarkLow,
      jinjaHigh: this.jinjaWatermarkHigh,
      lowValue: this._lowValue.value,
      highValue: this._highValue.value,
      toPos,
    });
  }

  get hasEntityCollection(): boolean {
    return this.#entityCollection.count >= 2;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh(hass: HomeAssistant) {
    super.refresh(hass); // _hassProvider, _currentValue, _lowValue, _highValue
    this.#maxValue.refresh();
    this.#minValue.refresh();
    this._aboveValue.refresh();
    this._belowValue.refresh();
    this._configHelper.checkConfig();
    this.#entityCollection.refreshAll();

    if (!this.isAvailable) return;

    this.#updatePercentHelper();
    // battery_adaptive is the one theme whose resolved value can change
    // between refreshes (charging state, not config) - #theme.configure is
    // otherwise only called from `set config` (card creation/config
    // change), so without this it stays stuck on whatever charging state was
    // true when the card first loaded. Every other theme is config-driven
    // and stable across refreshes, so this stays scoped to the one case
    // that actually needs re-resolving on every hass update.
    if (this._configHelper.config.theme === 'battery_adaptive') {
      this.#theme.configure({
        theme: this.resolvedTheme,
        customTheme: this._configHelper.config.custom_theme,
        interpolate: this._configHelper.config.interpolate,
      });
    }
    this.#theme.value =
      this.#percentHelper.valueForThemes(this.#theme.isCustomTheme, this.#theme.isBasedOnPercentage) ?? 0;
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  #updatePercentHelper() {
    // update
    this.#percentHelper.isTimer = this._currentValue.entityType.isTimer || this._currentValue.entityType.isDuration;
    const currentUnit = this.#getCurrentUnit();
    this.#percentHelper.unit = currentUnit;
    this.#percentHelper.decimal = this.#getCurrentDecimal(currentUnit);

    if (this._currentValue.entityType.isTimer) {
      this.#setTimerValues();
    } else if (this._currentValue.entityType.isCounter || this._currentValue.entityType.isNumber) {
      this.#setCounterValues();
    } else {
      this.#setStdValues();
    }
    this.#percentHelper.refresh();
  }

  #setTimerValues() {
    Object.assign(this.#percentHelper, {
      isReversed: this.timerIsReversed,
      current: this._currentValue.value.current,
      min: this._currentValue.value.min,
      max: this._currentValue.value.max,
    });
  }

  #setCounterValues() {
    Object.assign(this.#percentHelper, {
      current: this._currentValue.value.current,
      min: this._currentValue.value.min,
      max: this.#maxValue.isEntity
        ? (this.#maxValue.value?.current ?? this.#maxValue.value)
        : this._currentValue.value.max,
    });
  }

  #setStdValues() {
    // 'net' mode always wants the algebraic total. 'stacked'/'proportional'
    // switch to it too once center_zero splits them into two arms - a single
    // flat percentage doesn't mean anything once the bar itself shows two
    // independent, possibly-opposing lengths (see
    // EntityCollectionHelper.getNetValue). Without center_zero, both modes keep
    // the plain magnitude sum, matching what the bar itself visually adds up
    // to.
    const useNetValue =
      this.hasEntityCollection && (this.#entityCollection.mode === 'net' || this.#percentHelper.isCenterZero);
    const currentValue = this.hasEntityCollection
      ? useNetValue
        ? this.#entityCollection.getNetValue()
        : this.#entityCollection.getTotalValue()
      : this._currentValue.value;
    Object.assign(this.#percentHelper, {
      current: currentValue,
      min: this.#jinjaMinValue ?? this.#minValue.value?.current ?? this.#minValue.value,
      max: this.#jinjaMaxValue ?? this.#maxValue.value?.current ?? this.#maxValue.value,
    });
  }

  get jinjaMinValue(): number | null {
    return this.#jinjaMinValue;
  }

  set jinjaMinValue(value: unknown) {
    this.#jinjaMinValue = is.number(value) ? value : null;
  }

  get jinjaMaxValue(): number | null {
    return this.#jinjaMaxValue;
  }

  set jinjaMaxValue(value: unknown) {
    this.#jinjaMaxValue = is.number(value) ? value : null;
  }

  // Overrides ViewCore's own (template-only, fast_refresh-gated): standard
  // cards/badges/features compute their countdown locally, no Jinja push
  // involved - so the only thing that matters is how granular what's
  // actually shown is. 1s (round-second) when the resolved unit displays
  // seconds (s/timer/flextimer - see the unit doc), 1min (round-minute)
  // otherwise (min/h/d/HA's own natural duration format), replacing the
  // fixed per-duration formula this used to be.
  static #SECONDS_SHOWING_UNITS = new Set(['s', 'timer', 'flextimer']);

  get autoRefreshInterval(): number | null {
    if (!this.isActiveTimer) return null;
    return ViewBase.#SECONDS_SHOWING_UNITS.has(this.#getCurrentUnit()) ? 1000 : 60000;
  }

  #getCurrentUnit(): string {
    return resolveDisplayUnit(this._configHelper.config.unit, this.#maxValue.isEntity, this._currentValue.unit);
  }

  #getCurrentDecimal(currentUnit: string): number {
    return resolveDisplayDecimal(this._configHelper.config.decimal, {
      configUnit: this._configHelper.config.unit,
      resolvedUnit: currentUnit,
      entityPrecision: this._currentValue.precision,
      entityType: this._currentValue.entityType,
      entityUnit: this._currentValue.unit,
    });
  }
}
class CardView extends ViewBase {
  _configHelper = new CardConfigHelper();
}

class BadgeView extends ViewBase {
  _configHelper = new BadgeConfigHelper();
}

class FeatureView extends ViewBase {
  _configHelper = new FeatureConfigHelper();
}

class CardTemplateView extends ViewCore {
  _configHelper = new TemplateConfigHelper();
  icon: string | null = null;
}

class BadgeTemplateView extends ViewCore {
  _configHelper = new BadgeTemplateConfigHelper();
  icon: string | null = null;
}

// CardTemplateView and BadgeTemplateView are siblings (both extend ViewCore
// directly, neither extends the other), so there's no single concrete class
// to name for EntityProgressTemplateBase's own `_cardView` (which is assigned
// either one) - this names just the extra surface both actually add over
// ViewCore, the same way ViewBase names the extra surface CardView/
// BadgeView/FeatureView share.
type TemplateView = ViewCore & { icon: string | null };

export { ViewCore };
export { ViewBase };
export type { TemplateView };
export type { ResolvedWatermark };
export { CardView };
export { BadgeView };
export { FeatureView };
export { CardTemplateView };
export { BadgeTemplateView };
