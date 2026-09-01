/*
 * The row-list editors used by the visual editor for repeatable entries:
 * bar_stack entities and custom_theme zones.
 */

import { VALUE_CHANGED_EVENT, HA_SELECTOR_TAG, HA_SVG_ICON_TAG, devName } from '../utils/parameters.js';
import { BAR_STACK_EDITOR_STYLE, CUSTOM_THEME_EDITOR_STYLE, ACTION_PICKER_STYLE } from '../utils/styles.js';
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
  abstract _render(): void;
  abstract _dispatch(): void;

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

// Same "Delete" button in every row (bar-stack entities, custom-theme zones)
// - only the delete callback differs per call site.
const buildDeleteButton = (onDelete: () => void): HTMLElement => {
  const delBtn = document.createElement('button');
  delBtn.className = 'del-btn';
  delBtn.title = 'Delete';
  const delIcon = document.createElement(HA_SVG_ICON_TAG) as HaSvgIconElement;
  delIcon.path = DELETE_ICON_PATH;
  delBtn.appendChild(delIcon);
  delBtn.addEventListener('click', onDelete);
  return delBtn;
};

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

  _render() {
    this._listEl.innerHTML = '';
    for (let i = 0; i < this._value.length; i++) {
      const item = this._value[i];

      const card = document.createElement('div');
      card.className = 'row-card';
      card.append(this._buildRowHeader('row-header', 'row-title', `#${i + 1}`, i), this.#entityField(item, i));
      if (item.entity) card.append(this.#attributeField(item, i));
      card.append(this._colorField(i, 'color', 'Color', item.color), this.#subtractField(item, i));

      this._listEl.appendChild(card);
    }
  }
}

defineElement(EntityProgressBarStackEditor.ELEMENT_NAME, EntityProgressBarStackEditor);

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

  _render() {
    this._listEl.innerHTML = '';
    for (let i = 0; i < this._value.length; i++) {
      const item = this._value[i];

      const numbers = document.createElement('div');
      numbers.className = 'numbers-row';
      numbers.append(this.#numberField(item, i, 'min'), this.#numberField(item, i, 'max'));

      const zone = document.createElement('div');
      zone.className = 'zone';
      zone.append(
        this._buildRowHeader('zone-header', 'zone-title', `Zone ${i + 1}`, i),
        numbers,
        this.#iconField(item, i),
        this._colorField(i, 'color', 'Icon & bar color', item.color),
        this._colorField(i, 'icon_color', 'Icon color', item.icon_color),
        this._colorField(i, 'bar_color', 'Bar color', item.bar_color),
      );
      this._listEl.appendChild(zone);
    }
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
export { EntityProgressCustomThemeEditor };
export { EntityProgressActionPicker };
