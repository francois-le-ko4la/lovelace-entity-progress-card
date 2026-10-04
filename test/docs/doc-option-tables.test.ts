/*
 * The option summary tables (one per variant in the cookbook, the templates'
 * common options in the reference) restate what each variant accepts. The
 * schema is where that lives; each table must list exactly that.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { YamlSchemaFactory, schemaOptions, AGGREGATOR_FIELDS, type SchemaVariant } from '../../src/card/schema.js';
import { DEPRECATED_KEYS } from './card-configs.js';

const COOKBOOK = 'docs/cookbook.md';
const REFERENCE = 'docs/configuration.md';
const ACTIONS = /_action$/;
const GROUPED_ACTIONS = 'xyz_action';

const read = (file: string) => fs.readFileSync(file, 'utf8');

// The option column of the first table under `heading`, `*_action` rows folded.
const tableUnder = (text: string, heading: string): string[] => {
  const after = text.slice(text.indexOf(heading));
  const rows = after.slice(after.indexOf('\n|')).split('\n').slice(1);
  const end = rows.findIndex((row) => !row.startsWith('|'));
  return rows
    .slice(0, end)
    .map((row) => /^\| `([a-z_]+)`/.exec(row)?.[1])
    .filter((option): option is string => Boolean(option))
    .map((option) => (ACTIONS.test(option) ? GROUPED_ACTIONS : option));
};

// What a variant's table owes: every option it accepts, but a deprecated one
// or one with a single accepted value (nothing to choose).
const owed = (...variants: SchemaVariant[]): Set<string> =>
  new Set(
    variants.flatMap((variant) =>
      YamlSchemaFactory[variant]
        .fields()
        .filter((option) => !DEPRECATED_KEYS.has(option) && schemaOptions(variant, option).length !== 1)
        .map((option) => (ACTIONS.test(option) ? GROUPED_ACTIONS : option)),
    ),
  );

const assertSame = (listed: string[], expected: Set<string>) => {
  assert.deepEqual(
    {
      missing: [...expected].filter((option) => !listed.includes(option)).sort(),
      extra: listed.filter((option) => !expected.has(option)),
    },
    { missing: [], extra: [] },
  );
};

describe('the cookbook option tables list what each variant accepts', () => {
  const cookbook = read(COOKBOOK);
  const VARIANT_HEADINGS: [string, SchemaVariant][] = [
    ['### 🧩 Entity Progress Card\n', 'card'],
    ['### 🧩 Entity Progress Card Template\n', 'template'],
    ['### 🧩 Entity Progress Badge\n', 'badge'],
    ['### 🧩 Entity Progress Badge Template\n', 'badgeTemplate'],
    ['### 🧩 Entity Progress Tile Feature\n', 'feature'],
  ];
  for (const [heading, variant] of VARIANT_HEADINGS)
    test(variant, () => assertSame(tableUnder(cookbook, heading), owed(variant)));

  // A row takes the card's own options: the Multi table lists the aggregator's,
  // and the ones the Multi part of the reference documents for itself.
  test('Multi', () => {
    const listed = tableUnder(cookbook, '### 🧩 Entity Progress Multi-Card / Multi-Feature');
    const reference = read(REFERENCE);
    const multiPart = reference.slice(reference.indexOf('## 🧩 entity-progress-multi-card'));
    const ownSections = [...multiPart.matchAll(/^### `([a-z_]+)`$/gm)].map((match) => match[1]);
    const accepted = owed('multiCard', 'multiFeature');
    for (const option of [...AGGREGATOR_FIELDS.filter((field) => field !== 'type'), ...ownSections])
      assert.ok(listed.includes(option), `${option} is the Multi's own: the table should list it`);
    for (const option of listed) assert.ok(accepted.has(option), `${option}: the Multi doesn't accept it`);
  });
});

// The options a template takes as the card does; the ones it reshapes (Jinja)
// or owns have their own section under "Specific options" instead.
test("the reference's template common options are the templates' shared ones", () => {
  const reference = read(REFERENCE);
  const start = reference.indexOf('## 🧩 entity-progress-card-template');
  const templatePart = reference.slice(start, reference.indexOf('\n## ', start + 1));
  const specific = new Set([...templatePart.matchAll(/^#### `([a-z_]+)`/gm)].map((match) => match[1]));
  const expected = new Set([...owed('template', 'badgeTemplate')].filter((option) => !specific.has(option)));
  assertSame(tableUnder(templatePart, '### Common options'), expected);
});
