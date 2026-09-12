/*
 * The row-list editors used by the visual editor for repeatable entries:
 * bar_stack entities and custom_theme zones.
 */

import { VALUE_CHANGED_EVENT, HA_SELECTOR_TAG, HA_SVG_ICON_TAG, devName } from '../utils/parameters.js';
import {
  BAR_STACK_EDITOR_STYLE,
  MULTI_ROW_EDITOR_STYLE,
  CUSTOM_THEME_EDITOR_STYLE,
  ACTION_PICKER_STYLE,
} from '../utils/styles.js';
import { is, assertDefined } from '../utils/common-checks.js';
import { defineElement } from '../utils/register.js';
import type { HomeAssistant } from '../utils/hass-provider.js';

// The two dynamic HA custom elements built throughout this file: `ha-selector`
// (whose `.selector`/`.value` shape depends on which selector type is
// configured - too heterogeneous to model beyond "some value", same
// reasoning as DOMHelper._domElements) and `ha-svg-icon` (just `.path`).
type HaSelectorElement = HTMLElement & {
  hass: HomeAssistant | null;
  selector: Record<string, unknown>;
  value: unknown;
  label?: string;
  required?: boolean;
};
type HaSvgIconElement = HTMLElement & { path: string };

// mdi:plus - shared by every "+ Add ..." button built in this file.
const ADD_ICON_PATH = 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z';
// mdi:close-circle-outline - shared by every row's own "Delete" button.
const DELETE_ICON_PATH =
  'M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,18.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z';

// mdi:pencil / mdi:arrow-left - the row's own sub-editor, opened and left.
const EDIT_ICON_PATH =
  'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z';
// The row's own editor, addressed by tag rather than imported: EditorBase
// already imports this file, and a cycle around a class whose fields are
// static (EditorFactory.buildMultiRow() runs at module load) fails as a
// silent undefined, not as an error.
const MULTI_CARD_ROW_EDITOR_NAME = devName('entity-progress-multi-card-row-editor');
const MULTI_FEATURE_ROW_EDITOR_NAME = devName('entity-progress-multi-feature-row-editor');

// "Open row N" - raised by the list, answered by whoever hosts it.
const EDIT_ROW_EVENT = 'epb-edit-row';

const BACK_ICON_PATH = 'M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z';

// Every icon button in this file is the same borderless 28px circle (.del-btn
// carries its look, see ROW_DELETE_STYLE) - only path, tooltip and callback
// differ, so delete/edit/back are one builder rather than three copies.
const buildIconButton = (path: string, title: string, onClick: () => void): HTMLElement => {
  const btn = document.createElement('button');
  btn.className = 'del-btn';
  btn.title = title;
  const icon = document.createElement(HA_SVG_ICON_TAG) as HaSvgIconElement;
  icon.path = path;
  btn.appendChild(icon);
  btn.addEventListener('click', onClick);
  return btn;
};

const buildDeleteButton = (onDelete: () => void): HTMLElement => buildIconButton(DELETE_ICON_PATH, 'Delete', onDelete);

// Same "+ Add ..." button everywhere it's built - only label/callback differ.
// appearance="filled" matches ha-form-optional_actions.ts's own add button.
const buildAddButton = (label: string, onClick: (e: MouseEvent) => void): HTMLElement => {
  const btn = document.createElement('ha-button');
  btn.setAttribute('appearance', 'filled');
  btn.setAttribute('size', 's');
  const addIcon = document.createElement(HA_SVG_ICON_TAG) as HaSvgIconElement;
  addIcon.setAttribute('slot', 'start');
  addIcon.path = ADD_ICON_PATH;
  btn.appendChild(addIcon);
  btn.append(label);
  btn.addEventListener('click', onClick);
  return btn;
};

// One row of bar_stack.entities, as built up field-by-field by the editor -
// unlike the fully-validated shape the schema produces, a row here can be
// partially empty ({}) while the user is still filling it in.
type BarStackRow = { entity?: string; attribute?: string; color?: string; subtract?: boolean };

// One custom_theme zone, same "partially filled while editing" caveat.
type CustomThemeZone = {
  min?: number;
  max?: number;
  color?: string;
  icon_color?: string;
  bar_color?: string;
  icon?: string;
};

/**
 * Shared base for custom elements that edit an array of row-objects: a label, a
 * list container, connectedCallback's build-once-then-render lifecycle, the
 * value setter, and delete-by-index all follow the exact same shape regardless
 * of what a row actually contains. Concrete subclasses implement _buildDOM()/
 * _render()/_dispatch() — the same template-method pattern ChipsBase already
 * uses for the chip family (_buildDOM overridden per concrete chip type).
 *
 * @extends HTMLElement
 */
// Rows are heterogeneous plain objects (bar_stack entities vs custom_theme
// zones have entirely different shapes) - kept as loose `Record<string,
// unknown>` rather than a shared interface neither concrete editor actually
// has in common beyond "object".
abstract class ListEditorBase extends HTMLElement {
  _labelText = '';
  _value: Record<string, unknown>[] = [];
  _list: HTMLElement | null = null;
  _labelEl: HTMLElement | null = null;
  _addBtn: HTMLElement | null = null;
  _addLabel = '';
  _hass: HomeAssistant | null = null;
  // Always assigned first thing in connectedCallback, before _buildDOM()
  // (the only place that reads it) can run.
  _shadow!: ShadowRoot;

  abstract _buildDOM(): void;
  abstract _dispatch(): void;

  // Wrapper class of one rendered row, and its contents. Only these differ
  // between the concrete lists - the loop below is the same for both.
  abstract _rowClass: string;
  abstract _buildRow(item: Record<string, unknown>, index: number): Node[];

  _render() {
    this._listEl.innerHTML = '';
    this._value.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = this._rowClass;
      row.append(...this._buildRow(item, index));
      this._listEl.appendChild(row);
    });
  }

  get hass(): HomeAssistant | null {
    return this._hass;
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    for (const el of this.shadowRoot?.querySelectorAll(HA_SELECTOR_TAG) ?? []) (el as HaSelectorElement).hass = hass;
  }

  connectedCallback() {
    this._shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    if (!this._list) this._buildDOM();
    this._render();
  }

  // _render() only ever runs after _buildDOM() has set _list (connectedCallback
  // runs them back to back, and the `value` setter/_deleteRow/_updateItem below
  // only reach _render() through rows _buildDOM() already created) - this
  // getter documents and enforces that precondition once, instead of a bare
  // `this._list!` at every call site.
  get _listEl(): HTMLElement {
    return assertDefined(this._list, `${this.constructor.name}._render() called before _buildDOM()`);
  }

  get label(): string {
    return this._labelText;
  }

  set label(val: string) {
    this._labelText = val ?? '';
    if (this._labelEl) this._labelEl.textContent = this._labelText;
  }

  setAddLabel(val: string) {
    this._addLabel = val ?? this._addLabel;
    if (this._addBtn?.lastChild) this._addBtn.lastChild.textContent = this._addLabel;
  }

  get value(): Record<string, unknown>[] {
    return this._value;
  }

  set value(val: unknown[]) {
    this._value = is.array(val) ? val.filter(is.plainObject) : [];
    if (this._list) this._render();
  }

  _deleteRow(index: number) {
    this._value = this._value.filter((_, i) => i !== index);
    this._render();
    this._dispatch();
  }

  _updateItem(index: number, patch: Record<string, unknown>) {
    this._value = this._value.map((item, i) => (i === index ? { ...item, ...patch } : item));
    this._render();
    this._dispatch();
  }

  // Shared by every #<x>Field builder in the concrete editors below - only
  // the selector shape, label, initial value and resulting patch differ.
  _buildSelectorField({
    selector,
    value,
    label,
    fullWidth = false,
    required,
    onChange,
  }: {
    selector: Record<string, unknown>;
    value: unknown;
    label?: string;
    fullWidth?: boolean;
    required?: boolean;
    onChange: (value: unknown) => void;
  }): HaSelectorElement {
    const el = document.createElement(HA_SELECTOR_TAG) as HaSelectorElement;
    el.hass = this._hass;
    el.selector = selector;
    if (label) el.label = label;
    if (fullWidth) el.style.width = '100%';
    if (required !== undefined) el.required = required;
    el.value = value;
    el.addEventListener(VALUE_CHANGED_EVENT, (e: Event) => {
      const evt = e as CustomEvent;
      evt.stopPropagation();
      onChange(evt.detail.value);
    });
    return el;
  }

  // Shared by both concrete editors - only which rows count as filled differs.
  _dispatchRows(isFilled: (item: Record<string, unknown>) => boolean) {
    const clean = this._value.filter(isFilled);
    this.dispatchEvent(
      new CustomEvent(VALUE_CHANGED_EVENT, {
        detail: { value: clean.length ? clean : undefined },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // One `ui-color` row writing `key` back - both editors build several.
  _colorField(index: number, key: string, label: string, current: unknown): HaSelectorElement {
    return this._buildSelectorField({
      selector: { 'ui-color': {} },
      label,
      fullWidth: true,
      value: current ?? '',
      onChange: (value) => this._updateItem(index, { [key]: (value as string) || undefined }),
    });
  }

  // Row title + delete button - same header on a bar-stack row and a theme
  // zone, only the class names and the title differ.
  _buildRowHeader(headerClass: string, titleClass: string, title: string, index: number): HTMLElement {
    const header = document.createElement('div');
    header.className = headerClass;
    const titleEl = document.createElement('span');
    titleEl.className = titleClass;
    titleEl.textContent = title;
    header.append(
      titleEl,
      buildDeleteButton(() => this._deleteRow(index)),
    );
    return header;
  }

  // Style + label + list + "+ Add ..." row: every concrete _buildDOM() only
  // differs in its own stylesheet and the button's initial label.
  _buildListScaffold(styleText: string, addLabel: string) {
    const style = document.createElement('style');
    style.textContent = styleText;
    this._labelEl = document.createElement('div');
    this._labelEl.className = 'lbl';
    this._labelEl.textContent = this._labelText;
    this._list = document.createElement('div');
    this._addBtn = buildAddButton(addLabel, () => {
      this._value = [...this._value, {}];
      this._render();
    });
    const addRow = document.createElement('div');
    addRow.className = 'add-row';
    addRow.appendChild(this._addBtn);
    this._shadow.append(style, this._labelEl, this._list, addRow);
  }
}

/**
 * ListEditorBase for `bar_stack.entities`: each row is an additional
 * entity (with `attribute`/`color`/`subtract`) aggregated into the bar
 * alongside the card's main entity.
 *
 * @extends ListEditorBase
 */
class EntityProgressBarStackEditor extends ListEditorBase {
  static ELEMENT_NAME = devName('entity-progress-bar-stack-editor');
  _addLabel = 'Add entity';

  _buildDOM() {
    this._buildListScaffold(BAR_STACK_EDITOR_STYLE, this._addLabel);
  }

  _dispatch() {
    this._dispatchRows((item) => Boolean(item.entity));
  }

  #entityField(item: BarStackRow, index: number): HaSelectorElement {
    return this._buildSelectorField({
      selector: { entity: {} },
      value: item.entity ?? '',
      required: false,
      fullWidth: true,
      onChange: (value) => this._updateItem(index, { entity: (value as string) || undefined, attribute: undefined }),
    });
  }

  #attributeField(item: BarStackRow, index: number): HaSelectorElement {
    return this._buildSelectorField({
      selector: { attribute: { entity_id: item.entity ?? '' } },
      value: item.attribute ?? '',
      required: false,
      fullWidth: true,
      onChange: (value) => this._updateItem(index, { attribute: (value as string) || undefined }),
    });
  }

  // 'net': subtracted from the algebraic total. 'stacked'/'proportional' +
  // center_zero: placed on the negative arm instead of the positive one. No
  // effect otherwise (harmless no-op) - kept simple rather than conditionally
  // hiding this per-row based on sibling fields (mode, center_zero) the row
  // editor doesn't otherwise need to know about.
  #subtractField(item: BarStackRow, index: number): HaSelectorElement {
    return this._buildSelectorField({
      selector: { boolean: {} },
      label: 'Subtract / negative side',
      fullWidth: true,
      value: item.subtract ?? false,
      onChange: (value) => this._updateItem(index, { subtract: value || undefined }),
    });
  }

  _rowClass = 'row-card';

  _buildRow(item: Record<string, unknown>, index: number): Node[] {
    return [
      this._buildRowHeader('row-header', 'row-title', `#${index + 1}`, index),
      this.#entityField(item, index),
      // Nothing to pick an attribute on until an entity is chosen.
      ...(item.entity ? [this.#attributeField(item, index)] : []),
      this._colorField(index, 'color', 'Color', item.color),
      this.#subtractField(item, index),
    ];
  }
}

defineElement(EntityProgressBarStackEditor.ELEMENT_NAME, EntityProgressBarStackEditor);

/**
 * Custom element that renders the Multi aggregators' `entities` list — one
 * row per entity. Deliberately a short field set, not the row schema's forty:
 * a row IS a whole card (see multi.ts), so generating its full editor per row
 * would just be the card editor repeated N times. What stays here is what
 * makes a row differ from its siblings; everything else is a shared default at
 * the aggregator's top level.
 *
 * @extends ListEditorBase
 */
class EntityProgressMultiRowEditor extends ListEditorBase {
  static ELEMENT_NAME = devName('entity-progress-multi-row-editor');
  _addLabel = 'Add entity';

  _buildDOM() {
    this._buildListScaffold(MULTI_ROW_EDITOR_STYLE, this._addLabel);
  }

  _dispatch() {
    this._dispatchRows((item) => Boolean(item.entity));
  }

  _rowClass = 'row-card';

  // The entity stays inline: picking one is the whole point of adding a row,
  // and a brand-new row has no title to show behind a pencil yet. Everything
  // else a row can carry is edited whole, in the sub-editor its own host
  // opens - this list only says which row was asked for.
  _buildRow(item: Record<string, unknown>, index: number): Node[] {
    const main = document.createElement('div');
    main.className = 'row-main';
    main.appendChild(
      this._buildSelectorField({
        selector: { entity: {} },
        value: item.entity ?? '',
        required: false,
        fullWidth: true,
        onChange: (value) => this._updateItem(index, { entity: (value as string) || undefined, attribute: undefined }),
      }),
    );
    return [
      main,
      buildIconButton(EDIT_ICON_PATH, 'Edit', () => this.#requestEdit(index)),
      buildDeleteButton(() => this._deleteRow(index)),
    ];
  }

  // Asked of the host, not done here: the row's editor replaces the whole
  // form, and this list is only one field inside it - swapping in place would
  // leave the host's own panels stacked underneath.
  #requestEdit(index: number) {
    this.dispatchEvent(new CustomEvent(EDIT_ROW_EVENT, { detail: { index }, bubbles: true, composed: true }));
  }
}

defineElement(EntityProgressMultiRowEditor.ELEMENT_NAME, EntityProgressMultiRowEditor);

/**
 * Custom element that renders an editable list of custom_theme zones, each a
 * contiguous { min, max, color?, icon_color?, bar_color?, icon? } range.
 * Mirrors EntityProgressBarStackEditor's row-list pattern (label, list, add
 * button, value-changed with the filtered array), with a richer per-row form.
 *
 * @extends HTMLElement
 */

class EntityProgressCustomThemeEditor extends ListEditorBase {
  static ELEMENT_NAME = devName('entity-progress-custom-theme-editor');
  _addLabel = 'Add zone';

  _buildDOM() {
    this._buildListScaffold(CUSTOM_THEME_EDITOR_STYLE, this._addLabel);
  }

  _dispatch() {
    this._dispatchRows(
      (item) =>
        is.number(item.min) ||
        is.number(item.max) ||
        Boolean(item.color || item.icon_color || item.bar_color || item.icon),
    );
  }

  #numberField(item: CustomThemeZone, index: number, key: 'min' | 'max'): HaSelectorElement {
    return this._buildSelectorField({
      selector: { number: {} },
      label: key === 'min' ? 'Min' : 'Max',
      value: is.number(item[key]) ? item[key] : undefined,
      onChange: (value) => this._updateItem(index, { [key]: is.number(value) ? value : undefined }),
    });
  }

  #iconField(item: CustomThemeZone, index: number): HaSelectorElement {
    return this._buildSelectorField({
      selector: { icon: { icon_set: ['mdi'] } },
      label: 'Icon',
      fullWidth: true,
      value: item.icon ?? '',
      onChange: (value) => this._updateItem(index, { icon: (value as string) || undefined }),
    });
  }

  _rowClass = 'zone';

  _buildRow(item: Record<string, unknown>, index: number): Node[] {
    const numbers = document.createElement('div');
    numbers.className = 'numbers-row';
    numbers.append(this.#numberField(item, index, 'min'), this.#numberField(item, index, 'max'));

    return [
      this._buildRowHeader('zone-header', 'zone-title', `Zone ${index + 1}`, index),
      numbers,
      this.#iconField(item, index),
      this._colorField(index, 'color', 'Icon & bar color', item.color),
      this._colorField(index, 'icon_color', 'Icon color', item.icon_color),
      this._colorField(index, 'bar_color', 'Bar color', item.bar_color),
    ];
  }
}

defineElement(EntityProgressCustomThemeEditor.ELEMENT_NAME, EntityProgressCustomThemeEditor);

// "+" picker for the interactions panel: reveals one hidden action field at
// a time. value: { visible, hidden }; picking a key dispatches the new array.
class EntityProgressActionPicker extends HTMLElement {
  static ELEMENT_NAME = devName('entity-progress-action-picker');
  #shadow!: ShadowRoot;
  #btn: HTMLElement | null = null;
  #menu: HTMLElement | null = null;
  #visible: string[] = [];
  #hidden: string[] = [];
  #labels: Record<string, string> = {};
  #buttonLabel = 'Add interaction';
  #boundOutsideClick = (e: Event) => {
    if (!this.contains(e.target as Node)) this.#closeMenu();
  };

  get buttonLabel(): string {
    return this.#buttonLabel;
  }

  set buttonLabel(val: string) {
    this.#buttonLabel = val ?? this.#buttonLabel;
    if (this.#btn?.lastChild) this.#btn.lastChild.textContent = this.#buttonLabel;
  }

  get actionLabels(): Record<string, string> {
    return this.#labels;
  }

  set actionLabels(val: Record<string, string>) {
    this.#labels = val ?? {};
  }

  get value(): { visible: string[]; hidden: string[] } {
    return { visible: this.#visible, hidden: this.#hidden };
  }

  set value(val: { visible?: string[]; hidden?: string[] } | undefined) {
    this.#visible = is.array(val?.visible) ? val.visible : [];
    this.#hidden = is.array(val?.hidden) ? val.hidden : [];
    if (this.#shadow) this.#render();
  }

  connectedCallback() {
    this.#shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    if (!this.#btn) this.#buildDOM();
    this.#render();
    document.addEventListener('click', this.#boundOutsideClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.#boundOutsideClick);
  }

  #buildDOM() {
    const style = document.createElement('style');
    style.textContent = ACTION_PICKER_STYLE;
    this.#btn = buildAddButton(this.#buttonLabel, (e) => {
      e.stopPropagation();
      this.#menu?.classList.toggle('open');
    });
    this.#menu = document.createElement('div');
    this.#menu.className = 'menu';
    const picker = document.createElement('div');
    picker.className = 'picker';
    picker.append(this.#btn, this.#menu);
    this.#shadow.append(style, picker);
  }

  #closeMenu() {
    this.#menu?.classList.remove('open');
  }

  #render() {
    this.style.display = this.#hidden.length ? '' : 'none';
    if (!this.#menu) return;
    this.#menu.replaceChildren(
      ...this.#hidden.map((key) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'menu-item';
        item.textContent = this.#labels[key] ?? key;
        item.addEventListener('click', () => this.#pick(key));
        return item;
      }),
    );
  }

  #pick(key: string) {
    this.#closeMenu();
    this.dispatchEvent(
      new CustomEvent(VALUE_CHANGED_EVENT, {
        detail: { value: [...this.#visible, key] },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

defineElement(EntityProgressActionPicker.ELEMENT_NAME, EntityProgressActionPicker);

export { EntityProgressBarStackEditor };
export { EntityProgressMultiRowEditor };
export { MULTI_CARD_ROW_EDITOR_NAME, MULTI_FEATURE_ROW_EDITOR_NAME };
export { EDIT_ROW_EVENT };
export { buildIconButton, BACK_ICON_PATH };
export { EntityProgressCustomThemeEditor };
export { EntityProgressActionPicker };
