import { CARD } from '../../utils/parameters.js';
import { is } from '../../utils/common-checks.js';
import { YamlSchemaFactory, rawThemeRange, entityOf, attributeOf, type ValueConfig } from '../schema.js';
import { type LovelaceConfig } from '../../utils/types.js';
import { BaseConfigHelper, type Schema, nativeScaleMaxValue, attributeMappingOf } from './base.js';

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
  static _applyCenterZeroMinDefault(config: LovelaceConfig): LovelaceConfig {
    if (!config?.center_zero || !is.nullish(config?.min_value)) return config;
    const bottom = rawThemeRange(config.theme)?.min;
    if (!is.nullish(bottom)) return { ...config, min_value: bottom };
    const maxForSymmetry = is.number(config?.max_value) ? config.max_value : CARD.config.value.max;
    return { ...config, min_value: -maxForSymmetry };
  }

  // Legacy-syntax rewriting only — the defaults live in _applyDefaults. CF5 -
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
    // #progressConfig, hasDisabledUnit).
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
        // A bar_stack already written is the new form: additions only leaves.
        ...(config.bar_stack === undefined && { bar_stack: { mode: 'proportional', entities: config.additions } }),
        additions: undefined,
      };
    }
    if (nativeScaleMaxValue(config) !== null) normalized = { ...normalized, max_value: undefined };
    return normalized;
  }

  static _applyDefaults(config: LovelaceConfig): LovelaceConfig {
    const normalized = CardConfigHelper._applyCenterZeroMinDefault(config);
    const maxEntity = entityOf(normalized?.max_value as ValueConfig);
    return {
      ...normalized,
      ...(is.nonEmptyString(normalized?.entity) && is.nullish(normalized?.attribute)
        ? { attribute: attributeMappingOf(normalized.entity)?.attribute }
        : {}),
      ...(is.nonEmptyString(maxEntity) && is.nullish(attributeOf(normalized?.max_value as ValueConfig))
        ? { max_value: { ...normalized.max_value, attribute: attributeMappingOf(maxEntity)?.attribute } }
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

export { CardConfigHelper, BadgeConfigHelper, FeatureConfigHelper, TemplateConfigHelper, BadgeTemplateConfigHelper };
