/*
 * EditorBase: the shared base class every per-card-type editor extends - builds
 * the expansion-panel form from a field definition tree and round-trips changes
 * to/from the config.
 */

import { CARD, CARD_CONTEXT, VALUE_CHANGED_EVENT, HA_SELECTOR_TAG, EDITOR_FIELD_NS } from '../utils/parameters.js';
import { TRANSLATIONS } from '../utils/translations.js';
import { EDITOR_BASE_STYLE } from '../utils/styles.js';
import { is } from '../utils/common-checks.js';
import { initLogger, type LoggerInstance } from '../utils/log.js';
import { HassProviderSingleton, type HomeAssistant } from '../utils/hass-provider.js';
import { BaseConfigHelper } from '../card/config-helpers.js';
import { EditorDOMHelper } from './dom-helper.js';
import type { LovelaceConfig, Config, FieldDef } from '../utils/types.js';
import {
  EntityProgressEffectChips,
  EntityProgressHideChips,
  EntityProgressValueSourceModeChips,
  EntityProgressThemeModeChips,
  EntityProgressBarStackModeChips,
} from './chips.js';
import { EntityProgressBarStackEditor, EntityProgressCustomThemeEditor } from './list-editors.js';

// Every dynamic editor field element built below (ha-selector, the chip
// custom elements from chips.ts, the list editors from list-editors.ts)
// shares this loose shape: a standard HTMLElement plus whichever of these
// properties/methods that particular element family actually implements -
// too heterogeneous across 4+ different custom element families to model
// more precisely (mirrors list-editors.ts's own HaSelectorElement).
type EditorFieldElement = HTMLElement & {
  label?: string;
  value: unknown;
  hass?: HomeAssistant | null;
  isArray?: boolean;
  isInverted?: boolean;
  context?: Record<string, unknown>;
  selector?: Record<string, unknown>;
  required?: boolean;
  items?: unknown;
  setLabels?: (labels: unknown) => void;
  _fieldDef?: FieldDef;
};

// One of EditorFactory's top-level sections (general/content/theme/
// interactions) - see factory.ts.
type SectionDef = { flat?: boolean; title?: string; icon?: string; fields: Record<string, FieldDef> };

// HA's ha-expansion-panel, reduced to the `expanded` boolean we read for the
// collapsed-panel field-update skip (see EditorDOMHelper.updateAll).
type HaExpansionPanel = HTMLElement & { header: string; outlined: boolean; expanded: boolean };

// Resolves a field's current value from the (raw) config - the one closure
// #applyUpdateFields and #refreshPanel share (see #runFieldUpdate).
type FieldValueResolver = (def: FieldDef, config: LovelaceConfig) => unknown;

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
  // "Isolated" (leaf) config keys: nothing else's showIf / value / selector /
  // width / context reads them (verified against every reactive read in
  // EditorFactory), so changing one of them can't affect any other field.
  // When a setConfig round-trip changed only isolated keys, EditorBase
  // refreshes just those fields instead of re-walking every visible field
  // (see setConfig). Deliberately an explicit allowlist, not a computed set:
  // a key absent here (a gating key, or a newly-added field) safely falls
  // back to the full walk - only a wrongly-listed key here could stale the
  // UI, so additions must be checked against the factory's reactive reads.
  static #ISOLATED_KEYS: ReadonlySet<string> = new Set([
    'name',
    'name_info',
    'secondary',
    'custom_info',
    'multiline',
    'unit',
    'unit_spacing',
    'decimal',
    'icon',
    'icon_animation',
    'color',
    'bar_color',
    'bar_scale',
    'bar_segments',
    'bar_single_line',
    'interpolate',
    'text_shadow',
    'reverse',
    'reverse_secondary_info_row',
    'force_circular_background',
    'frameless',
    'marginless',
    'height',
    'min_width',
    'badge_icon',
    'badge_color',
    'tap_action',
    'hold_action',
    'double_tap_action',
    'icon_tap_action',
    'icon_hold_action',
    'icon_double_tap_action',
  ]);

  // Top-level keys whose value differs between two configs, ignoring the
  // _-prefixed editor UI state (which never round-trips through setConfig - a
  // draft change goes through #handleVirtualField → a full #updateFields()).
  static #changedTopLevelKeys(next: LovelaceConfig, prev: LovelaceConfig | undefined): Set<string> {
    const changed = new Set<string>();
    const keys = new Set([...Object.keys(next), ...Object.keys(prev ?? {})].filter((k) => !k.startsWith('_')));
    for (const key of keys) {
      if (JSON.stringify(next[key]) !== JSON.stringify(prev?.[key])) changed.add(key);
    }
    return changed;
  }

  // Canonical key order for the config the editor writes back (see
  // #sendConfig) - purely cosmetic (YAML key order, no semantics; HA compares
  // configs by value): `type` then `entity` on top, and HA's own
  // framework-level card meta keys pinned to the bottom, in the declaration
  // order of home-assistant-frontend's LovelaceCardConfig interface. Every
  // other key keeps its existing relative order in between.
  static #TOP_KEYS = ['type', 'entity'];
  static #BOTTOM_KEYS = ['layout_options', 'grid_options', 'view_layout', 'visibility', 'disabled'];

  static #canonicalOrder(config: LovelaceConfig): LovelaceConfig {
    const isAnchor = (key: string) => EditorBase.#TOP_KEYS.includes(key) || EditorBase.#BOTTOM_KEYS.includes(key);
    const ordered: Record<string, unknown> = {};
    for (const key of EditorBase.#TOP_KEYS) if (key in config) ordered[key] = config[key];
    for (const key of Object.keys(config)) if (!isAnchor(key)) ordered[key] = config[key];
    for (const key of EditorBase.#BOTTOM_KEYS) if (key in config) ordered[key] = config[key];
    return ordered as LovelaceConfig;
  }

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
  _configHelper: BaseConfigHelper = new BaseConfigHelper();

  // Same dynamic-tree-lookup rationale as HassProviderSingleton.localize()
  // (hass-provider.ts): typing this precisely would mean modeling the entire
  // translations.json option tree for a handful of call sites below.
  // skipcq: JS-0323 -- untyped translations option tree (see comment above)
  get #localizedOptions(): any {
    // CF5 - issue (minor) resolved - localize() returns the key string before
    // translations load; select builders then crashed on
    // Object.entries(undefined). Fall back to the default language.
    const options = this.#hassProvider.localizeGroup('editor.option');
    return is.plainObject(options)
      ? options
      : TRANSLATIONS[CARD.config.language as keyof typeof TRANSLATIONS].editor.option;
  }

  // ─── LIFECYCLE ────────────────────────────────────────────────────────────

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#log = initLogger(this, this.#debug, ['setConfig']);
  }

  connectedCallback() {
    this.#boundOnChanged = this.#onChanged.bind(this);
    this.#render();
    this.#shadow.addEventListener(VALUE_CHANGED_EVENT, this.#boundOnChanged);
  }

  disconnectedCallback() {
    if (this.#boundOnChanged) this.#shadow.removeEventListener(VALUE_CHANGED_EVENT, this.#boundOnChanged);
    this.#boundOnChanged = null;
    // this.#dom.destroy();
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────────────

  set hass(hass: HomeAssistant) {
    if (!hass) return;
    this.#hassProvider.hass = hass;
    this.#dom.updateHass(hass);
  }

  get hass(): HomeAssistant | null {
    return this.#hassProvider.hass;
  }

  setConfig(config: LovelaceConfig) {
    if (!config) throw new Error(CARD.config.configError);
    // _-prefixed keys are ephemeral UI state (e.g. _show_all_actions): stripped
    // from config-changed before dispatch so HA never saves them, but preserved
    // here across setConfig calls so the editor state survives HA's
    // config-changed → setConfig roundtrip.
    const uiState = Object.fromEntries(Object.entries(this.#config ?? {}).filter(([k]) => k.startsWith('_')));
    // Diff against the last config setConfig itself saw, NOT this.#config: the
    // field handlers (#handleStdField &c) update this.#config synchronously
    // before #sendConfig round-trips, so by the time HA calls setConfig back
    // this.#config already equals the incoming config (diff would be empty).
    // #lastConfig is touched only here, so it's a stable "previous".
    const changed = EditorBase.#changedTopLevelKeys(config, this.#lastConfig);
    this.#lastConfig = config;
    this._configHelper.config = config;
    this.#config = { ...config, ...uiState };
    // If every changed key is a known-isolated leaf, only its own field needs
    // refreshing - refresh just those instead of re-walking every visible
    // field. Any gating or unknown key (or an ambiguous multi-change) falls
    // back to the full pass.
    if (changed.size > 0 && [...changed].every((key) => EditorBase.#ISOLATED_KEYS.has(key))) {
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

    container.appendChild(this.#buildMigrateHeader());

    for (const [section, def] of Object.entries((this.constructor as typeof EditorBase)._fields)) {
      container.appendChild(this.#buildExpansionPanel(section, def));
    }

    this.#shadow.append(style, container);
  }

  // Deprecated options this card can rewrite in one click, top-right of the
  // editor — see docs/troubleshooting.md#deprecated-options for the user-facing
  // explanation. Aliases mirror types.theme's own internal remap exactly (kept
  // in sync manually: both are small, frozen/historical lists that are very
  // unlikely to grow further).
  static #THEME_ALIASES: Record<string, string> = {
    battery: 'optimal_when_high',
    memory: 'optimal_when_low',
    cpu: 'optimal_when_low',
  };

  static #hasDeprecatedOptions(config: LovelaceConfig): boolean {
    return Boolean(
      is.nonEmptyString(config?.max_value) ||
      config?.disable_unit !== undefined ||
      is.array(config?.additions) ||
      config?.navigate_to !== undefined ||
      config?.show_more_info !== undefined ||
      EditorBase.#THEME_ALIASES[config?.theme],
    );
  }

  // Rewrites deprecated syntax to its modern equivalent only — never the
  // unrelated defaults _customizeConfig also applies (center_zero's min_value
  // fill-in, device_class attribute defaults), so the button only ever changes
  // what it documents. `navigate_to`/`show_more_info` are deleted rather than
  // converted to tap_action: both have been fully inert since v1.2.0, so
  // reconstructing one from a value that hasn't run in years would be a guess,
  // not a migration — and could clobber a tap_action the user configured since.
  // max_value/disable_unit/additions are delegated to the active config
  // helper's own _migrateLegacyOptions, so Template editors (whose schema never
  // had those options) safely no-op there instead of needing a special case.
  static #migrateDeprecatedConfig(config: LovelaceConfig, configHelper: BaseConfigHelper): LovelaceConfig {
    let migrated = (configHelper.constructor as typeof BaseConfigHelper)._migrateLegacyOptions(config);
    const themeAlias = EditorBase.#THEME_ALIASES[migrated.theme];
    if (themeAlias) migrated = { ...migrated, theme: themeAlias };
    if (migrated.navigate_to !== undefined) migrated = { ...migrated, navigate_to: undefined };
    if (migrated.show_more_info !== undefined) migrated = { ...migrated, show_more_info: undefined };
    return migrated;
  }

  #buildMigrateHeader(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'migrate-header';

    const button = document.createElement('ha-button');
    const fieldName = '_migrate_config';
    button.id = fieldName;
    button.append(this.#hassProvider.localizeGroup(EDITOR_FIELD_NS)?.migrate_config ?? 'Migrate config');
    button.addEventListener('click', () => {
      button.dispatchEvent(
        new CustomEvent(VALUE_CHANGED_EVENT, { detail: { value: true }, bubbles: true, composed: true }),
      );
    });

    const field = {
      name: fieldName,
      virtual: true,
      showIf: (config: LovelaceConfig) => EditorBase.#hasDeprecatedOptions(config),
      onVirtualChange: (_value: unknown, config: LovelaceConfig) =>
        EditorBase.#migrateDeprecatedConfig(config, this._configHelper),
    } as unknown as FieldDef;
    this.#dom.registerField(fieldName, button, field);

    wrapper.appendChild(button);
    return wrapper;
  }

  #buildExpansionPanel(section: string, def: SectionDef): DocumentFragment | HTMLElement {
    if (def.flat) {
      const frag = document.createDocumentFragment();
      for (const field of Object.values(def.fields)) {
        frag.appendChild(this.#buildField(field));
      }
      return frag;
    }

    const panel = document.createElement('ha-expansion-panel') as HaExpansionPanel;
    panel.header = this.#hassProvider.localize(def.title ?? '');
    panel.outlined = true;
    // Fields in a collapsed panel are skipped by updateAll (see
    // EditorDOMHelper) - refresh them the moment the panel opens, so a change
    // made while it was collapsed (another field, or a switch to the raw YAML
    // editor and back) shows up right as they become visible. Fires on first
    // open too, which is what makes an initially-collapsed panel correct.
    panel.addEventListener('expanded-changed', (e) => {
      if ((e as CustomEvent<{ expanded: boolean }>).detail.expanded) this.#refreshPanel(panel);
    });

    if (def.icon) {
      const icon = document.createElement('ha-icon');
      icon.setAttribute('icon', def.icon);
      icon.slot = 'leading-icon';
      panel.appendChild(icon);
    }

    const body = document.createElement('div');
    body.className = 'panel-body';

    for (const field of Object.values(def.fields)) {
      body.appendChild(this.#buildField(field));
    }

    panel.appendChild(body);

    return panel;
  }

  #getSelectorForType(type: string): Record<string, unknown> {
    const buildSelect = (opts: Record<string, string>) => ({
      select: { options: Object.entries(opts).map(([value, label]) => ({ value, label })), mode: 'dropdown' },
    });

    const buildBoxSelect = (
      opts: Record<string, string>,
      imageFn: ((value: string) => Record<string, unknown>) | null = null,
    ) => ({
      // see
      // https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/config-elements/hui-tile-card-editor.ts#L158
      select: {
        mode: 'box',
        options: Object.entries(opts).map(([value, label]) => ({
          value,
          label,
          ...(imageFn ? { image: imageFn(value) } : {}),
        })),
      },
    });
    const options = this.#localizedOptions;
    const tileImage = (value: string) => ({
      // see
      // https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/config-elements/hui-tile-card-editor.ts#L158
      src: `/static/images/form/tile_content_layout_${value}.svg`,
      src_dark: `/static/images/form/tile_content_layout_${value}_dark.svg`,
      flip_rtl: true,
    });

    const selectors: Record<string, () => Record<string, unknown>> = {
      text: () => ({ text: { mode: 'box' } }),
      entity: () => ({ entity: {} }),
      entity_name: () => ({ entity_name: {} }),
      state_content: () => ({ ui_state_content: { allow_context: true } }),
      attribute: () => ({ attribute: { entity_id: this.#config.entity ?? '' } }),
      maxValueAttribute: () => ({ attribute: { entity_id: this.#config.max_value?.entity ?? '' } }),
      minValueAttribute: () => ({ attribute: { entity_id: this.#config.min_value?.entity ?? '' } }),
      number: () => ({ number: {} }),
      decimal: () => ({ number: { min: 0, max: 10, mode: 'box' } }),
      opacity: () => ({ number: { min: 0, max: 1, step: 0.05, mode: 'box' } }),
      slider: () => ({ number: { min: 0, max: 300, step: 1, mode: 'slider', unit_of_measurement: 'px' } }),
      template: () => ({ template: {} }),
      toggle: () => ({ boolean: {} }),
      action: () => ({ 'ui-action': {} }),
      icon: () => ({ icon: { icon_set: ['mdi'] } }),
      color: () => ({ 'ui-color': {} }),
      default: () => ({ text: { mode: 'box' } }),
      bar_size: () => buildSelect(options.bar_size),
      // Badge/BadgeTemplate schemas reject 'xlarge' (see
      // YamlSchemaFactory.badge) - reuses the same translated labels.
      bar_size_no_xlarge: () =>
        buildSelect({ small: options.bar_size.small, medium: options.bar_size.medium, large: options.bar_size.large }),
      bar_orientation: () => buildSelect(options.bar_orientation),
      // Badge/BadgeTemplate schemas reject 'up' (see YamlSchemaFactory.badge)
      // - reuses the same translated ltr/rtl labels, just without the option
      // that would silently fall back to 'ltr' on save.
      bar_orientation_no_up: () => buildSelect({ ltr: options.bar_orientation.ltr, rtl: options.bar_orientation.rtl }),
      bar_position: () => buildSelect(options.bar_position),
      bar_color_mode: () => buildSelect(options.bar_color_mode),
      bar_scale: () => buildSelect(options.bar_scale),
      icon_animation: () => buildSelect(options.icon_animation),
      alert_highlight: () => buildSelect(options.alert_highlight),
      alert_animation: () => buildSelect(options.alert_animation),
      theme: () => buildSelect(options.theme),
      layout: () => buildBoxSelect(options.layout, tileImage),
      unit_spacing: () => buildSelect(options.unit_spacing),
      watermark_type: () => buildSelect(options.watermark_type),
      watermark_as: () => buildSelect(options.watermark_as),
      watermarkLowAttribute: () => ({ attribute: { entity_id: this.#config?.watermark?.low ?? '' } }),
      watermarkHighAttribute: () => ({ attribute: { entity_id: this.#config?.watermark?.high ?? '' } }),
    };

    return (selectors[type] ?? (() => ({ text: {} })))();
  }

  // Dot-path field names ('watermark.low') address a nested config key;
  // shared by #resolveFieldMeta (label lookup) and #resolveValue (value
  // lookup) so the parsing convention lives in exactly one place.
  static #splitFieldName(name: string): { isNested: boolean; parentKey: string; childKey: string | null } {
    const isNested = name.includes('.');
    const [parentKey, childKey] = isNested ? name.split('.') : [name, null];
    return { isNested, parentKey, childKey };
  }

  #resolveFieldMeta(field: FieldDef): { label: string | undefined; value: unknown; isInverted: boolean } {
    const { isNested, parentKey, childKey } = EditorBase.#splitFieldName(field.name);
    // CF5 - issue (medium) resolved - this used to pass only the negotiated
    // config (as #resolveValue's `rawConfig` param, with `negotiated` left
    // null), so a virtual field's build-time initial value was computed off
    // the validated config instead of what was actually typed/saved. Visible
    // with an incomplete custom_theme zone (min set, max not yet filled): the
    // schema strips it entirely, so theme_mode's initial chip showed "preset"
    // even though the custom_theme row editor (correctly raw-sourced) still
    // showed the zone - and nothing re-synced it afterward, since
    // connectedCallback never calls #updateFields(). Now mirrors
    // #applyUpdateFields's own raw/negotiated split exactly.
    const raw = EditorBase.#resolveValue(field, this.#config, this._configHelper.config);
    const isInverted = field.invert ?? false;

    return {
      label: field.noLabel
        ? ''
        : (() => {
            const explicit = isNested
              ? this.#localizedOptions?.[parentKey]?.[childKey!]
              : this.#hassProvider.localizeGroup(EDITOR_FIELD_NS)[field.name];
            if (explicit !== undefined) return explicit;
            // Guard rail: keep the "<Noun> color" pattern already established
            // by badge_color/bar_color/color/alert_when.color for any future
            // "..._color" field that ships without its own translation yet,
            // instead of silently falling back to the raw key name.
            const colorMatch = !isNested && field.name.match(/^(.+)_color$/);
            if (colorMatch) {
              const noun = colorMatch[1].replace(/_/g, ' ');
              return `${noun.charAt(0).toUpperCase()}${noun.slice(1)} color`;
            }
            return undefined;
          })(),
      value: isInverted ? !raw : raw,
      isInverted,
    };
  }

  #buildChipsField(field: FieldDef, tagName: string, optionKey: string): EditorFieldElement {
    const el = document.createElement(tagName) as EditorFieldElement;
    el.id = field.name;
    el.style.width = '100%';
    if (field.items) el.items = field.items;
    el.setLabels?.(this.#localizedOptions?.[optionKey]);
    el.value = is.array(this.#config?.[field.target ?? field.name]) ? this.#config[field.target ?? field.name] : [];
    this.#dom.registerField(field.name, el, field);
    return el;
  }

  #buildModeChipsField(field: FieldDef, tagName: string): EditorFieldElement {
    const el = document.createElement(tagName) as EditorFieldElement;
    el.id = field.name;
    el.style.width = '100%';
    el.label = this.#hassProvider.localizeGroup(EDITOR_FIELD_NS)?.[field.name] ?? field.name;
    el.setLabels?.(this.#localizedOptions?.[field.name]);
    // Mirrors the generic ha-selector path (#resolveFieldMeta), not
    // #buildChipsField: this is a single virtual string value (resolveVirtual),
    // not an array read from config[target].
    el.value = this.#resolveFieldMeta(field).value;
    this.#dom.registerField(field.name, el, field);
    return el;
  }

  // Shared by every ListEditorBase-backed field. labelKey is passed separately
  // from field.name because a dot-path field ('bar_stack.entities') labels
  // itself under its parent's translation key ('bar_stack'); rows is the config
  // array the editor round-trips.
  #buildListEditorField(field: FieldDef, tagName: string, labelKey: string, rows: unknown): EditorFieldElement {
    const el = document.createElement(tagName) as EditorFieldElement;
    el.id = field.name;
    el.style.width = '100%';
    el.label = this.#hassProvider.localizeGroup(EDITOR_FIELD_NS)?.[labelKey] ?? labelKey;
    el.hass = this.hass;
    el.value = is.array(rows) ? rows : [];
    this.#dom.registerField(field.name, el, field);
    return el;
  }

  // Dispatch table (mirrors #getSelectorForType's own pattern) instead of a
  // chain of sequential ifs, which had grown one field type at a time into a
  // cognitive-complexity warning — a lookup miss just falls through to the
  // generic ha-selector path below.
  #buildSpecialField(field: FieldDef): EditorFieldElement | undefined {
    const builders: Record<string, () => EditorFieldElement> = {
      effect_chips: () => this.#buildChipsField(field, EntityProgressEffectChips.ELEMENT_NAME, 'bar_effect'),
      hide_chips: () => this.#buildChipsField(field, EntityProgressHideChips.ELEMENT_NAME, 'hide'),
      min_value_mode: () => this.#buildModeChipsField(field, EntityProgressValueSourceModeChips.ELEMENT_NAME),
      max_value_mode: () => this.#buildModeChipsField(field, EntityProgressValueSourceModeChips.ELEMENT_NAME),
      watermark_low_mode: () => this.#buildModeChipsField(field, EntityProgressValueSourceModeChips.ELEMENT_NAME),
      watermark_high_mode: () => this.#buildModeChipsField(field, EntityProgressValueSourceModeChips.ELEMENT_NAME),
      alert_when_above_mode: () => this.#buildModeChipsField(field, EntityProgressValueSourceModeChips.ELEMENT_NAME),
      alert_when_below_mode: () => this.#buildModeChipsField(field, EntityProgressValueSourceModeChips.ELEMENT_NAME),
      theme_mode: () => this.#buildModeChipsField(field, EntityProgressThemeModeChips.ELEMENT_NAME),
      bar_stack_mode: () => this.#buildModeChipsField(field, EntityProgressBarStackModeChips.ELEMENT_NAME),
      bar_stack_editor: () =>
        this.#buildListEditorField(
          field,
          EntityProgressBarStackEditor.ELEMENT_NAME,
          'bar_stack',
          this.#config?.bar_stack?.entities,
        ),
      custom_theme_editor: () =>
        this.#buildListEditorField(
          field,
          EntityProgressCustomThemeEditor.ELEMENT_NAME,
          field.name,
          this.#config?.[field.name],
        ),
    };
    return builders[field.type]?.();
  }

  #buildField(field: FieldDef): EditorFieldElement {
    const el = this.#buildFieldElement(field);
    // Apply initial visibility here rather than leaving it to the first
    // update pass: updateAll now skips collapsed panels (see
    // EditorDOMHelper), so a field that should start hidden inside one would
    // otherwise keep its default-visible state until that panel is first
    // opened - and flash for a frame as the panel animates open before
    // #refreshPanel corrects it.
    if (field.showIf) {
      el.style.display = field.showIf(this.#config, this._configHelper.config) ? '' : 'none';
    }
    return el;
  }

  #buildFieldElement(field: FieldDef): EditorFieldElement {
    const special = this.#buildSpecialField(field);
    if (special) return special;

    const el = document.createElement(HA_SELECTOR_TAG) as EditorFieldElement;

    el.id = field.name;
    el.hass = this.hass;
    el.required = field.required ?? false;
    // width/type can be functions (re-evaluated reactively elsewhere in
    // EditorDOMHelper) - this is just their initial value.
    el.style.width = is.func(field.width) ? (field.width(this.#config ?? {}) as string) : (field.width ?? '100%');
    el.isArray = field.array ?? false;
    el.selector = this.#getSelectorForType(
      is.func(field.type) ? (field.type(this.#config ?? {}) as string) : field.type,
    );

    if (field.isInGroup) el.classList.add(field.isInGroup);
    if (field.type === 'toggle') el.classList.add('field-toggle');

    const { label, value, isInverted } = this.#resolveFieldMeta(field);
    el.label = label;
    el.value = value;
    el.isInverted = isInverted;

    if (field.context) {
      el.context = Object.fromEntries(
        Object.entries(field.context).map(([k, v]) => [k, this.#config[v as string] ?? '']),
      );
    }

    this.#dom.registerField(field.name, el, field);

    return el;
  }

  // `config` is deliberately either source: #resolveValue below picks
  // negotiated or raw per field type before calling this, so both must be
  // accepted here.
  static #fallback(def: FieldDef, config: LovelaceConfig | Config, empty: unknown): unknown {
    if (def.default === undefined) return empty;
    return typeof def.default === 'function' ? def.default(config) : def.default;
  }

  static #resolveValue(def: FieldDef, rawConfig: LovelaceConfig, negotiated: Config | null = null): unknown {
    const empty = ['toggle', 'number', 'decimal'].includes(def.type) ? undefined : '';
    if (!rawConfig) return empty;

    // Virtual fields derive their value from raw config (explicit user state).
    if (def.virtual && def.resolveVirtual) return def.resolveVirtual(rawConfig);

    // template/action always use raw config — see #updateFields comment.
    // custom_theme_editor too: types.customTheme (per-zone validator) drops
    // any zone still missing a valid min/max, so a just-added row would
    // otherwise vanish from the list the instant it round-trips through the
    // negotiated config, before its fields are even filled in.
    const config =
      negotiated && !['template', 'action', 'custom_theme_editor'].includes(def.type) ? negotiated : rawConfig;

    const { isNested, parentKey, childKey } = EditorBase.#splitFieldName(def.name);
    const key = def.target ?? def.name;
    const fallback = EditorBase.#fallback(def, config, empty);

    // Array membership is always checked on raw config (explicit user
    // selections).
    if (isNested && def.array) return rawConfig[parentKey]?.includes(childKey) ?? false;
    if (isNested) {
      const val = config[parentKey]?.[childKey!];
      return val !== undefined ? val : fallback;
    }
    const val = config[key];
    return val !== undefined ? val : fallback;
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
  // panel's fields) - both need the exact same resolveValue/negotiated/
  // resolveType closures, differing only in which fields they walk.
  // template/action fields read from raw config to avoid Jinja flicker during
  // typing: the validated config would fall back to default (e.g. []) the
  // moment the expression is temporarily malformed, causing the UI to flash
  // between chip and Jinja mode. custom_theme_editor reads raw config for
  // the same reason (see #resolveValue). All other fields (select, toggle,
  // number…) read from the negotiated config so that entity defaults (e.g.
  // a light's default %) are reflected immediately.
  #runFieldUpdate(walk: (config: LovelaceConfig, resolveValue: FieldValueResolver, negotiated: Config) => void) {
    const negotiated = this._configHelper.config;
    walk(this.#config, (def, raw) => EditorBase.#resolveValue(def, raw, negotiated), negotiated);
  }

  #applyUpdateFields() {
    this.#runFieldUpdate((config, resolveValue, negotiated) =>
      this.#dom.updateAll(config, resolveValue, negotiated, (def, c) => this.#getSelectorForType(def.type(c))),
    );
  }

  #refreshPanel(panel: HaExpansionPanel) {
    this.#runFieldUpdate((config, resolveValue, negotiated) =>
      this.#dom.updatePanel(panel, config, resolveValue, negotiated, (def, c) => this.#getSelectorForType(def.type(c))),
    );
  }

  #updateChangedFields(keys: Set<string>) {
    this.#runFieldUpdate((config, resolveValue, negotiated) =>
      this.#dom.updateKeys(keys, config, resolveValue, negotiated, (def, c) => this.#getSelectorForType(def.type(c))),
    );
  }

  // ─── EVENTS ───────────────────────────────────────────────────────────────

  #handleVirtualField(def: FieldDef, value: unknown) {
    if (!def.onVirtualChange) return;
    const newConfig = def.onVirtualChange(value, { ...this.#config });
    if (newConfig) {
      this.#config = newConfig;
      // Update fields ourselves (next frame): HA may skip calling setConfig
      // back if the stripped config is unchanged (e.g. toggling
      // _show_all_actions produces the same visible config as before), so we
      // can't rely on that round trip alone.
      this.#updateFields();
      this.#sendConfig(newConfig);
    }
  }

  #handleNestedArrayField(parentKey: string, childKey: string, value: unknown) {
    const current = [...(this.#config[parentKey] ?? [])];
    const updated = value ? [...current, childKey] : current.filter((v) => v !== childKey);
    // Mirrors #handleVirtualField: keep #config in sync locally instead of
    // waiting for HA's setConfig round trip, which #sendConfig now defers by up
    // to one frame — without this, two different fields edited within that same
    // frame would each compute their newConfig off a stale base and could
    // clobber each other's change on send.
    this.#config = { ...this.#config, [parentKey]: updated };
    this.#sendConfig(this.#config);
  }

  #handleNestedField(parentKey: string, childKey: string, value: unknown) {
    this.#config = {
      ...this.#config,
      [parentKey]: { ...this.#config[parentKey], [childKey]: value },
    };
    this.#sendConfig(this.#config);
  }

  #handleStdField(def: FieldDef | undefined, key: string, value: unknown) {
    const targetKey = def?.target ?? key;
    if (!value && def?.onClear) {
      this.#config = def.onClear({ ...this.#config });
      this.#sendConfig(this.#config);
      return;
    }
    const newConfig = { ...this.#config, [targetKey]: value };
    this.#config = def?.onChange ? def.onChange(value, newConfig, this.#config) : newConfig;
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
    const isArray = target.isArray ?? false;
    const isNested = key.includes('.');
    const [parentKey, childKey] = isNested ? key.split('.') : [];

    if (isInverted) value = !value;

    if (isNested && isArray) this.#handleNestedArrayField(parentKey, childKey, value);
    else if (isNested) this.#handleNestedField(parentKey, childKey, value);
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
  #sendConfig(config: LovelaceConfig) {
    // Strip _-prefixed UI state keys (editor-only, must never reach the saved
    // YAML), then normalize key order (entity on top, HA layout meta at the
    // bottom - see #canonicalOrder).
    this.#pendingSentConfig = EditorBase.#canonicalOrder(
      Object.fromEntries(Object.entries(config).filter(([k]) => !k.startsWith('_'))) as LovelaceConfig,
    );
    if (this.#sendConfigScheduled) return;
    this.#sendConfigScheduled = true;

    requestAnimationFrame(() => {
      this.#sendConfigScheduled = false;
      const clean = this.#pendingSentConfig;
      this.#pendingSentConfig = null;
      this.#log?.debug('config-changed →', clean);
      this.dispatchEvent(
        new CustomEvent('config-changed', {
          detail: { config: clean },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }
}

export { EditorBase };
