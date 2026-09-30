/*
 * Predicate helpers (is.*, has.*) for runtime type/shape checks, used
 * throughout the card and editor instead of ad hoc typeof/instanceof.
 */

import { IN_SUPPORTED_MATRIX } from './browser-support.js';

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
  // Object.hasOwn (Chrome/Edge 93) - see IN_SUPPORTED_MATRIX (browser-support).
  own: (obj: object, key: PropertyKey): boolean =>
    IN_SUPPORTED_MATRIX ? Object.hasOwn(obj, key) : Object.prototype.hasOwnProperty.call(obj, key),
  method: (obj: unknown, key: PropertyKey): boolean =>
    typeof (obj as Record<PropertyKey, unknown>)?.[key] === 'function',
  validKey: (obj: object, key: unknown): key is string => typeof key === 'string' && key !== '' && has.own(obj, key),
};

// A Jinja push returns a native number or a numeric string; anything else has
// no numeric meaning here - null, never NaN, so callers can skip instead.
const toNumberOrNull = (value: unknown): number | null =>
  is.number(value) ? value : is.strictNumericString(value) ? Number(value) : null;

// The lookup-or-build every cache goes through, Map and WeakMap alike.
const getOrCreate = <K, V>(
  cache: { get(key: K): V | undefined; set(key: K, value: V): unknown },
  key: K,
  create: () => V,
): V => {
  let value = cache.get(key);
  if (value === undefined) {
    value = create();
    cache.set(key, value);
  }
  return value;
};

// Runtime guard for a value that's non-null by construction/lifecycle (a ref
// set once at connect/init time, a lookup keyed by something the caller just
// registered) but not provable to the type checker. Throws instead of masking
// a broken invariant with a silent `undefined`, the way a non-null assertion
// (`x!`) would.
function assertDefined<T>(value: T | null | undefined, message: string): T {
  if (value == null) throw new Error(message);
  return value;
}

const END_RAW = /\{%[-+]?\s*endraw\s*[-+]?%\}/;
const NOT_FOUND = -1;

// Scans one {{ }} or {% %} tag from just after its opener. String literals hide
// delimiters from the scan, so "{{ '}}' " reads as unclosed, which it is.
// Returns the index just past the closer, plus the tag body, or null.
function scanTag(value: string, from: number, closer: string): { next: number; body: string } | null {
  let i = from;
  let quote: string | null = null;
  while (i < value.length) {
    const char = value[i];
    if (quote) {
      if (char === '\\') i += 2;
      else {
        if (char === quote) quote = null;
        i++;
      }
    } else if (char === '"' || char === "'") {
      quote = char;
      i++;
    } else if (char === closer[0] && value[i + 1] === closer[1]) {
      // [-+]: both whitespace-control markers, so {%+ raw %} stays raw.
      return {
        next: i + 2,
        body: value
          .slice(from, i)
          .replace(/^[-+]|[-+]$/g, '')
          .trim(),
      };
    } else i++;
  }
  return null;
}

// {% raw %} makes everything up to {% endraw %} literal, delimiters included.
function skipRaw(value: string, from: number): number {
  const rest = value.slice(from);
  const at = rest.search(END_RAW);
  if (at === NOT_FOUND) return NOT_FOUND;
  return from + at + (rest.slice(at).match(END_RAW) as RegExpMatchArray)[0].length;
}

// Advances past one construct ({{ }}, {% %} or {# #}) opened at `from`.
// NOT_FOUND when it is never closed.
function skipConstruct(value: string, from: number, kind: string): number {
  if (kind === '#') {
    const end = value.indexOf('#}', from + 2);
    return end === NOT_FOUND ? NOT_FOUND : end + 2;
  }
  const tag = scanTag(value, from + 2, kind === '{' ? '}}' : '%}');
  if (!tag) return NOT_FOUND;
  return kind === '%' && tag.body === 'raw' ? skipRaw(value, tag.next) : tag.next;
}

// A regex can't judge Jinja's delimiters: it can't tell "{{ '}}' " (unclosed)
// from a closed tag, nor spot "{{ a }} {{ b". This walks the string once.
// Delimiters only - HA stays the authority on syntax; this just skips a round
// trip certain to fail (HACore._subscribeToTemplate).
function jinjaKind(value: unknown): 'none' | 'valid' | 'malformed' {
  if (typeof value !== 'string') return 'none';
  let i = 0;
  let sawOpener = false;
  while (i < value.length) {
    const kind = value[i] === '{' ? value[i + 1] : undefined;
    if (kind !== '{' && kind !== '%' && kind !== '#') {
      i++;
      continue;
    }
    sawOpener = true;
    i = skipConstruct(value, i, kind);
    if (i === NOT_FOUND) return 'malformed';
  }
  return sawOpener ? 'valid' : 'none';
}

export { is };
export { has };
export { toNumberOrNull, getOrCreate };
export { assertDefined };
export { jinjaKind };
