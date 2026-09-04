/*
 * EditorBase: the shared base class every per-card-type editor extends - builds
 * the expansion-panel form from a field definition tree and round-trips changes
 * to/from the config.
 */

import {
  CARD,
  CARD_CONTEXT,
  VALUE_CHANGED_EVENT,
  HA_SELECTOR_TAG,
  EDITOR_FIELD_NS,
  EDITOR_FIELD_HELPER_NS,
} from '../utils/parameters.js';
import { EDITOR_BASE_STYLE } from '../utils/styles.js';
import { is } from '../utils/common-checks.js';
import { initLogger, type LoggerInstance } from '../utils/log.js';
import { HassProviderSingleton, buildTranslationTree, type HomeAssistant } from '../utils/hass-provider.js';
import { BaseConfigHelper, hasDeprecatedOptions } from '../card/config-helpers.js';
import { EditorDOMHelper, type FieldUpdateContext } from './dom-helper.js';
import type { LovelaceConfig, Config, FieldDef } from '../utils/types.js';
import { EntityProgressEffectChips, EntityProgressHideChips, EntityProgressModeChips } from './chips.js';
import {
  EntityProgressBarStackEditor,
  EntityProgressCustomThemeEditor,
  EntityProgressActionPicker,
} from './list-editors.js';
import { lengthSliderSelector, lengthUnitSelector } from '../utils/length.js';
import { durationSliderSelector } from '../utils/duration.js';
import {
  isMarkOverride,
  THEME_ALIASES,
  schemaOptions,
  DENSITY_COMPACT_BAR_POSITIONS,
  ACTION_FIELDS,
  type SchemaVariant,
  type WatermarkMark,
} from '../card/schema.js';

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
  isInverted?: boolean;
  context?: Record<string, unknown>;
  selector?: Record<string, unknown>;
  required?: boolean;
  placeholder?: string;
  helper?: string;
  items?: unknown;
  modes?: string[];
  setLabels?: (labels: unknown) => void;
  setAddLabel?: (label: string) => void;
  buttonLabel?: string;
  actionLabels?: Record<string, string>;
  _fieldDef?: FieldDef;
};

// One of EditorFactory's top-level sections (general/content/theme/
// interactions) - see factory.ts.
type SectionDef = { flat?: boolean; title?: string; icon?: string; fields: Record<string, FieldDef> };

// HA's ha-expansion-panel, reduced to the `expanded` boolean we read for the
// collapsed-panel field-update skip (see EditorDOMHelper.updateAll).
type HaExpansionPanel = HTMLElement & { header: string; outlined: boolean; expanded: boolean };

// Per-field mode lists for EntityProgressModeChips (chips.ts) - each single-
// select mode field passes its own list via #buildModeChipsField below,
// instead of a dedicated chip subclass per field.
const VALUE_SOURCE_MODES = ['standard', 'entity', 'jinja'];
const THEME_MODE_MODES = ['preset', 'custom'];
const SIMPLE_ADVANCED_MODES = ['simple', 'advanced'];
// icon_animation_mode: automatic entity-based detection vs a Jinja condition.
const ICON_ANIMATION_MODES = ['auto', 'template'];
// force_circular_background_mode: Auto (default shape) vs always Forced.
const CIRCULAR_BACKGROUND_MODES = ['auto', 'forced'];
// markers()'s 5 master on/off toggles (watermark/peak_marker/badge/
// status_label/alert_when) - a pill instead of a switch.
const ENABLED_DISABLED_MODES = ['disabled', 'enabled'];

// A dropdown's list comes from the schema variant that actually validates the
// field, so it can never drift from what a config may hold. The two explicit
// arrays are editor-only restrictions, mirroring schema.ts's own postProcess
// rules (applyCompactBelowRule/applyDensityRule) - no enum of their own.
type SchemaLookup = { variant: SchemaVariant; field: string };
const from = (variant: SchemaVariant, field: string): SchemaLookup => ({ variant, field });

// Plain dropdowns: field type -> its translated option group, optionally
// narrowed to the values one schema variant accepts.
const SELECT_TYPES: Record<string, string | [group: string, keys: readonly string[] | SchemaLookup]> = {
  bar_size: ['bar_size', from('card', 'bar_size')],
  bar_size_no_xlarge: ['bar_size', from('badge', 'bar_size')],
  bar_orientation: ['bar_orientation', from('card', 'bar_orientation')],
  bar_orientation_no_up: ['bar_orientation', from('badge', 'bar_orientation')],
  bar_position: ['bar_position', from('card', 'bar_position')],
  bar_position_no_compact_below: ['bar_position', ['default', 'below', 'top', 'bottom', 'overlay', 'background']],
  bar_position_density_compact: ['bar_position', DENSITY_COMPACT_BAR_POSITIONS],
  bar_position_feature: ['bar_position', from('feature', 'bar_position')],
  bar_color_mode: ['bar_color_mode', from('card', 'bar_color_mode')],
  bar_scale: ['bar_scale', from('card', 'bar_scale')],
  icon_animation: ['icon_animation', from('card', 'icon_animation')],
  alert_highlight: ['alert_highlight', from('card', 'alert_when.highlight')],
  alert_animation: ['alert_animation', from('card', 'alert_when.animation')],
  label_position: 'label_position',
  status_label_color_source: 'status_label_color_source',
  theme: ['theme', from('card', 'theme')],
  // Template has no min_value/max_value to project a real-value theme onto.
  theme_percent_only: ['theme', from('template', 'theme')],
  unit_spacing: ['unit_spacing', from('card', 'unit_spacing')],
  unit_position: 'unit_position',
  watermark_type: ['watermark_type', from('card', 'watermark.type')],
  watermark_as: 'watermark_as',
  // peak_marker's own enum, reusing watermark_type's labels.
  peak_marker_type: ['watermark_type', from('card', 'peak_marker.type')],
  duration_unit: 'duration_unit',
  trend_indicator_basis: 'trend_indicator_basis',
};

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
  // "Isolated" (leaf) config keys: nothing else's showIf/value/selector/
  // width/context reads them, so changing one can't affect any other field.
  // When a setConfig round-trip changed only isolated keys, EditorBase
  // refreshes just those instead of re-walking every visible field.
  // Deliberately an explicit allowlist: a key absent here safely falls back
  // to the full walk - only a wrongly-listed key here could stale the UI.
  static #ISOLATED_KEYS: ReadonlySet<string> = new Set([
    'name',
    'name_info',
    'secondary',
    'custom_info',
    'multiline',
    // 'unit' is deliberately NOT here: decimal's own placeholder is derived
    // from it too (resolveDisplayDecimal reads configUnit - see
    // display-defaults.ts), so an isolated-only refresh would leave that
    // placeholder stale until some other, non-isolated field also changed.
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
    'fast_refresh',
    'height',
    'min_width',
    'badge_icon',
    'badge_color',
    ...ACTION_FIELDS,
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
  // `declare`: EditorBase is never instantiated, every subclass has its own.
  declare _configHelper: BaseConfigHelper;

  // The `editor.option` node of the translations tree: one level deeper than
  // localizeGroup models (option group -> value -> label), so typed loosely as
  // a nested string map rather than mirroring the whole translations.json.
  get #localizedOptions(): Record<string, Record<string, string>> {
    // CF5 - issue (minor) resolved - localize() returns the key string before
    // translations load; select builders then crashed on
    // Object.entries(undefined). Fall back to the default language.
    const options = this.#hassProvider.localizeGroup('editor.option');
    return (is.plainObject(options)
      ? options
      : (buildTranslationTree(CARD.config.language).editor as Record<string, unknown>).option) as unknown as Record<
      string,
      Record<string, string>
    >;
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

  // watermark.low/.high can be a bare {entity,...} or wrap it one level
  // deeper ({value: {entity,...}, as, type, opacity, color}) - unwrap before
  // reading .entity, same shape as types.watermarkMark elsewhere.
  static #watermarkEntity(mark: unknown): string {
    const value = isMarkOverride(mark as WatermarkMark) ? (mark as { value?: unknown }).value : mark;
    return is.plainObject(value) && is.nonEmptyString(value.entity) ? value.entity : '';
  }

  // Rewrites deprecated syntax to its modern equivalent only — never the
  // unrelated defaults _customizeConfig also applies, so the button only
  // changes what it documents. `navigate_to`/`show_more_info` are deleted
  // rather than converted: both have been fully inert since v1.2.0, so
  // reconstructing a tap_action from a value that hasn't run in years would
  // be a guess. max_value/disable_unit/additions are delegated to the
  // active config helper's own _migrateLegacyOptions.
  static #migrateDeprecatedConfig(config: LovelaceConfig, configHelper: BaseConfigHelper): LovelaceConfig {
    let migrated = (configHelper.constructor as typeof BaseConfigHelper)._migrateLegacyOptions(config);
    const themeAlias = THEME_ALIASES[migrated.theme];
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
      showIf: (config: LovelaceConfig) => hasDeprecatedOptions(config),
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
    // Shared by every "narrower select" below (a schema variant rejecting
    // some enum members) - keeps just the given keys, same translated labels.
    const pickOptions = (source: Record<string, string>, keys: readonly string[]): Record<string, string> =>
      Object.fromEntries(keys.map((key) => [key, source[key]]));
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
      // Below 2, HABase#_buildSegmentCells never builds any cell - same
      // floor as its own count >= 2 check.
      bar_segments: () => ({ number: { min: 2, max: 10, step: 1, mode: 'box' } }),
      template: () => ({ template: {} }),
      toggle: () => ({ boolean: {} }),
      action: () => ({ 'ui-action': {} }),
      icon: () => ({ icon: { icon_set: ['mdi'] } }),
      color: () => ({ 'ui-color': {} }),
      default: () => ({ text: { mode: 'box' } }),
      // The one select whose options carry an image, hence not in SELECT_TYPES.
      layout: () => buildBoxSelect(options.layout, tileImage),
      // watermark.low/.high can be a bare {entity,...} or wrap it one level
      // deeper ({value: {entity,...}, as, type, opacity, color}) - unwrap
      // before reading .entity, same shape as types.watermarkMark elsewhere.
      watermarkLowAttribute: () => ({
        attribute: { entity_id: EditorBase.#watermarkEntity(this.#config?.watermark?.low) },
      }),
      watermarkHighAttribute: () => ({
        attribute: { entity_id: EditorBase.#watermarkEntity(this.#config?.watermark?.high) },
      }),
    };

    // "length" fields (min_width…): a number+unit composite. The slider's
    // range/step/unit follow the current value's unit (see length.ts); the unit
    // list depends on the card type, encoded in the type string by the factory.
    if (type.startsWith('length:')) return lengthSliderSelector(this.#config[type.slice('length:'.length)]);
    if (type.startsWith('lengthUnit:')) return lengthUnitSelector(type.slice('lengthUnit:'.length).split(','));
    // peak_marker.window: the unit is baked into the type string by the
    // factory's own type() function (config-derived, unlike length: above).
    if (type.startsWith('duration:')) return durationSliderSelector(type.slice('duration:'.length));

    const selectSpec = SELECT_TYPES[type];
    if (selectSpec) {
      const [group, source] = is.string(selectSpec) ? [selectSpec, null] : selectSpec;
      const lookup = source && !is.array(source) ? (source as SchemaLookup) : null;
      const keys = lookup ? schemaOptions(lookup.variant, lookup.field) : (source as readonly string[] | null);
      return buildSelect(keys ? pickOptions(options[group], keys) : options[group]);
    }

    return (selectors[type] ?? (() => ({ text: {} })))();
  }

  // A dot-path field name ('watermark.low') addresses a nested config key -
  // the convention lives here rather than at each call site.
  static #splitFieldName(name: string): { parentKey: string; childKey: string | null } {
    const [parentKey, childKey] = name.includes('.') ? name.split('.') : [name, null];
    return { parentKey, childKey };
  }

  // Every field label lives under EDITOR_FIELD_NS ('editor.option' holds only
  // what a select offers): a dot-path name or labelKey walks its nested group.
  #resolveExplicitLabel(field: FieldDef): string | undefined {
    const path: string = is.string(field.labelKey) ? field.labelKey : field.name;
    const root = this.#hassProvider.localizeGroup(EDITOR_FIELD_NS);
    const walk = (node: unknown, segment: string) => (node as Record<string, unknown> | undefined)?.[segment];
    return path.split('.').reduce<unknown>(walk, root) as string | undefined;
  }

  #resolveFieldMeta(field: FieldDef): { label: string | undefined; value: unknown; isInverted: boolean } {
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
            const explicit = this.#resolveExplicitLabel(field);
            if (explicit !== undefined) return explicit;
            // Guard rail for any future "..._color" field shipping without its
            // own translation - beats falling back to the raw key name.
            const colorMatch = !field.name.includes('.') && field.name.match(/^(.+)_color$/);
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

  // Non-interactive - just a small caption grouping the fields after it
  // (e.g. bar_size/orientation/scale/segments) under one visible word.
  #buildSectionLabel(field: FieldDef): EditorFieldElement {
    const el = document.createElement('div') as unknown as EditorFieldElement;
    el.className = 'section-label';
    el.style.width = '100%';
    el.textContent = this.#hassProvider.localizeGroup(EDITOR_FIELD_NS)?.[field.name] ?? field.name;
    el.value = undefined;
    this.#dom.registerField(field.name, el, field);
    return el;
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

  // optionKey defaults to field.name; overridden below for fields sharing a
  // translated option group instead of N copies. `modes` is EntityProgress
  // ModeChips's own per-instance mode list (see chips.ts) - no per-field
  // subclass needed.
  #buildModeChipsField(
    field: FieldDef,
    tagName: string,
    modes: string[],
    optionKey: string = field.name,
  ): EditorFieldElement {
    const el = document.createElement(tagName) as EditorFieldElement;
    el.id = field.name;
    el.style.width = '100%';
    el.modes = modes;
    // #resolveFieldMeta so labelKey is honored (this used to look up
    // field.name directly, stale once a field shares another's label).
    const { label, value } = this.#resolveFieldMeta(field);
    el.label = label ?? field.name;
    el.setLabels?.(this.#localizedOptions?.[optionKey]);
    el.value = value;
    this.#dom.registerField(field.name, el, field);
    return el;
  }

  // labelKey != field.name: a dot-path field ('bar_stack.entities') labels
  // under its parent's key ('bar_stack'); rows is the round-tripped array.
  #buildListEditorField(opts: {
    field: FieldDef;
    tagName: string;
    labelKey: string;
    rows: unknown;
    addLabelKey: string;
    addLabelDefault: string;
  }): EditorFieldElement {
    const { field, tagName, labelKey, rows, addLabelKey, addLabelDefault } = opts;
    const el = document.createElement(tagName) as EditorFieldElement;
    el.id = field.name;
    el.style.width = '100%';
    const fieldLabels = this.#hassProvider.localizeGroup(EDITOR_FIELD_NS);
    el.label = fieldLabels?.[labelKey] ?? labelKey;
    el.setAddLabel?.(fieldLabels?.[addLabelKey] ?? addLabelDefault);
    el.hass = this.hass;
    el.value = is.array(rows) ? rows : [];
    this.#dom.registerField(field.name, el, field);
    return el;
  }

  // field.items is the optional-action key list; mirrors each field's own
  // labelKey convention ('hold_action' -> action.hold).
  #buildActionPickerField(field: FieldDef): EditorFieldElement {
    const el = document.createElement(EntityProgressActionPicker.ELEMENT_NAME) as EditorFieldElement;
    el.id = field.name;
    el.style.width = '100%';
    const fieldLabels = this.#hassProvider.localizeGroup(EDITOR_FIELD_NS);
    const actionLabels = fieldLabels?.action as unknown as Record<string, string> | undefined;
    el.buttonLabel = fieldLabels?.action_picker ?? 'Add interaction';
    el.actionLabels = Object.fromEntries(
      (field.items ?? []).map((k: string) => [k, actionLabels?.[k.replace(/_action$/, '')] ?? k]),
    );
    el.value = this.#resolveFieldMeta(field).value;
    this.#dom.registerField(field.name, el, field);
    return el;
  }

  // Dispatch table (mirrors #getSelectorForType's own pattern) instead of a
  // chain of sequential ifs, which had grown one field type at a time into a
  // cognitive-complexity warning — a lookup miss just falls through to the
  // generic ha-selector path below.
  #buildSpecialField(field: FieldDef): EditorFieldElement | undefined {
    // Shared by every mode-chips entry below - only `modes`/`optionKey` differ.
    const modeChipsField = (modes: string[], optionKey?: string) => () =>
      this.#buildModeChipsField(field, EntityProgressModeChips.ELEMENT_NAME, modes, optionKey);
    const builders: Record<string, () => EditorFieldElement> = {
      section_label: () => this.#buildSectionLabel(field),
      effect_chips: () => this.#buildChipsField(field, EntityProgressEffectChips.ELEMENT_NAME, 'bar_effect'),
      hide_chips: () => this.#buildChipsField(field, EntityProgressHideChips.ELEMENT_NAME, 'hide'),
      min_value_mode: modeChipsField(VALUE_SOURCE_MODES, 'value_source_mode'),
      max_value_mode: modeChipsField(VALUE_SOURCE_MODES, 'value_source_mode'),
      'watermark.low_mode': modeChipsField(VALUE_SOURCE_MODES, 'value_source_mode'),
      'watermark.high_mode': modeChipsField(VALUE_SOURCE_MODES, 'value_source_mode'),
      'alert_when.above_mode': modeChipsField(VALUE_SOURCE_MODES, 'value_source_mode'),
      'alert_when.below_mode': modeChipsField(VALUE_SOURCE_MODES, 'value_source_mode'),
      theme_mode: modeChipsField(THEME_MODE_MODES),
      bar_stack_mode: modeChipsField([...schemaOptions('card', 'bar_stack.mode')]),
      trigger: modeChipsField(SIMPLE_ADVANCED_MODES, 'simple_advanced_mode'),
      bar_effect_mode: modeChipsField(SIMPLE_ADVANCED_MODES, 'simple_advanced_mode'),
      hide_mode: modeChipsField(SIMPLE_ADVANCED_MODES, 'simple_advanced_mode'),
      'trend_indicator.mode': modeChipsField(SIMPLE_ADVANCED_MODES, 'simple_advanced_mode'),
      icon_animation_mode: modeChipsField(ICON_ANIMATION_MODES),
      force_circular_background_mode: modeChipsField(CIRCULAR_BACKGROUND_MODES),
      enabled_toggle: modeChipsField(ENABLED_DISABLED_MODES, 'enabled_disabled_mode'),
      bar_stack_editor: () =>
        this.#buildListEditorField({
          field,
          tagName: EntityProgressBarStackEditor.ELEMENT_NAME,
          labelKey: 'bar_stack',
          rows: this.#config?.bar_stack?.entities,
          addLabelKey: 'add_entity',
          addLabelDefault: 'Add entity',
        }),
      custom_theme_editor: () =>
        this.#buildListEditorField({
          field,
          tagName: EntityProgressCustomThemeEditor.ELEMENT_NAME,
          labelKey: field.name,
          rows: this.#config?.[field.name],
          addLabelKey: 'add_zone',
          addLabelDefault: 'Add zone',
        }),
      action_picker: () => this.#buildActionPickerField(field),
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
    el.selector = this.#getSelectorForType(
      is.func(field.type) ? (field.type(this.#config ?? {}) as string) : field.type,
    );

    // Greyed hint for an empty field (unit/decimal negotiated default); a
    // function of (rawConfig, negotiated), refreshed by EditorDOMHelper.
    if (field.placeholder) {
      el.placeholder = String(field.placeholder(this.#config ?? {}, this._configHelper.config) ?? '');
    }

    // Static text under the field (ha-selector forwards it to whichever
    // selector renders) - spells out the shape a Jinja field is expected to
    // return, since HA's template selector only shows the raw rendered
    // value. Opt-in boolean, keyed by field.name with dots replaced by
    // underscores - translations.js's add-key/flatten treats every '.' as a
    // nesting level, same reason virtual jinja fields are already named
    // watermark_low_jinja, not watermark.low.jinja.
    if (field.helper) {
      // helperKey overrides the field.name-derived key - e.g. bar_color/
      // badge_color sharing color's own "Returns String (#ff0000)".
      const helperKey = field.helperKey ?? field.name.replace(/\./g, '_');
      el.helper = this.#hassProvider.localizeGroup(EDITOR_FIELD_HELPER_NS)?.[helperKey] ?? '';
    }

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

    const { parentKey, childKey } = EditorBase.#splitFieldName(def.name);
    const key = def.target ?? def.name;
    const fallback = EditorBase.#fallback(def, config, empty);

    if (childKey !== null) {
      const val = config[parentKey]?.[childKey];
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
      resolveValue: (def, raw) => EditorBase.#resolveValue(def, raw, negotiated),
      negotiated,
      resolveType: (def, c) => this.#getSelectorForType(def.type(c)),
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
    const isNested = key.includes('.');
    const [parentKey, childKey] = isNested ? key.split('.') : [];

    if (isInverted) value = !value;

    if (isNested) this.#handleNestedField(parentKey, childKey, value);
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
