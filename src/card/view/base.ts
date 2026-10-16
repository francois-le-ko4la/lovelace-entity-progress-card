import { HA_CONTEXT, CARD } from '../../utils/parameters.js';
import { resolveDisplayUnit, resolveDisplayDecimal } from '../../utils/display-defaults.js';
import { type LovelaceConfig, type Config } from '../../utils/types.js';
import { is, assertDefined } from '../../utils/common-checks.js';
import { jinjaOf, MARK_FACTORIZATION } from '../config/schema.js';
import { ProgressMath, resolveProgressInput } from './progress-math.js';
import { formatProgress, valueForThemes, type Progress } from './progress-display.js';
import { UnitHelper } from '../values/unit-helper.js';
import {
  boundFrom,
  boundState,
  boundValue,
  isEntityBound,
  faultColor,
  isFaultState,
  refreshBound,
  type Bound,
} from './bound-value.js';
import { ThemeManager } from '../color/theme-manager.js';
import { EntityCollectionHelper } from '../color/entity-collection.js';
import { type Reading } from '../values/entity-helper.js';
import { PeakMarkerView, type ResolvedPeakMarker } from '../history/peak-marker-view.js';
import { AlertBounds } from './alert-bounds.js';
import { type WatermarkConfig, type WatermarkSide } from './watermark-view.js';
import { type HomeAssistant } from '../../utils/hass-provider.js';
import { CardConfigHelper, BadgeConfigHelper, FeatureConfigHelper } from '../config/config-helpers.js';
import {
  ViewCore,
  type ProgressConfig,
  type ProgressResolved,
  type BarStackEntityConfig,
  type EntityFault,
} from './core.js';
import { BarColors } from '../color/bar-colors.js';
import { nextTickAt } from './base/tick-schedule.js';

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
class ViewBase extends ViewCore<ViewBase> {
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
  #entityCollection = new EntityCollectionHelper();
  readonly #alertBounds = new AlertBounds({
    config: () => this._configHelper.config?.alert_when,
    jinjaState: this.jinjaState,
  });
  readonly entityView: ViewBase = this;

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  get isAlertActive(): boolean {
    if (!this.config?.alert_when || this.hasJinjaAlertWhen) return super.isAlertActive;
    if (!this._currentValue.isUsable || isFaultState(this._currentValue.state)) return false;
    const value = this._currentValue.current;
    if (!is.number(value)) return false;
    const { above, below } = this.#alertBounds;
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
    this.jinjaState.resetCommon();
    this.jinjaState.resetAlert();
    this.jinjaState.resetHideAndIcon();

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
      // Jinja mode is fed by jinjaState: no bound.
      this.#maxValue = boundFrom(this._configHelper.config.max_value, CARD.config.value.max);
      this.#minValue = boundFrom(this._configHelper.config.min_value, null);
      this.jinjaState.resetBounds();
    }
    // Wired for timers too, unlike attribute/min/max (which a timer overrides).
    this._watermark.apply();
    // Like the watermark, alert_when isn't overridden by the timer path.
    this.#alertBounds.apply();
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
    const jinja = this.jinjaState.failure(role);
    return jinja === null ? null : { role, state: HA_CONTEXT.entity.state.unavailable, jinja };
  }

  // The range is Jinja and HA has not answered yet: the card waits.
  get #isRangePending(): boolean {
    if (this._currentValue.valueKind === 'timer') return false;
    const { min_value: min, max_value: max } = this._configHelper.config;
    return (
      (is.nonEmptyString(jinjaOf(max)) &&
        this.jinjaState.maxValue === null &&
        this.jinjaState.failure('max_value') === null) ||
      (is.nonEmptyString(jinjaOf(min)) &&
        this.jinjaState.minValue === null &&
        this.jinjaState.failure('min_value') === null)
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
    const fault = faultColor(this.faultyEntity?.state ?? null);
    if (fault) return fault;
    return (
      ThemeManager.adaptColor(this.#theme.iconColor || this._configHelper.config.color || null) ||
      this._entityDefaultColor()
    );
  }

  readonly #barColors = new BarColors({
    progress: () => this.#progress,
    theme: () => this.#theme,
    collection: () => this.#entityCollection,
    config: () => this._configHelper.config,
    entityColor: () => this._currentValue.defaultColor || null,
    fallbackColor: () => this._entityDefaultColor(),
    percent: () => this.percent,
    isAvailable: () => this.isAvailable,
    isUnknown: () => this.isUnknown,
    hasCollection: () => this.hasEntityCollection,
    isVertical: () => this.isVerticalBar,
    isSegmented: () => this.isSegmented,
    isRing: () => this.isRing,
  });

  get barColor(): string | null {
    return this.#barColors.barColor;
  }

  get divergingBarStack() {
    return this.#barColors.divergingBarStack;
  }

  get colorGradient(): string | null {
    return this.#barColors.colorGradient;
  }

  get themeDivergingGradient() {
    return this.#barColors.themeDivergingGradient;
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

  #peak = new PeakMarkerView({
    config: () => this.config.peak_marker,
    reading: () => this._currentValue.reading,
    toPercent: (rawValue) => this.percentForRawValue(rawValue),
  });

  seedPeakMarker(points: { t: number; value: number }[]) {
    this.#peak.seed(points);
  }

  clearPeakMarker() {
    this.#peak.clear();
  }

  get peakMarker(): ResolvedPeakMarker | null {
    return this.#peak.resolved;
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

  _markToPos(): (value: number | null, side: WatermarkSide) => number {
    const watermark = this.config.watermark as WatermarkConfig | undefined;
    // A timer's `max` is the running instance's duration, so a raw value would
    // mean a different position every run: timers read it as a percentage.
    const isTimer = this._currentValue.valueKind === 'timer';
    return (raw, side) => {
      if (isTimer) return raw ?? 0;
      const as = MARK_FACTORIZATION.watermark.resolve({ watermark }, side, 'as');
      if (as !== 'percent') return this.#watermarkPosition(raw);
      // as: 'percent' skips the min/max projection but still needs the
      // center_zero recenter.
      const value = raw ?? 0;
      return this.#isCenterZero ? 50 + value / 2 : value;
    };
  }

  get hasEntityCollection(): boolean {
    return this.#entityCollection.count >= 2;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh(hass: HomeAssistant) {
    super.refresh(hass); // _hassProvider, _currentValue, the watermark's bounds
    for (const bound of [this.#maxValue, this.#minValue]) refreshBound(bound);
    this.#alertBounds.refresh();
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
    this.#peak.update();
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
    return this.jinjaState.minValue ?? boundValue(this.#minValue);
  }

  get #effectiveMax(): number | null {
    return this.jinjaState.maxValue ?? boundValue(this.#maxValue);
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

  nextTickAt(now: number): number | null {
    return nextTickAt(now, {
      isActiveTimer: this.isActiveTimer,
      reading: this._currentValue.reading,
      progress: this.#progress,
      peakSeeded: this.#peak.seeded,
      peakWindow: (this.config.peak_marker as { window?: unknown } | undefined)?.window,
      trendWindow: is.plainObject(this.config.trend_indicator) ? this.config.trend_indicator.window : undefined,
      stateTimestamps: () => this.#stateTimestamps(),
    });
  }

  #stateTimestamps(): number[] {
    const entity = this.entity;
    if (!entity) return [];
    return (this._currentValue.stateContent ?? [])
      .filter((prop) => HA_CONTEXT.timestampProps.has(prop))
      .map((prop) => Date.parse(this._hassProvider.getEntityProp<string>(entity, prop)));
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

class CardView extends ViewBase {
  _configHelper = new CardConfigHelper();
}

class BadgeView extends ViewBase {
  _configHelper = new BadgeConfigHelper();
}

class FeatureView extends ViewBase {
  _configHelper = new FeatureConfigHelper();
}

export { ViewBase, CardView, BadgeView, FeatureView };
