import { HA_CONTEXT, CARD, CARD_CONTEXT } from '../../utils/parameters.js';
import { type LovelaceConfig, type Config } from '../../utils/types.js';
import { is } from '../../utils/common-checks.js';
import {
  densityForcedHide,
  BAR_AROUND_ICON,
  HAS_EFFECT,
  OWN_TRIGGER_ANIMATIONS,
  YamlSchemaFactory,
  type Infer,
} from '../config/schema.js';
import { traceInstance } from '../../utils/log.js';
import { type ProgressSettings, type RawProgress } from './progress-math.js';
import { type ProgressDisplay } from './progress-display.js';
import { ThemeManager } from '../color/theme-manager.js';
import { faultColor } from './bound-value.js';
import { JinjaState } from './jinja-state.js';
import { EntityHelper } from '../values/entity-helper.js';
import { TrendTracker, trendTrackerOptions } from '../history/trend-tracker.js';
import { computeIsBatteryCharging, isWashingSensorActive } from '../values/device-probes.js';
import { cardLayoutOptions, cardSize, minGridColumns, minGridRows, type GridInputs } from './core/grid-layout.js';
import { WatermarkView, type ResolvedWatermark, type WatermarkConfig, type WatermarkSide } from './watermark-view.js';
import { HassProviderSingleton, type HomeAssistant } from '../../utils/hass-provider.js';
import { domainProfile, isStateActive } from '../values/ha-state.js';
import { nextOnGrid } from '../../utils/clock.js';
import { BaseConfigHelper, type ActionBag } from '../config/config-helpers.js';

// The validated shapes, read off the schema rather than restated: a field the
// schema gains is in the type the same day (watermark.as once was not).
type CardShape = Infer<typeof YamlSchemaFactory.card>;

type BarStackEntityConfig = NonNullable<NonNullable<CardShape['bar_stack']>['entities']>[number];

type ProgressConfig = Omit<ProgressDisplay, 'unit' | 'isTimer'> & {
  settings: ProgressSettings;
  hasDisabledUnit: boolean;
};

type ProgressResolved = { raw: RawProgress; unit: string; isTimer: boolean };

// `jinja`: a failed Jinja field's message ('' if none); absent for an entity.
type EntityFault = { role: 'entity' | 'max_value' | 'min_value'; state: string; jinja?: string };

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
abstract class ViewCore<E = unknown> {
  _hassProvider = HassProviderSingleton.getInstance();
  _trendTracker: TrendTracker | null = null;
  _trendEntityId: string | null = null;
  // `declare`: ViewCore is never instantiated, every subclass assigns its own.
  declare _configHelper: BaseConfigHelper;
  _currentValue = new EntityHelper();
  // Numbers pushed for min/max, alert above/below and watermark low/high.
  // Template writes the watermark pair too.
  readonly jinjaState = new JinjaState();
  readonly _watermark = new WatermarkView({
    config: () => this._configHelper.config?.watermark as WatermarkConfig | undefined,
    jinjaState: this.jinjaState,
    toPos: () => this._markToPos(),
  });

  constructor() {
    traceInstance('ViewCore', CARD_CONTEXT.debug.instances);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set config(config: LovelaceConfig) {
    if (!config) {
      throw new Error(CARD.config.configError);
    }

    this._configHelper.config = config;
    this.jinjaState.resetCommon();
    this.jinjaState.resetAlert();
    this._bindEntity();
    // jinja mode is fed by the template subscription, not the entity helper -
    // see WatermarkView.apply.
    this._watermark.apply();
    this.jinjaState.resetHideAndIcon();
  }

  get config(): Config {
    return this._configHelper.config;
  }

  // Vertical fill (down: mirrored) - read by HACore's vertical-bar class and by
  // every gradient's direction, Template's included.
  get isDownBar(): boolean {
    return this.isVerticalBar && this.config.bar_orientation === 'down';
  }

  get isVerticalBar(): boolean {
    return (
      (this.config.bar_orientation === 'up' || this.config.bar_orientation === 'down') &&
      ((this.config.layout === 'vertical' && this.config.bar_position === 'overlay') ||
        this.config.bar_position === 'background')
    );
  }

  // bar_position: icon - the bar is the ring around the icon.
  get isRing(): boolean {
    return this.config.bar_position === BAR_AROUND_ICON;
  }

  // When bar_segments renders real cells: buildSegmentCells and the
  // gradients both read this one rule.
  get isSegmented(): boolean {
    return is.number(this.config.bar_segments) && this.config.bar_segments >= 2;
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
    this._watermark.refresh();
    // Computed once per refresh instead of live in isBatteryCharging: with
    // battery_adaptive, a single refresh reads it 3x (resolvedTheme +
    // icon-anim-battery-charging + its -shifted variant), each a same-device
    // entity scan without caching. Only scans when something can actually
    // read the result, or every card would pay for it on every hass update.
    this.#isBatteryChargingCache =
      this.iconAnimationEffect === 'battery_charging' || this.config?.theme === 'battery_adaptive'
        ? computeIsBatteryCharging(this.entity as string)
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
  readonly entityView: E | null = null;

  // icon_animation: an enum name | { effect, jinja } - resolves either shape
  // to the effect actually chosen (see schema.ts's enumOrJinjaTrigger and
  // HABase._iconAnimationStyle, the sole consumer of both this and
  // jinjaState.iconAnimationActive).
  get iconAnimationEffect(): string | null {
    const raw = this.config?.icon_animation;
    if (is.plainObject(raw)) return (raw as { effect?: string }).effect ?? null;
    return is.string(raw) ? raw : null;
  }

  // Whether { effect, jinja } mode is configured at all, regardless of
  // whether a push has resolved yet - see HABase._iconAnimationStyle's own
  // comment on why this needs to be checked separately from
  // jinjaState.iconAnimationActive === null (which also means "no push yet",
  // not just "not in that mode").
  get hasJinjaIconAnimation(): boolean {
    const raw = this.config?.icon_animation;
    return is.plainObject(raw) && is.nonEmptyString((raw as { jinja?: string }).jinja);
  }

  // The detections that read a status entity on the card's device instead of
  // its own entity (device-probes.ts): the ChangeTracker watches those too.
  get readsSameDevice(): boolean {
    const effect = this.iconAnimationEffect;
    const animationReadsDevice =
      !this.hasJinjaIconAnimation && effect !== null && OWN_TRIGGER_ANIMATIONS.includes(effect);
    return animationReadsDevice || this.config?.theme === 'battery_adaptive';
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

  get #gridInputs(): GridInputs {
    return {
      config: this.config,
      isHidden: (component) => this.hasComponentHiddenFlag(component),
      isRing: this.isRing,
    };
  }

  get cardSize(): number {
    return cardSize(this.config);
  }

  get minGridRows(): number {
    return minGridRows(this.#gridInputs);
  }

  get minGridColumns(): number {
    return minGridColumns(this.config);
  }

  get cardLayoutOptions() {
    return cardLayoutOptions(this.#gridInputs);
  }

  // The entity's HA state color, or the card default when HA gives none.
  _entityDefaultColor(): string {
    return this._currentValue.defaultColor || CARD.style.color.default;
  }

  _getEntityColor(): string | null {
    const fault = faultColor(this._currentValue.state);
    if (fault) return fault;
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

  get watermark(): ResolvedWatermark | null {
    return this._watermark.resolved;
  }

  // Template has no min/max to project onto, so `as` is moot; center_zero still
  // needs percent's 50 + value/2 recenter or a mark lands in the wrong half.
  _markToPos(): (value: number | null, side: WatermarkSide) => number {
    const isCenterZero = Boolean(this.config.center_zero);
    return (value) => (isCenterZero ? 50 + (value as number) / 2 : (value as number));
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
    this._trendTracker = new TrendTracker(trendTrackerOptions(this.config?.trend_indicator));
    this._trendEntityId = entity;
    return this._trendTracker;
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

  // Same split as isBatteryCharging: the card's `entity` is usually the
  // progress value (Home Connect's program_progress %, Miele's elapsed_time),
  // not the status sensor carrying 'run'/'in_use' - a different entity on
  // the same device. No shared entity_id keyword across brands to filter on,
  // so the fallback checks every same-device sensor's state, not its name.
  get isWashingMachineActive(): boolean {
    return this.isEntityActive || isWashingSensorActive(this.entity as string);
  }

  get hasJinjaAlertWhen(): boolean {
    return is.nonEmptyString(this.config?.alert_when?.jinja);
  }

  // Advanced mode: the trigger IS the jinja result - true or an override
  // object both mean active. The above/below thresholds are ViewBase's.
  get isAlertActive(): boolean {
    if (!this.hasJinjaAlertWhen) return false;
    const result = this.jinjaState.alertResult;
    return result === true || is.plainObject(result);
  }

  // Any key can be omitted - each resolved getter below falls back to config.
  get #alertOverride(): Record<string, unknown> {
    return is.plainObject(this.jinjaState.alertResult) ? this.jinjaState.alertResult : {};
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
  // and Jinja `hide: "{{ ... }}"` alike (jinjaState.resolvedHide caches a Jinja
  // push, config.hide covers the static-array case). density: compact + layout:
  // vertical forces name/secondary_info hidden ahead of both, unconditionally
  // - no room left for them at a single grid row (applyDensityRule).
  // A Jinja `hide` can flip on any push, so its components have to stay in the
  // DOM for the class toggle to reach them. A static array is settled by the
  // time setConfig runs, so the structure can leave them out entirely instead
  // of building them only to display: none them.
  isStaticallyHidden(component: string): boolean {
    return (
      this.jinjaState.forcedHide.has(component) ||
      (!is.jinja(this.config?.hide) && this.hasComponentHiddenFlag(component))
    );
  }

  hasComponentHiddenFlag(component: string): boolean {
    if (this.jinjaState.forcedHide.has(component)) return true;
    if (densityForcedHide(this.config ?? {}).includes(component)) return true;
    if (this.jinjaState.resolvedHide) return this.jinjaState.resolvedHide.has(component);
    return is.array(this.config?.hide) && this.config.hide.some((target) => target === component);
  }

  // Takes the whole bag: tap/hold/doubleTap is the shape _configHelper.action
  // already hands out, so neither caller re-enumerates the three keys.
  static #hasAction(actions: ActionBag): boolean {
    return Object.values(actions).some((action) => action !== HA_CONTEXT.actions.none.action);
  }
}

export { ViewCore };
export type { BarStackEntityConfig, ProgressConfig, ProgressResolved, EntityFault };
