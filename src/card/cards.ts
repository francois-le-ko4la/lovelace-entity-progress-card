/*
 * The concrete custom elements: EntityProgressCard, EntityProgressBadge,
 * EntityProgressFeatures, and their Template variants - each just wires a
 * config helper + view + structure together on top of core.js.
 */

import { META, devName, HA_CONTEXT, CARD } from '../utils/parameters.js';
import { is, toNumberOrNull } from '../utils/common-checks.js';
import { ThemeManager } from './value-helpers.js';
import {
  CardView,
  BadgeView,
  FeatureView,
  CardTemplateView,
  BadgeTemplateView,
  type ViewBase,
  type TemplateView,
} from './view.js';
import { DOMHelper } from './dom-helpers.js';
import { HACore, HABase } from './core.js';
import type { DivergingGradients } from './core.js';
import type { HomeAssistant } from '../utils/hass-provider.js';
import type { LovelaceConfig, Config } from '../utils/types.js';
import { jinjaOf } from './schema.js';

/**
 * Represents the base class for all standard cards:
 *  - EntityProgressCardBase / "entity-progress-card"
 *  - EntityProgressBadge / "entity-progress-badge"
 *
 * @extends HABase
 */
class EntityProgressCardBase extends HABase {
  // Narrows HABase's own ViewCore back to ViewBase: every concrete subclass
  // of this class (EntityProgressCard/EntityProgressBadge) always assigns a
  // CardView/BadgeView, never one of the template-only views - unlike HABase
  // itself, which EntityProgressTemplateBase also extends. `declare`: both
  // subclasses assign their own real view.
  declare _cardView: ViewBase;
  static _hiddenComponents: { label: string; class?: string }[] = [
    ...super._hiddenComponents,
    CARD.style.dynamic.hiddenComponent.value,
  ];

  // async (like most cards' getStubConfig, e.g. Mushroom's) so a thrown
  // error becomes a rejected promise instead of a synchronous exception
  // that could abort whatever loop HA's card-picker uses to build previews
  // for every registered card type, not just this one.
  // skipcq: JS-0116 -- async is intentional, no await by design.
  static async getStubConfig(hass: HomeAssistant): Promise<LovelaceConfig> {
    return {
      type: `custom:${devName(this._baseClass)}`,
      entity: HABase.getStubEntity(hass),
    } as unknown as LovelaceConfig;
  }

  static get _loggedMethods() {
    return [...super._loggedMethods, '_getStandardFields', '_renderCustomInfo', '_renderNameInfo'];
  }

  _handleHassUpdate() {
    this.refresh();
    this._manageAutoRefresh();
    this._seedTrendHistoryOnce();
    this._seedPeakMarkerHistoryOnce();
  }

  // trend_indicator.window seeds from HA's own history - Card/Template only
  // (peak_marker's own seeding lives on HACore, see its own comment there).
  #trendSeedSignature: string | null = null;

  _seedTrendHistoryOnce() {
    const config = this._cardView.config.trend_indicator;
    const signature = this._seedSignature(is.plainObject(config) ? config.window : undefined);
    if (signature === null || signature === this.#trendSeedSignature) return;
    this.#trendSeedSignature = signature;
    this._seedTrendHistory().catch(() => {
      // best-effort: live sampling alone still works from here
    });
  }

  async _seedTrendHistory() {
    const config = this._cardView.config.trend_indicator;
    if (!is.plainObject(config) || !is.number(config.window)) return;
    const signature = this._seedSignature(config.window);

    const points = await this._fetchHistory(config.window);
    // A newer entity/config swap may have started its own seed while this
    // fetch was in flight - only the still-current signature applies.
    if (!points.length || signature !== this.#trendSeedSignature) return;
    this._cardView.seedTrend(points.map((p) => ({ t: p.t, percent: this._cardView.percentForRawValue(p.value) })));
  }

  // Adds the value text on top of HACore's default tick (refresh + bar CSS,
  // shared with EntityProgressFeatures) - Card/Badge also shows a text value
  // Features don't have. immediate: see _processStandardFields's own
  // comment - the countdown text is a discrete jump each tick, and RAF's
  // frame timing isn't aligned to our wall-clock-second scheduling.
  _onAutoRefreshTick() {
    super._onAutoRefreshTick();
    this._processStandardFields(true);
  }

  // ─── CSS - CUSTOMIZATION ──────────────────────────────────────────────────
  // secondaryInfoError depends on the entity's own state
  // (hasStandardEntityError), not on icon_animation or alert_when - same
  // "static-ish, not Jinja-driven"
  // bucket as HABase's own _staticStyle entries, so it's folded into that
  // layer rather than a new one of its own.
  get _staticStyle(): Map<string, boolean> {
    return new Map([
      ...super._staticStyle,
      [CARD.style.dynamic.secondaryInfoError, this._cardView.hasStandardEntityError],
    ]);
  }

  // ─── STD FIELDS PROCESSING - CUSTOMIZATION ────────────────────────────────
  static _getStandardFields(cardView: ViewBase): { className: string; value: string | null }[] {
    return [
      {
        className: CARD.htmlStructure.elements.nameMain.class,
        value: cardView.name,
      },
      {
        className: CARD.htmlStructure.elements.secondaryInfoMain.class,
        value: cardView.secondaryInfoMain,
      },
    ];
  }

  // ─── JINJA TEMPLATE RENDERING - CUSTOMIZATION ─────────────────────────────
  // _renderJinjaNumber below is Card-only - absent from the template schema.
  _getJinjaHandlers(content: unknown): Record<string, () => void> {
    return {
      ...this._baseJinjaHandlers(content),
      badge_icon: () => this._renderBadgeIcon(content),
      badge_color: () => this._renderBadgeColor(content),
      custom_info: () => this._renderCustomInfo(content),
      name_info: () => this._renderNameInfo(content),
      min_value: () => this._renderJinjaNumber(content, (c: Config) => jinjaOf(c.min_value), 'jinjaMinValue'),
      max_value: () => this._renderJinjaNumber(content, (c: Config) => jinjaOf(c.max_value), 'jinjaMaxValue'),
      ...this._watermarkJinjaHandlers(content),
      'alert_when.above': () =>
        this._renderJinjaNumber(content, (c: Config) => jinjaOf(c.alert_when?.above), 'jinjaAlertAbove'),
      'alert_when.below': () =>
        this._renderJinjaNumber(content, (c: Config) => jinjaOf(c.alert_when?.below), 'jinjaAlertBelow'),
    };
  }

  // Repaints only what this field affects: a full refresh() re-ran the whole
  // Jinja scan on every push - one per keystroke - and froze the editor.
  _renderJinjaNumber(
    content: unknown,
    getJinja: (c: Config) => string | undefined,
    viewProp: 'jinjaMinValue' | 'jinjaMaxValue' | 'jinjaAlertAbove' | 'jinjaAlertBelow',
  ) {
    this._applyJinjaNumber(content, getJinja, viewProp, () => {
      if (viewProp === 'jinjaMinValue' || viewProp === 'jinjaMaxValue') {
        // min/max feed #percentHelper (via refresh) - both the bar's own CSS
        // and secondaryInfoMain (the "45%" label) derive from it.
        this._cardView.refresh(this.hass as HomeAssistant);
        this._updateCSS();
        this._processStandardFields();
      } else {
        // isAlertActive only feeds _alertStyle - no #percentHelper, bar CSS or
        // label involvement, and no need to re-walk the other class layers.
        this._applyAlertClasses();
      }
    });
  }

  // Line 1 only gets the &nbsp; spacer in single-line mode, where it precedes
  // the main span on the same line; line 2 always carries main here (card/badge
  // has that slot), unlike Template's own _renderSecondary.
  _renderCustomInfo(content: unknown) {
    const multiline = Boolean(this._cardView.config.multiline);
    this._renderSecondaryLines(content, (line, isSecond) => (isSecond || !multiline ? `${line}&nbsp;` : line));
  }

  _renderNameInfo(content: unknown) {
    this._dom.setHTML(CARD.htmlStructure.elements.nameExtra.class, `&nbsp;${content}`);
  }
}

/**
 * HA CARD "entity-progress-card"
 *
 * @extends EntityProgressCardBase
 */
class EntityProgressCard extends EntityProgressCardBase {
  _cardView = new CardView();
  static _baseClass: string = META.types.card.typeName;

  // ─── STATIC METHODS ───────────────────────────────────────────────────────

  static get _loggedMethods() {
    return [...super._loggedMethods, 'getCardSize', 'getLayoutOptions', 'getGridOptions'];
  }
}

/**
 * HA CARD "entity-progress-badge"
 *
 * @extends EntityProgressCardBase
 */
class EntityProgressBadge extends EntityProgressCardBase {
  _cardView = new BadgeView();
  static _baseClass: string = META.types.badge.typeName;
  static _structureType = 'badge';

  // ─── JINJA TEMPLATE RENDERING - CUSTOMIZATION ─────────────────────────────
  // Derived from the Card map (minus the badge-only handlers) instead of
  // hand-mirroring it: an earlier hand-maintained copy silently missed
  // min_value for months (CF5, medium), so any handler added on the base class
  // is now picked up here automatically by construction.
  _getJinjaHandlers(content: unknown): Record<string, () => void> {
    return HABase._stripBadgeHandlers(super._getJinjaHandlers(content));
  }
}

/**
 * HA CARD "entity-progress-feature"
 *
 * @extends HACore
 */

class EntityProgressFeatures extends HACore {
  // Narrows HACore's own ViewCore back to ViewBase - this class always uses
  // FeatureView, never one of the template-only views (see
  // EntityProgressCardBase's own _cardView for the same reasoning).
  _cardView: ViewBase = new FeatureView();
  static _baseClass: string = META.types.feature.typeName;
  static _cardElement = 'div';

  // ─── STATIC ───────────────────────────────────────────────────────────────

  // See EntityProgressCardBase.getStubConfig for why this is async.
  // skipcq: JS-0116 -- async is intentional, no await by design.
  static async getStubConfig(): Promise<LovelaceConfig> {
    return { type: `custom:${devName(META.types.feature.typeName)}` } as unknown as LovelaceConfig;
  }

  // ─── ENTITY CONTEXT (Tile → Feature) ───────────────────────────────────────
  #rawConfig: LovelaceConfig | null = null;
  #contextEntityId: string | undefined;
  #context: { entity_id?: string } | undefined;

  get context(): { entity_id?: string } | undefined {
    return this.#context;
  }

  // HA sets this from the parent Tile card's own entity, always after
  // setConfig (LovelaceCardFeatureContext.entity_id); config.entity overrides
  // it. Merges into _cardView.config directly, skipping setConfig's own
  // reset()/render() - the DOM built for "no entity yet" is still valid.
  set context(context: { entity_id?: string } | undefined) {
    this.#context = context;
    const entityId = context?.entity_id;
    if (entityId === this.#contextEntityId) return;
    this.#contextEntityId = entityId;
    if (!this.#rawConfig || this.#rawConfig.entity) return;
    const merged = { ...this.#rawConfig, entity: entityId };
    this._cardView.config = merged;
    this._registerWatchedEntities(merged);
    if (this.hass) this._handleHassUpdate();
  }

  setConfig(config: LovelaceConfig) {
    this.#rawConfig = config;
    super.setConfig(config.entity ? config : { ...config, entity: this.#contextEntityId });
  }

  /**
   * Fixes the parent card layout when the feature is used as an overlay.
   *
   * By default, HA increases the card's --row-size by 1 for each feature added,
   * which would make the card taller. This method counteracts that behavior by
   * piercing through multiple Shadow DOM boundaries to directly manipulate the
   * parent card's layout properties.
   *
   * The following adjustments are made: - `.container` and `hui-card-features`
   * are set to `position: static` so the feature can be positioned absolutely
   * relative to `ha-card` - `ha-card` gets `overflow: hidden` to clip the
   * feature to the card's border radius - `--row-size` is decremented by 1 to
   * cancel the extra row reserved by HA
   *
   * A MutationObserver watches for HA re-applying `--row-size`: HA's own
   * `hui-grid-section` recomputes and re-applies it (via a reactive style
   * binding) on every relevant re-render of the tile card, not just once -
   * for instance when a sibling feature's own space requirement legitimately
   * changes (e.g. a native feature's control appearing/disappearing based on
   * entity state, the same way lovelace-mushroom's own getGridOptions()
   * varies with `active`). `--row-size` therefore isn't a constant to offset
   * once and freeze - `targetRowSize` is recomputed from HA's current
   * natural value every time the observer fires. The observer is disconnected
   * for the duration of our own write (and reconnected right after) so it
   * only ever reacts to HA's mutations, never an echo of our own - comparing
   * against a remembered "last value we applied" instead would misfire the
   * moment HA's new natural size happens to numerically match a past one
   * (e.g. growing then shrinking back by exactly 1 row).
   *
   * CF5 - issue (major) resolved - the offset used to be computed once, from
   * the first-seen --row-size, and reapplied forever after regardless of
   * what HA did later. That silently clamped any later legitimate growth in
   * HA's natural row-size back down to the stale first value, which could
   * starve a sibling feature (like a native fan-speed control) of the row
   * space it had actually grown into - reported as that feature disappearing
   * after navigating away and back.
   *
   * Executed once per connection: the observer is tracked by the
   * ResourceManager (disconnected on cleanup) and its presence serves as the
   * re-entry guard.
   *
   * @inspired by hass-progress-bar-feature (MIT License) — Copyright (c) ytilis
   * @see https://github.com/ytilis/hass-progress-bar-feature
   */
  #fixCardStyles() {
    if (!['top', 'bottom'].includes(this._cardView.config.bar_position ?? '')) return;
    // CF5 - issue (medium) resolved - the MutationObserver was never
    // disconnected: it kept observing the external card container after the
    // feature left the DOM (leak + callbacks on a dead element). It is now
    // tracked by the ResourceManager, and its presence replaces the #firstHack
    // guard so a reconnection re-installs it.
    if (!this._resourceManager || this._resourceManager.has('featureRowFix')) return;
    const resourceManager = this._resourceManager;
    const cardContainer = DOMHelper.walkUpThroughShadow(this, '.card');
    if (!cardContainer) return;

    this._dom.register('ext:card', DOMHelper.walkUpThroughShadow(this, 'ha-card') as HTMLElement);
    this._dom.register('ext:container', DOMHelper.walkUpThroughShadow(this, '.container') as HTMLElement);
    this._dom.register('ext:features', DOMHelper.walkUpThroughShadow(this, 'hui-card-features') as HTMLElement);
    this._dom.register('ext:card-container', cardContainer);

    const observerOptions = { attributes: true, attributeFilter: ['style'] };
    let observer: MutationObserver | null = null;
    const fix = () => {
      const rowSize = parseInt(getComputedStyle(cardContainer).getPropertyValue(HA_CONTEXT.styles.rowSize));
      if (!rowSize) return;
      const targetRowSize = rowSize - 1;
      // Disconnect first: these 4 writes must not be recorded as mutations
      // to react to, or the next observer callback would treat our own
      // corrected value as a new "natural" one and decrement it again.
      observer?.disconnect();
      this._dom.setStyleNow('ext:card', 'overflow', 'hidden');
      this._dom.setStyleNow('ext:container', 'position', 'static');
      this._dom.setStyleNow('ext:features', 'position', 'static');
      this._dom.setStyleNow('ext:card-container', HA_CONTEXT.styles.rowSize, targetRowSize);
      observer?.observe(cardContainer, observerOptions);
    };

    fix();
    const mutationObserver = new MutationObserver(fix);
    mutationObserver.observe(cardContainer, observerOptions);
    observer = mutationObserver;
    resourceManager.add(() => mutationObserver.disconnect(), 'featureRowFix');
  }

  // ─── HANDLE UPDATE ────────────────────────────────────────────────────────

  _handleHassUpdate() {
    this.#fixCardStyles();
    this.refresh();
    this._manageAutoRefresh();
    this._seedPeakMarkerHistoryOnce();
  }

  // ─── JINJA TEMPLATE RENDERING - CUSTOMIZATION ─────────────────────────────

  _getJinjaHandlers(content: unknown): Record<string, () => void> {
    return {
      bar_effect: () => this._refreshBarEffect(content), // base
    };
  }
}

/**
 * HABase subclass for Jinja-driven template cards. Unlike standard cards, all
 * display fields (name, secondary, icon, percent, badge, bar_effect) are
 * controlled via Jinja template subscriptions rather than entity state.
 *
 * Subclasses MAY override: - _structureType → which shape to render (e.g.
 * 'badge' for template badges) - _cardView → view instance (e.g.
 * BadgeTemplateView for template badges)
 *
 * @abstract
 * @extends HABase
 */
class EntityProgressTemplateBase extends HABase {
  static _structureType = 'template';
  // TemplateView (not the specific CardTemplateView) -
  // EntityProgressTemplateBadge below overrides this with its sibling
  // BadgeTemplateView, which wouldn't be assignable to CardTemplateView.
  _cardView: TemplateView = new CardTemplateView();

  static get _loggedMethods() {
    return [
      ...super._loggedMethods,
      '_updateWatermark',
      '_showIcon',
      '_renderName',
      '_renderSecondary',
      '_managePercent',
      '_updateTrend',
      '_renderPercentCSS',
      '_validateProcessJinjaFields',
    ];
  }

  connectedCallback() {
    super.connectedCallback(); // render, _updateDynamicElements, hass, watchWebSocket
    this._updateWatermark();
  }

  // percent drives the entire visual pipeline (icon/bar color, theme,
  // gradient), unlike every other Jinja field where "nothing to render" is a
  // valid end state - an empty/unset percent still needs something painted
  // (0%'s fallback). A literal `percent: ''` never gets subscribed to at all
  // (filtered out like any empty Jinja field), so nothing would ever call
  // _managePercent - this is the one synchronous fallback for that case,
  // re-checked on every setConfig so switching a live percent back to empty
  // recovers too.
  setConfig(config: LovelaceConfig) {
    super.setConfig(config);
    if (!is.nonEmptyString(this._cardView.config.percent)) this._managePercent('');
  }

  _handleHassUpdate() {
    this.refresh(); // refresh() → _cardView.refresh() → _showIcon() → _updateCSS()
    // Also compensates for HA's own render_template push, which for a
    // now()/utcnow() Jinja field (issue #127) only fires once a minute absent
    // a state change on config.entity - see _onAutoRefreshTick below.
    this._manageAutoRefresh();
  }

  // Overrides HACore's own (plain refresh()): a template's display is
  // entirely Jinja-push-driven, so the tick's only job is forcing a fresh
  // resubscription for every Jinja field - the persistent subscription won't
  // re-evaluate now()/utcnow() on its own between HA's once-a-minute pushes.
  // refresh() would recompute nothing this tick could have changed, so it's
  // skipped entirely, not just trimmed like EntityProgressCardBase's override.
  _onAutoRefreshTick() {
    const templates = this.validJinjaFields;
    for (const [key, template] of Object.entries(templates)) {
      if (is.nonEmptyString(template)) this._subscribeToTemplate(key, template, true);
    }
  }

  // See EntityProgressCardBase.getStubConfig for why this is async.
  // skipcq: JS-0116 -- async is intentional, no await by design.
  static async getStubConfig(hass: HomeAssistant): Promise<LovelaceConfig> {
    return {
      type: `custom:${devName(META.types.template.typeName)}`,
      entity: HABase.getStubEntity(hass),
      ...CARD.config.stub.template,
    } as unknown as LovelaceConfig;
  }

  // ─── CSS MANAGEMENT ───────────────────────────────────────────────────────

  _updateCSS() {
    const bar = this._cardView;
    this._applyProgressCSS(null, {
      barColor: bar.barColor,
      iconColor: bar.iconColor,
      gradient: bar.templateThemeGradient,
      diverging: bar.templateThemeDivergingGradient,
    });
    this._applyWatermarkCSS(bar.hasWatermark ? bar.watermark : null);
  }

  // ─── WATERMARK MANAGEMENT ─────────────────────────────────────────────────

  _updateWatermark() {
    if (!this._cardView.hasWatermark) return;
    this._cardView.refresh(this.hass as HomeAssistant);
    this._applyWatermarkCSS(this._cardView.watermark);
  }

  // ─── ICON MANAGEMENT ──────────────────────────────────────────────────────

  _showIcon(iconFromJinja: unknown = null) {
    const jinjaIconNotReady = this._cardView.config.icon !== undefined && iconFromJinja === null;
    if (jinjaIconNotReady) return;
    this._cardView.icon = iconFromJinja as string | null;
    super._showIcon();
  }

  // ─── JINJA TEMPLATE RENDERING - CUSTOMIZATION ─────────────────────────────

  _getJinjaHandlers(content: unknown): Record<string, () => void> {
    const handlers: Record<string, () => void> = {
      ...this._baseJinjaHandlers(content),
      badge_icon: () => this._renderBadgeIcon(content),
      badge_color: () => this._renderBadgeColor(content),
      name: () => this._renderName(content),
      secondary: () => this._renderSecondary(content),
      icon: () => this._showIcon(content),
      percent: () => this._managePercent(content),
      ...this._watermarkJinjaHandlers(content),
      // Cached (not just written to CSS) so status_label.color_source: 'icon'
      // has something to read - see ViewCore.iconColor/setTemplateColorValue.
      color: () =>
        this._renderTemplateColor(
          content,
          (v) => this._cardView.setTemplateColorValue(v),
          CARD.style.dynamic.iconAndShape.color.var,
        ),
      bar_color: () =>
        this._renderTemplateColor(
          content,
          (v) => this._cardView.setTemplateBarColorValue(v),
          CARD.style.dynamic.progressBar.color.var,
        ),
    };
    // theme (percent: true only) wins outright when configured, same
    // precedence as ViewBase.iconColor's `theme.iconColor || config.color` -
    // deleted here rather than just guarded inside the handler, so
    // validJinjaFields never subscribes to either while a theme is active,
    // instead of maintaining two subscriptions whose result is thrown away.
    if (this._cardView.config.theme) {
      delete handlers.color;
      delete handlers.bar_color;
    }
    return handlers;
  }

  // Shared by the color/bar_color handlers above - adapt, cache on
  // _cardView, write the CSS var, repaint the status label pill.
  _renderTemplateColor(content: unknown, cache: (v: string | null) => void, cssVar: string) {
    const adapted = ThemeManager.adaptColor(content as string | null);
    cache(adapted);
    this._dom.setStyle(CARD.htmlStructure.card.element, cssVar, adapted);
    this._repaintStatusLabel();
  }

  _renderName(content: unknown) {
    this._dom.setHTML(CARD.htmlStructure.elements.nameMain.class, `${content}`.trim());
  }

  // Template has no secondary-info-main slot at all (see
  // StructureElements.secondaryInfoWrapperMinimal), so neither line needs the
  // &nbsp; spacer card/badge adds before main.
  _renderSecondary(content: unknown) {
    this._renderSecondaryLines(content, (line) => line.trim());
  }

  _managePercent(percent: unknown) {
    // CF5 - issue (minor) resolved - a percent template returning a numeric
    // string was compared lexicographically in getTrend ('9' < '45' is false →
    // wrong trend); non-numeric results now show an explicit error icon instead
    // of corrupting the trend and the bar CSS
    const parsed = toNumberOrNull(percent);
    // An invalid/empty result (e.g. percent: '' while the entity it depends
    // on is momentarily unknown) still gets the trend's own error icon, but
    // no longer bails out of the rest of the render entirely - falls back to
    // 0 so the icon/bar/theme stay visible (0%'s own zone/color) instead of
    // freezing on whatever they last showed, or never painting at all on
    // first render.
    if (parsed === null)
      this._updateTrend(NaN); // renders the error icon, keeps _lastPercent untouched
    else this._updateTrend(parsed); // unclamped: trend detection wants the true delta, same as ViewBase.getTrend
    const value = parsed ?? 0;

    // CF5 - issue (major) resolved - a Jinja `percent` isn't bounded the way
    // ProgressCalc's own min/max division is (see ViewCore.get percent(),
    // which clamps for exactly this reason). The CSS fill is
    // translateX-based (GPU, not width-based), so it doesn't self-clamp
    // above 100%/below -100% - it overshoots past the container edge and
    // the bar renders with an empty gap on one side instead of full.
    const isCenterZero = Boolean(this._cardView.config.center_zero);
    const clamped = isCenterZero ? Math.max(-100, Math.min(100, value)) : Math.max(0, Math.min(100, value));

    // theme (percent: true only) re-derives icon/bar color (and, with
    // bar_color_mode set, the gradient) from this same push - see
    // _getJinjaHandlers's own color/bar_color comment for why those two
    // stand down. Unclamped value: ThemeManager.#setStyle already clamps to
    // its own first/last zone for an out-of-range value. All four options
    // read straight off _cardView, the same getters _updateCSS's own repaint
    // would read - no local computation to keep in sync.
    if (this._cardView.config.theme) this._cardView.setTemplateThemeValue(value);
    const bar = this._cardView;
    this._renderPercentCSS(clamped, {
      iconColor: bar.iconColor,
      barColor: bar.barColor,
      gradient: bar.templateThemeGradient,
      diverging: bar.templateThemeDivergingGradient,
    });
    // status_label's own fallback color (color_source: 'bar'/'icon', see its
    // own comment) depends on the same theme this push may have just moved -
    // without this, the pill only caught up on some unrelated hass update
    // happening to run _updateDynamicElements, not on the push that actually
    // changed the color.
    this._repaintStatusLabel();
  }

  // Called without param from HABase._updateDynamicElements (pre-Jinja),
  // and with percent from _managePercent when the Jinja template resolves.
  _updateTrend(percent?: number) {
    if (!this._cardView.config.trend_indicator) return;
    // CF5 - issue (major) resolved - the paramless call from
    // _updateDynamicElements used to corrupt the trend on every hass refresh
    // interleaved with a Jinja percent push. Only real pushes may record a
    // sample; NaN (invalid template result) shows the error icon without one.
    if (percent === undefined) return;
    this._applyTrendVisuals(Number.isNaN(percent) ? 'error' : this._cardView.getTrend(percent));
  }

  _renderPercentCSS(
    percent: number,
    options: {
      iconColor?: string | null;
      barColor?: string | null;
      gradient?: string | null;
      diverging?: DivergingGradients | null;
    } = {},
  ) {
    this._applyProgressCSS(percent / 100, options);
  }

  // ─── TEMPLATE PROCESSING ──────────────────────────────────────────────────

  _validateProcessJinjaFields(): boolean {
    return Boolean(this.hass) && Boolean(this._resourceManager);
  }
}

/**
 * HA CARD "entity-progress-card-template"
 *
 * @extends EntityProgressTemplateBase
 */
class EntityProgressTemplateCard extends EntityProgressTemplateBase {
  static _baseClass: string = META.types.template.typeName;

  static get _loggedMethods() {
    return [...super._loggedMethods, 'getCardSize', 'getLayoutOptions', 'getGridOptions'];
  }
}

/**
 * HA CARD "entity-progress-badge-template"
 *
 * @extends EntityProgressTemplateBase
 */
class EntityProgressTemplateBadge extends EntityProgressTemplateBase {
  static _baseClass: string = META.types.badgeTemplate.typeName;
  static _structureType = 'badge';
  _cardView: TemplateView = new BadgeTemplateView();

  // Same reasoning as EntityProgressBadge's own override - schema.ts already
  // deletes badge_icon/badge_color from badgeTemplate's own schema (a badge
  // has no badge of its own), so validJinjaFields never sees them regardless
  // (there's no config value to subscribe to) - this just makes that
  // explicit here too instead of relying on the schema alone, matching the
  // standard Badge class.
  _getJinjaHandlers(content: unknown): Record<string, () => void> {
    return HABase._stripBadgeHandlers(super._getJinjaHandlers(content));
  }

  setConfig(config: LovelaceConfig) {
    super.setConfig(config);
    // Defer refresh by one tick so HA finishes its own DOM update cycle before
    // we read state. CF5 - issue (minor) resolved - the raw setTimeout was
    // untracked and could fire after disconnect; routed through ResourceManager
    // so cleanup() cancels it (the shared id also dedupes rapid setConfig
    // calls)
    if (this.hass) this._resourceManager?.setTimeout(() => this.refresh(), 0, 'deferredRefresh');
  }

  // See EntityProgressCardBase.getStubConfig for why this is async.
  // skipcq: JS-0116 -- async is intentional, no await by design.
  static async getStubConfig(hass: HomeAssistant): Promise<LovelaceConfig> {
    return {
      type: `custom:${devName(META.types.badgeTemplate.typeName)}`,
      entity: HABase.getStubEntity(hass),
    } as unknown as LovelaceConfig;
  }
}

/******************************************************************************
 * 📦 CARD/BADGE EDITOR
 ******************************************************************************/

export { EntityProgressCard };
export { EntityProgressBadge };
export { EntityProgressFeatures };
export { EntityProgressTemplateCard };
export { EntityProgressTemplateBadge };
