import { META, CARD } from '../../utils/parameters.js';
import { is, toNumberOrNull } from '../../utils/common-checks.js';
import { ThemeManager } from '../color/theme-manager.js';
import { CardTemplateView, BadgeTemplateView, type TemplateView } from '../view/template.js';
import { HABase } from '../core/base.js';
import type { DivergingGradients } from '../core/core/bar-css.js';
import type { HomeAssistant } from '../../utils/hass-provider.js';
import type { LovelaceConfig } from '../../utils/types.js';
import { ProgressMath } from '../view/progress-math.js';
import { CARD_LAYOUT_METHODS } from './layout-methods.js';

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
  // The picker's template stub ships a worked example (icon/name/secondary/
  // badge_*) on top of the shared type/entity pair.
  static _stubExtras: Record<string, unknown> = CARD.config.stub.template;
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
    this._jinjaSubscriptions.resubscribeAll();
  }

  // ─── CSS MANAGEMENT ───────────────────────────────────────────────────────

  // What a repaint and a percent push both paint with, read off the view.
  get #templateColors() {
    const bar = this._cardView;
    return {
      iconColor: bar.iconColor,
      barColor: bar.barColor,
      gradient: bar.templateThemeGradient,
      diverging: bar.templateThemeDivergingGradient,
    };
  }

  _updateCSS() {
    this._applyProgressCSS(null, this.#templateColors);
    this._applyWatermarkCSS(this._cardView.watermark);
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
      ...this._badgeJinjaHandlers(content),
      name: () => this._renderName(content),
      secondary: () => this._renderSecondary(content),
      icon: () => this._showIcon(content),
      percent: () => this._managePercent(content),
      ...this._watermarkJinjaHandlers(content),
      // Cached (not just written to CSS) so status_label.color_source: 'icon'
      // has something to read - see TemplateViewBase.setTemplateColorValue.
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
    // validFields never subscribes to either while a theme is active,
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
    // a min/max division is, so it goes through the same rule (see
    // ProgressMath.clampPercent for why the bar needs one at all).
    const isCenterZero = Boolean(this._cardView.config.center_zero);
    const clamped = ProgressMath.clampPercent(value, isCenterZero);

    // theme re-derives icon/bar color (and gradient) from this push. Unclamped:
    // ThemeManager already clamps to its own first/last zone.
    if (this._cardView.config.theme) this._cardView.setTemplateThemeValue(value);
    this._renderPercentCSS(clamped, this.#templateColors);
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
    return [...super._loggedMethods, ...CARD_LAYOUT_METHODS];
  }
}

/**
 * HA CARD "entity-progress-badge-template"
 *
 * @extends EntityProgressTemplateBase
 */
class EntityProgressTemplateBadge extends EntityProgressTemplateBase {
  static _baseClass: string = META.types.badgeTemplate.typeName;
  // A badge has no icon/name/secondary row - back to the bare stub.
  static _stubExtras: Record<string, unknown> = {};
  static _structureType = 'badge';
  static _hasInnerBadge = false;
  _cardView: TemplateView = new BadgeTemplateView();

  setConfig(config: LovelaceConfig) {
    super.setConfig(config);
    // Defer refresh by one tick so HA finishes its own DOM update cycle before
    // we read state. CF5 - issue (minor) resolved - the raw setTimeout was
    // untracked and could fire after disconnect; routed through ResourceManager
    // so cleanup() cancels it (the shared id also dedupes rapid setConfig
    // calls)
    if (this.hass) this._resourceManager?.setTimeout(() => this.refresh(), 0, 'deferredRefresh');
  }
}

export { EntityProgressTemplateCard };
export { EntityProgressTemplateBadge };
