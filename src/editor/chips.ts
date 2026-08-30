/*
 * The chip-based selector components used by the visual editor: multi-select
 * (bar_effect, hide) and single-select mode chips (min/max value mode, theme
 * mode, bar_stack mode...).
 */

import { CARD, VALUE_CHANGED_EVENT, devName } from '../utils/parameters.js';
import { CHIPS_HOST_STYLE } from '../utils/styles.js';
import { is } from '../utils/common-checks.js';
import { defineElement } from '../utils/register.js';
import type { LovelaceConfig } from '../utils/types.js';

/**
 * Shared base for the editor's chip-based selector custom elements: builds
 * the `<style>` + label + chip-set shadow DOM once (`_buildChipSet`), renders
 * chip labels from an optional localized map (`_labels`/`_chipLabel`), and
 * wires per-chip click handlers. Concrete subclasses implement `_buildDOM()`/
 * `_render()` and the selection model (multi-select vs single-select, see
 * `EntityProgressModeChips`).
 *
 * @abstract
 * @extends HTMLElement
 */
// `_labels` is an optional localized display-label map (value → label string),
// set by the editor from translations - keyed dynamically per field, so kept
// as a plain index signature rather than a fixed interface.
abstract class ChipsBase extends HTMLElement {
  // CF5 - issue (major) resolved - setLabels() is called by the editor before
  // the element is connected, when the chips Map is still empty; labels are now
  // stored and applied at build time
  _labels: Record<string, string> | null = null;
  // Shared by every concrete chip set - written by _buildChipSet, read by
  // this class's own setLabels below and each subclass's own _render/toggle.
  _chips = new Map<string, HTMLButtonElement>();
  #labelText = '';
  #labelEl: HTMLElement | null = null;
  // Always assigned first thing in connectedCallback, before _buildDOM()/
  // _render() (the only methods that read it) can run.
  #shadow!: ShadowRoot;

  abstract _buildDOM(): void;
  abstract _render(): void;

  connectedCallback() {
    this.#shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    if (!this.#shadow.querySelector('.chip-set')) this._buildDOM();
    this._render();
  }

  get label(): string {
    return this.#labelText;
  }

  set label(val: string) {
    this.#labelText = val ?? '';
    if (this.#labelEl) this.#labelEl.textContent = this.#labelText;
  }

  _chipLabel(value: string): string {
    return this._labels?.[value] ?? value;
  }

  setLabels(labels: Record<string, string> | null) {
    this._labels = labels ?? null;
    for (const [value, chip] of this._chips) chip.textContent = this._chipLabel(value);
  }

  _createChip(value: string, onToggle: (value: string) => void): HTMLButtonElement {
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

  _buildChipSet(values: string[], onToggle: (value: string) => void, extraClass?: string) {
    const style = document.createElement('style');
    style.textContent = CHIPS_HOST_STYLE;
    const frag: HTMLElement[] = [style];
    if (this.#labelText) {
      this.#labelEl = document.createElement('div');
      this.#labelEl.className = 'lbl';
      this.#labelEl.textContent = this.#labelText;
      frag.push(this.#labelEl);
    }
    const chipSet = document.createElement('div');
    chipSet.className = extraClass ? `chip-set ${extraClass}` : 'chip-set';
    for (const value of values) {
      const chip = this._createChip(value, onToggle);
      chipSet.appendChild(chip);
      this._chips.set(value, chip);
    }
    frag.push(chipSet);
    this.#shadow.append(...frag);
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
  static ELEMENT_NAME = devName('entity-progress-effect-chips');
  static #EFFECTS: { value: string; showIf?: (c: LovelaceConfig) => boolean }[] = [
    { value: 'radius' },
    { value: 'glass', showIf: (c) => c.bar_color_mode === 'auto' || is.nullish(c.bar_color_mode) },
    { value: 'gradient', showIf: (c) => c.bar_color_mode === 'auto' || is.nullish(c.bar_color_mode) },
    { value: 'gradient_reverse', showIf: (c) => c.bar_color_mode === 'auto' || is.nullish(c.bar_color_mode) },
    { value: 'shimmer' },
    { value: 'shimmer_reverse' },
  ];

  // Shared with the runtime guard in HACore._handleBarEffect - see
  // CARD.style.dynamic.progressBar.effectIncompatibilities.
  static get #INCOMPATIBLE(): Record<string, string[]> {
    return CARD.style.dynamic.progressBar.effectIncompatibilities;
  }

  #selected: string[] = [];
  #config: LovelaceConfig = {} as LovelaceConfig;

  _buildDOM() {
    this._buildChipSet(
      EntityProgressEffectChips.#EFFECTS.map((effect) => effect.value),
      (value) => this.#toggle(value),
    );
  }

  #toggle(value: string) {
    const isSelected = this.#selected.includes(value);
    const blocked = isSelected ? [] : (EntityProgressEffectChips.#INCOMPATIBLE[value] ?? []);
    const updated = isSelected
      ? this.#selected.filter((v) => v !== value)
      : [...this.#selected.filter((v) => !blocked.includes(v)), value];
    this.dispatchEvent(
      new CustomEvent(VALUE_CHANGED_EVENT, { detail: { value: updated }, bubbles: true, composed: true }),
    );
  }

  get value(): string[] {
    return this.#selected;
  }

  set value(val: string[]) {
    this.#selected = is.array(val) ? val : [];
    this._render();
  }

  updateConfig(config: LovelaceConfig) {
    this.#config = config ?? {};
    this._render();
  }

  _render() {
    if (!this._chips.size) return;
    // A chip that goes from visible to hidden mid-selection (bar_color_mode
    // switched away from 'auto' while e.g. 'gradient' was picked) must drop
    // out of the selection too, not just visually disappear - otherwise it
    // stays in config with no way left to remove it from this UI.
    const stillHidden: string[] = [];
    for (const effect of EntityProgressEffectChips.#EFFECTS) {
      const chip = this._chips.get(effect.value);
      if (!chip) continue;
      const visible = !effect.showIf || effect.showIf(this.#config);
      const blocked = (EntityProgressEffectChips.#INCOMPATIBLE[effect.value] ?? []).some((v) =>
        this.#selected.includes(v),
      );
      const isVisible = visible && !blocked;
      chip.style.display = isVisible ? '' : 'none';
      chip.classList.toggle('selected', this.#selected.includes(effect.value));
      if (!isVisible && this.#selected.includes(effect.value)) stillHidden.push(effect.value);
    }
    if (stillHidden.length) {
      this.#selected = this.#selected.filter((v) => !stillHidden.includes(v));
      this.dispatchEvent(
        new CustomEvent(VALUE_CHANGED_EVENT, { detail: { value: this.#selected }, bubbles: true, composed: true }),
      );
    }
  }
}

defineElement(EntityProgressEffectChips.ELEMENT_NAME, EntityProgressEffectChips);

/**
 * Multi-select chips for the `hide` option: toggles which card components
 * (icon, name, value, unit, secondary info, progress bar) are hidden. The
 * offered item list is restricted per field via the `items` setter (e.g.
 * Template/Badge Template never offer `unit`).
 *
 * @extends ChipsBase
 */
class EntityProgressHideChips extends ChipsBase {
  static ELEMENT_NAME = devName('entity-progress-hide-chips');
  static #ITEMS = ['icon', 'name', 'value', 'unit', 'secondary_info', 'progress_bar'];
  #selected: string[] = [];
  #items: string[] = EntityProgressHideChips.#ITEMS;
  #config: LovelaceConfig = {} as LovelaceConfig;

  get items(): string[] {
    return this.#items;
  }

  // Template/BadgeTemplate have no 'unit' key in their `hide` schema (see
  // YamlSchemaFactory.template) - EditorFactory.content passes a restricted
  // list there so the chip never appears, instead of getting silently
  // stripped by jinjaOrArrayWithValidatedElem on save.
  set items(list: string[]) {
    this.#items = is.array(list) ? list : EntityProgressHideChips.#ITEMS;
  }

  _buildDOM() {
    this._buildChipSet(this.#items, (value) => this.#toggle(value));
  }

  // density: compact + layout: vertical forces name/secondary_info hidden
  // regardless of this field (ViewCore.hasComponentHiddenFlag) - shown here
  // as forced-on/locked so the chips don't silently disagree with the render.
  #forcedItems(): string[] {
    return this.#config.density === 'compact' && this.#config.layout === 'vertical' ? ['name', 'secondary_info'] : [];
  }

  // value/unit only ever affect text rendered *inside* secondary_info's own
  // row - moot once that whole row is gone (#forcedItems above), not just
  // redundant, so hidden from the picker entirely rather than shown disabled
  // like name/secondary_info themselves (there's no forced state to convey).
  #mootItems(): string[] {
    return this.#forcedItems().length ? ['value', 'unit'] : [];
  }

  #toggle(value: string) {
    if (this.#forcedItems().includes(value)) return;
    const updated = this.#selected.includes(value)
      ? this.#selected.filter((v) => v !== value)
      : [...this.#selected, value];
    this.dispatchEvent(
      new CustomEvent(VALUE_CHANGED_EVENT, { detail: { value: updated }, bubbles: true, composed: true }),
    );
  }

  get value(): string[] {
    return this.#selected;
  }

  set value(val: string[]) {
    this.#selected = is.array(val) ? val : [];
    this._render();
  }

  updateConfig(config: LovelaceConfig) {
    this.#config = config ?? ({} as LovelaceConfig);
    this._render();
  }

  _render() {
    const forced = this.#forcedItems();
    const moot = this.#mootItems();
    for (const [item, chip] of this._chips) {
      const isForced = forced.includes(item);
      chip.classList.toggle('selected', isForced || this.#selected.includes(item));
      chip.classList.toggle('forced', isForced);
      chip.style.display = moot.includes(item) ? 'none' : '';
    }
  }
}

defineElement(EntityProgressHideChips.ELEMENT_NAME, EntityProgressHideChips);

// Single-select: exactly one mode is always active (no deselect-to-empty),
// unlike EffectChips/HideChips's own array membership. One element for every
// single-select mode field (value source, theme mode, simple/advanced...) -
// `modes` is per-instance, set by EditorBase#buildModeChipsField, same
// pattern as EntityProgressHideChips's own `items`.
class EntityProgressModeChips extends ChipsBase {
  static ELEMENT_NAME = devName('entity-progress-mode-chips');
  #selected: string | null = null;
  #modes: string[] = [];

  get modes(): string[] {
    return this.#modes;
  }

  set modes(list: string[]) {
    this.#modes = is.nonEmptyArray(list) ? (list as string[]) : [];
  }

  _buildDOM() {
    this.#selected ??= this.#modes[0];
    // 2-mode sets (Simple/Advanced, Preset/Custom) render as one fused
    // segmented pill instead of separate chips - see .chip-set.segmented.
    const segmented = this.#modes.length === 2;
    if (segmented) this.classList.add('inline-row');
    this._buildChipSet(this.#modes, (value) => this.#select(value), segmented ? 'segmented' : undefined);
  }

  #select(value: string) {
    if (value === this.#selected) return;
    this.#selected = value;
    this._render();
    this.dispatchEvent(new CustomEvent(VALUE_CHANGED_EVENT, { detail: { value }, bubbles: true, composed: true }));
  }

  get value(): string {
    return this.#selected ?? this.#modes[0];
  }

  set value(val: string) {
    this.#selected = this.#modes.includes(val) ? val : this.#modes[0];
    this._render();
  }

  _render() {
    for (const [item, chip] of this._chips) chip.classList.toggle('selected', item === this.#selected);
  }
}
defineElement(EntityProgressModeChips.ELEMENT_NAME, EntityProgressModeChips);

export { EntityProgressEffectChips };
export { EntityProgressHideChips };
export { EntityProgressModeChips };
