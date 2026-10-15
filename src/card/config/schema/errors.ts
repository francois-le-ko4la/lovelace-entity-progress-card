import { SEV } from '../../../utils/parameters.js';
import { is } from '../../../utils/common-checks.js';

// A validation path is the sequence of object keys/array indices leading to
// the value being checked (e.g. ['bar_stack', 'entities', 0, 'entity']).
type Path = (string | number)[];

// Validators take arbitrary raw YAML (`unknown` in) and return the coerced
// value - generic so Config/RawConfig (types.ts) can be derived directly from
// YamlSchemaFactory instead of hand-maintained as a separate brand-typed
// blob (see Infer<> at the bottom of this file). T defaults to `unknown` so
// any call site not yet threading a real type still compiles.
type Validator<T = unknown> = (value: unknown, path?: Path) => T;

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

// What object()/watermarkObject() return: the validated shape of their field
// map, plus the _schema handle every introspection helper below reads.
// Exclude<T, SKIP_PROPERTY>: a skipped field is absent from the result at
// runtime, never stored as the sentinel.
type ObjectValidator<S extends Record<string, Validator<unknown>>> = Validator<{
  [K in keyof S]: S[K] extends Validator<infer T> ? Exclude<T, typeof SKIP_PROPERTY> : never;
}> & { _schema: S };

// An ERROR_CODES entry already pairs a code with its severity - callers name
// the entry instead of re-opening the pair at each throw site.
const invalid = (path: Path, entry: { code: string; severity: string }) =>
  new ValidationError(path, entry.code, entry.severity);

const ERROR_CODES = {
  missingRequiredProperty: { code: 'missingRequiredProperty', severity: SEV.error },
  invalidTypeString: { code: 'invalidTypeString', severity: SEV.error },
  invalidTypeNumber: { code: 'invalidTypeNumber', severity: SEV.error },
  invalidTypeBoolean: { code: 'invalidTypeBoolean', severity: SEV.error },
  invalidTypeArray: { code: 'invalidTypeArray', severity: SEV.error },
  invalidTypeObject: { code: 'invalidTypeObject', severity: SEV.error },
  invalidEnumValue: { code: 'invalidEnumValue', severity: SEV.error },
  invalidEntityId: { code: 'invalidEntityId', severity: SEV.error },
  // Read through invalidType's template (HassProviderSingleton#getMessage):
  // the suffix names the word under card.msg.words.types.
  invalidTypePositiveInteger: { code: 'invalidTypePositiveInteger', severity: SEV.error },
  invalidActionObject: { code: 'invalidActionObject', severity: SEV.error },
  invalidTheme: { code: 'invalidTheme', severity: SEV.info },
  invalidStateContent: { code: 'invalidStateContent', severity: SEV.error },
  appliedDefaultValue: { code: 'appliedDefaultValue', severity: SEV.info },
};

const validateType =
  <T>(typeCheck: (v: unknown) => v is T, errorCode: { code: string; severity: string }): Validator<T> =>
  (value: unknown, path: Path = []) => {
    if (is.nullish(value)) throw invalid(path, ERROR_CODES.missingRequiredProperty);
    if (!typeCheck(value)) throw invalid(path, errorCode);
    return value;
  };

// Was `Record<string, any>` (skipcq: JS-0323) - now that Validator<T> and
// each combinator below carry a real type, the registry infers its own
// shape; every types.xxx() call site gets the real return type for free.
type OptionCarrier = {
  allowedValues?: readonly unknown[];
  _schema?: Record<string, unknown>;
  _optionsSchema?: Record<string, unknown>;
};

// Carries a wrapped validator's allowed values onto its wrapper, the same
// reason _schema/defaultValue get re-attached: getSchemaOptions must reach
// them through optional()/fallbackTo()/union().
const withOptions = <F>(wrapper: F, source: unknown): F => {
  const src = source as OptionCarrier;
  const patch: OptionCarrier = {};
  if (src.allowedValues) patch.allowedValues = src.allowedValues;
  // An options-only view of the children. _schema itself is deliberately NOT
  // forwarded: getSchemaDefault reads it, and widening its reach turns absent
  // defaults into real ones (measured: alert_when, bar_stack).
  const children = src._optionsSchema ?? src._schema;
  if (children) patch._optionsSchema = children;
  return Object.keys(patch).length > 0 ? (Object.assign(wrapper as object, patch) as F) : wrapper;
};

export { ValidationError, SKIP_PROPERTY, invalid, ERROR_CODES, validateType, withOptions };
export type { Path, Validator, ErrorLike, ErrorSummary, ObjectValidator };
