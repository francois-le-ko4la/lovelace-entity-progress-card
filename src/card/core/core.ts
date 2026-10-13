import { VERSION, META, CARD_CONTEXT, suffixedName, HA_CONTEXT, CARD } from '../../utils/parameters.js';
import { CARD_CSS, adoptStyle } from '../../utils/styles.js';
import { is } from '../../utils/common-checks.js';
import { initLogger, cardNotice, type LoggerInstance } from '../../utils/log.js';
import { ObjStructure, ChangeTracker } from '../value-helpers.js';
import { HassProviderSingleton, loadEditor, type HomeAssistant } from '../../utils/hass-provider.js';
import { type ViewCore } from '../view.js';
import { type ResolvedWatermark } from '../watermark-view.js';
import {
  markValue,
  entityOf,
  type ValueConfig,
  SCHEMA_DEFAULTS,
  BAR_SIZES,
  raisesRainbowFullRow,
  HAS_EFFECT,
} from '../schema.js';
import { ResourceManager, DOMHelper, ActionHelper, type CacheValue } from '../dom-helpers.js';
import { JinjaSubscriptions } from '../jinja-subscriptions.js';
import { HistorySeeding, type HistoryPoint } from '../history-seeding.js';
import { Marks } from '../marks.js';
import { joinAlignedRows } from '../aligned-bars.js';
import { type LovelaceConfig } from '../../utils/types.js';
import { type StructureOptions } from '../structure.js';

// ViewBase.divergingBarStack's return shape (see view.ts). Exported -
// cards.ts's own _renderPercentCSS forwards the same shape (ViewCore.
// templateThemeDivergingGradient) through to _applyProgressCSS below.
type DivergingGradients = {
  posGradient: string | null;
  negGradient: string | null;
  posSize: number;
  negSize: number;
};

// The icon element _showIcon()/_handleImgIcon()/_handleStateIcon() manage:
// either a plain <img> (entity_picture) or a <ha-state-icon> (hass/stateObj).
type IconElement = HTMLImageElement | (HTMLElement & { hass: HomeAssistant | null; stateObj: unknown });

// Every Jinja-pushed numeric option, as named on the view - see
// HABase._applyJinjaNumber.
type JinjaNumberProp = 'minValue' | 'maxValue' | 'watermarkLow' | 'watermarkHigh' | 'alertAbove' | 'alertBelow';

// The option each one answers for, as the subscription is keyed.
const JINJA_NUMBER_KEY: Record<JinjaNumberProp, string> = {
  minValue: 'min_value',
  maxValue: 'max_value',
  watermarkLow: 'watermark.low',
  watermarkHigh: 'watermark.high',
  alertAbove: 'alert_when.above',
  alertBelow: 'alert_when.below',
};

// HABase#_applyTrendVisuals's own icon-per-direction map - shared by every
// instance (never overridden, never mutated), not rebuilt per card.
const TREND_ICONS: Record<string, string> = {
  up: HA_CONTEXT.icons.chevronUpBox,
  down: HA_CONTEXT.icons.chevronDownBox,
  flat: HA_CONTEXT.icons.equalBox,
  error: HA_CONTEXT.icons.progressQuestion,
};

const ALIGNED_BARS_ID = 'alignedBars';

// bar_ring.gap is capped so a sliver of arc always remains.
const RING_MAX_GAP = 330;

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
 * - _getJinjaHandlers()     → handle Jinja2 template results
 *
 * Subclasses MAY override: - _updateCSS() → the entity-driven bar repaint
 * implemented here (Template swaps in its own Jinja-driven one) -
 * _structureOptions (getter) → structure options passed to ObjStructure.clone()
 * (barType, barPosition…) - _buildStyle() → CSS class application pipeline
 * (watermark, bar effect, base classes) - _updateDynamicElements() → DOM update
 * orchestration (CSS, Jinja processing)
 *
 * @abstract
 * @extends HTMLElement
 */

class HACore extends HTMLElement {
  static version = VERSION;
  static _baseClass: string = META.types.feature.typeName;
  static _structureType = 'feature';
  static _cardStyle = CARD_CSS;
  static _cardElement = CARD.htmlStructure.card.element;
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
  // As written, before negotiation migrates it: what EPB.doctor judges.
  _givenConfig: LovelaceConfig | null = null;
  // Concrete subclasses swap this in for CardView/BadgeView/FeatureView/
  // CardTemplateView/BadgeTemplateView - ViewCore (not a union, not `any`)
  // is the widest type accurate for all of them. `declare`: HACore itself
  // is never instantiated, only its subclasses.
  declare _cardView: ViewCore;
  _dom = new DOMHelper();
  _marks = new Marks({ view: () => this._cardView, dom: () => this._dom });
  _hassProvider = HassProviderSingleton.getInstance();
  _changeTracker = new ChangeTracker();
  #isRendered = false;
  _jinjaSubscriptions = new JinjaSubscriptions({
    hass: () => this.hass,
    resourceManager: () => this._resourceManager,
    isConnected: () => this.isConnected,
    log: () => this._log,
    ensureResourceManager: () => this._ensureResourceManager(),
    config: () => this._cardView.config,
    handlers: (content) => this._getJinjaHandlers(content),
    canProcess: () => this._validateProcessJinjaFields(),
    context: () => this._getTemplateContext(),
    onFailure: (key, message) => this._onJinjaFailure(key, message),
    report: (message, detail) => this.#reportTemplateFailure(message, detail),
  });

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
      '_handleBarEffect',
      '_updateDynamicElements',
      '_refreshBarEffect',
      '_createCardElements',
      '_buildStyle',
      '_validateProcessJinjaFields',
      '_startAutoRefresh',
      '_stopAutoRefresh',
      '_seedPeakMarkerHistoryOnce',
      '_seedFromHistory',
      // abstract
      '_handleHassUpdate',
      '_updateCSS',
      '_getJinjaHandlers',
    ];
  }

  constructor() {
    super();
    this._log = initLogger(this, this.localName, this._debug, (this.constructor as typeof HACore)._loggedMethods);
    this._shadow = this.attachShadow({ mode: CARD.config.shadowMode as 'open' | 'closed' });
  }

  // Async on purpose: Home Assistant awaits this (hui-card-element-editor and
  // its badge/feature twins) - the editor and its translations ship beside the
  // bundle and load here, the first time one opens. null: HA's YAML editor.
  static async getConfigElement(): Promise<HTMLElement | null> {
    const metaType = Object.values(META.types).find((t) => t.typeName === this._baseClass) as
      { editor?: string } | undefined;
    if (!metaType?.editor) return null;
    const tag = suffixedName(metaType.editor);
    try {
      await Promise.all([
        customElements.get(tag) ? null : loadEditor(),
        HassProviderSingleton.getInstance().ensureEditorTranslations(),
      ]);
    } catch (error) {
      console.warn(`[Entity Progress Card] Visual editor unavailable: ${(error as Error).message}`);
      return null;
    }
    // A file from another version defines nothing: its host table is missing.
    return customElements.get(tag) ? document.createElement(tag) : null;
  }

  connectedCallback() {
    this._ensureResourceManager();
    this.render();
    this._updateDynamicElements();
    if (this.hass) {
      this._handleHassUpdate();
      this._jinjaSubscriptions.watch();
    }
    this.#watchInterference();
    this.#syncAlignedBars();
  }

  disconnectedCallback() {
    this._resourceManager?.cleanup();
    this._resourceManager = null;
    this._jinjaSubscriptions.clear(); // subscriptions died with cleanup() — allow resubscription on reconnect
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

  // Rebuilt with every render: the text it watches is a new one each time.
  #syncAlignedBars() {
    if (!this.isConnected || !this._resourceManager) return;
    const config = this._cardView.config;
    // A name gathers every card carrying it; true, the rows of one Multi - a
    // row is told it is one by the wrapper it sits in.
    const inMulti = this.parentElement?.classList.contains(CARD.style.dynamic.multiItem);
    const setting = config.bar_aligned;
    const group = is.nonEmptyString(setting) ? setting : setting === true && inMulti ? this.getRootNode() : null;
    const singleLine = config.density === 'single_line';
    const { infoRow: rowText } = CARD.htmlStructure.sections;
    const { secondaryInfoWrapper: valueText } = CARD.htmlStructure.elements;
    const column =
      group && HAS_EFFECT.barAligned(config)
        ? this._shadow.querySelector<HTMLElement>(`.${singleLine ? rowText.class : valueText.class}`)
        : null;
    const row = singleLine
      ? column?.closest<HTMLElement>(`.${CARD.style.dynamic.singleLineRow}`)
      : column?.parentElement;
    if (!group || !column || !row) {
      this._resourceManager.remove(ALIGNED_BARS_ID);
      return;
    }
    const rows = joinAlignedRows(group, {
      measure: () => {
        // Layout px, like cap: a rect is post-transform (HA's dialog zooms in).
        const scale = row.getBoundingClientRect().width / row.offsetWidth || 1;
        return column.getBoundingClientRect().width / scale;
      },
      cap: () => row.clientWidth / 2,
      apply: (width) => {
        const card = CARD.htmlStructure.card.element;
        this._dom.setStyleNow(card, CARD.style.dynamic.alignWidth.var, width);
        this._dom.setStyleNow(card, CARD.style.dynamic.alignTextFloor.var, width ? '0px' : '');
      },
    });
    const texts = new MutationObserver(rows.textChanged);
    texts.observe(column, { characterData: true, childList: true, subtree: true });
    const size = new ResizeObserver(rows.resized);
    size.observe(row);
    this._resourceManager.add(() => {
      texts.disconnect();
      size.disconnect();
      rows.leave();
    }, ALIGNED_BARS_ID);
  }

  _ensureResourceManager() {
    if (!this._resourceManager) this._resourceManager = new ResourceManager();
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  // For a host that removes parts of this card whatever its own hide says (the
  // Multi Feature). Called before setConfig, which builds the structure.
  forceHidden(targets: string[]): void {
    this._cardView.jinjaState.forceHidden(targets);
  }

  setConfig(config: LovelaceConfig) {
    this._log?.debug('📎 HACore.setConfig()', config);

    if (!config) throw new Error('setConfig: invalid config');

    this._givenConfig = config;
    this._cardView.config = { ...config };
    this._jinjaSubscriptions.invalidate();
    this._registerWatchedEntities();
    if (this.isRendered) this.reset(); // Card/Badge editor
    this.render(); // re-build the card
    if (this.hass) this._handleHassUpdate(); // Card/Badge editor
  }

  // Reads the negotiated config, not the raw one: both call sites assign
  // _cardView.config first, and negotiation is what turns every legacy shape
  // into the { entity, attribute } one entityOf understands.
  _registerWatchedEntities() {
    // CF5 - issue (minor) resolved - the watched set was only ever appended to:
    // entities removed from the config (editor changes) stayed watched and kept
    // triggering refreshes until reload. Rebuilt from scratch on every
    // setConfig.
    this._changeTracker.resetWatchedEntities();
    const config = this._cardView.config;
    const watch = (entityId: unknown) => {
      if (is.nonEmptyString(entityId)) this._changeTracker.watchEntity(entityId);
    };
    watch(config.entity);
    if (is.nonEmptyString(config.entity) && this._cardView.readsSameDevice) {
      this._changeTracker.watchSameDevice(config.entity);
    }
    // The value-shape family (min/max, the two watermarks, the two alert
    // thresholds) read through entityOf rather than by hand: matched as a bare
    // string, watermark only ever caught its pre-1.6 spelling and alert_when
    // was missed entirely, so a threshold driven by an entity never refreshed
    // when that entity moved.
    for (const value of [config.min_value, config.max_value, config.alert_when?.above, config.alert_when?.below]) {
      watch(entityOf(value as ValueConfig));
    }
    for (const side of ['low', 'high'] as const) {
      watch(entityOf(markValue(config.watermark?.[side], SCHEMA_DEFAULTS.watermark[side]) as ValueConfig));
    }
    // CF5 - issue (major) resolved - additions entities were not watched: when
    // one of them changed state (main entity unchanged), the ChangeTracker
    // reported no change and the displayed total stayed stale
    if (is.array(config.bar_stack?.entities)) {
      for (const item of config.bar_stack.entities) {
        if (is.plainObject(item)) watch(item.entity);
      }
    }
  }

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
    if (!this._jinjaSubscriptions.watching) this._jinjaSubscriptions.watch();
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
  // What moves with no state change gets a local tick: one setTimeout to the
  // view's nextTickAt. On HACore, not HABase, so Features have it too.
  #tickAt: number | null = null;

  _startAutoRefresh(at: number) {
    if (!this._resourceManager) return;
    this.#tickAt = at;
    this._resourceManager.setTimeout(() => this.#onTickDue(at), at - Date.now(), 'autoRefresh');
  }

  // A timer firing a hair early, while the text would still read the old value,
  // only re-arms - from the clock, so one set back re-grids instead of waiting.
  #onTickDue(at: number) {
    if (Date.now() >= at) this._onAutoRefreshTick();
    this._manageAutoRefresh();
  }

  _onAutoRefreshTick() {
    this._cardView.refreshClock();
    this._updateCSS();
  }

  _stopAutoRefresh() {
    this.#tickAt = null;
    if (this._resourceManager) this._resourceManager.remove('autoRefresh');
  }

  // After every hass update and every tick. An earlier deadline - a relative
  // time turning fresh - re-arms at once; a later one waits for the armed tick.
  // CF5 - issue (major) resolved - set hass calls _handleHassUpdate before
  // _ensureResourceManager: with an active timer entity and hass assigned
  // before connectedCallback (standard Lovelace order), _resourceManager was
  // still null and .has() crashed.
  _manageAutoRefresh() {
    const at = this._cardView.nextTickAt(Date.now());
    if (!is.number(at)) this._stopAutoRefresh();
    else if (!this._resourceManager?.has('autoRefresh') || at < (this.#tickAt ?? Infinity)) this._startAutoRefresh(at);
  }

  #history = new HistorySeeding({
    config: () => this._cardView.config,
    hass: () => this.hass,
    log: () => this._log,
  });

  // peak_marker here, trend_indicator on EntityProgressCardBase.
  _seedFromHistory(key: string, config: unknown, apply: (points: HistoryPoint[]) => void, onStart?: () => void) {
    this.#history.seed(key, config, apply, onStart);
  }

  _seedPeakMarkerHistoryOnce() {
    this._seedFromHistory(
      'peak_marker',
      this._cardView.config.peak_marker,
      (points) => this.#applyPeakMarkerHistory(points),
      () => {
        // Clears the previous entity's marks before the fetch resolves - unlike
        // trend's TrendTracker, nothing else self-corrects in between.
        this._cardView.entityView?.clearPeakMarker();
        this._updateCSS();
      },
    );
  }

  #applyPeakMarkerHistory(points: HistoryPoint[]) {
    this._log?.debug(`peak_marker seeded from history: ${points.length} point(s)`);
    this._cardView.entityView?.seedPeakMarker(points);
    this._updateCSS();
    // The window slides with no new reading: its eviction tick starts here.
    this._manageAutoRefresh();
  }

  get isRendered(): boolean {
    return this.#isRendered;
  }

  reset() {
    this._dom.toggleClass(CARD.htmlStructure.card.element, 'transition-ready', false);
    this.#isRendered = false;
    this._dom.destroy();
    this._shadow.innerHTML = '';
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

  // Resolved (and cached) lazily by type, not eagerly per class - see
  // ObjStructure.forType.
  get cardStructure(): ObjStructure {
    return ObjStructure.forType((this.constructor as typeof HACore)._structureType);
  }

  // ─── CARD BUILDING ────────────────────────────────────────────────────────

  render() {
    if (this.isRendered) return;
    this.#isRendered = true;
    const element = this._createCardElements();
    // element.style is null when the shared constructed sheet is adopted
    this._shadow.replaceChildren(...(element.style ? [element.style, element.card] : [element.card]));
    this._storeDOM();
    // After _storeDOM(): Marks sets the shape class on the mark elements, which
    // must be registered by then.
    this._buildStyle();
    this._buildSegmentCells();
    this.#syncAlignedBars();
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

  // What counts as a badge type, in one place: three separate rules below
  // (no icon action, no inner badge, its own min_width model) all hang off it.
  get _isBadge(): boolean {
    return this.baseClass.includes('badge');
  }

  // Badges only ever have a card-level action, never the icon's own - same
  // condition as _addBaseClasses's own 'progress-badge' class.
  get hasDisabledIconTap(): boolean {
    return this._isBadge;
  }

  _createCardElements(): { style: HTMLStyleElement | null; card: HTMLElement } {
    const style = adoptStyle(this._shadow, this.cardStyle);

    const card = document.createElement(this.cardElement);
    this._dom.destroy();
    this._dom.register(CARD.htmlStructure.card.element, card);
    this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.progressBar.value.var, 0);
    // Cloned from the per-options <template> cache; _structureOptions is read
    // fresh here so a setConfig that changes the structure picks the right
    // template.
    card.replaceChildren(this.cardStructure.clone(this._structureOptions));

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
  static _domKeys: string[] = [
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
    CARD.htmlStructure.elements.progressBar.lowWatermark.class,
    CARD.htmlStructure.elements.progressBar.highWatermark.class,
    CARD.htmlStructure.elements.progressBar.rangeMarker.class,
    CARD.htmlStructure.elements.progressBar.minMarker.class,
    CARD.htmlStructure.elements.progressBar.maxMarker.class,
    CARD.htmlStructure.elements.progressBar.averageMarker.class,
    ...Object.values(CARD.htmlStructure.elements.ringMarks).map((mark) => mark.class),
    CARD.htmlStructure.elements.ringProgress.class,
  ];

  get domKeys(): string[] {
    return (this.constructor as typeof HACore)._domKeys;
  }

  _storeDOM() {
    for (const key of this.domKeys) {
      const el = this._shadow.querySelector(`.${CSS.escape(key)}`);
      if (el) this._dom.register(key, el as HTMLElement);
    }
  }

  _buildStyle() {
    this._addBaseClasses();
    this._marks.watermarkClasses();
    this._marks.peakMarkerClasses();
    this._handleBarEffect();
  }

  // N real fill cells per fillable half (bar_segments: N), not a divider
  // layer painted over the fill (see CHANGELOG.md - that approach kept
  // clipping through markers across two prior rebuilds). Built once per
  // render(); each cell's own fill is pure CSS off --progress-bar-value.
  _buildSegmentCells() {
    const active = this._cardView.isSegmented;
    const count = this._cardView.config.bar_segments as number;
    const isCenterZero = Boolean(this._cardView.config.center_zero);
    const rounded = active ? Math.round(count) : 0;
    // .bar-segmented itself only still matters for .bar's own border-radius
    // reset and hiding .inner below (styles.ts) - everything else keys off
    // the cell elements' own presence now, not this class.
    this._dom.toggleClass(CARD.htmlStructure.card.element, 'bar-segmented', active);
    if (!active) return;
    const containerSpec = CARD.htmlStructure.elements.progressBar.segments;
    // center_zero: one independent N-cell row per arm (.bar-half), off that
    // arm's own --arm-fill (styles.ts). --bar-segments always goes on .bar
    // itself though, never a .bar-half - it's the only ancestor a mark and
    // every cell both share (a mark is .bar's own child, not arm-nested).
    const halfSpec = CARD.htmlStructure.elements.progressBar.half;
    const bars = this._shadow.querySelectorAll<HTMLElement>(
      `.${CSS.escape(CARD.htmlStructure.elements.progressBar.bar.class)}`,
    );
    const cellSpec = CARD.htmlStructure.elements.progressBar.segmentCell;
    bars.forEach((bar) => {
      bar.style.setProperty('--bar-segments', String(rounded));
      const targets = isCenterZero ? Array.from(bar.querySelectorAll(`.${CSS.escape(halfSpec.class)}`)) : [bar];
      targets.forEach((target) => {
        const container = document.createElement(containerSpec.element);
        container.className = containerSpec.class;
        Object.entries(containerSpec.extraAttr ?? {}).forEach(([key, value]) =>
          container.setAttribute(key, String(value)),
        );
        for (let i = 0; i < rounded; i += 1) {
          const cell = document.createElement(cellSpec.element);
          cell.className = cellSpec.class;
          Object.entries(cellSpec.extraAttr ?? {}).forEach(([key, value]) => cell.setAttribute(key, String(value)));
          cell.style.setProperty('--segment-index', String(i));
          container.appendChild(cell);
        }
        // Before .inner/marks, not appended after: each cell now paints an
        // opaque track-color base across its own whole width (styles.ts), so
        // appending last would once again cover a mark landing on it - DOM
        // order is what keeps marks on top now, same as before this feature.
        target.insertBefore(container, target.firstChild);
      });
    });
  }

  // Shared by every _baseClassStyle-style getter below (HABase's own
  // extends it via `...super._baseClassStyle`, same pattern as _staticStyle)
  // - toggling per the map, unlike a plain addClass, correctly drops a class
  // that no longer applies instead of only ever adding new ones.
  _toggleClasses(style: Map<string, boolean>) {
    style.forEach((condition, className) => {
      this._dom.toggleClass(CARD.htmlStructure.card.element, className, condition);
    });
  }

  get _baseClassStyle(): Map<string, boolean> {
    const config = this._cardView.config;
    const orientationClasses = CARD.style.dynamic.progressBar.orientation as Record<string, string>;
    const isVerticalBar = this._cardView.isVerticalBar;
    return new Map([
      [this.baseClass, true],
      ...Object.values(CARD.layout.orientations).map((o): [string, boolean] => [o.label, config.layout === o.label]),
      ...BAR_SIZES.map((size): [string, boolean] => [size, config.bar_size === size]),
      // down is up mirrored (styles.ts): it keeps every .up-orientation rule.
      ...Object.values(orientationClasses).map((cls): [string, boolean] => [
        cls,
        orientationClasses[config.bar_orientation as string] === cls ||
          (cls === orientationClasses.up && config.bar_orientation === 'down'),
      ]),
      [CARD.style.dynamic.progressBar.centerZero, Boolean(config.center_zero)],
      ['rainbow-full-bar', config.bar_color_mode === 'rainbow_full'],
      ['rainbow-full-raised', raisesRainbowFullRow(config)],
      ['vertical-bar', isVerticalBar],
      ['horizontal-bar', !isVerticalBar],
    ]);
  }

  _addBaseClasses() {
    this._toggleClasses(this._baseClassStyle);
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
    this._jinjaSubscriptions.process();
  }

  // ─── CSS MANAGEMENT ───────────────────────────────────────────────────────

  // Entity-driven bar repaint, shared by Card/Badge and Feature.
  // EntityProgressTemplateBase overrides it (percent comes from a Jinja push).
  _updateCSS() {
    const bar = this._cardView.entityView;
    if (!bar) return;
    this._applyProgressCSS(bar.percent / 100, {
      barColor: bar.barColor,
      // Feature has no icon, but rainbow_full's value-mark pill still reads
      // --icon-and-shape-color for its fill (styles.ts).
      iconColor: bar.iconColor,
      gradient: bar.colorGradient,
      // bar_stack's entity-driven gradient wins; themeDivergingGradient is
      // center_zero's fallback when no bar_stack drives the two arms.
      diverging: bar.divergingBarStack ?? bar.themeDivergingGradient,
    });
    this._applyWatermarkCSS(bar.watermark);
    this._marks.watermarkClasses();
    this._marks.peakMarkerCSS(bar.peakMarker);
    // History-seeded (async, after the initial _buildStyle() pass): the marks'
    // own shown class needs recomputing here too, not just at render() time.
    this._marks.peakMarkerClasses();
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

    // down: the gradients are built for up, and run the other way.
    const flip = (value: string | null): string | null =>
      value && this._cardView.isDownBar
        ? value.replace(/to (top|bottom)/g, (way) => (way === 'to top' ? 'to bottom' : 'to top'))
        : value;
    const fillColor = flip(gradient) ?? barColor;
    if (fillColor !== null) this._dom.setStyle(cardKey, CARD.style.dynamic.progressBar.color.var, fillColor);
    if (iconColor !== null) this._dom.setStyle(cardKey, CARD.style.dynamic.iconAndShape.color.var, iconColor);

    this._applyDivergingBarStackCSS(
      cardKey,
      diverging && { ...diverging, posGradient: flip(diverging.posGradient), negGradient: flip(diverging.negGradient) },
    );

    if (progressValue !== null) {
      this._dom.setStyle(cardKey, CARD.style.dynamic.progressBar.value.var, progressValue);
      // The bar's, or the ring's stand-in: only one of them is ever built.
      for (const key of [
        CARD.htmlStructure.elements.progressBar.container.class,
        CARD.htmlStructure.elements.ringProgress.class,
      ]) {
        this._dom.setAttribute(key, 'aria-valuenow', Math.round(progressValue * 100));
      }
    }
  }

  // bar_stack 'stacked'/'proportional' + center_zero: two independent per-arm
  // gradients/sizes (see ViewBase.divergingBarStack). Explicitly removed (not
  // left stale) when not applicable - setStyle() never unsets a value on its
  // own once written.
  _applyDivergingBarStackCSS(cardKey: string, diverging: DivergingGradients | null) {
    const pb = CARD.style.dynamic.progressBar;
    // Nullish (no bar_stack, or one arm with no gradient) removes; a size of 0
    // is a real value and must still be written.
    (
      [
        [pb.stackGradientPos.var, diverging?.posGradient],
        [pb.stackGradientNeg.var, diverging?.negGradient],
        [pb.stackSizePos.var, diverging?.posSize],
        [pb.stackSizeNeg.var, diverging?.negSize],
      ] as [string, CacheValue][]
    ).forEach(([varName, value]) => this._dom.setOrRemoveStyle(cardKey, varName, value));
  }

  _applyWatermarkCSS(watermark: ResolvedWatermark | null) {
    this._marks.watermarkCSS(watermark);
  }

  // ─── JINJA TEMPLATE RENDERING ─────────────────────────────────────────────

  _getJinjaHandlers(content?: unknown): Record<string, () => void> {
    throw new Error(`${this.constructor.name} must implement _getJinjaHandlers(${content})`);
  }

  // A Jinja field Home Assistant could not render; HABase decides what to do.
  _onJinjaFailure(key: string, message: string) {
    this._log?.debug('📎 HACore._onJinjaFailure():', { key, message });
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

  _validateProcessJinjaFields(): boolean {
    return (
      Boolean(this._resourceManager) &&
      !(this._cardView.config?.entity && this._cardView.entityView?.hasStandardEntityError)
    );
  }

  _getTemplateContext(): { entity?: string } {
    const entity = this._cardView?.config?.entity;
    return entity ? { entity } : {};
  }

  // HA sets both on the element itself when it renders a card in an editor
  // preview or the card picker (frontend's hui-card.ts / hui-badge.ts), so a
  // half-typed template is expected there and must not shout on every
  // keystroke. Neither is declared by our own class: they arrive as plain own
  // properties, hence the cast.
  get #isPreview(): boolean {
    const self = this as unknown as { preview?: boolean; editMode?: boolean };
    return Boolean(self.preview ?? self.editMode);
  }

  // A half-typed template fails on every keystroke: expected in a preview,
  // worth telling the user about only on a real dashboard - where it reads
  // like the deprecation notices, same prefix and same shape.
  #reportTemplateFailure(message: string, detail?: unknown) {
    if (this.#isPreview) this._log?.debug(message, detail);
    else cardNotice(message);
  }
}

export { JINJA_NUMBER_KEY, TREND_ICONS, RING_MAX_GAP, HACore };
export type { DivergingGradients, IconElement, JinjaNumberProp };
