/*
 * EditorDOMHelper: registers and reactively updates the visual editor's form
 * fields (value, visibility, width, selector) as the config changes.
 */

import { HA_CONTEXT, CARD } from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { HassProviderSingleton, type Hass } from '../utils/hass-provider.js';
import type { RawConfig, Config, FieldDef } from '../utils/types.js';
import { DOMHelper } from '../card/dom-helpers.js';

const availableSpace = (gap = 16, factor = 0.5): string => `calc((100% - ${gap}px) * ${factor})`;

// Field definitions (`def`, typed `FieldDef`), the raw config (`config`,
// typed `RawConfig` - config-changed's own shape, plus editor UI state) and
// the negotiated one (`negotiated`, typed `Config` - post schema validation)
// are all dynamic `any`-shaped bags - branded so none of the three can be
// swapped positionally in the functions below (see _updateField); selector/
// context payloads stay plain `any`, no adjacent lookalike to confuse them
// with.
class EditorDOMHelper extends DOMHelper {
  // ─── Field registration ───────────────────────────────────────────────────

  /**
   * Registers a field element and its definition.
   * Wraps DOMHelper.register() — the def is stored on the element directly
   * so it travels with it without needing a separate Map.
   */
  registerField(name: string, el: any, def: FieldDef) {
    el._fieldDef = def;
    this.register(name, el);
  }

  // ─── Hass propagation ─────────────────────────────────────────────────────

  /**
   * Propagates hass to all registered field elements.
   * Batched in a single RAF call.
   */
  updateHass(hass: Hass) {
    this.enqueue('__hass__', 'hass', () => {
      for (const el of this._domElements.values()) {
        if (el.hass !== hass) el.hass = hass;
      }
    });
  }

  // ─── Field value ──────────────────────────────────────────────────────────

  /**
   * Updates the value of a ha-selector field.
   * Skipped if value hasn't changed.
   */
  updateValue(name: string, newVal: unknown) {
    this.enqueue(name, 'value', () => {
      const el = this._domElements.get(name);
      if (!el) return;
      if (el.value !== newVal) el.value = newVal;
    });
  }

  // ─── Visibility ───────────────────────────────────────────────────────────

  /**
   * Shows or hides a field.
   * Batched via RAF.
   */
  updateVisibility(name: string, visible: boolean) {
    const cacheKey = `${name}:display`;
    if (this._appliedValues.get(cacheKey) === visible) return;

    this.enqueue(name, 'display', () => {
      const el = this._domElements.get(name);
      if (!el) return;
      el.style.display = visible ? '' : 'none';
      this._appliedValues.set(cacheKey, visible);
    });
  }

  // ─── Width ────────────────────────────────────────────────────────────────

  /**
   * Updates a field's width. Only reached for fields whose `width` is a
   * function of config (e.g. icon_animation pairing up with `icon` once
   * `color`'s row disappears under a theme) - a plain string width is applied
   * once in EditorBase#buildField and never revisited.
   */
  updateWidth(name: string, width: string) {
    const cacheKey = `${name}:width`;
    if (this._appliedValues.get(cacheKey) === width) return;

    this.enqueue(name, 'width', () => {
      const el = this._domElements.get(name);
      if (!el) return;
      el.style.width = width;
      this._appliedValues.set(cacheKey, width);
    });
  }

  // ─── Action selector default ──────────────────────────────────────────────

  /**
   * Updates the ui-action selector with the effective default_action so that
   * the native ha-selector renders "Default (action-name)" inside the box.
   * Mirrors the validation preprocess logic for icon_tap_action (toggleDomain).
   */
  _updateActionSelector(name: string, def: FieldDef, config: RawConfig) {
    const key = def.target ?? def.name;
    const defaults: Record<string, any> = CARD.config.defaults;
    let defaultAction = defaults[key]?.action ?? 'none';
    if (key === 'icon_tap_action' && config.entity) {
      const domain = HassProviderSingleton.getEntityDomain(config.entity);
      if (domain && HA_CONTEXT.actions.toggleDomain.includes(domain)) defaultAction = 'toggle';
    }
    this.updateSelector(name, { 'ui-action': { default_action: defaultAction } });
  }

  // ─── Dynamic selector ─────────────────────────────────────────────────────

  /**
   * Updates the selector of a ha-selector field. Used for fields whose options
   * depend on another field (e.g. attribute → entity).
   */
  updateSelector(name: string, selector: unknown) {
    // Was reassigned unconditionally on every #updateFields() pass (i.e. every
    // editor keystroke, for every field with selectorOf — not just the one
    // being edited), forcing the child ha-selector's attribute picker to fully
    // re-render each time regardless of whether the referenced entity actually
    // changed. Value-cached like the other setters.
    const cacheKey = `${name}:selector`;
    const serialized = JSON.stringify(selector);
    if (this._appliedValues.get(cacheKey) === serialized) return;

    this.enqueue(name, 'selector', () => {
      const el = this._domElements.get(name);
      if (!el) return;
      el.selector = selector;
      this._appliedValues.set(cacheKey, serialized);
    });
  }

  // ─── Bulk update ──────────────────────────────────────────────────────────

  /**
   * Iterates all registered fields and applies value, visibility,
   * and dynamic selector updates based on the current config.
   */
  _applyContext(name: string, contextDef: Record<string, string>, config: RawConfig) {
    // Same class of bug as updateSelector: reassigned a brand-new object on
    // every #updateFields() pass (i.e. on every keystroke anywhere in the form,
    // not just in this field), forcing the child selector (e.g. state_content's
    // entity/attribute picker) to fully re-render every time regardless of
    // whether anything changed.
    const cacheKey = `${name}:context`;
    const resolved = Object.fromEntries(
      Object.entries(contextDef).map(([key, configKey]) => [key, config[configKey] ?? '']),
    );
    const serialized = JSON.stringify(resolved);
    if (this._appliedValues.get(cacheKey) === serialized) return;

    this.enqueue(name, 'context', () => {
      const target = this._domElements.get(name);
      if (!target) return;
      target.context = resolved;
      this._appliedValues.set(cacheKey, serialized);
    });
  }

  updateAll(
    config: RawConfig,
    resolveValue: (def: FieldDef, config: RawConfig) => unknown,
    negotiated: Config | null = null,
    resolveType: ((def: FieldDef, config: RawConfig) => unknown) | null = null,
  ) {
    for (const [name, el] of this._domElements) {
      const def = el._fieldDef;
      if (def) this._updateField(name, def, config, resolveValue, negotiated, resolveType);
    }
  }

  _updateField(
    name: string,
    def: FieldDef,
    config: RawConfig,
    resolveValue: (def: FieldDef, config: RawConfig) => unknown,
    negotiated: Config | null = null,
    resolveType: ((def: FieldDef, config: RawConfig) => unknown) | null = null,
  ) {
    // Visibility
    if (def.showIf) {
      this.updateVisibility(name, def.showIf(config, negotiated));
    }

    // Width
    if (is.func(def.width)) {
      this.updateWidth(name, def.width(config) as string);
    }

    // Dynamic type (e.g. bar_orientation offering 'up' only in the two
    // combinations where it has a visible effect - see
    // HACore#_addBaseClasses)
    if (is.func(def.type) && resolveType) {
      this.updateSelector(name, resolveType(def, config));
    }

    // Dynamic selector
    if (def.selectorOf) {
      const resolved = def.selectorOf.includes('.')
        ? def.selectorOf.split('.').reduce((obj: any, k: string) => obj?.[k], config)
        : config[def.selectorOf];
      // The source key can hold a non-string shape (watermark.low: { jinja }) —
      // the native attribute selector expects an entity-id string, so anything
      // else degrades to ''.
      this.updateSelector(name, { attribute: { entity_id: is.string(resolved) ? resolved : '' } });
    }

    // Context
    if (def.context) {
      this._applyContext(name, def.context, config);
    }

    // Champs virtuels — pas de valeur dans le config, géré par showIf
    // uniquement
    if (def.virtual) {
      this._updateVirtualValue(name, def, config);
      return;
    }

    // Value
    const raw = resolveValue(def, config);
    const val = def.invert ? !raw : raw;
    this.updateValue(name, val);

    // Allow elements with updateConfig (e.g. chips fields) to receive full
    // config
    const el = this._domElements.get(name);
    if (el && is.func(el.updateConfig)) el.updateConfig(config);

    // Inject effective default_action so ha-selector renders "Default
    // (action-name)"
    if (def.type === 'action') this._updateActionSelector(name, def, config);
  }

  _updateVirtualValue(name: string, def: FieldDef, config: RawConfig) {
    if (!def.resolveVirtual) return;
    this.updateValue(name, def.resolveVirtual(config));
  }
}

export { availableSpace };
export { EditorDOMHelper };
