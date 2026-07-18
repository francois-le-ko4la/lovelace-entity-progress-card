/*
 * The YAML config validation layer: the struct/types primitives, and
 * YamlSchemaFactory - the per-card-type
 * (card/badge/template/badgeTemplate/feature) schema definitions built from
 * them.
 */

import { HA_CONTEXT, CARD, THEME, SEV } from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { HassProviderSingleton } from '../utils/hass-provider.js';

/**
 * structural validation ideas to manage inputs (1.5+).
 * deliberately verbose by design: no external dependencies, fully typed errors,
 * and scales cleanly across multiple card types.
 *
 * @inspired by superstruct (MIT License) - Copyright (c) @ianstormtaylor
 * @see https://github.com/ianstormtaylor/superstruct
 */
class ValidationError extends Error {
  constructor(
    path = [],
    errorCode = null,
    severity = SEV.error,
    fallback = null,
    partialConfig = null,
    allErrors = [],
  ) {
    super();
    this.name = 'ValidationError';
    this.path = path;
    this.errorCode = errorCode;
    this.severity = severity;
    this.partialConfig = partialConfig;
    this.errors = allErrors;
    this.fallback = fallback;
  }
}

const SKIP_PROPERTY = Symbol('SKIP_PROPERTY');

const ERROR_CODES = {
  missingRequiredProperty: { code: 'missingRequiredProperty', severity: SEV.error },
  invalidTypeString: { code: 'invalidTypeString', severity: SEV.error },
  invalidTypeNumber: { code: 'invalidTypeNumber', severity: SEV.error },
  invalidTypeBoolean: { code: 'invalidTypeBoolean', severity: SEV.error },
  invalidTypeArray: { code: 'invalidTypeArray', severity: SEV.error },
  invalidTypeObject: { code: 'invalidTypeObject', severity: SEV.error },
  invalidEnumValue: { code: 'invalidEnumValue', severity: SEV.error },
  invalidUnionType: { code: 'invalidUnionType', severity: SEV.error },
  invalidEntityId: { code: 'invalidEntityId', severity: SEV.error },
  invalidDecimal: { code: 'invalidDecimal', severity: SEV.error },
  invalidActionObject: { code: 'invalidActionObject', severity: SEV.error },
  missingActionKey: { code: 'missingActionKey', severity: SEV.error },
  invalidTheme: { code: 'invalidTheme', severity: SEV.info },
  invalidStateContent: { code: 'invalidStateContent', severity: SEV.error },
  invalidStateContentEntry: { code: 'invalidStateContentEntry', severity: SEV.error },
  appliedDefaultValue: { code: 'appliedDefaultValue', severity: SEV.info },
};

const validateType =
  (typeCheck, errorCode) =>
  (value, path = []) => {
    if (is.nullish(value))
      throw new ValidationError(
        path,
        ERROR_CODES.missingRequiredProperty.code,
        ERROR_CODES.missingRequiredProperty.severity,
      );
    if (!typeCheck(value)) throw new ValidationError(path, errorCode.code, errorCode.severity);
    return value;
  };

const types = {
  string: validateType(is.string, ERROR_CODES.invalidTypeString),
  number: validateType(is.number, ERROR_CODES.invalidTypeNumber),
  boolean: validateType(is.boolean, ERROR_CODES.invalidTypeBoolean),

  array:
    (itemValidator) =>
    (value, path = []) => {
      if (!is.array(value))
        throw new ValidationError(path, ERROR_CODES.invalidTypeArray.code, ERROR_CODES.invalidTypeArray.severity);

      const validItems = [];
      value.forEach((item, index) => {
        const validatedItem = itemValidator(item, [...path, index]);
        if (validatedItem !== SKIP_PROPERTY) {
          validItems.push(validatedItem);
        }
      });
      return validItems;
    },

  object: (schema) => {
    const validator = (value, path = []) => {
      if (!is.plainObject(value)) {
        throw new ValidationError(path, ERROR_CODES.invalidTypeObject.code, ERROR_CODES.invalidTypeObject.severity);
      }

      const result = {};
      const errors = [];

      for (const [key, fieldValidator] of Object.entries(schema)) {
        try {
          const validatedValue = fieldValidator(value[key], [...path, key]);
          if (validatedValue !== SKIP_PROPERTY) {
            result[key] = validatedValue;
          }
        } catch (error) {
          if (error instanceof ValidationError) {
            if (error.fallback !== null) {
              result[key] = error.fallback;
            }
            errors.push(error);
          } else {
            throw error;
          }
        }
      }

      if (errors.length > 0) {
        throw new ValidationError(errors[0].path, errors[0].errorCode, errors[0].severity, null, result, errors);
      }

      return result;
    };

    validator._schema = schema;
    return validator;
  },

  optional:
    (validator) =>
    (value, path = []) => {
      if (is.nullish(value)) return SKIP_PROPERTY;
      try {
        return validator(value, path);
      } catch (error) {
        if (error instanceof ValidationError) {
          // Si c'est optional, on change la sévérité en INFO
          error.severity = SEV.info;
        }
        throw error;
      }
    },

  fallbackTo:
    (validator, defaultVal) =>
    (value, path = []) => {
      if (value === undefined) return defaultVal;
      try {
        return validator(value, path);
      } catch (error) {
        if (error instanceof ValidationError) {
          if (is.nullish(value)) {
            error.severity = SEV.info;
            error.errorCode = ERROR_CODES.appliedDefaultValue.code;
          } else {
            error.severity = SEV.warning;
          }
          error.fallback = defaultVal;
        }
        throw error;
      }
    },

  optionalString: () => types.optional(types.string),
  optionalNumber: () => types.optional(types.number),
  optionalBoolean: () => types.optional(types.boolean),

  optionalWithDefault: (baseValidator, defaultVal) => types.fallbackTo(types.optional(baseValidator), defaultVal),
  optionalStringWithDefault: (defaultVal) => types.optionalWithDefault(types.string, defaultVal),
  optionalNumberWithDefault: (defaultVal) => types.optionalWithDefault(types.number, defaultVal),
  optionalBooleanWithDefault: (defaultVal) => types.optionalWithDefault(types.boolean, defaultVal),

  enums:
    (allowedValues) =>
    (value, path = []) => {
      if (is.nullish(value)) {
        throw new ValidationError(
          path,
          ERROR_CODES.missingRequiredProperty.code,
          ERROR_CODES.missingRequiredProperty.severity,
        );
      }
      if (!allowedValues.includes(value)) {
        throw new ValidationError(path, ERROR_CODES.invalidEnumValue.code, ERROR_CODES.invalidEnumValue.severity);
      }
      return value;
    },

  enumsWithDefault: (allowedValues, defaultVal) => types.fallbackTo(types.enums(allowedValues), defaultVal),

  theme:
    (allowedValues) =>
    (value, path = []) => {
      if (is.nullish(value) || is.emptyString(value)) return SKIP_PROPERTY;
      const themeMap = {
        battery: 'optimal_when_high',
        memory: 'optimal_when_low',
        cpu: 'optimal_when_low',
      };
      value = themeMap[value] || value;
      if (!allowedValues.includes(value))
        throw new ValidationError(path, ERROR_CODES.invalidTheme.code, ERROR_CODES.invalidTheme.severity);
      return value;
    },

  union:
    (...validators) =>
    (value, path = []) => {
      const errors = [];

      for (const validator of validators) {
        try {
          return validator(value, path);
        } catch (error) {
          errors.push(error.message || error.errorCode);
        }
      }

      throw new ValidationError(path, ERROR_CODES.invalidUnionType.code, ERROR_CODES.invalidUnionType.severity);
    },

  arrayWithValidatedElem:
    (allowedValues) =>
    (value, _path = []) => {
      if (is.nullish(value)) return SKIP_PROPERTY;

      const valueArray = is.array(value) ? value : [value];
      const validItems = valueArray.filter((item) => allowedValues.includes(item));

      if (validItems.length === 0) return SKIP_PROPERTY;

      return validItems;
    },

  jinjaOrArrayWithValidatedElem:
    (allowedValues) =>
    (value, path = []) => {
      if (is.jinja(value)) return value;
      return types.arrayWithValidatedElem(allowedValues)(value, path);
    },

  watermarkObject:
    (schema) =>
    (value, path = []) => {
      if (is.nullish(value) || !is.plainObject(value)) return SKIP_PROPERTY;

      const validateEntry = (key, validator) => {
        try {
          return { key, value: validator(value[key], [...path, key]), error: null };
        } catch (error) {
          if (!(error instanceof ValidationError)) throw error;
          return { key, value: error.fallback ?? undefined, error };
        }
      };

      const results = Object.entries(schema).map(([key, validator]) => validateEntry(key, validator));
      const errors = results.filter((r) => r.error).map((r) => r.error);
      const result = Object.fromEntries(
        results.filter((r) => r.value !== SKIP_PROPERTY && r.value !== undefined).map((r) => [r.key, r.value]),
      );

      if (errors.length > 0) {
        throw new ValidationError(path, 'watermarkValidation', SEV.warning, result, null, errors);
      }

      return result;
    },

  entityId: (value, path = []) => {
    if (is.nullish(value))
      throw new ValidationError(
        path,
        ERROR_CODES.missingRequiredProperty.code,
        ERROR_CODES.missingRequiredProperty.severity,
      );
    if (!is.string(value))
      throw new ValidationError(path, ERROR_CODES.invalidTypeString.code, ERROR_CODES.invalidTypeString.severity);
    if (!/^[a-z_]+\.[a-z0-9_]+$/.test(value))
      throw new ValidationError(path, ERROR_CODES.invalidEntityId.code, ERROR_CODES.invalidEntityId.severity);

    return value;
  },

  decimal: (value, path = []) => {
    if (is.nullish(value)) return SKIP_PROPERTY;
    if (!is.unsignedInteger(value))
      throw new ValidationError(path, ERROR_CODES.invalidDecimal.code, ERROR_CODES.invalidDecimal.severity);

    return value;
  },

  tapAction: (value, path = []) => {
    if (!is.plainObject(value)) {
      throw new ValidationError(path, ERROR_CODES.invalidActionObject.code, ERROR_CODES.invalidActionObject.severity);
    }
    if (!is.string(value.action)) {
      throw new ValidationError(
        [...path, 'action'],
        ERROR_CODES.missingActionKey.code,
        ERROR_CODES.missingActionKey.severity,
      );
    }

    return value;
  },

  tapActionWithDefault: (defaultVal) => types.fallbackTo(types.tapAction, defaultVal),

  // CF5 - issue (major) resolved - this used to throw (discarding the WHOLE
  // array via types.fallbackTo(..., SKIP_PROPERTY)) the instant any single zone
  // was momentarily incomplete or two zones didn't tile perfectly — harmless
  // for a YAML power user writing the whole list at once, but a hard "theme
  // disappears" break for the visual editor's row-by-row workflow (add a zone,
  // then fill in min, then max, then a color). Each zone is now kept
  // independently as long as it has a numeric min < max; missing colors/icon or
  // gaps between zones are tolerated (the card just won't recolor a range
  // nothing covers), and zones are sorted by min so edit order never matters —
  // mirrors barStackEntity's own per-item SKIP_PROPERTY leniency instead of an
  // all-or-nothing gate.
  customTheme: (value, _path = []) => {
    if (is.nullish(value)) return SKIP_PROPERTY;
    if (!is.array(value)) return SKIP_PROPERTY;

    const validItems = value
      .filter((item) => is.plainObject(item) && is.number(item.min) && is.number(item.max) && item.min < item.max)
      .map(({ min, max, color, icon_color, bar_color, icon }) => ({
        min,
        max,
        ...(is.string(color) && { color }),
        ...(is.string(icon_color) && { icon_color }),
        ...(is.string(bar_color) && { bar_color }),
        ...(is.string(icon) && { icon }),
      }))
      .sort((a, b) => a.min - b.min);

    return validItems.length ? validItems : SKIP_PROPERTY;
  },

  stateContent: (value, path = []) => {
    if (is.nullishOrEmptyString(value)) return SKIP_PROPERTY;
    if (is.string(value)) return [value];

    if (is.array(value)) {
      const invalidIndex = value.findIndex((v) => !is.string(v));
      if (invalidIndex !== -1) {
        throw new ValidationError(
          [...path, invalidIndex],
          ERROR_CODES.invalidStateContentEntry.code,
          ERROR_CODES.invalidStateContentEntry.severity,
        );
      }
      return value;
    }

    throw new ValidationError(path, ERROR_CODES.invalidStateContent.code, ERROR_CODES.invalidStateContent.severity);
  },
};

function struct(validator, { allowBelowBarPosition = true } = {}) {
  const preProcess = (data) => {
    const result = { ...data };

    if (!data.type.includes('template')) {
      if (is.nonEmptyString(result.name)) {
        result.name = [{ type: 'text', text: result.name }];
      } else if (is.plainObject(result.name)) {
        result.name = [result.name];
      }
    }

    if (is.nullish(result.icon_tap_action) && is.string(result.entity)) {
      const domain = HassProviderSingleton.getEntityDomain(result.entity);
      const shouldPatch = HA_CONTEXT.actions.toggleDomain.includes(domain);
      if (shouldPatch) result.icon_tap_action = HA_CONTEXT.actions.toggle;
    }

    if (['top', 'bottom', 'overlay', 'background'].includes(result.bar_position)) delete result.bar_size; // avoid conflict

    return result;
  };
  // Each applyXxxRule below handles one independent config-consistency rule,
  // pulled out of postProcess so its own conditions don't add to
  // postProcess's cognitive complexity - postProcess itself is just the
  // fixed pipeline order (later rules can depend on earlier ones having
  // already resolved layout/bar_position/bar_size to their final values).

  // 'below' isn't a legal bar_position for every schema (the Feature one
  // restricts it to ['default', 'top', 'bottom']) - this rewrite would
  // otherwise inject a value never validated as legal there.
  const applyBelowBarPositionRule = (result) => {
    if (
      allowBelowBarPosition &&
      result.bar_size === CARD.style.bar.sizeOptions.xlarge.label &&
      result.bar_position === 'default'
    )
      result.bar_position = 'below';
  };

  const applyBarSingleLineRule = (result) => {
    if (result.bar_position !== 'overlay' && result.bar_single_line) result.bar_single_line = false;
  };

  // bar_max_width only affects .horizontal.small/.medium/.large (see the CSS
  // rule on .progress-container) - 'below'/'top'/'bottom'/'overlay'/
  // 'background' all render through a separate container element instead
  // (never .progress-container), and .horizontal.xlarge has no matching
  // max-width rule either. By this point layout/bar_position/bar_size are
  // already resolved to their final values (defaults applied, the
  // xlarge+default->below rewrite above already ran), so this check can't be
  // fooled by an unset field.
  const applyBarMaxWidthRule = (result) => {
    const barMaxWidthAllowed =
      result.layout === CARD.layout.orientations.horizontal.label &&
      result.bar_position === 'default' &&
      result.bar_size !== CARD.style.bar.sizeOptions.xlarge.label;
    if (result.bar_max_width && !barMaxWidthAllowed) result.bar_max_width = undefined;
  };

  // 'up' only has a visible effect in two combinations (see
  // HACore#_addBaseClasses's vertical-bar/horizontal-bar decision, and the
  // editor's own upAllowed/resetUpIfInvalid) - mirrored here so a raw
  // YAML/Jinja config that bypasses the editor doesn't keep a stored 'up'
  // that silently does nothing.
  const applyBarOrientationUpRule = (result) => {
    const upAllowed =
      (result.layout === CARD.layout.orientations.vertical.label && result.bar_position === 'overlay') ||
      result.bar_position === 'background';
    if (result.bar_orientation === 'up' && !upAllowed) result.bar_orientation = 'ltr';
  };

  // text_shadow only applies via .overlay or .background (see the CSS rule on
  // :is(.overlay, .background).text-shadow) - same reasoning as
  // bar_single_line above, just a different pair of valid positions.
  const applyTextShadowRule = (result) => {
    if (result.bar_position !== 'overlay' && result.bar_position !== 'background' && result.text_shadow) {
      result.text_shadow = false;
    }
  };

  // bar_color_mode (segment/rainbow) only has an effect with a theme or
  // custom_theme active, and never in center_zero (see ViewCore.
  // colorGradient, which returns null in both cases regardless of mode) -
  // mirrors the editor's own bar_color_mode showIf.
  const applyBarColorModeRule = (result, hasTheme) => {
    if (result.bar_color_mode && result.bar_color_mode !== 'auto' && !(hasTheme && !result.center_zero)) {
      result.bar_color_mode = 'auto';
    }
  };

  // interpolate needs the same active theme as bar_color_mode, and is only
  // meaningful alongside bar_color_mode: 'auto' (or unset) - mirrors the
  // editor's own interpolate showIf, and its onChange that already clears
  // interpolate interactively when bar_color_mode changes to non-auto.
  const applyInterpolateRule = (result, hasTheme) => {
    if (result.interpolate && !(hasTheme && (is.nullish(result.bar_color_mode) || result.bar_color_mode === 'auto'))) {
      result.interpolate = false;
    }
  };

  // reverse_secondary_info_row: layout: vertical hardcodes
  // --current-secondary-info-flex-direction to 'column' unconditionally (see
  // the CSS rule on .vertical), ignoring --secondary-info-row-reverse
  // entirely - mirrors ViewCore#hasReversedSecondaryInfoRow (bar_position
  // nullish-coalesced to 'default' so Badge/Badge Template, which never have
  // that key at all, aren't wrongly treated as invalid).
  const applyReverseSecondaryInfoRowRule = (result) => {
    if (
      result.reverse_secondary_info_row &&
      !(result.layout === CARD.layout.orientations.horizontal.label && (result.bar_position ?? 'default') === 'default')
    ) {
      result.reverse_secondary_info_row = false;
    }
  };

  const postProcess = (data) => {
    const result = { ...data };
    if (!result.layout) result.layout = CARD.layout.orientations.horizontal.label;

    applyBelowBarPositionRule(result);
    applyBarSingleLineRule(result);
    applyBarMaxWidthRule(result);
    applyBarOrientationUpRule(result);
    applyTextShadowRule(result);

    const hasTheme = !is.nullish(result.theme) || is.nonEmptyArray(result.custom_theme);
    applyBarColorModeRule(result, hasTheme);
    applyInterpolateRule(result, hasTheme);
    applyReverseSecondaryInfoRowRule(result);

    return result;
  };
  return {
    validate: (data) => {
      try {
        const preProcessed = preProcess(data);
        return { isValid: true, config: postProcess(validator(preProcessed)), error: null, path: null };
      } catch (error) {
        return { isValid: false, config: null, error: error.message, path: error.path };
      }
    },

    parse: (data) => {
      try {
        const preProcessed = preProcess(data);
        const result = postProcess(validator(preProcessed));
        return {
          isValid: true,
          config: result,
          path: null,
          errorCode: null,
          severity: null,
          errors: [],
        };
      } catch (error) {
        // extract error wo duplicates
        const extractAllErrors = (errRoot) => {
          const allErrors = [];
          const seen = new Set();

          const addError = (err) => {
            const key = `${JSON.stringify(err.path)}-${err.errorCode}`;
            if (!seen.has(key)) {
              seen.add(key);
              allErrors.push({
                path: err.path,
                errorCode: err.errorCode,
                severity: err.severity,
              });
            }
          };

          if (is.nonEmptyArray(errRoot.errors)) {
            errRoot.errors.forEach((subError) => {
              if (subError instanceof ValidationError) {
                extractAllErrors(subError).forEach(addError);
              } else if (subError.errorCode) {
                addError(subError);
              }
            });
          } else if (errRoot.errorCode) {
            addError(errRoot);
          }

          return allErrors;
        };

        const allErrors = extractAllErrors(error);
        const mainError = allErrors.find((e) => e.severity === 'error') || allErrors[0] || null;

        const partialConfig = error.partialResult ?? error.partialConfig ?? null;
        const postProcessedPartialConfig = partialConfig !== null ? postProcess(partialConfig) : null;

        return {
          isValid: !mainError || mainError.severity !== 'error',
          config: postProcessedPartialConfig,
          path: mainError?.path ?? null,
          errorCode: mainError?.errorCode ?? null,
          severity: mainError?.severity ?? null,
          errors: allErrors,
        };
      }
    },

    extend: (additionalFields) => {
      if (!validator._schema) {
        throw new Error('Can only extend object schemas created with types.object');
      }

      const newSchema = {
        ...validator._schema,
        ...additionalFields,
      };

      return struct(types.object(newSchema));
    },

    delete: (fieldsToDelete) => {
      if (!validator._schema) {
        throw new Error('Can only delete from object schemas created with types.object');
      }

      const fieldsArray = is.array(fieldsToDelete) ? fieldsToDelete : [fieldsToDelete];
      const newSchema = { ...validator._schema };
      fieldsArray.forEach((field) => {
        delete newSchema[field];
      });

      return struct(types.object(newSchema));
    },

    fields: () => {
      if (!validator._schema) {
        throw new Error('Can only get fields from object schemas created with types.object');
      }
      return Object.keys(validator._schema);
    },
  };
}

types.discriminatedUnion =
  (key, mapping) =>
  (value, path = []) => {
    if (!is.plainObject(value)) {
      throw new ValidationError(path, ERROR_CODES.invalidTypeObject.code, ERROR_CODES.invalidTypeObject.severity);
    }

    const discriminator = value[key];

    if (!is.string(discriminator)) {
      throw new ValidationError(
        [...path, key],
        ERROR_CODES.invalidTypeString.code,
        ERROR_CODES.invalidTypeString.severity,
      );
    }

    const validator = mapping[discriminator];

    if (!validator) {
      throw new ValidationError(
        [...path, key],
        ERROR_CODES.invalidEnumValue.code,
        ERROR_CODES.invalidEnumValue.severity,
      );
    }

    return validator(value, path);
  };

const nameItem = types.discriminatedUnion('type', {
  text: types.object({
    type: types.enums(['text']),
    text: types.string,
  }),

  entity: types.object({
    type: types.enums(['entity']),
  }),

  device: types.object({
    type: types.enums(['device']),
  }),

  area: types.object({
    type: types.enums(['area']),
  }),

  floor: types.object({
    type: types.enums(['floor']),
  }),
});

types.name = types.array(nameItem);

const barStackEntity = types.fallbackTo(
  types.object({
    entity: types.entityId,
    attribute: types.optional(types.string),
    color: types.optionalString(),
    // 'net': subtracted from the algebraic total. 'stacked'/'proportional' +
    // center_zero: placed on the negative arm instead of the positive one.
    // No-op otherwise.
    subtract: types.optionalBooleanWithDefault(false),
  }),
  SKIP_PROPERTY,
);

const watermarkSchema = {
  // number (fixed) | string (entity id) | { jinja } - mirrors
  // min_value/max_value's explicit jinja shape rather than sniffing a bare
  // string (an entity id and a Jinja template are both strings; disambiguating
  // them at runtime is exactly what min_value/max_value moved away from).
  low: types.fallbackTo(
    types.union(types.number, types.string, types.object({ jinja: types.string })),
    CARD.config.defaults.watermark.low,
  ),
  low_as: types.enumsWithDefault(['auto', 'percent'], CARD.config.defaults.watermark.low_as),
  low_attribute: types.optionalString(),
  low_color: types.optionalStringWithDefault(CARD.config.defaults.watermark.low_color),
  high: types.fallbackTo(
    types.union(types.number, types.string, types.object({ jinja: types.string })),
    CARD.config.defaults.watermark.high,
  ),
  high_as: types.enumsWithDefault(['auto', 'percent'], CARD.config.defaults.watermark.high_as),
  high_attribute: types.optionalString(),
  high_color: types.optionalStringWithDefault(CARD.config.defaults.watermark.high_color),
  opacity: types.optionalNumberWithDefault(CARD.config.defaults.watermark.opacity),
  type: types.enumsWithDefault(
    ['blended', 'area', 'striped', 'triangle', 'round', 'line'],
    CARD.config.defaults.watermark.type,
  ),
  line_size: types.optionalStringWithDefault(CARD.config.defaults.watermark.line_size),
  disable_low: types.optionalBooleanWithDefault(CARD.config.defaults.watermark.disable_low),
  disable_high: types.optionalBooleanWithDefault(CARD.config.defaults.watermark.disable_high),
};

/**
 * Builds the per-card-type YAML schemas (`card`, `badge`, `feature`,
 * `template`, `badgeTemplate`) from the `types`/`struct` primitives above.
 * Each static getter returns a `struct(...)`-validated schema, consumed by a
 * ConfigHelper's `_yamlSchema` (see config-helpers.js) to validate and
 * normalize a raw config.
 */
class YamlSchemaFactory {
  static get feature() {
    return struct(
      types.object({
        // ─── Entity & Data ──────────────────────────────────────────────────
        entity: types.entityId,
        attribute: types.optionalString(),
        // Explicit shape instead of type-sniffing a scalar (number vs entity-id
        // string vs jinja-looking string): min_value: 10 | {value: 10} |
        // {entity, attribute} | {jinja}.
        min_value: types.optional(
          types.union(
            types.number,
            types.object({ value: types.number }),
            types.object({ entity: types.entityId, attribute: types.optionalString() }),
            types.object({ jinja: types.string }),
          ),
        ),
        // Explicit shape, mirrors min_value: max_value: 10 | {entity,
        // attribute} | {jinja}. The legacy bare entity-id string is rewritten
        // into the map form by _customizeConfig before this schema ever sees it
        // (single call site, see BaseConfigHelper.set config), so no string
        // form is needed here.
        max_value: types.fallbackTo(
          types.union(
            types.number,
            types.object({ entity: types.entityId, attribute: types.optionalString() }),
            types.object({ jinja: types.string }),
          ),
          100,
        ),

        // ─── Appearance ─────────────────────────────────────────────────────
        bar_color: types.optionalString(),
        // Unlike Card/Badge/Template, a Feature's row height is fixed
        // (--feature-height, see the .entity-progress-feature CSS rule) and
        // doesn't scale with bar_size - so 'small' (8px) looks lost inside a
        // 42px row. 'xlarge' matches --feature-height by construction.
        bar_size: types.enumsWithDefault(
          Object.values(CARD.style.bar.sizeOptions).map((e) => e.label),
          'xlarge',
        ), //[('small', 'medium', 'large', 'xlarge')]
        // 'up' is excluded here (Card/Template only): every CSS rule for
        // up-orientation is scoped .vertical.up-orientation, and a Feature
        // never gets the .vertical class (no 'layout' option in this
        // schema) - it would validate but have zero visual effect.
        bar_orientation: types.enumsWithDefault(['ltr', 'rtl'], 'ltr'),
        bar_color_mode: types.enumsWithDefault(['auto', 'segment', 'rainbow'], 'auto'),
        // Only engages outside center_zero with a well-formed positive range
        // (min > 0, max > min) — ProgressCalc.isLogScale falls back to linear
        // otherwise, so an invalid combination degrades quietly instead of
        // producing NaN.
        bar_scale: types.enumsWithDefault(['linear', 'log'], 'linear'),
        // [('radius', 'glass', 'gradient', 'shimmer')]
        bar_effect: types.jinjaOrArrayWithValidatedElem(
          Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label),
        ),
        bar_position: types.enumsWithDefault(['default', 'top', 'bottom'], 'default'),
        bar_segments: types.optionalNumber(),
        center_zero: types.optionalWithDefault(
          types.union(
            types.boolean,
            types.object({
              value: types.optionalNumberWithDefault(0),
              growth_percent: types.optionalBooleanWithDefault(false),
            }),
          ),
          false,
        ),

        // ─── Theme & Watermark ──────────────────────────────────────────────
        theme: types.theme(Object.keys(THEME)),
        custom_theme: types.fallbackTo(types.customTheme, SKIP_PROPERTY),
        interpolate: types.optionalBooleanWithDefault(false),
        watermark: types.watermarkObject(watermarkSchema, CARD.config.defaults.watermark),

        // ─── Bar Stack ──────────────────────────────────────────────────────
        bar_stack: types.optional(
          types.object({
            mode: types.enumsWithDefault(['stacked', 'proportional', 'net'], 'stacked'),
            entities: types.optional(types.array(barStackEntity)),
          }),
        ),
      }),
      { allowBelowBarPosition: false },
    );
  }

  static get card() {
    return struct(
      types.object({
        // ─── Entity & Data ──────────────────────────────────────────────────
        entity: types.entityId,
        attribute: types.optionalString(),
        name: types.optional(types.name),
        decimal: types.decimal,
        unit: types.optionalString(),
        disable_unit: types.optionalBooleanWithDefault(false),
        unit_spacing: types.enumsWithDefault(Object.values(CARD.config.unit.unitSpacing), 'auto'), //['auto', 'space', 'no-space']
        // Explicit shape instead of type-sniffing a scalar (number vs entity-id
        // string vs jinja-looking string): min_value: 10 | {value: 10} |
        // {entity, attribute} | {jinja}.
        min_value: types.optional(
          types.union(
            types.number,
            types.object({ value: types.number }),
            types.object({ entity: types.entityId, attribute: types.optionalString() }),
            types.object({ jinja: types.string }),
          ),
        ),
        // Explicit shape, mirrors min_value: max_value: 10 | {entity,
        // attribute} | {jinja}. The legacy bare entity-id string is rewritten
        // into the map form by _customizeConfig before this schema ever sees it
        // (single call site, see BaseConfigHelper.set config), so no string
        // form is needed here.
        max_value: types.fallbackTo(
          types.union(
            types.number,
            types.object({ entity: types.entityId, attribute: types.optionalString() }),
            types.object({ jinja: types.string }),
          ),
          100,
        ),

        // ─── Appearance ===
        icon: types.optionalString(),
        color: types.optionalString(),
        bar_color: types.optionalString(),
        bar_size: types.enumsWithDefault(
          Object.values(CARD.style.bar.sizeOptions).map((e) => e.label),
          'small',
        ), //[('small', 'medium', 'large', 'xlarge')]
        bar_orientation: types.enumsWithDefault(Object.keys(CARD.style.dynamic.progressBar.orientation), 'ltr'), // ['ltr', 'rtl']
        bar_color_mode: types.enumsWithDefault(['auto', 'segment', 'rainbow'], 'auto'),
        // Only engages outside center_zero with a well-formed positive range
        // (min > 0, max > min) — ProgressCalc.isLogScale falls back to linear
        // otherwise, so an invalid combination degrades quietly instead of
        // producing NaN.
        bar_scale: types.enumsWithDefault(['linear', 'log'], 'linear'),
        // [('radius', 'glass', 'gradient', 'shimmer')]
        bar_effect: types.jinjaOrArrayWithValidatedElem(
          Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label),
        ),
        bar_position: types.enumsWithDefault(['default', 'below', 'top', 'bottom', 'overlay', 'background'], 'default'),
        bar_single_line: types.optionalBooleanWithDefault(false),
        bar_max_width: types.optionalString(),
        bar_segments: types.optionalNumber(),
        icon_animation: types.enumsWithDefault(
          ['none', 'spin', 'pulse', 'bounce', 'shake', 'ping', 'reveal', 'washing_machine', 'battery_charging'],
          'none',
        ),
        layout: types.enumsWithDefault(
          Object.values(CARD.layout.orientations).map((e) => e.label),
          'horizontal',
        ), // [('horizontal', 'vertical')]
        min_width: types.optionalString(),
        height: types.optionalString(),
        frameless: types.optionalBooleanWithDefault(false),
        marginless: types.optionalBooleanWithDefault(false),
        reverse: types.optionalBooleanWithDefault(false),
        reverse_secondary_info_row: types.optionalBooleanWithDefault(false),
        force_circular_background: types.optionalBooleanWithDefault(false),
        center_zero: types.optionalWithDefault(
          types.union(
            types.boolean,
            types.object({
              value: types.optionalNumberWithDefault(0),
              growth_percent: types.optionalBooleanWithDefault(false),
            }),
          ),
          false,
        ),
        trend_indicator: types.optionalBooleanWithDefault(false),
        text_shadow: types.optionalBooleanWithDefault(false),

        // ─── Visibility & Content ===
        hide: types.jinjaOrArrayWithValidatedElem(['icon', 'name', 'value', 'unit', 'secondary_info', 'progress_bar']),
        name_info: types.optionalString(),
        custom_info: types.optionalString(),
        // Badge/badgeTemplate opt out (see their own .delete(['multiline'])):
        // the row is too small for a second line there.
        multiline: types.optionalBooleanWithDefault(false),
        state_content: types.optional(types.fallbackTo(types.stateContent, SKIP_PROPERTY)),

        // ─── Badges ===
        badge_icon: types.optionalString(),
        badge_color: types.optionalString(),

        // ─── Theme & Watermark === theme: types.theme(['optimal_when_low',
        // 'optimal_when_high', 'light', 'temperature', 'humidity', 'pm25',
        // 'voc']),
        theme: types.theme(Object.keys(THEME)),
        custom_theme: types.fallbackTo(types.customTheme, SKIP_PROPERTY),
        interpolate: types.optionalBooleanWithDefault(false),
        watermark: types.watermarkObject(watermarkSchema, CARD.config.defaults.watermark),
        alert_when: types.optional(
          types.object({
            above: types.optionalNumber(),
            below: types.optionalNumber(),
            color: types.optionalString(),
            highlight: types.enumsWithDefault(['border', 'background'], 'border'),
            // Left genuinely optional (no forced default): the effective
            // default depends on `highlight` (border -> blink, background ->
            // static, both unchanged from pre-1.6 behavior) and is resolved
            // in CSS/ViewCore, not here - see .alert-active in the stylesheet.
            animation: types.optional(types.enums(['static', 'blink', 'ping'])),
          }),
        ),

        // ─── Bar Stack ===
        bar_stack: types.optional(
          types.object({
            mode: types.enumsWithDefault(['stacked', 'proportional', 'net'], 'stacked'),
            entities: types.optional(types.array(barStackEntity)),
          }),
        ),

        // ─── Actions ===
        tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.moreInfo),
        hold_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        double_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_hold_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_double_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
      }),
    );
  }

  static get badge() {
    return YamlSchemaFactory.card
      .delete([
        'bar_position',
        'badge_icon',
        'badge_color',
        'force_circular_background',
        'layout',
        'height',
        'icon_tap_action',
        'icon_hold_action',
        'icon_double_tap_action',
        'multiline',
        'icon_animation',
        // Requires the 'horizontal' layout class (see the CSS rule on
        // .progress-container), which badges never get since they have no
        // 'layout' key (deleted above) - keeping it would accept a config that
        // silently has no visual effect.
        'bar_max_width',
        // Both only ever apply via bar_position values (bar_single_line:
        // 'overlay' only; text_shadow: 'overlay' or 'background') that are
        // deleted above (badges have no bar_position at all), so badges never
        // get either. Same dead-option reasoning as bar_max_width.
        'bar_single_line',
        'text_shadow',
        // Not CSS-dead like the two above - a design choice: a trend arrow
        // icon doesn't read well at badge scale (--ha-badge-size, ~36px).
        'trend_indicator',
      ])
      .extend({
        // 'up' needs .vertical.overlay (see bar_orientation's CSS) - a badge
        // has neither `layout` nor `bar_position` (both deleted above), so it
        // would validate but have zero visual effect, same reasoning as
        // YamlSchemaFactory.feature.
        bar_orientation: types.enumsWithDefault(['ltr', 'rtl'], 'ltr'),
        // 'xlarge' unconditionally sets --progress-container-height to 42px
        // (see the .xlarge CSS rule) - a badge's total height is capped at
        // --ha-badge-size (36px default), so xlarge would demand a taller
        // progress-container than the badge itself, overflowing it.
        bar_size: types.enumsWithDefault(['small', 'medium', 'large'], 'small'),
      });
  }

  static get template() {
    return struct(
      types.object({
        // ─── Entity & Data ===
        entity: types.optional(types.entityId),
        name: types.optionalString(),
        secondary: types.optionalString(),
        // badgeTemplate opts out (see its own .delete(['multiline'])): the row
        // is too small for a second line there.
        multiline: types.optionalBooleanWithDefault(false),
        percent: types.optionalString(),

        // ─── Appearance ===
        icon: types.optionalString(),
        color: types.optionalString(),
        bar_color: types.optionalString(),
        bar_size: types.enumsWithDefault(
          Object.values(CARD.style.bar.sizeOptions).map((e) => e.label),
          'small',
        ), //[('small', 'medium', 'large', 'xlarge')]
        bar_orientation: types.enumsWithDefault(Object.keys(CARD.style.dynamic.progressBar.orientation), 'ltr'), // ['ltr', 'rtl']
        // [('radius', 'glass', 'gradient', 'shimmer')]
        bar_effect: types.jinjaOrArrayWithValidatedElem(
          Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label),
        ),
        bar_position: types.enumsWithDefault(['default', 'below', 'top', 'bottom', 'overlay', 'background'], 'default'),
        bar_single_line: types.optionalBooleanWithDefault(false),
        bar_max_width: types.optionalString(),
        bar_segments: types.optionalNumber(),
        icon_animation: types.enumsWithDefault(
          ['none', 'spin', 'pulse', 'bounce', 'shake', 'ping', 'reveal', 'washing_machine', 'battery_charging'],
          'none',
        ),
        layout: types.enumsWithDefault(
          Object.values(CARD.layout.orientations).map((e) => e.label),
          'horizontal',
        ), // [('horizontal', 'vertical')]
        min_width: types.optionalString(),
        height: types.optionalString(),
        frameless: types.optionalBooleanWithDefault(false),
        marginless: types.optionalBooleanWithDefault(false),
        reverse_secondary_info_row: types.optionalBooleanWithDefault(false),
        force_circular_background: types.optionalBooleanWithDefault(false),
        center_zero: types.optionalWithDefault(
          types.union(
            types.boolean,
            types.object({
              value: types.optionalNumberWithDefault(0),
              growth_percent: types.optionalBooleanWithDefault(false),
            }),
          ),
          false,
        ),
        trend_indicator: types.optionalBooleanWithDefault(false),
        text_shadow: types.optionalBooleanWithDefault(false),

        hide: types.jinjaOrArrayWithValidatedElem(['icon', 'name', 'value', 'secondary_info', 'progress_bar']),
        badge_icon: types.optionalString(),
        badge_color: types.optionalString(),
        watermark: types.watermarkObject(watermarkSchema, CARD.config.defaults.watermark),

        // ─── Actions ===
        tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.moreInfo),
        hold_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        double_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_hold_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_double_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
      }),
    );
  }

  static get badgeTemplate() {
    return YamlSchemaFactory.template
      .delete([
        'bar_position',
        'badge_icon',
        'badge_color',
        'force_circular_background',
        'layout',
        'height',
        'icon_tap_action',
        'icon_hold_action',
        'icon_double_tap_action',
        'multiline',
        'icon_animation',
        // Same reason as YamlSchemaFactory.badge: no 'layout' key means no
        // 'horizontal' class, so the CSS rule never engages.
        'bar_max_width',
        // Same reason as YamlSchemaFactory.badge: both only apply via
        // bar_position values that are deleted above (no bar_position at all).
        'bar_single_line',
        'text_shadow',
        // Same design choice as YamlSchemaFactory.badge: too small a scale for
        // a trend arrow icon to read well.
        'trend_indicator',
      ])
      .extend({
        // Same reason as YamlSchemaFactory.badge: 'up' needs .vertical.overlay,
        // neither of which a badge template ever gets.
        bar_orientation: types.enumsWithDefault(['ltr', 'rtl'], 'ltr'),
        // Same reason as YamlSchemaFactory.badge: 'xlarge' would demand a
        // 42px-tall progress-container inside a badge capped at
        // --ha-badge-size (36px), overflowing it.
        bar_size: types.enumsWithDefault(['small', 'medium', 'large'], 'small'),
      });
  }
}

export { ValidationError };
export { SKIP_PROPERTY };
export { ERROR_CODES };
export { validateType };
export { types };
export { struct };
export { nameItem };
export { barStackEntity };
export { watermarkSchema };
export { YamlSchemaFactory };
