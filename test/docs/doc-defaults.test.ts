/*
 * The reference states each option's default three ways - in its header, under
 * "Default value", in the options table. The schema is where the default lives
 * (SCHEMA_DEFAULTS reads it from there too); the docs must say the same.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { YamlSchemaFactory } from '../../src/card/schema.js';

const DOC = 'docs/configuration.md';
const text = fs.readFileSync(DOC, 'utf8');

// The variants an option's default is read from, first one carrying it wins.
const VARIANTS = ['card', 'template', 'badge', 'feature', 'multiCard'] as const;
const schemaDefault = (option: string): unknown => {
  for (const variant of VARIANTS) {
    const schema = YamlSchemaFactory[variant];
    if (schema.fields().includes(option)) {
      const value = schema.fieldDefault(option);
      if (value !== undefined) return value;
    }
  }
  return undefined;
};

// A single plain literal: `ltr`, `false`, `100`. Anything longer is a rule
// spelled out in words, not a value to compare.
const LITERAL = /^`([^`\s]+)`$/;

type Claim = { option: string; documented: string; where: string };
const claims: Claim[] = [];

// Headers and "Default value" blocks, per option section.
const sections = text.split(/^#{3,4} `([a-z_]+)`$/m);
for (let index = 1; index < sections.length; index += 2) {
  const option = sections[index];
  const body = sections[index + 1].split(/^#{2,4} /m)[0];
  const header = body.match(/default:\s*\n?>?\s*(`[^`]+`)\s*\)/);
  if (header && LITERAL.test(header[1])) claims.push({ option, documented: header[1], where: `${option} header` });
  const block = body.match(/_Default value_:\s*\n\s*\n?\s*- (`[^`]+`)\s*$/m);
  if (block && LITERAL.test(block[1])) claims.push({ option, documented: block[1], where: `${option} Default value` });
}

// The options table: | `option` | type | default | ... |
for (const row of text.matchAll(/^\| `([a-z_]+)`\s*\|[^|]*\|\s*(`[^`|]+`)\s*\|/gm))
  if (LITERAL.test(row[2])) claims.push({ option: row[1], documented: row[2], where: `${row[1]} table row` });

describe(`the defaults ${DOC} states are the schema's`, () => {
  test('there are defaults to check', () => {
    assert.ok(claims.length > 20, `only ${claims.length} documented defaults found`);
  });

  test('each one matches', () => {
    const wrong = claims.flatMap(({ option, documented, where }) => {
      const actual = schemaDefault(option);
      // An object default is what an option holds once on (trend_indicator:
      // basis, threshold...), not what it is when unset.
      if (actual === undefined || typeof actual === 'object') return [];
      const literal = documented.match(LITERAL)?.[1];
      return String(actual) === literal ? [] : [`${where}: docs say ${documented}, the schema \`${String(actual)}\``];
    });
    assert.deepEqual(wrong, [], `\n${wrong.join('\n')}\n`);
  });
});
