/*
 * FieldBuilder: turns an EditorFactory field definition into the DOM element of
 * one editor field. Owned by EditorBase, which supplies the config and hass.
 */

import {
  CARD,
  HA_CONTEXT,
  EDITOR_FIELD_NS,
  SHARED_LABEL_NS,
  SHARED_LABEL_PREFIX,
  EDITOR_FIELD_HELPER_NS,
} from '../../utils/parameters.js';
import { is } from '../../utils/common-checks.js';
import { HassProviderSingleton, buildTranslationTree, type HomeAssistant } from '../../utils/hass-provider.js';
import { BaseConfigHelper } from '../../card/config/config-helpers.js';
import { EditorDOMHelper } from './dom-helper.js';
import { type LovelaceConfig, type FieldDef } from '../../utils/types.js';
import { EntityProgressEffectChips, EntityProgressHideChips, EntityProgressModeChips } from '../elements/chips.js';
import { EntityProgressBarStackEditor } from '../elements/list-editors/bar-stack.js';
import { EntityProgressMultiRowEditor } from '../elements/list-editors/multi-row.js';
import { EntityProgressCustomThemeEditor } from '../elements/list-editors/custom-theme.js';
import { EntityProgressActionPicker } from '../elements/list-editors/action-picker.js';
import { schemaOptions } from '../../card/config/schema.js';
import { selectorForType } from './field-builder/selectors.js';
import { createFieldEl, applyFieldWidth, type EditorFieldElement } from './field-builder/field-element.js';
import { resolveValue, splitFieldName } from './field-builder/field-value.js';
import {
  CIRCULAR_BACKGROUND_MODES,
  ENABLED_DISABLED_MODES,
  ICON_ANIMATION_MODES,
  SIMPLE_ADVANCED_MODES,
  THEME_MODE_MODES,
  VALUE_SOURCE_MODES,
} from './field-builder/modes.js';
import { REUSED_OPTION_LABELS, COMPUTED_OPTION_LABELS } from './select-types.js';

// One of EditorFactory's top-level sections (general/content/theme/
// interactions) - see factory.ts.
type SectionDef = { flat?: boolean; title?: string; icon?: string; fields: Record<string, FieldDef> };

// HA's ha-expansion-panel, reduced to the `expanded` boolean we read for the
// collapsed-panel field-update skip (see EditorDOMHelper.updateAll).
type HaExpansionPanel = HTMLElement & { header: string; outlined: boolean; expanded: boolean };

type FieldBuilderDeps = {
  config: () => LovelaceConfig;
  hass: () => HomeAssistant | null;
  configHelper: () => BaseConfigHelper;
  dom: EditorDOMHelper;
  refreshPanel: (panel: HaExpansionPanel) => void;
};

class FieldBuilder {
  readonly #deps: FieldBuilderDeps;
  readonly #hassProvider: HassProviderSingleton = HassProviderSingleton.getInstance();

  constructor(deps: FieldBuilderDeps) {
    this.#deps = deps;
  }

  // The `editor.option` node of the translations tree: one level deeper than
  // localizeGroup models (option group -> value -> label), so typed loosely as
  // a nested string map rather than mirroring the whole translations.json.
  get #localizedOptions(): Record<string, Record<string, string>> {
    // CF5 - issue (minor) resolved - localize() returns the key string before
    // translations load; select builders then crashed on
    // Object.entries(undefined). Fall back to the default language.
    const options = this.#hassProvider.localizeGroup('editor.option');
    const tree = (is.plainObject(options)
      ? options
      : (buildTranslationTree(CARD.config.language).editor as Record<string, unknown>).option) as unknown as Record<
      string,
      Record<string, string>
    >;
    const reuse = (group: string) =>
      Object.fromEntries(
        Object.entries(REUSED_OPTION_LABELS[group]).map(([value, key]) => [value, this.#labelFor(key) ?? value]),
      );
    // Union, not a walk of the tree: a group whose every value is reused or
    // computed has no entry of its own in the translations, and iterating the
    // tree alone would drop it - leaving that dropdown unlabelled.
    const computed = (group: string) => COMPUTED_OPTION_LABELS[group](this.#hassProvider.language);
    const groups = new Set([
      ...Object.keys(tree),
      ...Object.keys(REUSED_OPTION_LABELS),
      ...Object.keys(COMPUTED_OPTION_LABELS),
    ]);
    return Object.fromEntries(
      [...groups].map((group) => {
        // Stored labels win: a group reuses or computes what it lacks.
        const own = tree[group] ?? {};
        if (group in COMPUTED_OPTION_LABELS) return [group, { ...computed(group), ...own }];
        return [group, group in REUSED_OPTION_LABELS ? { ...reuse(group), ...own } : tree[group]];
      }),
    );
  }

  getSelectorForType(type: string): Record<string, unknown> {
    return selectorForType(type, this.#deps.config(), this.#localizedOptions);
  }

  // A label path is relative to EDITOR_FIELD_NS ('editor.option' holds only
  // what a select offers), except the shared group - a word several fields
  // answer to, named apart so editing it is visibly editing all of them.
  #labelFor(path: string): string | undefined {
    // Labels Home Assistant already names carry an "@<HA key>|<English>"
    // marker in translations/, resolved when the tree is built - nothing to
    // do here beyond walking it (see HassProviderSingleton's resolveLabel).
    const shared = path.startsWith(SHARED_LABEL_PREFIX);
    const root = this.#hassProvider.localizeGroup(shared ? SHARED_LABEL_NS : EDITOR_FIELD_NS);
    const walk = (node: unknown, segment: string) => (node as Record<string, unknown> | undefined)?.[segment];
    return (shared ? path.slice(SHARED_LABEL_PREFIX.length) : path).split('.').reduce<unknown>(walk, root) as
      string | undefined;
  }

  #resolveExplicitLabel(field: FieldDef): string | undefined {
    return this.#labelFor(is.string(field.labelKey) ? field.labelKey : field.name);
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
    const raw = resolveValue(field, this.#deps.config(), this.#deps.configHelper().config);
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
    el.classList.add('field-full');
    // Two labels can say the same thing one family apart (the watermark and
    // peak_marker "shared defaults" headings), so labelKey is honored here too.
    el.textContent = this.#resolveExplicitLabel(field) ?? field.name;
    el.value = undefined;
    return this.#registerFieldEl(field, el);
  }

  #registerFieldEl(field: FieldDef, el: EditorFieldElement): EditorFieldElement {
    this.#deps.dom.registerField(field.name, el, field);
    return el;
  }

  #buildChipsField(field: FieldDef, tagName: string, optionKey: string): EditorFieldElement {
    const el = createFieldEl(field, tagName);
    if (field.items) el.items = field.items;
    el.setLabels?.(this.#localizedOptions?.[optionKey]);
    el.value = is.array(this.#deps.config()?.[field.target ?? field.name])
      ? this.#deps.config()[field.target ?? field.name]
      : [];
    return this.#registerFieldEl(field, el);
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
    const el = createFieldEl(field, tagName);
    // A field that declares its own list answers to the config (density drops
    // single_line on a vertical card); is.func's predicate returns unknown,
    // hence the cast.
    el.modes = is.func(field.modes) ? (field.modes(this.#deps.config() ?? {}) as string[]) : modes;
    // #resolveFieldMeta so labelKey is honored (this used to look up
    // field.name directly, stale once a field shares another's label).
    const { label, value } = this.#resolveFieldMeta(field);
    el.label = label ?? field.name;
    el.setLabels?.(this.#localizedOptions?.[optionKey]);
    el.value = value;
    return this.#registerFieldEl(field, el);
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
    const el = createFieldEl(field, tagName);
    // #labelFor, not a raw group read: it also resolves the shared.* namespace,
    // which several of these keys live in.
    el.label = this.#labelFor(labelKey) ?? labelKey;
    el.setAddLabel?.(this.#labelFor(addLabelKey) ?? addLabelDefault);
    el.hass = this.#deps.hass();
    el.value = is.array(rows) ? rows : [];
    return this.#registerFieldEl(field, el);
  }

  // field.items is the optional-action key list; mirrors each field's own
  // labelKey convention ('hold_action' -> action.hold).
  #buildActionPickerField(field: FieldDef): EditorFieldElement {
    const el = createFieldEl(field, EntityProgressActionPicker.ELEMENT_NAME);
    el.buttonLabel = this.#labelFor('action_picker') ?? 'Add interaction';
    el.actionLabels = Object.fromEntries(
      (field.items ?? []).map((k: string) => [k, this.#labelFor(`action.${k.replace(/_action$/, '')}`) ?? k]),
    );
    el.value = this.#resolveFieldMeta(field).value;
    return this.#registerFieldEl(field, el);
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
      density: modeChipsField([...schemaOptions('card', 'density')]),
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
          rows: this.#deps.config()?.bar_stack?.entities,
          addLabelKey: 'add_entity',
          addLabelDefault: 'Add entity',
        }),
      multi_row_editor: () =>
        this.#buildListEditorField({
          field,
          tagName: EntityProgressMultiRowEditor.ELEMENT_NAME,
          labelKey: 'entities',
          rows: this.#deps.config()?.entities,
          addLabelKey: 'add_entity',
          addLabelDefault: 'Add entity',
        }),
      custom_theme_editor: () =>
        this.#buildListEditorField({
          field,
          tagName: EntityProgressCustomThemeEditor.ELEMENT_NAME,
          labelKey: field.name,
          rows: this.#deps.config()?.[field.name],
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
      el.style.display = field.showIf(this.#deps.config(), this.#deps.configHelper().config) ? '' : 'none';
    }
    return el;
  }

  #buildFieldElement(field: FieldDef): EditorFieldElement {
    const special = this.#buildSpecialField(field);
    if (special) return special;

    const el = document.createElement(HA_CONTEXT.elements.selector) as EditorFieldElement;

    el.id = field.name;
    el.hass = this.#deps.hass();
    el.required = field.required ?? false;
    applyFieldWidth(el, field.width);
    el.selector = this.getSelectorForType(
      is.func(field.type) ? (field.type(this.#deps.config() ?? {}) as string) : field.type,
    );

    // Greyed hint for an empty field (unit/decimal negotiated default); a
    // function of (rawConfig, negotiated), refreshed by EditorDOMHelper.
    if (field.placeholder) {
      el.placeholder = String(field.placeholder(this.#deps.config() ?? {}, this.#deps.configHelper().config) ?? '');
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
    // field-<type>: lets the stylesheet answer for a kind of input (a number
    // selector's own 8px hint padding, a toggle's phantom label box) without
    // every such field having to be tagged by hand at its call site.
    if (is.string(field.type)) el.classList.add(`field-${field.type}`);

    const { label, value, isInverted } = this.#resolveFieldMeta(field);
    el.label = label;
    el.value = value;
    el.isInverted = isInverted;

    if (field.context) {
      el.context = Object.fromEntries(
        Object.entries(field.context).map(([k, v]) => [k, this.#deps.config()[v as string] ?? '']),
      );
    }

    return this.#registerFieldEl(field, el);
  }

  buildExpansionPanel(section: string, def: SectionDef): DocumentFragment | HTMLElement {
    if (def.flat) {
      const frag = document.createDocumentFragment();
      for (const field of Object.values(def.fields)) {
        frag.appendChild(this.#buildField(field));
      }
      return frag;
    }

    const panel = document.createElement('ha-expansion-panel') as HaExpansionPanel;
    const title = def.title ?? '';
    panel.header = this.#hassProvider.localize(title);
    panel.outlined = true;
    // Fields in a collapsed panel are skipped by updateAll (see
    // EditorDOMHelper) - refresh them the moment the panel opens, so a change
    // made while it was collapsed (another field, or a switch to the raw YAML
    // editor and back) shows up right as they become visible. Fires on first
    // open too, which is what makes an initially-collapsed panel correct.
    panel.addEventListener('expanded-changed', (e) => {
      if ((e as CustomEvent<{ expanded: boolean }>).detail.expanded) this.#deps.refreshPanel(panel);
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
}

export { FieldBuilder, resolveValue, splitFieldName };
export type { EditorFieldElement, HaExpansionPanel };
