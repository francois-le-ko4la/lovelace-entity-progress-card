/*
 * EditorDOMHelper: registers and reactively updates the visual editor's form
 * fields (value, visibility, width, selector) as the config changes.
 */

import { HA_CONTEXT } from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { HassProviderSingleton, type HomeAssistant } from '../utils/hass-provider.js';
import type { LovelaceConfig, Config, FieldDef } from '../utils/types.js';
import { DOMHelper } from '../card/dom-helpers.js';
import { SCHEMA_DEFAULTS } from '../card/schema.js';

// HA's ha-expansion-panel, reduced to what we read: its reflected `expanded`
// boolean. `expanded-changed` (a CustomEvent<{ expanded: boolean }>) is
// listened to in EditorBase, not here.
type HaExpansionPanel = HTMLElement & { expanded: boolean };

// A registered field element with the lazily-cached reference to its owning
// panel (undefined = not yet resolved, null = flat/no panel).
type PanelAwareField = HTMLElement & { _ownerPanel?: HaExpansionPanel | null };

// A field's owning ha-expansion-panel (or null for the flat `general`
// section), resolved once via closest() and cached on the element - the
// fields are appended into their panel only after registration, so this can't
// be captured earlier, but by the first update pass the tree is fully
// assembled. `closest` stays inside the editor's own shadow tree (fields and
// panels share it), so it never crosses a shadow boundary.
const ownerPanel = (el: PanelAwareField): HaExpansionPanel | null => {
  if (el._ownerPanel === undefined) {
    el._ownerPanel = el.closest('ha-expansion-panel') as HaExpansionPanel | null;
  }
  return el._ownerPanel;
};

// What updateAll/updatePanel/updateKeys/_updateField all need to resolve one
// field's current state - bundled since the four always travel together
// (built once per pass by EditorBase#runFieldUpdate).
type FieldUpdateContext = {
  config: LovelaceConfig;
  resolveValue: (def: FieldDef, config: LovelaceConfig) => unknown;
  negotiated: Config | null;
  resolveType: ((def: FieldDef, config: LovelaceConfig) => unknown) | null;
};

// Field definitions (`def`, typed `FieldDef`), the raw config (`config`,
// typed `LovelaceConfig`) and the negotiated one (`negotiated`, typed
// `Config`) are all dynamic `any`-shaped bags - branded so none of the three
// can be swapped positionally in the functions below (see _updateField).
class EditorDOMHelper extends DOMHelper {
  // ─── Field registration ───────────────────────────────────────────────────

  /**
   * Registers a field element and its definition.
   * Wraps DOMHelper.register() — the def is stored on the element directly
   * so it travels with it without needing a separate Map.
   */
  registerField(name: string, el: HTMLElement & { _fieldDef?: FieldDef }, def: FieldDef) {
    el._fieldDef = def;
    this.register(name, el);
  }

  // ─── hass propagation ─────────────────────────────────────────────────────

  /**
   * Propagates hass to all registered field elements.
   * Batched in a single RAF call.
   */
  updateHass(hass: HomeAssistant) {
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
    this._cachedUpdate(name, 'display', visible, (el, v) => {
      el.style.display = v ? '' : 'none';
    });
  }

  // ─── Width ────────────────────────────────────────────────────────────────

  // ─── Placeholder ──────────────────────────────────────────────────────────

  /**
   * Greyed hint shown inside an empty field (e.g. unit/decimal's negotiated
   * default). Recomputed each pass since it can depend on other config keys
   * (decimal's default shifts with the chosen unit).
   */
  updatePlaceholder(name: string, placeholder: string) {
    this._cachedUpdate(name, 'placeholder', placeholder, (el, v) => {
      el.placeholder = v;
    });
  }

  // Guard kept out of _updateField (its own cognitive-complexity budget) - the
  // field's placeholder is a fn of (rawConfig, negotiated) or absent.
  _applyPlaceholder(name: string, def: FieldDef, config: LovelaceConfig, negotiated: Config | null) {
    if (!def.placeholder) return;
    this.updatePlaceholder(name, String(def.placeholder(config, negotiated) ?? ''));
  }

  // ─── Action selector default ──────────────────────────────────────────────

  /**
   * Updates the ui-action selector with the effective default_action so that
   * the native ha-selector renders "Default (action-name)" inside the box.
   * Mirrors the validation preprocess logic for icon_tap_action (toggleDomain).
   */
  _updateActionSelector(name: string, def: FieldDef, config: LovelaceConfig) {
    const key = def.target ?? def.name;
    let defaultAction = SCHEMA_DEFAULTS.actions[key] ?? 'none';
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
  _applyContext(name: string, contextDef: Record<string, string>, config: LovelaceConfig) {
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

  // Shared by updateAll/updatePanel/updateKeys below - each only differs in
  // which fields it wants to reach, not in how a reached field gets updated.
  #forEachField(predicate: (def: FieldDef, panel: HaExpansionPanel | null) => boolean, ctx: FieldUpdateContext) {
    for (const [name, el] of this._domElements) {
      const def = el._fieldDef;
      if (!def) continue;
      const panel = ownerPanel(el);
      if (!predicate(def, panel)) continue;
      this._updateField(name, def, ctx);
    }
  }

  // Skips fields inside a collapsed panel (lazy-rendered, so recomputing them
  // is pure waste) - EditorBase's updatePanel below catches them up the
  // moment their panel expands.
  updateAll(ctx: FieldUpdateContext) {
    this.#forEachField((_def, panel) => !panel || panel.expanded, ctx);
  }

  // Targeted counterpart to updateAll for a single panel's fields - called by
  // EditorBase on `expanded-changed` so a just-opened panel catches up on any
  // config change it skipped while collapsed.
  updatePanel(panel: HaExpansionPanel, ctx: FieldUpdateContext) {
    this.#forEachField((_def, p) => p === panel, ctx);
  }

  // Targeted counterpart to updateAll for just the fields writing one of
  // `keys` - called by EditorBase when only "isolated" (nothing-else-depends-
  // on-them) config keys changed, so the other fields don't need re-walking.
  // A field's config key is `target ?? name`. Collapsed panels are skipped
  // like in updateAll (the expand handler catches them up).
  updateKeys(keys: Set<string>, ctx: FieldUpdateContext) {
    this.#forEachField((def, panel) => keys.has(def.target ?? def.name) && (!panel || panel.expanded), ctx);
  }

  _updateField(name: string, def: FieldDef, ctx: FieldUpdateContext) {
    const { config, resolveValue, negotiated, resolveType } = ctx;
    if (def.showIf) {
      this.updateVisibility(name, def.showIf(config, negotiated));
    }

    // Dynamic type (e.g. bar_orientation offering 'up' only in the two
    // combinations where it has a visible effect - see
    // HACore#_addBaseClasses)
    if (is.func(def.type) && resolveType) {
      this.updateSelector(name, resolveType(def, config));
    }

    // Dynamic selector
    if (def.selectorOf) {
      // A '.value.' segment (watermark.low/.high's own entity path) only
      // exists once the mark is wrapped ({ value: {...}, as, type, opacity,
      // color }) - a short, never-wrapped form ({ entity: ... } directly) has
      // no 'value' key to walk through, so treat that step as a no-op instead
      // of losing the rest of the path.
      const resolved = def.selectorOf.includes('.')
        ? (def.selectorOf as string).split('.').reduce<unknown>((obj, k) => {
            if (k === 'value' && is.plainObject(obj) && !('value' in obj)) return obj;
            return (obj as Record<string, unknown>)?.[k];
          }, config)
        : config[def.selectorOf];
      // The source key can hold a non-string shape (watermark.low: { jinja }) —
      // the native attribute selector expects an entity-id string, so anything
      // else degrades to ''.
      this.updateSelector(name, { attribute: { entity_id: is.string(resolved) ? resolved : '' } });
    }

    if (def.context) {
      this._applyContext(name, def.context, config);
    }

    // Placeholder (negotiated default shown greyed - e.g. unit/decimal)
    this._applyPlaceholder(name, def, config, negotiated);

    this._applyModes(name, def, config);

    // Virtual fields: no value in config, showIf alone drives them.
    if (def.virtual) {
      this._updateVirtualValue(name, def, config);
      return;
    }

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

  // A chip set whose list depends on the config (density, see factory.ts) -
  // applied before the value, which falls back to the first chip when the one
  // it holds has just left the list.
  _applyModes(name: string, def: FieldDef, config: LovelaceConfig) {
    if (!is.func(def.modes)) return;
    const chips = this._domElements.get(name);
    if (chips) chips.modes = def.modes(config) as string[];
  }

  _updateVirtualValue(name: string, def: FieldDef, config: LovelaceConfig) {
    if (!def.resolveVirtual) return;
    this.updateValue(name, def.resolveVirtual(config));
  }
}

export { EditorDOMHelper };
export type { FieldUpdateContext };
