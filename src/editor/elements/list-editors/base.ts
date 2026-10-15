import { HA_CONTEXT, suffixedName } from '../../../utils/parameters.js';
import { is, assertDefined } from '../../../utils/common-checks.js';
import type { HomeAssistant } from '../../../utils/hass-provider.js';
import { buildAddButton, buildDeleteButton } from './buttons.js';

// `ha-selector`: its `.selector`/`.value` shape depends on the configured
// selector type - too heterogeneous to model beyond "some value".
type HaSelectorElement = HTMLElement & {
  hass: HomeAssistant | null;
  selector: Record<string, unknown>;
  value: unknown;
  label?: string;
  required?: boolean;
};

// The row's own editor, addressed by tag rather than imported: EditorBase
// already imports this file, and a cycle around a class whose fields are
// static (EditorFactory.buildMultiRow() runs at module load) fails as a
// silent undefined, not as an error.
const MULTI_CARD_ROW_EDITOR_NAME = suffixedName('entity-progress-multi-card-row-editor');
const MULTI_FEATURE_ROW_EDITOR_NAME = suffixedName('entity-progress-multi-feature-row-editor');

// "Open row N" - raised by the list, answered by whoever hosts it.
const EDIT_ROW_EVENT = 'epb-edit-row';

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
    for (const el of this.shadowRoot?.querySelectorAll(HA_CONTEXT.elements.selector) ?? [])
      (el as HaSelectorElement).hass = hass;
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
    const el = document.createElement(HA_CONTEXT.elements.selector) as HaSelectorElement;
    el.hass = this._hass;
    el.selector = selector;
    if (label) el.label = label;
    if (fullWidth) el.style.width = '100%';
    if (required !== undefined) el.required = required;
    el.value = value;
    el.addEventListener(HA_CONTEXT.events.valueChanged, (e: Event) => {
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
      new CustomEvent(HA_CONTEXT.events.valueChanged, {
        detail: { value: clean.length ? clean : undefined },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // The entity picker a row leads with. Shared because the reset it carries
  // is a rule, not a detail: picking another entity drops the attribute that
  // belonged to the previous one.
  _entityField(item: Record<string, unknown>, index: number): HaSelectorElement {
    return this._buildSelectorField({
      selector: { entity: {} },
      value: (item.entity as string) ?? '',
      required: false,
      fullWidth: true,
      onChange: (value) => this._updateItem(index, { entity: (value as string) || undefined, attribute: undefined }),
    });
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

export { ListEditorBase, MULTI_CARD_ROW_EDITOR_NAME, MULTI_FEATURE_ROW_EDITOR_NAME, EDIT_ROW_EVENT };
export type { HaSelectorElement };
