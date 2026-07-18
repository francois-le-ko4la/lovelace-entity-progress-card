/*
 * Predicate helpers (is.*, has.*) for runtime type/shape checks, used
 * throughout the card and editor instead of ad hoc typeof/instanceof.
 */

const is = {
  nullish: (val: unknown): val is null | undefined => val == null, // null or undefined
  boolean: (val: unknown): val is boolean => typeof val === 'boolean',
  string: (val: unknown): val is string => typeof val === 'string',
  emptyString: (val: unknown): val is string => typeof val === 'string' && val.trim() === '',
  nonEmptyString: (val: unknown): val is string => typeof val === 'string' && val.trim() !== '',
  nullishOrEmptyString: (val: unknown): val is null | undefined | string =>
    val == null || (typeof val === 'string' && val.trim() === ''),
  // lax: '42 W' → true (leading number is extracted by callers)
  numericString: (val: unknown): val is string =>
    typeof val === 'string' && val.trim() !== '' && !isNaN(parseFloat(val)),
  // CF5 - issue (minor) resolved - the lax variant accepts '42abc'; the strict
  // one rejects any string that is not entirely a finite number ('42abc',
  // 'Infinity', …)
  strictNumericString: (val: unknown): val is string =>
    typeof val === 'string' && val.trim() !== '' && Number.isFinite(Number(val)),
  number: (val: unknown): val is number => Number.isFinite(val),
  // CF5 - issue (minor) resolved - renamed from is.integer: the name hid the
  // val >= 0 constraint and invited misuse for signed integers
  unsignedInteger: (val: unknown): val is number => typeof val === 'number' && Number.isInteger(val) && val >= 0,
  func: (val: unknown): val is (...args: unknown[]) => unknown => typeof val === 'function',
  // typeof null === 'object' too - deliberately not narrowed to a type
  // predicate, it would incorrectly claim null is excluded.
  object: (val: unknown): boolean => typeof val === 'object',
  plainObject: (val: unknown): val is Record<string, unknown> =>
    typeof val === 'object' && val !== null && !Array.isArray(val),
  array: (val: unknown): val is unknown[] => Array.isArray(val),
  nonEmptyArray: (val: unknown): val is unknown[] => Array.isArray(val) && val.length > 0,
  nonEmptySet: (val: unknown): val is Set<unknown> => val instanceof Set && val.size > 0,
  jinja: (val: unknown): val is string => {
    if (typeof val !== 'string') return false;
    const jinjaPattern = /({{.*?}}|{#.*?#}|{%.+?%})/s;
    return jinjaPattern.test(val);
  },
};

const has = {
  own: (obj: object, key: PropertyKey): boolean => Object.hasOwn(obj, key),
  method: (obj: unknown, key: PropertyKey): boolean => typeof (obj as any)?.[key] === 'function',
  validKey: (obj: object, key: unknown): key is string => typeof key === 'string' && key !== '' && has.own(obj, key),
};

export { is };
export { has };
