/*
 * HACore and HABase: the base classes implementing the shared
 * card/badge/feature lifecycle (setConfig, render, hass updates, auto-refresh)
 * that every concrete card type extends.
 */

import { VERSION, META, CARD_CONTEXT, devName, HA_CONTEXT, CARD } from '../utils/parameters.js';
import { CARD_CSS, getSharedStyleSheet } from '../utils/styles.js';
import { is, assertDefined } from '../utils/common-checks.js';
import { initLogger, type LoggerInstance } from '../utils/log.js';
import { ObjStructure, ThemeManager, ChangeTracker } from './value-helpers.js';
import { HassProviderSingleton, type HomeAssistant, type EntityState } from '../utils/hass-provider.js';
import { CardView, FeatureView, type ViewCore, type ViewBase } from './view.js';
import { ResourceManager, DOMHelper, ActionHelper } from './dom-helpers.js';
import type { CacheValue } from './dom-helpers.js';
import type { LovelaceConfig, Config } from '../utils/types.js';
import type { StructureOptions } from './structure.js';

// The resolved shape ViewBase/ViewCore's `watermark` getter returns (see
// view.ts) - the validated WatermarkConfig plus low/high/low_color/high_color
// already overwritten with their final resolved values.
type ResolvedWatermark = {
  high: number;
  high_color: string | null;
  low: number;
  low_color: string | null;
  opacity: number;
  line_size: string;
  type: string;
  disable_high?: boolean;
  disable_low?: boolean;
};

// ViewBase.divergingBarStack's return shape (see view.ts). Exported -
// cards.ts's own _renderPercentCSS forwards the same shape (ViewCore.
// templateThemeDivergingGradient) through to _applyProgressCSS below.
export type DivergingGradients = {
  posGradient: string | null;
  negGradient: string | null;
  posSize: number;
  negSize: number;
};

// The icon element _showIcon()/_handleImgIcon()/_handleStateIcon() manage:
// either a plain <img> (entity_picture) or a <ha-state-icon> (hass/stateObj).
type IconElement = HTMLImageElement | (HTMLElement & { hass: HomeAssistant | null; stateObj: unknown });

/**
 * Base class for Home Assistant custom elements (cards, badges, features).
 *
 * HTMLElement
 * └── HACore
 *     ├── HABase
 *     │   ├── EntityProgressCardBase
 *     │   │   ├── EntityProgressCard
 *     │   │   └── EntityProgressBadge
 *     │   └── EntityProgressTemplateBase
 *     │       ├── EntityProgressTemplateCard
 *     │       └── EntityProgressTemplateBadge
 *     └── EntityProgressFeatures
 *
 * Provides: - Shadow DOM initialization and lifecycle management
 * (connectedCallback, disconnectedCallback) - Configuration handling via
 * setConfig() - hass state tracking and change detection - DOM rendering
 * pipeline: render() → _createCardElements() → _buildStyle() - Batched DOM
 * updates via DOMHelper (RAF queue + value cache) - Jinja2 template
 * subscriptions via WebSocket - Resource lifecycle management (listeners,
 * subscriptions, intervals)
 *
 * Subclasses MUST implement:
 * - _handleHassUpdate()     → react to hass state changes
 * - _updateCSS()            → apply dynamic CSS custom properties
 * - _getJinjaHandlers()     → handle Jinja2 template results
 *
 * Subclasses MAY override: - _structureOptions (getter) → structure options
 * passed to ObjStructure.clone() (barType, barPosition…) - _buildStyle() → CSS
 * class application pipeline (watermark, bar effect, base classes) -
 * _updateDynamicElements() → DOM update orchestration (CSS, Jinja processing)
 *
 * @abstract
 * @extends HTMLElement
 */
class HACore extends HTMLElement {
  static version = VERSION;
  static _baseClass: string = META.types.feature.typeName;
  static _cardStructure: ObjStructure = new ObjStructure('feature');
  static _cardStyle = CARD_CSS;
  static _cardElement = CARD.htmlStructure.card.element;
  // Overridden true by EntityProgressBadge/EntityProgressTemplateBadge (see
  // cards.ts) - badges only ever have a card-level action, never the icon's
  // own. Declared here (not just HABase) so _createCardElements's own
  // icon-keyboard wiring, shared by every subclass including Feature, can
  // read it without a cast.
  static _hasDisabledIconTap = false;
  _debug = CARD_CONTEXT.debug.card;
  _log: LoggerInstance | null = null;
  // Always assigned first thing in the constructor, before anything else in
  // this class or HABase (subclass) can run - `attachShadow()` itself returns
  // the real ShadowRoot (not the nullable `this.shadowRoot` getter, which
  // would also go permanently null-from-outside if shadowMode were ever
  // 'closed').
  _shadow!: ShadowRoot;
  _resourceManager: ResourceManager | null = null;
  // Only ever assigned by HABase (see its own init) - Feature (extends
  // HACore directly) leaves it null, which _createCardElements's own
  // optional-chained triggerIconTap() call already handles as a no-op.
  _actionHelper: ActionHelper | null = null;
  // Concrete subclasses swap this in for CardView/BadgeView/FeatureView/
  // CardTemplateView/BadgeTemplateView - ViewCore (not a union, not `any`)
  // is the widest type accurate for all of them. Call sites reading a
  // ViewBase-only member (msg, badgeInfo, …) cast to ViewBase explicitly.
  _cardView: ViewCore = new FeatureView();
  _dom = new DOMHelper();
  _hassProvider = HassProviderSingleton.getInstance();
  _changeTracker = new ChangeTracker();
  #isRendered = false;
  // CF5 - issue (perf) resolved - render_template subscriptions are push-based;
  // tracking the signature (template + entity variable) of each live/in-flight
  // subscription lets us skip the systematic unsubscribe/resubscribe cycle on
  // every refresh
  #templateSignatures = new Map<string, string>();

  // ─── LIFECYCLE METHODS ────────────────────────────────────────────────────
  static get _loggedMethods() {
    return [
      'connectedCallback',
      'disconnectedCallback',
      'setConfig',
      'refresh',
      'reset',
      'render',
      '_storeDOM',
      '_handleWatermarkClasses',
      '_handleBarEffect',
      '_updateDynamicElements',
      '_renderJinja',
      '_refreshBarEffect',
      '_createCardElements',
      '_buildStyle',
      '_processJinjaFields',
      '_subscribeToTemplate',
      '_watchWebSocket',
      '_unwatchWebSocket',
      '_validateProcessJinjaFields',
      '_startAutoRefresh',
      '_stopAutoRefresh',
      // abstract
      '_handleHassUpdate',
      '_updateCSS',
      '_getJinjaHandlers',
    ];
  }

  constructor() {
    super();
    this._log = initLogger(this, this._debug, (this.constructor as typeof HACore)._loggedMethods);
    this._shadow = this.attachShadow({ mode: CARD.config.shadowMode as 'open' | 'closed' });
  }

  static getConfigElement(): HTMLElement | null {
    const metaType = Object.values(META.types).find((t) => t.typeName === this._baseClass) as
      { editor?: string } | undefined;
    return metaType?.editor ? document.createElement(devName(metaType.editor)) : null;
  }

  connectedCallback() {
    this._ensureResourceManager();
    this.render();
    this._updateDynamicElements();
    if (this.hass) {
      this._handleHassUpdate();
      this._watchWebSocket();
    }
    this.#watchInterference();
  }

  disconnectedCallback() {
    this._resourceManager?.cleanup();
    this._resourceManager = null;
    this.#templateSignatures.clear(); // subscriptions died with cleanup() — allow resubscription on reconnect
    this.#interferenceObserver?.disconnect();
    this.#interferenceObserver = null;
  }

  // Implemented only to surface it under ?debug=card: fires when the element
  // is adopted into a different document, e.g. moved into a popup/dialog's own
  // document by webawesome/browser_mod - a prime suspect for the dropdown/
  // popup freeze in issue #108, and otherwise completely silent.
  adoptedCallback() {
    this._log?.debug('adoptedCallback — element moved into a different document');
  }

  // ?debug=interference: watch our own host element for attribute mutations
  // we didn't make - the fingerprint of another module (card-mod &c) styling/
  // marking our card from the outside. Only ever created when the flag is on,
  // so it's zero cost otherwise. Scoped to host attributes (card-mod's usual
  // entry point); it can't see a reparent of the host itself - adoptedCallback
  // above covers the cross-document case.
  #interferenceObserver: MutationObserver | null = null;

  #watchInterference() {
    if (!CARD_CONTEXT.debug.interference || this.#interferenceObserver) return;
    this.#interferenceObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'attributes') continue;
        const attr = mutation.attributeName ?? '';
        console.debug(
          `[interference] <${this.localName}> attribute "${attr}" changed externally: "${mutation.oldValue}" → "${this.getAttribute(attr)}"`,
        );
      }
    });
    this.#interferenceObserver.observe(this, { attributes: true, attributeOldValue: true });
  }

  _ensureResourceManager() {
    if (!this._resourceManager) this._resourceManager = new ResourceManager();
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  /**
   * Updates the component's configuration and triggers static changes.
   */
  setConfig(config: LovelaceConfig) {
    this._log?.debug('📎 HACore.setConfig()', config);

    if (!config) throw new Error('setConfig: invalid config');
    if (this.isRendered) this.reset(); // Card/Badge editor

    this._cardView.config = { ...config };
    this._registerWatchedEntities(config);
    this.render(); // re-build the card

    if (this.hass) this._handleHassUpdate(); // Card/Badge editor
  }

  _registerWatchedEntities(config: LovelaceConfig) {
    // CF5 - issue (minor) resolved - the watched set was only ever appended to:
    // entities removed from the config (editor changes) stayed watched and kept
    // triggering refreshes until reload. Rebuilt from scratch on every
    // setConfig.
    this._changeTracker.resetWatchedEntities();
    if (is.string(config.entity)) this._changeTracker.watchEntity(config.entity);
    if (is.nonEmptyString(config.max_value?.entity)) this._changeTracker.watchEntity(config.max_value.entity);
    if (is.nonEmptyString(config.min_value?.entity)) this._changeTracker.watchEntity(config.min_value.entity);
    if (is.string(config?.watermark?.low)) this._changeTracker.watchEntity(config.watermark.low);
    if (is.string(config?.watermark?.high)) this._changeTracker.watchEntity(config.watermark.high);
    // CF5 - issue (major) resolved - additions entities were not watched: when
    // one of them changed state (main entity unchanged), the ChangeTracker
    // reported no change and the displayed total stayed stale
    if (is.array(config.bar_stack?.entities)) {
      for (const item of config.bar_stack.entities) {
        if (is.plainObject(item) && is.string(item.entity)) this._changeTracker.watchEntity(item.entity);
      }
    }
  }

  /**
   * Sets the Home Assistant (`hass`) instance and updates dynamic elements.
   *
   * @param {Object} hass - The Home Assistant instance containing the current
   *                        state and services.
   */
  set hass(hass: HomeAssistant) {
    this._log?.debug('👉 HACore.set hass()');
    if (!hass) return;

    const isFirstHass = !this.hass;
    this._changeTracker.hassState = hass;
    if (isFirstHass || this._changeTracker.hassState.isUpdated) {
      this._hassProvider.hass = hass;
      this._handleHassUpdate();
    }
    this._ensureResourceManager();
    if (!this._wsInitialized) this._watchWebSocket();
  }

  get hass(): HomeAssistant | null {
    return this._hassProvider.hass;
  }

  _handleHassUpdate() {
    throw new Error(`${this.constructor.name} must implement _handleHassUpdate()`);
  }

  refresh() {
    this._cardView.refresh(this.hass as HomeAssistant);
    this._updateDynamicElements();
  }

  // ─── AUTO-REFRESH MANAGEMENT ──────────────────────────────────────────────
  // Shared by every subclass (cards, badges, features): a running timer
  // entity doesn't push a new hass state every second, so this simulates the
  // tick locally. Lives here (not HABase) so EntityProgressFeatures - which
  // extends HACore directly, not HABase - gets it too.

  // Self-correcting setTimeout chain, not setInterval: each tick recomputes
  // its delay from Date.now(), so ticks land on round boundaries of
  // `interval` (e.g. :00, :01, :02 for 1000ms) - immune to setInterval's
  // native drift instead of repeating the first tick's own phase. Date.now()
  // is captured before refresh()/_onAutoRefreshTick() run, not after -
  // doing it after would fold their execution time into the next delay.
  _startAutoRefresh() {
    if (!this._resourceManager) return;
    const cardView = this._cardView;
    const tick = () => {
      const firedAt = Date.now();
      this._onAutoRefreshTick();
      const nextInterval = cardView.autoRefreshInterval;
      if (nextInterval === null) {
        this._stopAutoRefresh();
        return;
      }
      this._resourceManager?.setTimeout(tick, nextInterval - (firedAt % nextInterval), 'autoRefresh');
    };
    const interval = cardView.autoRefreshInterval;
    if (interval !== null) this._resourceManager.setTimeout(tick, interval - (Date.now() % interval), 'autoRefresh');
  }

  // Deliberately NOT a full this.refresh(): a ticking timer only ever moves
  // the bar, so recomputing the view and repainting CSS is all every
  // subclass needs - icon/badge/shape/trend/Jinja are state-driven, already
  // re-run by _handleHassUpdate on a real hass change. EntityProgressCardBase
  // overrides this to also update its value text; EntityProgressTemplateBase
  // overrides it entirely (Jinja-push-driven display).
  _onAutoRefreshTick() {
    this._cardView.refresh(this.hass as HomeAssistant);
    this._updateCSS();
  }

  _stopAutoRefresh() {
    if (this._resourceManager) this._resourceManager.remove('autoRefresh');
  }

  // Shared by EntityProgressCardBase, EntityProgressFeatures, and
  // EntityProgressTemplateBase's own _handleHassUpdate: start/stop the local
  // tick based on ViewCore/ViewBase's own autoRefreshInterval (null = no
  // local loop needed - see view.ts).
  // CF5 - issue (major) resolved - set hass calls _handleHassUpdate before
  // _ensureResourceManager: with an active timer entity and hass assigned
  // before connectedCallback (standard Lovelace order), _resourceManager was
  // still null and .has() crashed.
  _manageAutoRefresh() {
    if (this._cardView.autoRefreshInterval === null) {
      this._stopAutoRefresh();
    } else if (!this._resourceManager?.has('autoRefresh')) {
      this._startAutoRefresh();
    }
  }

  get isRendered(): boolean {
    return this.#isRendered;
  }

  reset() {
    this._dom.toggleClass(CARD.htmlStructure.card.element, 'transition-ready', false); // retire AVANT purge
    this.#isRendered = false;
    this._dom.destroy();
    this._shadow.innerHTML = ''; // purge le contenu shadow DOM
  }

  get cardStyle(): string {
    return (this.constructor as typeof HACore)._cardStyle;
  }

  get baseClass(): string {
    return (this.constructor as typeof HACore)._baseClass;
  }

  get cardElement(): string {
    return (this.constructor as typeof HACore)._cardElement;
  }

  // ─── CARD BUILDING ────────────────────────────────────────────────────────

  /**
   * Builds and initializes the structure of the custom card component.
   *
   * This method creates the visual and structural elements of the card and
   * injects them into the component's Shadow DOM.
   */
  render() {
    if (this.isRendered) return;
    this.#isRendered = true;
    const element = this._createCardElements();
    // element.style is null when the shared constructed sheet is adopted
    this._shadow.replaceChildren(...(element.style ? [element.style, element.card] : [element.card]));
    this._storeDOM();
    this._buildSegmentDividers();
    requestAnimationFrame(() => {
      this._dom.addClass(CARD.htmlStructure.card.element, 'transition-ready');
    });
  }

  get _structureOptions(): StructureOptions {
    return {
      barType: this._cardView.config.center_zero ? 'centerZero' : 'default',
      barPosition: this._cardView.config.bar_position,
    };
  }

  get hasDisabledIconTap(): boolean {
    return (this.constructor as typeof HACore)._hasDisabledIconTap;
  }

  _createCardElements(): { style: HTMLStyleElement | null; card: HTMLElement } {
    // Preferred path: adopt the shared constructed sheet (parsed once for all
    // instances). Fallback path (older Firefox/Safari, see
    // getSharedStyleSheet): a per-instance <style> element, as before.
    let style: HTMLStyleElement | null = null;
    const sharedSheet = getSharedStyleSheet(this.cardStyle);
    if (sharedSheet) {
      if (!this._shadow.adoptedStyleSheets.includes(sharedSheet)) {
        this._shadow.adoptedStyleSheets = [...this._shadow.adoptedStyleSheets, sharedSheet];
      }
    } else {
      style = document.createElement(CARD.style.element) as HTMLStyleElement;
      style.textContent = this.cardStyle;
    }

    const card = document.createElement(this.cardElement);
    this._dom.destroy();
    this._dom.register(CARD.htmlStructure.card.element, card);
    this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.progressBar.value.var, 0);
    this._buildStyle();
    // Cloned from the per-options <template> cache; _structureOptions is read
    // fresh here so a setConfig that changes the structure picks the right
    // template.
    card.replaceChildren((this.constructor as typeof HACore)._cardStructure.clone(this._structureOptions));

    // .ripple-zone (sibling of .container/.shape, see card-config.ts), not
    // ha-card - avoids nesting role="button" around .shape's own one below.
    // hasClickableCard only, not hasClickableIcon too: matches .ripple-zone's
    // CSS (pointer-events: none unless .clickable-card) - an icon-only
    // action shouldn't make the whole card announce as a button it isn't.
    if (this._cardView.hasClickableCard) {
      const rippleZone = card.querySelector<HTMLElement>(`.${CARD.htmlStructure.sections.rippleZone.class}`);
      if (rippleZone) {
        rippleZone.removeAttribute('aria-hidden');
        rippleZone.setAttribute('role', 'button');
        rippleZone.setAttribute('tabindex', '0');
        // Entity-specific label, not the generic card type name (fallback
        // only for unresolved entities / Template variants with no .name) -
        // otherwise several of these cards on one dashboard read identically
        // to a screen reader. Duck-typed (.name isn't on the declared
        // ViewCore type) since _cardView's concrete class varies.
        const cardName = (this._cardView as { name?: string | null }).name;
        rippleZone.setAttribute('aria-label', cardName || META.types.card.name);
        // Same #entity-value id the progress bar's own aria-describedby
        // already uses - aria-label alone only carries the entity name, so
        // the value a sighted user sees at a glance was never announced
        // through a bare role="button". A static id, not the value text
        // itself, so it stays in sync with no extra update-cycle wiring.
        rippleZone.setAttribute('aria-describedby', 'entity-value');
      }
    }

    // Icon's own keyboard entry point - only when hasClickableIcon AND not
    // hasDisabledIconTap. Matches ha-tile-icon's role="button"/tabindex="0"
    // pattern. .shape is rebuilt fresh every render, so no stale listener to
    // clean up later. See ActionHelper.triggerIconTap for why a plain
    // keydown, not a second <action-handler> binding.
    if (this._cardView.hasClickableIcon && !this.hasDisabledIconTap) {
      const shape = card.querySelector<HTMLElement>(`.${CARD.htmlStructure.elements.shape.class}`);
      if (shape) {
        shape.setAttribute('role', 'button');
        shape.setAttribute('tabindex', '0');
        // No accessible name to fall back on otherwise - the icon glyph
        // itself carries none.
        shape.setAttribute('aria-label', 'Icon action');
        shape.addEventListener('keydown', (ev: KeyboardEvent) => {
          if (ev.key !== 'Enter' && ev.key !== ' ') return;
          ev.preventDefault();
          this._actionHelper?.triggerIconTap();
        });
      }
    }

    return { style, card };
  }

  // CF5 - issue (medium) resolved - _storeDOM registered every element under
  // its first CSS class: silent collisions were possible and the map carried
  // dead weight. Only the elements actually driven through the DOMHelper are
  // registered now.
  static get _domKeys(): string[] {
    return [
      CARD.htmlStructure.elements.progressBar.container.class,
      CARD.htmlStructure.elements.icon.class,
      CARD.htmlStructure.elements.badge.icon.class,
      CARD.htmlStructure.elements.trendIndicator.icon.class,
      CARD.htmlStructure.elements.label.class,
      CARD.htmlStructure.elements.nameMain.class,
      CARD.htmlStructure.elements.nameExtra.class,
      CARD.htmlStructure.elements.secondaryInfoMain.class,
      CARD.htmlStructure.elements.secondaryInfoExtra.class,
      CARD.htmlStructure.elements.secondaryInfoExtra2.class,
    ];
  }

  _storeDOM() {
    for (const key of (this.constructor as typeof HACore)._domKeys) {
      const el = this._shadow.querySelector(`.${CSS.escape(key)}`);
      if (el) this._dom.register(key, el as HTMLElement);
    }
  }

  _buildStyle() {
    this._addBaseClasses();
    this._handleWatermarkClasses();
    this._handleBarEffect();
  }

  // Real N+1 divs (bar_segments: N, plus the two edge markers), not a CSS
  // gradient/mask trick - runs once per render(), after the structure clone
  // is in the DOM. Percent-based position, not px, so it stays correct
  // regardless of the bar's current width, no resize listener needed.
  _buildSegmentDividers() {
    const count = this._cardView.config.bar_segments;
    const active = is.number(count) && count >= 2;
    // .bar-segmented itself only still matters for .bar's own border-radius
    // reset below (styles.ts) - everything else keys off the divider
    // elements' own presence now, not this class.
    this._dom.toggleClass(CARD.htmlStructure.card.element, 'bar-segmented', active);
    if (!active) return;
    const rounded = Math.round(count);
    const bars = this._shadow.querySelectorAll(`.${CSS.escape(CARD.htmlStructure.elements.progressBar.bar.class)}`);
    const containerSpec = CARD.htmlStructure.elements.progressBar.segments;
    const dividerSpec = CARD.htmlStructure.elements.progressBar.segmentDivider;
    bars.forEach((bar) => {
      // One wrapper per .bar, grouping every divider instead of leaving them
      // loose alongside the watermark/zero/value marks already in .bar.
      const container = document.createElement(containerSpec.element);
      container.className = containerSpec.class;
      Object.entries(containerSpec.extraAttr ?? {}).forEach(([key, value]) =>
        container.setAttribute(key, String(value)),
      );
      // i=0 and i=rounded (the bar's own two edges) get a divider too, not
      // just the N-1 internal ones: an internal divider straddles its
      // boundary, eating half its width from each neighbor - an edge cell
      // has only one real neighbor and would read visibly wider without a
      // matching half-divider. .bar's overflow: hidden clips the half that
      // falls outside the bar, leaving the same sliver a real neighbor would.
      for (let i = 0; i <= rounded; i += 1) {
        const divider = document.createElement(dividerSpec.element);
        divider.className = dividerSpec.class;
        Object.entries(dividerSpec.extraAttr ?? {}).forEach(([key, value]) => divider.setAttribute(key, String(value)));
        divider.style.setProperty('--segment-position', `${(100 * i) / rounded}%`);
        container.appendChild(divider);
      }
      bar.appendChild(container);
    });
  }

  _addBaseClasses() {
    this._dom.addClass(
      CARD.htmlStructure.card.element,
      this.baseClass,
      this._cardView.config.layout,
      this._cardView.config.bar_size,
      this._cardView.config.bar_orientation
        ? (CARD.style.dynamic.progressBar.orientation as Record<string, string>)[this._cardView.config.bar_orientation]
        : null,
      this._cardView.config.center_zero ? CARD.style.dynamic.progressBar.centerZero.class : null,
      this._cardView.config.bar_color_mode === 'rainbow_full' ? 'rainbow-full-bar' : null,
      (this._cardView.config.layout === 'vertical' &&
        this._cardView.config.bar_orientation === 'up' &&
        this._cardView.config.bar_position === 'overlay') ||
        (this._cardView.config.bar_orientation === 'up' && this._cardView.config.bar_position === 'background')
        ? 'vertical-bar'
        : 'horizontal-bar',
    );
  }

  _handleWatermarkClasses() {
    // Captured once so the null-check below actually narrows what the rest
    // of this method reads - hasWatermark and watermark are two separate
    // getter calls that TypeScript can't otherwise correlate.
    const watermark = this._cardView.watermark;
    if (!watermark) return;

    const type = ['area', 'blended', 'striped', 'line', 'triangle', 'round'].includes(watermark.type)
      ? `${watermark.type}`
      : 'blended';
    const showClass = CARD.style.dynamic.show;

    this._dom.toggleClass(CARD.htmlStructure.card.element, `${showClass}-hwm`, !watermark.disable_high);
    this._dom.toggleClass(CARD.htmlStructure.card.element, `hwm-${type}`, !watermark.disable_high);
    this._dom.toggleClass(CARD.htmlStructure.card.element, `${showClass}-lwm`, !watermark.disable_low);
    this._dom.toggleClass(CARD.htmlStructure.card.element, `lwm-${type}`, !watermark.disable_low);
  }

  // The editor (EntityProgressEffectChips) can only guard interactive
  // selection - Jinja/hand-written YAML bypasses it. Incompatible pairs
  // (glass/gradient(_reverse) vs. shimmer/shimmer_reverse share the same CSS
  // custom property) don't error, they just silently drop one depending on
  // stylesheet order - this mirrors that exclusion explicitly here,
  // first-requested-wins.
  static #resolveEffectConflicts(labels: string[]): string[] {
    const incompatible: Record<string, string[]> = CARD.style.dynamic.progressBar.effectIncompatibilities;
    const kept: string[] = [];
    for (const label of labels) {
      if (kept.some((keptLabel) => incompatible[keptLabel]?.includes(label))) continue;
      kept.push(label);
    }
    return kept;
  }

  _handleBarEffect(jinjaEffect: string[] | null = null) {
    this._log?.debug('📎 HACore _handleBarEffect(jinjaEffect)', jinjaEffect);

    if (!this._cardView.barEffectsEnabled) return;
    const isJinja = is.jinja(this._cardView.config.bar_effect);
    if (isJinja && !jinjaEffect) return;

    const requested = isJinja
      ? (jinjaEffect ?? [])
      : is.array(this._cardView.config.bar_effect)
        ? (this._cardView.config.bar_effect as string[])
        : [];
    const resolved = HACore.#resolveEffectConflicts(requested);

    const effects = Object.values(CARD.style.dynamic.progressBar.effect);
    effects.forEach((effect) => {
      this._dom.toggleClass(CARD.htmlStructure.card.element, effect.class, resolved.includes(effect.label));
    });
  }

  // ─── DYNAMIC ELEMENTS UPDATE ──────────────────────────────────────────────

  _updateDynamicElements() {
    this._updateCSS();
    this._processJinjaFields();
  }

  // ─── CSS MANAGEMENT ───────────────────────────────────────────────────────

  _updateCSS() {
    throw new Error(`${this.constructor.name} must implement _updateCSS()`);
  }

  _applyProgressCSS(
    progressValue: number | null,
    {
      barColor = null,
      iconColor = null,
      gradient = null,
      diverging = null,
    }: {
      barColor?: string | null;
      iconColor?: string | null;
      gradient?: string | null;
      diverging?: DivergingGradients | null;
    } = {},
  ) {
    const cardKey = CARD.htmlStructure.card.element;

    const fillColor = gradient ?? barColor;
    if (fillColor !== null) this._dom.setStyle(cardKey, CARD.style.dynamic.progressBar.color.var, fillColor);
    if (iconColor !== null) this._dom.setStyle(cardKey, CARD.style.dynamic.iconAndShape.color.var, iconColor);

    this._applyDivergingBarStackCSS(cardKey, diverging);

    if (progressValue !== null) {
      this._dom.setStyle(cardKey, CARD.style.dynamic.progressBar.value.var, progressValue);
      this._dom.setAttribute(
        CARD.htmlStructure.elements.progressBar.container.class,
        'aria-valuenow',
        Math.round(progressValue * 100),
      );
    }
  }

  // bar_stack 'stacked'/'proportional' + center_zero: two independent per-arm
  // gradients/sizes (see ViewBase.divergingBarStack). Explicitly removed (not
  // left stale) when not applicable - setStyle() never unsets a value on its
  // own once written.
  _applyDivergingBarStackCSS(cardKey: string, diverging: DivergingGradients | null) {
    const pb = CARD.style.dynamic.progressBar;
    if (!diverging) {
      this._dom.removeStyle(cardKey, pb.stackGradientPos.var);
      this._dom.removeStyle(cardKey, pb.stackGradientNeg.var);
      this._dom.removeStyle(cardKey, pb.stackSizePos.var);
      this._dom.removeStyle(cardKey, pb.stackSizeNeg.var);
      return;
    }
    if (diverging.posGradient) this._dom.setStyle(cardKey, pb.stackGradientPos.var, diverging.posGradient);
    else this._dom.removeStyle(cardKey, pb.stackGradientPos.var);
    if (diverging.negGradient) this._dom.setStyle(cardKey, pb.stackGradientNeg.var, diverging.negGradient);
    else this._dom.removeStyle(cardKey, pb.stackGradientNeg.var);
    this._dom.setStyle(cardKey, pb.stackSizePos.var, diverging.posSize);
    this._dom.setStyle(cardKey, pb.stackSizeNeg.var, diverging.negSize);
  }

  _applyWatermarkCSS(watermark: ResolvedWatermark | null) {
    if (!watermark) return;
    const cardKey = CARD.htmlStructure.card.element;
    HACore._getWatermarkProperties(watermark).forEach(([variable, value]) => {
      if (!is.nullish(value)) this._dom.setStyle(cardKey, variable, value);
    });
  }

  // ─── WATERMARK MANAGEMENT ─────────────────────────────────────────────────

  static _getWatermarkProperties(watermark: ResolvedWatermark): [string, string | number | null][] {
    return [
      [CARD.style.dynamic.watermark.high.value.var, `${watermark.high}%`],
      [CARD.style.dynamic.watermark.high.color.var, watermark.high_color],
      [CARD.style.dynamic.watermark.low.value.var, `${watermark.low}%`],
      [CARD.style.dynamic.watermark.low.color.var, watermark.low_color],
      [CARD.style.dynamic.watermark.opacity.var, watermark.opacity],
      [CARD.style.dynamic.watermark.lineSize.var, watermark.line_size],
    ];
  }

  // ─── JINJA TEMPLATE RENDERING ─────────────────────────────────────────────

  get validJinjaFields(): Record<string, string> {
    // Most Jinja-capable options are flat strings, but some (min_value,
    // watermark.low/.high) use an explicit { jinja: "..." } map instead of
    // sniffing a bare string - extract accordingly. Dot-path keys walk one
    // level of nesting.
    const rawValueFor = (key: string) => {
      const raw = key.includes('.')
        ? key.split('.').reduce<unknown>((obj, k) => (obj as Record<string, unknown>)?.[k], this._cardView.config)
        : this._cardView.config[key];
      return is.plainObject(raw) ? (raw.jinja ?? '') : raw || '';
    };
    const handlers = this._getJinjaHandlers();
    const result = Object.fromEntries(
      Object.keys(handlers)
        .map((key) => [key, rawValueFor(key)])
        .filter(([, value]) => is.nonEmptyString(value)),
    );
    this._log?.debug('validJinjaFields: ', { handler: handlers, config: this._cardView.config, result });
    return result;
  }

  _getJinjaHandlers(content?: unknown): Record<string, () => void> {
    throw new Error(`${this.constructor.name} must implement _getJinjaHandlers(${content})`);
  }

  // A multi-step script (e.g. turn an input_boolean on, then pick an
  // input_select option) can make HA push one intermediate template result
  // per entity change, not just the final settled one (issue #135). Debounced
  // per key, not globally, via ResourceManager.setTimeout's existing
  // cancel-and-replace-by-id (~80ms: short enough to feel instant, long
  // enough to coalesce a script's back-to-back pushes into the last one).
  _renderJinja(key: string, content: unknown) {
    this._log?.debug('📎 HACore._renderJinja():', { key, content });
    this._resourceManager?.setTimeout(() => this.#applyJinja(key, content), 80, `jinja-render-${key}`);
  }

  #applyJinja(key: string, content: unknown) {
    const renderHandlers = this._getJinjaHandlers(content);
    const handler = renderHandlers[key];

    if (handler) {
      // CF5 - issue (critical) resolved - an exception inside a render handler
      // propagated into the WebSocket message callback; log it instead of
      // crashing the card
      try {
        handler();
      } catch (error) {
        this._log?.error(`Jinja - render failed for ${key}:`, error);
      }
    } else {
      console.error(`Jinja - Unknown case: ${key}`);
    }
  }

  _refreshBarEffect(content: unknown) {
    this._log?.debug('📎 HACore._refreshBarEffect():', { content });
    // CF5 - issue (critical) resolved - render_template returns native types: a
    // template yielding a list (e.g. {{ ['glass'] }}) crashed on .split()
    const jinjaEffect = (is.array(content) ? content : String(content ?? '').split(',')).map((s: unknown) =>
      String(s).trim(),
    );
    this._handleBarEffect(jinjaEffect);
  }

  // ─── TEMPLATE PROCESSING ──────────────────────────────────────────────────

  get _wsInitialized(): boolean {
    return Boolean(
      this._resourceManager?.has(CARD.network.disconnected) && this._resourceManager?.has(CARD.network.ready),
    );
  }

  _unwatchWebSocket() {
    if (!this._resourceManager) return;
    this._resourceManager.remove(CARD.network.disconnected);
    this._resourceManager.remove(CARD.network.ready);
  }

  _watchWebSocket() {
    const { hass } = this;
    if (!this._resourceManager || !hass) return; // ISSUE 87
    this._unwatchWebSocket();
    this._resourceManager.addEventListener(
      hass.connection,
      'disconnected',
      () => {
        this._log?.debug('🔌 WebSocket disconnected');
        const templates = this.validJinjaFields;
        for (const key of Object.keys(templates)) {
          this._resourceManager?.remove(`template-${key}`);
        }
        this.#templateSignatures.clear(); // connection lost — all subscriptions are dead server-side
      },
      { passive: true },
      CARD.network.disconnected,
    );

    this._resourceManager.addEventListener(
      hass.connection,
      'ready',
      () => {
        this._log?.debug('🔁 WebSocket ready — reprocessing templates');
        this._ensureResourceManager();
        this._processJinjaFields();
      },
      { passive: true },
      CARD.network.ready,
    );
  }

  _validateProcessJinjaFields(): boolean {
    // hasStandardEntityError is ViewBase-only (undefined, harmlessly, on the
    // template views - which have no single "standard entity" concept to
    // begin with).
    return (
      Boolean(this._resourceManager) &&
      !(this._cardView.config?.entity && (this._cardView as ViewBase).hasStandardEntityError)
    );
  }

  _processJinjaFields() {
    if (!this._validateProcessJinjaFields()) {
      this._log?.debug('❌ Jinja processing skipped - validation failed');
      return;
    }

    this._log?.debug('✅ Processing Jinja fields');

    this._resourceManager?.throttleDebounce(
      () => {
        const templates = this.validJinjaFields;
        this.#cleanupOrphanTemplates(templates);
        for (const [key, template] of Object.entries(templates)) {
          if (is.nonEmptyString(template)) this._subscribeToTemplate(key, template);
        }
      },
      300,
      'jinjaProcess',
    );
  }

  // CF5 - issue (perf) resolved - a Jinja field removed from the config left
  // its subscription alive (pushing results into a DOM that no longer expects
  // them) until disconnect; drop subscriptions whose key is no longer
  // configured
  #cleanupOrphanTemplates(templates: Record<string, string>) {
    for (const subscriptionKey of [...this.#templateSignatures.keys()]) {
      const key = subscriptionKey.slice('template-'.length);
      if (!is.nonEmptyString(templates[key])) {
        this._resourceManager?.remove(subscriptionKey);
        this.#templateSignatures.delete(subscriptionKey);
      }
    }
  }

  _getTemplateContext(): { entity?: string } {
    const entity = this._cardView?.config?.entity;
    return entity ? { entity } : {};
  }

  async _subscribeToTemplate(key: string, template: string, force = false) {
    this._log?.debug('📎 HACore._subscribeToTemplate:', { key, template });
    const subscriptionKey = `template-${key}`;

    const { hass } = this;
    if (!hass?.connection?.connected) {
      this._log?.debug(`[Template ${key}] WebSocket not connected, skipping subscription.`);
      return;
    }
    this._log?.debug('network ok...');

    // Add null check right before using _resourceManager
    if (!this._resourceManager) {
      this._log?.debug(`[Template ${key}] ResourceManager is null, skipping subscription.`);
      return;
    }

    // CF5 - issue (perf) resolved - subscriptions are push-based: skip when an
    // identical one is live or in-flight. Reserving the signature before the
    // await also fixes a race where two overlapping calls created a duplicate
    // (orphan) subscription. `force` (see _onAutoRefreshTick) bypasses this
    // dedup on purpose - HA push for a now()/utcnow() template does not repeat
    // every second on its own (issue #127), so ticking the countdown means
    // creating a fresh subscription with the same signature.
    const signature = `${template}\u0000${this._getTemplateContext().entity ?? ''}`;
    if (!force && this.#templateSignatures.get(subscriptionKey) === signature) {
      this._log?.debug(`[Template ${key}] Identical subscription live or in-flight, skipping.`);
      return;
    }
    this.#templateSignatures.set(subscriptionKey, signature);

    try {
      this._log?.debug('key:', key);
      this._log?.debug('template:', template);

      const unsub = await hass.connection.subscribeMessage(
        (msg: unknown) => this._renderJinja(key, (msg as { result: unknown }).result),
        {
          type: 'render_template',
          template, //template: template,
          variables: this._getTemplateContext(),
        },
      );

      // Check again after the async operation
      if (this.#templateSignatures.get(subscriptionKey) !== signature) {
        // A newer subscription attempt superseded this one while we awaited.
        unsub();
        return;
      }
      if (!this._resourceManager) {
        this._log?.debug(`[Template ${key}] ResourceManager became null during subscription, cleaning up.`);
        unsub(); // Clean up the subscription
        this.#templateSignatures.delete(subscriptionKey);
        return;
      } else if (!this.isConnected) {
        // DOM conn X
        unsub(); // Clean up the subscription
        this.#templateSignatures.delete(subscriptionKey);
        return;
      } else {
        this._resourceManager.remove(subscriptionKey);
        this._resourceManager.addSubscription(unsub, subscriptionKey);
      }
    } catch (error) {
      // Allow a retry on the next processing cycle.
      if (this.#templateSignatures.get(subscriptionKey) === signature) this.#templateSignatures.delete(subscriptionKey);
      this._log?.error(`Failed to subscribe to template ${key}:`, error);
    }
  }
}

/**
 * Extends HACore with entity rendering: icon, badge, shape, trend, hidden
 * components, standard fields, and Jinja badge handlers.
 *
 * Subclasses MUST implement: - _updateCSS() → apply dynamic CSS (percent,
 * colors, watermark)
 *
 * Subclasses MAY override: - _buildStyle() → CSS class pipeline (calls super
 * then adds entity-specific classes) - _updateDynamicElements() → DOM update
 * orchestration (icon, badge, shape, trend, CSS, Jinja) - _getStandardFields()
 * → static — returns [{className, value}] for text fields to render -
 * _hiddenComponents → static — extend the array to add card-type-specific hide
 * targets
 *
 * @abstract
 * @extends HACore
 */

class HABase extends HACore {
  static _baseClass: string = META.types.card.typeName;
  static _cardStructure: ObjStructure = new ObjStructure('card');
  static _hasDisabledBadge = false;
  static _hiddenComponents: { label: string; class?: string }[] = [
    CARD.style.dynamic.hiddenComponent.icon,
    CARD.style.dynamic.hiddenComponent.name,
    CARD.style.dynamic.hiddenComponent.secondary_info,
    CARD.style.dynamic.hiddenComponent.progress_bar,
  ];
  _trendIcons: Record<string, string> = {
    up: HA_CONTEXT.icons.chevronUpBox,
    down: HA_CONTEXT.icons.chevronDownBox,
    flat: HA_CONTEXT.icons.equalBox,
    error: HA_CONTEXT.icons.progressQuestion,
  };
  _icon: IconElement | null = null;
  _cardView: ViewCore = new CardView();
  // _actionHelper itself inherited from HACore (nullable there) - always
  // assigned unconditionally in the constructor below, for every HABase
  // instance.
  #jinjaStateBadge = { icon: false, color: false };
  // One cache per independent badge_icon/badge_color source - #repaintBadge
  // recomputes and repaints from all three on every push from either field,
  // never a one-off snapshot from whichever field last pushed. Without this
  // a static badge_color could keep the badge visible after badge_icon's
  // own icon/color had gone empty (same fix shape as _repaintStatusLabel).
  #badgeIconValue: string | null = null;
  #badgeIconObjectColor: string | null = null;
  #badgeColorFieldValue: string | null = null;
  #lastMessage: { content: string; sev: string } | null = null;
  // status_label's last-resolved state; null text = no push landed yet.
  // Cached so _repaintStatusLabel can refresh the pill's bar color on every
  // _updateDynamicElements pass, not just when a Jinja push lands - on
  // Template, barColor only settles once percent's own push arrives, and
  // status_label may never push again after that, so without this cache the
  // pill could get stuck on whichever color won that one race.
  _lastStatusLabelText: string | null = null;
  _lastStatusLabelColor: string | null = null;

  // ─── LIFECYCLE METHODS ────────────────────────────────────────────────────

  static get _loggedMethods() {
    return [
      ...super._loggedMethods,
      '_showIcon',
      '_handleImgIcon',
      '_handleStateIcon',
      '_createStateObjIcon',
      '_cleanupImgIcon',
      '_showBadge',
      '_enableBadge',
      '_setBadgeIconColor',
      '_setBadgeIcon',
      '_setBadgeColor',
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
  // Without this, a config that removed badge_icon/status_label left the
  // old resolved state around after render() (a phantom badge/pill), with
  // no future push left to correct it since the subscription is gone too.
  setConfig(config: LovelaceConfig) {
    super.setConfig(config);
    this.#jinjaStateBadge = { icon: false, color: false };
    this.#badgeIconValue = null;
    this.#badgeIconObjectColor = null;
    this.#badgeColorFieldValue = null;
    this._lastStatusLabelText = null;
    this._lastStatusLabelColor = null;
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
  }

  // disconnectedCallback() {}

  // custom-card-helpers' own LovelaceCard interface types this as
  // `number | Promise<number>` - async here aligns with that contract (and,
  // as with getStubConfig, turns any future throw into a rejected promise
  // instead of a synchronous exception during HA's own layout pass over
  // every card on a dashboard).
  // skipcq: JS-0116 -- async is intentional, no await by design.
  async getCardSize(): Promise<number | undefined> {
    if (![META.types.card.typeName, META.types.template.typeName].includes(this.baseClass)) return undefined;
    const cardSize = this._cardView.cardSize;
    this._log?.debug('getCardSize: ', cardSize);
    return cardSize;
  }

  // Kept for HA < 2024.11 (hui-card.ts falls back to this, migrated through
  // migrateLayoutToGridOptions, when getGridOptions isn't implemented -
  // mirrors how lovelace-mushroom's MushroomBaseCard keeps both).
  getLayoutOptions() {
    if (![META.types.card.typeName, META.types.template.typeName].includes(this.baseClass)) return undefined;
    const cardLayoutOptions = this._cardView.cardLayoutOptions;
    this._log?.debug('getLayoutOptions: ', cardLayoutOptions);
    return cardLayoutOptions;
  }

  // Current HA API (2024.11+): same numbers as getLayoutOptions, expressed on
  // the 12-column grid instead of the older 4-column one - see
  // CARD.layout.gridColumnMultiplier.
  getGridOptions() {
    if (![META.types.card.typeName, META.types.template.typeName].includes(this.baseClass)) return undefined;
    const { grid_rows, grid_min_rows, grid_max_rows, grid_columns, grid_min_columns, grid_max_columns } =
      this._cardView.cardLayoutOptions;
    const multiplier = CARD.layout.gridColumnMultiplier;
    const gridOptions = {
      rows: grid_rows,
      min_rows: grid_min_rows,
      columns: grid_columns * multiplier,
      min_columns: grid_min_columns * multiplier,
      // undefined (the default outside density: compact) means "no ceiling" -
      // left out entirely rather than sent as columns/rows: undefined, so it
      // reads the same to HA as never having been set at all.
      ...(grid_max_rows !== undefined ? { max_rows: grid_max_rows } : {}),
      ...(grid_max_columns !== undefined ? { max_columns: grid_max_columns * multiplier } : {}),
    };
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
    this._icon = null;
  }

  // ─── ERROR MESSAGE MANAGEMENT ─────────────────────────────────────────────

  _manageErrorMessage(): boolean {
    // msg/isAvailable/hasValidatedConfig are ViewBase-only (never present on
    // the template views) - see _cardView's own declaration above.
    const cardView = this._cardView as ViewBase;
    if (cardView.msg && (is.nullish(this._cardView.entity) || (cardView.isAvailable && !cardView.hasValidatedConfig))) {
      this._renderMessage(cardView.msg);
      return true;
    }
    this.#lastMessage = null;
    return false;
  }

  /**
   * Displays an error alert with the provided message.
   *   'info', 'warning', 'error'
   */
  _renderMessage(msg: { content: string; sev: string }) {
    if (msg === this.#lastMessage) return;
    this.#lastMessage = msg;

    // ha-alert exists ?
    let alert = this._shadow.querySelector('ha-alert');

    if (!alert) {
      alert = document.createElement('ha-alert');
      this._shadow.replaceChildren(alert);
    }

    // update the message
    alert.setAttribute('alert-type', msg.sev); // IMPORTANT: attribut
    alert.textContent = msg.content;
  }

  // ─── CARD BUILDING ────────────────────────────────────────────────────────

  get _structureOptions(): StructureOptions {
    return {
      ...super._structureOptions,
      layout: this._cardView.config.layout,
      barSingleLine: this._cardView.config.bar_single_line,
      trendIndicator: this._cardView.config.trend_indicator,
      hasLabel:
        is.nonEmptyString(this._cardView.config.status_label?.jinja) ||
        this._cardView.config.alert_when?.highlight === 'label',
      multiline: Boolean(this._cardView.config.multiline),
    };
  }

  _buildStyle() {
    super._buildStyle(); // _handleWatermarkClasses, _handleBarEffect
    this._addBaseClasses();
    this._addBaseParameter();
    this._applyConditionalClasses();
    this._handleHiddenComponents();
  }

  _addBaseClasses() {
    super._addBaseClasses();
    this._dom.addClass(
      CARD.htmlStructure.card.element,
      this.baseClass.includes('badge') ? 'progress-badge' : null,
      this._cardView.config.bar_position,
      this._cardView.hasReversedSecondaryInfoRow ? 'row-reverse' : null,
      this._cardView.config.text_shadow ? 'text-shadow' : null,
      this._cardView.config.status_label?.position === 'left' ? 'label-left' : null,
    );
  }

  _addBaseParameter() {
    const cardKey = CARD.htmlStructure.card.element;
    const config = this._cardView.config;

    // On a badge, `min_width: N%` is redefined as N% of the default badge
    // width (var(--ha-badge-size, 130px)), not the CSS % (% of the parent,
    // which overflows past 100% - see issue #124). Cards/templates keep the
    // standard CSS %, and any non-% value passes through unchanged.
    const isBadge = this.baseClass.includes('badge');
    const minWidth =
      isBadge && typeof config.min_width === 'string' && /^\s*-?[\d.]+%\s*$/.test(config.min_width)
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
      [CARD.style.dynamic.frameless.class, this._cardView.config.frameless ?? false],
      [CARD.style.dynamic.marginless.class, this._cardView.config.marginless ?? false],
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
    // `jinjaIconAnimationActive === null` used to mean both "not in jinja
    // mode" and "no push yet", falling back to autoDetect either way.
    // hasJinjaIconAnimation checks the *config*, not the cache, so jinja
    // mode disengages autoDetect immediately, default false until the push.
    const override = this._cardView.jinjaIconAnimationActive;
    const active = (autoDetect: () => boolean): boolean =>
      this._cardView.hasJinjaIconAnimation ? (override ?? false) : autoDetect();
    return new Map([
      ['icon-anim-spin', effect === 'spin' && active(() => this._cardView.isEntityActive)],
      ['icon-anim-pulse', effect === 'pulse' && active(() => this._cardView.isEntityActive)],
      ['icon-anim-bounce', effect === 'bounce' && active(() => this._cardView.isEntityActive)],
      ['icon-anim-shake', effect === 'shake' && active(() => this._cardView.isEntityActive)],
      ['icon-anim-ping', effect === 'ping' && active(() => this._cardView.isEntityActive)],
      ['icon-anim-reveal', effect === 'reveal' && active(() => this._cardView.isEntityActive)],
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

  get _alertStyle(): Map<string, boolean> {
    return new Map([
      ['alert-active', this._cardView.isAlertActive],
      [
        'alert-background',
        this._cardView.isAlertActive && this._cardView.config.alert_when?.highlight === 'background',
      ],
      ['alert-label', this._cardView.isAlertActive && this._cardView.config.alert_when?.highlight === 'label'],
      ['alert-anim-blink', this._cardView.isAlertActive && this._cardView.alertAnimation === 'blink'],
      ['alert-anim-ping', this._cardView.isAlertActive && this._cardView.alertAnimation === 'ping'],
    ]);
  }

  #toggleClasses(style: Map<string, boolean>) {
    style.forEach((condition, className) => {
      this._dom.toggleClass(CARD.htmlStructure.card.element, className, condition);
    });
  }

  _applyStaticClasses() {
    this.#toggleClasses(this._staticStyle);
  }

  _applyIconAnimationClasses() {
    this.#toggleClasses(this._iconAnimationStyle);
  }

  _applyAlertClasses() {
    this.#toggleClasses(this._alertStyle);
    this._applyAlertLabel();
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

  _handleHiddenComponents(jinjaContent: unknown = null) {
    if (jinjaContent === null && is.jinja(this._cardView.config.hide)) return;

    if (jinjaContent !== null) {
      // CF5 - issue (critical) resolved - a hide Jinja template yielding a
      // native list crashed on .split(); normalize list and string results
      // alike. Written into the view's own resolved-hide cache (not just
      // used locally here) so every other hasComponentHiddenFlag() consumer
      // (secondaryInfoMain's value/unit text, minGridRows) sees the same
      // Jinja-resolved truth instead of each re-deriving it from
      // config.hide directly, which only ever worked for the static array
      // shape.
      const items = (is.array(jinjaContent) ? jinjaContent : String(jinjaContent).split(','))
        .map((s: unknown) => String(s).trim())
        .filter(Boolean);
      this._cardView.setResolvedHide(items);
    }

    (this.constructor as typeof HABase)._hiddenComponents.forEach((component) => {
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
    this._processJinjaFields();
    this._processStandardFields();
  }

  // ─── Update Trend ─────────────────────────────────────────────────────────
  _updateTrend() {
    if (!this._cardView.config.trend_indicator) return;

    // ViewBase.getTrend() overrides ViewCore's own (currentPercent: number)
    // signature with a no-arg one that supplies its own current percent -
    // the template views don't override it and have no trend concept to
    // begin with, so this only ever meaningfully runs for ViewBase-family
    // instances.
    this._dom.setAttribute(
      CARD.htmlStructure.elements.trendIndicator.icon.class,
      CARD.style.icon.badge.default.attribute,
      this._trendIcons[(this._cardView as ViewBase).getTrend()],
    );
  }

  // ─── CSS MANAGEMENT ───────────────────────────────────────────────────────

  _updateCSS() {
    throw new Error(`${this.constructor.name} must implement _updateCSS()`);
  }

  // ─── ICON MANAGEMENT ──────────────────────────────────────────────────────

  _createImgIcon(altText: string, className = 'custom-icon-img'): HTMLImageElement {
    this._log?.debug('📎 HABase._createImgIcon():', { altText, className });

    const img = document.createElement('img');
    img.className = className;
    img.decoding = 'async';
    img.alt = altText;
    return img;
  }

  _handleImgIcon(stateObj: EntityState | null, srcPicture: string) {
    this._log?.debug('📎 HABase._handleImgIcon():', { stateObj, srcPicture });

    const pictureAlt = (stateObj?.attributes?.friendly_name as string) || 'Entity picture';
    const iconContainer = this._dom.get(CARD.htmlStructure.elements.icon.class);
    if (!iconContainer) return;

    if (this._icon?.tagName !== 'IMG') {
      this._icon?.remove();
      this._icon = this._createImgIcon(pictureAlt);
      iconContainer.replaceChildren(this._icon);
      this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.iconAndShape.icon.size.var, '36px');
    }

    const img = this._icon as HTMLImageElement;
    img.src = srcPicture;
    img.alt = pictureAlt;
  }

  _createStateObjIcon(
    stateObj: EntityState | null,
    curIcon: string | null,
    hasIconOverride: boolean,
    hasPicture: boolean,
  ): unknown {
    this._log?.debug('📎 HABase._createStateObjIcon():', { stateObj, curIcon, hasIconOverride, hasPicture });

    if (!stateObj) {
      return this.isConnected
        ? {
            entity_id: 'sensor.dummy',
            state: 'unknown',
            attributes: {
              icon: curIcon || HA_CONTEXT.icons.helpCircleOutline,
              friendly_name: 'Unknown Entity',
            },
          }
        : null;
    }

    if (!hasIconOverride && !hasPicture) {
      return stateObj;
    }
    if (hasIconOverride) {
      return {
        entity_id: 'sensor.for_picture',
        state: 'on',
        attributes: {
          icon: curIcon,
        },
      };
    }

    const attributes = { ...stateObj.attributes };
    if (hasPicture && !hasIconOverride) {
      delete attributes.entity_picture;
    }

    return {
      ...stateObj,
      attributes,
    };
  }

  _cleanupImgIcon() {
    if (this._icon?.tagName === 'IMG') {
      this._icon.remove();
      this._icon = null;
    }
  }

  _handleStateIcon(iconContainer: HTMLElement, stateObjIcon: unknown) {
    this._log?.debug('📎 HABase._handleStateIcon():', { iconContainer, stateObjIcon });

    this._cleanupImgIcon();

    if (!this._icon) {
      this._icon = document.createElement('ha-state-icon') as HTMLElement & {
        hass: HomeAssistant | null;
        stateObj: unknown;
      };
      iconContainer.replaceChildren(this._icon);
    }

    const stateIcon = this._icon as HTMLElement & { hass: HomeAssistant | null; stateObj: unknown };
    stateIcon.hass = this.hass;
    stateIcon.stateObj = stateObjIcon;
  }

  _showIcon() {
    if (!this._cardView) return;

    // icon exists on every concrete view (ViewBase's own getter for
    // CardView/BadgeView/FeatureView, a plain field on CardTemplateView/
    // BadgeTemplateView), just not on the shared ViewCore base itself.
    const { entity: entityId, icon: curIcon } = this._cardView as ViewCore & { icon: string | null };
    const stateObj = this._hassProvider.getEntityStateObj(entityId as string);
    const hasIconOverride = is.nonEmptyString(curIcon);
    const srcPicture = this._hassProvider.getEntityProp(entityId as string, 'entity_picture');
    const hasPicture = is.nonEmptyString(srcPicture);

    const iconContainer = this._dom.get(CARD.htmlStructure.elements.icon.class);
    if (!iconContainer) {
      this._log?.error('Icon container not found for _showIcon.');
      return;
    }

    if (hasPicture && !hasIconOverride) {
      this._handleImgIcon(stateObj, srcPicture);
      return;
    }

    const stateObjIcon = this._createStateObjIcon(stateObj, curIcon, hasIconOverride, hasPicture);
    if (stateObjIcon) this._handleStateIcon(iconContainer, stateObjIcon);
  }

  // ─── SHAPE MANAGEMENT ─────────────────────────────────────────────────────

  _manageShape() {
    this._dom.toggleClass(
      CARD.htmlStructure.card.element,
      CARD.style.dynamic.hiddenComponent.shape.class,
      !this._cardView.hasVisibleShape || this.hasDisabledIconTap,
    );
  }

  // ─── BADGE MANAGEMENT ─────────────────────────────────────────────────────

  /**
   * Displays a badge (default info)
   */
  _showBadge() {
    if ((this.constructor as typeof HABase)._hasDisabledBadge) return;
    // badgeInfo is ViewBase-only (never present on the template views).
    const badgeInfo = (this._cardView as ViewBase).badgeInfo;
    if (badgeInfo) {
      this._enableBadge(true);
      this._setBadgeIconColor(badgeInfo.icon, badgeInfo.color, badgeInfo.backgroundColor);
      return;
    }
    // config.badge_icon/-color is the raw, unevaluated template source
    // (always non-empty once configured), not whether it's CURRENTLY
    // showing anything. Checking raw presence used to force the badge back
    // on every refresh even while the Jinja condition was false.
    // #jinjaStateBadge (kept current via _updateBadgeVisibility) is the only
    // real source of truth here.
    this._updateBadgeVisibility();
  }

  _enableBadge(isBadgeEnable: boolean) {
    this._log?.debug('📎 HABase._enableBadge():', { isBadgeEnable });

    this._dom.toggleClass(
      CARD.htmlStructure.card.element,
      `${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class}`,
      isBadgeEnable,
    );
  }

  _setBadgeIconColor(icon: string, color: string, backgroundColor: string) {
    this._log?.debug('📎 HABase._setBadgeIconColor():', { icon, color, backgroundColor });

    this._setBadgeIcon(icon);
    this._setBadgeColor(color, backgroundColor);
  }

  _setBadgeIcon(icon: string) {
    this._dom.setAttribute(CARD.htmlStructure.elements.badge.icon.class, CARD.style.icon.badge.default.attribute, icon);
  }

  _setBadgeColor(color: string, backgroundColor: string) {
    this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.badge.backgroundColor.var, backgroundColor);
    this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.badge.color.var, color);
  }

  // setStyle() never unsets a value on its own once written (see
  // _applyDivergingBarStackCSS's own comment) - #repaintBadge below needs
  // this whenever neither color source (badge_icon's own object,
  // badge_color) currently applies, so a color that was set a moment ago
  // doesn't stay stuck once nothing provides one anymore.
  _clearBadgeColor() {
    this._dom.removeStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.badge.backgroundColor.var);
    this._dom.removeStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.badge.color.var);
  }

  // ─── JINJA TEMPLATE RENDERING ─────────────────────────────────────────────

  _getJinjaBadgeState(): string {
    const hasIcon = this.#jinjaStateBadge.icon;
    const hasColor = this.#jinjaStateBadge.color;

    if (hasIcon && hasColor) return 'both';
    if (hasIcon) return 'icon';
    if (hasColor) return 'color';
    return 'off';
  }

  _updateBadgeVisibility() {
    const state = this._getJinjaBadgeState();
    const shouldShow = state !== 'off';
    this._enableBadge(shouldShow);
  }

  _renderBadgeIcon(content: unknown) {
    this._log?.debug('📎 HABase._renderBadgeIcon():', { content });
    // A native dict return (docs/configuration.md's Jinja "Returning a
    // native type") - `{{ {'icon': 'mdi:...', 'color': '#ff0000'} }}` lets
    // one template drive both icon and color, instead of needing a separate
    // badge_color Jinja alongside it. A plain string still works as before
    // (icon only); either key can be left out of the object.
    const iconRaw = is.plainObject(content) ? content.icon : content;
    const colorRaw = is.plainObject(content) ? content.color : undefined;
    this.#badgeIconValue = is.nonEmptyString(iconRaw) && iconRaw.includes(HA_CONTEXT.icons.prefix) ? iconRaw : null;
    this.#badgeIconObjectColor = is.nonEmptyString(colorRaw) ? colorRaw : null;
    this.#repaintBadge();
  }

  _renderBadgeColor(content: unknown) {
    this._log?.debug('📎 HABase._renderBadgeColor():', { content });
    this.#badgeColorFieldValue = is.nonEmptyString(content) ? content : null;
    this.#repaintBadge();
  }

  // Shared by _renderBadgeIcon/_renderBadgeColor - recomputes the whole
  // badge (icon + color) from all three caches on every push, instead of
  // each handler only touching its own half and leaving the other stale.
  // #badgeIconObjectColor wins over #badgeColorFieldValue when both are set
  // (same precedence as theme over color/bar_color); the DOM state is
  // explicitly cleared when a source resolves null, so it can't leave the
  // OTHER source's earlier value stuck on screen.
  #repaintBadge() {
    if (!is.nullish((this._cardView as ViewBase).badgeInfo)) return; // alert -> cancel custom badge
    const icon = this.#badgeIconValue;
    const color = this.#badgeIconObjectColor ?? this.#badgeColorFieldValue;
    this.#jinjaStateBadge.icon = icon !== null;
    this.#jinjaStateBadge.color = color !== null;
    this._setBadgeIcon(icon ?? '');
    if (color !== null) {
      this._setBadgeColor('var(--white-color)', ThemeManager.adaptColor(color) as string);
    } else {
      this._clearBadgeColor();
    }
    this._updateBadgeVisibility();
  }

  // ─── STD FIELDS PROCESSING ────────────────────────────────────────────────
  static _getStandardFields(_cardView?: ViewCore): { className: string; value: string | null }[] {
    return [];
  }

  // `immediate`: bypasses DOMHelper's RAF batching (setTextNow instead of
  // setText), used by _onAutoRefreshTick - a RAF callback's own cadence isn't
  // aligned to _startAutoRefresh's wall-clock tick, so a ticking countdown's
  // text would land up to ~16ms off from one paint to the next otherwise.
  // Everywhere else keeps the batched path.
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
    };
  }

  // Shared by EntityProgressBadge/EntityProgressTemplateBadge's own
  // _getJinjaHandlers overrides - a badge never has a badge of its own.
  // Static (no instance state) - called as HABase._stripBadgeHandlers(...).
  static _stripBadgeHandlers(handlers: Record<string, () => void>): Record<string, () => void> {
    delete handlers.badge_icon;
    delete handlers.badge_color;
    return handlers;
  }

  // watermark.low/.high jinja mode: shared by Card and Template (both have
  // `watermark` in schema, unlike min_value/max_value/alert_when which are
  // Card-only). Lives here so EntityProgressTemplateBase's own
  // _getJinjaHandlers can reuse it too.
  _renderWatermarkJinja(
    content: unknown,
    getJinja: (c: Config) => string | undefined,
    viewProp: 'jinjaWatermarkLow' | 'jinjaWatermarkHigh',
  ) {
    // Defensive: only apply while the option is still in { jinja: "..." }
    // mode - guards against a push arriving right as the user switches the
    // mode chips away from Jinja (mirrors _renderJinjaNumber's own guard).
    if (!is.nonEmptyString(getJinja(this._cardView.config))) return;
    const value = is.number(content) ? content : is.strictNumericString(content) ? Number(content) : null;
    if (value === this._cardView[viewProp]) return; // unchanged - skip the recompute below
    this._cardView[viewProp] = value;
    // Watermark position is resolved directly in _updateCSS
    // (_applyWatermarkCSS) from the view's own watermark getter.
    this._updateCSS();
  }

  // GitHub-label-style status pill, shared by `status_label` Jinja
  // (_renderLabel) and alert_when.highlight: 'label' (_applyAlertLabel).
  // background/border/text color follow GitHub's Primer recipe for issue
  // labels (ThemeManager.labelColorComponents). outline-color is a scratch
  // property, not a real style choice: assigning the raw color to it lets
  // the browser normalize it into rgb(...) for parsing, then it's removed.
  _paintLabel(text: string, color: string) {
    const key = CARD.htmlStructure.elements.label.class;
    this._dom.setText(key, text);
    const el = this._dom.get(key);
    if (!el || !text) return;
    el.style.setProperty('outline-color', color);
    const components = ThemeManager.labelColorComponents(getComputedStyle(el).outlineColor);
    el.style.removeProperty('outline-color');
    if (!components) return;
    const label = CARD.style.dynamic.label;
    el.style.setProperty(label.r.var, String(components.r));
    el.style.setProperty(label.g.var, String(components.g));
    el.style.setProperty(label.b.var, String(components.b));
    el.style.setProperty(label.h.var, String(components.h));
    el.style.setProperty(label.s.var, String(components.s));
    el.style.setProperty(label.l.var, String(components.l));
  }

  _renderLabel(content: unknown) {
    this._log?.debug('📎 HACore._renderLabel():', { content });
    // alert_when.highlight: 'label' owns the pill while configured this
    // way (see _applyAlertLabel) - a plain `label` Jinja alongside it would
    // otherwise fight over the same element on every refresh.
    if (this._cardView.config?.alert_when?.highlight === 'label') return;
    // Native dict return (docs/configuration.md's Jinja "Returning a native
    // type") - `{{ {'label': 'hot', 'color': '#ff0000'} }}` lets one
    // template drive both. `_lastStatusLabelColor` null = no override,
    // _repaintStatusLabel falls back to the bar's own color.
    if (is.plainObject(content)) {
      this._lastStatusLabelText = String(content.label ?? '').trim();
      // is.nonEmptyString, not is.string - an explicit but empty `color: ''`
      // must fall back too (adaptColor('') returns '' as-is, and _repaint
      // StatusLabel's own `?? fallbackColor` wouldn't have caught that, only
      // a real null/undefined).
      this._lastStatusLabelColor = ThemeManager.adaptColor(is.nonEmptyString(content.color) ? content.color : null);
    } else {
      this._lastStatusLabelText = String(content ?? '').trim();
      this._lastStatusLabelColor = null;
    }
    this._repaintStatusLabel();
  }

  // Called again from _updateDynamicElements (HABase's own override, the
  // only one) on every refresh, and from _managePercent/color/bar_color's
  // own pushes (cards.ts) - not just from _renderLabel's own push above. See
  // _lastStatusLabelText's own comment for why the pill needs repainting
  // outside a status_label push too.
  _repaintStatusLabel() {
    if (this._cardView.config?.alert_when?.highlight === 'label') return;
    if (this._lastStatusLabelText === null) return;
    // status_label.color_source picks which of the two the pill falls back
    // to when its own `jinja` doesn't return an explicit {label, color} -
    // 'bar' by default (see schema.ts's own comment on why).
    const fallbackColor =
      this._cardView.config?.status_label?.color_source === 'icon' ? this._cardView.iconColor : this._cardView.barColor;
    const color = this._lastStatusLabelColor ?? fallbackColor ?? CARD.style.color.default;
    this._paintLabel(this._lastStatusLabelText, color);
  }

  // Only shown while the alert is active (like the border/background
  // highlight modes) - alert_when.label is the user's own fixed text (not
  // Jinja, see schema.ts), so there's no per-tick resolution to await, this
  // can run synchronously off isAlertActive/alertAnimation, already
  // recomputed by every _applyAlertClasses call.
  _applyAlertLabel() {
    const alert = this._cardView.config?.alert_when;
    if (alert?.highlight !== 'label') return;
    const text = this._cardView.isAlertActive ? String(alert.label ?? '').trim() : '';
    this._paintLabel(text, ThemeManager.adaptColor(alert.color ?? null) ?? CARD.style.color.default);
  }

  _renderIconAnimationWhen(content: unknown) {
    this._log?.debug('📎 HACore._renderIconAnimationWhen():', { content });
    // Defensive: only apply while icon_animation is still in { effect, jinja }
    // mode - guards against a push arriving right as the user switches modes
    // (mirrors EntityProgressCardBase._renderJinjaNumber).
    const iconAnimation = this._cardView.config?.icon_animation;
    if (!(is.plainObject(iconAnimation) && is.nonEmptyString((iconAnimation as { jinja?: string }).jinja))) return;
    this._cardView.jinjaIconAnimationActive = content;
    // Every other Jinja setter re-applies its own changed layer - this one
    // didn't, so the value only took effect once something else re-ran
    // _applyIconAnimationClasses. Template has no incidental refresh to
    // piggyback on, so the animation never started there (issue #125).
    this._applyIconAnimationClasses();
  }

  static #BREAK_RE = /<br\s*\/?>/gi;

  // Splits Jinja-sourced HTML at the first <br> - shared by _renderCustomInfo
  // and _renderSecondary. `multiline` off: any <br> is stripped. On: only
  // the first is kept, anything past a 2nd <br> is discarded. A tag
  // straddling the break is re-wrapped on both halves via #domSplitOnce's
  // ancestor cloning, not a naive string split (would orphan a tag).
  _splitAtFirstBreak(content: unknown): [string, string | null] {
    const html = String(content);
    if (!this._cardView.config.multiline) return [html.replace(HABase.#BREAK_RE, ''), null];

    const [before, afterRaw] = HABase.#domSplitOnce(html);
    if (afterRaw === null) return [before, null];
    const [after] = HABase.#domSplitOnce(afterRaw); // drop anything from a 2nd <br> onward
    return [before, after];
  }

  // Single split at the first <br> element node, tree-aware: everything before
  // it goes to `before`, everything after to `after`, each re-wrapped in a
  // shallow clone of every ancestor it passed through so nested tags keep their
  // attributes on both halves. Returns [html, null] when there is no <br> at
  // all.
  static #domSplitOnce(html: string): [string, string | null] {
    // Own non-global literal on purpose: #BREAK_RE carries the /g flag for the
    // .replace() call above, and .test() on a /g regex mutates lastIndex, which
    // would corrupt the *next* call's match position (this runs twice per
    // multiline render, back to back, for the 2nd-<br> check).
    if (!/<br\s*\/?>/i.test(html)) return [html, null];

    const root = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html').body;
    let found = false;
    const split = (node: Node): [Node, Node] => {
      const before = node.cloneNode(false);
      const after = node.cloneNode(false);
      for (const child of Array.from(node.childNodes)) {
        if (found) {
          after.appendChild(child.cloneNode(true));
        } else if (child.nodeName === 'BR') {
          found = true;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const [childBefore, childAfter] = split(child);
          before.appendChild(childBefore);
          if (found) after.appendChild(childAfter);
        } else {
          before.appendChild(child.cloneNode(true));
        }
      }
      return [before, after];
    };

    const [before, after] = split(root);
    return [(before as Element).innerHTML, (after as Element).innerHTML];
  }

  // ─── getStubConfig -> select entity ───────────────────────────────────────
  // Called directly by HA's own card-picker/gallery to build the preview for
  // this card type - an external caller we don't control, unlike our normal
  // render path where hass is already known to be populated by the time
  // anything reads it. hass?.states isn't optional in the HomeAssistant
  // type, but that's a compile-time annotation, not a runtime guarantee
  // from a caller outside this codebase.
  static getStubEntity(hass: HomeAssistant): string {
    return (
      Object.keys(hass?.states ?? {}).find((id) => /^(sensor\..*battery|fan\.|cover\.|light\.)/i.test(id)) ||
      'sensor.temperature'
    );
  }
}

export { HACore };
export { HABase };
