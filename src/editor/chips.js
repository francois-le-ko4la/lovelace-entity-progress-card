/*
 * The chip-based selector components used by the visual editor: multi-select
 * (bar_effect, hide) and single-select mode chips (min/max value mode, theme
 * mode, bar_stack mode...).
 */

import { CARD, VALUE_CHANGED_EVENT } from '../utils/parameters.js';
import { CHIPS_HOST_STYLE } from '../utils/styles.js';
import { is } from '../utils/common-checks.js';

/**
 * Shared base for the editor's chip-based selector custom elements: builds
 * the `<style>` + label + chip-set shadow DOM once (`_buildChipSet`), renders
 * chip labels from an optional localized map (`_labels`/`_chipLabel`), and
 * wires per-chip click handlers. Concrete subclasses implement `_buildDOM()`/
 * `_render()` and the selection model (multi-select vs single-select, see
 * `SingleSelectChipsBase`).
 *
 * @abstract
 * @extends HTMLElement
 */
class ChipsBase extends HTMLElement {
  // CF5 - issue (major) resolved - setLabels() is called by the editor before
  // the element is connected, when the chips Map is still empty; labels are now
  // stored and applied at build time
  _labels = null;
  #labelText = '';
  #labelEl = null;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    if (!this.shadowRoot.querySelector('.chip-set')) this._buildDOM();
    this._render();
  }

  get label() {
    return this.#labelText;
  }

  set label(val) {
    this.#labelText = val ?? '';
    if (this.#labelEl) this.#labelEl.textContent = this.#labelText;
  }

  _chipLabel(value) {
    return this._labels?.[value] ?? value;
  }

  _createChip(value, onToggle) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = this._chipLabel(value);
    chip.addEventListener('click', (clickEvent) => {
      clickEvent.stopPropagation();
      onToggle(value);
    });
    return chip;
  }

  _buildChipSet(values, onToggle, chipsMap) {
    const style = document.createElement('style');
    style.textContent = CHIPS_HOST_STYLE;
    const frag = [style];
    if (this.#labelText) {
      this.#labelEl = document.createElement('div');
      this.#labelEl.className = 'lbl';
      this.#labelEl.textContent = this.#labelText;
      frag.push(this.#labelEl);
    }
    const chipSet = document.createElement('div');
    chipSet.className = 'chip-set';
    for (const value of values) {
      const chip = this._createChip(value, onToggle);
      chipSet.appendChild(chip);
      chipsMap.set(value, chip);
    }
    frag.push(chipSet);
    this.shadowRoot.append(...frag);
  }
}

/**
 * Multi-select chips for `icon_animation`: toggles a set of visual bar
 * effects, hiding/blocking chips that are mutually incompatible with the
 * current selection (`effectIncompatibilities`).
 *
 * @extends ChipsBase
 */
class EntityProgressEffectChips extends ChipsBase {
  static ELEMENT_NAME = 'entity-progress-effect-chips';
  static #EFFECTS = [
    { value: 'radius' },
    { value: 'glass', showIf: (c) => c.bar_color_mode === 'auto' || is.nullish(c.bar_color_mode) },
    { value: 'gradient', showIf: (c) => c.bar_color_mode === 'auto' || is.nullish(c.bar_color_mode) },
    { value: 'gradient_reverse', showIf: (c) => c.bar_color_mode === 'auto' || is.nullish(c.bar_color_mode) },
    { value: 'shimmer' },
    { value: 'shimmer_reverse' },
  ];

  // Shared with the runtime guard in HACore._handleBarEffect - see
  // CARD.style.dynamic.progressBar.effectIncompatibilities.
  static get #INCOMPATIBLE() {
    return CARD.style.dynamic.progressBar.effectIncompatibilities;
  }

  #selected = [];
  #config = {};
  #chips = new Map();

  _buildDOM() {
    this._buildChipSet(
      EntityProgressEffectChips.#EFFECTS.map((effect) => effect.value),
      (value) => this.#toggle(value),
      this.#chips,
    );
  }

  #toggle(value) {
    const isSelected = this.#selected.includes(value);
    const blocked = isSelected ? [] : (EntityProgressEffectChips.#INCOMPATIBLE[value] ?? []);
    const updated = isSelected
      ? this.#selected.filter((v) => v !== value)
      : [...this.#selected.filter((v) => !blocked.includes(v)), value];
    this.dispatchEvent(
      new CustomEvent(VALUE_CHANGED_EVENT, { detail: { value: updated }, bubbles: true, composed: true }),
    );
  }

  get value() {
    return this.#selected;
  }

  set value(val) {
    this.#selected = is.array(val) ? val : [];
    this._render();
  }

  updateConfig(config) {
    this.#config = config ?? {};
    this._render();
  }

  setLabels(labels) {
    this._labels = labels ?? null;
    for (const [value, chip] of this.#chips) chip.textContent = this._chipLabel(value);
  }

  _render() {
    if (!this.#chips.size) return;
    for (const effect of EntityProgressEffectChips.#EFFECTS) {
      const chip = this.#chips.get(effect.value);
      if (!chip) continue;
      const visible = !effect.showIf || effect.showIf(this.#config);
      const blocked = (EntityProgressEffectChips.#INCOMPATIBLE[effect.value] ?? []).some((v) =>
        this.#selected.includes(v),
      );
      chip.style.display = visible && !blocked ? '' : 'none';
      chip.classList.toggle('selected', this.#selected.includes(effect.value));
    }
  }
}

if (!customElements.get(EntityProgressEffectChips.ELEMENT_NAME)) {
  customElements.define(EntityProgressEffectChips.ELEMENT_NAME, EntityProgressEffectChips);
}

/**
 * Multi-select chips for the `hide` option: toggles which card components
 * (icon, name, value, unit, secondary info, progress bar) are hidden. The
 * offered item list is restricted per field via the `items` setter (e.g.
 * Template/Badge Template never offer `unit`).
 *
 * @extends ChipsBase
 */
class EntityProgressHideChips extends ChipsBase {
  static ELEMENT_NAME = 'entity-progress-hide-chips';
  static #ITEMS = ['icon', 'name', 'value', 'unit', 'secondary_info', 'progress_bar'];
  #selected = [];
  #chips = new Map();
  #items = EntityProgressHideChips.#ITEMS;

  get items() {
    return this.#items;
  }

  // Template/BadgeTemplate have no 'unit' key in their `hide` schema (see
  // YamlSchemaFactory.template) - EditorFactory.content passes a restricted
  // list there so the chip never appears, instead of getting silently
  // stripped by jinjaOrArrayWithValidatedElem on save.
  set items(list) {
    this.#items = is.array(list) ? list : EntityProgressHideChips.#ITEMS;
  }

  _buildDOM() {
    this._buildChipSet(this.#items, (value) => this.#toggle(value), this.#chips);
  }

  #toggle(value) {
    const updated = this.#selected.includes(value)
      ? this.#selected.filter((v) => v !== value)
      : [...this.#selected, value];
    this.dispatchEvent(
      new CustomEvent(VALUE_CHANGED_EVENT, { detail: { value: updated }, bubbles: true, composed: true }),
    );
  }

  get value() {
    return this.#selected;
  }

  set value(val) {
    this.#selected = is.array(val) ? val : [];
    this._render();
  }

  setLabels(labels) {
    this._labels = labels ?? null;
    for (const [item, chip] of this.#chips) chip.textContent = this._chipLabel(item);
  }

  _render() {
    for (const [item, chip] of this.#chips) chip.classList.toggle('selected', this.#selected.includes(item));
  }
}

if (!customElements.get(EntityProgressHideChips.ELEMENT_NAME)) {
  customElements.define(EntityProgressHideChips.ELEMENT_NAME, EntityProgressHideChips);
}

/**
 * Single-select variant: exactly one mode is always active (no
 * deselect-to-empty), unlike EffectChips/HideChips which toggle membership in
 * an array. Concrete subclasses only need to declare `static MODES`;
 * `this.constructor.MODES` resolves polymorphically.
 *
 * @abstract
 * @extends ChipsBase
 */
class SingleSelectChipsBase extends ChipsBase {
  #selected = null;
  #chips = new Map();

  _buildDOM() {
    this.#selected ??= this.constructor.MODES[0];
    this._buildChipSet(this.constructor.MODES, (value) => this.#select(value), this.#chips);
  }

  #select(value) {
    if (value === this.#selected) return;
    this.#selected = value;
    this._render();
    this.dispatchEvent(new CustomEvent(VALUE_CHANGED_EVENT, { detail: { value }, bubbles: true, composed: true }));
  }

  get value() {
    return this.#selected ?? this.constructor.MODES[0];
  }

  set value(val) {
    this.#selected = this.constructor.MODES.includes(val) ? val : this.constructor.MODES[0];
    this._render();
  }

  setLabels(labels) {
    this._labels = labels ?? null;
    for (const [item, chip] of this.#chips) chip.textContent = this._chipLabel(item);
  }

  _render() {
    for (const [item, chip] of this.#chips) chip.classList.toggle('selected', item === this.#selected);
  }
}

/**
 * One element for every "value source" selector (min_value, max_value,
 * watermark.low, watermark.high): the modes are identical, and everything
 * field-specific (id, label, localized option labels,
 * resolveVirtual/onVirtualChange) is per-instance, set by #buildModeChipsField
 * from the field definition — the class itself carries nothing to specialize. A
 * field whose modes ever diverge stops being a "value source" and gets its own
 * class, like theme_mode/bar_stack_mode below.
 *
 * @extends SingleSelectChipsBase
 */
class EntityProgressValueSourceModeChips extends SingleSelectChipsBase {
  static ELEMENT_NAME = 'entity-progress-value-source-mode-chips';
  static MODES = ['standard', 'entity', 'jinja'];
}
if (!customElements.get(EntityProgressValueSourceModeChips.ELEMENT_NAME)) {
  customElements.define(EntityProgressValueSourceModeChips.ELEMENT_NAME, EntityProgressValueSourceModeChips);
}

/**
 * Single-select chips for `theme_mode`: preset theme vs custom_theme zones.
 *
 * @extends SingleSelectChipsBase
 */
class EntityProgressThemeModeChips extends SingleSelectChipsBase {
  static ELEMENT_NAME = 'entity-progress-theme-mode-chips';
  static MODES = ['preset', 'custom'];
}
if (!customElements.get(EntityProgressThemeModeChips.ELEMENT_NAME)) {
  customElements.define(EntityProgressThemeModeChips.ELEMENT_NAME, EntityProgressThemeModeChips);
}

/**
 * Single-select chips for `bar_stack.mode`: stacked/proportional/net
 * aggregation of the additional bar_stack entities.
 *
 * @extends SingleSelectChipsBase
 */
class EntityProgressBarStackModeChips extends SingleSelectChipsBase {
  static ELEMENT_NAME = 'entity-progress-bar-stack-mode-chips';
  static MODES = ['stacked', 'proportional', 'net'];
}
if (!customElements.get(EntityProgressBarStackModeChips.ELEMENT_NAME)) {
  customElements.define(EntityProgressBarStackModeChips.ELEMENT_NAME, EntityProgressBarStackModeChips);
}

export { ChipsBase };
export { EntityProgressEffectChips };
export { EntityProgressHideChips };
export { SingleSelectChipsBase };
export { EntityProgressValueSourceModeChips };
export { EntityProgressThemeModeChips };
export { EntityProgressBarStackModeChips };
