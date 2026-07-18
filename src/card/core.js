/*
 * HACore and HABase: the base classes implementing the shared
 * card/badge/feature lifecycle (setConfig, render, hass updates, auto-refresh)
 * that every concrete card type extends.
 */

import { VERSION, META, CARD_CONTEXT, devName, HA_CONTEXT, CARD } from '../utils/parameters.js';
import { CARD_CSS, getSharedStyleSheet } from '../utils/styles.js';
import { is } from '../utils/common-checks.js';
import { initLogger } from '../utils/log.js';
import { ObjStructure, ThemeManager, ChangeTracker } from './value-helpers.js';
import { HassProviderSingleton } from '../utils/hass-provider.js';
import { CardView, FeatureView } from './view.js';
import { ResourceManager, DOMHelper, ActionHelper } from './dom-helpers.js';

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
 * setConfig() - Hass state tracking and change detection - DOM rendering
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
  static _baseClass = META.types.feature.typeName;
  static _cardStructure = new ObjStructure('feature');
  static _cardStyle = CARD_CSS;
  static _cardElement = CARD.htmlStructure.card.element;
  _debug = CARD_CONTEXT.debug.card;
  _log = null;
  _resourceManager = null;
  _cardView = new FeatureView();
  _dom = new DOMHelper();
  _hassProvider = HassProviderSingleton.getInstance();
  _changeTracker = new ChangeTracker();
  #isRendered = false;
  // CF5 - issue (perf) resolved - render_template subscriptions are push-based;
  // tracking the signature (template + entity variable) of each live/in-flight
  // subscription lets us skip the systematic unsubscribe/resubscribe cycle on
  // every refresh
  #templateSignatures = new Map();

  // ─── LIFECYCLE METHODS ===
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
    this._log = initLogger(this, this._debug, this.constructor._loggedMethods);
    this.attachShadow({ mode: CARD.config.shadowMode });
  }

  static getConfigElement() {
    const metaType = Object.values(META.types).find((t) => t.typeName === this._baseClass);
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
  }

  disconnectedCallback() {
    this._resourceManager?.cleanup();
    this._resourceManager = null;
    this.#templateSignatures.clear(); // subscriptions died with cleanup() — allow resubscription on reconnect
  }

  _ensureResourceManager() {
    if (!this._resourceManager) this._resourceManager = new ResourceManager();
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  /**
   * Updates the component's configuration and triggers static changes.
   */
  setConfig(config) {
    this._log.debug('📎 HACore.setConfig()', config);

    if (!config) throw new Error('setConfig: invalid config');
    if (this.isRendered) this.reset(); // Card/Badge editor

    this._cardView.config = { ...config };
    this._registerWatchedEntities(config);
    this.render(); // re-build the card

    if (this.hass) this._handleHassUpdate(); // Card/Badge editor
  }

  _registerWatchedEntities(config) {
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
  set hass(hass) {
    this._log.debug('👉 HACore.set hass()');
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

  get hass() {
    return this._hassProvider.hass;
  }

  _handleHassUpdate() {
    throw new Error(`${this.constructor.name} must implement _handleHassUpdate()`);
  }

  refresh() {
    this._cardView.refresh(this.hass);
    this._updateDynamicElements();
  }

  // ─── AUTO-REFRESH MANAGEMENT ──────────────────────────────────────────────
  // Shared by every subclass (cards, badges, features): a running timer
  // entity doesn't push a new hass state every second, so this simulates the
  // tick locally. Lives here (not HABase) so EntityProgressFeatures - which
  // extends HACore directly, not HABase - gets it too.

  _startAutoRefresh() {
    if (!this._resourceManager) return;
    this._resourceManager.setInterval(
      () => {
        this.refresh(this.hass);
        if (!this._cardView.isActiveTimer) {
          this._stopAutoRefresh();
        }
      },
      this._cardView.refreshSpeed,
      'autoRefresh',
    );
  }

  _stopAutoRefresh() {
    if (this._resourceManager) this._resourceManager.remove('autoRefresh');
  }

  get isRendered() {
    return this.#isRendered;
  }

  reset() {
    this._dom.toggleClass(CARD.htmlStructure.card.element, 'transition-ready', false); // retire AVANT purge
    this.#isRendered = false;
    this._dom.destroy();
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = ''; // purge le contenu shadow DOM
    }
  }

  get cardStyle() {
    return this.constructor._cardStyle;
  }

  get baseClass() {
    return this.constructor._baseClass;
  }

  get cardElement() {
    return this.constructor._cardElement;
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
    this.shadowRoot.replaceChildren(...(element.style ? [element.style, element.card] : [element.card]));
    this._storeDOM();
    requestAnimationFrame(() => {
      this._dom.addClass(CARD.htmlStructure.card.element, 'transition-ready');
    });
  }

  get _structureOptions() {
    return {
      barType: this._cardView.config.center_zero ? 'centerZero' : 'default', // ─── true
      barPosition: this._cardView.config.bar_position,
    };
  }

  _createCardElements() {
    // Preferred path: adopt the shared constructed sheet (parsed once for all
    // instances). Fallback path (older Firefox/Safari, see
    // getSharedStyleSheet): a per-instance <style> element, as before.
    let style = null;
    const sharedSheet = getSharedStyleSheet(this.cardStyle);
    if (sharedSheet) {
      if (!this.shadowRoot.adoptedStyleSheets.includes(sharedSheet)) {
        this.shadowRoot.adoptedStyleSheets = [...this.shadowRoot.adoptedStyleSheets, sharedSheet];
      }
    } else {
      style = document.createElement(CARD.style.element);
      style.textContent = this.cardStyle;
    }

    const card = document.createElement(this.cardElement);
    this._dom.destroy();
    this._dom.register(CARD.htmlStructure.card.element, card);
    this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.progressBar.value.var, 0);
    if (this._cardView.hasClickableCard || this._cardView.hasClickableIcon) {
      Object.entries(CARD.htmlStructure.card.extraAttr).forEach(([key, value]) => {
        this._dom.setAttribute(CARD.htmlStructure.card.element, key, value);
      });
    }
    this._buildStyle();
    // Cloned from the per-options <template> cache; _structureOptions is read
    // fresh here so a setConfig that changes the structure picks the right
    // template.
    card.replaceChildren(this.constructor._cardStructure.clone(this._structureOptions));

    return { style, card };
  }

  // CF5 - issue (medium) resolved - _storeDOM registered every element under
  // its first CSS class: silent collisions were possible and the map carried
  // dead weight. Only the elements actually driven through the DOMHelper are
  // registered now.
  static get _domKeys() {
    return [
      CARD.htmlStructure.elements.progressBar.container.class,
      CARD.htmlStructure.elements.icon.class,
      CARD.htmlStructure.elements.badge.icon.class,
      CARD.htmlStructure.elements.trendIndicator.icon.class,
      CARD.htmlStructure.elements.nameMain.class,
      CARD.htmlStructure.elements.nameExtra.class,
      CARD.htmlStructure.elements.secondaryInfoMain.class,
      CARD.htmlStructure.elements.secondaryInfoExtra.class,
      CARD.htmlStructure.elements.secondaryInfoExtra2.class,
    ];
  }

  _storeDOM() {
    for (const key of this.constructor._domKeys) {
      const el = this.shadowRoot.querySelector(`.${CSS.escape(key)}`);
      if (el) this._dom.register(key, el);
    }
  }

  _buildStyle() {
    this._addBaseClasses();
    this._handleWatermarkClasses();
    this._handleBarEffect();
    this._handleBarSegments();
  }

  _handleBarSegments() {
    const count = this._cardView.config.bar_segments;
    const active = is.number(count) && count >= 2;
    this._dom.toggleClass(CARD.htmlStructure.card.element, 'bar-segmented', active);
    if (active) this._dom.setStyle(CARD.htmlStructure.card.element, '--bar-segments', Math.round(count));
  }

  _addBaseClasses() {
    this._dom.addClass(
      CARD.htmlStructure.card.element,
      this.baseClass,
      this._cardView.config.layout,
      this._cardView.config.bar_size,
      this._cardView.config.bar_orientation
        ? CARD.style.dynamic.progressBar.orientation[this._cardView.config.bar_orientation]
        : null,
      this._cardView.config.center_zero ? CARD.style.dynamic.progressBar.centerZero.class : null,
      (this._cardView.config.layout === 'vertical' &&
        this._cardView.config.bar_orientation === 'up' &&
        this._cardView.config.bar_position === 'overlay') ||
        (this._cardView.config.bar_orientation === 'up' && this._cardView.config.bar_position === 'background')
        ? 'vertical-bar'
        : 'horizontal-bar',
    );
  }

  _handleWatermarkClasses() {
    if (!this._cardView.hasWatermark) return;

    const type = ['area', 'blended', 'striped', 'line', 'triangle', 'round'].includes(this._cardView.watermark.type)
      ? `${this._cardView.watermark.type}`
      : 'blended';
    const showClass = CARD.style.dynamic.show;

    this._dom.toggleClass(CARD.htmlStructure.card.element, `${showClass}-hwm`, !this._cardView.watermark.disable_high);
    this._dom.toggleClass(CARD.htmlStructure.card.element, `hwm-${type}`, !this._cardView.watermark.disable_high);
    this._dom.toggleClass(CARD.htmlStructure.card.element, `${showClass}-lwm`, !this._cardView.watermark.disable_low);
    this._dom.toggleClass(CARD.htmlStructure.card.element, `lwm-${type}`, !this._cardView.watermark.disable_low);
  }

  // The visual editor (EntityProgressEffectChips) can only guard interactive
  // selection - a Jinja template or a hand-written YAML list bypasses it
  // entirely. Both glass/gradient(_reverse) and shimmer/shimmer_reverse write
  // the same CSS custom property (see --progress-effect(-neg) in the
  // stylesheet), so requesting an incompatible pair doesn't error, it just
  // silently drops one effect depending on stylesheet order. This mirrors
  // that same-source-of-truth exclusion here, first-requested-wins (the
  // order the template/list actually wrote them in, not a fixed priority).
  static #resolveEffectConflicts(labels) {
    const incompatible = CARD.style.dynamic.progressBar.effectIncompatibilities;
    const kept = [];
    for (const label of labels) {
      if (kept.some((keptLabel) => incompatible[keptLabel]?.includes(label))) continue;
      kept.push(label);
    }
    return kept;
  }

  _handleBarEffect(jinjaEffect = null) {
    this._log.debug('📎 HACore _handleBarEffect(jinjaEffect)', jinjaEffect);

    if (!this._cardView.barEffectsEnabled) return;
    const isJinja = is.jinja(this._cardView.config.bar_effect);
    if (isJinja && !jinjaEffect) return;

    const requested = isJinja
      ? jinjaEffect
      : is.array(this._cardView.config.bar_effect)
        ? this._cardView.config.bar_effect
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

  _applyProgressCSS(progressValue, { barColor = null, iconColor = null, gradient = null, diverging = null } = {}) {
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
  _applyDivergingBarStackCSS(cardKey, diverging) {
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

  _applyWatermarkCSS(watermark) {
    if (!watermark) return;
    const cardKey = CARD.htmlStructure.card.element;
    HACore._getWatermarkProperties(watermark).forEach(([variable, value]) => {
      if (!is.nullish(value)) this._dom.setStyle(cardKey, variable, value);
    });
  }

  // ─── WATERMARK MANAGEMENT ─────────────────────────────────────────────────

  static _getWatermarkProperties(watermark) {
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

  get validJinjaFields() {
    // Most Jinja-capable options are flat string config values, but some
    // (min_value, watermark.low/.high) use an explicit { jinja: "..." } map
    // form instead of sniffing a bare string — extract accordingly. Dot-path
    // keys (watermark.low) walk one level of nesting; existing flat keys
    // (min_value) are unaffected since a 1-element path resolves identically.
    const rawValueFor = (key) => {
      const raw = key.includes('.')
        ? key.split('.').reduce((obj, k) => obj?.[k], this._cardView.config)
        : this._cardView.config[key];
      return is.plainObject(raw) ? (raw.jinja ?? '') : raw || '';
    };
    const handlers = this._getJinjaHandlers();
    const result = Object.fromEntries(
      Object.keys(handlers)
        .map((key) => [key, rawValueFor(key)])
        .filter(([, value]) => is.nonEmptyString(value)),
    );
    this._log.debug('validJinjaFields: ', { handler: handlers, config: this._cardView.config, result });
    return result;
  }

  _getJinjaHandlers(content) {
    throw new Error(`${this.constructor.name} must implement _getJinjaHandlers(${content})`);
  }

  _renderJinja(key, content) {
    this._log.debug('📎 HACore._renderJinja():', { key, content });

    const renderHandlers = this._getJinjaHandlers(content);
    const handler = renderHandlers[key];

    if (handler) {
      // CF5 - issue (critical) resolved - an exception inside a render handler
      // propagated into the WebSocket message callback; log it instead of
      // crashing the card
      try {
        handler();
      } catch (error) {
        this._log.error(`Jinja - render failed for ${key}:`, error);
      }
    } else {
      console.error(`Jinja - Unknown case: ${key}`);
    }
  }

  _refreshBarEffect(content) {
    this._log.debug('📎 HACore._refreshBarEffect():', { content });
    // CF5 - issue (critical) resolved - render_template returns native types: a
    // template yielding a list (e.g. {{ ['glass'] }}) crashed on .split()
    const jinjaEffect = (is.array(content) ? content : String(content ?? '').split(',')).map((s) => String(s).trim());
    this._handleBarEffect(jinjaEffect);
  }

  // ─── TEMPLATE PROCESSING ──────────────────────────────────────────────────

  get _wsInitialized() {
    return this._resourceManager?.has(CARD.network.disconnected) && this._resourceManager?.has(CARD.network.ready);
  }

  _unwatchWebSocket() {
    if (!this._resourceManager) return;
    this._resourceManager.remove(CARD.network.disconnected);
    this._resourceManager.remove(CARD.network.ready);
  }

  _watchWebSocket() {
    if (!this._resourceManager) return; // ISSUE 87
    this._unwatchWebSocket();
    this._resourceManager.addEventListener(
      this.hass.connection,
      'disconnected',
      () => {
        this._log.debug('🔌 WebSocket disconnected');
        const templates = this.validJinjaFields;
        for (const key of Object.keys(templates)) {
          this._resourceManager.remove(`template-${key}`);
        }
        this.#templateSignatures.clear(); // connection lost — all subscriptions are dead server-side
      },
      { passive: true },
      CARD.network.disconnected,
    );

    this._resourceManager.addEventListener(
      this.hass.connection,
      'ready',
      () => {
        this._log.debug('🔁 WebSocket ready — reprocessing templates');
        this._ensureResourceManager();
        this._processJinjaFields();
      },
      { passive: true },
      CARD.network.ready,
    );
  }

  _validateProcessJinjaFields() {
    return Boolean(this._resourceManager) && !(this._cardView.config?.entity && this._cardView.hasStandardEntityError);
  }

  _processJinjaFields() {
    if (!this._validateProcessJinjaFields()) {
      this._log.debug('❌ Jinja processing skipped - validation failed');
      return;
    }

    this._log.debug('✅ Processing Jinja fields');

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
  #cleanupOrphanTemplates(templates) {
    for (const subscriptionKey of [...this.#templateSignatures.keys()]) {
      const key = subscriptionKey.slice('template-'.length);
      if (!is.nonEmptyString(templates[key])) {
        this._resourceManager?.remove(subscriptionKey);
        this.#templateSignatures.delete(subscriptionKey);
      }
    }
  }

  _getTemplateContext() {
    const entity = this._cardView?.config?.entity;
    return entity ? { entity } : {};
  }

  async _subscribeToTemplate(key, template) {
    this._log.debug('📎 HACore._subscribeToTemplate:', { key, template });
    const subscriptionKey = `template-${key}`;

    if (!this.hass?.connection?.connected) {
      this._log.debug(`[Template ${key}] WebSocket not connected, skipping subscription.`);
      return;
    }
    this._log.debug('network ok...');

    // Add null check right before using _resourceManager
    if (!this._resourceManager) {
      this._log.debug(`[Template ${key}] ResourceManager is null, skipping subscription.`);
      return;
    }

    // CF5 - issue (perf) resolved - subscriptions are push-based: skip when an
    // identical one is live or in-flight. Reserving the signature before the
    // await also fixes a race where two overlapping calls created a duplicate
    // (orphan) subscription.
    const signature = `${template}\u0000${this._getTemplateContext().entity ?? ''}`;
    if (this.#templateSignatures.get(subscriptionKey) === signature) {
      this._log.debug(`[Template ${key}] Identical subscription live or in-flight, skipping.`);
      return;
    }
    this.#templateSignatures.set(subscriptionKey, signature);

    try {
      this._log.debug('key:', key);
      this._log.debug('template:', template);

      const unsub = await this.hass.connection.subscribeMessage((msg) => this._renderJinja(key, msg.result), {
        type: 'render_template',
        template, //template: template,
        variables: this._getTemplateContext(),
      });

      // Check again after the async operation
      if (this.#templateSignatures.get(subscriptionKey) !== signature) {
        // A newer subscription attempt superseded this one while we awaited.
        unsub();
        return;
      }
      if (!this._resourceManager) {
        this._log.debug(`[Template ${key}] ResourceManager became null during subscription, cleaning up.`);
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
      this._log.error(`Failed to subscribe to template ${key}:`, error);
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
  static _baseClass = META.types.card.typeName;
  static _cardStructure = new ObjStructure('card');
  static _hasDisabledIconTap = false;
  static _hasDisabledBadge = false;
  static _hiddenComponents = [
    CARD.style.dynamic.hiddenComponent.icon,
    CARD.style.dynamic.hiddenComponent.name,
    CARD.style.dynamic.hiddenComponent.secondary_info,
    CARD.style.dynamic.hiddenComponent.progress_bar,
  ];
  _trendIcons = {
    up: HA_CONTEXT.icons.chevronUpBox,
    down: HA_CONTEXT.icons.chevronDownBox,
    flat: HA_CONTEXT.icons.equalBox,
    error: HA_CONTEXT.icons.progressQuestion,
  };
  _icon = null;
  _cardView = new CardView();
  _actionHelper = null;
  #jinjaStateBadge = { icon: false, color: false };
  #lastMessage = null;

  // ─── LIFECYCLE METHODS ===

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
      '_handleHiddenComponents',
      '_manageErrorMessage',
      '_renderMessage',
      '_renderBadgeIcon',
      '_renderBadgeColor',
      '_processStandardFields',
    ];
  }

  constructor() {
    super();
    this._actionHelper = new ActionHelper(this);
  }

  connectedCallback() {
    super.connectedCallback(); // render, _updateDynamicElements, watchWebSocket
    this._actionHelper.init(this._cardView.config, this.hasDisabledIconTap);
  }

  // disconnectedCallback() {}

  getCardSize() {
    if (![META.types.card.typeName, META.types.template.typeName].includes(this.baseClass)) return undefined;
    const cardSize = this._cardView.cardSize;
    this._log.debug('getCardSize: ', cardSize);
    return cardSize;
  }

  // Kept for HA < 2024.11 (hui-card.ts falls back to this, migrated through
  // migrateLayoutToGridOptions, when getGridOptions isn't implemented -
  // mirrors how lovelace-mushroom's MushroomBaseCard keeps both).
  getLayoutOptions() {
    if (![META.types.card.typeName, META.types.template.typeName].includes(this.baseClass)) return undefined;
    const cardLayoutOptions = this._cardView.cardLayoutOptions;
    this._log.debug('getLayoutOptions: ', cardLayoutOptions);
    return cardLayoutOptions;
  }

  // Current HA API (2024.11+): same numbers as getLayoutOptions, expressed on
  // the 12-column grid instead of the older 4-column one - see
  // CARD.layout.gridColumnMultiplier.
  getGridOptions() {
    if (![META.types.card.typeName, META.types.template.typeName].includes(this.baseClass)) return undefined;
    const { grid_rows, grid_min_rows, grid_columns, grid_min_columns } = this._cardView.cardLayoutOptions;
    const multiplier = CARD.layout.gridColumnMultiplier;
    const gridOptions = {
      rows: grid_rows,
      min_rows: grid_min_rows,
      columns: grid_columns * multiplier,
      min_columns: grid_min_columns * multiplier,
    };
    this._log.debug('getGridOptions: ', gridOptions);
    return gridOptions;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh() {
    this._cardView.refresh(this.hass);
    if (this._manageErrorMessage()) return;
    this._updateDynamicElements();
  }

  reset() {
    super.reset(); // #isRendered, _dom.destroy(), shadowRoot.innerHTML
    this._icon = null;
  }

  get hasDisabledIconTap() {
    // check it soon
    return this.constructor._hasDisabledIconTap;
  }

  // ─── ERROR MESSAGE MANAGEMENT ─────────────────────────────────────────────

  _manageErrorMessage() {
    if (
      this._cardView.msg &&
      (is.nullish(this._cardView.entity) || (this._cardView.isAvailable && !this._cardView.hasValidatedConfig))
    ) {
      this._renderMessage(this._cardView.msg);
      return true;
    }
    this.#lastMessage = null;
    return false;
  }

  /**
   * Displays an error alert with the provided message.
   *   'info', 'warning', 'error'
   */
  _renderMessage(msg) {
    if (msg === this.#lastMessage) return;
    this.#lastMessage = msg;

    // ha-alert exists ?
    let alert = this.shadowRoot.querySelector('ha-alert');

    if (!alert) {
      alert = document.createElement('ha-alert');
      this.shadowRoot.replaceChildren(alert);
    }

    // update the message
    alert.setAttribute('alert-type', msg.sev); // IMPORTANT: attribut
    alert.textContent = msg.content;
  }

  // ─── CARD BUILDING ===

  get _structureOptions() {
    return {
      ...super._structureOptions,
      layout: this._cardView.config.layout,
      barSingleLine: this._cardView.config.bar_single_line,
      trendIndicator: this._cardView.config.trend_indicator,
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
    );
  }

  _addBaseParameter() {
    const cardKey = CARD.htmlStructure.card.element;
    const config = this._cardView.config;

    [
      [this._cardView.hasReversedSecondaryInfoRow, '--secondary-info-row-reverse', 'row-reverse'],
      [config.min_width, CARD.style.dynamic.card.minWidth.var, config.min_width],
      [config.height, CARD.style.dynamic.card.height.var, config.height],
      [config.bar_max_width, CARD.style.dynamic.progressBar.maxWidth.var, config.bar_max_width],
      [config.alert_when?.color, '--alert-color', ThemeManager.adaptColor(config.alert_when?.color)],
    ].forEach(([condition, prop, value]) => {
      if (condition) this._dom.setStyle(cardKey, prop, value);
    });
  }

  get conditionalStyle() {
    return new Map([
      [CARD.style.dynamic.clickable.card, this._cardView.hasClickableCard],
      [CARD.style.dynamic.clickable.icon, this._cardView.hasClickableIcon],
      [CARD.style.dynamic.frameless.class, this._cardView.config.frameless],
      [CARD.style.dynamic.marginless.class, this._cardView.config.marginless],
      // One card-level flag every ancestor that needs to relax its single-line
      // assumptions (.content's height, .secondary-info's bar stretch, …) reads
      // via a plain descendant selector (.info-multiline .content {...}) — not
      // a :has() re-derived at each level, which is what made every earlier
      // attempt only fix one ancestor at a time.
      ['info-multiline', Boolean(this._cardView.config.multiline)],
      ['icon-anim-spin', this._cardView.config.icon_animation === 'spin' && this._cardView.isEntityActive],
      ['icon-anim-pulse', this._cardView.config.icon_animation === 'pulse' && this._cardView.isEntityActive],
      ['icon-anim-bounce', this._cardView.config.icon_animation === 'bounce' && this._cardView.isEntityActive],
      ['icon-anim-shake', this._cardView.config.icon_animation === 'shake' && this._cardView.isEntityActive],
      ['icon-anim-ping', this._cardView.config.icon_animation === 'ping' && this._cardView.isEntityActive],
      ['icon-anim-reveal', this._cardView.config.icon_animation === 'reveal' && this._cardView.isEntityActive],
      [
        // Not isEntityActive alone: appliance integrations (Home Connect,
        // Miele) report the running program as a plain `sensor`, which
        // isEntityActive's domain gate excludes on purpose - see
        // ViewCore.isWashingMachineActive.
        'icon-anim-washing-machine',
        this._cardView.config.icon_animation === 'washing_machine' && this._cardView.isWashingMachineActive,
      ],
      [
        // Not isEntityActive: charging isn't a domain/state pair, it's an
        // attribute (see ViewCore.isBatteryCharging) — its own trigger.
        'icon-anim-battery-charging',
        this._cardView.config.icon_animation === 'battery_charging' && this._cardView.isBatteryCharging,
      ],
      [
        // See ViewCore.isBatteryIconShifted: compensates the fill wipe for
        // charging/bluetooth battery icon variants, without changing the icon.
        'icon-anim-battery-charging-shifted',
        this._cardView.config.icon_animation === 'battery_charging' &&
          this._cardView.isBatteryCharging &&
          this._cardView.isBatteryIconShifted,
      ],
      ['alert-active', this._cardView.isAlertActive],
      [
        'alert-background',
        this._cardView.isAlertActive && this._cardView.config.alert_when?.highlight === 'background',
      ],
      ['alert-anim-blink', this._cardView.isAlertActive && this._cardView.alertAnimation === 'blink'],
      ['alert-anim-ping', this._cardView.isAlertActive && this._cardView.alertAnimation === 'ping'],
    ]);
  }

  _applyConditionalClasses() {
    this.conditionalStyle.forEach((condition, className) => {
      this._dom.toggleClass(CARD.htmlStructure.card.element, className, condition);
    });
  }

  _handleHiddenComponents(jinjaContent = null) {
    if (jinjaContent === null && is.jinja(this._cardView.config.hide)) return;

    // CF5 - issue (critical) resolved - a hide Jinja template yielding a native
    // list crashed on .split(); normalize list and string results alike
    const items = is.nullish(jinjaContent)
      ? null
      : (is.array(jinjaContent) ? jinjaContent : String(jinjaContent).split(','))
          .map((s) => String(s).trim())
          .filter(Boolean);

    this.constructor._hiddenComponents.forEach((component) => {
      this._dom.toggleClass(
        CARD.htmlStructure.card.element,
        component.class,
        items ? items.includes(component.label) : this._cardView.hasComponentHiddenFlag(component.label),
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
    // Re-applied on every refresh (not only at render): some conditions are
    // state-driven (icon_animation active state, entity error), and toggleClass
    // is value-cached so unchanged classes cost nothing.
    this._applyConditionalClasses();
    this._processJinjaFields();
    this._processStandardFields();
  }

  // ─── Update Trend ===
  _updateTrend() {
    if (!this._cardView.config.trend_indicator) return;

    this._dom.setAttribute(
      CARD.htmlStructure.elements.trendIndicator.icon.class,
      CARD.style.icon.badge.default.attribute,
      this._trendIcons[this._cardView.getTrend()],
    );
  }

  // ─── CSS MANAGEMENT ───────────────────────────────────────────────────────

  _updateCSS() {
    throw new Error(`${this.constructor.name} must implement _updateCSS()`);
  }

  // ─── ICON MANAGEMENT ──────────────────────────────────────────────────────

  _createImgIcon(altText, className = 'custom-icon-img') {
    this._log.debug('📎 HABase._createImgIcon():', { altText, className });

    const img = document.createElement('img');
    img.className = className;
    img.decoding = 'async';
    img.alt = altText;
    return img;
  }

  _handleImgIcon(stateObj, srcPicture) {
    this._log.debug('📎 HABase._handleImgIcon():', { stateObj, srcPicture });

    const pictureAlt = stateObj?.attributes?.friendly_name || 'Entity picture';
    const iconContainer = this._dom.get(CARD.htmlStructure.elements.icon.class);
    if (!iconContainer) return;

    if (this._icon?.tagName !== 'IMG') {
      this._icon?.remove();
      this._icon = this._createImgIcon(pictureAlt);
      iconContainer.replaceChildren(this._icon);
      this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.iconAndShape.icon.size.var, '36px');
    }

    this._icon.src = srcPicture;
    this._icon.alt = pictureAlt;
  }

  _createStateObjIcon(stateObj, curIcon, hasIconOverride, hasPicture) {
    this._log.debug('📎 HABase._createStateObjIcon():', { stateObj, curIcon, hasIconOverride, hasPicture });

    if (!stateObj) {
      return this.isConnected
        ? {
            entity_id: 'sensor.dummy',
            state: 'unknown',
            attributes: {
              icon: curIcon || HA_CONTEXT.helpCircleOutline,
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

  _handleStateIcon(iconContainer, stateObjIcon) {
    this._log.debug('📎 HABase._handleStateIcon():', { iconContainer, stateObjIcon });

    this._cleanupImgIcon();

    if (!this._icon) {
      this._icon = document.createElement('ha-state-icon');
      iconContainer.replaceChildren(this._icon);
    }

    this._icon.hass = this.hass;
    this._icon.stateObj = stateObjIcon;
  }

  _showIcon() {
    if (!this._cardView) return;

    const { entity: entityId, icon: curIcon } = this._cardView;
    const stateObj = this._hassProvider.getEntityStateObj(entityId);
    const hasIconOverride = is.nonEmptyString(curIcon);
    const srcPicture = this._hassProvider.getEntityProp(entityId, 'entity_picture');
    const hasPicture = is.nonEmptyString(srcPicture);

    const iconContainer = this._dom.get(CARD.htmlStructure.elements.icon.class);
    if (!iconContainer) {
      this._log.error('Icon container not found for _showIcon.');
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
    if (this.constructor._hasDisabledBadge) return;
    const badgeInfo = this._cardView.badgeInfo;
    const isBadgeEnable = badgeInfo || this._cardView.config.badge_icon || this._cardView.config.badge_color;

    this._enableBadge(isBadgeEnable);
    if (badgeInfo) this._setBadgeIconColor(badgeInfo.icon, badgeInfo.color, badgeInfo.backgroundColor);
  }

  _enableBadge(isBadgeEnable) {
    this._log.debug('📎 HABase._enableBadge():', { isBadgeEnable });

    this._dom.toggleClass(
      CARD.htmlStructure.card.element,
      `${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class}`,
      isBadgeEnable,
    );
  }

  _setBadgeIconColor(icon, color, backgroundColor) {
    this._log.debug('📎 HABase._setBadgeIconColor():', { icon, color, backgroundColor });

    this._setBadgeIcon(icon);
    this._setBadgeColor(color, backgroundColor);
  }

  _setBadgeIcon(icon) {
    this._dom.setAttribute(CARD.htmlStructure.elements.badge.icon.class, CARD.style.icon.badge.default.attribute, icon);
  }

  _setBadgeColor(color, backgroundColor) {
    this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.badge.backgroundColor.var, backgroundColor);
    this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.badge.color.var, color);
  }

  // ─── JINJA TEMPLATE RENDERING ─────────────────────────────────────────────

  _getJinjaBadgeState() {
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

  _renderBadgeIcon(content) {
    this._log.debug('📎 HABase._renderBadgeIcon():', { content });
    this.#jinjaStateBadge.icon = is.nonEmptyString(content) && content.includes(HA_CONTEXT.icons.prefix);

    if (!is.nullish(this._cardView.badgeInfo)) return; // alert -> cancel custom badge
    if (this.#jinjaStateBadge.icon) {
      this._setBadgeIcon(content);
    }
    this._updateBadgeVisibility();
  }

  _renderBadgeColor(content) {
    this._log.debug('📎 HABase._renderBadgeColor():', { content });
    this.#jinjaStateBadge.color = is.nonEmptyString(content);

    if (!is.nullish(this._cardView.badgeInfo)) return; // alert -> cancel custom badge

    if (this.#jinjaStateBadge.color) {
      const backgroundColor = ThemeManager.adaptColor(content);
      const color = 'var(--white-color)';
      this._setBadgeColor(color, backgroundColor);
    }
    this._updateBadgeVisibility();
  }

  // ─── STD FIELDS PROCESSING ────────────────────────────────────────────────
  static _getStandardFields(/*cardView*/) {
    return [];
  }

  _processStandardFields() {
    this.constructor._getStandardFields(this._cardView).forEach(({ className, value }) => {
      this._dom.setText(className, value);
    });
  }

  // ─── JINJA TEMPLATE RENDERING ─────────────────────────────────────────────

  _baseJinjaHandlers(content) {
    return {
      bar_effect: () => this._refreshBarEffect(content),
      hide: () => this._handleHiddenComponents(content),
    };
  }

  static #BREAK_RE = /<br\s*\/?>/gi;

  // Splits Jinja-sourced HTML at the first <br> — shared by _renderCustomInfo
  // (card/badge) and _renderSecondary (template/badgeTemplate), the only two
  // callers. When `multiline` is off, any <br> is stripped instead of honored:
  // [content, null]. When on, only the first <br> is kept; anything from a 2nd
  // <br> onward is discarded. A tag straddling the break (e.g.
  // <span style="color:red">A<br>B</span>) is re-wrapped on both halves via
  // #domSplitOnce's ancestor cloning, instead of a naive string split that
  // would leave one half with an unclosed/orphaned tag.
  _splitAtFirstBreak(content) {
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
  static #domSplitOnce(html) {
    // Own non-global literal on purpose: #BREAK_RE carries the /g flag for the
    // .replace() call above, and .test() on a /g regex mutates lastIndex, which
    // would corrupt the *next* call's match position (this runs twice per
    // multiline render, back to back, for the 2nd-<br> check).
    if (!/<br\s*\/?>/i.test(html)) return [html, null];

    const root = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html').body;
    let found = false;
    const split = (node) => {
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
    return [before.innerHTML, after.innerHTML];
  }

  // ─── getStubConfig -> select entity ───────────────────────────────────────
  static getStubEntity(hass) {
    return (
      Object.keys(hass.states).find((id) => /^(sensor\..*battery|fan\.|cover\.|light\.)/i.test(id)) ||
      'sensor.temperature'
    );
  }
}

export { HACore };
export { HABase };
