/*
 * The view layer: per-card-type classes that expose computed, ready-to-render
 * values (percent, colors, watermark position, trend...) derived from the
 * negotiated config and current entity state.
 */

import { HA_CONTEXT, CARD } from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { PercentHelper, ThemeManager, EntityCollectionHelper, EntityOrValue } from './value-helpers.js';
import { HassProviderSingleton } from '../utils/hass-provider.js';
import {
  BaseConfigHelper,
  CardConfigHelper,
  BadgeConfigHelper,
  FeatureConfigHelper,
  TemplateConfigHelper,
  BadgeTemplateConfigHelper,
} from './config-helpers.js';

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

  _lastPercent = null;

  _configHelper = new BaseConfigHelper(); // Base config

  _currentValue = new EntityOrValue();

  _lowValue = new EntityOrValue();

  _highValue = new EntityOrValue();

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set config(config) {
    if (!config) {
      throw new Error(CARD.config.configError);
    }

    this._configHelper.config = config;
    Object.assign(this._currentValue, {
      value: this._configHelper.config.entity,
      stateContent: this._configHelper.stateContent,
    });
    Object.assign(this._lowValue, {
      value: this._configHelper.config?.watermark?.low,
      attribute: this._configHelper.config?.watermark?.low_attribute,
    });
    Object.assign(this._highValue, {
      value: this._configHelper.config?.watermark?.high,
      attribute: this._configHelper.config?.watermark?.high_attribute,
    });
  }

  get config() {
    return this._configHelper?.config;
  }

  refresh(hass) {
    this._hassProvider.hass = hass;
    this._currentValue.refresh();
    this._lowValue.refresh();
    this._highValue.refresh();
  }

  get entity() {
    return this.config?.entity;
  }

  get cardSize() {
    return this.config
      ? (CARD.layout.orientations[this.config.layout]?.grid?.grid_rows ?? 1)
      : CARD.layout.orientations.horizontal.grid.grid_rows;
  }

  get cardLayoutOptions() {
    if (!this.config) return CARD.layout.orientations.horizontal.grid;
    const layout = structuredClone(CARD.layout.orientations[this.config.layout]);
    layout.grid.grid_min_rows = this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.icon.label)
      ? 1
      : layout.grid.grid_min_rows +
        (this.config.bar_size === CARD.style.bar.sizeOptions.xlarge.label ||
        (this.config.layout === 'horizontal' && this.config.bar_position === 'below') ||
        (this.config.layout === 'vertical' &&
          ['default', 'below'].includes(this.config.bar_position) &&
          this.config.bar_size !== 'small')
          ? 1
          : 0);
    return layout.grid;
  }

  _getEntityColor() {
    if (this._currentValue.state === HA_CONTEXT.entity.state.unavailable) return CARD.style.color.unavailable;
    if (this._currentValue.state === HA_CONTEXT.entity.state.notFound) return CARD.style.color.notFound;
    return ThemeManager.adaptColor(this._currentValue.defaultColor || CARD.style.color.default);
  }

  get barColor() {
    return this.entity && !this._configHelper.config.bar_color ? this._getEntityColor() : null;
  }

  get iconColor() {
    return this.entity && !this._configHelper.config.color ? this._getEntityColor() : null;
  }

  get hasClickableIcon() {
    return ViewCore.#hasAction([
      this._configHelper.action.icon.tap,
      this._configHelper.action.icon.hold,
      this._configHelper.action.icon.doubleTap,
    ]);
  }

  get hasClickableCard() {
    return ViewCore.#hasAction([
      this._configHelper.action.card.tap,
      this._configHelper.action.card.hold,
      this._configHelper.action.card.doubleTap,
    ]);
  }

  get hasReversedSecondaryInfoRow() {
    // Nullish-coalesced, not strict equality: Badge/Badge Template have
    // neither 'layout' nor 'bar_position' in their schema (always undefined
    // here), but structurally render exactly like layout: horizontal +
    // bar_position: default - the only shape they have. Treating "absent" as
    // invalid would make this permanently false for them despite the option
    // otherwise working fine.
    return (
      (this.config.layout ?? 'horizontal') === 'horizontal' &&
      (this.config.bar_position ?? 'default') === 'default' &&
      this.config.reverse_secondary_info_row
    ); // ─── true
  }

  get hasVisibleShape() {
    // this.config.force_circular_background === true
    return this.config.force_circular_background || this._hasDefaultShape || this._hasInteractiveShape;
  }

  get _hasDefaultShape() {
    return this._currentValue.hasShapeByDefault && ViewCore.#hasAction([this._configHelper.action.icon.tap]);
  }

  get _hasInteractiveShape() {
    return this._configHelper.action.icon.tap !== HA_CONTEXT.actions.none.action;
  }

  get hasWatermark() {
    return this.config.watermark !== undefined;
  }

  get barEffectsEnabled() {
    return this.config.bar_effect !== undefined;
  }

  get watermark() {
    const { watermark } = this.config;
    return watermark
      ? {
          ...watermark,
          low: this._lowValue.value,
          low_color: ThemeManager.adaptColor(watermark.low_color),
          high: this._highValue.value,
          high_color: ThemeManager.adaptColor(watermark.high_color),
        }
      : null;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  getTrend(currentPercent) {
    const result =
      this._lastPercent === null
        ? 'flat'
        : this._lastPercent < currentPercent
          ? 'up'
          : this._lastPercent > currentPercent
            ? 'down'
            : 'flat';
    this._lastPercent = currentPercent;

    return result;
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

  get isEntityActive() {
    if (!this._currentValue.isAvailable) return false;
    if (!ViewCore.#ANIMATABLE_DOMAINS.has(HassProviderSingleton.getEntityDomain(this.entity))) return false;
    const state = String(this._currentValue.state ?? '').toLowerCase();
    return !['off', 'idle', 'standby', 'paused', 'closed', 'locked', 'docked', 'disarmed', 'none', ''].includes(state);
  }

  // No standard domain/state pair means "charging" the way isEntityActive's
  // resting-state list means "off" - it's usually an attribute on the entity
  // itself, and its name isn't standardized across integrations. Checked in
  // likelihood order; first one present wins. Covers both a boolean flag
  // (true) and a string status enum (e.g. battery_state: 'charging').
  static #CHARGING_ATTRIBUTES = ['battery_charging', 'charging', 'is_charging'];

  // Exact enum values, not a substring match: Renault's own charge_state
  // sensor has both 'charge_in_progress' AND 'charge_ended' /
  // 'waiting_for_a_planned_charge', which all contain "charge" - a loose
  // match would treat "finished" and "not yet started" as charging too. Same
  // trap with MG SAIC's "Charging Status" sensor (bmsChrgSts): "charging
  // (ac)"/"charging (dc)"/"super offboard charging" are actively charging,
  // but "charging finished"/"charging stopped"/"fault charging"/"scheduled
  // charging" all also contain "charging" while meaning the opposite.
  static #CHARGING_STATES = new Set([
    'charging',
    'charge_in_progress',
    'v2g_charging_normal',
    'charging (ac)',
    'charging (dc)',
    'super offboard charging',
  ]);

  // EV integrations tend to report charging as the entity's own state rather
  // than an attribute, in one of two shapes: a text status sensor (Tesla
  // Fleet's sensor.<car>_charging_state, state === 'charging') or, more
  // canonically, a binary_sensor with device_class: battery_charging (BYD's
  // hass-byd-vehicle "is_charging"), where 'on' means charging - never
  // 'charging' itself, since binary_sensor is always on/off. The device_class
  // check keeps a bare 'on' from matching any unrelated on/off entity a user
  // might point icon_animation at.
  static #entityReportsCharging(hassProvider, entityId) {
    if (!hassProvider.isEntityAvailable(entityId)) return false;
    const state = String(hassProvider.getEntityProp(entityId, 'state') ?? '').toLowerCase();
    if (ViewCore.#CHARGING_STATES.has(state)) return true;
    if (state === 'on' && hassProvider.getEntityProp(entityId, 'device_class') === 'battery_charging') return true;
    return ViewCore.#CHARGING_ATTRIBUTES.some((attr) => {
      const value = hassProvider.getEntityAttribute(entityId, attr);
      return value === true || String(value).toLowerCase() === 'charging';
    });
  }

  // Trust the card's own `entity` first - it's what the user actually
  // configured, and a same-device sibling should never shadow a signal
  // already present on it. Falls back to scanning every same-device entity
  // (not just ones whose id contains "charg") for integrations that split
  // the percentage and the charging status across two entities: Home
  // Assistant's own Companion App is the case that forced this - its
  // charging-status entity is named battery_state, no "charg" substring
  // anywhere, which an entity_id-based guess (like washing_machine's brands)
  // would never find, even though its state is plain 'charging'.
  get isBatteryCharging() {
    const hassProvider = HassProviderSingleton.getInstance();
    if (ViewCore.#entityReportsCharging(hassProvider, this.entity)) return true;
    return hassProvider
      .getSameDeviceEntities(this.entity)
      .some((id) => ViewCore.#entityReportsCharging(hassProvider, id));
  }

  // epb-icon-charge's clip-path is calibrated to the plain "mdi:battery"
  // outline. MDI's charging/bluetooth battery variants (battery-charging-60,
  // battery-bluetooth...) draw a bolt or bluetooth glyph that shifts the
  // outline within the icon's viewBox, so the fill wipe no longer lines up on
  // those - the CSS applies a compensating offset via this flag instead of
  // changing which icon is shown.
  get isBatteryIconShifted() {
    const icon = this._configHelper.config.icon || this._hassProvider.getEntityProp(this.entity, 'icon');
    return is.nonEmptyString(icon) && /charging|bluetooth/i.test(icon);
  }

  // Home Connect's sensor.<appliance>_operation_state uses 'run', Miele's
  // sensor.<appliance>_status uses 'in_use' - both plain `sensor` entities,
  // which isEntityActive's domain gate deliberately excludes (see
  // #ANIMATABLE_DOMAINS). Checked in addition to, not instead of,
  // isEntityActive, so a binary_sensor/switch-based washing setup (e.g. a
  // smart-plug power monitor) keeps working exactly as before.
  static #WASHING_ACTIVE_STATES = new Set(['run', 'in_use']);

  static #sensorReportsWashing(hassProvider, entityId) {
    if (!hassProvider.isEntityAvailable(entityId)) return false;
    if (HassProviderSingleton.getEntityDomain(entityId) !== 'sensor') return false;
    const state = String(hassProvider.getEntityProp(entityId, 'state') ?? '').toLowerCase();
    return ViewCore.#WASHING_ACTIVE_STATES.has(state);
  }

  // Same split as isBatteryCharging: the card's `entity` is usually the
  // progress value (Home Connect's program_progress %, Miele's
  // elapsed_time), not the status sensor that actually carries 'run'/
  // 'in_use' (operation_state/status) - a different entity on the same
  // device. Unlike charging, there's no shared entity_id keyword across
  // brands to filter on (operation_state/status/machine_state don't share a
  // substring), so the fallback checks every same-device sensor's state
  // instead of its name.
  get isWashingMachineActive() {
    if (this.isEntityActive) return true;
    const hassProvider = HassProviderSingleton.getInstance();
    if (ViewCore.#sensorReportsWashing(hassProvider, this.entity)) return true;
    return hassProvider
      .getSameDeviceEntities(this.entity)
      .some((id) => ViewCore.#sensorReportsWashing(hassProvider, id));
  }

  /**
   * alert_when thresholds are expressed in the entity's native unit (like
   * watermark.low/high).
   */
  get isAlertActive() {
    const alert = this.config?.alert_when;
    if (!alert || !this._currentValue.isAvailable) return false;
    const raw = this._currentValue.value;
    const value = is.number(raw) ? raw : raw?.current;
    if (!is.number(value)) return false;
    return (is.number(alert.above) && value > alert.above) || (is.number(alert.below) && value < alert.below);
  }

  /**
   * Resolves the effective alert animation: an explicit `animation` wins;
   * otherwise falls back to the pre-1.6 default for the current `highlight`
   * (border -> blink, background -> static), so omitting it keeps old configs
   * looking exactly as before. `ping` is a border-only ring burst - paired
   * with `highlight: background` it has no matching CSS rule, so it degrades
   * to that target's own default instead of silently doing nothing.
   */
  get alertAnimation() {
    const alert = this.config?.alert_when;
    if (!alert) return null;
    const isBackground = alert.highlight === 'background';
    if (alert.animation === 'ping' && isBackground) return 'static';
    return alert.animation ?? (isBackground ? 'static' : 'blink');
  }

  hasComponentHiddenFlag(component) {
    return this._hasInConfigArray('hide', component);
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  _hasInConfigArray(key, value) {
    return is.array(this.config?.[key]) && this.config[key].includes(value);
  }

  static #hasAction(actions) {
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
 *   const speed = cardView.refreshSpeed;
 *   // Update UI at calculated refresh rate
 * }
 */
class ViewBase extends ViewCore {
  #percentHelper = new PercentHelper();

  #theme = new ThemeManager();

  #maxValue = new EntityOrValue();

  #minValue = new EntityOrValue();

  // min_value/max_value resolved from a Jinja subscription (standard cards);
  // null = no override
  #jinjaMinValue = null;

  #jinjaMaxValue = null;

  // watermark.low/.high resolved from a Jinja subscription; null = no override
  #jinjaWatermarkLow = null;

  #jinjaWatermarkHigh = null;

  #entityCollection = new EntityCollectionHelper();

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  get hasValidatedConfig() {
    return this._configHelper.isValid;
  }

  get msg() {
    return this._configHelper.msg;
  }

  set config(config) {
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
      const addMain = () =>
        this.#entityCollection.addEntity(
          this._configHelper.config.entity,
          this._configHelper.config.attribute,
          null,
          false,
          true,
        );
      const addOne = ({ entity, attribute, color, subtract }) =>
        this.#entityCollection.addEntity(entity, attribute, color, subtract);
      // One consistent order for both modes: main entity first, then entities[]
      // in list order. Exception: without center_zero, `subtract` is otherwise
      // a silent no-op (there's no negative arm to place it in - see docs) -
      // move subtract-marked entities before the main entity instead, as a
      // visual tell that something atypical is configured here. Based on the
      // static `subtract` flag only: an entity's live value isn't known yet at
      // this point (only once refresh(hass) runs), so a
      // naturally-negative-but-unmarked entity can't be detected here and keeps
      // its normal after-main position.
      if (!centerZero.enabled) {
        entities.filter((e) => e.subtract).forEach(addOne);
        addMain();
        entities.filter((e) => !e.subtract).forEach(addOne);
      } else {
        addMain();
        entities.forEach(addOne);
      }
    }

    this.#percentHelper.configure({
      unitSpacing: this._configHelper.config.unit_spacing,
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
    });

    this.#theme.configure({
      theme: this._configHelper.config.theme,
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
      this._currentValue.attribute = this._configHelper.config.attribute;
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
    // Watermark low/high are wired for timers too (unlike attribute/min/max
    // above, which a timer overrides): the schema defaults watermark: {} to
    // low: 20 / high: 80, so leaving these helpers unset on a timer made
    // isAvailable() permanently false — a timer card with any watermark
    // configured froze instead of rendering.
    Object.assign(this._lowValue, {
      value: ViewBase.#resolveWatermarkValue(this._configHelper.config?.watermark?.low),
      attribute: this._configHelper.config?.watermark?.low_attribute,
    });
    this.#jinjaWatermarkLow = null;
    Object.assign(this._highValue, {
      value: ViewBase.#resolveWatermarkValue(this._configHelper.config?.watermark?.high),
      attribute: this._configHelper.config?.watermark?.high_attribute,
    });
    this.#jinjaWatermarkHigh = null;
  }

  get config() {
    return this._configHelper.config;
  }

  static #resolveMaxValue(maxCfg) {
    const isMaxObj = is.plainObject(maxCfg);
    return {
      value: isMaxObj
        ? maxCfg.jinja
          ? null
          : (maxCfg.entity ?? CARD.config.value.max)
        : (maxCfg ?? CARD.config.value.max),
      attribute: isMaxObj ? maxCfg.attribute : undefined,
    };
  }

  static #resolveMinValue(minCfg) {
    const isMinObj = is.plainObject(minCfg);
    return {
      value: isMinObj ? (minCfg.jinja ? null : (minCfg.entity ?? minCfg.value ?? null)) : minCfg,
      attribute: isMinObj ? minCfg.attribute : undefined,
    };
  }

  // watermark.low/.high: number (fixed) | string (entity id) | {jinja}. A
  // {jinja} object is fed by the template subscription
  // (#jinjaWatermarkLow/#jinjaWatermarkHigh), not by EntityOrValue, so it
  // resolves to null here — mirrors #resolveMaxValue/#resolveMinValue's own
  // jinja split.
  static #resolveWatermarkValue(sideCfg) {
    return is.plainObject(sideCfg) ? null : sideCfg;
  }

  #hasState(state) {
    const toEVal = this.hasWatermark
      ? [this._currentValue, this.#maxValue, this._lowValue, this._highValue]
      : [this._currentValue, this.#maxValue];
    return toEVal.some((v) => v.state === state);
  }

  get isUnknown() {
    return this.#hasState(HA_CONTEXT.entity.state.unknown);
  }

  get isUnavailable() {
    return this.#hasState(HA_CONTEXT.entity.state.unavailable);
  }

  get isNotFound() {
    return this.#hasState(HA_CONTEXT.entity.state.notFound);
  }

  get isAvailable() {
    // note: this used to test `this._configHelper.maxValue`, a getter that
    // never existed (always undefined), silently disabling the max-entity
    // availability check.
    const minIsEntity = is.nonEmptyString(this._configHelper.config?.min_value?.entity);
    return !(
      !this._currentValue.isAvailable ||
      (!this.#maxValue.isAvailable && is.nonEmptyString(this._configHelper.config?.max_value?.entity)) ||
      (!this.#minValue.isAvailable && minIsEntity) ||
      (!this._lowValue.isAvailable && this._configHelper.config?.watermark?.low) ||
      (!this._highValue.isAvailable && this._configHelper.config?.watermark?.high)
    );
  }

  get hasStandardEntityError() {
    return this.isUnavailable || this.isNotFound || this.isUnknown;
  }

  // ─── Getters for card ─────────────────────────────────────────────────────

  get icon() {
    const notFound = this.isNotFound ? CARD.style.icon.notFound.icon : null;
    return notFound || this.#theme.icon || this._configHelper.config.icon;
  }

  get iconColor() {
    if (this.isUnavailable) return CARD.style.color.unavailable;
    if (this.isNotFound) return CARD.style.color.notFound;
    return (
      ThemeManager.adaptColor(this.#theme.iconColor || this._configHelper.config.color) ||
      this._currentValue.defaultColor ||
      CARD.style.color.default
    );
  }

  #curBarColor() {
    return (
      ThemeManager.adaptColor(this.#theme.barColor || this._configHelper.config.bar_color) ||
      this._currentValue.defaultColor ||
      CARD.style.color.default
    );
  }

  // Mirrors HACore#_addBaseClasses's own vertical-bar/horizontal-bar
  // decision: gradients (segment/rainbow/bar_stack) are built left-to-right
  // by default, but the bar itself fills bottom-to-top in these two
  // combinations, so the gradient direction has to follow or the color
  // progression visibly runs the wrong way.
  get #isVerticalBar() {
    return (
      this.config.bar_orientation === 'up' &&
      ((this.config.layout === 'vertical' && this.config.bar_position === 'overlay') ||
        this.config.bar_position === 'background')
    );
  }

  get barColor() {
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
          this.#isVerticalBar,
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
      this.#isVerticalBar,
    );
  }

  get colorGradient() {
    if (!this.isAvailable || this.#percentHelper.isCenterZero) return null;
    return this.#theme.buildGradient(
      this.#percentHelper.percent,
      this._configHelper.config.bar_color_mode,
      this._currentValue.defaultColor,
      this.#isVerticalBar,
    );
  }

  get percent() {
    if (!this.isAvailable) return 0;
    return this.#percentHelper.isCenterZero
      ? Math.max(-100, Math.min(100, this.#percentHelper.percent))
      : Math.max(0, Math.min(100, this.#percentHelper.percent));
  }

  getTrend() {
    return super.getTrend(this.#percentHelper.percent);
  }

  get secondaryInfoMain() {
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

  get name() {
    return is.nonEmptyArray(this._configHelper.config.name)
      ? this._currentValue.nameComposition
      : this._configHelper.config.name || this._currentValue.name || this._configHelper.config.entity;
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

  get isActiveTimer() {
    return this._currentValue.entityType.isTimer && this._currentValue.state === HA_CONTEXT.entity.state.active;
  }

  get refreshSpeed() {
    const rawSpeed = this._currentValue.value.duration / CARD.config.refresh.ratio;
    const clampedSpeed = Math.min(CARD.config.refresh.max, Math.max(CARD.config.refresh.min, rawSpeed));
    return Math.max(100, Math.round(clampedSpeed / 100) * 100);
  }

  get hasVisibleShape() {
    return this._hassProvider.hasNewShapeStrategy ? super.hasVisibleShape : true;
  }

  get timerIsReversed() {
    return (
      this._configHelper.config.reverse !== false && this._currentValue.value.state !== HA_CONTEXT.entity.state.idle
    );
  }

  get hasWatermark() {
    return this._configHelper.config.watermark !== undefined;
  }

  get watermark() {
    const { watermark } = this.config;
    if (!watermark) return null;
    // A timer's own `max` isn't a stable scale the way a sensor's min/max is
    // - it's the running instance's actual duration (idle uses a [0, 100]
    // placeholder, see ViewCore#manageTimerEntity), so a raw watermark value
    // means a different position every run. 'auto' resolves to 'percent'
    // behavior for timers instead, so the configured value stays a stable
    // percentage regardless of how long any given run happens to be.
    const isTimer = this._currentValue.entityType.isTimer;
    const toPos = (v, mode) =>
      mode === 'percent' || isTimer ? (is.number(v) ? v : (v?.current ?? 0)) : this.#percentHelper.calcWatermark(v);
    return {
      ...watermark,
      low: toPos(this.#jinjaWatermarkLow ?? this._lowValue.value, watermark.low_as),
      low_color: ThemeManager.adaptColor(watermark.low_color),
      high: toPos(this.#jinjaWatermarkHigh ?? this._highValue.value, watermark.high_as),
      high_color: ThemeManager.adaptColor(watermark.high_color),
    };
  }

  get hasEntityCollection() {
    return this.#entityCollection.count >= 2;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh(hass) {
    super.refresh(hass); // _hassProvider, _currentValue, _lowValue, _highValue
    this.#maxValue.refresh();
    this.#minValue.refresh();
    this._configHelper.checkConfig();
    this.#entityCollection.refreshAll();

    if (!this.isAvailable) return;

    this.#updatePercentHelper();
    this.#theme.value = this.#percentHelper.valueForThemes(this.#theme.isCustomTheme, this.#theme.isBasedOnPercentage);
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

  get jinjaMinValue() {
    return this.#jinjaMinValue;
  }

  set jinjaMinValue(value) {
    this.#jinjaMinValue = is.number(value) ? value : null;
  }

  get jinjaMaxValue() {
    return this.#jinjaMaxValue;
  }

  set jinjaMaxValue(value) {
    this.#jinjaMaxValue = is.number(value) ? value : null;
  }

  get jinjaWatermarkLow() {
    return this.#jinjaWatermarkLow;
  }

  set jinjaWatermarkLow(value) {
    this.#jinjaWatermarkLow = is.number(value) ? value : null;
  }

  get jinjaWatermarkHigh() {
    return this.#jinjaWatermarkHigh;
  }

  set jinjaWatermarkHigh(value) {
    this.#jinjaWatermarkHigh = is.number(value) ? value : null;
  }

  #getCurrentUnit() {
    if (this._configHelper.config.unit) return this._configHelper.config.unit;
    if (this.#maxValue.isEntity) return CARD.config.unit.default;

    const unit = this._currentValue.unit;
    return unit === null ? CARD.config.unit.default : unit;
  }

  #getCurrentDecimal(currentUnit) {
    if (is.unsignedInteger(this._configHelper.config.decimal)) return this._configHelper.config.decimal;
    if (this._currentValue.precision) return this._currentValue.precision;
    if (this._currentValue.entityType.isTimer) return CARD.config.decimal.timer;
    if (this._currentValue.entityType.isCounter) return CARD.config.decimal.counter;
    if (this._currentValue.entityType.isDuration) return CARD.config.decimal.duration;
    if (['j', 'd', 'h', 'min', 's', 'ms', 'μs'].includes(this._currentValue.unit)) return CARD.config.decimal.duration;

    if (this._configHelper.config.unit)
      return this._configHelper.config.unit === CARD.config.unit.default
        ? CARD.config.decimal.percentage
        : CARD.config.decimal.other;

    return currentUnit === CARD.config.unit.default ? CARD.config.decimal.percentage : CARD.config.decimal.other;
  }
}
/**
 * A concrete ViewBase implementation for full card rendering, using
 * CardConfigHelper for card-specific configuration validation, processing,
 * and management. Inherits all entity management, theme handling, and state
 * processing from ViewBase.
 *
 * @extends ViewBase
 * @see ViewBase For inherited functionality
 * @see CardConfigHelper For configuration management details
 */
class CardView extends ViewBase {
  _configHelper = new CardConfigHelper();
}

/**
 * ViewBase variant for the Badge type — BadgeConfigHelper.
 *
 * @extends ViewBase
 */
class BadgeView extends ViewBase {
  _configHelper = new BadgeConfigHelper();
}

/**
 * ViewBase variant for the Tile Feature type — FeatureConfigHelper.
 *
 * @extends ViewBase
 */
class FeatureView extends ViewBase {
  _configHelper = new FeatureConfigHelper();
}

/**
 * ViewCore variant for the Jinja-driven Template card — TemplateConfigHelper.
 *
 * @extends ViewCore
 */
class CardTemplateView extends ViewCore {
  _configHelper = new TemplateConfigHelper();

  icon = null;
}

/**
 * ViewCore variant for the Jinja-driven Template badge —
 * BadgeTemplateConfigHelper.
 *
 * @extends ViewCore
 */
class BadgeTemplateView extends ViewCore {
  _configHelper = new BadgeTemplateConfigHelper();

  icon = null;
}

export { ViewCore };
export { ViewBase };
export { CardView };
export { BadgeView };
export { FeatureView };
export { CardTemplateView };
export { BadgeTemplateView };
