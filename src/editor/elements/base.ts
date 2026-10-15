/*
 * EditorBase: the shared base class every per-card-type editor extends - builds
 * the expansion-panel form from a field definition tree and round-trips changes
 * to/from the config.
 */

import { CARD, CARD_CONTEXT, HA_CONTEXT } from '../../utils/parameters.js';
import { EDITOR_BASE_STYLE } from '../../utils/styles/editor.js';
import { is } from '../../utils/common-checks.js';
import { initLogger, type LoggerInstance } from '../../utils/log.js';
import { HassProviderSingleton, type HomeAssistant } from '../../utils/hass-provider.js';
import { type BaseConfigHelper } from '../../card/config/config-helpers.js';
import { EditorDOMHelper, type FieldUpdateContext } from '../form/dom-helper.js';
import { type LovelaceConfig, type FieldDef } from '../../utils/types.js';
import { buildEditorHeader } from './base/header.js';
import {
  ISOLATED_KEYS,
  assignOrUnset,
  canonicalOrder,
  changedTopLevelKeys,
  parkInertOptions,
  translateRingOrientation,
  withContextEntity,
} from '../data/config-flow.js';
import { CONTEXT_ENTITY_KEY } from '../factory.js';
import {
  FieldBuilder,
  resolveValue,
  splitFieldName,
  type EditorFieldElement,
  type HaExpansionPanel,
} from '../form/field-builder.js';

/**
 * Shared base for every per-card-type visual editor. Builds the
 * expansion-panel form from a subclass's static `_fields` tree (`EditorFactory`
 * output), and round-trips changes between the rendered `ha-selector`/chips
 * controls and the card config, via `_configHelper` (a `BaseConfigHelper`
 * subclass).
 *
 * @abstract
 * @extends HTMLElement
 */
class EditorBase extends HTMLElement {
  // skipcq: JS-0323 -- section/field definition tree, shape varies per subclass
  static _fields: Record<string, any> = {
    /* --- customize it
    general: {
      flat: true,
      fields: {
        entity: { name: 'entity', type: 'entity' },
      },
    },
    content: {
      title: 'editor.title.content',
      icon: 'mdi:text-short',
      fields: {
        name: { name: 'name', type: 'template' },
        secondary: { name: 'secondary', type: 'template' },
        percent: { name: 'percent', type: 'template' },
      },
    }, */
  };
  // ─── private state ────────────────────────────────────────────────────────
  #config: LovelaceConfig = {} as LovelaceConfig;
  // The config as of the last setConfig() call - the stable "previous" the
  // isolated-key diff compares against (this.#config is mutated by field
  // handlers between round-trips, so it can't serve as the baseline).
  #lastConfig: LovelaceConfig = {} as LovelaceConfig;
  // Always assigned first thing in the constructor - attachShadow()'s own
  // return value, not the nullable `this.shadowRoot` getter.
  #shadow!: ShadowRoot;
  #hassProvider: HassProviderSingleton = HassProviderSingleton.getInstance();
  #dom: EditorDOMHelper = new EditorDOMHelper();
  #boundOnChanged: ((e: Event) => void) | null = null;
  #pendingSentConfig: LovelaceConfig | null = null;
  #sendConfigScheduled = false;
  #debug = CARD_CONTEXT.debug.editor;
  #log: LoggerInstance | null = null;
  // `declare`: EditorBase is never instantiated, every subclass has its own.
  declare _configHelper: BaseConfigHelper;
  readonly #fields = new FieldBuilder({
    config: () => this.#config,
    hass: () => this.hass,
    configHelper: () => this._configHelper,
    dom: this.#dom,
    refreshPanel: (panel) => this.#refreshPanel(panel),
  });

  // ─── LIFECYCLE ────────────────────────────────────────────────────────────

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#log = initLogger(this, this.localName, this.#debug, ['setConfig']);
  }

  connectedCallback() {
    this.#boundOnChanged = this.#onChanged.bind(this);
    this.#render();
    this.#shadow.addEventListener(HA_CONTEXT.events.valueChanged, this.#boundOnChanged);
  }

  disconnectedCallback() {
    if (this.#boundOnChanged) this.#shadow.removeEventListener(HA_CONTEXT.events.valueChanged, this.#boundOnChanged);
    this.#boundOnChanged = null;
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────────────

  set hass(hass: HomeAssistant) {
    if (!hass) return;
    this.#hassProvider.hass = hass;
    this.#dom.updateHass(hass);
    // unit/decimal placeholders are entity-state-derived, so they must track
    // hass like the card re-renders: config negotiation ran hass-independently
    // (possibly before hass existed). Recompute the defaults and refresh just
    // those fields - updatePlaceholder's cache makes it a no-op when unchanged.
    this._configHelper.refreshDisplayDefaults();
    this.#updateFields(new Set(['unit', 'decimal']));
  }

  get hass(): HomeAssistant | null {
    return this.#hassProvider.hass;
  }

  // A feature's editor gets its host card's context (hui-element-editor.ts):
  // the entity the feature renders when it sets none of its own.
  // prettier-ignore
  set context(context: { entity_id?: string } | undefined) { // skipcq: JS-0041 -- Home Assistant only writes it
    const inherited = context?.entity_id;
    if (inherited === this.#config[CONTEXT_ENTITY_KEY]) return;
    this.#config = { ...this.#config, [CONTEXT_ENTITY_KEY]: inherited };
    if (Object.keys(this.#lastConfig).length === 0) return;
    this._configHelper.config = withContextEntity(this.#lastConfig, inherited);
    this._configHelper.refreshDisplayDefaults();
    this.#updateFields();
  }

  setConfig(config: LovelaceConfig) {
    if (!config) throw new Error(CARD.config.configError);
    // _-prefixed keys are ephemeral UI state (e.g. _visible_actions): stripped
    // from config-changed before dispatch so HA never saves them, but preserved
    // here across setConfig calls so the editor state survives HA's
    // config-changed → setConfig roundtrip.
    const uiState = Object.fromEntries(Object.entries(this.#config ?? {}).filter(([k]) => k.startsWith('_')));
    // Diff against the last config setConfig itself saw, NOT this.#config: the
    // field handlers (#handleStdField &c) update this.#config synchronously
    // before #sendConfig round-trips, so by the time HA calls setConfig back
    // this.#config already equals the incoming config (diff would be empty).
    // #lastConfig is touched only here, so it's a stable "previous".
    const changed = changedTopLevelKeys(config, this.#lastConfig);
    this.#lastConfig = config;
    this._configHelper.config = withContextEntity(config, uiState[CONTEXT_ENTITY_KEY]);
    this.#config = { ...config, ...uiState };
    // If every changed key is a known-isolated leaf, only its own field needs
    // refreshing - refresh just those instead of re-walking every visible
    // field. Any gating or unknown key (or an ambiguous multi-change) falls
    // back to the full pass.
    if (changed.size > 0 && [...changed].every((key) => ISOLATED_KEYS.has(key))) {
      this.#updateFields(changed);
    } else {
      this.#updateFields();
    }
  }

  // ─── RENDER (once) ────────────────────────────────────────────────────────

  #render() {
    if (this.#shadow.querySelector('.editor')) return;

    const style = document.createElement('style');
    style.textContent = EDITOR_BASE_STYLE;

    const container = document.createElement('div');
    container.className = 'editor';

    container.appendChild(
      buildEditorHeader({
        host: this,
        shadow: this.#shadow,
        dom: this.#dom,
        hassProvider: this.#hassProvider,
        configHelper: () => this._configHelper,
        lastConfig: () => this.#lastConfig,
        offersIssueReport: (this.constructor as typeof EditorBase)._offersIssueReport,
        parksInertOptions: (this.constructor as typeof EditorBase)._parksInertOptions,
      }),
    );

    for (const [section, def] of Object.entries((this.constructor as typeof EditorBase)._fields)) {
      container.appendChild(this.#fields.buildExpansionPanel(section, def));
    }

    this.#shadow.append(style, container);
  }

  // ─── UPDATE (every setConfig) ─────────────────────────────────────────────

  // CF5 - issue (major) resolved - setConfig() is called on every keystroke of
  // the raw YAML editor too (HA keeps the visual editor instance mounted, just
  // hidden, while "Edit in YAML" is active) — this used to run the full
  // #applyUpdateFields() pass (iterate every registered field: showIf,
  // selectorOf, context, value) synchronously on every single character typed,
  // with no throttling, unlike #sendConfig which only covers the outgoing
  // direction. rAF-coalescing here mirrors that fix for the incoming direction:
  // whatever #config/_configHelper.config hold when the frame finally runs is
  // always the latest, since those are still assigned synchronously in
  // setConfig() — only the expensive DOM pass is deferred and collapsed to at
  // most once per frame.
  #updateFieldsScheduled = false;
  // The widest scope requested for the pending frame: null = nothing yet,
  // 'full' = walk every visible field, a Set = only the fields writing those
  // keys. A 'full' request always wins; otherwise successive calls union
  // their keys (two isolated edits in one frame → both refreshed).
  #pendingScope: 'full' | Set<string> | null = null;

  #updateFields(changedKeys?: Set<string>) {
    if (changedKeys === undefined) {
      this.#pendingScope = 'full';
    } else if (this.#pendingScope !== 'full') {
      const set = this.#pendingScope ?? new Set<string>();
      for (const key of changedKeys) set.add(key);
      this.#pendingScope = set;
    }
    if (this.#updateFieldsScheduled) return;
    this.#updateFieldsScheduled = true;
    requestAnimationFrame(() => {
      this.#updateFieldsScheduled = false;
      const scope = this.#pendingScope;
      this.#pendingScope = null;
      if (scope === 'full') this.#applyUpdateFields();
      else if (scope) this.#updateChangedFields(scope);
    });
  }

  // Shared by #applyUpdateFields (all visible fields) and #refreshPanel (one
  // panel's fields) - both need the same resolveValue/negotiated/resolveType
  // closures, differing only in which fields they walk. template/action
  // fields (and custom_theme_editor) read from raw config to avoid Jinja
  // flicker during typing: the validated config would fall back to a
  // default the moment the expression is temporarily malformed. All other
  // fields read from the negotiated config so entity defaults show up
  // immediately.
  #runFieldUpdate(walk: (ctx: FieldUpdateContext) => void) {
    const negotiated = this._configHelper.config;
    walk({
      config: this.#config,
      resolveValue: (def, raw) => resolveValue(def, raw, negotiated),
      negotiated,
      resolveType: (def, c) => this.#fields.getSelectorForType(def.type(c)),
    });
  }

  #applyUpdateFields() {
    this.#runFieldUpdate((ctx) => this.#dom.updateAll(ctx));
  }

  #refreshPanel(panel: HaExpansionPanel) {
    this.#runFieldUpdate((ctx) => this.#dom.updatePanel(panel, ctx));
  }

  #updateChangedFields(keys: Set<string>) {
    this.#runFieldUpdate((ctx) => this.#dom.updateKeys(keys, ctx));
  }

  // ─── SUB-EDITOR HOST ──────────────────────────────────────────────────────
  // A subclass that hosts an editor of its own (the Multi swaps its whole form
  // for one row's, see editors.ts) needs two things no field of its own can
  // give it: the raw config to read defaults off, and a way to write a change
  // back through the same path a field write takes - same round trip, same
  // update pass, same _-prefixed stripping.
  get _rawConfig(): LovelaceConfig {
    return this.#config;
  }

  // Replaces, never merges: the Multi cascade's job includes taking a key off
  // the shared level, and a spread would put it straight back.
  _replaceConfig(next: LovelaceConfig) {
    this.#config = next;
    this.#updateFields();
    this.#sendConfig(this.#config);
  }

  // The form itself, so a host can put something else in its place.
  get _formEl(): HTMLElement | null {
    return this.#shadow.querySelector('.editor');
  }

  // ─── EVENTS ───────────────────────────────────────────────────────────────

  #handleVirtualField(def: FieldDef, value: unknown) {
    if (!def.onVirtualChange) return;
    const newConfig = def.onVirtualChange(value, { ...this.#config });
    if (newConfig) {
      this.#config = newConfig;
      // Update ourselves (next frame): HA may skip calling setConfig back if
      // the stripped config is unchanged, so the round trip alone isn't enough.
      this.#updateFields();
      this.#sendConfig(newConfig);
    }
  }

  // The parent stays even once emptied: its presence is what turns the section
  // on - its toggle reads it, and a bare `watermark: {}` draws both marks.
  #handleNestedField(parentKey: string, childKey: string, value: unknown) {
    this.#config = { ...this.#config, [parentKey]: assignOrUnset(this.#config[parentKey], childKey, value) };
    this.#sendConfig(this.#config);
  }

  #handleStdField(def: FieldDef | undefined, key: string, value: unknown) {
    const newConfig = assignOrUnset(this.#config, def?.target ?? key, value);
    if (is.nullishOrEmptyString(value) && def?.onClear) this.#config = def.onClear(newConfig);
    else this.#config = def?.onChange ? def.onChange(value, newConfig, this.#config) : newConfig;
    this.#sendConfig(this.#config);
  }

  #onChanged(e: Event) {
    const target = e.target as EditorFieldElement;
    const key = target.id;
    const detail = (e as CustomEvent).detail;
    if (!key || !detail || !('value' in detail)) return;

    const def = (this.#dom.get(key) as EditorFieldElement | undefined)?._fieldDef;
    let value = detail.value;

    if (def?.virtual) {
      this.#handleVirtualField(def, value);
      return;
    }

    const isInverted = target?.isInverted ?? false;
    const { parentKey, childKey } = splitFieldName(key);

    if (isInverted) value = !value;

    if (childKey !== null) this.#handleNestedField(parentKey, childKey, value);
    else this.#handleStdField(def, key, value);
  }

  // CF5 - issue (major) resolved - a single #sendConfig() round trip is
  // expensive: dispatching config-changed makes HA call setConfig back on this
  // editor (full schema re-validation + #updateFields over every registered
  // field) AND re-render the separate preview card. A number field's native
  // spinner arrows fire a native 'input' event on every repeat while held
  // (browser auto-repeat, ~20-30/s) — each one used to trigger that full round
  // trip synchronously, and once the round-trip cost caught up with the repeat
  // rate the event queue backlogged faster than it could drain, which is what
  // Chrome's "Page Unresponsive" warning reports. rAF-coalescing collapses any
  // burst arriving within/faster than a frame into a single dispatch of the
  // latest config — each individual input event now only does O(1) work (store
  // + maybe schedule), so the browser can no longer fall behind regardless of
  // how fast native events fire. The 1-frame delay (~16ms) is not perceptible.
  // Whether the config is whole enough to tell where an option works: the
  // Multi's shared level isn't, and settles its own way (editors.ts).
  static _parksInertOptions = true;
  // A Multi row's report would hold one row: the whole card's is on the Multi.
  static _offersIssueReport = true;

  // Last word on a config before it leaves: options without effect are parked.
  _settle(config: LovelaceConfig): LovelaceConfig {
    return parkInertOptions(translateRingOrientation(config));
  }

  #sendConfig(rawConfig: LovelaceConfig) {
    const config = this._settle(rawConfig);
    this.#config = config;
    // Strip _-prefixed UI state keys (editor-only, must never reach the saved
    // YAML) and any top-level key carrying a dot - no option here is ever
    // spelled that way, a nested one is a map. The only thing that ever wrote
    // one was lengthField addressing 'watermark.line_size' as a key instead of
    // a path; the value was inert (the schema never read it), so a config
    // still holding one loses nothing by having it swept on its next edit.
    // Then normalize key order (entity on top, HA layout meta at the bottom -
    // see #canonicalOrder).
    this.#pendingSentConfig = canonicalOrder(
      Object.fromEntries(
        Object.entries(config).filter(([key]) => !key.startsWith('_') && !key.includes('.')),
      ) as LovelaceConfig,
    );
    if (this.#sendConfigScheduled) return;
    this.#sendConfigScheduled = true;

    requestAnimationFrame(() => {
      this.#sendConfigScheduled = false;
      const clean = this.#pendingSentConfig;
      this.#pendingSentConfig = null;
      this.#log?.debug('config-changed →', clean);
      this.dispatchEvent(
        new CustomEvent(HA_CONTEXT.events.configChanged, {
          detail: { config: clean },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }
}

export { EditorBase };
