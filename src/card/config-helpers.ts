/*
 * Parses a card's raw YAML config against its schema (see schema.js) and
 * negotiates the result (defaults, derived values, error state) that the rest
 * of the card reads from.
 */

import {
  HA_CONTEXT,
  CARD,
  THEME,
  SEV,
  MIN_VALUE_ENTITY_PATH,
  MAX_VALUE_ENTITY_PATH,
  WATERMARK_ENTITY_PATHS,
  ALERT_ABOVE_ENTITY_PATH,
  ALERT_BELOW_ENTITY_PATH,
} from '../utils/parameters.js';
import { is, has, assertDefined } from '../utils/common-checks.js';
import { initLogger, cardNotice, type LoggerInstance } from '../utils/log.js';
import { HassProviderSingleton } from '../utils/hass-provider.js';
import {
  YamlSchemaFactory,
  markValue,
  isMarkOverride,
  SCHEMA_DEFAULTS,
  THEME_ALIASES,
  entityOf,
  attributeOf,
  type ValueConfig,
  ROW_IDENTITY_FIELDS,
} from './schema.js';
import { EntityHelper } from './entity-helper.js';
import { resolveDisplayUnit, resolveDisplayDecimal } from '../utils/display-defaults.js';
import type { LovelaceConfig, Config } from '../utils/types.js';

// Each YamlSchemaFactory getter (card/badge/feature/template/badgeTemplate)
// now returns its own precisely-typed struct(...) (see schema.ts's Infer<>)
// - a union of all five, not just .card's, since each concrete subclass
// below assigns a different one to its own _yamlSchema.
type Schema =
  | typeof YamlSchemaFactory.card
  | typeof YamlSchemaFactory.badge
  | typeof YamlSchemaFactory.template
  | typeof YamlSchemaFactory.badgeTemplate
  | typeof YamlSchemaFactory.feature;
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
  config: Record<string, unknown> | null;
  path: (string | number)[] | null;
  errorCode: string | null;
  severity: string | null;
  errors: { path: (string | number)[]; errorCode: string | null; severity: string }[];
};

const WATERMARK_SIDES = ['low', 'high'] as const;

// The pre-1.6 bare-entity-string trap, and the low_as/low_color/disable_low
// siblings now folded into watermark.low/.high's own shape.
const hasLegacyWatermarkValue = (config: LovelaceConfig, side: 'low' | 'high'): boolean =>
  is.nonEmptyString(config?.watermark?.[side]);
const hasLegacyWatermarkMarkKeys = (config: LovelaceConfig, side: 'low' | 'high'): boolean =>
  config?.watermark?.[`${side}_as`] !== undefined ||
  config?.watermark?.[`${side}_color`] !== undefined ||
  config?.watermark?.[`disable_${side}`] !== undefined;

// What a Multi row looked like before it was a card: a bar, and nothing the
// aggregator's own children were able to draw.
const LEGACY_BARE_ROW = ['icon', 'name'];

// Single source for "this config still uses a deprecated shape" - read by the
// console warnings and migrations below, and by the editor's Migrate button.
const DEPRECATED_OPTIONS: Record<string, (config: LovelaceConfig) => boolean> = {
  watermark: (config) =>
    WATERMARK_SIDES.some((side) => hasLegacyWatermarkValue(config, side) || hasLegacyWatermarkMarkKeys(config, side)),
  max_value: (config) => is.nonEmptyString(config?.max_value),
  disable_unit: (config) => config?.disable_unit !== undefined,
  additions: (config) => is.array(config?.additions),
  icon_animation: (config) => config?.icon_animation === 'none',
  navigate_to: (config) => config?.navigate_to !== undefined,
  show_more_info: (config) => config?.show_more_info !== undefined,
  theme: (config) => Boolean(THEME_ALIASES[config?.theme]),
  // Multi only, top level or per row - harmless for every other type, which
  // has no such key to carry.
  // Multi only. Superseded by the card's own reverse_secondary_info_row now
  // that a row is a card - one spelling, so the two can't disagree.
  value_position: (config) =>
    config?.value_position !== undefined ||
    (is.array(config?.entities) &&
      config.entities.some((row: unknown) => is.plainObject(row) && row.value_position !== undefined)),
  show_value: (config) =>
    config?.show_value !== undefined ||
    (is.array(config?.entities) &&
      config.entities.some((row: unknown) => is.plainObject(row) && row.show_value !== undefined)),
};

// Also drives the editor's "Migrate config" button - see
// docs/troubleshooting.md#deprecated-options.
const hasDeprecatedOptions = (config: LovelaceConfig): boolean =>
  Object.values(DEPRECATED_OPTIONS).some((isPresent) => isPresent(config));

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
  _configResolved: Config = {} as Config; // derived from config, computed once per set config()
  // The real shape comes from YamlSchemaFactory (see schema.ts) - subclasses
  // assign a concrete schema here (see CardConfigHelper etc. below).
  _yamlSchema: Schema | null = null;
  // Reused across #resolveDisplayDefaults calls (one per hass update in the
  // editor) instead of a fresh one each time.
  #entity: EntityHelper | null = null;

  constructor() {
    this.#log = initLogger(this, false);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  get config(): Config {
    return this._configResolved;
  }

  set config(config: LovelaceConfig) {
    this.#actionsReady = false;
    this._isDefined = true;
    BaseConfigHelper.#logDeprecatedOption(config);
    const yamlSchema = assertDefined(
      this._yamlSchema,
      `${this.constructor.name}: set config called with no _yamlSchema (only concrete subclasses define one)`,
    );
    this._configParsed = yamlSchema.parse((this.constructor as typeof BaseConfigHelper)._customizeConfig(config));
    this._configResolved = BaseConfigHelper.#resolveConfig(this._configParsed?.config);
    this.#resolveDisplayDefaults();

    this.#lastMsgConsole = null;
  }

  // resolvedUnit/resolvedDecimal: the effective unit/decimal a card shows
  // when unset (entity-derived, see display-defaults.ts). Added to the
  // negotiated config so the editor can offer them as a greyed placeholder
  // without writing a YAML key. Needs live entity data (instance, not static
  // #resolveConfig); the card recomputes these live at render and ignores
  // these copies.
  // Re-run the entity-derived resolution against the current hass without
  // re-parsing the schema - the editor calls this on `set hass` since
  // negotiation runs hass-independently, or the defaults would stay stale.
  refreshDisplayDefaults() {
    this.#resolveDisplayDefaults();
  }

  #resolveDisplayDefaults() {
    const config = this._configResolved;
    if (!is.nonEmptyString(config.entity)) return;

    this.#entity ??= new EntityHelper();
    const entity = this.#entity;
    entity.entityId = config.entity;
    entity.attribute = is.nonEmptyString(config.attribute) ? config.attribute : null;

    const maxIsEntity = is.plainObject(config.max_value) && is.nonEmptyString(config.max_value.entity);
    const resolvedUnit = resolveDisplayUnit(config.unit, maxIsEntity, entity.unit);
    config.resolvedUnit = resolvedUnit;
    config.resolvedDecimal = resolveDisplayDecimal(config.decimal, {
      configUnit: config.unit,
      resolvedUnit,
      entityPrecision: entity.precision,
      entityType: entity.entityType,
      entityUnit: entity.unit,
    });
  }

  // Computed once from the validated config - raw config + derived values
  // consumed elsewhere - avoids recomputing on every access.
  static #resolveConfig(config: Record<string, unknown> | null | undefined): Config {
    return {
      ...config,
      centerZero: BaseConfigHelper.#resolveCenterZero(
        config?.center_zero as boolean | { value?: number; growth_percent?: boolean } | null | undefined,
      ),
    } as unknown as Config;
  }

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

  // CardConfigHelper overrides this with its own extra migrations, but still
  // routes through _migrateLegacyOptions - Template/BadgeTemplate don't
  // override either, so this is the only call site keeping them migrated.
  static _customizeConfig(config: LovelaceConfig): LovelaceConfig {
    return (this as typeof BaseConfigHelper)._migrateLegacyOptions(config);
  }

  // Only watermark migrates here - Template/BadgeTemplate's schema has no
  // max_value/disable_unit/additions, but does share watermark.low/.high
  // with Card (see #140). CardConfigHelper's override calls this too, then
  // layers its own extra migrations on top.
  static _migrateLegacyOptions(config: LovelaceConfig): LovelaceConfig {
    return BaseConfigHelper._migrateIconAnimationNone(BaseConfigHelper._migrateWatermarkOptions(config));
  }

  // icon_animation: none was the literal default until 1.6.1; nothing produces
  // or reads it now, so it is dropped rather than kept as a dead enum member.
  static _migrateIconAnimationNone(config: LovelaceConfig): LovelaceConfig {
    if (config?.icon_animation !== 'none') return config;
    return { ...config, icon_animation: undefined };
  }

  // A Multi used to draw bare bars: no icon, no name, and a value only where
  // show_value asked for one - it could not have printed the rest. A row is a
  // whole card now, so keeping that look is a hide list rather than the
  // absence of one, and the option collapses into the card's own vocabulary.
  // Applied at both levels, since it was settable on either.
  static _migrateValuePosition(config: LovelaceConfig): LovelaceConfig {
    if (!DEPRECATED_OPTIONS.value_position(config)) return config;
    const swap = (level: Record<string, unknown>) => {
      const { value_position: position, ...rest } = level;
      if (position === undefined) return rest;
      return { ...rest, reverse_secondary_info_row: position === 'right' };
    };
    const migrated = swap(config) as LovelaceConfig;
    if (!is.array(migrated.entities)) return migrated;
    return {
      ...migrated,
      entities: migrated.entities.map((row: unknown) => (is.plainObject(row) ? swap(row) : row)),
    };
  }

  static _migrateShowValue(config: LovelaceConfig): LovelaceConfig {
    if (!DEPRECATED_OPTIONS.show_value(config)) return config;
    const drop = (level: Record<string, unknown>) => {
      const { show_value: showValue, ...rest } = level;
      // Absent at this level: it says nothing about this level's look, so
      // nothing is decided here - the other one may still speak for it.
      if (showValue === undefined) return rest;
      const hide = new Set([...(is.array(rest.hide) ? (rest.hide as string[]) : []), ...LEGACY_BARE_ROW]);
      if (showValue === false) hide.add('secondary_info');
      return { ...rest, hide: [...hide] };
    };
    const migrated = drop(config) as LovelaceConfig;
    if (!is.array(migrated.entities)) return migrated;
    return {
      ...migrated,
      entities: migrated.entities.map((row: unknown) => (is.plainObject(row) ? drop(row) : row)),
    };
  }

  // watermark.low/high: two legacy layers, folded per side in one pass -
  // (1) the pre-1.6 bare-entity-string trap (same as max_value's, with a
  // low_attribute/high_attribute sibling), (2) low_as/high_as/low_color/
  // high_color/disable_low/disable_high, now part of types.watermarkMark's
  // own shape (`false`, or { value, as, color }).
  static _migrateWatermarkOptions(config: LovelaceConfig): LovelaceConfig {
    const wm = config?.watermark;
    if (!wm || !DEPRECATED_OPTIONS.watermark(config)) return config;
    const migrateSide = (side: 'low' | 'high') => {
      const raw = wm[side];
      // Checked before any legacy color/as merge: `low: false` (already the
      // modern hidden shorthand) must win outright, even alongside a stale
      // low_color sibling - otherwise it gets wrapped into a shown override
      // object with a nonsensical value: false.
      if (raw === false || wm[`disable_${side}`] === true) return { [side]: false };
      const value = is.nonEmptyString(raw) ? { entity: raw, attribute: wm[`${side}_attribute`] } : raw;
      const as = wm[`${side}_as`];
      const color = wm[`${side}_color`];
      if (as === undefined && color === undefined) return is.nonEmptyString(raw) ? { [side]: value } : {};
      return { [side]: { value, ...(as !== undefined && { as }), ...(color !== undefined && { color }) } };
    };
    return {
      ...config,
      watermark: {
        ...wm,
        ...migrateSide('low'),
        ...migrateSide('high'),
        low_attribute: undefined,
        high_attribute: undefined,
        low_as: undefined,
        high_as: undefined,
        low_color: undefined,
        high_color: undefined,
        disable_low: undefined,
        disable_high: undefined,
      },
    };
  }

  // Every deprecation says the same two things around its own advice - kept
  // here so a reword can't drift across the call sites below.
  static #warnDeprecated(what: string, advice: string, { migrated = true, plural = false } = {}) {
    const migratedNote = migrated ? ' Your configuration was automatically migrated for this session.' : '';
    const verb = plural ? 'are' : 'is';
    BaseConfigHelper.#warn(
      `${what} ${verb} deprecated and will be removed in a future release. ${advice}${migratedNote}`,
    );
  }

  // navigate_to/show_more_info: gone for good, nothing to migrate to.
  static #warnRemoved(what: string) {
    BaseConfigHelper.#warn(`${what} is deprecated and has been removed.`);
  }

  static #warn(msg: string) {
    cardNotice(msg);
  }

  static #logDeprecatedOption(config: LovelaceConfig) {
    if (DEPRECATED_OPTIONS.navigate_to(config)) BaseConfigHelper.#warnRemoved('navigate_to option');
    if (DEPRECATED_OPTIONS.show_more_info(config)) BaseConfigHelper.#warnRemoved('show_more_info option');
    if (DEPRECATED_OPTIONS.theme(config))
      BaseConfigHelper.#warnDeprecated(`theme: ${config.theme}`, 'Please migrate to the recommended alternative...', {
        migrated: false,
      });
    // max_value used to be number|entity-id-string, disambiguated by sniffing
    // the value's shape at runtime (the same pattern that caused min_value's
    // freeze bug). The entity form is now an explicit map; the bare string form
    // is auto-migrated for this session (see CardConfigHelper._customizeConfig)
    // but should be updated in the YAML.
    if (DEPRECATED_OPTIONS.value_position(config))
      BaseConfigHelper.#warnDeprecated(
        'value_position',
        'A Multi row is a whole card now and uses its own reverse_secondary_info_row.',
      );
    if (DEPRECATED_OPTIONS.show_value(config))
      BaseConfigHelper.#warnDeprecated(
        'show_value',
        'A Multi row is a whole card now - icon, name, value and bar. Your rows were ' +
          'migrated to the hide list that keeps their previous look; adjust it to show more.',
      );
    if (DEPRECATED_OPTIONS.max_value(config))
      BaseConfigHelper.#warnDeprecated(
        'max_value: <entity id>',
        'Please migrate to max_value: { entity: <entity id>, attribute: <optional> }.',
      );
    // watermark.low/high used to accept the same bare entity-id-string trap as
    // pre-1.6 max_value (see BaseConfigHelper._migrateWatermarkOptions).
    WATERMARK_SIDES.forEach((side) => {
      if (hasLegacyWatermarkValue(config, side))
        BaseConfigHelper.#warnDeprecated(
          `watermark.${side}: <entity id>`,
          `Please migrate to watermark.${side}: { entity: <entity id>, attribute: <optional> }.`,
        );
    });
    // Now part of watermark.low/.high's own shape instead of sibling keys -
    // one combined warning per side is enough.
    WATERMARK_SIDES.forEach((side) => {
      if (hasLegacyWatermarkMarkKeys(config, side))
        BaseConfigHelper.#warnDeprecated(
          `watermark.${side}_as/${side}_color/disable_${side}`,
          `Please migrate to watermark.${side}: { value: ..., as, color } or watermark.${side}: false.`,
          { plural: true },
        );
    });
    if (DEPRECATED_OPTIONS.icon_animation(config))
      BaseConfigHelper.#warnDeprecated(
        'icon_animation: none',
        'Simply omit the option — an unset icon_animation already means no animation.',
      );
    if (DEPRECATED_OPTIONS.disable_unit(config))
      BaseConfigHelper.#warnDeprecated('disable_unit', "Please migrate to hide: ['unit', ...].");
    // additions used to be a bare array of {entity, attribute}; it is now the
    // entities list of bar_stack, alongside a mode ('stacked' by default,
    // 'proportional' preserves the legacy renormalized-total behavior exactly -
    // see CardConfigHelper._customizeConfig.
    if (DEPRECATED_OPTIONS.additions(config))
      BaseConfigHelper.#warnDeprecated(
        'additions',
        "Please migrate to bar_stack: { mode: 'proportional', entities: [...] }.",
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
      const entityId = entityOf(valueCfg as ValueConfig) ?? null;
      const attribute = attributeOf(valueCfg as ValueConfig) ?? null;
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
      // watermark.low/.high are unwrapped first (types.watermarkMark: false |
      // value | { value, as, opacity, color }) - the error path picks the
      // short or the .value-nested form depending on which one is present.
      ...WATERMARK_SIDES.flatMap((side) => {
        const mark = this.config.watermark?.[side];
        const nested = isMarkOverride(mark);
        return checkValueConfig(
          markValue(mark, SCHEMA_DEFAULTS.watermark[side]),
          nested ? WATERMARK_ENTITY_PATHS[side] : `watermark.${side}.entity`,
          nested ? `watermark.${side}.value.attribute` : `watermark.${side}.attribute`,
        );
      }),
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
  // Explicit Schema (not inferred from the initializer) - BadgeConfigHelper/
  // FeatureConfigHelper below narrow this to their own schema, which now
  // that each YamlSchemaFactory getter has its own precise Infer<> shape,
  // needs the wider declared type to narrow from.
  _yamlSchema: Schema = YamlSchemaFactory.card;

  // center_zero with no explicit min_value would otherwise default to 0,
  // making the negative half meaningless. Default it to the symmetric
  // negative of max_value instead - only when max_value is a plain number;
  // an entity/jinja-based max can't be mirrored at this stage. An explicit
  // min_value (even 0) is always left untouched.
  //
  // A built-in theme with real-world value zones (temperature, voc, pm25)
  // overrides the symmetric mirror with the theme's own lowest zone bound
  // instead (-50 for temperature, not -max_value) - it already defines how
  // far its negative branch realistically extends.
  static _applyCenterZeroMinDefault(config: LovelaceConfig, normalized: LovelaceConfig): LovelaceConfig {
    if (!config?.center_zero || !is.nullish(config?.min_value)) return normalized;
    const theme = THEME[config.theme as keyof typeof THEME];
    if (theme && theme.percent === false && is.nonEmptyArray(theme.style)) {
      // Cast: percent === false already rules out themes like `light`
      // (linear, no min/max per zone - split by index instead) at runtime,
      // but TS still unions every theme's own zone shape here since the
      // theme key isn't statically known.
      const mins = (theme.style as { min?: unknown }[]).map((zone) => zone.min).filter(is.number);
      if (mins.length) return { ...normalized, min_value: Math.min(...mins) };
    }
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
  static _migrateLegacyOptions(config: LovelaceConfig): LovelaceConfig {
    let normalized = config;
    if (is.nonEmptyString(config?.max_value)) {
      normalized = {
        ...config,
        max_value: { entity: config.max_value, attribute: config.max_value_attribute },
        max_value_attribute: undefined,
      };
    }
    normalized = BaseConfigHelper._migrateLegacyOptions(normalized);
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

  static _customizeConfig(config: LovelaceConfig): LovelaceConfig {
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

/**
 * Config helper for both Multi aggregators. Plain BaseConfigHelper: an
 * aggregator has no entity, icon or action of its own to negotiate - every row
 * option it carries is a default its children re-validate for themselves (see
 * multi.ts's #childConfigs).
 *
 * @extends BaseConfigHelper
 */
class MultiConfigHelper extends BaseConfigHelper {
  static _customizeConfig(config: LovelaceConfig): LovelaceConfig {
    return BaseConfigHelper._customizeConfig(
      MultiConfigHelper._migrateShowValue(
        MultiConfigHelper._migrateValuePosition(MultiConfigHelper._migrateSharedRowIdentity(config)),
      ),
    );
  }

  // A name or an icon at the shared level is what an earlier build produced by
  // hoisting a lone row's own settings. The aggregator schemas no longer carry
  // either (ROW_IDENTITY_FIELDS), so the value has to reach its rows before
  // validation drops it - deliberately not shared with the editor's own
  // pushDown (multi-cascade.ts): card code doesn't reach into editor code, and
  // this one also has the bare entity-id shorthand to expand.
  static _migrateSharedRowIdentity(config: LovelaceConfig): LovelaceConfig {
    const stale = ROW_IDENTITY_FIELDS.filter((field) => field !== 'entity' && config?.[field] !== undefined);
    if (stale.length === 0 || !is.array(config.entities)) return config;
    const migrated: LovelaceConfig = { ...config };
    for (const field of stale) migrated[field] = undefined;
    migrated.entities = config.entities.map((row: unknown) => {
      const own: Record<string, unknown> = is.plainObject(row) ? { ...row } : { entity: row };
      for (const field of stale) own[field] ??= config[field];
      return own;
    });
    return migrated;
  }
}

/**
 * MultiConfigHelper variant for the standalone card —
 * `YamlSchemaFactory.multiCard`.
 *
 * @extends MultiConfigHelper
 */
/**
 * One row of a Multi, edited on its own — `YamlSchemaFactory.multiRow`. Same
 * migrations as its aggregator (show_value was settable per row too).
 *
 * @extends MultiConfigHelper
 */
class MultiRowConfigHelper extends MultiConfigHelper {
  _yamlSchema = YamlSchemaFactory.multiRow;
}

/**
 * The same row, inside a Feature — `YamlSchemaFactory.multiFeatureRow`, which
 * drops what a few pixels of icon cannot carry.
 *
 * @extends MultiConfigHelper
 */
class MultiFeatureRowConfigHelper extends MultiConfigHelper {
  _yamlSchema = YamlSchemaFactory.multiFeatureRow;
}

class MultiCardConfigHelper extends MultiConfigHelper {
  _yamlSchema = YamlSchemaFactory.multiCard;
}

/**
 * MultiConfigHelper variant for the tile feature —
 * `YamlSchemaFactory.multiFeature`.
 *
 * @extends MultiConfigHelper
 */
class MultiFeatureConfigHelper extends MultiConfigHelper {
  _yamlSchema = YamlSchemaFactory.multiFeature;
}

export type { ActionBag };
export { hasDeprecatedOptions };
export { BaseConfigHelper };
export { CardConfigHelper };
export { BadgeConfigHelper };
export { FeatureConfigHelper };
export { TemplateConfigHelper };
export { BadgeTemplateConfigHelper };
export { MultiRowConfigHelper };
export { MultiFeatureRowConfigHelper };
export { MultiCardConfigHelper };
export { MultiFeatureConfigHelper };
