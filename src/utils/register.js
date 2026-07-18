/*
 * Registers the card/badge/template/feature custom elements (and their editors)
 * with Home Assistant via customCards/customBadges/customCardFeatures.
 */

import { VERSION, META, CARD_CONTEXT } from './parameters.js';

/******************************************************************************
 * 🛠️ RegistrationHelper
 * ============================================================================
 *
 * ✅ Registers a card/badge/feature custom element (and its editor, if any)
 * with `customElements` and with Home Assistant's discovery arrays
 * (`window.customCards`/`customBadges`/`customCardFeatures`). In dev mode
 * (`CARD_CONTEXT.dev`), every type/editor tag and displayed name gets a
 * `-dev`/` (dev)` suffix so a dev build can be installed side by side with
 * the shipped one without colliding.
 *
 * @class
 */
class RegistrationHelper {
  static _devMode = CARD_CONTEXT.dev;
  static #targetKey = {
    customCards: 'customCards',
    customBadges: 'customBadges',
    customCardFeatures: 'customCardFeatures',
  };

  static #resolveComponent(component) {
    if (!RegistrationHelper._devMode) return component;
    return {
      ...component,
      typeName: `${component.typeName}-dev`,
      name: `${component.name} (dev)`,
      editor: component.editor ? `${component.editor}-dev` : undefined,
    };
  }
  static #resolveEntry(component, targetKey) {
    return targetKey === RegistrationHelper.#targetKey.customCardFeatures
      ? { type: component.typeName, name: component.name, supported: () => true }
      : {
          type: component.typeName,
          name: component.name,
          preview: true,
          description: component.description,
          documentationURL: META.documentation,
          version: VERSION,
        };
  }
  static #registerComponent(component, targetKey, elementClass, editorClass) {
    try {
      // On tente l'enregistrement technique
      if (!customElements.get(component.typeName)) customElements.define(component.typeName, elementClass);
      if (editorClass && component.editor && !customElements.get(component.editor))
        customElements.define(component.editor, editorClass);
    } catch (error) {
      // Si ça échoue (déjà défini), on log mais on ne bloque pas la suite
      console.warn(`[Entity Progress Card] Registration alert: ${error.message}`);
    }

    // Le reste du code est protégé
    const registerUI = () => {
      try {
        window[targetKey] = window[targetKey] || [];
        if (window[targetKey].some((item) => item.type === component.typeName)) return;
        window[targetKey].push(RegistrationHelper.#resolveEntry(component, targetKey));
      } catch (uiError) {
        console.error('[Entity Progress Card] UI Registration failed', uiError);
      }
    };

    setTimeout(registerUI, 1000);
  }

  static registerCard(card, elementClass, editorClass) {
    RegistrationHelper.#registerComponent(
      RegistrationHelper.#resolveComponent(card),
      RegistrationHelper.#targetKey.customCards,
      elementClass,
      editorClass,
    );
  }

  static registerBadge(badge, elementClass, editorClass) {
    RegistrationHelper.#registerComponent(
      RegistrationHelper.#resolveComponent(badge),
      RegistrationHelper.#targetKey.customBadges,
      elementClass,
      editorClass,
    );
  }

  static registerCardFeature(cardFeature, elementClass) {
    RegistrationHelper.#registerComponent(
      RegistrationHelper.#resolveComponent(cardFeature),
      RegistrationHelper.#targetKey.customCardFeatures,
      elementClass,
    );
  }
}


export { RegistrationHelper };
