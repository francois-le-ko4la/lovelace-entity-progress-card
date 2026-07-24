/*
 * Registers the card/badge/template/feature custom elements (and their editors)
 * with Home Assistant via customCards/customBadges/customCardFeatures.
 */

import { VERSION, META, CARD_CONTEXT, SEV } from './parameters.js';
import { Logger } from './log.js';

interface Component {
  typeName: string;
  name: string;
  description?: string;
  editor?: string;
}

// ?debug=registration traces the custom-element registration lifecycle
// (every define, every customCards/customBadges/customCardFeatures push, with
// timing) - the one area with no per-instance logger to hang off of, and the
// most relevant to diagnosing load-order/registration issues (see issue #108).
const registrationLog = Logger.create('EPB-registration', CARD_CONTEXT.debug.registration ? SEV.debug : SEV.info);

// Shared by RegistrationHelper below and by the standalone editor
// sub-components (chips.ts/list-editors.ts) that self-register at module
// top-level: an uncaught throw here happens during module evaluation, not
// inside any card's lifecycle, so it isn't scoped to a single instance - in a
// bundled build, everything after it in evaluation order (including,
// depending on where it sits in the bundle, unrelated code from other
// modules) never runs. The !customElements.get(...) guard already covers the
// expected "already registered" case; this catches anything else so a
// surprise there can't take out code that has nothing to do with it.
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
 * Registers a card/badge/feature custom element (and its editor, if any)
 * with `customElements` and with Home Assistant's discovery arrays
 * (`window.customCards`/`customBadges`/`customCardFeatures`). In dev mode
 * (`CARD_CONTEXT.dev`), every type/editor tag and displayed name gets a
 * `-dev`/` (dev)` suffix so a dev build can be installed side by side with
 * the shipped one without colliding.
 */
// Module-private (was a static-only class; kept the same encapsulation as the
// former `#`-private static members, now via module scope).
const DEV_MODE = CARD_CONTEXT.dev;
const TARGET_KEY = {
  customCards: 'customCards',
  customBadges: 'customBadges',
  customCardFeatures: 'customCardFeatures',
} as const;

const resolveComponent = (component: Component): Component => {
  if (!DEV_MODE) return component;
  return {
    ...component,
    typeName: `${component.typeName}-dev`,
    name: `${component.name} (dev)`,
    editor: component.editor ? `${component.editor}-dev` : undefined,
  };
};

const resolveEntry = (component: Component, targetKey: string) =>
  targetKey === TARGET_KEY.customCardFeatures
    ? { type: component.typeName, name: component.name, supported: () => true }
    : {
        type: component.typeName,
        name: component.name,
        preview: true,
        description: component.description,
        documentationURL: META.documentation,
        version: VERSION,
      };

const registerComponent = (
  component: Component,
  targetKey: string,
  elementClass: CustomElementConstructor,
  editorClass?: CustomElementConstructor,
) => {
  // noRegistration: skip both the define(s) and the deferred customCards push
  // in one shot, so the type is entirely absent from the browser and from
  // HA's discovery arrays (see CARD_CONTEXT.noRegistration, issue #108).
  if (CARD_CONTEXT.noRegistration) {
    registrationLog.debug(`registration skipped (noRegistration): ${component.typeName}`);
    return;
  }

  defineElement(component.typeName, elementClass);
  if (editorClass && component.editor) defineElement(component.editor, editorClass);

  // Le reste du code est protégé
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

const RegistrationHelper = {
  registerCard(card: Component, elementClass: CustomElementConstructor, editorClass?: CustomElementConstructor) {
    registerComponent(resolveComponent(card), TARGET_KEY.customCards, elementClass, editorClass);
  },

  registerBadge(badge: Component, elementClass: CustomElementConstructor, editorClass?: CustomElementConstructor) {
    registerComponent(resolveComponent(badge), TARGET_KEY.customBadges, elementClass, editorClass);
  },

  registerCardFeature(cardFeature: Component, elementClass: CustomElementConstructor) {
    registerComponent(resolveComponent(cardFeature), TARGET_KEY.customCardFeatures, elementClass);
  },
};

export { RegistrationHelper, defineElement };
