/*
 * The YAML config validation layer: the struct/types primitives, and
 * YamlSchemaFactory - the per-card-type
 * (card/badge/template/badgeTemplate/feature) schema definitions built from
 * them.
 */

import { HA_CONTEXT, CARD, THEME, PERCENT_THEME_KEYS, SEV } from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { HassProviderSingleton } from '../utils/hass-provider.js';
import { NumberFormatter } from './formatting.js';

// A validation path is the sequence of object keys/array indices leading to
// the value being checked (e.g. ['bar_stack', 'entities', 0, 'entity']).
type Path = (string | number)[];
// Validators take arbitrary raw YAML (`unknown` in) and return the coerced
// value - generic so Config/RawConfig (types.ts) can be derived directly from
// YamlSchemaFactory instead of hand-maintained as a separate brand-typed
// blob (see Infer<> at the bottom of this file). T defaults to `unknown` so
// any call site not yet threading a real type still compiles.
type Validator<T = unknown> = (value: unknown, path?: Path) => T;

// The shape every numericEntityOrJinja()-typed field produces (min_value/
// max_value/watermark.low/.high/alert_when.above/.below) - flattened
// (entity/attribute/jinja all optional siblings on one object) rather than
// the discriminated union the validator itself actually checks, matching
// ViewCore._resolveValueConfig's own pre-existing parameter shape. Exported
// so consumers can read one sub-field without re-deriving the same
// union-narrowing check each time (see entityOf/attributeOf/jinjaOf below).
type ValueConfig = number | { entity?: string; attribute?: string; jinja?: string } | undefined;
const entityOf = (cfg: ValueConfig): string | undefined => (is.plainObject(cfg) ? (cfg.entity as string) : undefined);
const attributeOf = (cfg: ValueConfig): string | undefined =>
  is.plainObject(cfg) ? (cfg.attribute as string) : undefined;
const jinjaOf = (cfg: ValueConfig): string | undefined => (is.plainObject(cfg) ? (cfg.jinja as string) : undefined);

// watermark.low/.high's own shape (types.watermarkMark): false (hidden) |
// true | ValueConfig (value only) | { value, as, type, opacity, color }
// (per-mark override). mark*() reads through it the same way entityOf/etc.
// do above.
type WatermarkMarkOverride = {
  value?: ValueConfig;
  as?: string;
  type?: string;
  opacity?: number;
  color?: string;
};
type WatermarkMark = boolean | ValueConfig | WatermarkMarkOverride;
// Discriminates the override object from ValueConfig's own {entity,
// attribute,jinja} shape - both are plain objects, so this checks for the
// absence of ValueConfig's own keys rather than the presence of `value`:
// `{ color: 'white' }` alone (no `value`) is still an override, defaulting
// its threshold like `watermark: {}` itself always has.
const isMarkOverride = (mark: WatermarkMark): mark is WatermarkMarkOverride =>
  is.plainObject(mark) && !('entity' in mark) && !('jinja' in mark);
// Nests a flattened `{ entity, attribute, color }` under `value` - otherwise
// the union's bare-ValueConfig branch matches first and drops `color`.
const nestValueShapeUnderValue = (mark: unknown): unknown => {
  if (!is.plainObject(mark)) return mark;
  const { entity, attribute, jinja, ...rest } = mark as Record<string, unknown>;
  if ((entity === undefined && jinja === undefined) || Object.keys(rest).length === 0) return mark;
  return { ...rest, value: { ...(entity !== undefined ? { entity, attribute } : { jinja }) } };
};
const markShown = (mark: WatermarkMark): boolean => mark !== false;
const markValue = (mark: WatermarkMark, defaultValue: number): ValueConfig =>
  isMarkOverride(mark)
    ? ((mark.value as ValueConfig) ?? defaultValue)
    : is.boolean(mark)
      ? defaultValue
      : (mark as ValueConfig);
const markAs = (mark: WatermarkMark): 'auto' | 'percent' =>
  isMarkOverride(mark) ? ((mark.as as 'auto' | 'percent') ?? 'auto') : 'auto';
const markOpacity = (mark: WatermarkMark, fallback: number): number =>
  isMarkOverride(mark) && is.number(mark.opacity) ? mark.opacity : fallback;
const markType = (mark: WatermarkMark, fallback: string): string =>
  isMarkOverride(mark) && is.string(mark.type) ? mark.type : fallback;
const markColor = (mark: WatermarkMark, fallback?: string): string | undefined =>
  (isMarkOverride(mark) ? mark.color : undefined) ?? fallback;

// status_label: string (shorthand for { jinja }) | { jinja, position,
// color_source } - same idea as badge_icon/badge_color, already bare Jinja
// strings, applied here since real usage is 100% jinja-only in practice.
type StatusLabelObj = { jinja?: string; position?: string; color_source?: string };
const statusLabelObj = (sl: unknown): StatusLabelObj => (is.plainObject(sl) ? sl : is.string(sl) ? { jinja: sl } : {});
// Collapses back to the bare string once only `jinja` is left set.
const rewrapStatusLabel = (sl: unknown, patch: Partial<StatusLabelObj>): unknown => {
  const merged: StatusLabelObj = { ...statusLabelObj(sl), ...patch };
  const keys = (Object.keys(merged) as (keyof StatusLabelObj)[]).filter((k) => merged[k] !== undefined);
  return keys.length === 1 && keys[0] === 'jinja' ? merged.jinja : merged;
};

// The shape struct(...).parse()'s catch branch walks recursively (see
// extractAllErrors below) - covers both real ValidationError instances and
// the plain summary objects extractAllErrors itself returns.
type ErrorLike = { path: Path; errorCode: string | null; severity: string; errors?: ErrorLike[] };
type ErrorSummary = { path: Path; errorCode: string | null; severity: string };

/**
 * structural validation ideas to manage inputs (1.5+).
 * deliberately verbose by design: no external dependencies, fully typed errors,
 * and scales cleanly across multiple card types.
 *
 * @inspired by superstruct (MIT License) - Copyright (c) @ianstormtaylor
 * @see https://github.com/ianstormtaylor/superstruct
 */
class ValidationError extends Error {
  path: Path;
  errorCode: string | null;
  severity: string;
  partialConfig: unknown;
  errors: ErrorLike[];
  fallback: unknown;

  // 23 call sites, most passing only the first 2-3 via defaults.
  // eslint-disable-next-line max-params -- not worth an options object here.
  constructor(
    path: Path = [],
    errorCode: string | null = null,
    severity: string = SEV.error,
    fallback: unknown = null,
    partialConfig: unknown = null,
    allErrors: ErrorLike[] = [],
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
  <T>(typeCheck: (v: unknown) => v is T, errorCode: { code: string; severity: string }): Validator<T> =>
  (value: unknown, path: Path = []) => {
    if (is.nullish(value))
      throw new ValidationError(
        path,
        ERROR_CODES.missingRequiredProperty.code,
        ERROR_CODES.missingRequiredProperty.severity,
      );
    if (!typeCheck(value)) throw new ValidationError(path, errorCode.code, errorCode.severity);
    return value;
  };

// Was `Record<string, any>` (skipcq: JS-0323) - now that Validator<T> and
// each combinator below carry a real type, the registry infers its own
// shape; every types.xxx() call site gets the real return type for free.
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
      if (!is.array(value))
        throw new ValidationError(path, ERROR_CODES.invalidTypeArray.code, ERROR_CODES.invalidTypeArray.severity);

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
  object: <S extends Record<string, Validator<unknown>>>(
    schema: S,
  ): Validator<{ [K in keyof S]: S[K] extends Validator<infer T> ? Exclude<T, typeof SKIP_PROPERTY> : never }> & {
    _schema: S;
  } => {
    const validator = (value: unknown, path: Path = []) => {
      if (!is.plainObject(value)) {
        throw new ValidationError(path, ERROR_CODES.invalidTypeObject.code, ERROR_CODES.invalidTypeObject.severity);
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
    return validator as unknown as Validator<{
      [K in keyof S]: S[K] extends Validator<infer T> ? Exclude<T, typeof SKIP_PROPERTY> : never;
    }> & {
      _schema: S;
    };
  },

  // SKIP_PROPERTY here IS the field's own declared T | typeof SKIP_PROPERTY
  // - object()'s mapped type above reads through it via the `unknown` cast on
  // the sentinel check, not through this return type, so it stays simple.
  optional:
    <T>(validator: Validator<T>): Validator<T | undefined> =>
    (value: unknown, path: Path = []) => {
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
            error.severity = SEV.info;
            error.errorCode = ERROR_CODES.appliedDefaultValue.code;
          } else {
            error.severity = SEV.warning;
          }
          error.fallback = defaultVal;
        }
        throw error;
      }
    };
    return Object.assign(fn, { defaultValue: defaultVal });
  },

  optionalString: () => types.optional(types.string),
  optionalNumber: () => types.optional(types.number),
  optionalBoolean: () => types.optional(types.boolean),

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

  enums:
    <T extends readonly unknown[]>(allowedValues: T): Validator<T[number]> =>
    (value: unknown, path: Path = []) => {
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
      return value as T[number];
    },

  enumsWithDefault: <T extends readonly unknown[], D>(allowedValues: T, defaultVal: D) =>
    types.fallbackTo(types.enums(allowedValues), defaultVal),

  // resolved is always a member of allowedValues by the time it's returned
  // (the alias map only ever redirects to another allowed value, and the
  // includes() check below throws otherwise) - T[number], not string.
  theme:
    <T extends readonly string[]>(allowedValues: T): Validator<T[number]> =>
    (value: unknown, path: Path = []) => {
      if (is.nullish(value) || is.emptyString(value)) return SKIP_PROPERTY as unknown as T[number];
      if (!is.string(value))
        throw new ValidationError(path, ERROR_CODES.invalidTheme.code, ERROR_CODES.invalidTheme.severity);
      const themeMap: Record<string, string> = {
        battery: 'optimal_when_high',
        memory: 'optimal_when_low',
        cpu: 'optimal_when_low',
      };
      const resolved = (themeMap[value] || value) as T[number];
      if (!allowedValues.includes(resolved))
        throw new ValidationError(path, ERROR_CODES.invalidTheme.code, ERROR_CODES.invalidTheme.severity);
      return resolved;
    },

  // Variadic, not limited to two - tries each validator in order, returns
  // whichever succeeds first. T[number] extracts each validator's own type
  // out of the tuple, infer U captures its output type - the result is the
  // union of every possible shape, not a merge of all of them at once.
  union: <T extends Validator<unknown>[]>(
    ...validators: T
  ): Validator<T[number] extends Validator<infer U> ? U : never> =>
    ((value: unknown, path: Path = []) => {
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

      throw new ValidationError(path, ERROR_CODES.invalidUnionType.code, ERROR_CODES.invalidUnionType.severity);
    }) as Validator<T[number] extends Validator<infer U> ? U : never>,

  arrayWithValidatedElem:
    <T extends readonly unknown[]>(allowedValues: T): Validator<T[number][]> =>
    (value: unknown, _path: Path = []) => {
      if (is.nullish(value)) return SKIP_PROPERTY as unknown as T[number][];

      const valueArray = is.array(value) ? value : [value];
      const validItems = valueArray.filter((item: unknown) => allowedValues.includes(item)) as T[number][];

      if (validItems.length === 0) return SKIP_PROPERTY as unknown as T[number][];

      return validItems;
    },

  jinjaOrArrayWithValidatedElem:
    <T extends readonly unknown[]>(allowedValues: T): Validator<string | T[number][]> =>
    (value: unknown, path: Path = []) => {
      if (is.jinja(value)) return value;
      return types.arrayWithValidatedElem(allowedValues)(value, path);
    },

  // Same mapped-type shape as object() above (and the same SKIP_PROPERTY
  // caveat) - kept as its own combinator rather than delegating to object()
  // since it tolerates per-field failures (a malformed zone doesn't drop the
  // whole watermark, see the CF5 fix this behavior traces back to) instead
  // of object()'s all-or-nothing error bundling.
  watermarkObject: <S extends Record<string, Validator<unknown>>>(
    schema: S,
  ): Validator<{ [K in keyof S]: S[K] extends Validator<infer T> ? Exclude<T, typeof SKIP_PROPERTY> : never }> & {
    _schema: S;
  } => {
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
    return Object.assign(fn, { _schema: schema }) as Validator<{
      [K in keyof S]: S[K] extends Validator<infer T> ? Exclude<T, typeof SKIP_PROPERTY> : never;
    }> & { _schema: S };
  },

  entityId: ((value: unknown, path: Path = []) => {
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
  }) as Validator<string>,

  // Shared by min_value/max_value/watermark.low/.high: number (fixed) |
  // { entity, attribute } | { jinja } - explicit shape, not sniffing a
  // scalar. Exposed flattened, not as the discriminated union the validator
  // actually checks - matches ViewCore._resolveValueConfig's own shape,
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
    const match = is.string(value) ? value.match(/^(\d+(?:\.\d+)?)(s|min|h|d)$/) : null;
    if (!match)
      throw new ValidationError(path, ERROR_CODES.invalidTypeString.code, ERROR_CODES.invalidTypeString.severity);
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
            as: types.enumsWithDefault(['auto', 'percent'], 'auto'),
            type: types.optional(types.enums(['blended', 'area', 'striped', 'triangle', 'round', 'line'])),
            opacity: types.optionalNumber(),
            color: types.optionalString(),
          }),
        )(nestValueShapeUnderValue(value), path)) as Validator<WatermarkMark>,
      defaultValue,
    ),

  // peak_marker.min/.max/.average: absent (hidden) | true (shown, inherits
  // the top-level type/opacity) | a color string (shorthand) | { type,
  // opacity, color } to override just that mark.
  peakMark: () =>
    types.union(
      types.boolean,
      types.string,
      types.object({
        type: types.optional(types.enums(['line', 'round', 'triangle'])),
        opacity: types.optionalNumber(),
        color: types.optionalString(),
      }),
    ),

  // status_label: string (shorthand for { jinja }) | { jinja, position,
  // color_source } - see statusLabelObj/rewrapStatusLabel above.
  statusLabel: () =>
    types.optional(
      types.union(
        types.string,
        types.object({
          jinja: types.optionalString(),
          position: types.enumsWithDefault(['left', 'right'], 'right'),
          // Which color the pill follows when its own `jinja` doesn't return
          // an explicit `{label, color}` (see HACore._repaintStatusLabel) -
          // 'bar' by default (the theme zones that actually carry "status"
          // semantics live there), 'icon' for whoever colors the icon
          // specifically and wants the pill to match it instead.
          color_source: types.enumsWithDefault(['bar', 'icon'], 'bar'),
        }),
      ),
    ),

  // peak_marker: { window, type, opacity, min, max, average } (Card only).
  // _schema re-attached (types.optional doesn't forward it) so
  // getSchemaDefault can still reach type/opacity's own defaults.
  peakMarker: () => {
    const shape = types.object({
      window: types.duration,
      type: types.enumsWithDefault(['line', 'round', 'triangle'], 'line'),
      opacity: types.optionalNumberWithDefault(0.8),
      color: types.optionalString(),
      min: types.optional(types.peakMark()),
      max: types.optional(types.peakMark()),
      average: types.optional(types.peakMark()),
    });
    return Object.assign(types.optional(shape), { _schema: shape._schema });
  },

  decimal: ((value: unknown, path: Path = []) => {
    if (is.nullish(value)) return SKIP_PROPERTY;
    if (!is.unsignedInteger(value))
      throw new ValidationError(path, ERROR_CODES.invalidDecimal.code, ERROR_CODES.invalidDecimal.severity);

    return value;
  }) as Validator<number>,

  // Only `action: string` is actually validated - the different shapes
  // (call-service/navigate/more-info/toggle/none...) are never distinguished
  // here, so `{ action: string } & Record<string, unknown>` is the honest
  // output type, not a fully tagged union of every action kind.
  tapAction: ((value: unknown, path: Path = []) => {
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
        throw new ValidationError(
          [...path, invalidIndex],
          ERROR_CODES.invalidStateContentEntry.code,
          ERROR_CODES.invalidStateContentEntry.severity,
        );
      }
      return value;
    }

    throw new ValidationError(path, ERROR_CODES.invalidStateContent.code, ERROR_CODES.invalidStateContent.severity);
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
    }) as Validator<M[keyof M] extends Validator<infer T> ? T : never>,
};

// name: [{type:'text',text} | {type:'entity'} | {type:'device'} | {type:
// 'area'} | {type:'floor'}] - moved out of the types registry itself (not a
// reusable combinator, a one-off derived schema) so it doesn't need
// types.name to exist as a literal property on an object TS otherwise infers
// as closed/sealed once every entry lives in one literal.
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
});

const nameValidator = types.array(nameItem);

// Reads a field's real default off the live validator instead of a
// hand-maintained table - undefined where none exists by design (e.g.
// watermark's shared opacity/type/color, see watermarkSchema's own comment).
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

// eslint-disable-next-line sonarjs/max-lines-per-function -- fixed call chain.
function struct<T>(
  // skipcq: JS-0323 -- `_schema` is used for dynamic per-field introspection
  // elsewhere (extend()/config-helpers.ts/dom-helpers.ts read a field
  // validator by name and call it expecting its own specific return shape,
  // e.g. tap_action's `{action}` or center_zero's boolean) - `unknown` here
  // breaks every one of those call sites' property access; measured, not
  // guessed (see git history for this line).
  validator: Validator<T> & { _schema?: Record<string, Validator<any>> },
  { allowBelowBarPosition = true } = {},
) {
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
    const domain = HassProviderSingleton.getEntityDomain(result.entity);
    const shouldPatch = domain !== null && HA_CONTEXT.actions.toggleDomain.includes(domain);
    if (shouldPatch) result.icon_tap_action = HA_CONTEXT.actions.toggle;
  };

  // top/bottom force the bar to xsmall's thickness in CSS, but rainbow_full's
  // marker reads the bar_size class directly - a bigger bar_size stayed
  // sized for a thickness the bar never has. overlay/background's own marker
  // is already hardcoded regardless of bar_size (styles.ts's
  // .vertical.up-orientation.overlay rule), so it's simply dropped there.
  const applyBarSizeConflictRule = (result: Record<string, unknown>) => {
    const position = String(result.bar_position);
    if (position === 'top' || position === 'bottom') {
      result.bar_size = CARD.style.bar.sizeOptions.xsmall;
    } else if (position === 'overlay' || position === 'background') {
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
    const theme = THEME[result.theme as keyof typeof THEME];
    if (!theme || theme.percent !== false || !is.nonEmptyArray(theme.style)) return;
    // Cast: percent === false already rules out themes like `light`
    // (linear, no min/max per zone - split by index instead) at runtime,
    // but TS still unions every theme's own zone shape here since the
    // theme key isn't statically known.
    const maxes = (theme.style as { max?: unknown }[]).map((zone) => zone.max).filter(is.number);
    if (maxes.length) result.max_value = Math.max(...maxes);
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

  // compact_below only has a distinct effect on layout: horizontal - vertical
  // already stacks name/secondary_info narrowly. Falls back to 'default', not
  // 'below': the two are different bar placements that only look the same in
  // horizontal - defaulting to 'below' would swap in a placement never chosen.
  const applyCompactBelowRule = (result: Record<string, unknown>) => {
    if (result.bar_position === 'compact_below' && result.layout !== CARD.layout.orientations.horizontal.label) {
      result.bar_position = 'default';
    }
  };

  // status_label and trend_indicator both render in the same top-right
  // corner - status_label wins, since setting a whole Jinja template is a
  // more deliberate choice than a boolean toggle left over from before
  // status_label was configured.
  const applyLabelRule = (result: Record<string, unknown>) => {
    const jinja = statusLabelObj(result.status_label).jinja;
    if (is.nonEmptyString(jinja) && result.trend_indicator) result.trend_indicator = false;
  };

  const applyBarSingleLineRule = (result: Record<string, unknown>) => {
    if (result.bar_position !== 'overlay' && result.bar_single_line) result.bar_single_line = false;
  };

  // bar_max_width only affects .horizontal.small/.medium/.large - the other
  // bar_position values render through a separate container (never
  // .progress-container), and .horizontal.xlarge has no matching rule
  // either. By this point layout/bar_position/bar_size are already resolved
  // to final values, so this check can't be fooled by an unset field.
  const applyBarMaxWidthRule = (result: Record<string, unknown>) => {
    const barMaxWidthAllowed =
      result.layout === CARD.layout.orientations.horizontal.label &&
      result.bar_position === 'default' &&
      result.bar_size !== CARD.style.bar.sizeOptions.xlarge;
    if (result.bar_max_width && !barMaxWidthAllowed) result.bar_max_width = undefined;
  };

  // 'up' only has a visible effect in two combinations (see
  // HACore#_addBaseClasses's vertical-bar/horizontal-bar decision, and the
  // editor's own upAllowed/resetUpIfInvalid) - mirrored here so a raw
  // YAML/Jinja config that bypasses the editor doesn't keep a stored 'up'
  // that silently does nothing.
  const applyBarOrientationUpRule = (result: Record<string, unknown>) => {
    const upAllowed =
      (result.layout === CARD.layout.orientations.vertical.label && result.bar_position === 'overlay') ||
      result.bar_position === 'background';
    if (result.bar_orientation === 'up' && !upAllowed) result.bar_orientation = 'ltr';
  };

  // text_shadow only applies via .overlay or .background (see the CSS rule on
  // :is(.overlay, .background).text-shadow) - same reasoning as
  // bar_single_line above, just a different pair of valid positions.
  const applyTextShadowRule = (result: Record<string, unknown>) => {
    if (result.bar_position !== 'overlay' && result.bar_position !== 'background' && result.text_shadow) {
      result.text_shadow = false;
    }
  };

  // bar_color_mode (segment/rainbow) only has an effect with a theme or
  // custom_theme active (see ViewBase.colorGradient/themeDivergingGradient,
  // both of which return null without one regardless of mode) - mirrors the
  // editor's own bar_color_mode showIf. center_zero no longer disables it:
  // themeDivergingGradient reprojects the theme's zones onto each arm's own
  // slice of the min_value/max_value scale instead of the single-arm math
  // colorGradient uses.
  const applyBarColorModeRule = (result: Record<string, unknown>, hasTheme: boolean) => {
    if (result.bar_color_mode && result.bar_color_mode !== 'auto' && !hasTheme) {
      result.bar_color_mode = 'auto';
    }
  };

  // rainbow_full paints the whole track at once with a single moving marker
  // (.rainbow-full-bar in styles.ts) - generalizes to center_zero fine (each
  // arm gets its own gradient + a zero-centered marker formula). bar_stack's
  // per-entity segments have no single position for one marker, so that
  // combination falls back to plain 'rainbow' instead.
  const applyRainbowFullRule = (result: Record<string, unknown>) => {
    const hasStack = is.nonEmptyArray((result.bar_stack as { entities?: unknown[] } | undefined)?.entities);
    if (result.bar_color_mode === 'rainbow_full' && hasStack) {
      result.bar_color_mode = 'rainbow';
    }
  };

  // Neither rainbow_full (no global fill fraction, a marker instead) nor
  // bar_stack (one fraction per entity) has anything for cells to cut into.
  const applyBarSegmentsRule = (result: Record<string, unknown>) => {
    const hasStack = is.nonEmptyArray((result.bar_stack as { entities?: unknown[] } | undefined)?.entities);
    if (result.bar_segments && (result.bar_color_mode === 'rainbow_full' || hasStack)) {
      result.bar_segments = undefined;
    }
  };

  // interpolate needs the same active theme as bar_color_mode, and is only
  // meaningful alongside bar_color_mode: 'auto' (or unset) - mirrors the
  // editor's own interpolate showIf, and its onChange that already clears
  // interpolate interactively when bar_color_mode changes to non-auto.
  const applyInterpolateRule = (result: Record<string, unknown>, hasTheme: boolean) => {
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
  const applyReverseSecondaryInfoRowRule = (result: Record<string, unknown>) => {
    if (
      result.reverse_secondary_info_row &&
      !(result.layout === CARD.layout.orientations.horizontal.label && (result.bar_position ?? 'default') === 'default')
    ) {
      result.reverse_secondary_info_row = false;
    }
  };

  // density: 'compact' shrinks whichever layout is set: horizontal narrows
  // the column (minGridColumns), vertical has no narrow shape so
  // name/secondary_info are force-hidden instead (hasComponentHiddenFlag).
  // Either way bar_position must leave {default, below, compact_below},
  // which share a row with name/secondary_info and need the room back.
  const applyDensityRule = (result: Record<string, unknown>) => {
    if (result.density !== 'compact') return;
    if (!['top', 'bottom', 'background'].includes(result.bar_position as string)) {
      result.bar_position = 'top';
    }
    result.multiline = false;
  };

  // Same type in and out (T, not Record<string, unknown>) - every applyXxxRule
  // only ever writes a value already a member of that field's own declared
  // type (an enum-string field gets one of its own allowed literals, a
  // boolean field gets a boolean, never a different shape or a new key) -
  // verified by reading each rule, not assumed. The internal cast is just to
  // let the untyped applyXxxRule helpers (still Record<string, unknown>,
  // not worth re-typing individually for the same reason) read/write freely.
  const postProcess = (data: T): T => {
    const result = { ...data } as Record<string, unknown>;
    if (!result.layout) result.layout = CARD.layout.orientations.horizontal.label;

    applyDensityRule(result);
    applyBelowBarPositionRule(result);
    applyCompactBelowRule(result);
    applyLabelRule(result);
    applyBarSingleLineRule(result);
    applyBarMaxWidthRule(result);
    applyBarOrientationUpRule(result);
    applyTextShadowRule(result);

    const hasTheme = !is.nullish(result.theme) || is.nonEmptyArray(result.custom_theme);
    applyBarColorModeRule(result, hasTheme);
    applyRainbowFullRule(result);
    applyBarSegmentsRule(result);
    applyInterpolateRule(result, hasTheme);
    applyReverseSecondaryInfoRowRule(result);

    return result as T;
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
    extend: <E extends Record<string, Validator<unknown>>>(additionalFields: E) => {
      if (!validator._schema) {
        throw new Error('Can only extend object schemas created with types.object');
      }

      const newSchema = {
        ...validator._schema,
        ...additionalFields,
      };

      return struct(types.object(newSchema));
    },

    delete: (fieldsToDelete: string | string[]) => {
      if (!validator._schema) {
        throw new Error('Can only delete from object schemas created with types.object');
      }

      const toDelete = new Set(is.array(fieldsToDelete) ? fieldsToDelete : [fieldsToDelete]);
      const newSchema = Object.fromEntries(Object.entries(validator._schema).filter(([key]) => !toDelete.has(key)));

      return struct(types.object(newSchema));
    },

    fields: () => {
      if (!validator._schema) {
        throw new Error('Can only get fields from object schemas created with types.object');
      }
      return Object.keys(validator._schema);
    },

    fieldDefault: (name: string) => {
      if (!validator._schema) {
        throw new Error('Can only get a field default from object schemas created with types.object');
      }
      return getSchemaDefault(validator._schema[name]);
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
  // See types.watermarkMark: false (replaces disable_low/high) | value only |
  // { value, as, type, opacity, color }, omitted falling back to 20/80 so a
  // bare `watermark: {}` still shows both sides. type/opacity/color below
  // are each side's default until it overrides its own.
  low: types.watermarkMark(20),
  high: types.watermarkMark(80),
  // No *WithDefault here: staying genuinely absent (not pre-filled) lets the
  // editor tell "inert" apart from "still in use by one side" - real default
  // lives in SCHEMA_DEFAULTS.watermark (below) instead.
  opacity: types.optionalNumber(),
  color: types.optionalString(),
  type: types.optional(types.enums(['blended', 'area', 'striped', 'triangle', 'round', 'line'])),
  line_size: types.optionalStringWithDefault('1px'),
};

/**
 * Builds the per-card-type YAML schemas (`card`, `badge`, `feature`,
 * `template`, `badgeTemplate`) from the `types`/`struct` primitives above.
 * Each static getter returns a `struct(...)`-validated schema, consumed by a
 * ConfigHelper's `_yamlSchema` (see config-helpers.js) to validate and
 * normalize a raw config.
 */
const YamlSchemaFactory = {
  get feature() {
    return struct(
      types.object({
        // ─── Entity & Data ──────────────────────────────────────────────────
        // Optional, unlike every other variant: defaults to the parent Tile's
        // own entity at runtime (see EntityProgressFeatures's `set context`).
        entity: types.optional(types.entityId),
        attribute: types.optionalString(),
        // Explicit shape instead of type-sniffing a scalar (number vs entity-id
        // string vs jinja-looking string), symmetric with max_value: min_value:
        // 10 | {entity, attribute} | {jinja}.
        min_value: types.optional(types.numericEntityOrJinja()),
        // Explicit shape, mirrors min_value: max_value: 10 | {entity,
        // attribute} | {jinja}. The legacy bare entity-id string is rewritten
        // into the map form by _customizeConfig before this schema ever sees it
        // (single call site, see BaseConfigHelper.set config), so no string
        // form is needed here.
        max_value: types.fallbackTo(types.numericEntityOrJinja(), 100),

        // ─── Appearance ─────────────────────────────────────────────────────
        bar_color: types.optionalString(),
        // Unlike Card/Badge/Template, a Feature's row height is fixed
        // (--feature-height, see the .entity-progress-feature CSS rule) and
        // doesn't scale with bar_size - so 'small' (8px) looks lost inside a
        // 42px row. 'xlarge' matches --feature-height by construction.
        bar_size: types.enumsWithDefault(Object.values(CARD.style.bar.sizeOptions), 'xlarge'), //[('small', 'medium', 'large', 'xlarge')]
        // 'up' is excluded here (Card/Template only): every CSS rule for
        // up-orientation is scoped .vertical.up-orientation, and a Feature
        // never gets the .vertical class (no 'layout' option in this
        // schema) - it would validate but have zero visual effect.
        bar_orientation: types.enumsWithDefault(['ltr', 'rtl'], 'ltr'),
        bar_color_mode: types.enumsWithDefault(['auto', 'segment', 'rainbow', 'rainbow_full'], 'auto'),
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
        center_zero: types.centerZero(),

        // ─── Theme & Watermark ──────────────────────────────────────────────
        theme: types.theme(Object.keys(THEME)),
        custom_theme: types.fallbackTo(types.customTheme, SKIP_PROPERTY),
        interpolate: types.optionalBooleanWithDefault(false),
        watermark: types.watermarkObject(watermarkSchema),
        peak_marker: types.peakMarker(),

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
  },

  // eslint-disable-next-line sonarjs/max-lines-per-function -- flat field decl.
  get card() {
    return struct(
      types.object({
        // ─── Entity & Data ──────────────────────────────────────────────────
        entity: types.entityId,
        attribute: types.optionalString(),
        name: types.optional(nameValidator),
        decimal: types.decimal,
        unit: types.optionalString(),
        disable_unit: types.optionalBooleanWithDefault(false),
        unit_spacing: types.enumsWithDefault(Object.values(CARD.config.unit.unitSpacing), 'auto'), //['auto', 'space', 'no-space']
        unit_position: types.enumsWithDefault(['after', 'before'], 'after'),
        value_compact: types.optionalBooleanWithDefault(false),
        value_sign: types.optionalBooleanWithDefault(false),
        // Explicit shape instead of type-sniffing a scalar (number vs entity-id
        // string vs jinja-looking string), symmetric with max_value: min_value:
        // 10 | {entity, attribute} | {jinja}.
        min_value: types.optional(types.numericEntityOrJinja()),
        // Explicit shape, mirrors min_value: max_value: 10 | {entity,
        // attribute} | {jinja}. The legacy bare entity-id string is rewritten
        // into the map form by _customizeConfig before this schema ever sees it
        // (single call site, see BaseConfigHelper.set config), so no string
        // form is needed here.
        max_value: types.fallbackTo(types.numericEntityOrJinja(), 100),

        // ─── Appearance ─────────────────────────────────────────────────────
        icon: types.optionalString(),
        color: types.optionalString(),
        bar_color: types.optionalString(),
        bar_size: types.enumsWithDefault(Object.values(CARD.style.bar.sizeOptions), 'small'), //[('small', 'medium', 'large', 'xlarge')]
        bar_orientation: types.enumsWithDefault(Object.keys(CARD.style.dynamic.progressBar.orientation), 'ltr'), // ['ltr', 'rtl']
        bar_color_mode: types.enumsWithDefault(['auto', 'segment', 'rainbow', 'rainbow_full'], 'auto'),
        // Only engages outside center_zero with a well-formed positive range
        // (min > 0, max > min) — ProgressCalc.isLogScale falls back to linear
        // otherwise, so an invalid combination degrades quietly instead of
        // producing NaN.
        bar_scale: types.enumsWithDefault(['linear', 'log'], 'linear'),
        // [('radius', 'glass', 'gradient', 'shimmer')]
        bar_effect: types.jinjaOrArrayWithValidatedElem(
          Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label),
        ),
        bar_position: types.enumsWithDefault(
          ['default', 'below', 'compact_below', 'top', 'bottom', 'overlay', 'background'],
          'default',
        ),
        bar_single_line: types.optionalBooleanWithDefault(false),
        bar_max_width: types.optionalString(),
        bar_segments: types.optionalNumber(),
        // No forced default (unlike most enums here): like `theme`, an unset
        // value stays absent (SKIP_PROPERTY) instead of being normalized to
        // the literal 'none' - the editor's dropdown no longer offers 'none'
        // (removed from translations), so a stored 'none' would show as
        // unstyled fallback text. 'none' stays valid for existing YAML that
        // already wrote it; every consumer compares only real animation
        // names, so absent behaves identically to explicit 'none'.
        icon_animation: types.optional(
          types.enumOrJinjaTrigger([
            'none',
            'spin',
            'pulse',
            'bounce',
            'shake',
            'ping',
            'reveal',
            'washing_machine',
            'battery_charging',
          ]),
        ),
        layout: types.enumsWithDefault(
          Object.values(CARD.layout.orientations).map((e) => e.label),
          'horizontal',
        ), // [('horizontal', 'vertical')]
        // 'compact' forces layout: horizontal and bar_position into
        // {top, bottom, background} - see applyDensityRule for the full
        // rewrite/clear list this triggers.
        density: types.enumsWithDefault(['default', 'compact'], 'default'),
        min_width: types.optionalString(),
        height: types.optionalString(),
        frameless: types.optionalBooleanWithDefault(false),
        marginless: types.optionalBooleanWithDefault(false),
        reverse: types.optionalBooleanWithDefault(false),
        reverse_secondary_info_row: types.optionalBooleanWithDefault(false),
        force_circular_background: types.optionalBooleanWithDefault(false),
        center_zero: types.centerZero(),
        trend_indicator: types.trendIndicator(),
        peak_marker: types.peakMarker(),
        // jinja: Jinja-only, like name_info/custom_info - no separate enable
        // flag, a non-empty resolved value is the signal to show it.
        // Mutually exclusive with trend_indicator (see applyLabelRule): both
        // occupy the same top corner - position picks which side.
        status_label: types.statusLabel(),
        text_shadow: types.optionalBooleanWithDefault(false),

        // ─── Visibility & Content ───────────────────────────────────────────
        hide: types.jinjaOrArrayWithValidatedElem([
          'icon',
          'name',
          'value',
          'unit',
          'secondary_info',
          'progress_bar',
          'shape',
        ]),
        name_info: types.optionalString(),
        custom_info: types.optionalString(),
        // Badge/badgeTemplate opt out (see their own .delete(['multiline'])):
        // the row is too small for a second line there.
        multiline: types.optionalBooleanWithDefault(false),
        state_content: types.optional(types.fallbackTo(types.stateContent, SKIP_PROPERTY)),

        // ─── Badges ─────────────────────────────────────────────────────────
        badge_icon: types.optionalString(),
        badge_color: types.optionalString(),

        // ─── Theme & Watermark ──────────────────────────────────────────────
        theme: types.theme(Object.keys(THEME)),
        custom_theme: types.fallbackTo(types.customTheme, SKIP_PROPERTY),
        interpolate: types.optionalBooleanWithDefault(false),
        watermark: types.watermarkObject(watermarkSchema),
        alert_when: types.optional(
          types.object({
            // number (fixed) | { entity, attribute } | { jinja } - same
            // explicit shape as min_value/max_value/watermark.low/high (see
            // types.numericEntityOrJinja above), for the same reason: the
            // threshold can now come from another entity's state or a Jinja
            // template instead of only a fixed number.
            above: types.optional(types.numericEntityOrJinja()),
            below: types.optional(types.numericEntityOrJinja()),
            // Advanced mode: replaces above/below as the trigger (see
            // configuration.md#alert_when).
            jinja: types.optionalString(),
            color: types.optionalString(),
            // label: the status pill instead of tinting the whole card - only
            // shown while the alert is active, takes over the pill from a
            // plain `status_label:` Jinja if both are set (see
            // HACore._renderLabel's early-out). No visual effect on a Badge,
            // same as `status_label` itself (too small a scale).
            highlight: types.enumsWithDefault(['border', 'background', 'label'], 'border'),
            // Left genuinely optional (no forced default): the effective
            // default depends on `highlight` (border/label -> blink,
            // background -> static, both unchanged from pre-1.6 behavior)
            // and is resolved in CSS/ViewCore, not here - see .alert-active
            // in the stylesheet.
            animation: types.optional(types.enums(['static', 'blink', 'ping'])),
            // Plain string, not Jinja (unlike the card-level `status_label`):
            // the point here is a short, fixed word chosen once alongside
            // the threshold itself (e.g. "HIGH"), not a per-tick condition.
            label: types.optionalString(),
          }),
        ),

        // ─── Bar Stack ──────────────────────────────────────────────────────
        bar_stack: types.optional(
          types.object({
            mode: types.enumsWithDefault(['stacked', 'proportional', 'net'], 'stacked'),
            entities: types.optional(types.array(barStackEntity)),
          }),
        ),

        // ─── Actions ────────────────────────────────────────────────────────
        tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.moreInfo),
        hold_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        double_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_hold_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_double_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
      }),
    );
  },

  get badge() {
    return YamlSchemaFactory.card
      .delete([
        'bar_position',
        'badge_icon',
        'badge_color',
        'force_circular_background',
        'layout',
        // Meaningless without 'layout' (deleted above) - density's whole
        // point is forcing a specific layout/bar_position combination a
        // badge has neither of.
        'density',
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
        // status_label shares that same reasoning (its status pill is the
        // same corner element at the same scale) - alert_when.highlight:
        // 'label' stays a valid enum value there regardless (see its own
        // comment), just as inert as the plain option would be.
        'trend_indicator',
        // Same history-eligibility scope as trend_indicator - Card only.
        'peak_marker',
        'status_label',
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
        bar_size: types.enumsWithDefault(['xsmall', 'small', 'medium', 'large'], 'small'),
        // Re-declared without 'shape' - no force_circular_background here.
        hide: types.jinjaOrArrayWithValidatedElem(['icon', 'name', 'value', 'unit', 'secondary_info', 'progress_bar']),
      });
  },

  get template() {
    return struct(
      types.object({
        // ─── Entity & Data ──────────────────────────────────────────────────
        entity: types.optional(types.entityId),
        // Off by default: a now()/utcnow() countdown already gets a free
        // once-a-minute refresh from HA's render_template push (#127) - this
        // opts into a forced resubscribe every second instead, for a real
        // ticking MM:SS countdown. Not tied to `entity` being a timer - any
        // now()-based Jinja field benefits the same way, explicit opt-in
        // since the display is arbitrary Jinja text with no unit to key off.
        fast_refresh: types.optionalBooleanWithDefault(false),
        name: types.optionalString(),
        secondary: types.optionalString(),
        // badgeTemplate opts out (see its own .delete(['multiline'])): the row
        // is too small for a second line there.
        multiline: types.optionalBooleanWithDefault(false),
        percent: types.optionalString(),

        // ─── Appearance ─────────────────────────────────────────────────────
        icon: types.optionalString(),
        color: types.optionalString(),
        bar_color: types.optionalString(),
        // percent: true themes only - Template has no min_value/max_value to
        // project a real-value theme's zones onto (see ViewCore's own
        // #templateTheme/setTemplateThemeValue), it only ever has the
        // already-computed percent Jinja field above. Wins over color/
        // bar_color when both apply, same precedence as Card's own
        // ViewBase.iconColor (theme.iconColor || config.color).
        theme: types.theme(PERCENT_THEME_KEYS),
        // Same restriction as theme above (percent-only), and only has an
        // effect once theme is actually set - applyBarColorModeRule
        // (postProcess, shared across every type) already resets this back
        // to 'auto' otherwise, same safety net as Card. See ViewCore's own
        // templateThemeGradient/-DivergingGradient.
        bar_color_mode: types.enumsWithDefault(['auto', 'segment', 'rainbow', 'rainbow_full'], 'auto'),
        bar_size: types.enumsWithDefault(Object.values(CARD.style.bar.sizeOptions), 'small'), //[('small', 'medium', 'large', 'xlarge')]
        bar_orientation: types.enumsWithDefault(Object.keys(CARD.style.dynamic.progressBar.orientation), 'ltr'), // ['ltr', 'rtl']
        // [('radius', 'glass', 'gradient', 'shimmer')]
        bar_effect: types.jinjaOrArrayWithValidatedElem(
          Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label),
        ),
        bar_position: types.enumsWithDefault(
          ['default', 'below', 'compact_below', 'top', 'bottom', 'overlay', 'background'],
          'default',
        ),
        bar_single_line: types.optionalBooleanWithDefault(false),
        bar_max_width: types.optionalString(),
        bar_segments: types.optionalNumber(),
        // No forced default (unlike most enums here): like `theme`, an unset
        // value stays absent (SKIP_PROPERTY) instead of being normalized to
        // the literal 'none' - the editor's dropdown no longer offers 'none'
        // (removed from translations), so a stored 'none' would show as
        // unstyled fallback text. 'none' stays valid for existing YAML that
        // already wrote it; every consumer compares only real animation
        // names, so absent behaves identically to explicit 'none'.
        icon_animation: types.optional(
          types.enumOrJinjaTrigger([
            'none',
            'spin',
            'pulse',
            'bounce',
            'shake',
            'ping',
            'reveal',
            'washing_machine',
            'battery_charging',
          ]),
        ),
        layout: types.enumsWithDefault(
          Object.values(CARD.layout.orientations).map((e) => e.label),
          'horizontal',
        ), // [('horizontal', 'vertical')]
        // 'compact' forces layout: horizontal and bar_position into
        // {top, bottom, background} - see applyDensityRule for the full
        // rewrite/clear list this triggers.
        density: types.enumsWithDefault(['default', 'compact'], 'default'),
        min_width: types.optionalString(),
        height: types.optionalString(),
        frameless: types.optionalBooleanWithDefault(false),
        marginless: types.optionalBooleanWithDefault(false),
        reverse_secondary_info_row: types.optionalBooleanWithDefault(false),
        force_circular_background: types.optionalBooleanWithDefault(false),
        center_zero: types.centerZero(),
        trend_indicator: types.trendIndicator(),
        // jinja: Jinja-only, like name_info/custom_info - no separate enable
        // flag, a non-empty resolved value is the signal to show it.
        // Mutually exclusive with trend_indicator (see applyLabelRule): both
        // occupy the same top corner - position picks which side.
        status_label: types.statusLabel(),
        text_shadow: types.optionalBooleanWithDefault(false),

        hide: types.jinjaOrArrayWithValidatedElem(['icon', 'name', 'value', 'secondary_info', 'progress_bar', 'shape']),
        badge_icon: types.optionalString(),
        badge_color: types.optionalString(),
        watermark: types.watermarkObject(watermarkSchema),
        // Jinja-only - see configuration.md#alert_when.
        alert_when: types.optional(types.object({ jinja: types.optionalString() })),

        // ─── Actions ────────────────────────────────────────────────────────
        tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.moreInfo),
        hold_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        double_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_hold_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_double_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
      }),
    );
  },

  get badgeTemplate() {
    return YamlSchemaFactory.template
      .delete([
        'bar_position',
        'badge_icon',
        'badge_color',
        'force_circular_background',
        'layout',
        // Same reason as YamlSchemaFactory.badge: meaningless without
        // 'layout' (deleted above).
        'density',
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
        // a trend arrow icon to read well - status_label shares that
        // reasoning too (see YamlSchemaFactory.badge's own comment on
        // 'status_label').
        'trend_indicator',
        'status_label',
      ])
      .extend({
        // Same reason as YamlSchemaFactory.badge: 'up' needs .vertical.overlay,
        // neither of which a badge template ever gets.
        bar_orientation: types.enumsWithDefault(['ltr', 'rtl'], 'ltr'),
        // Same reason as YamlSchemaFactory.badge: 'xlarge' would demand a
        // 42px-tall progress-container inside a badge capped at
        // --ha-badge-size (36px), overflowing it.
        bar_size: types.enumsWithDefault(['xsmall', 'small', 'medium', 'large'], 'small'),
        // Re-declared without 'shape' - no force_circular_background here.
        hide: types.jinjaOrArrayWithValidatedElem(['icon', 'name', 'value', 'secondary_info', 'progress_bar']),
      });
  },
};

export type { Infer };
export type { ValueConfig };
export { entityOf, attributeOf, jinjaOf };
export { markShown, markValue, markAs, markType, markOpacity, markColor, isMarkOverride };
export { statusLabelObj, rewrapStatusLabel };
export type { WatermarkMark };
export { YamlSchemaFactory };

const ACTION_FIELDS = [
  'tap_action',
  'hold_action',
  'double_tap_action',
  'icon_tap_action',
  'icon_hold_action',
  'icon_double_tap_action',
] as const;

// Computed once at module load, straight off the live schema. opacity/type/
// window have no schema-level default by design (see watermarkSchema/
// peakMarker()/trendIndicator() above, staying absent lets the editor tell
// "inert" apart from "still in use") - written in by hand here instead.
const SCHEMA_DEFAULTS = {
  watermark: {
    ...(YamlSchemaFactory.card.fieldDefault('watermark') as { low: number; high: number; line_size: string }),
    opacity: 0.8,
    type: 'blended',
  },
  peakMarker: {
    ...(YamlSchemaFactory.card.fieldDefault('peak_marker') as { type: string; opacity: number }),
    window: '2h',
  },
  trendIndicator: {
    ...(YamlSchemaFactory.card.fieldDefault('trend_indicator') as { basis: string; threshold: number }),
    window: '2h',
  },
  actions: Object.fromEntries(
    ACTION_FIELDS.map((key) => [key, (YamlSchemaFactory.card.fieldDefault(key) as { action: string }).action]),
  ) as Record<string, string>,
};

export { SCHEMA_DEFAULTS };
