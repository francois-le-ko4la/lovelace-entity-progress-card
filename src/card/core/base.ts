import { META, suffixedName, HA_CONTEXT, CARD } from '../../utils/parameters.js';
import { is, assertDefined } from '../../utils/common-checks.js';
import { ThemeManager } from '../color/theme-manager.js';
import { type HomeAssistant } from '../../utils/hass-provider.js';
import { type ViewCore } from '../view/core.js';
import { type ViewBase } from '../view/base.js';
import {
  statusLabelObj,
  BAR_POSITIONS,
  BAR_AROUND_ICON,
  ICON_ANIMATIONS,
  OWN_TRIGGER_ANIMATIONS,
} from '../config/schema.js';
import { ActionHelper, type CacheValue } from '../dom/dom-helpers.js';
import { StatusLabel } from '../dom/status-label.js';
import { BadgeIcon } from '../dom/badge-icon.js';
import { IconManager } from './base/icon-manager.js';
import { Alert } from '../dom/alert.js';
import { Marks } from '../dom/marks.js';
import { type LovelaceConfig, type Config } from '../../utils/types.js';
import { type StructureOptions } from '../dom/structure.js';
import { gridOptionsOf } from './base/layout.js';
import { applyJinjaNumber } from './base/jinja-number.js';
import { splitAtFirstBreak } from './base/split-break.js';
import { HACore, RING_MAX_GAP, TREND_ICONS, type JinjaNumberProp, JINJA_NUMBER_KEY } from './core.js';

/**
 * Extends HACore with entity rendering: icon, badge, shape, trend, hidden
 * components, standard fields, and Jinja badge handlers.
 *
 * Subclasses MAY override: - _updateCSS() → HACore's entity-driven bar
 * repaint (Template swaps in its own Jinja-driven one) - _buildStyle() → CSS
 * class pipeline (calls super, then adds entity-specific classes) -
 * _updateDynamicElements() → DOM update orchestration (icon, badge, shape,
 * trend, CSS, Jinja) - _getStandardFields() → static — returns
 * [{className, value}] for text fields to render - _hiddenComponents → static
 * — extend the array to add card-type-specific hide targets
 *
 * @abstract
 * @extends HACore
 */

class HABase extends HACore {
  static _baseClass: string = META.types.card.typeName;
  static _structureType = 'card';
  static _hiddenComponents: { label: string; class?: string }[] = [
    CARD.style.dynamic.hiddenComponent.icon,
    CARD.style.dynamic.hiddenComponent.name,
    CARD.style.dynamic.hiddenComponent.secondary_info,
    CARD.style.dynamic.hiddenComponent.progress_bar,
  ];
  // `declare`: every HABase subclass assigns its own real view (Card/Badge
  // for card types, CardTemplateView/BadgeTemplateView for template ones).
  declare _cardView: ViewCore<ViewBase>;
  // _actionHelper itself inherited from HACore (nullable there) - always
  // assigned unconditionally in the constructor below, for every HABase
  // instance.
  #badgeIcon = new BadgeIcon(() => this._dom);
  #iconManager = new IconManager({
    dom: () => this._dom,
    hass: () => this.hass,
    isConnected: () => this.isConnected,
    log: () => this._log,
  });
  #lastMessage: { content: string; sev: string } | null = null;
  #statusLabel = new StatusLabel(
    () => this._dom,
    () => this._cardView,
  );
  #alert = new Alert({
    view: () => this._cardView,
    dom: () => this._dom,
    toggleClasses: (style) => this._toggleClasses(style),
    statusLabel: this.#statusLabel,
  });

  // ─── LIFECYCLE METHODS ────────────────────────────────────────────────────

  static get _loggedMethods() {
    return [
      ...super._loggedMethods,
      '_showIcon',
      '_showBadge',
      '_manageShape',
      '_updateTrend',
      '_addBaseClasses',
      '_addBaseParameter',
      '_applyConditionalClasses',
      '_applyStaticClasses',
      '_applyIconAnimationClasses',
      '_applyAlertClasses',
      '_handleHiddenComponents',
      '_manageErrorMessage',
      '_renderMessage',
      '_renderBadgeIcon',
      '_renderBadgeColor',
      '_renderIconAnimationWhen',
      '_processStandardFields',
    ];
  }

  constructor() {
    super();
    this._actionHelper = new ActionHelper(this);
  }

  // Badge/status_label caches reset here since they live on HABase (shared
  // by Card/Badge/Feature/Template), not ViewCore's own `set config`.
  setConfig(config: LovelaceConfig) {
    super.setConfig(config);
    this.#badgeIcon.reset();
    this.#statusLabel.clearStatus();
  }

  connectedCallback() {
    super.connectedCallback(); // render, _updateDynamicElements, watchWebSocket
    // Always assigned unconditionally in the constructor above, for every
    // HABase instance - assertDefined throws instead of masking a broken
    // invariant the way a non-null assertion (!) would.
    assertDefined(this._actionHelper, 'HABase.connectedCallback: _actionHelper not assigned').init(
      this._cardView.config,
      this.hasDisabledIconTap,
    );
    // render() also runs from setConfig, before HA inserts the card - and the
    // status pill's color goes through getComputedStyle, which reads nothing
    // on a detached element, leaving the pill on its grey CSS fallback.
    // Repainted here, now that there is a document to measure against. Only
    // this layer needs it: the rest is pure CSS or driven by a later push.
    this._applyAlertClasses();
  }

  // custom-card-helpers' own LovelaceCard interface types this as
  // `number | Promise<number>` - async here aligns with that contract (and,
  // as with getStubConfig, turns any future throw into a rejected promise
  // instead of a synchronous exception during HA's own layout pass over
  // every card on a dashboard).
  // Badge/Feature are sized by HA itself (--ha-badge-size, --feature-height) -
  // the three sizing hooks below only apply to the two full-card types.
  get #isSizeableCard(): boolean {
    return [META.types.card.typeName, META.types.template.typeName].includes(this.baseClass);
  }

  // skipcq: JS-0116 -- async is intentional, no await by design.
  async getCardSize(): Promise<number | undefined> {
    if (!this.#isSizeableCard) return undefined;
    const cardSize = this._cardView.cardSize;
    this._log?.debug('getCardSize: ', cardSize);
    return cardSize;
  }

  // Kept for HA < 2024.11 (hui-card.ts falls back to this, migrated through
  // migrateLayoutToGridOptions, when getGridOptions isn't implemented -
  // mirrors how lovelace-mushroom's MushroomBaseCard keeps both).
  getLayoutOptions() {
    if (!this.#isSizeableCard) return undefined;
    const cardLayoutOptions = this._cardView.cardLayoutOptions;
    this._log?.debug('getLayoutOptions: ', cardLayoutOptions);
    return cardLayoutOptions;
  }

  // Current HA API (2024.11+): same numbers as getLayoutOptions, expressed on
  // the 12-column grid instead of the older 4-column one - see
  // CARD.layout.gridColumnMultiplier.
  getGridOptions() {
    if (!this.#isSizeableCard) return undefined;
    const gridOptions = gridOptionsOf(this._cardView);
    this._log?.debug('getGridOptions: ', gridOptions);
    return gridOptions;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh() {
    this._cardView.refresh(this.hass as HomeAssistant);
    if (this._manageErrorMessage()) return;
    this._updateDynamicElements();
  }

  reset() {
    super.reset(); // #isRendered, _dom.destroy(), shadowRoot.innerHTML
    this.#iconManager.reset();
    this.#statusLabel.forgetPaint();
  }

  // ─── ERROR MESSAGE MANAGEMENT ─────────────────────────────────────────────

  _manageErrorMessage(): boolean {
    const cardView = this._cardView.entityView;
    if (
      cardView?.msg &&
      (is.nullish(this._cardView.entity) || (cardView.isAvailable && !cardView.hasValidatedConfig))
    ) {
      this._renderMessage(cardView.msg);
      return true;
    }
    this.#lastMessage = null;
    return false;
  }

  // msg.sev is one of 'info'/'warning'/'error', ha-alert's own alert-type
  // values.
  _renderMessage(msg: { content: string; sev: string }) {
    if (msg === this.#lastMessage) return;
    this.#lastMessage = msg;

    let alert = this._shadow.querySelector('ha-alert');

    if (!alert) {
      alert = document.createElement('ha-alert');
      this._shadow.replaceChildren(alert);
    }

    // ha-alert reads this as an attribute, not a property - keep setAttribute.
    alert.setAttribute('alert-type', msg.sev);
    alert.textContent = msg.content;
  }

  // ─── CARD BUILDING ────────────────────────────────────────────────────────

  get _structureOptions(): StructureOptions {
    return {
      ...super._structureOptions,
      layout: this._cardView.config.layout,
      barSingleLine: this._cardView.config.bar_single_line,
      trendIndicator: Boolean(this._cardView.config.trend_indicator),
      // A jinja push can return highlight: 'label' even off static config.
      hasLabel:
        is.nonEmptyString(statusLabelObj(this._cardView.config.status_label).jinja) ||
        this._cardView.config.alert_when?.highlight === 'label' ||
        this._cardView.hasJinjaAlertWhen,
      multiline: Boolean(this._cardView.config.multiline),
      hideIcon: this._cardView.isStaticallyHidden(CARD.style.dynamic.hiddenComponent.icon.label),
      hideName: this._cardView.isStaticallyHidden(CARD.style.dynamic.hiddenComponent.name.label),
      singleLine: this._cardView.config.density === 'single_line',
      hideSecondaryInfo: this._cardView.isStaticallyHidden(CARD.style.dynamic.hiddenComponent.secondary_info.label),
    };
  }

  _buildStyle() {
    super._buildStyle(); // base classes, watermark and peak marks, bar effect
    this._addBaseParameter();
    this._applyConditionalClasses();
    this._handleHiddenComponents();
  }

  get _baseClassStyle(): Map<string, boolean> {
    const config = this._cardView.config;
    return new Map([
      ...super._baseClassStyle,
      ['progress-badge', this._isBadge],
      ...BAR_POSITIONS.map((position): [string, boolean] => [
        position === BAR_AROUND_ICON ? CARD.style.dynamic.barAroundIcon : position,
        config.bar_position === position,
      ]),
      ['row-reverse', this._cardView.hasReversedSecondaryInfoRow],
      // A pinned bar makes the text the flexible half - the CSS can't branch
      // on a variable being set, so the config says it here.
      ['bar-max-width', Boolean(config.bar_max_width)],
      ['text-shadow', Boolean(config.text_shadow)],
      ['label-left', statusLabelObj(config.status_label).position === 'left'],
    ]);
  }

  _addBaseParameter() {
    const cardKey = CARD.htmlStructure.card.element;
    const config = this._cardView.config;

    // On a badge, `min_width: N%` is redefined as N% of the default badge
    // width (var(--ha-badge-size, 130px)), not the CSS % (% of the parent,
    // which overflows past 100% - see issue #124). Cards/templates keep the
    // standard CSS %, and any non-% value passes through unchanged.
    const isBadge = this._isBadge;
    const minWidth =
      isBadge && is.string(config.min_width) && /^\s*-?[\d.]+%\s*$/.test(config.min_width)
        ? `calc(${parseFloat(config.min_width) / 100} * var(--ha-badge-size, 130px))`
        : config.min_width;

    (
      [
        [this._cardView.hasReversedSecondaryInfoRow, '--secondary-info-row-reverse', 'row-reverse'],
        [config.min_width, CARD.style.dynamic.card.minWidth.var, minWidth],
        [config.height, CARD.style.dynamic.card.height.var, config.height],
        [config.bar_max_width, CARD.style.dynamic.progressBar.maxWidth.var, config.bar_max_width],
        [config.alert_when?.color, '--alert-color', ThemeManager.adaptColor(config.alert_when?.color ?? null)],
        // issue #133 - badges have their own height model (--ha-badge-size),
        // card/template-only. Just the row count - the actual row-height
        // math lives in CSS (styles.ts's --current-card-height reads this
        // same var), set unconditionally so it can't go stale without a full
        // re-render. See ViewCore.minGridRows, the source of truth this and
        // getGridOptions both read.
        [!isBadge, '--min-grid-rows', this._cardView.minGridRows],
      ] as [unknown, string, CacheValue][]
    ).forEach(([condition, prop, value]) => {
      if (condition) this._dom.setStyle(cardKey, prop, value);
    });
    this.#applyRingGeometry(cardKey);
  }

  // bar_ring: the arc left after the gap, as a ratio of the circle (styles.ts);
  // an unset ring removes its vars. Under center_zero, `start` places the zero.
  #applyRingGeometry(cardKey: string) {
    const { start = 0, gap = 0 } = this._cardView.config.bar_ring ?? {};
    const openArc = Math.min(Math.max(gap, 0), RING_MAX_GAP);
    const arcStart = this._cardView.config.center_zero ? start - (360 - openArc) / 2 : start;
    const vars: [string, CacheValue, boolean][] = [
      ['--ring-start', `${arcStart}deg`, arcStart !== 0],
      ['--ring-axis', `${start}deg`, start !== 0],
      ['--ring-span-ratio', 1 - openArc / 360, openArc > 0],
    ];
    vars.forEach(([prop, value, isSet]) => {
      if (isSet) this._dom.setStyle(cardKey, prop, value);
      else this._dom.removeStyle(cardKey, prop);
    });
  }

  // Static-ish: clickable/frameless/marginless/multiline only depend on
  // config, never on Jinja-pushed or fast-changing entity state - split out
  // from icon animation/alert below so a caller that only needs to
  // re-evaluate one of those two doesn't also re-walk this bucket for
  // nothing (see _applyIconAnimationClasses/_applyAlertClasses).
  get _staticStyle(): Map<string, boolean> {
    return new Map([
      [CARD.style.dynamic.clickable.card, this._cardView.hasClickableCard],
      [CARD.style.dynamic.clickable.icon, this._cardView.hasClickableIcon && !this.hasDisabledIconTap],
      [CARD.style.dynamic.frameless, this._cardView.config.frameless ?? false],
      [CARD.style.dynamic.marginless, this._cardView.config.marginless ?? false],
      // One card-level flag every ancestor needing to relax its single-line
      // assumptions reads via a plain descendant selector - not :has()
      // re-derived at each level, which only fixed one ancestor at a time.
      ['info-multiline', Boolean(this._cardView.config.multiline)],
    ]);
  }

  get _iconAnimationStyle(): Map<string, boolean> {
    const effect = this._cardView.iconAnimationEffect;
    // icon_animation: { effect, jinja } mode - once pushed, the resolved
    // boolean fully replaces automatic entity-based detection. Fix:
    // `iconAnimationActive === null` used to mean both "not in jinja
    // mode" and "no push yet", falling back to autoDetect either way.
    // hasJinjaIconAnimation checks the *config*, not the cache, so jinja
    // mode disengages autoDetect immediately, default false until the push.
    const override = this._cardView.jinjaState.iconAnimationActive;
    const active = (autoDetect: () => boolean): boolean =>
      this._cardView.hasJinjaIconAnimation ? (override ?? false) : autoDetect();
    return new Map<string, boolean>([
      // Derived from the schema's own list rather than restated: an animation
      // added there and forgotten here used to be accepted by the config and
      // then never paint its class.
      ...ICON_ANIMATIONS.filter((name) => !OWN_TRIGGER_ANIMATIONS.includes(name)).map((name): [string, boolean] => [
        `icon-anim-${name}`,
        effect === name && active(() => this._cardView.isEntityActive),
      ]),
      [
        // Not isEntityActive alone: appliance integrations (Home Connect,
        // Miele) report the running program as a plain `sensor`, which
        // isEntityActive's domain gate excludes on purpose - see
        // ViewCore.isWashingMachineActive.
        'icon-anim-washing-machine',
        effect === 'washing_machine' && active(() => this._cardView.isWashingMachineActive),
      ],
      [
        // Not isEntityActive: charging isn't a domain/state pair, it's an
        // attribute (see ViewCore.isBatteryCharging) — its own trigger.
        'icon-anim-battery-charging',
        effect === 'battery_charging' && active(() => this._cardView.isBatteryCharging),
      ],
      [
        // See ViewCore.isBatteryIconShifted: compensates the fill wipe for
        // charging/bluetooth battery icon variants, without changing the icon.
        'icon-anim-battery-charging-shifted',
        effect === 'battery_charging' &&
          active(() => this._cardView.isBatteryCharging) &&
          this._cardView.isBatteryIconShifted,
      ],
    ]);
  }

  _applyStaticClasses() {
    this._toggleClasses(this._staticStyle);
  }

  _applyIconAnimationClasses() {
    this._toggleClasses(this._iconAnimationStyle);
  }

  _applyAlertClasses() {
    this.#alert.apply();
  }

  // Bridgehead used by a full render/refresh - re-applies all three layers.
  // A caller that knows only one layer can have changed (e.g. a Jinja push
  // touching only alert_when) should call that layer's own _apply*Classes
  // method directly instead (see EntityProgressCardBase._renderJinjaNumber).
  _applyConditionalClasses() {
    this._applyStaticClasses();
    this._applyIconAnimationClasses();
    this._applyAlertClasses();
  }

  get hiddenComponents(): { label: string; class?: string }[] {
    return (this.constructor as typeof HABase)._hiddenComponents;
  }

  _handleHiddenComponents(jinjaContent: unknown = null) {
    if (jinjaContent === null && is.jinja(this._cardView.config.hide)) return;

    // Kept in the view's state so every hasComponentHiddenFlag() consumer
    // sees the Jinja-resolved truth, not config.hide's static shape only.
    if (jinjaContent !== null) this._cardView.jinjaState.setResolvedHide(jinjaContent);

    this.hiddenComponents.forEach((component) => {
      this._dom.toggleClass(
        CARD.htmlStructure.card.element,
        component.class,
        this._cardView.hasComponentHiddenFlag(component.label),
      );
    });
  }

  // ─── DYNAMIC ELEMENTS UPDATE ──────────────────────────────────────────────

  _updateDynamicElements() {
    this._showIcon();
    this._showBadge();
    this._manageShape();
    this._updateTrend();
    this._updateCSS();
    this._repaintStatusLabel();
    // Re-applied on every refresh (not only at render): some conditions are
    // state-driven (icon_animation active state, entity error), and toggleClass
    // is value-cached so unchanged classes cost nothing.
    this._applyConditionalClasses();
    this._jinjaSubscriptions.process();
    this._processStandardFields();
  }

  // ─── Update Trend ─────────────────────────────────────────────────────────
  // The tick moves a running timer with no new state: what reads the value
  // follows the bar. Every write below is value-cached.
  _onAutoRefreshTick() {
    super._onAutoRefreshTick();
    this._applyAlertClasses();
    this._repaintStatusLabel();
    const bar = this._cardView.entityView;
    if (bar && this._cardView.config.trend_indicator) this._applyTrendVisuals(bar.trendNow());
  }

  _updateTrend() {
    const bar = this._cardView.entityView;
    if (!bar || !this._cardView.config.trend_indicator) return;

    this._applyTrendVisuals(bar.getTrend());
  }

  // Shared with TemplateBase's own _updateTrend (template-base.ts).
  _applyTrendVisuals(direction: string) {
    this._dom.setAttribute(
      CARD.htmlStructure.elements.trendIndicator.icon.class,
      CARD.style.icon.badge.default.attribute,
      TREND_ICONS[direction] ?? TREND_ICONS.error,
    );

    const cardKey = CARD.htmlStructure.card.element;
    const varName = CARD.style.dynamic.trendIndicator.color.var;
    const config = this._cardView.config.trend_indicator;
    const resolved =
      is.plainObject(config) && (direction === 'up' || direction === 'down' || direction === 'flat')
        ? ((config[`${direction}_color`] as string | undefined) ?? (config.colored ? this._cardView.iconColor : null))
        : null;
    this._dom.setOrRemoveStyle(cardKey, varName, resolved);
  }

  // ─── ICON MANAGEMENT ──────────────────────────────────────────────────────

  _showIcon() {
    if (!this._cardView) return;

    const { entity: entityId, icon: curIcon } = this._cardView;
    const stateObj = this._hassProvider.getEntityStateObj(entityId as string);
    const hasIconOverride = is.nonEmptyString(curIcon);
    const srcPicture = this._hassProvider.getEntityProp(entityId as string, HA_CONTEXT.attributes.entityPicture);
    const hasPicture = is.nonEmptyString(srcPicture);

    const iconContainer = this._dom.get(CARD.htmlStructure.elements.icon.class);
    // Absent by design under a static hide: [icon] - the subtree is never
    // built (see StructureOptions.hideIcon), so this is a no-op, not a fault.
    if (!iconContainer) return;

    if (hasPicture && !hasIconOverride) {
      this.#iconManager.showPicture(stateObj, srcPicture);
      return;
    }

    const stateObjIcon = this.#iconManager.stateObjFor(stateObj, curIcon, hasIconOverride, hasPicture);
    if (stateObjIcon) this.#iconManager.showState(iconContainer, stateObjIcon);
  }

  // ─── SHAPE MANAGEMENT ─────────────────────────────────────────────────────

  _manageShape() {
    this._dom.toggleClass(
      CARD.htmlStructure.card.element,
      CARD.style.dynamic.backgroundShape,
      this._cardView.hasBackgroundOnlyShape,
    );
    this._dom.toggleClass(
      CARD.htmlStructure.card.element,
      CARD.style.dynamic.hiddenComponent.shape.class,
      !this._cardView.hasVisibleShape ||
        this.hasDisabledIconTap ||
        this._cardView.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.shape.label),
    );
  }

  // ─── BADGE MANAGEMENT ─────────────────────────────────────────────────────

  // A Badge has no inner badge of its own: subclasses opt out here, and
  // schema.ts drops badge_icon/badge_color for them too.
  static _hasInnerBadge = true;

  get hasDisabledBadge(): boolean {
    return !(this.constructor as typeof HABase)._hasInnerBadge;
  }

  _showBadge() {
    if (this.hasDisabledBadge) return;
    this.#badgeIcon.show(this._cardView.entityView?.badgeInfo);
  }

  _renderBadgeIcon(content: unknown) {
    this._log?.debug('📎 HABase._renderBadgeIcon():', { content });
    this.#badgeIcon.receiveIcon(content, this._cardView.entityView?.badgeInfo);
  }

  _renderBadgeColor(content: unknown) {
    this._log?.debug('📎 HABase._renderBadgeColor():', { content });
    this.#badgeIcon.receiveColor(content, this._cardView.entityView?.badgeInfo);
  }

  // ─── STD FIELDS PROCESSING ────────────────────────────────────────────────
  static _getStandardFields(_cardView?: ViewCore): { className: string; value: string | null }[] {
    return [];
  }

  // `immediate` (the tick's): setTextNow, not the RAF-batched setText - a frame
  // would land a countdown's text up to ~16ms off the deadline it was due at.
  _processStandardFields(immediate = false) {
    (this.constructor as typeof HABase)._getStandardFields(this._cardView).forEach(({ className, value }) => {
      if (immediate) this._dom.setTextNow(className, value);
      else this._dom.setText(className, value);

      // secondaryInfoMain going empty means the row has nothing left to
      // show - the same "give the space back" rule hide: secondary_info
      // already gets (.hide-secondary-info in styles.ts), driven by actual
      // content instead of config. Inline on ha-card since this can flip on
      // any refresh, not just once at config time.
      if (className === CARD.htmlStructure.elements.secondaryInfoMain.class) {
        const cardKey = CARD.htmlStructure.card.element;
        if (value === '') this._dom.setStyle(cardKey, '--detail-height', '0px');
        else this._dom.removeStyle(cardKey, '--detail-height');

        this._secondaryInfoEmpty.main = value === '';
        this._updateSecondaryInfoWrapperVisibility();
      }
    });
  }

  // Tracks whether custom_info/secondary's line(s) and the main value line
  // are each currently empty - replaces a :has()-based CSS rule that was
  // past this card's browser floor (:has() needs Firefox 121+, floor is
  // 94+). main defaults to false: Template has no secondary-info-main slot,
  // so it's never touched there, keeping the wrapper from ever
  // auto-collapsing on Template (same as the old :has(main:empty)).
  _secondaryInfoEmpty = { extra1: true, extra2: true, main: false };

  _updateSecondaryInfoWrapperVisibility() {
    const { extra1, extra2, main } = this._secondaryInfoEmpty;
    const multiline = Boolean(this._cardView.config?.multiline);
    const empty = extra1 && main && (!multiline || extra2);
    this._dom.toggleClass(CARD.htmlStructure.card.element, 'secondary-info-blank', empty);
  }

  // ─── JINJA TEMPLATE RENDERING ─────────────────────────────────────────────

  _baseJinjaHandlers(content: unknown): Record<string, () => void> {
    return {
      bar_effect: () => this._refreshBarEffect(content),
      // _handleHiddenComponents only toggles CSS classes - value/unit have
      // no class of their own (a text-level omission), so a changed Jinja
      // result needs _processStandardFields() too to re-render the text.
      hide: () => {
        this._handleHiddenComponents(content);
        this._processStandardFields();
      },
      icon_animation: () => this._renderIconAnimationWhen(content),
      'status_label.jinja': () => this._renderLabel(content),
      'alert_when.jinja': () => this.#alert.receiveJinja(content),
    };
  }

  // Shared by EntityProgressCardBase/EntityProgressTemplateBase's own
  // _getJinjaHandlers.
  _badgeJinjaHandlers(content: unknown): Record<string, () => void> {
    if (this.hasDisabledBadge) return {};
    return {
      badge_icon: () => this._renderBadgeIcon(content),
      badge_color: () => this._renderBadgeColor(content),
    };
  }

  // Shared by EntityProgressCardBase/EntityProgressTemplateBase's own
  // _getJinjaHandlers below.
  _watermarkJinjaHandlers(content: unknown): Record<string, () => void> {
    return Marks.jinjaHandlers((getJinja, viewProp) =>
      this._applyJinjaNumber(content, getJinja, viewProp, () => this._updateCSS()),
    );
  }

  // Every Jinja-pushed number shares this guard/parse/skip-if-unchanged -
  // only `repaint` differs per option.
  _applyJinjaNumber(
    content: unknown,
    getJinja: (c: Config) => string | undefined,
    viewProp: JinjaNumberProp,
    repaint: () => void,
  ) {
    applyJinjaNumber(this._cardView, content, getJinja, viewProp, repaint);
  }

  _onJinjaFailure(key: string, message: string) {
    if (!Object.values(JINJA_NUMBER_KEY).includes(key)) {
      super._onJinjaFailure(key, message);
      return;
    }
    this._cardView.jinjaState.setFailure(key, message);
    if (key.startsWith('alert_when')) this._applyAlertClasses();
    else if (key.startsWith('watermark')) this._updateCSS();
    else {
      this._cardView.refresh(this.hass as HomeAssistant);
      this._updateCSS();
      this._processStandardFields();
    }
  }

  _renderLabel(content: unknown) {
    this._log?.debug('📎 HACore._renderLabel():', { content });
    this.#statusLabel.render(content);
  }

  // Also run on every refresh and template color push: status_label may never
  // push again once percent settles.
  _repaintStatusLabel() {
    this.#statusLabel.repaint();
  }

  _renderIconAnimationWhen(content: unknown) {
    this._log?.debug('📎 HACore._renderIconAnimationWhen():', { content });
    // Defensive: only apply while icon_animation is still in { effect, jinja }
    // mode - guards against a push arriving right as the user switches modes
    // (mirrors EntityProgressCardBase._renderJinjaNumber).
    if (!this._cardView.hasJinjaIconAnimation) return;
    this._cardView.jinjaState.setIconAnimationActive(content);
    // Every other Jinja setter re-applies its own changed layer - this one
    // didn't, so the value only took effect once something else re-ran
    // _applyIconAnimationClasses. Template has no incidental refresh to
    // piggyback on, so the animation never started there (issue #125).
    this._applyIconAnimationClasses();
  }

  // Shared by _renderCustomInfo/_renderSecondary: same split, same emptiness
  // bookkeeping, only the per-line formatting differs (Card/Badge precedes a
  // main slot, Template has none). Emptiness is judged on the raw lines, never
  // on the formatted HTML - a spacer would make extra-1 look non-empty forever.
  _renderSecondaryLines(content: unknown, format: (line: string, isSecond: boolean) => string) {
    const multiline = Boolean(this._cardView.config.multiline);
    const [line1, line2] = splitAtFirstBreak(content, multiline);
    const elements = CARD.htmlStructure.elements;
    this._dom.setHTML(elements.secondaryInfoExtra.class, format(line1, false));
    if (multiline) this._dom.setHTML(elements.secondaryInfoExtra2.class, format(line2 ?? '', true));
    this._secondaryInfoEmpty.extra1 = line1.trim() === '';
    this._secondaryInfoEmpty.extra2 = (line2 ?? '').trim() === '';
    this._updateSecondaryInfoWrapperVisibility();
  }

  // ─── getStubConfig -> select entity ───────────────────────────────────────
  // Extra keys a concrete card wants in its own stub, on top of type/entity.
  static _stubExtras: Record<string, unknown> = {};

  // async (like most cards' getStubConfig, e.g. Mushroom's) so a thrown error
  // becomes a rejected promise instead of a synchronous exception that could
  // abort whatever loop HA's card-picker uses to build previews for every
  // registered card type, not just this one.
  // skipcq: JS-0116 -- async is intentional, no await by design.
  static async getStubConfig(hass: HomeAssistant): Promise<LovelaceConfig> {
    return {
      type: `custom:${suffixedName(this._baseClass)}`,
      entity: HABase.getStubEntity(hass),
      ...this._stubExtras,
    } as unknown as LovelaceConfig;
  }

  // Called directly by HA's own card-picker/gallery to build the preview for
  // this card type - an external caller we don't control, unlike our normal
  // render path where hass is already known to be populated by the time
  // anything reads it. hass?.states isn't optional in the HomeAssistant type,
  // but that's a compile-time annotation, not a runtime guarantee from a
  // caller outside this codebase.
  static getStubEntity(hass: HomeAssistant): string {
    return (
      Object.keys(hass?.states ?? {}).find((id) => /^(sensor\..*battery|fan\.|cover\.|light\.)/i.test(id)) ||
      'sensor.temperature'
    );
  }
}

export { HABase };
