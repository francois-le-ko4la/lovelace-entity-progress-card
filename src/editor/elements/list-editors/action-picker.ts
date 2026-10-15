import { HA_CONTEXT, suffixedName } from '../../../utils/parameters.js';
import { ACTION_PICKER_STYLE } from '../../../utils/styles/editor.js';
import { is } from '../../../utils/common-checks.js';
import { defineElement } from '../../../utils/register.js';
import { buildAddButton } from './buttons.js';

// "+" picker for the interactions panel: reveals one hidden action field at
// a time. value: { visible, hidden }; picking a key dispatches the new array.
class EntityProgressActionPicker extends HTMLElement {
  static ELEMENT_NAME = suffixedName('entity-progress-action-picker');
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
      new CustomEvent(HA_CONTEXT.events.valueChanged, {
        detail: { value: [...this.#visible, key] },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

defineElement(EntityProgressActionPicker.ELEMENT_NAME, EntityProgressActionPicker);

export { EntityProgressActionPicker };
