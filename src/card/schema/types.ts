import { SEV } from '../../utils/parameters.js';
import { is } from '../../utils/common-checks.js';
import { NumberFormatter } from '../formatting.js';
import { DURATION_RE } from '../../utils/duration.js';
import {
  validateType,
  ERROR_CODES,
  type Validator,
  SKIP_PROPERTY,
  type Path,
  invalid,
  type ObjectValidator,
  ValidationError,
  type ErrorLike,
  withOptions,
} from './errors.js';
import { THEME_ALIASES, MARK_TYPES, MARK_ZONE_TYPES, PEAK_WINDOW_DEFAULT } from './enums.js';
import { type ValueConfig, nestValueShapeUnderValue, type WatermarkMark } from './marks.js';

const types = {
  string: validateType(is.string, ERROR_CODES.invalidTypeString),
  number: validateType(is.number, ERROR_CODES.invalidTypeNumber),
  boolean: validateType(is.boolean, ERROR_CODES.invalidTypeBoolean),

  // SKIP_PROPERTY isn't threaded into T here (an item that skips is dropped,
  // not returned as SKIP_PROPERTY inside the array) - matches runtime
  // behavior, the array itself never contains the sentinel.
  array:
    <T>(itemValidator: Validator<T>): Validator<Exclude<T, typeof SKIP_PROPERTY>[]> =>
    (value: unknown, path: Path = []) => {
      if (!is.array(value)) throw invalid(path, ERROR_CODES.invalidTypeArray);

      const validItems: Exclude<T, typeof SKIP_PROPERTY>[] = [];
      value.forEach((item: unknown, index: number) => {
        const validatedItem = itemValidator(item, [...path, index]);
        if ((validatedItem as unknown) !== SKIP_PROPERTY) {
          validItems.push(validatedItem as Exclude<T, typeof SKIP_PROPERTY>);
        }
      });
      return validItems;
    },

  // Exclude<T, typeof SKIP_PROPERTY>: a skipped field is simply absent from
  // the result object at runtime, never stored as the sentinel - same fix
  // as array() above. Doesn't mark the key itself optional (a real
  // per-field-conditional mapped type is a step further TS makes awkward) -
  // every consumer already reads through `?.`/`??` regardless.
  object: <S extends Record<string, Validator<unknown>>>(schema: S): ObjectValidator<S> => {
    const validator = (value: unknown, path: Path = []) => {
      if (!is.plainObject(value)) {
        throw invalid(path, ERROR_CODES.invalidTypeObject);
      }

      const result: Record<string, unknown> = {};
      const errors: ValidationError[] = [];

      for (const [key, fieldValidator] of Object.entries(schema)) {
        try {
          const validatedValue = fieldValidator(value[key], [...path, key]);
          if ((validatedValue as unknown) !== SKIP_PROPERTY) {
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

    (validator as unknown as { _schema: S })._schema = schema;
    return validator as unknown as ObjectValidator<S>;
  },

  // SKIP_PROPERTY here IS the field's own declared T | typeof SKIP_PROPERTY
  // - object()'s mapped type above reads through it via the `unknown` cast on
  // the sentinel check, not through this return type, so it stays simple.
  optional: <T>(validator: Validator<T>): Validator<T | undefined> => {
    const fn = (value: unknown, path: Path = []) => {
      if (is.nullish(value)) return SKIP_PROPERTY as unknown as undefined;
      try {
        return validator(value, path);
      } catch (error) {
        // Downgrades every error object()/union() may have bundled in
        // .errors too, not just this one - a required leaf failing inside
        // an optional parent (e.g. peak_marker.window) must not fail the
        // whole card just because extractAllErrors walks .errors for its
        // own severity, ignoring the top error's already-downgraded one.
        const downgrade = (e: ErrorLike) => {
          e.severity = SEV.info;
          e.errors?.forEach(downgrade);
        };
        if (error instanceof ValidationError) downgrade(error);
        throw error;
      }
    };
    return withOptions(fn, validator);
  },

  // defaultValue is attached so a field's real default stays introspectable
  // (see getSchemaDefault below) instead of a hand-maintained table.
  fallbackTo: <T, D>(validator: Validator<T>, defaultVal: D): Validator<T | D> & { defaultValue: D } => {
    const fn = (value: unknown, path: Path = []) => {
      if (value === undefined) return defaultVal;
      try {
        return validator(value, path);
      } catch (error) {
        if (error instanceof ValidationError) {
          if (is.nullish(value)) {
            error.severity = ERROR_CODES.appliedDefaultValue.severity;
            error.errorCode = ERROR_CODES.appliedDefaultValue.code;
          } else {
            error.severity = SEV.warning;
          }
          error.fallback = defaultVal;
        }
        throw error;
      }
    };
    return withOptions(Object.assign(fn, { defaultValue: defaultVal }), validator);
  },

  optionalString: () => types.optional(types.string),
  optionalNumber: () => types.optional(types.number),

  // Exclude<T, undefined> - not just T | D - because the undefined branch of
  // the composed validator (types.optional(baseValidator)) is exactly the
  // one this combinator eliminates at runtime (defaultVal replaces it); a
  // bare T | D union would leave a field with a real default typed as
  // possibly undefined, which it never is.
  optionalWithDefault: <T, D>(baseValidator: Validator<T>, defaultVal: D) =>
    types.fallbackTo(types.optional(baseValidator), defaultVal) as Validator<Exclude<T, undefined> | D> & {
      defaultValue: D;
    },
  optionalStringWithDefault: (defaultVal: string) => types.optionalWithDefault(types.string, defaultVal),
  optionalNumberWithDefault: (defaultVal: number) => types.optionalWithDefault(types.number, defaultVal),
  optionalBooleanWithDefault: (defaultVal: boolean) => types.optionalWithDefault(types.boolean, defaultVal),

  enums: <T extends readonly unknown[]>(allowedValues: T): Validator<T[number]> => {
    const fn = (value: unknown, path: Path = []) => {
      if (is.nullish(value)) {
        throw invalid(path, ERROR_CODES.missingRequiredProperty);
      }
      if (!allowedValues.includes(value)) {
        throw invalid(path, ERROR_CODES.invalidEnumValue);
      }
      return value as T[number];
    };
    return Object.assign(fn, { allowedValues });
  },

  enumsWithDefault: <T extends readonly unknown[], D>(allowedValues: T, defaultVal: D) =>
    types.fallbackTo(types.enums(allowedValues), defaultVal),

  // resolved is always a member of allowedValues by the time it's returned
  // (the alias map only ever redirects to another allowed value, and the
  // includes() check below throws otherwise) - T[number], not string.
  theme: <T extends readonly string[]>(allowedValues: T): Validator<T[number]> => {
    const fn = (value: unknown, path: Path = []) => {
      if (is.nullish(value) || is.emptyString(value)) return SKIP_PROPERTY as unknown as T[number];
      if (!is.string(value)) throw invalid(path, ERROR_CODES.invalidTheme);
      const resolved = (THEME_ALIASES[value] || value) as T[number];
      if (!allowedValues.includes(resolved)) throw invalid(path, ERROR_CODES.invalidTheme);
      return resolved;
    };
    return Object.assign(fn, { allowedValues });
  },

  // Variadic, not limited to two - tries each validator in order, returns
  // whichever succeeds first. T[number] extracts each validator's own type
  // out of the tuple, infer U captures its output type - the result is the
  // union of every possible shape, not a merge of all of them at once.
  union: <T extends Validator<unknown>[]>(
    ...validators: T
  ): Validator<T[number] extends Validator<infer U> ? U : never> => {
    const fn = (value: unknown, path: Path = []) => {
      // Dead accumulator: collected for readability but not attached to the
      // thrown error below - kept as the string codes/messages it holds.
      const errors: (string | null)[] = [];

      for (const validator of validators) {
        try {
          return validator(value, path);
        } catch (error) {
          const err = error as ValidationError;
          errors.push(err.message || err.errorCode);
        }
      }

      // Same sentence as an enum refusal, and the user cannot tell the two
      // apart anyway: the value is not one of those this key accepts.
      throw invalid(path, ERROR_CODES.invalidEnumValue);
    };
    // First branch that carries a list wins: an enum|jinja union's options are
    // the enum branch's, the jinja branch has none of its own.
    const source = validators.find((v) => (v as { allowedValues?: readonly unknown[] }).allowedValues);
    return withOptions(fn as Validator<T[number] extends Validator<infer U> ? U : never>, source ?? {});
  },

  arrayWithValidatedElem: <T extends readonly unknown[]>(allowedValues: T): Validator<T[number][]> => {
    const fn = (value: unknown, _path: Path = []) => {
      if (is.nullish(value)) return SKIP_PROPERTY as unknown as T[number][];

      const valueArray = is.array(value) ? value : [value];
      const validItems = valueArray.filter((item: unknown) => allowedValues.includes(item)) as T[number][];

      if (validItems.length === 0) return SKIP_PROPERTY as unknown as T[number][];

      return validItems;
    };
    // Same as jinjaOrArrayWithValidatedElem below: fieldOptions() reads this
    // to build the editor list, so the array-only form has to carry it too.
    return Object.assign(fn, { allowedValues });
  },

  jinjaOrArrayWithValidatedElem: <T extends readonly unknown[]>(allowedValues: T): Validator<string | T[number][]> => {
    const fn = (value: unknown, path: Path = []) => {
      if (is.jinja(value)) return value;
      return types.arrayWithValidatedElem(allowedValues)(value, path);
    };
    return Object.assign(fn, { allowedValues });
  },

  // Same mapped-type shape as object() above (and the same SKIP_PROPERTY
  // caveat) - kept as its own combinator rather than delegating to object()
  // since it tolerates per-field failures (a malformed zone doesn't drop the
  // whole watermark, see the CF5 fix this behavior traces back to) instead
  // of object()'s all-or-nothing error bundling.
  watermarkObject: <S extends Record<string, Validator<unknown>>>(schema: S): ObjectValidator<S> => {
    const fn = (value: unknown, path: Path = []) => {
      if (is.nullish(value) || !is.plainObject(value)) return SKIP_PROPERTY;

      const validateEntry = (key: string, validator: Validator) => {
        try {
          return { key, value: validator(value[key], [...path, key]), error: null as ValidationError | null };
        } catch (error) {
          if (!(error instanceof ValidationError)) throw error;
          return { key, value: error.fallback ?? undefined, error };
        }
      };

      const results = Object.entries(schema).map(([key, validator]) => validateEntry(key, validator));
      const errors = results.map((r) => r.error).filter((e): e is ValidationError => e !== null);
      const result = Object.fromEntries(
        results.filter((r) => r.value !== SKIP_PROPERTY && r.value !== undefined).map((r) => [r.key, r.value]),
      );

      if (errors.length > 0) {
        throw new ValidationError(path, 'watermarkValidation', SEV.warning, result, null, errors);
      }

      return result;
    };
    return Object.assign(fn, { _schema: schema }) as ObjectValidator<S>;
  },

  entityId: ((value: unknown, path: Path = []) => {
    if (is.nullish(value)) throw invalid(path, ERROR_CODES.missingRequiredProperty);
    if (!is.string(value)) throw invalid(path, ERROR_CODES.invalidTypeString);
    if (!/^[a-z_]+\.[a-z0-9_]+$/.test(value)) throw invalid(path, ERROR_CODES.invalidEntityId);

    return value;
  }) as Validator<string>,

  // Shared by min_value/max_value/watermark.low/.high: number (fixed) |
  // { entity, attribute } | { jinja } - explicit shape, not sniffing a
  // scalar. Exposed flattened, not as the discriminated union the validator
  // actually checks - matches boundFrom's own shape,
  // which every consumer already reads through.
  numericEntityOrJinja: (): Validator<ValueConfig> =>
    types.union(
      types.number,
      types.object({ entity: types.entityId, attribute: types.optionalString() }),
      types.object({ jinja: types.string }),
    ) as Validator<ValueConfig>,

  // icon_animation: an enum name (today's behavior, gated by the automatic
  // entity-based detection - see HABase._iconAnimationStyle) | { effect,
  // jinja } - jinja is a boolean condition that decides whether `effect`
  // plays, overriding that automatic detection once it resolves. `effect` is
  // optional within the object form (no effect renders until one is chosen),
  // not required - same leniency as the rest of this schema.
  enumOrJinjaTrigger: <T extends readonly unknown[]>(allowedValues: T) =>
    types.union(
      types.enums(allowedValues),
      types.object({ effect: types.optional(types.enums(allowedValues)), jinja: types.string }),
    ),

  // Shared by feature/card/template: boolean (on/off) | { value,
  // growth_percent }.
  centerZero: () =>
    types.optionalWithDefault(
      types.union(
        types.boolean,
        types.object({
          value: types.optionalNumberWithDefault(0),
          growth_percent: types.optionalBooleanWithDefault(false),
        }),
      ),
      false,
    ),

  // trend_indicator.window: a suffixed duration string ('30s' | '5min' |
  // '2h' | '1d') - reuses NumberFormatter.durationToSeconds's own unit
  // vocabulary (formatting.ts) instead of a parallel parser, resolved to
  // seconds so every consumer works in one unit.
  duration: ((value: unknown, path: Path = []) => {
    const match = is.string(value) ? value.match(DURATION_RE) : null;
    if (!match) throw invalid(path, ERROR_CODES.invalidTypeString);
    return NumberFormatter.durationToSeconds(Number(match[1]), match[2]) as number;
  }) as Validator<number>,

  // trend_indicator: boolean | { window, basis, threshold, colored,
  // up_color, down_color, flat_color } (see TrendTracker).
  // _schema re-attached from the object branch (types.union/optionalWithDefault
  // don't forward it) so getSchemaDefault can still reach basis/threshold's
  // own defaults through the top-level boolean|object union.
  trendIndicator: () => {
    const objectForm = types.object({
      window: types.optional(types.duration),
      basis: types.enumsWithDefault(['average', 'edge', 'slope'], 'average'),
      threshold: types.optionalNumberWithDefault(0),
      colored: types.optionalBooleanWithDefault(false),
      up_color: types.optionalString(),
      down_color: types.optionalString(),
      flat_color: types.optionalString(),
    });
    return Object.assign(types.optionalWithDefault(types.union(types.boolean, objectForm), false), {
      _schema: objectForm._schema,
    });
  },

  // watermark.low/.high: false (hidden) | number|{entity,attribute}|{jinja}
  // (value only) | { value, as, type, opacity, color } (per-mark override,
  // each falling back to watermark's own shared type/opacity/color) - unlike
  // peakMark, the value itself is always user-supplied here, so there's no
  // bare-color shorthand. `as` mirrors the old low_as/high_as.
  watermarkMark: (defaultValue: number) =>
    types.optionalWithDefault(
      ((value: unknown, path: Path = []) =>
        types.union(
          types.boolean,
          types.numericEntityOrJinja(),
          types.object({
            value: types.optional(types.numericEntityOrJinja()),
            as: types.optional(types.enums(['auto', 'percent'])),
            ...types.markAppearance(),
          }),
        )(nestValueShapeUnderValue(value), path)) as Validator<WatermarkMark>,
      defaultValue,
    ),

  // peak_marker.min/.max/.average: absent (hidden) | true (shown, inherits
  // the top-level type/opacity) | a color string (shorthand) | { type,
  // opacity, color, line_size } to override just that mark.
  peakMark: () => types.union(types.boolean, types.string, types.object(types.markAppearance())),

  // What a mark can look like, whichever family it belongs to - the fields a
  // watermark override and a peak mark override share.
  markAppearance: () => ({
    type: types.optional(types.enums(MARK_TYPES)),
    opacity: types.optionalNumber(),
    color: types.optionalString(),
    line_size: types.optionalString(),
  }),

  // peak_marker.range: the band between min and max - the span the value
  // actually travelled over the window. A point shape would mean nothing for
  // it, so it takes the zone list; its value is the other two marks' own
  // positions, so it carries none.
  peakZone: () => {
    const shape = types.object({
      type: types.optional(types.enums(MARK_ZONE_TYPES)),
      opacity: types.optionalNumber(),
      color: types.optionalString(),
    });
    // _schema exposed like peakMarker's own: it is what lets the editor read
    // this mark's allowed types off the live validator (schemaOptions).
    return Object.assign(types.union(types.boolean, types.string, shape), { _schema: shape._schema });
  },

  // status_label: string (shorthand for { jinja }) | { jinja, position,
  // color_source } - see statusLabelObj/rewrapStatusLabel above.
  statusLabel: () => {
    const shape = types.object({
      jinja: types.optionalString(),
      position: types.enumsWithDefault(['left', 'right'], 'right'),
      // Which color the pill follows when its own `jinja` returns no explicit
      // one (see HACore._repaintStatusLabel) - the bar carries the theme zones.
      color_source: types.enumsWithDefault(['bar', 'icon'], 'bar'),
    });
    // _schema exposed like peakZone's: it is what lets the editor read these
    // two enums off the live validator instead of restating them.
    return Object.assign(types.optional(types.union(types.string, shape)), { _schema: shape._schema });
  },

  // peak_marker: { window, type, opacity, min, max, average } (Card only).
  // _schema re-attached (types.optional doesn't forward it) so
  // getSchemaDefault can still reach type/opacity's own defaults.
  peakMarker: () => {
    const shape = types.object({
      // Defaulted, not required: a peak_marker with no window used to drop the
      // whole block, so the card silently drew no mark at all.
      window: types.optionalWithDefault(types.duration, types.duration(PEAK_WINDOW_DEFAULT)),
      type: types.enumsWithDefault(MARK_TYPES, 'line'),
      opacity: types.optionalNumberWithDefault(0.8),
      color: types.optionalString(),
      // Its own, no longer borrowed from watermark's - a peak mark drawn as a
      // line used to read watermark.line_size through the shared .wm-line
      // rule, whatever the two had to do with each other.
      line_size: types.optionalStringWithDefault('1px'),
      min: types.optional(types.peakMark()),
      max: types.optional(types.peakMark()),
      average: types.optional(types.peakMark()),
      range: types.optional(types.peakZone()),
    });
    return Object.assign(types.optional(shape), { _schema: shape._schema });
  },

  decimal: ((value: unknown, path: Path = []) => {
    if (is.nullish(value)) return SKIP_PROPERTY;
    if (!is.unsignedInteger(value)) throw invalid(path, ERROR_CODES.invalidTypePositiveInteger);

    return value;
  }) as Validator<number>,

  // Only `action: string` is actually validated - the different shapes
  // (call-service/navigate/more-info/toggle/none...) are never distinguished
  // here, so `{ action: string } & Record<string, unknown>` is the honest
  // output type, not a fully tagged union of every action kind.
  tapAction: ((value: unknown, path: Path = []) => {
    if (!is.plainObject(value)) {
      throw invalid(path, ERROR_CODES.invalidActionObject);
    }
    if (!is.string(value.action)) {
      throw invalid([...path, 'action'], ERROR_CODES.missingRequiredProperty);
    }

    return value;
  }) as Validator<{ action: string } & Record<string, unknown>>,

  tapActionWithDefault: <D>(defaultVal: D) => types.fallbackTo(types.tapAction, defaultVal),

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
  customTheme: ((value: unknown, _path: Path = []) => {
    if (is.nullish(value)) return SKIP_PROPERTY;
    if (!is.array(value)) return SKIP_PROPERTY;

    type Zone = {
      min: number;
      max: number;
      color?: unknown;
      icon_color?: unknown;
      bar_color?: unknown;
      icon?: unknown;
    };
    const validItems = value
      .filter(
        (item): item is Zone =>
          is.plainObject(item) && is.number(item.min) && is.number(item.max) && item.min < item.max,
      )
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
  }) as Validator<
    { min: number; max: number; color?: string; icon_color?: string; bar_color?: string; icon?: string }[]
  >,

  stateContent: ((value: unknown, path: Path = []) => {
    if (is.nullishOrEmptyString(value)) return SKIP_PROPERTY;
    if (is.string(value)) return [value];

    if (is.array(value)) {
      const invalidIndex = value.findIndex((v: unknown) => !is.string(v));
      if (invalidIndex !== -1) {
        throw invalid([...path, invalidIndex], ERROR_CODES.invalidStateContent);
      }
      return value;
    }

    throw invalid(path, ERROR_CODES.invalidStateContent);
  }) as Validator<string[]>,

  // Discriminated on `key` (usually 'type') - picks the one validator in
  // `mapping` whose entry matches the discriminator's value. M[keyof M]
  // extracts every possible validator in the mapping, infer T its output -
  // the result is the union of every shape, same idea as union() above but
  // keyed instead of tried-in-order.
  discriminatedUnion: <M extends Record<string, Validator<unknown>>>(
    key: string,
    mapping: M,
  ): Validator<M[keyof M] extends Validator<infer T> ? T : never> =>
    ((value: unknown, path: Path = []) => {
      if (!is.plainObject(value)) {
        throw invalid(path, ERROR_CODES.invalidTypeObject);
      }

      const discriminator = value[key];

      if (!is.string(discriminator)) {
        throw invalid([...path, key], ERROR_CODES.invalidTypeString);
      }

      const validator = mapping[discriminator];

      if (!validator) {
        throw invalid([...path, key], ERROR_CODES.invalidEnumValue);
      }

      return validator(value, path);
    }) as Validator<M[keyof M] extends Validator<infer T> ? T : never>,
};

// name: [{type:'text',text} | {type:'entity'} | {type:'device'} | {type:
// 'area'} | {type:'floor'}] - moved out of the types registry itself (not a
// reusable combinator, a one-off derived schema) so it doesn't need
// types.name to exist as a literal property on an object TS otherwise infers
// as closed/sealed once every entry lives in one literal.
// EntityHelper._nameResolver is keyed off this too: a token added here with
// no resolver there is a compile error, not a silently dropped part of a name.
type NameTokenType = 'text' | 'entity' | 'device' | 'area' | 'floor';

const nameItem = types.discriminatedUnion('type', {
  text: types.object({
    type: types.enums(['text'] as const),
    text: types.string,
  }),

  entity: types.object({
    type: types.enums(['entity'] as const),
  }),

  device: types.object({
    type: types.enums(['device'] as const),
  }),

  area: types.object({
    type: types.enums(['area'] as const),
  }),

  floor: types.object({
    type: types.enums(['floor'] as const),
  }),
} satisfies Record<NameTokenType, unknown>);

const nameValidator = types.array(nameItem);

// true: the rows of one Multi; a name: every card carrying it. Read by core.ts
// wherever text sits beside the bar (HAS_EFFECT.barAligned).
const barAligned = (defaultVal: boolean) =>
  types.optionalWithDefault(types.union(types.boolean, types.string), defaultVal);

export { types, nameValidator, barAligned };
export type { NameTokenType };
