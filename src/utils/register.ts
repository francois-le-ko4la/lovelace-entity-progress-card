/*
 * Registers the card/badge/template/feature custom elements with Home Assistant
 * via customCards/customBadges/customCardFeatures. The editors define
 * themselves, from their own file (src/editor/entry.ts).
 */

import { VERSION, META, CARD_CONTEXT, SEV, suffixedName } from './parameters.js';
import { Logger } from './log.js';
import type { HomeAssistant } from './hass-provider.js';
import type { EntitySuggestion, EntitySuggestions } from './entity-suggestions.js';

interface Component {
  typeName: string;
  name: string;
  description?: string;
  editor?: string;
  // HA 2026.6+ entity-first card picker (customCards/customBadges only - see
  // entity-suggestions.ts and registerCardFeature below, which never reads
  // this field).
  getEntitySuggestion?: (hass: HomeAssistant, entityId: string) => EntitySuggestions;
}

// ?debug=registration traces the custom-element registration lifecycle
// (every define, every customCards/customBadges/customCardFeatures push, with
// timing) - the one area with no per-instance logger to hang off of, and the
// most relevant to diagnosing load-order/registration issues (see issue #108).
const registrationLog = Logger.create('EPB-registration', CARD_CONTEXT.debug.registration ? SEV.debug : SEV.info);

// Shared by RegistrationHelper and the standalone editor sub-components
// (chips.ts/list-editors.ts) that self-register at module top-level: an
// uncaught throw here happens during module evaluation, not inside a card's
// lifecycle - in a bundled build, everything after it in evaluation order
// never runs. The !customElements.get(...) guard covers "already
// registered"; this catches anything else so a surprise can't take out
// unrelated code.
function defineElement(name: string, elementClass: CustomElementConstructor): void {
  if (CARD_CONTEXT.noRegistration) {
    registrationLog.debug(`define skipped (noRegistration): ${name}`);
    return;
  }
  try {
    if (customElements.get(name)) {
      registrationLog.debug(`define skipped (already registered): ${name}`);
      return;
    }
    customElements.define(name, elementClass);
    registrationLog.debug(`define ok: ${name}`);
  } catch (error) {
    console.warn(`[Entity Progress Card] Registration alert: ${(error as Error).message}`);
  }
}

/**
 * Registers a card/badge/feature custom element with `customElements` and with
 * Home Assistant's discovery arrays
 * (`window.customCards`/`customBadges`/`customCardFeatures`). Under a suffix
 * (`CARD_CONTEXT.suffix`: a dev build, or ?suffix=), every type/editor tag and
 * displayed name gets it - `-rc`/` (rc)` - so the copy runs beside another
 * install without colliding.
 */
// Module-private (was a static-only class; kept the same encapsulation as the
// former `#`-private static members, now via module scope).
const SUFFIX = CARD_CONTEXT.suffix;
const TARGET_KEY = {
  customCards: 'customCards',
  customBadges: 'customBadges',
  customCardFeatures: 'customCardFeatures',
} as const;

const resolveComponent = (component: Component): Component => {
  if (!SUFFIX) return component;
  return {
    ...component,
    typeName: suffixedName(component.typeName),
    name: `${component.name} (${SUFFIX})`,
    editor: component.editor ? suffixedName(component.editor) : undefined,
  };
};

// HA requires the suggestion's own `config` to carry a real `type: "custom:
// ..."` itself (see home-assistant/frontend's CustomCardSuggestion - every
// built-in provider, e.g. hui-gauge-card-suggestions.ts, does the same) - the
// entity-suggestions.ts resolver stays pure domain/attribute logic and knows
// nothing about type names, so it's injected here instead, off the same
// (already dev-suffix-resolved by resolveComponent above) component.typeName
// every other field on this entry already uses.
const withSuggestionType = (
  component: Component,
  resolver: (hass: HomeAssistant, entityId: string) => EntitySuggestions,
) => {
  const type = `custom:${component.typeName}`;
  const typed = (suggestion: EntitySuggestion) => ({ ...suggestion, config: { type, ...suggestion.config } });
  return (hass: HomeAssistant, entityId: string) => {
    const suggestions = resolver(hass, entityId);
    if (!suggestions) return null;
    return Array.isArray(suggestions) ? suggestions.map(typed) : typed(suggestions);
  };
};

const resolveEntry = (component: Component, targetKey: string) =>
  targetKey === TARGET_KEY.customCardFeatures
    ? {
        type: component.typeName,
        name: component.name,
        // HA 2025.6+ asks isSupported; supported alone skips any host card
        // without an entity (Mushroom's template card). Kept for older HA.
        supported: () => true,
        isSupported: () => true,
        // Ignored by HA, read by EPB.doctor.dump(): without it a feature
        // reports no version, and a dump cannot show two bundles disagreeing.
        version: VERSION,
        // HA's own edit-pencil-vs-trash-only decision (hui-card-features-
        // editor.ts) reads this field directly - without it, a feature with
        // a real editor still only ever shows the remove icon.
        configurable: Boolean(component.editor),
      }
    : {
        type: component.typeName,
        name: component.name,
        preview: true,
        description: component.description,
        documentationURL: META.documentation,
        version: VERSION,
        ...(component.getEntitySuggestion
          ? { getEntitySuggestion: withSuggestionType(component, component.getEntitySuggestion) }
          : {}),
      };

const registerComponent = (component: Component, targetKey: string, elementClass: CustomElementConstructor) => {
  // noRegistration: skip both the define(s) and the deferred customCards push
  // in one shot, so the type is entirely absent from the browser and from
  // HA's discovery arrays (see CARD_CONTEXT.noRegistration, issue #108).
  if (CARD_CONTEXT.noRegistration) {
    registrationLog.debug(`registration skipped (noRegistration): ${component.typeName}`);
    return;
  }

  defineElement(component.typeName, elementClass);

  const registerUI = () => {
    try {
      const win = window as unknown as Record<string, { type: string }[]>;
      win[targetKey] = win[targetKey] || [];
      if (win[targetKey].some((item) => item.type === component.typeName)) {
        registrationLog.debug(`${targetKey} push skipped (already present): ${component.typeName}`);
        return;
      }
      win[targetKey].push(resolveEntry(component, targetKey));
      registrationLog.debug(`${targetKey} push ok: ${component.typeName}`);
    } catch (uiError) {
      console.error('[Entity Progress Card] UI Registration failed', uiError);
    }
  };

  registrationLog.debug(`scheduling ${targetKey} UI push (+1000ms): ${component.typeName}`);
  setTimeout(registerUI, 1000);
};

const registerAs = (targetKey: string) => (component: Component, elementClass: CustomElementConstructor) =>
  registerComponent(resolveComponent(component), targetKey, elementClass);

const RegistrationHelper = {
  registerCard: registerAs(TARGET_KEY.customCards),
  registerBadge: registerAs(TARGET_KEY.customBadges),
  registerCardFeature: registerAs(TARGET_KEY.customCardFeatures),
};

export { RegistrationHelper, defineElement };
