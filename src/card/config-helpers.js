/*
 * Parses a card's raw YAML config against its schema (see schema.js) and
 * negotiates the result (defaults, derived values, error state) that the rest
 * of the card reads from.
 */

import { META, HA_CONTEXT, CARD, SEV, MIN_VALUE_ENTITY_PATH, MAX_VALUE_ENTITY_PATH } from '../utils/parameters.js';
import { is, has } from '../utils/common-checks.js';
import { initLogger } from '../utils/log.js';
import { HassProviderSingleton } from '../utils/hass-provider.js';
import { YamlSchemaFactory } from './schema.js';

/**
 * base class for managing and validating all card configuration.
 */
class BaseConfigHelper {
  #hassProvider = HassProviderSingleton.getInstance();

  #HAError = null;

  #lastMsgConsole = null;

  #log = null;

  #actions = {
    card: { tap: null, doubleTap: null, hold: null },
    icon: { tap: null, doubleTap: null, hold: null },
  };

  #actionsReady = false;

  _isDefined = false;

  _configParsed = {};

  _configResolved = {}; // valeurs dérivées de la config, calculées une seule fois par set config()

  _yamlSchema = null;

  constructor() {
    this.#log = initLogger(this, false);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  get config() {
    return this._configResolved;
  }

  set config(config) {
    this.#actionsReady = false;
    this._isDefined = true;
    BaseConfigHelper.#logDeprecatedOption(config);
    this._configParsed = this._yamlSchema.parse(this.constructor._customizeConfig(config));
    this._configResolved = BaseConfigHelper.#resolveConfig(this._configParsed?.config);

    this.#lastMsgConsole = null;
  }

  // Calcule une seule fois, à partir de la config validée, la config brute +
  // les valeurs dérivées consommées ailleurs (évite de recalculer à chaque
  // accès).
  static #resolveConfig(config) {
    return {
      ...config,
      centerZero: BaseConfigHelper.#resolveCenterZero(config?.center_zero),
    };
  }

  /**
   * Normalise `center_zero` (boolean | { value: number }) en une forme
   * exploitable. - false / undefined -> désactivé, zéro = 0 - true -> activé,
   * zéro = 0 - { value: 230 } -> activé, zéro = 230
   */
  static #resolveCenterZero(centerZero) {
    if (!centerZero) return { enabled: false, zeroValue: 0, growthPercent: false };
    if (centerZero === true) return { enabled: true, zeroValue: 0, growthPercent: false };
    return {
      enabled: true,
      zeroValue: is.number(centerZero.value) ? centerZero.value : 0,
      growthPercent: Boolean(centerZero.growth_percent),
    };
  }

  static _customizeConfig(config) {
    return config;
  }

  // No-op here: Template/BadgeTemplate cards' schema never had
  // max_value/disable_unit/additions to begin with. Matches _customizeConfig's
  // own polymorphic no-op above, so the editor's "Migrate config" button can
  // call this generically regardless of which config helper is active.
  static _migrateLegacyOptions(config) {
    return config;
  }

  static #logDeprecatedOption(config) {
    if (config.navigate_to !== undefined)
      console.warn(
        `${META.types.card.typeName.toUpperCase()} - navigate_to option is deprecated and has been removed.`,
      );
    if (config.show_more_info !== undefined)
      console.warn(
        `${META.types.card.typeName.toUpperCase()} - show_more_info option is deprecated and has been removed.`,
      );
    if (['battery', 'cpu', 'memory'].includes(config.theme))
      console.warn(
        `${META.types.card.typeName.toUpperCase()} - theme: ${
          config.theme
        } is deprecated and will be removed in a future release. Please migrate to the recommended alternative...`,
      );
    // max_value used to be number|entity-id-string, disambiguated by sniffing
    // the value's shape at runtime (the same pattern that caused min_value's
    // freeze bug). The entity form is now an explicit map; the bare string form
    // is auto-migrated for this session (see CardConfigHelper._customizeConfig)
    // but should be updated in the YAML.
    if (is.nonEmptyString(config.max_value))
      console.warn(
        `${META.types.card.typeName.toUpperCase()} - max_value: <entity id> is deprecated and will be removed in a future release. ` +
          'Please migrate to max_value: { entity: <entity id>, attribute: <optional> }. Your configuration was automatically migrated for this session.',
      );
    if (config.disable_unit !== undefined)
      console.warn(
        `${META.types.card.typeName.toUpperCase()} - disable_unit is deprecated and will be removed in a future release. ` +
          "Please migrate to hide: ['unit', ...]. Your configuration was automatically migrated for this session.",
      );
    // additions used to be a bare array of {entity, attribute}; it is now the
    // entities list of bar_stack, alongside a mode ('stacked' by default,
    // 'proportional' preserves the legacy renormalized-total behavior exactly -
    // see CardConfigHelper._customizeConfig.
    if (is.array(config.additions))
      console.warn(
        `${META.types.card.typeName.toUpperCase()} - additions is deprecated and will be removed in a future release. ` +
          "Please migrate to bar_stack: { mode: 'proportional', entities: [...] }. Your configuration was automatically migrated for this session.",
      );
  }

  get isValid() {
    return this._isDefined ? this._configParsed.isValid && this.#HAError === null : false;
  }

  get _errorMessage() {
    const errorSrc = this.#HAError ? this.#HAError : this._configParsed;
    return {
      content: `${errorSrc.path}: ${this.#hassProvider.getMessage(errorSrc.errorCode)}`,
      sev: errorSrc.severity,
    };
  }

  get msg() {
    return this._isDefined && (this._configParsed.errorCode || this.#HAError) ? this._errorMessage : null;
  }

  get action() {
    if (!this.#actionsReady) {
      this.#actions = {
        card: {
          tap: this.#getAction('tap_action'),
          doubleTap: this.#getAction('double_tap_action'),
          hold: this.#getAction('hold_action'),
        },
        icon: {
          tap: this.#getAction('icon_tap_action'),
          doubleTap: this.#getAction('icon_double_tap_action'),
          hold: this.#getAction('icon_hold_action'),
        },
      };
      this.#actionsReady = true;
    }
    return this.#actions;
  }

  #getAction(action) {
    return this.isValid ? this.config?.[action]?.action : null;
  }

  checkConfig() {
    this._showConfigErrorConsole(); // structure, type...
    this._checkHAEnvironment(); // ha env: entity, attribute ...
  }

  _showConfigErrorConsole() {
    if (is.nonEmptyArray(this._configParsed.errors)) {
      const curError = this._configParsed.errors[0];
      const msgConsole = `${curError.path.join('.')} : ${this._hassProvider.getMessage(curError.errorCode)}`;
      if (this.#lastMsgConsole !== msgConsole) {
        this.#lastMsgConsole = msgConsole;
        this.#log[curError.severity]?.(msgConsole);
        this.#log[curError.severity]?.('config: ', this.config);
      }
    }
  }

  _checkHAEnvironment() {
    const ENTITY_NOT_FOUND = 'entityNotFound';
    const ATTRIBUTE_NOT_FOUND = 'attributeNotFound';
    const resolve = (key) => (is.nonEmptyString(key) ? this._hassProvider.getEntityStateObj(key) : null);

    const entityState = resolve(this.config.entity);
    const maxValueEntity = is.plainObject(this.config.max_value) ? this.config.max_value.entity : null;
    const maxValueAttr = is.plainObject(this.config.max_value) ? this.config.max_value.attribute : null;
    const maxValueState = resolve(maxValueEntity);
    const minValueEntity = is.plainObject(this.config.min_value) ? this.config.min_value.entity : null;
    const minValueAttr = is.plainObject(this.config.min_value) ? this.config.min_value.attribute : null;
    const minValueState = resolve(minValueEntity);
    const lowWMState = resolve(this.config?.watermark?.low);
    const highWMState = resolve(this.config?.watermark?.high);

    const checks = [
      {
        condition:
          is.string(this.config.attribute) && entityState && !has.own(entityState.attributes, this.config.attribute),
        path: 'attribute',
        errorCode: ATTRIBUTE_NOT_FOUND,
      },
      {
        condition: is.nonEmptyString(maxValueEntity) && !maxValueState,
        path: MAX_VALUE_ENTITY_PATH,
        errorCode: ENTITY_NOT_FOUND,
      },
      {
        condition: is.nonEmptyString(maxValueAttr) && maxValueState && !has.own(maxValueState.attributes, maxValueAttr),
        path: 'max_value.attribute',
        errorCode: ATTRIBUTE_NOT_FOUND,
      },
      {
        condition: is.nonEmptyString(minValueEntity) && !minValueState,
        path: MIN_VALUE_ENTITY_PATH,
        errorCode: ENTITY_NOT_FOUND,
      },
      {
        condition: is.nonEmptyString(minValueAttr) && minValueState && !has.own(minValueState.attributes, minValueAttr),
        path: 'min_value.attribute',
        errorCode: ATTRIBUTE_NOT_FOUND,
      },
      {
        condition: is.nonEmptyString(this.config.watermark?.low) && !lowWMState,
        path: 'watermark.low',
        errorCode: ENTITY_NOT_FOUND,
      },
      {
        condition:
          is.nonEmptyString(this.config.watermark?.low_attribute) &&
          lowWMState &&
          !has.own(lowWMState.attributes, this.config.watermark.low_attribute),
        path: 'watermark.low_attribute',
        errorCode: ATTRIBUTE_NOT_FOUND,
      },
      {
        condition: is.nonEmptyString(this.config.watermark?.high) && !highWMState,
        path: 'watermark.high',
        errorCode: ENTITY_NOT_FOUND,
      },
      {
        condition:
          is.nonEmptyString(this.config.watermark?.high_attribute) &&
          highWMState &&
          !has.own(highWMState.attributes, this.config.watermark.high_attribute),
        path: 'watermark.high_attribute',
        errorCode: ATTRIBUTE_NOT_FOUND,
      },
    ];

    const failed = checks.find((c) => c.condition);
    this.#HAError = failed ? { path: failed.path, errorCode: failed.errorCode, severity: SEV.error } : null;
  }

  get _hassProvider() {
    return this.#hassProvider;
  }
}

/**
 * Config helper for the standard card/badge/feature types: negotiates the
 * YAML config against `YamlSchemaFactory.card`, migrates legacy option shapes
 * (bare `max_value` entity string, `disable_unit`, `additions`), and fills
 * computed defaults (center_zero's symmetric `min_value`, entity attribute
 * mapping).
 *
 * @extends BaseConfigHelper
 */
class CardConfigHelper extends BaseConfigHelper {
  _yamlSchema = YamlSchemaFactory.card;

  // center_zero with no explicit min_value would otherwise default to 0
  // (CARD.config.value.min), making the negative half meaningless (zeroValue -
  // min = 0, nothing to render on that side). Default it to the symmetric
  // negative of max_value instead - but only when max_value is a plain number
  // (or absent, i.e. the 100 default); an entity/jinja-based max can't be
  // mirrored at this config-negotiation stage. An explicit min_value (even 0)
  // is always left untouched.
  static _applyCenterZeroMinDefault(config, normalized) {
    if (!config?.center_zero || !is.nullish(config?.min_value)) return normalized;
    const maxForSymmetry = is.number(normalized?.max_value) ? normalized.max_value : CARD.config.value.max;
    return { ...normalized, min_value: -maxForSymmetry };
  }

  // Legacy-syntax rewriting only — never touches unrelated defaults
  // (center_zero's min_value fill-in, device_class attribute defaults live in
  // _customizeConfig instead). Extracted so the editor's "Migrate config"
  // button can reuse exactly this transformation (via the config helper,
  // polymorphically) without also re-applying those unrelated defaults. CF5 -
  // issue (major) resolved - max_value used to be number|entity-id-string with
  // the mode sniffed at runtime (is.number/is.string), the exact pattern that
  // caused min_value's freeze bug. Bare-entity-string configs (pre-1.6) are
  // migrated here into the explicit { entity, attribute } map before
  // validation, so every downstream consumer only ever sees a number or that
  // map — no sniffing left anywhere. The deprecation warning for the bare form
  // is logged separately, see BaseConfigHelper.#logDeprecatedOption.
  static _migrateLegacyOptions(config) {
    let normalized = config;
    if (is.nonEmptyString(config?.max_value)) {
      normalized = {
        ...config,
        max_value: { entity: config.max_value, attribute: config.max_value_attribute },
        max_value_attribute: undefined,
      };
    }
    // disable_unit used to be a dedicated boolean; 'unit' is now just another
    // hide target, consistent with icon/name/value/progress_bar. Skip the fold
    // when hide is a Jinja template (a string): merging into user-authored
    // template logic isn't possible, so disable_unit is left untouched and the
    // runtime keeps honoring it as a fallback (see ViewBase's
    // #percentHelper.configure call, hasDisabledUnit).
    if (config?.disable_unit === true && !is.jinja(config?.hide)) {
      const currentHide = is.array(config.hide) ? config.hide : [];
      normalized = {
        ...normalized,
        hide: currentHide.includes('unit') ? currentHide : [...currentHide, 'unit'],
        disable_unit: undefined,
      };
    }
    // additions (bare array) -> bar_stack.entities, under the 'proportional'
    // mode so the renormalized-total rendering behaves exactly as before (see
    // #logDeprecatedOption).
    if (is.array(config?.additions)) {
      normalized = {
        ...normalized,
        bar_stack: { mode: 'proportional', entities: config.additions },
        additions: undefined,
      };
    }
    return normalized;
  }

  static _customizeConfig(config) {
    let normalized = CardConfigHelper._migrateLegacyOptions(config);
    normalized = CardConfigHelper._applyCenterZeroMinDefault(config, normalized);
    return {
      ...normalized,
      ...(is.nonEmptyString(normalized?.entity) && is.nullish(normalized?.attribute)
        ? {
            attribute:
              HA_CONTEXT.attributeMapping[HassProviderSingleton.getEntityDomain(normalized?.entity)]?.attribute,
          }
        : {}),
      ...(is.nonEmptyString(normalized?.max_value?.entity) && is.nullish(normalized?.max_value?.attribute)
        ? {
            max_value: {
              ...normalized.max_value,
              attribute:
                HA_CONTEXT.attributeMapping[HassProviderSingleton.getEntityDomain(normalized.max_value.entity)]
                  ?.attribute,
            },
          }
        : {}),
    };
  }

  get stateContent() {
    return this.config?.state_content ?? [];
  }
}

/**
 * CardConfigHelper variant for the Badge type — same negotiation logic,
 * `YamlSchemaFactory.badge` schema.
 *
 * @extends CardConfigHelper
 */
class BadgeConfigHelper extends CardConfigHelper {
  _yamlSchema = YamlSchemaFactory.badge;
}

/**
 * CardConfigHelper variant for the Tile Feature type —
 * `YamlSchemaFactory.feature` schema.
 *
 * @extends CardConfigHelper
 */
class FeatureConfigHelper extends CardConfigHelper {
  _yamlSchema = YamlSchemaFactory.feature;
}

/**
 * Config helper for the Jinja-driven Template card —
 * `YamlSchemaFactory.template` schema.
 *
 * @extends BaseConfigHelper
 */
class TemplateConfigHelper extends BaseConfigHelper {
  _yamlSchema = YamlSchemaFactory.template;
}

/**
 * Config helper for the Jinja-driven Template badge —
 * `YamlSchemaFactory.badgeTemplate` schema.
 *
 * @extends BaseConfigHelper
 */
class BadgeTemplateConfigHelper extends BaseConfigHelper {
  _yamlSchema = YamlSchemaFactory.badgeTemplate;
}

export { BaseConfigHelper };
export { CardConfigHelper };
export { BadgeConfigHelper };
export { FeatureConfigHelper };
export { TemplateConfigHelper };
export { BadgeTemplateConfigHelper };
