/*
 * The concrete custom elements: EntityProgressCard, EntityProgressBadge,
 * EntityProgressFeatures, and their Template variants - each just wires a
 * config helper + view + structure together on top of core.js.
 */

import { META, devName, HA_CONTEXT, CARD } from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { ObjStructure, ThemeManager } from './value-helpers.js';
import { CardView, BadgeView, CardTemplateView, BadgeTemplateView } from './view.js';
import { DOMHelper } from './dom-helpers.js';
import { HACore, HABase } from './core.js';
import type { Hass } from '../utils/hass-provider.js';
import type { RawConfig } from '../utils/types.js';

/**
 * Represents the base class for all standard cards:
 *  - EntityProgressCardBase / "entity-progress-card"
 *  - EntityProgressBadge / "entity-progress-badge"
 *
 *
 * @extends HABase
 */
class EntityProgressCardBase extends HABase {
  static _hiddenComponents: any[] = [...super._hiddenComponents, CARD.style.dynamic.hiddenComponent.value];

  static getStubConfig(hass: Hass): any {
    return { type: `custom:${devName(this._baseClass)}`, entity: HABase.getStubEntity(hass) };
  }

  static get _loggedMethods() {
    return [...super._loggedMethods, '_getStandardFields', '_renderCustomInfo', '_renderNameInfo'];
  }

  _handleHassUpdate() {
    this.refresh();

    if (!this._cardView.isActiveTimer) {
      this._stopAutoRefresh();
      // CF5 - issue (major) resolved - set hass calls _handleHassUpdate before
      // _ensureResourceManager: with an active timer entity and hass assigned
      // before connectedCallback (standard Lovelace order), _resourceManager
      // was still null and .has() crashed
    } else if (!this._resourceManager?.has('autoRefresh')) {
      this._startAutoRefresh();
    }
  }

  // ─── CSS - CUSTOMIZATION ──────────────────────────────────────────────────
  get conditionalStyle(): Map<string, boolean> {
    return new Map([
      ...super.conditionalStyle,
      [CARD.style.dynamic.secondaryInfoError.class, this._cardView.hasStandardEntityError],
    ]);
  }

  _updateCSS() {
    const bar = this._cardView;
    const progressValue = bar.percent / 100;
    this._applyProgressCSS(progressValue, {
      barColor: bar.barColor,
      iconColor: bar.iconColor,
      gradient: bar.colorGradient,
      diverging: bar.divergingBarStack,
    });
    this._applyWatermarkCSS(bar.hasWatermark ? bar.watermark : null);
  }

  // ─── STD FIELDS PROCESSING - CUSTOMIZATION ────────────────────────────────
  static _getStandardFields(cardView: any): { className: string; value: any }[] {
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
  // The four numeric Jinja options share one mechanism (_renderJinjaNumber);
  // each entry below only states its two specifics: which config path must
  // still be in { jinja } mode, and which view property receives the resolved
  // number.
  _getJinjaHandlers(content: any): Record<string, () => void> {
    return {
      ...this._baseJinjaHandlers(content),
      badge_icon: () => this._renderBadgeIcon(content),
      badge_color: () => this._renderBadgeColor(content),
      custom_info: () => this._renderCustomInfo(content),
      name_info: () => this._renderNameInfo(content),
      min_value: () => this._renderJinjaNumber(content, (c: any) => c.min_value?.jinja, 'jinjaMinValue'),
      max_value: () => this._renderJinjaNumber(content, (c: any) => c.max_value?.jinja, 'jinjaMaxValue'),
      'watermark.low': () => this._renderJinjaNumber(content, (c: any) => c.watermark?.low?.jinja, 'jinjaWatermarkLow'),
      'watermark.high': () =>
        this._renderJinjaNumber(content, (c: any) => c.watermark?.high?.jinja, 'jinjaWatermarkHigh'),
    };
  }

  _renderJinjaNumber(content: any, getJinja: (c: any) => any, viewProp: string) {
    // Defensive: only apply while the option is still in { jinja: "..." } mode
    // — guards against a push arriving right as the user switches the mode
    // chips away from Jinja.
    if (!is.nonEmptyString(getJinja(this._cardView.config))) return;
    const value = is.number(content) ? content : is.strictNumericString(content) ? Number(content) : null;
    if (value === this._cardView[viewProp]) return; // unchanged — skip the recompute below
    this._cardView[viewProp] = value;
    // Lightweight, like _managePercent on template cards: recompute + repaint
    // the bar only. A full this.refresh() re-ran icon/badge/shape/trend AND
    // _processJinjaFields() (which re-scans every Jinja field on the card) on
    // every single push — while typing the template in the editor, each
    // keystroke produces a push, so the full pipeline ran on every keystroke
    // and made the editor feel like it had frozen.
    this._cardView.refresh(this.hass);
    this._updateCSS();
  }

  _renderCustomInfo(content: any) {
    // Line 1 never carries a main (see StructureElements.secondaryInfoLine), so
    // it only gets the &nbsp; spacer in single-line mode, where it precedes the
    // main span on the same line. Line 2 always carries main here (card/badge
    // has that slot) — see _renderSecondary for the template equivalent, which
    // has no main slot at all.
    const multiline = Boolean(this._cardView.config.multiline);
    const [line1, line2] = this._splitAtFirstBreak(content);
    this._dom.setHTML(CARD.htmlStructure.elements.secondaryInfoExtra.class, multiline ? line1 : `${line1}&nbsp;`);
    if (multiline) this._dom.setHTML(CARD.htmlStructure.elements.secondaryInfoExtra2.class, `${line2 ?? ''}&nbsp;`);
  }

  _renderNameInfo(content: any) {
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

  // ─── STATIC METHODS ===

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
  static _hasDisabledIconTap = true;
  static _hasDisabledBadge = true;
  static _cardStructure: ObjStructure = new ObjStructure('badge');

  // ─── JINJA TEMPLATE RENDERING - CUSTOMIZATION === Derived from the Card map
  // (minus the badge-only handlers) instead of hand-mirroring it: an earlier
  // hand-maintained copy silently missed min_value for months (CF5, medium), so
  // any handler added on the base class is now picked up here automatically by
  // construction.
  _getJinjaHandlers(content: any): Record<string, () => void> {
    const handlers = super._getJinjaHandlers(content);
    delete handlers.badge_icon;
    delete handlers.badge_color;
    return handlers;
  }
}

/**
 * HA CARD "entity-progress-feature"
 *
 * @extends HACore
 */

class EntityProgressFeatures extends HACore {
  static _baseClass: string = META.types.feature.typeName;
  static _cardElement = 'div';

  // ─── STATIC ===

  static getStubConfig() {
    return { type: `custom:${devName(META.types.feature.typeName)}` };
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
    if (!['top', 'bottom'].includes(this._cardView.config.bar_position)) return;
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
    observer = new MutationObserver(fix);
    observer.observe(cardContainer, observerOptions);
    resourceManager.add(() => observer!.disconnect(), 'featureRowFix');
  }

  // ─── HANDLE UPDATE ────────────────────────────────────────────────────────

  _handleHassUpdate() {
    this.#fixCardStyles();
    this.refresh();

    // A running timer entity doesn't push a new hass state every second - see
    // HACore._startAutoRefresh, which simulates the tick locally. Mirrors
    // EntityProgressCardBase._handleHassUpdate.
    if (!this._cardView.isActiveTimer) {
      this._stopAutoRefresh();
    } else if (!this._resourceManager?.has('autoRefresh')) {
      this._startAutoRefresh();
    }
  }

  // ─── CSS MANAGEMENT ───────────────────────────────────────────────────────

  _updateCSS() {
    const bar = this._cardView;
    const progressValue = bar.percent / 100;
    this._applyProgressCSS(progressValue, {
      barColor: bar.barColor,
      gradient: bar.colorGradient,
      diverging: bar.divergingBarStack,
    });
    this._applyWatermarkCSS(bar.hasWatermark ? bar.watermark : null);
  }

  // ─── JINJA TEMPLATE RENDERING - CUSTOMIZATION ─────────────────────────────

  _getJinjaHandlers(content: any): Record<string, () => void> {
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
 * Subclasses MAY override: - _cardStructure → static ObjStructure instance
 * (e.g. 'badge' for template badges) - _cardView → view instance (e.g.
 * BadgeTemplateView for template badges)
 *
 * @abstract
 * @extends HABase
 */
class EntityProgressTemplateBase extends HABase {
  static _cardStructure: ObjStructure = new ObjStructure('template');
  _cardView: any = new CardTemplateView();

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

  _handleHassUpdate() {
    this.refresh(); // refresh() → _cardView.refresh() → _showIcon() → _updateCSS()
  }

  static getStubConfig(hass: Hass): any {
    return {
      type: `custom:${devName(META.types.template.typeName)}`,
      entity: HABase.getStubEntity(hass),
      ...CARD.config.stub.template,
    };
  }

  // ─── CSS MANAGEMENT ───────────────────────────────────────────────────────

  _updateCSS() {
    const bar = this._cardView;
    this._applyProgressCSS(null, {
      barColor: bar.barColor,
      iconColor: bar.iconColor,
    });
    this._applyWatermarkCSS(bar.hasWatermark ? bar.watermark : null);
  }

  // ─── WATERMARK MANAGEMENT ─────────────────────────────────────────────────

  _updateWatermark() {
    if (!this._cardView.hasWatermark) return;
    this._cardView.refresh();
    this._applyWatermarkCSS(this._cardView.watermark);
  }

  // ─── ICON MANAGEMENT ──────────────────────────────────────────────────────

  _showIcon(iconFromJinja: any = null) {
    const jinjaIconNotReady = this._cardView.config.icon !== undefined && iconFromJinja === null;
    if (jinjaIconNotReady) return;
    this._cardView.icon = iconFromJinja;
    super._showIcon();
  }

  // ─── JINJA TEMPLATE RENDERING - CUSTOMIZATION ─────────────────────────────

  _getJinjaHandlers(content: any): Record<string, () => void> {
    return {
      ...this._baseJinjaHandlers(content),
      badge_icon: () => this._renderBadgeIcon(content),
      badge_color: () => this._renderBadgeColor(content),
      name: () => this._renderName(content),
      secondary: () => this._renderSecondary(content),
      icon: () => this._showIcon(content),
      percent: () => this._managePercent(content),
      color: () =>
        this._dom.setStyle(
          CARD.htmlStructure.card.element,
          CARD.style.dynamic.iconAndShape.color.var,
          ThemeManager.adaptColor(content),
        ),
      bar_color: () =>
        this._dom.setStyle(
          CARD.htmlStructure.card.element,
          CARD.style.dynamic.progressBar.color.var,
          ThemeManager.adaptColor(content),
        ),
    };
  }

  _renderName(content: any) {
    this._dom.setHTML(CARD.htmlStructure.elements.nameMain.class, `${content}`.trim());
  }

  _renderSecondary(content: any) {
    // Template has no secondary-info-main slot at all (see
    // StructureElements.secondaryInfoWrapperMinimal), so neither line ever
    // needs the &nbsp; spacer that card/badge's _renderCustomInfo adds before
    // main. `info-multiline` itself is applied via conditionalStyle
    // (config-driven), not here.
    const multiline = Boolean(this._cardView.config.multiline);
    const [line1, line2] = this._splitAtFirstBreak(content);
    this._dom.setHTML(CARD.htmlStructure.elements.secondaryInfoExtra.class, line1.trim());
    if (multiline) this._dom.setHTML(CARD.htmlStructure.elements.secondaryInfoExtra2.class, (line2 ?? '').trim());
  }

  _managePercent(percent: any) {
    // CF5 - issue (minor) resolved - a percent template returning a numeric
    // string was compared lexicographically in getTrend ('9' < '45' is false →
    // wrong trend); non-numeric results now show an explicit error icon instead
    // of corrupting the trend and the bar CSS
    const value = is.number(percent) ? percent : is.strictNumericString(percent) ? Number(percent) : null;
    if (value === null) {
      this._updateTrend(NaN); // renders the error icon, keeps _lastPercent untouched
      return;
    }
    this._updateTrend(value); // unclamped: trend detection wants the true delta, same as ViewBase.getTrend

    // CF5 - issue (major) resolved - a Jinja `percent` isn't bounded the way
    // ProgressCalc's own min/max division is (see ViewCore.get percent(),
    // which clamps for exactly this reason). The CSS fill is
    // translateX-based (GPU, not width-based), so it doesn't self-clamp
    // above 100%/below -100% - it overshoots past the container edge and
    // the bar renders with an empty gap on one side instead of full.
    const isCenterZero = Boolean(this._cardView.config.center_zero);
    const clamped = isCenterZero ? Math.max(-100, Math.min(100, value)) : Math.max(0, Math.min(100, value));
    this._renderPercentCSS(clamped);
  }

  // Called without param from HABase._updateDynamicElements (pre-Jinja),
  // and with percent from _managePercent when the Jinja template resolves.
  _updateTrend(percent?: number) {
    if (!this._cardView.config.trend_indicator) return;
    // CF5 - issue (major) resolved - the paramless call from
    // _updateDynamicElements ran getTrend(undefined), which clobbered
    // _lastPercent on every refresh: the trend indicator stayed 'flat' whenever
    // a hass update interleaved two Jinja percent pushes. Only Jinja pushes may
    // update the trend.
    if (percent === undefined) return;
    // NaN = invalid template result: show the error icon without touching
    // _lastPercent
    const icon = Number.isNaN(percent) ? this._trendIcons.error : this._trendIcons[this._cardView.getTrend(percent)];
    this._dom.setAttribute(
      CARD.htmlStructure.elements.trendIndicator.icon.class,
      CARD.style.icon.badge.default.attribute,
      icon,
    );
  }

  _renderPercentCSS(percent: number) {
    this._applyProgressCSS(percent / 100);
  }

  // ─── TEMPLATE PROCESSING ===

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
  static _hasDisabledIconTap = true;
  static _hasDisabledBadge = true;
  static _cardStructure: ObjStructure = new ObjStructure('badge');
  _cardView: any = new BadgeTemplateView();

  setConfig(config: RawConfig) {
    super.setConfig(config);
    // Defer refresh by one tick so HA finishes its own DOM update cycle before
    // we read state. CF5 - issue (minor) resolved - the raw setTimeout was
    // untracked and could fire after disconnect; routed through ResourceManager
    // so cleanup() cancels it (the shared id also dedupes rapid setConfig
    // calls)
    if (this.hass) this._resourceManager?.setTimeout(() => this.refresh(), 0, 'deferredRefresh');
  }

  static getStubConfig(hass: Hass): any {
    return { type: `custom:${devName(META.types.badgeTemplate.typeName)}`, entity: HABase.getStubEntity(hass) };
  }
}

/******************************************************************************
 * 📦 CARD/BADGE EDITOR
 ******************************************************************************/

export { EntityProgressCardBase };
export { EntityProgressCard };
export { EntityProgressBadge };
export { EntityProgressFeatures };
export { EntityProgressTemplateBase };
export { EntityProgressTemplateCard };
export { EntityProgressTemplateBadge };
