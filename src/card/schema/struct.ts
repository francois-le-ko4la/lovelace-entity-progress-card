import { HA_CONTEXT, CARD } from '../../utils/parameters.js';
import { is } from '../../utils/common-checks.js';
import { HassProviderSingleton } from '../../utils/hass-provider.js';
import { isToggleDomain } from '../ha-state.js';
import { type Validator, type Path, ValidationError, type ErrorLike, type ErrorSummary } from './errors.js';
import { HAS_EFFECT, hasStack, INERT_OPTIONS, translateOrientation, densityOverrides } from './rules.js';
import { rawThemeRange } from './enums.js';
import { types } from './types.js';

// Reads a field's real default off the live validator instead of a
// hand-maintained table - undefined where none exists by design (e.g.
// watermark's shared opacity/type/color, see watermarkSchema's own comment).
const isToggleDomainEntity = (entityId: string): boolean => {
  const domain = HassProviderSingleton.getEntityDomain(entityId);
  return isToggleDomain(domain);
};

function getSchemaDefault(
  validator: Validator<unknown> & { _schema?: Record<string, Validator<unknown>>; defaultValue?: unknown },
): unknown {
  // _schema wins over defaultValue when both are present (peak_marker/
  // trend_indicator: a top-level boolean|object union default of `false`
  // alongside the object branch's own per-field defaults) - callers want the
  // sub-field defaults to pre-fill the object form, never the flat `false`.
  if (validator._schema) {
    const result: Record<string, unknown> = {};
    for (const [key, fieldValidator] of Object.entries(validator._schema)) {
      const value = getSchemaDefault(fieldValidator);
      if (value !== undefined) result[key] = value;
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }
  return validator.defaultValue;
}

// Twin of getSchemaDefault for a field's allowed values: read off the live
// validator (types.enums/theme/jinjaOrArrayWithValidatedElem attach them,
// optional/fallbackTo/union forward them) instead of a parallel list.
function getSchemaOptions(validator: Validator<unknown>): readonly unknown[] | undefined {
  return (validator as { allowedValues?: readonly unknown[] }).allowedValues;
}

// Options carried by a struct beyond its field set. A derived schema
// (delete/extend/reorder) inherits them: dropping them would silently
// re-enable a rule the source variant opted out of.
type StructOptions = { allowBelowBarPosition?: boolean };

// eslint-disable-next-line sonarjs/max-lines-per-function -- fixed call chain.
function struct<T>(
  // skipcq: JS-0323 -- `_schema` is used for dynamic per-field introspection
  // elsewhere (extend()/config-helpers.ts/dom-helpers.ts read a field
  // validator by name and call it expecting its own specific return shape,
  // e.g. tap_action's `{action}` or center_zero's boolean) - `unknown` here
  // breaks every one of those call sites' property access; measured, not
  // guessed (see git history for this line).
  validator: Validator<T> & { _schema?: Record<string, Validator<any>> },
  structOptions: StructOptions = {},
) {
  const { allowBelowBarPosition = true } = structOptions;
  // Each applyXxxRule below is one independent preProcess step, pulled out
  // for the same reason as postProcess's own rules further down: keeps
  // preProcess itself just a fixed call sequence, not the source of its
  // cognitive complexity.

  // Card/Badge/Feature's `name` accepts a bare string/object shorthand for
  // the full [{type:'text',text}] array form - Template's own `name` means
  // something else, excluded here.
  const applyNameShapeRule = (result: Record<string, unknown>) => {
    if (String(result.type).includes('template')) return;
    if (is.nonEmptyString(result.name)) {
      result.name = [{ type: 'text', text: result.name }];
    } else if (is.plainObject(result.name)) {
      result.name = [result.name];
    }
  };

  const applyIconTapActionDefaultRule = (result: Record<string, unknown>) => {
    if (!is.nullish(result.icon_tap_action) || !is.string(result.entity)) return;
    if (isToggleDomainEntity(result.entity)) result.icon_tap_action = HA_CONTEXT.actions.toggle;
  };

  // top/bottom force the bar to xsmall's thickness in CSS, but rainbow_full's
  // marker reads the bar_size class directly - a bigger bar_size stayed
  // sized for a thickness the bar never has. overlay/background's own marker
  // is already hardcoded regardless of bar_size (styles.ts's
  // .vertical-bar rule), so it's simply dropped there.
  const applyBarSizeConflictRule = (result: Record<string, unknown>) => {
    if (HAS_EFFECT.barSize(result)) return;
    if (result.bar_position === 'top' || result.bar_position === 'bottom') {
      result.bar_size = CARD.style.bar.sizeOptions.xsmall;
    } else {
      delete result.bar_size;
    }
  };

  // A raw-value theme's own scale (e.g. temperature's -50..100°C) IS the
  // entity's real range - defaults max_value to its top bound so fill % stays
  // meaningful. min_value stays put (widening it would stretch the gradient
  // to unreached zones); custom_theme is excluded (#129, no reliable top-bound
  // signal there).
  const applyThemeMaxValueDefaultRule = (result: Record<string, unknown>) => {
    if (!is.nullish(result.max_value)) return;
    const top = rawThemeRange(result.theme)?.max;
    if (!is.nullish(top)) result.max_value = top;
  };

  const preProcess = (data: Record<string, unknown>) => {
    const result = { ...data };
    applyNameShapeRule(result);
    applyIconTapActionDefaultRule(result);
    applyBarSizeConflictRule(result);
    applyThemeMaxValueDefaultRule(result);
    return result;
  };
  // Each applyXxxRule below handles one independent config-consistency rule,
  // pulled out of postProcess so its own conditions don't add to
  // postProcess's cognitive complexity - postProcess itself is just the
  // fixed pipeline order (later rules can depend on earlier ones having
  // already resolved layout/bar_position/bar_size to their final values).

  // 'below' isn't a legal bar_position for every schema (the Feature one
  // restricts it to ['default', 'top', 'bottom']) - this rewrite would
  // otherwise inject a value never validated as legal there. Same switch for
  // compact_below as for default: at xlarge, compact_below's tight shared
  // name/secondary_info row reads as disproportionate stacked above a 42px
  // bar - below's own two full-height rows carry that size better.
  const applyBelowBarPositionRule = (result: Record<string, unknown>) => {
    if (
      allowBelowBarPosition &&
      result.bar_size === CARD.style.bar.sizeOptions.xlarge &&
      (result.bar_position === 'default' || result.bar_position === 'compact_below')
    )
      result.bar_position = 'below';
  };

  // The color picker offers "State" as the name of the unset state (see
  // base.ts's color_state_default), and HA writes that name down when it is
  // picked. Nothing reads it: the fallback is EntityHelper.defaultColor, which
  // is per-domain and dynamic. Same treatment as icon_animation: none, the
  // other value that only ever spelled out its own default.
  const applyStateColorRule = (result: Record<string, unknown>) => {
    for (const key of ['color', 'bar_color']) if (result[key] === 'state') result[key] = undefined;
  };

  // rainbow_full paints the whole track at once with a single moving marker
  // (.rainbow-full-bar in styles.ts) - generalizes to center_zero fine (each
  // arm gets its own gradient + a zero-centered marker formula). bar_stack's
  // per-entity segments have no single position for one marker, so that
  // combination falls back to plain 'rainbow' instead.
  const applyRainbowFullRule = (result: Record<string, unknown>) => {
    if (result.bar_color_mode === 'rainbow_full' && hasStack(result)) {
      result.bar_color_mode = 'rainbow';
    }
  };

  const applyInertOptionsRule = (result: Record<string, unknown>) => {
    for (const { key, hasEffect, fallback } of INERT_OPTIONS) {
      if (!is.nullish(result[key]) && result[key] !== fallback && !hasEffect(result)) result[key] = fallback;
    }
  };

  const applyOrientationRule = (result: Record<string, unknown>) => {
    if (!is.nullish(result.bar_orientation)) result.bar_orientation = translateOrientation(result);
  };

  const applyDensityRule = (result: Record<string, unknown>) => Object.assign(result, densityOverrides(result));

  // Same type in and out (T, not Record<string, unknown>) - every applyXxxRule
  // only ever writes a value already a member of that field's own declared
  // type (an enum-string field gets one of its own allowed literals, a
  // boolean field gets a boolean, never a different shape or a new key) -
  // verified by reading each rule, not assumed. The internal cast is just to
  // let the untyped applyXxxRule helpers (still Record<string, unknown>,
  // not worth re-typing individually for the same reason) read/write freely.
  const postProcess = (data: T): T => {
    const result = { ...data } as Record<string, unknown>;

    applyDensityRule(result);
    applyBelowBarPositionRule(result);
    applyStateColorRule(result);
    // Before bar_segments reads the colour mode it rewrites.
    applyRainbowFullRule(result);
    // Twice: once so a ring value is not reset as inert outside a ring, once so
    // the fallback an inert option leaves ('ltr') speaks the ring's words.
    applyOrientationRule(result);
    applyInertOptionsRule(result);
    applyOrientationRule(result);

    return result as T;
  };
  const requireObjectSchema = (verb: string) => {
    if (!validator._schema) throw new Error(`Can only ${verb} object schemas created with types.object`);
    return validator._schema;
  };

  return {
    validate: (
      data: Record<string, unknown>,
    ):
      | { isValid: true; config: T; error: null; path: null }
      | { isValid: false; config: null; error: string; path: Path } => {
      try {
        const preProcessed = preProcess(data);
        return {
          isValid: true,
          config: postProcess(validator(preProcessed)),
          error: null,
          path: null,
        };
      } catch (error) {
        const err = error as ValidationError;
        return { isValid: false, config: null, error: err.message, path: err.path };
      }
    },

    parse: (data: Record<string, unknown>) => {
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
        // dedupe by path + errorCode
        const extractAllErrors = (errRoot: ErrorLike): ErrorSummary[] => {
          const allErrors: ErrorSummary[] = [];
          const seen = new Set();

          const addError = (err: ErrorLike) => {
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

          if (errRoot.errors && errRoot.errors.length > 0) {
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

        const err = error as ValidationError & { partialResult?: unknown };
        const allErrors = extractAllErrors(err);
        const mainError = allErrors.find((e) => e.severity === 'error') || allErrors[0] || null;

        const partialConfig = err.partialResult ?? err.partialConfig ?? null;
        const postProcessedPartialConfig = partialConfig !== null ? postProcess(partialConfig as T) : null;

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

    // extend()/delete() each build a fresh schema object and re-run it
    // through types.object(...) - a brand new call, so its own generic
    // infers the merged/filtered shape straight from newSchema's structure;
    // no need to thread the exact per-field S type through struct<T> itself.
    extend: <E extends Record<string, Validator<unknown>>>(additionalFields: E, overrides: StructOptions = {}) => {
      const newSchema = {
        ...requireObjectSchema('extend'),
        ...additionalFields,
      };

      return struct(types.object(newSchema), { ...structOptions, ...overrides });
    },

    delete: (fieldsToDelete: string | string[], overrides: StructOptions = {}) => {
      const schema = requireObjectSchema('delete from');
      const toDelete = new Set(is.array(fieldsToDelete) ? fieldsToDelete : [fieldsToDelete]);
      const newSchema = Object.fromEntries(Object.entries(schema).filter(([key]) => !toDelete.has(key)));

      return struct(types.object(newSchema), { ...structOptions, ...overrides });
    },

    // No behavioral effect (nothing outside schema.ts reads .fields()) - lets
    // a .delete()/.extend()'d schema (which can only append at the end) match
    // a hand-written one's own field order. `order` must be an exact
    // permutation of the current keys - a typo must not silently drop a field.
    reorder: (order: string[]) => {
      const schema = requireObjectSchema('reorder');
      const currentKeys = Object.keys(schema);
      const sameSet = order.length === currentKeys.length && currentKeys.every((key) => order.includes(key));
      if (!sameSet) {
        throw new Error("reorder: given keys must be exactly the schema's own field set, no more, no less");
      }

      const newSchema = Object.fromEntries(order.map((key) => [key, schema[key]]));

      return struct(types.object(newSchema), structOptions);
    },

    fields: () => {
      return Object.keys(requireObjectSchema('get fields from'));
    },

    fieldDefault: (name: string) => {
      return getSchemaDefault(requireObjectSchema('get a field default from')[name]);
    },

    // Dot path ('watermark.type') walks the nested object's own _schema, the
    // same convention the editor's own field names use.
    fieldOptions: (name: string) => {
      type NestedValidator = Validator<unknown> & {
        _schema?: Record<string, NestedValidator>;
        _optionsSchema?: Record<string, NestedValidator>;
      };
      const [head, ...rest] = name.split('.');
      let current: NestedValidator | undefined = requireObjectSchema('get field options from')[head] as
        NestedValidator | undefined;
      for (const segment of rest) {
        const nested = current?._optionsSchema ?? current?._schema;
        if (!nested) return undefined;
        current = nested[segment];
      }
      return current ? getSchemaOptions(current) : undefined;
    },
  };
}

// Derives the negotiated config shape straight from a struct(), instead of
// hand-maintaining it as a separate brand-typed blob (see Config/RawConfig,
// types.ts) - Extract<..., {isValid: true}> picks validate()'s success
// branch of the discriminated union, ['config'] reads its T.
type Infer<S extends { validate: (data: Record<string, unknown>) => { isValid: boolean; config: unknown } }> = Extract<
  ReturnType<S['validate']>,
  { isValid: true }
>['config'];

export { isToggleDomainEntity, struct };
export type { Infer };
