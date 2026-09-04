import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { is, has, assertDefined, jinjaKind } from '../../src/utils/common-checks.js';

describe('is.nullish / emptyString / nonEmptyString / nullishOrEmptyString - drawing the line consistently', () => {
  test('nullish is true only for null/undefined, never for an empty string or 0', () => {
    const notSet = undefined;
    assert.equal(is.nullish(null), true);
    assert.equal(is.nullish(notSet), true);
    assert.equal(is.nullish(''), false);
    assert.equal(is.nullish(0), false);
  });

  test('emptyString/nonEmptyString trim before deciding - whitespace-only counts as empty', () => {
    assert.equal(is.emptyString(''), true);
    assert.equal(is.emptyString('   '), true);
    assert.equal(is.emptyString('x'), false);
    assert.equal(is.nonEmptyString('x'), true);
    assert.equal(is.nonEmptyString('   '), false);
    assert.equal(is.nonEmptyString(42), false, 'a number is never a string, even a numeric one');
  });

  test('nullishOrEmptyString covers both null/undefined and blank strings, nothing else', () => {
    assert.equal(is.nullishOrEmptyString(null), true);
    assert.equal(is.nullishOrEmptyString('  '), true);
    assert.equal(is.nullishOrEmptyString('x'), false);
    assert.equal(is.nullishOrEmptyString(0), false);
  });
});

describe('is.numericString vs strictNumericString - lax vs exact', () => {
  test('numericString accepts a leading number followed by garbage (unit strings)', () => {
    assert.equal(is.numericString('42 W'), true);
    assert.equal(is.numericString('42'), true);
    assert.equal(is.numericString('abc'), false);
    assert.equal(is.numericString(''), false);
  });

  test('strictNumericString rejects anything after the number, and non-finite words', () => {
    assert.equal(is.strictNumericString('42'), true);
    assert.equal(is.strictNumericString('42abc'), false);
    assert.equal(is.strictNumericString('Infinity'), false);
    assert.equal(is.strictNumericString('  '), false);
  });
});

describe('is.number / unsignedInteger', () => {
  test('number accepts any finite number, rejects NaN/Infinity and numeric strings', () => {
    assert.equal(is.number(42), true);
    assert.equal(is.number(-3.5), true);
    assert.equal(is.number(NaN), false);
    assert.equal(is.number(Infinity), false);
    assert.equal(is.number('42'), false);
  });

  test('unsignedInteger additionally requires a whole, non-negative number', () => {
    assert.equal(is.unsignedInteger(0), true);
    assert.equal(is.unsignedInteger(3), true);
    assert.equal(is.unsignedInteger(-1), false);
    assert.equal(is.unsignedInteger(1.5), false);
  });
});

describe('is.object / plainObject / array - typeof null !== a foot-gun here', () => {
  test('object is true for null and arrays too - it is a raw typeof check, not narrowed', () => {
    assert.equal(is.object({}), true);
    assert.equal(is.object(null), true);
    assert.equal(is.object([]), true);
  });

  test('plainObject excludes both null and arrays', () => {
    assert.equal(is.plainObject({}), true);
    assert.equal(is.plainObject(null), false);
    assert.equal(is.plainObject([]), false);
  });

  test('array/nonEmptyArray distinguish an empty array from a populated one', () => {
    assert.equal(is.array([]), true);
    assert.equal(is.nonEmptyArray([]), false);
    assert.equal(is.nonEmptyArray([1]), true);
    assert.equal(is.array({}), false);
  });

  test('nonEmptySet mirrors nonEmptyArray for a Set', () => {
    assert.equal(is.nonEmptySet(new Set()), false);
    assert.equal(is.nonEmptySet(new Set([1])), true);
    assert.equal(is.nonEmptySet([1]), false, 'a real array is not a Set');
  });
});

describe('is.jinja - detects {{ }}/{% %}/{# #} anywhere in a string', () => {
  test('matches each of the three Jinja delimiter pairs', () => {
    assert.equal(is.jinja('{{ states("sensor.x") }}'), true);
    assert.equal(is.jinja('{% if true %}yes{% endif %}'), true);
    assert.equal(is.jinja('{# a comment #}'), true);
  });

  test('a plain string or non-string value is never Jinja', () => {
    assert.equal(is.jinja('just text'), false);
    assert.equal(is.jinja(42), false);
    assert.equal(is.jinja(null), false);
  });

  test('matches even when the template is only part of a longer string', () => {
    assert.equal(is.jinja('prefix {{ value }} suffix'), true);
  });
});

describe('jinjaKind - none / valid / malformed, delimiter-aware', () => {
  test('a string with no delimiter at all is not a template', () => {
    assert.equal(jinjaKind('just text'), 'none');
    assert.equal(jinjaKind('{ not jinja }'), 'none');
    assert.equal(jinjaKind('closing }} with no opener'), 'none');
    assert.equal(jinjaKind(''), 'none');
    assert.equal(jinjaKind(42), 'none');
  });

  test('each delimiter pair, closed, is valid - whitespace control included', () => {
    assert.equal(jinjaKind('{{ states("sensor.x") }}'), 'valid');
    assert.equal(jinjaKind('{% if true %}yes{% endif %}'), 'valid');
    assert.equal(jinjaKind('{# a comment #}'), 'valid');
    assert.equal(jinjaKind('{{- trimmed -}}'), 'valid');
  });

  test('an opener with no closer is malformed', () => {
    assert.equal(jinjaKind("{{ states('light.x')"), 'malformed');
    assert.equal(jinjaKind('{% if x'), 'malformed');
    assert.equal(jinjaKind('{# never closed'), 'malformed');
  });

  // The two cases a regex gets wrong, and the reason this is a scanner.
  test('a delimiter inside a string literal does not close the tag', () => {
    assert.equal(jinjaKind("{{ '}}' }}"), 'valid');
    assert.equal(jinjaKind("{{ '}}' "), 'malformed');
    assert.equal(jinjaKind('{{ [1, 2] | join("}}") }}'), 'valid');
  });

  test('one dangling opener poisons an otherwise valid string', () => {
    assert.equal(jinjaKind('{{ a }} {{ b'), 'malformed');
    assert.equal(jinjaKind('{{ a }} text {{ b }}'), 'valid');
  });

  test('plain text around a template is just text', () => {
    assert.equal(jinjaKind('Price: {{ states("sensor.x") }} EUR'), 'valid');
    assert.equal(jinjaKind('Price: {{ x'), 'malformed');
    assert.equal(jinjaKind('100 % {sic} {{ x }}'), 'valid');
  });

  test('{% raw %} keeps its content literal, delimiters included', () => {
    assert.equal(jinjaKind('{% raw %}{{ unclosed{% endraw %}'), 'valid');
    assert.equal(jinjaKind('{%+ raw %}{{ x{%+ endraw %}'), 'valid');
    assert.equal(jinjaKind('{% raw %}{{ a{% endraw %} then {{ b }}'), 'valid');
    assert.equal(jinjaKind('{% raw %}{{ a{% endraw %} then {{ b'), 'malformed');
    assert.equal(jinjaKind('{% raw %}never closed'), 'malformed');
  });

  test('escapes inside a string literal are honored', () => {
    assert.equal(jinjaKind('{{ "a\\\\" }}'), 'valid');
    assert.equal(jinjaKind('{{ "a\\" }}'), 'malformed');
  });
});

describe('has.own / method / validKey', () => {
  test('own is a straight hasOwnProperty check, ignoring the prototype chain', () => {
    assert.equal(has.own({ a: 1 }, 'a'), true);
    assert.equal(has.own({ a: 1 }, 'toString'), false);
  });

  test('method checks the property is actually callable, not merely present', () => {
    assert.equal(has.method({ fn: () => 1 }, 'fn'), true);
    assert.equal(has.method({ fn: 1 }, 'fn'), false);
    assert.equal(has.method(null, 'fn'), false);
  });

  test('validKey requires a non-empty string key that is also an own property', () => {
    const obj = { a: 1 };
    assert.equal(has.validKey(obj, 'a'), true);
    assert.equal(has.validKey(obj, 'b'), false);
    assert.equal(has.validKey(obj, ''), false);
    assert.equal(has.validKey(obj, 42), false, 'a non-string key is never valid, even if present');
  });
});

describe('assertDefined - throws instead of silently masking a broken invariant', () => {
  test('returns the value unchanged when it is not null/undefined', () => {
    assert.equal(assertDefined(42, 'unreachable'), 42);
    assert.equal(assertDefined(0, 'unreachable'), 0, 'falsy but defined values pass through');
    assert.equal(assertDefined('', 'unreachable'), '');
  });

  test('throws with the given message for null or undefined', () => {
    assert.throws(() => assertDefined(null, 'boom'), /boom/);
    assert.throws(() => assertDefined(undefined, 'boom'), /boom/);
  });
});
