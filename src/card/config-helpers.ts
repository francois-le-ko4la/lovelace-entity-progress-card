/*
 * Parses a card's raw YAML config against its schema (see schema.js) and
 * negotiates the result (defaults, derived values, error state) that the rest
 * of the card reads from.
 */

import {
  META,
  HA_CONTEXT,
  CARD,
  SEV,
  MIN_VALUE_ENTITY_PATH,
  MAX_VALUE_ENTITY_PATH,
  WATERMARK_LOW_ENTITY_PATH,
  WATERMARK_HIGH_ENTITY_PATH,
  ALERT_ABOVE_ENTITY_PATH,
  ALERT_BELOW_ENTITY_PATH,
} from '../utils/parameters.js';
import { is, has, assertDefined } from '../utils/common-checks.js';
import { initLogger, type LoggerInstance } from '../utils/log.js';
import { HassProviderSingleton } from '../utils/hass-provider.js';
import { YamlSchemaFactory } from './schema.js';
import type { RawConfig, Config } from '../utils/types.js';

// Every YamlSchemaFactory getter (card/badge/feature/template/badgeTemplate)
// returns the same struct(...) shape - .card's is as good a reference as any.
type Schema = typeof YamlSchemaFactory.card;
// Each holds an action *type* string ('navigate', 'toggle', 'none'...) - see
// #getAction, which reads only the `.action` sub-property of a validated
// tap_action/hold_action/double_tap_action config value, not the whole object.
type ActionBag = { tap: string | null; doubleTap: string | null; hold: string | null };
type HAError = { path: string; errorCode: string | null; severity: string } | null;
// The shape schema.ts's struct(...).parse() actually returns (see schema.ts)
// - written out explicitly rather than via ReturnType<Schema['parse']>: an
// empty `errors: []` in one of parse()'s own return branches infers as
// `never[]` with nothing else in schema.ts yet forcing it wider.
type ParsedConfig = {
  isValid: boolean;
  config: any;
  path: (string | number)[] | null;
  errorCode: string | null;
  severity: string | null;
  errors: { path: (string | number)[]; errorCode: string | null; severity: string }[];
};

/**
 * base class for managing and validating all card configuration.
 */
class BaseConfigHelper {
  #hassProvider = HassProviderSingleton.getInstance();
  #HAError: HAError = null;
  #lastMsgConsole: string | null = null;
  #log: LoggerInstance | null = null;
  #actions: { card: ActionBag; icon: ActionBag } = {
    card: { tap: null, doubleTap: null, hold: null },
    icon: { tap: null, doubleTap: null, hold: null },
  };
  #actionsReady = false;
  _isDefined = false;
  _configParsed: ParsedConfig = {
    isValid: false,
    config: null,
    path: null,
    errorCode: null,
    severity: null,
    errors: [],
  };
  _configResolved: Config = {} as Config; // valeurs dérivées de la config, calculées une seule fois par set config()
  // The real shape comes from YamlSchemaFactory (see schema.ts) - subclasses
  // assign a concrete schema here (see CardConfigHelper etc. below).
  _yamlSchema: Schema | null = null;

  constructor() {
    this.#log = initLogger(this, false);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  get config(): Config {
    return this._configResolved;
  }

  set config(config: RawConfig) {
    this.#actionsReady = false;
    this._isDefined = true;
    BaseConfigHelper.#logDeprecatedOption(config);
    const yamlSchema = assertDefined(
      this._yamlSchema,
      `${this.constructor.name}: set config called with no _yamlSchema (only concrete subclasses define one)`,
    );
    this._configParsed = yamlSchema.parse((this.constructor as typeof BaseConfigHelper)._customizeConfig(config));
    this._configResolved = BaseConfigHelper.#resolveConfig(this._configParsed?.config);

    this.#lastMsgConsole = null;
  }

  // Calcule une seule fois, à partir de la config validée, la config brute +
  // les valeurs dérivées consommées ailleurs (évite de recalculer à chaque
  // accès).
  static #resolveConfig(config: any): Config {
    return {
      ...config,
      centerZero: BaseConfigHelper.#resolveCenterZero(config?.center_zero),
    } as Config;
  }

  /**
   * Normalise `center_zero` (boolean | { value: number }) en une forme
   * exploitable. - false / undefined -> désactivé, zéro = 0 - true -> activé,
   * zéro = 0 - { value: 230 } -> activé, zéro = 230
   */
  static #resolveCenterZero(centerZero: boolean | { value?: number; growth_percent?: boolean } | null | undefined): {
    enabled: boolean;
    zeroValue: number;
    growthPercent: boolean;
  } {
    if (!centerZero) return { enabled: false, zeroValue: 0, growthPercent: false };
    if (centerZero === true) return { enabled: true, zeroValue: 0, growthPercent: false };
    return {
      enabled: true,
      zeroValue: is.number(centerZero.value) ? centerZero.value : 0,
      growthPercent: Boolean(centerZero.growth_percent),
    };
  }

  static _customizeConfig(config: RawConfig): RawConfig {
    return config;
  }

  // No-op here: Template/BadgeTemplate cards' schema never had
  // max_value/disable_unit/additions to begin with. Matches _customizeConfig's
  // own polymorphic no-op above, so the editor's "Migrate config" button can
  // call this generically regardless of which config helper is active.
  static _migrateLegacyOptions(config: RawConfig): RawConfig {
    return config;
  }

  static #logDeprecatedOption(config: RawConfig) {
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
    // watermark.low/high used to accept the same bare entity-id-string form
    // as pre-1.6 max_value, with attribute as a separate
    // watermark.low_attribute/high_attribute sibling key - same
    // disambiguation trap, same fix: an explicit map, folded in for this
    // session (see
    // CardConfigHelper._migrateLegacyOptions).
    if (is.nonEmptyString(config.watermark?.low))
      console.warn(
        `${META.types.card.typeName.toUpperCase()} - watermark.low: <entity id> is deprecated and will be removed in a future release. ` +
          'Please migrate to watermark.low: { entity: <entity id>, attribute: <optional> }. Your configuration was automatically migrated for this session.',
      );
    if (is.nonEmptyString(config.watermark?.high))
      console.warn(
        `${META.types.card.typeName.toUpperCase()} - watermark.high: <entity id> is deprecated and will be removed in a future release. ` +
          'Please migrate to watermark.high: { entity: <entity id>, attribute: <optional> }. Your configuration was automatically migrated for this session.',
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

  get isValid(): boolean {
    return this._isDefined ? this._configParsed.isValid && this.#HAError === null : false;
  }

  get _errorMessage(): { content: string; sev: string } {
    const errorSrc = this.#HAError ? this.#HAError : this._configParsed;
    return {
      content: `${errorSrc.path}: ${this.#hassProvider.getMessage(errorSrc.errorCode)}`,
      sev: errorSrc.severity ?? SEV.error,
    };
  }

  get msg(): { content: string; sev: string } | null {
    return this._isDefined && (this._configParsed.errorCode || this.#HAError) ? this._errorMessage : null;
  }

  get action(): { card: ActionBag; icon: ActionBag } {
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

  #getAction(action: string): string | null {
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
        const logMethod = this.#log?.[curError.severity as 'error' | 'warning' | 'info' | 'debug'];
        logMethod?.(msgConsole);
        logMethod?.('config: ', this.config);
      }
    }
  }

  _checkHAEnvironment() {
    const ENTITY_NOT_FOUND = 'entityNotFound';
    const ATTRIBUTE_NOT_FOUND = 'attributeNotFound';
    const resolve = (key: unknown) => (is.nonEmptyString(key) ? this._hassProvider.getEntityStateObj(key) : null);

    const entityState = resolve(this.config.entity);
    // max_value/min_value/watermark.low/watermark.high/alert_when.above/
    // alert_when.below are all negotiated to the same shape (number |
    // { entity, attribute } | { jinja }) - the same two checks (entity
    // exists, attribute exists on it) apply identically to all six, just
    // against a different config value and error path.
    const checkValueConfig = (valueCfg: unknown, entityPath: string, attributePath: string) => {
      const entityId = is.plainObject(valueCfg) ? valueCfg.entity : null;
      const attribute = is.plainObject(valueCfg) ? valueCfg.attribute : null;
      const state = resolve(entityId);
      return [
        { condition: is.nonEmptyString(entityId) && !state, path: entityPath, errorCode: ENTITY_NOT_FOUND },
        {
          condition: is.nonEmptyString(attribute) && state && !has.own(state.attributes, attribute),
          path: attributePath,
          errorCode: ATTRIBUTE_NOT_FOUND,
        },
      ];
    };

    const checks = [
      {
        condition:
          is.string(this.config.attribute) && entityState && !has.own(entityState.attributes, this.config.attribute),
        path: 'attribute',
        errorCode: ATTRIBUTE_NOT_FOUND,
      },
      ...checkValueConfig(this.config.max_value, MAX_VALUE_ENTITY_PATH, 'max_value.attribute'),
      ...checkValueConfig(this.config.min_value, MIN_VALUE_ENTITY_PATH, 'min_value.attribute'),
      ...checkValueConfig(this.config.watermark?.low, WATERMARK_LOW_ENTITY_PATH, 'watermark.low.attribute'),
      ...checkValueConfig(this.config.watermark?.high, WATERMARK_HIGH_ENTITY_PATH, 'watermark.high.attribute'),
      ...checkValueConfig(this.config.alert_when?.above, ALERT_ABOVE_ENTITY_PATH, 'alert_when.above.attribute'),
      ...checkValueConfig(this.config.alert_when?.below, ALERT_BELOW_ENTITY_PATH, 'alert_when.below.attribute'),
    ];

    const failed = checks.find((c) => c.condition);
    this.#HAError = failed ? { path: failed.path, errorCode: failed.errorCode, severity: SEV.error } : null;
  }

  get _hassProvider(): HassProviderSingleton {
    return this.#hassProvider;
  }

  // Only CardConfigHelper (and its Badge/Feature subclasses) override this -
  // Template/BadgeTemplate schemas have no state_content key at all, so this
  // stays the property-not-defined default (undefined), same as before typing.
  // eslint-disable-next-line class-methods-use-this
  get stateContent(): string[] | undefined {
    return undefined;
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
  static _applyCenterZeroMinDefault(config: RawConfig, normalized: RawConfig): RawConfig {
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
  static _migrateLegacyOptions(config: RawConfig): RawConfig {
    let normalized = config;
    if (is.nonEmptyString(config?.max_value)) {
      normalized = {
        ...config,
        max_value: { entity: config.max_value, attribute: config.max_value_attribute },
        max_value_attribute: undefined,
      };
    }
    // watermark.low/high: same pre-1.6 trap as max_value above, just with the
    // attribute carried on a watermark.low_attribute/high_attribute sibling
    // key instead of a top-level one. Folded independently per side, so a
    // config mixing a legacy low with an already-explicit high migrates
    // correctly.
    if (is.nonEmptyString(config?.watermark?.low) || is.nonEmptyString(config?.watermark?.high)) {
      const migrateSide = (side: 'low' | 'high') => {
        if (!is.nonEmptyString(config.watermark?.[side])) return {};
        return { [side]: { entity: config.watermark[side], attribute: config.watermark[`${side}_attribute`] } };
      };
      normalized = {
        ...normalized,
        watermark: {
          ...normalized.watermark,
          ...migrateSide('low'),
          ...migrateSide('high'),
          low_attribute: undefined,
          high_attribute: undefined,
        },
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

  static _customizeConfig(config: RawConfig): RawConfig {
    let normalized = CardConfigHelper._migrateLegacyOptions(config);
    normalized = CardConfigHelper._applyCenterZeroMinDefault(config, normalized);
    const attrMapping: Record<string, { attribute?: string }> = HA_CONTEXT.attributeMapping;
    return {
      ...normalized,
      ...(is.nonEmptyString(normalized?.entity) && is.nullish(normalized?.attribute)
        ? {
            attribute: attrMapping[HassProviderSingleton.getEntityDomain(normalized?.entity) as string]?.attribute,
          }
        : {}),
      ...(is.nonEmptyString(normalized?.max_value?.entity) && is.nullish(normalized?.max_value?.attribute)
        ? {
            max_value: {
              ...normalized.max_value,
              attribute:
                attrMapping[HassProviderSingleton.getEntityDomain(normalized.max_value.entity) as string]?.attribute,
            },
          }
        : {}),
    };
  }

  get stateContent(): string[] {
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
