/*
 * The row-list editors used by the visual editor for repeatable entries:
 * bar_stack entities and custom_theme zones.
 */

import { VALUE_CHANGED_EVENT, HA_SELECTOR_TAG, HA_SVG_ICON_TAG } from '../utils/parameters.js';
import { BAR_STACK_EDITOR_STYLE, CUSTOM_THEME_EDITOR_STYLE } from '../utils/styles.js';
import { is, assertDefined } from '../utils/common-checks.js';
import type { Hass } from '../utils/hass-provider.js';

// The two dynamic HA custom elements built throughout this file: `ha-selector`
// (whose `.selector`/`.value` shape depends on which selector type is
// configured - too heterogeneous to model beyond "some value", same
// reasoning as DOMHelper._domElements) and `ha-svg-icon` (just `.path`).
type HaSelectorElement = HTMLElement & {
  hass: Hass | null;
  selector: Record<string, unknown>;
  value: unknown;
  label?: string;
  required?: boolean;
};
type HaSvgIconElement = HTMLElement & { path: string };

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
// zones have entirely different shapes) - kept as `any` rather than a shared
// interface neither concrete editor actually has in common beyond "object".
abstract class ListEditorBase extends HTMLElement {
  _labelText = '';
  _value: any[] = [];
  _list: HTMLElement | null = null;
  _labelEl: HTMLElement | null = null;
  // Always assigned first thing in connectedCallback, before _buildDOM()
  // (the only place that reads it) can run.
  _shadow!: ShadowRoot;

  abstract _buildDOM(): void;
  abstract _render(): void;
  abstract _dispatch(): void;

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

  get value(): any[] {
    return this._value;
  }

  set value(val: any[]) {
    this._value = is.array(val) ? val.filter(is.plainObject) : [];
    if (this._list) this._render();
  }

  _deleteRow(index: number) {
    this._value = this._value.filter((_, i) => i !== index);
    this._render();
    this._dispatch();
  }

  _updateItem(index: number, patch: Record<string, any>) {
    this._value = this._value.map((item, i) => (i === index ? { ...item, ...patch } : item));
    this._render();
    this._dispatch();
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
  static ELEMENT_NAME = 'entity-progress-bar-stack-editor';
  #hass: Hass | null = null;
  #addBtn: HTMLElement | null = null;

  get hass(): Hass | null {
    return this.#hass;
  }

  set hass(hass: Hass) {
    this.#hass = hass;
    for (const el of this.shadowRoot?.querySelectorAll(HA_SELECTOR_TAG) ?? []) (el as HaSelectorElement).hass = hass;
  }

  _buildDOM() {
    const style = document.createElement('style');
    style.textContent = BAR_STACK_EDITOR_STYLE;
    this._labelEl = document.createElement('div');
    this._labelEl.className = 'lbl';
    this._labelEl.textContent = this._labelText;
    this._list = document.createElement('div');
    this.#addBtn = document.createElement('ha-button');
    const addIcon = document.createElement(HA_SVG_ICON_TAG) as HaSvgIconElement;
    addIcon.setAttribute('slot', 'icon');
    addIcon.path = 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z';
    this.#addBtn.appendChild(addIcon);
    this.#addBtn.append('Add entity');
    this.#addBtn.addEventListener('click', () => {
      this._value = [...this._value, {}];
      this._render();
    });
    const addRow = document.createElement('div');
    addRow.className = 'add-row';
    addRow.appendChild(this.#addBtn);
    this._shadow.append(style, this._labelEl, this._list, addRow);
  }

  _dispatch() {
    const clean = this._value.filter((item) => item.entity);
    this.dispatchEvent(
      new CustomEvent(VALUE_CHANGED_EVENT, {
        detail: { value: clean.length ? clean : undefined },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #entityField(item: BarStackRow, index: number): HaSelectorElement {
    const el = document.createElement(HA_SELECTOR_TAG) as HaSelectorElement;
    el.hass = this.#hass;
    el.selector = { entity: {} };
    el.value = item.entity ?? '';
    el.required = false;
    el.style.width = '100%';
    el.addEventListener(VALUE_CHANGED_EVENT, (e: Event) => {
      const evt = e as CustomEvent;
      evt.stopPropagation();
      this._updateItem(index, { entity: evt.detail.value || undefined, attribute: undefined });
    });
    return el;
  }

  #attributeField(item: BarStackRow, index: number): HaSelectorElement {
    const el = document.createElement(HA_SELECTOR_TAG) as HaSelectorElement;
    el.hass = this.#hass;
    el.selector = { attribute: { entity_id: item.entity ?? '' } };
    el.value = item.attribute ?? '';
    el.required = false;
    el.style.width = '100%';
    el.addEventListener(VALUE_CHANGED_EVENT, (e: Event) => {
      const evt = e as CustomEvent;
      evt.stopPropagation();
      this._updateItem(index, { attribute: evt.detail.value || undefined });
    });
    return el;
  }

  #colorField(item: BarStackRow, index: number): HaSelectorElement {
    const el = document.createElement(HA_SELECTOR_TAG) as HaSelectorElement;
    el.hass = this.#hass;
    el.selector = { 'ui-color': {} };
    el.label = 'Color';
    el.style.width = '100%';
    el.value = item.color ?? '';
    el.addEventListener(VALUE_CHANGED_EVENT, (e: Event) => {
      const evt = e as CustomEvent;
      evt.stopPropagation();
      this._updateItem(index, { color: evt.detail.value || undefined });
    });
    return el;
  }

  // 'net': subtracted from the algebraic total. 'stacked'/'proportional' +
  // center_zero: placed on the negative arm instead of the positive one. No
  // effect otherwise (harmless no-op) - kept simple rather than conditionally
  // hiding this per-row based on sibling fields (mode, center_zero) the row
  // editor doesn't otherwise need to know about.
  #subtractField(item: BarStackRow, index: number): HaSelectorElement {
    const el = document.createElement(HA_SELECTOR_TAG) as HaSelectorElement;
    el.hass = this.#hass;
    el.selector = { boolean: {} };
    el.label = 'Subtract / negative side';
    el.style.width = '100%';
    el.value = item.subtract ?? false;
    el.addEventListener(VALUE_CHANGED_EVENT, (e: Event) => {
      const evt = e as CustomEvent;
      evt.stopPropagation();
      this._updateItem(index, { subtract: evt.detail.value || undefined });
    });
    return el;
  }

  _render() {
    this._listEl.innerHTML = '';
    for (let i = 0; i < this._value.length; i++) {
      const item = this._value[i];

      const delBtn = document.createElement('button');
      delBtn.className = 'del-btn';
      delBtn.title = 'Delete';
      const delIcon = document.createElement(HA_SVG_ICON_TAG) as HaSvgIconElement;
      delIcon.path =
        'M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,18.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z';
      delBtn.appendChild(delIcon);
      delBtn.addEventListener('click', () => this._deleteRow(i));

      const title = document.createElement('span');
      title.className = 'row-title';
      title.textContent = `#${i + 1}`;

      const header = document.createElement('div');
      header.className = 'row-header';
      header.append(title, delBtn);

      const card = document.createElement('div');
      card.className = 'row-card';
      card.append(header, this.#entityField(item, i));
      if (item.entity) card.append(this.#attributeField(item, i));
      card.append(this.#colorField(item, i), this.#subtractField(item, i));

      this._listEl.appendChild(card);
    }
  }
}

if (!customElements.get(EntityProgressBarStackEditor.ELEMENT_NAME)) {
  customElements.define(EntityProgressBarStackEditor.ELEMENT_NAME, EntityProgressBarStackEditor);
}

/**
 * Custom element that renders an editable list of custom_theme zones, each a
 * contiguous { min, max, color?, icon_color?, bar_color?, icon? } range.
 * Mirrors EntityProgressBarStackEditor's row-list pattern (label, list, add
 * button, value-changed with the filtered array), with a richer per-row form.
 *
 * @extends HTMLElement
 */

class EntityProgressCustomThemeEditor extends ListEditorBase {
  static ELEMENT_NAME = 'entity-progress-custom-theme-editor';
  #hass: Hass | null = null;
  #addBtn: HTMLElement | null = null;
  #addLabel = 'Add zone';

  setAddLabel(val: string) {
    this.#addLabel = val ?? this.#addLabel;
    if (this.#addBtn?.lastChild) this.#addBtn.lastChild.textContent = this.#addLabel;
  }

  get hass(): Hass | null {
    return this.#hass;
  }

  set hass(hass: Hass) {
    this.#hass = hass;
    for (const el of this.shadowRoot?.querySelectorAll(HA_SELECTOR_TAG) ?? []) (el as HaSelectorElement).hass = hass;
  }

  _buildDOM() {
    const style = document.createElement('style');
    style.textContent = CUSTOM_THEME_EDITOR_STYLE;
    this._labelEl = document.createElement('div');
    this._labelEl.className = 'lbl';
    this._labelEl.textContent = this._labelText;
    this._list = document.createElement('div');
    this.#addBtn = document.createElement('ha-button');
    const addIcon = document.createElement(HA_SVG_ICON_TAG) as HaSvgIconElement;
    addIcon.setAttribute('slot', 'icon');
    addIcon.path = 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z';
    this.#addBtn.appendChild(addIcon);
    this.#addBtn.append(this.#addLabel);
    this.#addBtn.addEventListener('click', () => {
      this._value = [...this._value, {}];
      this._render();
    });
    const addRow = document.createElement('div');
    addRow.className = 'add-row';
    addRow.appendChild(this.#addBtn);
    this._shadow.append(style, this._labelEl, this._list, addRow);
  }

  _dispatch() {
    const isEmpty = (item: CustomThemeZone) =>
      !is.number(item.min) && !is.number(item.max) && !item.color && !item.icon_color && !item.bar_color && !item.icon;
    const clean = this._value.filter((item) => !isEmpty(item));
    this.dispatchEvent(
      new CustomEvent(VALUE_CHANGED_EVENT, {
        detail: { value: clean.length ? clean : undefined },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #numberField(item: CustomThemeZone, index: number, key: 'min' | 'max'): HaSelectorElement {
    const el = document.createElement(HA_SELECTOR_TAG) as HaSelectorElement;
    el.hass = this.#hass;
    el.selector = { number: {} };
    el.label = key === 'min' ? 'Min' : 'Max';
    el.value = is.number(item[key]) ? item[key] : undefined;
    el.addEventListener(VALUE_CHANGED_EVENT, (e: Event) => {
      const evt = e as CustomEvent;
      evt.stopPropagation();
      this._updateItem(index, { [key]: is.number(evt.detail.value) ? evt.detail.value : undefined });
    });
    return el;
  }

  #colorField(
    item: CustomThemeZone,
    index: number,
    key: 'color' | 'icon_color' | 'bar_color',
    label: string,
  ): HaSelectorElement {
    const el = document.createElement(HA_SELECTOR_TAG) as HaSelectorElement;
    el.hass = this.#hass;
    el.selector = { 'ui-color': {} };
    el.label = label;
    el.style.width = '100%';
    el.value = item[key] ?? '';
    el.addEventListener(VALUE_CHANGED_EVENT, (e: Event) => {
      const evt = e as CustomEvent;
      evt.stopPropagation();
      this._updateItem(index, { [key]: evt.detail.value || undefined });
    });
    return el;
  }

  #iconField(item: CustomThemeZone, index: number): HaSelectorElement {
    const el = document.createElement(HA_SELECTOR_TAG) as HaSelectorElement;
    el.hass = this.#hass;
    el.selector = { icon: { icon_set: ['mdi'] } };
    el.label = 'Icon';
    el.style.width = '100%';
    el.value = item.icon ?? '';
    el.addEventListener(VALUE_CHANGED_EVENT, (e: Event) => {
      const evt = e as CustomEvent;
      evt.stopPropagation();
      this._updateItem(index, { icon: evt.detail.value || undefined });
    });
    return el;
  }

  _render() {
    this._listEl.innerHTML = '';
    for (let i = 0; i < this._value.length; i++) {
      const item = this._value[i];

      const delBtn = document.createElement('button');
      delBtn.className = 'del-btn';
      delBtn.title = 'Delete';
      const delIcon = document.createElement(HA_SVG_ICON_TAG) as HaSvgIconElement;
      delIcon.path =
        'M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,18.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z';
      delBtn.appendChild(delIcon);
      delBtn.addEventListener('click', () => this._deleteRow(i));

      const header = document.createElement('div');
      header.className = 'zone-header';
      const title = document.createElement('span');
      title.className = 'zone-title';
      title.textContent = `Zone ${i + 1}`;
      header.append(title, delBtn);

      const numbers = document.createElement('div');
      numbers.className = 'numbers-row';
      numbers.append(this.#numberField(item, i, 'min'), this.#numberField(item, i, 'max'));

      const zone = document.createElement('div');
      zone.className = 'zone';
      zone.append(
        header,
        numbers,
        this.#iconField(item, i),
        this.#colorField(item, i, 'color', 'Icon & bar color'),
        this.#colorField(item, i, 'icon_color', 'Icon color'),
        this.#colorField(item, i, 'bar_color', 'Bar color'),
      );
      this._listEl.appendChild(zone);
    }
  }
}

if (!customElements.get(EntityProgressCustomThemeEditor.ELEMENT_NAME)) {
  customElements.define(EntityProgressCustomThemeEditor.ELEMENT_NAME, EntityProgressCustomThemeEditor);
}

export { ListEditorBase };
export { EntityProgressBarStackEditor };
export { EntityProgressCustomThemeEditor };
