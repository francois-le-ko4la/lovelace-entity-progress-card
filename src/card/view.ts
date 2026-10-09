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
  jinjaOf,
  markShown,
  peakMarkShown,
  markValue,
  MARK_FACTORIZATION,
  type MarkField,
  type PeakPoint,
  SCHEMA_DEFAULTS,
  PEAK_RANGE_TYPE_DEFAULT,
  DENSITY_COMPACT_BAR_POSITIONS,
  raisesRainbowFullRow,
  BAR_AROUND_ICON,
  HAS_EFFECT,
  OWN_TRIGGER_ANIMATIONS,
  type PeakMark,
  YamlSchemaFactory,
  type Infer,
} from './schema.js';
import { cloneValue } from '../utils/browser-support.js';
import { traceInstance } from '../utils/log.js';
import { ProgressMath, resolveProgressInput, type ProgressSettings, type RawProgress } from './progress-math.js';
import {
  formatProgress,
  hasTimerOrFlexTimerUnit,
  valueForThemes,
  type Progress,
  type ProgressDisplay,
} from './progress-display.js';
import { UnitHelper } from './value-primitives.js';
import {
  boundFrom,
  boundState,
  boundUsable,
  boundValue,
  isEntityBound,
  isFaultState,
  refreshBound,
  usableBoundValue,
  type Bound,
} from './bound-value.js';
import { ThemeManager, EntityCollectionHelper } from './value-helpers.js';
import { EntityHelper, type Reading } from './entity-helper.js';
import { TrendTracker, type TrendBasis } from './trend-tracker.js';
import { PeakTracker } from './peak-tracker.js';
import { HassProviderSingleton, type HomeAssistant } from '../utils/hass-provider.js';
import { domainProfile, isStateActive } from './ha-state.js';
import { nextOnGrid, relativeAge } from '../utils/clock.js';
import {
  BaseConfigHelper,
  CardConfigHelper,
  BadgeConfigHelper,
  FeatureConfigHelper,
  TemplateConfigHelper,
  BadgeTemplateConfigHelper,
  type ActionBag,
} from './config-helpers.js';

// The validated shapes, read off the schema rather than restated: a field the
// schema gains is in the type the same day (watermark.as once was not).
type CardShape = Infer<typeof YamlSchemaFactory.card>;
type WatermarkConfig = NonNullable<CardShape['watermark']>;
type WatermarkType = 'blended' | 'area' | 'striped' | 'triangle' | 'round' | 'line';
type WatermarkSide = 'low' | 'high';

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
  line_size: string;
};
type ResolvedWatermark = {
  low: ResolvedWatermarkMark;
  high: ResolvedWatermarkMark;
  opacity: number;
  type: WatermarkType;
  line_size: string;
};

type PeakMarkType = 'line' | 'round' | 'triangle' | 'blended' | 'area' | 'striped';
type PeakZoneType = 'area' | 'blended' | 'striped';
// peak_marker.range - no value of its own: it spans min to max. The family's
// own `type` can't be its fallback (a line is not a zone), so 'area' is.
type ResolvedPeakZone = {
  shown: boolean;
  type: PeakZoneType;
  opacity: number;
  color: string | null;
};
// One resolved peak_marker.min/.max/.average - shown=false still carries a
// type/opacity/value so callers never need an extra null-check per field.
type ResolvedPeakMark = {
  shown: boolean;
  type: PeakMarkType;
  opacity: number;
  color: string | null;
  line_size: string;
  value: number;
};

type BarStackEntityConfig = NonNullable<NonNullable<CardShape['bar_stack']>['entities']>[number];

type ProgressConfig = Omit<ProgressDisplay, 'unit' | 'isTimer'> & {
  settings: ProgressSettings;
  hasDisabledUnit: boolean;
};
type ProgressResolved = { raw: RawProgress; unit: string; isTimer: boolean };

// `jinja`: a failed Jinja field's message ('' if none); absent for an entity.
type EntityFault = { role: 'entity' | 'max_value' | 'min_value'; state: string; jinja?: string };

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
  // the way ProgressMath's own division is; posSize/negSize feed
  // --stack-size-pos/-neg directly, and a value above 1 there pushes the
  // fill past .half's own overflow: hidden instead of just filling it.
  const posFill = Math.min(100, Math.max(0, signedPercent));
  const negFill = Math.min(100, Math.max(0, -signedPercent));
  // A percent-scaled theme reads each arm's own 0-100%: the positive arm shows
  // its zones as they are, the negative one sits below the first zone.
  const perArm = theme.isPercentScaled;
  const posGradient = theme.buildGradient(posFill, mode, {
    defaultColor,
    isVertical,
    window: perArm ? [0, 100] : posWindow,
    valueRange,
    isSegmented,
  });
  const negGradient = perArm
    ? theme.buildFloorGradient(negFill, mode, defaultColor)
    : theme.buildGradient(negFill, mode, { defaultColor, isVertical, window: negWindow, valueRange, isSegmented });
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
abstract class ViewCore {
  _hassProvider = HassProviderSingleton.getInstance();
  _trendTracker: TrendTracker | null = null;
  _trendEntityId: string | null = null;
  // `declare`: ViewCore is never instantiated, every subclass assigns its own.
  declare _configHelper: BaseConfigHelper;
  _currentValue = new EntityHelper();
  _lowValue: Bound = null;
  _highValue: Bound = null;
  // alert_when.jinja (Advanced mode) resolved trigger - true/an override
  // object mean active, false/empty/null mean inactive or not pushed yet.
  #jinjaAlertResult: boolean | Record<string, unknown> | null = null;
  // Numeric Jinja fields Home Assistant could not render, by option key: its
  // message, or '' when there is none (a result that is no number).
  #jinjaFailures = new Map<string, string>();
  // watermark.low/.high resolved from a Jinja subscription; null = no
  // override. Template writes them too.
  #jinjaWatermarkLow: number | null = null;
  #jinjaWatermarkHigh: number | null = null;
  // icon_animation { effect, jinja }: the resolved boolean deciding whether
  // `effect` plays. null = not in that mode, or not resolved yet.
  #jinjaIconAnimationActive: boolean | null = null;
  // hide's Jinja-resolved state (see hasComponentHiddenFlag/setResolvedHide
  // below) - null means "no push has landed yet, fall back to config.hide"
  // (also what a plain static hide: [...] array stays at forever, since
  // nothing ever calls setResolvedHide for it).
  #resolvedHide: Set<string> | null = null;
  // What a host (the Multi Feature) takes off this card whatever hide says,
  // Jinja included - see forceHidden.
  #forcedHide = new Set<string>();

  constructor() {
    traceInstance('ViewCore', CARD_CONTEXT.debug.instances);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set config(config: LovelaceConfig) {
    if (!config) {
      throw new Error(CARD.config.configError);
    }

    this._configHelper.config = config;
    this.resetJinjaFailures();
    this._bindEntity();
    // jinja mode is fed by the template subscription, not the entity helper -
    // see _applyWatermarkValues.
    ViewCore._applyWatermarkValues(this, this._configHelper.config?.watermark as WatermarkConfig | undefined);
    this.#jinjaIconAnimationActive = null;
    this.#resolvedHide = null;
  }

  get config(): Config {
    return this._configHelper.config;
  }

  // The bar fills bottom-to-top in these two combinations - read by HACore's
  // vertical-bar class and by every gradient's direction, Template's included.
  get isVerticalBar(): boolean {
    return (
      this.config.bar_orientation === 'up' &&
      ((this.config.layout === 'vertical' && this.config.bar_position === 'overlay') ||
        this.config.bar_position === 'background')
    );
  }

  // bar_position: icon - the bar is the ring around the icon.
  get isRing(): boolean {
    return this.config.bar_position === BAR_AROUND_ICON;
  }

  // When bar_segments renders real cells: HACore#_buildSegmentCells and the
  // gradients both read this one rule.
  get isSegmented(): boolean {
    return is.number(this.config.bar_segments) && this.config.bar_segments >= 2;
  }

  // Shared by ViewCore/ViewBase's own `set config` - watermark.low/.high
  // resolved into _lowValue/_highValue, jinja overrides reset to null.
  static _applyWatermarkValues(view: ViewCore, watermark: WatermarkConfig | undefined) {
    view._lowValue = boundFrom(markValue(watermark?.low, SCHEMA_DEFAULTS.watermark.low), null);
    view.jinjaWatermarkLow = null;
    view._highValue = boundFrom(markValue(watermark?.high, SCHEMA_DEFAULTS.watermark.high), null);
    view.jinjaWatermarkHigh = null;
  }

  _bindEntity() {
    const { entity } = this._configHelper.config;
    this._currentValue = new EntityHelper();
    if (is.string(entity)) this._currentValue.entityId = entity;
    this._currentValue.stateContent = this._configHelper.stateContent ?? [];
  }

  refresh(hass: HomeAssistant) {
    this._hassProvider.hass = hass;
    this._currentValue.refresh();
    refreshBound(this._lowValue);
    refreshBound(this._highValue);
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

  // The tick's refresh: hass is still the one refresh() read, only time moved.
  refreshClock() {
    this._currentValue.refresh();
  }

  get entity(): string | null {
    return this.config?.entity ?? null;
  }

  // The entity pipeline (peak marker, trend, badge, messages), null on a
  // template view that has none.
  readonly entityView: ViewBase | null = null;

  // icon_animation: an enum name | { effect, jinja } - resolves either shape
  // to the effect actually chosen (see schema.ts's enumOrJinjaTrigger and
  // HABase._iconAnimationStyle, the sole consumer of both this and
  // jinjaIconAnimationActive below).
  get iconAnimationEffect(): string | null {
    const raw = this.config?.icon_animation;
    if (is.plainObject(raw)) return (raw as { effect?: string }).effect ?? null;
    return is.string(raw) ? raw : null;
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

  // The detections that read a status entity on the card's device instead of
  // its own entity (#entityOrSameDevice): the ChangeTracker watches those too.
  get readsSameDevice(): boolean {
    const effect = this.iconAnimationEffect;
    const animationReadsDevice =
      !this.hasJinjaIconAnimation && effect !== null && OWN_TRIGGER_ANIMATIONS.includes(effect);
    return animationReadsDevice || this.config?.theme === 'battery_adaptive';
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
    return this._currentValue.valueKind === 'timer' && this._currentValue.state === HA_CONTEXT.entity.state.active;
  }

  // When the local tick next fires, null for never. A template has nothing of
  // its own that moves: fast_refresh asks for every second, HA's own push for a
  // now() field coming once a minute (#127).
  nextTickAt(now: number): number | null {
    return this.config?.fast_refresh ? nextOnGrid(now, 0, 1000) : null;
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
      DENSITY_COMPACT_BAR_POSITIONS.includes(this.config.bar_position ?? '') &&
      this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.name.label) &&
      this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.secondary_info.label);
    const baseRows =
      this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.icon.label) || contentCollapsed
        ? 1
        : layout.grid.grid_min_rows;
    const needsExtraRow =
      // Around the icon, xlarge is a thicker ring, not a taller bar row.
      (this.config.bar_size === CARD.style.bar.sizeOptions.xlarge && !this.isRing) ||
      (this.config.layout === 'horizontal' && this.config.bar_position === 'below') ||
      (this.config.layout === 'vertical' &&
        ['default', 'below'].includes(this.config.bar_position ?? '') &&
        this.config.bar_size !== CARD.style.bar.sizeOptions.small &&
        this.config.bar_size !== CARD.style.bar.sizeOptions.xsmall) ||
      raisesRainbowFullRow(this.config);
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

  // The entity's HA state color, or the card default when HA gives none.
  _entityDefaultColor(): string {
    return this._currentValue.defaultColor || CARD.style.color.default;
  }

  _getEntityColor(): string | null {
    if (this._currentValue.state === HA_CONTEXT.entity.state.unavailable) return CARD.style.color.unavailable;
    if (this._currentValue.state === HA_CONTEXT.entity.state.notFound) return CARD.style.color.notFound;
    return ThemeManager.adaptColor(this._entityDefaultColor());
  }

  abstract readonly icon: string | null;

  abstract get barColor(): string | null;

  abstract get iconColor(): string | null;

  get hasClickableIcon(): boolean {
    return ViewCore.#hasAction(this._configHelper.action.icon);
  }

  get hasClickableCard(): boolean {
    return ViewCore.#hasAction(this._configHelper.action.card);
  }

  get hasReversedSecondaryInfoRow(): boolean {
    return HAS_EFFECT.reverseSecondaryInfoRow(this.config) && Boolean(this.config.reverse_secondary_info_row);
  }

  // The shape signals a clickable icon - which domains get one by default is
  // decided in schema.ts's applyIconTapActionDefaultRule, not re-derived here -
  // or, under bar_position: background, keeps the icon out of the fill.
  get hasVisibleShape(): boolean {
    return this.config.force_circular_background || this._hasInteractiveShape || this.hasBackgroundOnlyShape;
  }

  // The disc nobody asked for: the fill covers the whole card and the icon
  // carries its color, so the disc is what keeps the two apart.
  get hasBackgroundOnlyShape(): boolean {
    return (
      this.config.bar_position === 'background' && !this.config.force_circular_background && !this._hasInteractiveShape
    );
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
    usable,
    toPos,
  }: {
    watermark: WatermarkConfig;
    jinjaLow: number | null;
    jinjaHigh: number | null;
    lowValue: number | null;
    highValue: number | null;
    usable: Record<WatermarkSide, boolean>;
    toPos: (value: number | null, side: WatermarkSide) => number;
  }): ResolvedWatermark {
    // type/opacity carry no schema default (see WatermarkConfig) - applied
    // here from SCHEMA_DEFAULTS.watermark instead.
    const globalType = watermark.type ?? SCHEMA_DEFAULTS.watermark.type;
    const globalOpacity = watermark.opacity ?? SCHEMA_DEFAULTS.watermark.opacity;
    const field = (side: WatermarkSide, name: MarkField) =>
      MARK_FACTORIZATION.watermark.resolve({ watermark }, side, name);
    const resolveMark = (
      side: WatermarkSide,
      jinjaOverride: number | null,
      resolvedValue: number | null,
    ): ResolvedWatermarkMark => ({
      shown: markShown(watermark[side]) && usable[side],
      value: toPos(jinjaOverride ?? resolvedValue, side),
      type: (field(side, 'type') ?? globalType) as WatermarkType,
      opacity: (field(side, 'opacity') ?? globalOpacity) as number,
      color: ThemeManager.adaptColor((field(side, 'color') as string | undefined) ?? null),
      line_size: (field(side, 'line_size') ?? watermark.line_size) as string,
    });
    return {
      low: resolveMark('low', jinjaLow, lowValue),
      high: resolveMark('high', jinjaHigh, highValue),
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
    const toPos = (value: number | null) => (isCenterZero ? 50 + (value as number) / 2 : (value as number));
    return ViewCore._buildResolvedWatermark({
      watermark,
      jinjaLow: this.#jinjaWatermarkLow,
      jinjaHigh: this.#jinjaWatermarkHigh,
      lowValue: boundValue(this._lowValue),
      highValue: boundValue(this._highValue),
      usable: this._usableMarks,
      toPos,
    });
  }

  // A mark whose entity or Jinja is in a fault state is dropped; the bar stays.
  get _usableMarks(): Record<WatermarkSide, boolean> {
    return {
      low: boundUsable(this._lowValue) && this.jinjaFailure('watermark.low') === null,
      high: boundUsable(this._highValue) && this.jinjaFailure('watermark.high') === null,
    };
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

  // The same arrow re-read as its window slides - never a new sample, those
  // stay one per state change.
  trendNow(): string {
    return this.#ensureTrendTracker().directionAt() ?? 'flat';
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

  // icon_animation needs a domain with a real working state (fan spinning,
  // media playing): a battery sensor's numeric state would animate forever.
  get isEntityActive(): boolean {
    if (!this._currentValue.isUsable) return false;
    const domain = HassProviderSingleton.getEntityDomain(this.entity);
    const traits = domainProfile(domain);
    const state = String(this._currentValue.state ?? '').toLowerCase();
    return (
      domain !== null &&
      traits.animatable === true &&
      state !== '' &&
      !traits.stillStates?.includes(state) &&
      isStateActive(domain, state)
    );
  }

  // EV integrations tend to report charging as the entity's own state, in
  // one of two shapes: a text status sensor (Tesla Fleet's
  // sensor.<car>_charging_state === 'charging') or, more canonically, a
  // binary_sensor with device_class: battery_charging (BYD's "is_charging",
  // 'on' means charging). The device_class check keeps a bare 'on' from
  // matching any unrelated on/off entity.
  // The card's own entity first - a same-device sibling must never shadow a
  // signal already present on it - then every entity of that device. Shared
  // by the charging and washing probes, which differ only in the question
  // they ask; availability is the strategy's business, not theirs.
  static #entityOrSameDevice(
    entity: string,
    probe: (hassProvider: HassProviderSingleton, entityId: string) => boolean,
  ): boolean {
    const hassProvider = HassProviderSingleton.getInstance();
    const ask = (id: string) => hassProvider.isEntityAvailable(id) && probe(hassProvider, id);
    return ask(entity) || hassProvider.getSameDeviceEntities(entity).some(ask);
  }

  static #entityReportsCharging(hassProvider: HassProviderSingleton, entityId: string): boolean {
    const state = String(hassProvider.getEntityProp(entityId, 'state') ?? '').toLowerCase();
    if (HA_CONTEXT.integrations.charging.states.has(state)) return true;
    if (
      state === HA_CONTEXT.entity.state.on &&
      hassProvider.getEntityProp(entityId, HA_CONTEXT.attributes.deviceClass) ===
        HA_CONTEXT.deviceClasses.batteryCharging
    )
      return true;
    return HA_CONTEXT.integrations.charging.attributes.some((attr) => {
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
    return ViewCore.#entityOrSameDevice(entity, ViewCore.#entityReportsCharging);
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

  // epb-icon-charge's clip-path is calibrated to the plain "mdi:battery"
  // outline. MDI's charging/bluetooth battery variants (battery-charging-60,
  // battery-bluetooth...) draw a bolt or bluetooth glyph that shifts the
  // outline within the icon's viewBox, so the fill wipe no longer lines up on
  // those - the CSS applies a compensating offset via this flag instead of
  // changing which icon is shown.
  get isBatteryIconShifted(): boolean {
    const icon =
      this._configHelper.config.icon ||
      this._hassProvider.getEntityProp(this.entity as string, HA_CONTEXT.attributes.icon);
    return is.nonEmptyString(icon) && /-charging-|-bluetooth$/i.test(icon);
  }

  // Home Connect's sensor.<appliance>_operation_state uses 'run', Miele's
  // sensor.<appliance>_status uses 'in_use' - both plain `sensor` entities,
  // which isEntityActive's domain gate deliberately excludes (see
  // HA_CONTEXT.domainProfiles). Checked in addition to, not instead of,
  // isEntityActive, so a binary_sensor/switch-based washing setup (e.g. a
  // smart-plug power monitor) keeps working exactly as before.
  static #sensorReportsWashing(hassProvider: HassProviderSingleton, entityId: string): boolean {
    if (HassProviderSingleton.getEntityDomain(entityId) !== HA_CONTEXT.domains.sensor) return false;
    const state = String(hassProvider.getEntityProp(entityId, 'state') ?? '').toLowerCase();
    return HA_CONTEXT.integrations.washing.states.has(state);
  }

  // Same split as isBatteryCharging: the card's `entity` is usually the
  // progress value (Home Connect's program_progress %, Miele's elapsed_time),
  // not the status sensor carrying 'run'/'in_use' - a different entity on
  // the same device. No shared entity_id keyword across brands to filter on,
  // so the fallback checks every same-device sensor's state, not its name.
  get isWashingMachineActive(): boolean {
    return this.isEntityActive || ViewCore.#entityOrSameDevice(this.entity as string, ViewCore.#sensorReportsWashing);
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

  jinjaFailure(key: string): string | null {
    return this.#jinjaFailures.get(key) ?? null;
  }

  setJinjaFailure(key: string, message: string | null) {
    if (message === null) this.#jinjaFailures.delete(key);
    else this.#jinjaFailures.set(key, message);
  }

  resetJinjaFailures() {
    this.#jinjaFailures.clear();
  }

  get jinjaWatermarkLow(): number | null {
    return this.#jinjaWatermarkLow;
  }

  set jinjaWatermarkLow(value: number | null) {
    this.#jinjaWatermarkLow = value;
  }

  get jinjaWatermarkHigh(): number | null {
    return this.#jinjaWatermarkHigh;
  }

  set jinjaWatermarkHigh(value: number | null) {
    this.#jinjaWatermarkHigh = value;
  }

  // Advanced mode: the trigger IS the jinja result - true or an override
  // object both mean active. The above/below thresholds are ViewBase's.
  get isAlertActive(): boolean {
    if (!this.hasJinjaAlertWhen) return false;
    const result = this.#jinjaAlertResult;
    return result === true || is.plainObject(result);
  }

  // Any key can be omitted - each resolved getter below falls back to config.
  get #alertOverride(): Record<string, unknown> {
    return is.plainObject(this.#jinjaAlertResult) ? this.#jinjaAlertResult : {};
  }

  // An Advanced-mode override wins over the config; each caller brings its own
  // default for when neither says anything.
  #alertOption(key: 'color' | 'highlight' | 'label' | 'animation'): string | undefined {
    const override = this.#alertOverride[key];
    return is.nonEmptyString(override) ? override : this.config?.alert_when?.[key];
  }

  get resolvedAlertColor(): string | null {
    return this.#alertOption('color') ?? null;
  }

  get resolvedAlertHighlight(): string {
    return this.#alertOption('highlight') ?? 'border';
  }

  get resolvedAlertLabel(): string {
    return this.#alertOption('label') ?? '';
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
    if (!this.config?.alert_when) return null;
    return this.#alertOption('animation') ?? (this.resolvedAlertHighlight === 'background' ? 'static' : 'blink');
  }

  // Single source of truth for "is X currently hidden": static `hide: [...]`
  // and Jinja `hide: "{{ ... }}"` alike (#resolvedHide caches a Jinja push,
  // config.hide covers the static-array case). density: compact + layout:
  // vertical forces name/secondary_info hidden ahead of both, unconditionally
  // - no room left for them at a single grid row (applyDensityRule).
  // A Jinja `hide` can flip on any push, so its components have to stay in the
  // DOM for the class toggle to reach them. A static array is settled by the
  // time setConfig runs, so the structure can leave them out entirely instead
  // of building them only to display: none them.
  isStaticallyHidden(component: string): boolean {
    return this.#forcedHide.has(component) || (!is.jinja(this.config?.hide) && this.hasComponentHiddenFlag(component));
  }

  hasComponentHiddenFlag(component: string): boolean {
    if (this.#forcedHide.has(component)) return true;
    if (
      this.config?.density === 'compact' &&
      this.config.layout === CARD.layout.orientations.vertical.label &&
      (component === CARD.style.dynamic.hiddenComponent.name.label ||
        component === CARD.style.dynamic.hiddenComponent.secondary_info.label)
    )
      return true;
    if (this.#resolvedHide) return this.#resolvedHide.has(component);
    return is.array(this.config?.hide) && this.config.hide.some((target) => target === component);
  }

  setResolvedHide(items: string[]): void {
    this.#resolvedHide = new Set(items);
  }

  forceHidden(targets: string[]): void {
    this.#forcedHide = new Set(targets);
  }

  // Takes the whole bag: tap/hold/doubleTap is the shape _configHelper.action
  // already hands out, so neither caller re-enumerates the three keys.
  static #hasAction(actions: ActionBag): boolean {
    return Object.values(actions).some((action) => action !== HA_CONTEXT.actions.none.action);
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
 * // When what the card shows next moves with no state change
 * const tickAt = cardView.nextTickAt(Date.now());
 */
class ViewBase extends ViewCore {
  // The stable half comes from the config, the resolved half from each
  // refresh; #progress is rebuilt from both whenever either changes.
  #progressConfig: ProgressConfig = {
    settings: { scale: undefined, centerZero: null },
    hasDisabledUnit: false,
    unitSpacing: CARD.config.unit.unitSpacing.auto,
    unitPosition: CARD.config.unit.unitPosition.after,
    compact: false,
    sign: false,
  };
  #progressResolved: ProgressResolved = {
    raw: { current: undefined, min: undefined, max: undefined, decimal: undefined, reversed: CARD.config.reverse },
    unit: CARD.config.unit.default,
    isTimer: false,
  };
  #progress = ViewBase.#buildProgress(this.#progressConfig, this.#progressResolved);
  #theme = new ThemeManager();
  #maxValue: Bound = null;
  #minValue: Bound = null;
  // min_value/max_value resolved from a Jinja subscription (standard cards);
  // null = no override
  #jinjaMinValue: number | null = null;
  #jinjaMaxValue: number | null = null;
  #entityCollection = new EntityCollectionHelper();
  // alert_when.above/.below: not in the template schema, which only has the
  // Jinja trigger.
  _aboveValue: Bound = null;
  _belowValue: Bound = null;
  // resolved from a Jinja subscription; null = no override
  #jinjaAlertAbove: number | null = null;
  #jinjaAlertBelow: number | null = null;
  readonly entityView: ViewBase = this;

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  get jinjaAlertAbove(): number | null {
    return this.#jinjaAlertAbove;
  }

  set jinjaAlertAbove(value: number | null) {
    this.#jinjaAlertAbove = value;
  }

  get jinjaAlertBelow(): number | null {
    return this.#jinjaAlertBelow;
  }

  set jinjaAlertBelow(value: number | null) {
    this.#jinjaAlertBelow = value;
  }

  // Thresholds are in the entity's native unit, in watermark.low/high's shapes.
  get isAlertActive(): boolean {
    if (!this.config?.alert_when || this.hasJinjaAlertWhen) return super.isAlertActive;
    if (!this._currentValue.isUsable || isFaultState(this._currentValue.state)) return false;
    const value = this._currentValue.current;
    if (!is.number(value)) return false;
    const above = this.#jinjaAlertAbove ?? usableBoundValue(this._aboveValue);
    const below = this.#jinjaAlertBelow ?? usableBoundValue(this._belowValue);
    return (is.number(above) && value > above) || (is.number(below) && value < below);
  }

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
    this.resetJinjaFailures();

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

    this.#progressConfig = {
      settings: {
        scale: this._configHelper.config.bar_scale,
        centerZero: centerZero.enabled
          ? { zeroValue: centerZero.zeroValue, growthPercent: centerZero.growthPercent }
          : null,
      },
      // disable_unit is folded into hide by _customizeConfig, except when hide
      // is a Jinja template.
      hasDisabledUnit: Boolean(
        this._configHelper.config.disable_unit ||
        this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.unit.label),
      ),
      unitSpacing: this._configHelper.config.unit_spacing ?? CARD.config.unit.unitSpacing.auto,
      unitPosition: this._configHelper.config.unit_position ?? CARD.config.unit.unitPosition.after,
      compact: this._configHelper.config.value_compact ?? false,
      sign: this._configHelper.config.value_sign ?? false,
    };
    this.#progress = ViewBase.#buildProgress(this.#progressConfig, this.#progressResolved);

    this.#configureTheme();

    this._bindEntity();
    this._currentValue.nameTokens = this._configHelper.config.name;

    if (this._currentValue.valueKind === 'timer') {
      this.#maxValue = CARD.config.value.max;
    } else {
      this._currentValue.attribute = this._configHelper.config.attribute ?? null;
      // Jinja mode is fed by #jinjaMaxValue/#jinjaMinValue: no bound.
      this.#maxValue = boundFrom(this._configHelper.config.max_value, CARD.config.value.max);
      this.#jinjaMaxValue = null;
      this.#minValue = boundFrom(this._configHelper.config.min_value, null);
      this.#jinjaMinValue = null;
    }
    // Wired for timers too, unlike attribute/min/max (which a timer overrides).
    ViewCore._applyWatermarkValues(this, this._configHelper.config?.watermark as WatermarkConfig | undefined);
    // alert_when.above/.below: same shape and reasoning as watermark low/high
    // above - alert_when isn't overridden by the timer path either.
    this._aboveValue = boundFrom(this._configHelper.config?.alert_when?.above, null);
    this.jinjaAlertAbove = null;
    this._belowValue = boundFrom(this._configHelper.config?.alert_when?.below, null);
    this.jinjaAlertBelow = null;
    this.jinjaAlertResult = null;
  }

  get config(): Config {
    return this._configHelper.config;
  }

  // The entities the bar cannot be drawn without, blamed in this order. The
  // watermark and alert_when ones only lose their own mark or alert.
  get faultyEntity(): EntityFault | null {
    const own = this._currentValue.state;
    if (isFaultState(own)) return { role: 'entity', state: own };
    return this.#faultyRange('max_value', this.#maxValue) ?? this.#faultyRange('min_value', this.#minValue);
  }

  // A timer runs on its own range: its min_value/max_value are not read.
  #faultyRange(role: 'max_value' | 'min_value', bound: Bound): EntityFault | null {
    if (this._currentValue.valueKind === 'timer') return null;
    const state = boundState(bound);
    if (isFaultState(state)) return { role, state };
    const jinja = this.jinjaFailure(role);
    return jinja === null ? null : { role, state: HA_CONTEXT.entity.state.unavailable, jinja };
  }

  // The range is Jinja and HA has not answered yet: the card waits.
  get #isRangePending(): boolean {
    if (this._currentValue.valueKind === 'timer') return false;
    const { min_value: min, max_value: max } = this._configHelper.config;
    return (
      (is.nonEmptyString(jinjaOf(max)) && this.#jinjaMaxValue === null && this.jinjaFailure('max_value') === null) ||
      (is.nonEmptyString(jinjaOf(min)) && this.#jinjaMinValue === null && this.jinjaFailure('min_value') === null)
    );
  }

  get isUnknown(): boolean {
    return this.faultyEntity?.state === HA_CONTEXT.entity.state.unknown;
  }

  get isUnavailable(): boolean {
    return this.faultyEntity?.state === HA_CONTEXT.entity.state.unavailable;
  }

  get isNotFound(): boolean {
    return this.faultyEntity?.state === HA_CONTEXT.entity.state.notFound;
  }

  get isAvailable(): boolean {
    return this._currentValue.isUsable && this.faultyEntity === null && !this.#isRangePending;
  }

  get hasStandardEntityError(): boolean {
    return this.faultyEntity !== null;
  }

  // The state the card shows in place of its value, naming a bound's entity.
  #faultLabel({ role, state, jinja }: EntityFault): string | null {
    if (jinja !== undefined) return `${role} · JINJA ${jinja || 'unavailable'}`;
    if (role === 'entity') return this._currentValue.formatedEntityState;
    const bound = role === 'max_value' ? this.#maxValue : this.#minValue;
    return isEntityBound(bound) ? `${bound.name || bound.entityId} · ${bound.formatedEntityState || state}` : state;
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
      this._entityDefaultColor()
    );
  }

  #curBarColor(): string | null {
    return (
      ThemeManager.adaptColor(this.#theme.barColor || this._configHelper.config.bar_color || null) ||
      this._entityDefaultColor()
    );
  }

  get barColor(): string | null {
    if (!this.isAvailable) return this.isUnknown ? CARD.style.color.default : CARD.style.color.disabled;
    const curColor = this.#curBarColor();
    // 'net' is always a single flat segment. The center_zero +
    // stacked/proportional case is handled separately by divergingBarStack (its
    // own CSS variables, two independent arms) - this path only owns the
    // non-centered multi-segment gradient and the plain fallback.
    return this.hasEntityCollection && this.#entityCollection.mode !== 'net' && !this.#isCenterZero
      ? this.#entityCollection.getEntitiesColor(
          curColor,
          this.percent / 100,
          this.#progress.input.max - this.#progress.input.min,
          this.isVerticalBar,
        )
      : curColor;
  }

  // 'stacked'/'proportional' + center_zero: two independent per-arm gradients
  // (see EntityCollectionHelper.getDivergingGradients). null when not
  // applicable, so callers can tell whether to apply or clear the dedicated CSS
  // variables.
  get divergingBarStack() {
    const { min, max, centerZero } = this.#progress.input;
    if (!this.isAvailable || !centerZero) return null;
    if (!this.hasEntityCollection || this.#entityCollection.mode === 'net') return null;
    return this.#entityCollection.getDivergingGradients(
      this.#curBarColor(),
      { min, max, zeroValue: centerZero.zeroValue },
      this.isVerticalBar,
    );
  }

  get colorGradient(): string | null {
    if (!this.isAvailable || this.#isCenterZero) return null;
    return this.#theme.buildGradient(
      this.#progress.math.percent ?? 0,
      this._configHelper.config.bar_color_mode ?? 'auto',
      {
        defaultColor: this._currentValue.defaultColor || null,
        isVertical: this.isVerticalBar,
        valueRange: { min: this.#progress.input.min, max: this.#progress.input.max },
        isSegmented: this.isSegmented,
        isRing: this.isRing,
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
    const { min, max, centerZero } = this.#progress.input;
    if (!this.isAvailable || !centerZero) return null;
    const { zeroValue } = centerZero;
    const { percent } = this.#progress.math;
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

  // What EPB.doctor.inspect() shows: the value and range the bar is drawn from.
  get drawnFrom(): { value: number; min: number; max: number; unit: string; theme: string | undefined } {
    const { current: value, min, max } = this.#progress.input;
    return { value, min, max, unit: this.#progress.display.unit.value, theme: this.resolvedTheme };
  }

  get #isCenterZero(): boolean {
    return this.#progress.input.centerZero !== null;
  }

  get percent(): number {
    if (!this.isAvailable) return 0;
    return ProgressMath.clampPercent(this.#progress.math.percent ?? 0, this.#isCenterZero);
  }

  getTrend(): string {
    return super.getTrend(this.#progress.math.percent ?? 0);
  }

  // Reuses the same min/max/center-zero math as the live percent, applied to
  // an arbitrary raw value - lets trend_indicator's history seeding (Card
  // only, HACore) reconstruct past percent from HA's own state history.
  percentForRawValue(value: number): number {
    return this.#watermarkPosition(value);
  }

  #watermarkPosition(value: number | null): number {
    return this.#progress.math.watermarkFor(value ?? 0);
  }

  // peak_marker (Card only): seeded from history by HACore, then fed on every
  // refresh; #peakMarker holds the resulting positions, in percent.
  #peakTracker: PeakTracker | null = null;
  #peakMarker: { min: number; max: number; average: number } | null = null;

  seedPeakMarker(points: { t: number; value: number }[]) {
    const window = (this.config.peak_marker as { window?: unknown } | undefined)?.window;
    if (!is.number(window)) return;
    this.#peakTracker = new PeakTracker(window * 1000);
    this.#peakTracker.seed(points);
    this.#updatePeakMarker();
  }

  // Before a re-seed: a previous entity's or window's marks must not linger.
  clearPeakMarker() {
    this.#peakTracker = null;
    this.#peakMarker = null;
  }

  #updatePeakMarker() {
    if (!this.#peakTracker) return;
    const { reading } = this._currentValue;
    if (reading.kind === 'scalar' && is.number(reading.value)) this.#peakTracker.push(reading.value);
    const peaks = this.#peakTracker.peaks();
    this.#peakMarker = peaks && {
      min: this.percentForRawValue(peaks.min),
      max: this.percentForRawValue(peaks.max),
      average: this.percentForRawValue(peaks.average),
    };
  }

  get peakMarker(): {
    min: ResolvedPeakMark;
    max: ResolvedPeakMark;
    average: ResolvedPeakMark;
    range: ResolvedPeakZone;
  } | null {
    if (!this.#peakMarker || !is.plainObject(this.config.peak_marker)) return null;
    const config = this.config.peak_marker;
    // The same table and resolver as the watermark above (MARK_FIELDS): a
    // peak mark differs only in existing solely once set.
    const field = (key: string, name: MarkField) =>
      MARK_FACTORIZATION.peak_marker.resolve({ peak_marker: config }, key, name);
    const color = (key: string) => ThemeManager.adaptColor((field(key, 'color') as string | undefined) ?? null);
    const resolve = (key: PeakPoint, value: number): ResolvedPeakMark => ({
      shown: peakMarkShown(config[key] as PeakMark),
      value,
      type: field(key, 'type') as PeakMarkType,
      opacity: field(key, 'opacity') as number,
      line_size: field(key, 'line_size') as string,
      color: color(key),
    });
    return {
      min: resolve('min', this.#peakMarker.min),
      max: resolve('max', this.#peakMarker.max),
      average: resolve('average', this.#peakMarker.average),
      range: {
        shown: peakMarkShown(config.range as PeakMark),
        type: (field('range', 'type') ?? PEAK_RANGE_TYPE_DEFAULT) as PeakZoneType,
        opacity: field('range', 'opacity') as number,
        color: color('range'),
      },
    };
  }

  get secondaryInfoMain(): string | null {
    const fault = this.faultyEntity;
    if (fault) return this.#faultLabel(fault);
    if (this.#isRangePending) return '';
    const { reading } = this._currentValue;
    if (reading.kind === 'timer' && reading.state === HA_CONTEXT.entity.state.idle)
      return this._currentValue.formatedEntityState;

    const additionalInfo = this._currentValue.stateContentToString;
    if (this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.value.label)) return additionalInfo;
    const valueInfo =
      this._currentValue.valueKind === 'duration' && !this._configHelper.config.unit
        ? this._currentValue.formatedEntityState
        : formatProgress(this.#progress);

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

    const { reading } = this._currentValue;
    if (reading.kind === 'timer') {
      const { paused, active } = HA_CONTEXT.entity.state;
      if (reading.state === paused) return CARD.style.icon.badge.timer.paused;
      if (reading.state === active) return CARD.style.icon.badge.timer.active;
    }
    return null;
  }

  get hasVisibleShape(): boolean {
    return this._hassProvider.hasNewShapeStrategy ? super.hasVisibleShape : true;
  }

  get timerIsReversed(): boolean {
    const { reading } = this._currentValue;
    return (
      this._configHelper.config.reverse !== false &&
      !(reading.kind === 'timer' && reading.state === HA_CONTEXT.entity.state.idle)
    );
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
    const isTimer = this._currentValue.valueKind === 'timer';
    // as: 'percent' skips calcWatermark's min/max projection (the value is
    // already a position), but under center_zero a position still needs the
    // same 50 + value/2 recenter calcWatermark itself applies - same bug as
    // ViewCore's own watermark getter, fixed there for the same reason.
    const toPos = (raw: number | null, side: WatermarkSide) => {
      if (isTimer) return raw ?? 0;
      const as = MARK_FACTORIZATION.watermark.resolve({ watermark }, side, 'as');
      if (as !== 'percent') return this.#watermarkPosition(raw);
      const value = raw ?? 0;
      return this.#isCenterZero ? 50 + value / 2 : value;
    };
    return ViewCore._buildResolvedWatermark({
      watermark,
      jinjaLow: this.jinjaWatermarkLow,
      jinjaHigh: this.jinjaWatermarkHigh,
      lowValue: boundValue(this._lowValue),
      highValue: boundValue(this._highValue),
      usable: this._usableMarks,
      toPos,
    });
  }

  get hasEntityCollection(): boolean {
    return this.#entityCollection.count >= 2;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh(hass: HomeAssistant) {
    super.refresh(hass); // _hassProvider, _currentValue, _lowValue, _highValue
    for (const bound of [this.#maxValue, this.#minValue, this._aboveValue, this._belowValue]) refreshBound(bound);
    this._configHelper.checkConfig();
    this.#entityCollection.refreshAll();

    if (!this.isAvailable) return;

    // battery_adaptive is the one theme whose resolved value can change
    // between refreshes (charging state, not config) - #theme.configure is
    // otherwise only called from `set config` (card creation/config
    // change), so without this it stays stuck on whatever charging state was
    // true when the card first loaded. Every other theme is config-driven
    // and stable across refreshes, so this stays scoped to the one case
    // that actually needs re-resolving on every hass update.
    if (this._configHelper.config.theme === 'battery_adaptive') {
      this.#configureTheme();
    }
    this.#deriveFromCurrentValue();
  }

  refreshClock() {
    super.refreshClock();
    if (this.isAvailable) this.#deriveFromCurrentValue();
  }

  #deriveFromCurrentValue() {
    this.#updateProgress();
    this.#updatePeakMarker();
    this.#theme.value = valueForThemes(this.#progress, this.#theme.isCustomTheme, this.#theme.isBasedOnPercentage) ?? 0;
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  static #buildProgress(
    { settings, hasDisabledUnit, ...display }: ProgressConfig,
    { raw, unit, isTimer }: ProgressResolved,
  ): Progress {
    const input = resolveProgressInput(raw, settings);
    const unitHelper = new UnitHelper();
    unitHelper.value = unit;
    unitHelper.isDisabled = hasDisabledUnit;
    return { input, math: new ProgressMath(input), display: { ...display, unit: unitHelper, isTimer } };
  }

  #updateProgress() {
    const currentUnit = this.#getCurrentUnit();
    const { reversed, ...values } = this.#resolvedValues();
    this.#progressResolved = {
      raw: {
        ...values,
        decimal: this.#getCurrentDecimal(currentUnit),
        reversed: reversed ?? this.#progressResolved.raw.reversed,
      },
      unit: currentUnit,
      isTimer: this._currentValue.valueKind === 'timer' || this._currentValue.valueKind === 'duration',
    };
    this.#progress = ViewBase.#buildProgress(this.#progressConfig, this.#progressResolved);
  }

  // Which value/min/max the bar runs on, by entity kind. Returned rather than
  // written into the helper: one caller assembles, one call applies.
  #resolvedValues(): { current: unknown; min: unknown; max: unknown; reversed?: boolean } {
    const { reading } = this._currentValue;
    if (reading.kind === 'timer') return this.#timerValues(reading);
    if (reading.kind === 'ranged') return this.#counterValues(reading);
    return this.#stdValues();
  }

  #timerValues({ current, min, max }: Extract<Reading, { kind: 'timer' }>) {
    return { reversed: this.timerIsReversed, current, min, max };
  }

  // A counter and a number carry their own min/max, and those are the right
  // default - but only a default: an explicit min_value/max_value used to be
  // dropped here, leaving no way to scale such an entity at all (#143).
  #counterValues(reading: Extract<Reading, { kind: 'ranged' }>) {
    const wasSet = (key: string) => this._configHelper.wasSetByUser(key);
    const max = wasSet('max_value') ? this.#effectiveMax : reading.max;
    return {
      current: reading.current,
      min: wasSet('min_value')
        ? this.#effectiveMin
        : ProgressMath.ownRangeMin(reading.min, max, this._configHelper.config.centerZero),
      max,
    };
  }

  // A Jinja push first, then the configured entity's `current` or the plain
  // number.
  get #effectiveMin(): number | null {
    return this.#jinjaMinValue ?? boundValue(this.#minValue);
  }

  get #effectiveMax(): number | null {
    return this.#jinjaMaxValue ?? boundValue(this.#maxValue);
  }

  #stdValues() {
    // 'net' mode always wants the algebraic total. 'stacked'/'proportional'
    // switch to it too once center_zero splits them into two arms - a single
    // flat percentage doesn't mean anything once the bar itself shows two
    // independent, possibly-opposing lengths (see
    // EntityCollectionHelper.getNetValue). Without center_zero, both modes keep
    // the plain magnitude sum, matching what the bar itself visually adds up
    // to.
    const useNetValue = this.hasEntityCollection && (this.#entityCollection.mode === 'net' || this.#isCenterZero);
    const currentValue = this.hasEntityCollection
      ? useNetValue
        ? this.#entityCollection.getNetValue()
        : this.#entityCollection.getTotalValue()
      : this._currentValue.current;
    return {
      current: currentValue,
      min: this.#effectiveMin,
      max: this.#effectiveMax,
    };
  }

  get jinjaMinValue(): number | null {
    return this.#jinjaMinValue;
  }

  set jinjaMinValue(value: number | null) {
    this.#jinjaMinValue = value;
  }

  get jinjaMaxValue(): number | null {
    return this.#jinjaMaxValue;
  }

  set jinjaMaxValue(value: number | null) {
    this.#jinjaMaxValue = value;
  }

  // A sliding window moves all the time: re-read once a minute, sooner if
  // shorter.
  static #slideTickAt(now: number, windowSeconds: unknown): number[] {
    return is.number(windowSeconds) ? [nextOnGrid(now, 0, Math.min(60000, windowSeconds * 1000))] : [];
  }

  // The next instant something shown moves with no state change: a running
  // timer's value, a relative time, a sliding window.
  nextTickAt(now: number): number | null {
    if (this.isActiveTimer) return this.#timerTickAt(now);
    const trend = this.config.trend_indicator;
    const deadlines = [
      ...(this.#peakTracker
        ? ViewBase.#slideTickAt(now, (this.config.peak_marker as { window?: unknown })?.window)
        : []),
      ...(is.plainObject(trend) ? ViewBase.#slideTickAt(now, trend.window) : []),
      ...this.#relativeTickAt(now),
    ];
    return deadlines.length > 0 ? Math.min(...deadlines) : null;
  }

  // Its value turns on the timer's own clock: at each whole step for a
  // countdown, which truncates, half a step in for any other number (rounds).
  #timerTickAt(now: number): number {
    const { reading } = this._currentValue;
    const timer = reading.kind === 'timer' ? reading : null;
    const startedAt = timer?.startedAt;
    const perUnitMs =
      this.#progress.display.unit.value === CARD.config.unit.default ? ((timer?.max ?? 0) * 1000) / 100 : 1000;
    const step = perUnitMs / 10 ** this.#progress.input.decimal;
    const origin = is.number(startedAt) ? startedAt : 0;
    // Not Math.max: an unreadable duration (NaN) still ticks by the second.
    return nextOnGrid(now, origin, step > 1000 ? step : 1000, hasTimerOrFlexTimerUnit(this.#progress) ? 0 : 0.5);
  }

  #relativeTickAt(now: number): number[] {
    const entity = this.entity;
    if (!entity) return [];
    return (this._currentValue.stateContent ?? [])
      .filter((prop) => HA_CONTEXT.timestampProps.has(prop))
      .map((prop) => Date.parse(this._hassProvider.getEntityProp<string>(entity, prop)))
      .filter((since) => is.number(since))
      .map((since) => since + relativeAge(now - since).changesAtMs);
  }

  // Which config keys feed the theme, in one place: called on `set config`
  // and again per refresh for battery_adaptive (see its own comment there).
  #configureTheme() {
    this.#theme.configure({
      theme: this.resolvedTheme,
      customTheme: this._configHelper.config.custom_theme,
      interpolate: this._configHelper.config.interpolate,
    });
  }

  #getCurrentUnit(): string {
    return resolveDisplayUnit(this._configHelper.config.unit, isEntityBound(this.#maxValue), this._currentValue.unit);
  }

  #getCurrentDecimal(currentUnit: string): number {
    return resolveDisplayDecimal(this._configHelper.config.decimal, {
      configUnit: this._configHelper.config.unit,
      resolvedUnit: currentUnit,
      entityPrecision: this._currentValue.precision,
      valueKind: this._currentValue.valueKind,
      entityUnit: this._currentValue.unit,
    });
  }
}

// What a Template view adds over ViewCore: its percent-based theme and the
// last color Jinja pushes, which cards.ts writes straight to CSS.
abstract class TemplateViewBase extends ViewCore {
  icon: string | null = null;
  #templateTheme = new ThemeManager();
  #templateColorValue: string | null = null;
  #templateBarColorValue: string | null = null;

  set config(config: LovelaceConfig) {
    super.config = config;
    this.#templateColorValue = null;
    this.#templateBarColorValue = null;
  }

  get config(): Config {
    return super.config;
  }

  // Theme, then color, then the entity: unlike ViewBase, the user's Jinja can
  // test availability itself. Read on every repaint, not only after a push.
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

  setTemplateColorValue(value: string | null) {
    this.#templateColorValue = value;
  }

  setTemplateBarColorValue(value: string | null) {
    this.#templateBarColorValue = value;
  }

  // Only reached from _managePercent's `if (config.theme)` branch. The value
  // stays memoized, so a plain hass update repaints the themed color.
  setTemplateThemeValue(percent: number) {
    this.#templateTheme.value = percent;
  }

  // Re-resolved on every read: battery_adaptive can flip with isBatteryCharging
  // while the percent holds steady.
  #refreshTemplateTheme() {
    this.#templateTheme.configure({ theme: this.resolvedTheme, customTheme: undefined, interpolate: false });
  }

  // null when no theme is configured.
  get templateThemeIconColor(): string | null {
    this.#refreshTemplateTheme();
    return this.#templateTheme.iconColor;
  }

  get templateThemeBarColor(): string | null {
    this.#refreshTemplateTheme();
    return this.#templateTheme.barColor;
  }

  // The gradient twin of ViewBase.colorGradient; center_zero has its own below.
  get templateThemeGradient(): string | null {
    if (!this._configHelper.config.theme || this._configHelper.config.center_zero) return null;
    this.#refreshTemplateTheme();
    return this.#templateTheme.buildGradient(
      this.#templateTheme.value,
      this._configHelper.config.bar_color_mode ?? 'auto',
      {
        isVertical: this.isVerticalBar,
        isSegmented: this.isSegmented,
        isRing: this.isRing,
      },
    );
  }

  // No min_value/max_value to derive a zeroPercent from: percent is -100..100
  // under center_zero, so zero sits at 50 (a signed theme spans -100..100).
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

class CardTemplateView extends TemplateViewBase {
  _configHelper = new TemplateConfigHelper();
}

class BadgeTemplateView extends TemplateViewBase {
  _configHelper = new BadgeTemplateConfigHelper();
}

// CardTemplateView and BadgeTemplateView are siblings: this names what
// EntityProgressTemplateBase's `_cardView` holds, whichever of the two.
type TemplateView = TemplateViewBase;

export { ViewCore };
export { ViewBase };
export type { TemplateView };
export type { ResolvedWatermark };
export { CardView };
export { BadgeView };
export { FeatureView };
export { CardTemplateView };
export { BadgeTemplateView };
