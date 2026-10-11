/*
 * HACore and HABase: the base classes implementing the shared
 * card/badge/feature lifecycle (setConfig, render, hass updates, auto-refresh)
 * that every concrete card type extends.
 */

import { VERSION, META, CARD_CONTEXT, suffixedName, HA_CONTEXT, CARD } from '../utils/parameters.js';
import { CARD_CSS, getSharedStyleSheet } from '../utils/styles.js';
import { is, assertDefined, toNumberOrNull } from '../utils/common-checks.js';
import { initLogger, cardNotice, type LoggerInstance } from '../utils/log.js';
import { ObjStructure, ThemeManager, ChangeTracker } from './value-helpers.js';
import { hasUsableHistory } from './entity-helper.js';
import { HassProviderSingleton, loadEditor, type HomeAssistant, type EntityState } from '../utils/hass-provider.js';
import { type ViewCore, type ResolvedWatermark } from './view.js';
import {
  statusLabelObj,
  markValue,
  entityOf,
  type ValueConfig,
  SCHEMA_DEFAULTS,
  BAR_POSITIONS,
  BAR_AROUND_ICON,
  BAR_SIZES,
  raisesRainbowFullRow,
  ICON_ANIMATIONS,
  OWN_TRIGGER_ANIMATIONS,
  HAS_EFFECT,
} from './schema.js';
import { ResourceManager, DOMHelper, ActionHelper } from './dom-helpers.js';
import { JinjaSubscriptions } from './jinja-subscriptions.js';
import { StatusLabel } from './status-label.js';
import { Alert } from './alert.js';
import { Marks } from './marks.js';
import { joinAlignedRows } from './aligned-bars.js';
import type { CacheValue } from './dom-helpers.js';
import type { LovelaceConfig, Config } from '../utils/types.js';
import type { StructureOptions } from './structure.js';

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
      '_fetchHistory',
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

  // One entry per history-backed feature (peak_marker here, trend_indicator
  // on EntityProgressCardBase) - see _seedFromHistory.
  #seedSignatures = new Map<string, string>();

  // null when `window` or `entity` is absent/invalid (nothing to seed yet -
  // Feature's own entity can still be pending its parent Tile's context).
  _seedSignature(window: unknown): string | null {
    const config = this._cardView.config;
    if (!is.number(window) || !config.entity) return null;
    return `${config.entity} ${config.attribute ?? ''} ${window}`;
  }

  /**
   * The seeding contract every history-backed feature shares: run once per
   * (entity, attribute, window), and drop a reply whose signature moved while
   * the fetch was in flight. Only what to do with the points is the feature's
   * own - written once here so the race guard can't be right in one place and
   * wrong in the other.
   */
  _seedFromHistory(
    key: string,
    config: unknown,
    apply: (points: { t: number; value: number }[]) => void,
    onStart?: () => void,
  ) {
    const window = is.plainObject(config) ? config.window : undefined;
    const signature = this._seedSignature(window);
    if (signature === null || signature === this.#seedSignatures.get(key)) return;
    this.#seedSignatures.set(key, signature);
    onStart?.();
    this._fetchHistory(window as number)
      .then((points) => {
        if (points.length && signature === this.#seedSignatures.get(key)) apply(points);
      })
      .catch(() => {
        // best-effort: the feature simply goes unseeded, the card is unaffected
      });
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

  // Shares one in-flight WS call when trend/peak_marker share a window.
  #inFlightHistoryFetches = new Map<number, Promise<{ t: number; value: number }[]>>();

  async _fetchHistory(windowSeconds: number): Promise<{ t: number; value: number }[]> {
    const cached = this.#inFlightHistoryFetches.get(windowSeconds);
    if (cached) return await cached;
    const promise = this.#fetchHistoryUncached(windowSeconds).finally(() =>
      this.#inFlightHistoryFetches.delete(windowSeconds),
    );
    this.#inFlightHistoryFetches.set(windowSeconds, promise);
    return await promise;
  }

  // Raw {timestamp, state} points for `entity` over the last `windowSeconds`,
  // or [] if the entity/window is ineligible (attribute:, timer/counter/
  // duration - recorder keeps no attribute history) or the fetch fails.
  async #fetchHistoryUncached(windowSeconds: number): Promise<{ t: number; value: number }[]> {
    const { entity, attribute } = this._cardView.config;
    if (!hasUsableHistory(entity, attribute)) {
      this._log?.debug('_fetchHistory: ineligible', { entity, attribute });
      return [];
    }

    const hass = this.hass;
    if (!hass?.connection?.connected) {
      this._log?.debug('_fetchHistory: no live connection', { connected: hass?.connection?.connected });
      return [];
    }

    const cappedWindow = Math.min(windowSeconds, CARD.config.history.maxWindowSeconds);
    // Compressed-state reply (s/lu, not state/last_updated; lu is epoch
    // seconds) - see history/websocket_api.py's _history_compressed_state().
    const result = (await hass.connection.sendMessagePromise({
      type: HA_CONTEXT.ws.historyDuringPeriod,
      start_time: new Date(Date.now() - cappedWindow * 1000).toISOString(),
      entity_ids: [entity],
      no_attributes: true,
    })) as Record<string, { s: string; lu: number }[]> | undefined;
    this._log?.debug('_fetchHistory: raw result', result);

    const points = (result?.[entity] ?? [])
      .map((point) => {
        const value = Number(point.s);
        const timestamp = point.lu * 1000;
        return Number.isFinite(value) && Number.isFinite(timestamp) ? { t: timestamp, value } : null;
      })
      .filter((point): point is { t: number; value: number } => point !== null);
    this._log?.debug(`_fetchHistory: ${points.length} usable point(s)`);
    return points;
  }

  #applyPeakMarkerHistory(points: { t: number; value: number }[]) {
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
    this._applyWatermarkCSS(bar.hasWatermark ? bar.watermark : null);
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
  _icon: IconElement | null = null;
  // `declare`: every HABase subclass assigns its own real view (Card/Badge
  // for card types, CardTemplateView/BadgeTemplateView for template ones).
  declare _cardView: ViewCore;
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
  #statusLabel = new StatusLabel(() => this._dom);
  #alert = new Alert({
    view: () => this._cardView,
    dom: () => this._dom,
    toggleClasses: (style) => this._toggleClasses(style),
    statusLabel: this.#statusLabel,
    repaintStatusLabel: () => this._repaintStatusLabel(),
  });

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
  setConfig(config: LovelaceConfig) {
    super.setConfig(config);
    this.#jinjaStateBadge = { icon: false, color: false };
    this.#badgeIconValue = null;
    this.#badgeIconObjectColor = null;
    this.#badgeColorFieldValue = null;
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
      this._cardView.jinjaState.setResolvedHide(items);
    }

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

  // Shared with EntityProgressTemplateBase's own _updateTrend (cards.ts).
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

  // A Badge can't show an inner badge-icon overlay of its own - same
  // condition as hasDisabledIconTap above.
  get hasDisabledBadge(): boolean {
    return this._isBadge;
  }

  _showBadge() {
    if (this.hasDisabledBadge) return;
    const badgeInfo = this._cardView.entityView?.badgeInfo;
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
    if (!is.nullish(this._cardView.entityView?.badgeInfo)) return; // alert -> cancel custom badge
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

  // Shared by EntityProgressBadge/EntityProgressTemplateBadge's own
  // _getJinjaHandlers overrides - a badge never has a badge of its own.
  // Static (no instance state) - called as HABase._stripBadgeHandlers(...).
  static _stripBadgeHandlers(handlers: Record<string, () => void>): Record<string, () => void> {
    delete handlers.badge_icon;
    delete handlers.badge_color;
    return handlers;
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
    // Defensive: only apply while the option is still in { jinja: "..." } mode:
    // guards against a push landing as the user switches the mode chips away.
    if (!is.nonEmptyString(getJinja(this._cardView.config))) return;
    const state = this._cardView.jinjaState;
    const value = toNumberOrNull(content);
    const key = JINJA_NUMBER_KEY[viewProp];
    // A result that is no number (an 'unavailable' state) fails like a refusal.
    const failure = value === null ? '' : null;
    if (value === state[viewProp] && failure === state.failure(key)) return;
    state[viewProp] = value;
    state.setFailure(key, failure);
    repaint();
  }

  _onJinjaFailure(key: string, message: string) {
    if (!Object.values(JINJA_NUMBER_KEY).includes(key)) return super._onJinjaFailure(key, message);
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
    if (this.#statusLabel.alertOwns) return;
    this.#statusLabel.receive(content);
    this._repaintStatusLabel();
  }

  // Also called on every refresh and from cards.ts's color pushes, not just
  // from _renderLabel: status_label may never push again after percent settles.
  _repaintStatusLabel() {
    if (this.#statusLabel.alertOwns) return;
    const text = this.#statusLabel.text;
    if (text === null) return;
    // status_label.color_source picks the fallback when its `jinja` returns no
    // explicit {label, color}: 'bar' by default (see schema.ts).
    const fallbackColor =
      statusLabelObj(this._cardView.config?.status_label).color_source === 'icon'
        ? this._cardView.iconColor
        : this._cardView.barColor;
    this.#statusLabel.paint(text, this.#statusLabel.color ?? fallbackColor ?? CARD.style.color.default);
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
    const [line1, line2] = this._splitAtFirstBreak(content);
    const elements = CARD.htmlStructure.elements;
    this._dom.setHTML(elements.secondaryInfoExtra.class, format(line1, false));
    if (multiline) this._dom.setHTML(elements.secondaryInfoExtra2.class, format(line2 ?? '', true));
    this._secondaryInfoEmpty.extra1 = line1.trim() === '';
    this._secondaryInfoEmpty.extra2 = (line2 ?? '').trim() === '';
    this._updateSecondaryInfoWrapperVisibility();
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

export { HACore };
export { HABase };
