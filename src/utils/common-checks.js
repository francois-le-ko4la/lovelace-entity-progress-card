/*
 * Predicate helpers (is.*, has.*) for runtime type/shape checks, used
 * throughout the card and editor instead of ad hoc typeof/instanceof.
 */

const is = {
  nullish: (val) => val == null, // null or undefined
  boolean: (val) => typeof val === 'boolean',
  string: (val) => typeof val === 'string',
  emptyString: (val) => typeof val === 'string' && val.trim() === '',
  nonEmptyString: (val) => typeof val === 'string' && val.trim() !== '',
  nullishOrEmptyString: (val) => val == null || (typeof val === 'string' && val.trim() === ''),
  // lax: '42 W' → true (leading number is extracted by callers)
  numericString: (val) => typeof val === 'string' && val.trim() !== '' && !isNaN(parseFloat(val)),
  // CF5 - issue (minor) resolved - the lax variant accepts '42abc'; the strict
  // one rejects any string that is not entirely a finite number ('42abc',
  // 'Infinity', …)
  strictNumericString: (val) => typeof val === 'string' && val.trim() !== '' && Number.isFinite(Number(val)),
  number: (val) => Number.isFinite(val),
  // CF5 - issue (minor) resolved - renamed from is.integer: the name hid the
  // val >= 0 constraint and invited misuse for signed integers
  unsignedInteger: (val) => typeof val === 'number' && Number.isInteger(val) && val >= 0,
  func: (val) => typeof val === 'function',
  object: (val) => typeof val === 'object',
  plainObject: (val) => typeof val === 'object' && val !== null && !Array.isArray(val),
  array: (val) => Array.isArray(val),
  nonEmptyArray: (val) => Array.isArray(val) && val.length > 0,
  nonEmptySet: (val) => val instanceof Set && val.size > 0,
  jinja: (val) => {
    if (typeof val !== 'string') return false;
    const jinjaPattern = /({{.*?}}|{#.*?#}|{%.+?%})/s;
    return jinjaPattern.test(val);
  },
};

const has = {
  own: (obj, key) => Object.hasOwn(obj, key),
  method: (obj, key) => typeof obj?.[key] === 'function',
  validKey: (obj, key) => typeof key === 'string' && key !== '' && has.own(obj, key),
};

export { is };
export { has };
