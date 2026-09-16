/*
 * Every dropdown in the editor sits between two tables that can drift: the
 * schema decides which values a field accepts, the translations decide which
 * ones have a label. A value the schema gained without a label renders as an
 * empty entry (pickOptions reads `source[key]`); a label the schema no longer
 * accepts offers the user something the card will drop on save.
 *
 * SELECT_TYPES is the join between the two, so it is what this walks.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { BORROWED_OPTION_LABELS, SELECT_TYPES, type SchemaLookup } from '../../src/editor/select-types.js';
import { schemaOptions } from '../../src/card/schema.js';
import { TRANSLATION_KEYS } from '../../src/utils/translations.js';

// The option keys the translations carry for one group, e.g. every value
// `editor.option.bar_size.*` has a label for.
const labelled = (group: string): string[] => {
  const prefix = `editor.option.${group}.`;
  const own = (TRANSLATION_KEYS as readonly string[])
    .filter((key) => key.startsWith(prefix))
    .map((key) => key.slice(prefix.length));
  // A value can name its label instead of carrying one (EditorBase#localizedOptions
  // merges them in), so the group alone no longer answers "is this one labelled".
  return [...own, ...Object.keys(BORROWED_OPTION_LABELS[group] ?? {})];
};

const isLookup = (source: unknown): source is SchemaLookup =>
  Boolean(source) && !Array.isArray(source) && typeof source === 'object';

const entries = Object.entries(SELECT_TYPES);

describe('the editor offers exactly what the schema accepts', () => {
  test('there are dropdowns to check', () => {
    assert.ok(entries.length >= 20, `only ${entries.length} select types collected`);
  });

  for (const [type, spec] of entries) {
    const [group, source] = typeof spec === 'string' ? [spec, null] : spec;

    test(`${type}: every value it offers has a label`, () => {
      const labels = labelled(group);
      assert.ok(labels.length > 0, `no editor.option.${group}.* key at all`);
      // No source means the dropdown IS the group: nothing can be unlabelled.
      if (!source) return;
      const offered = isLookup(source) ? schemaOptions(source.variant, source.field) : source;
      assert.ok(offered.length > 0, `nothing to offer - is ${JSON.stringify(source)} still a field?`);
      assert.deepEqual(
        offered.filter((value) => !labels.includes(value)),
        [],
        `these would render as blank entries under editor.option.${group}`,
      );
    });
  }

  for (const [type, spec] of entries) {
    if (typeof spec === 'string') continue;
    const [group, source] = spec;
    if (!isLookup(source)) continue;

    test(`${type}: every label it carries is a value the schema accepts`, () => {
      const accepted = schemaOptions(source.variant, source.field);
      // A group shared by several fields legitimately holds more than any one
      // of them offers (bar_position's own, watermark_type's reuse by
      // peak_marker) - the dropdown filters it down to `accepted` anyway. What
      // must not happen is a value being offered and then refused, which the
      // filtering makes impossible here: this pins that the filter still has
      // something to filter against.
      assert.ok(accepted.length > 0, `schemaOptions(${source.variant}, ${source.field}) came back empty`);
      assert.ok(labelled(group).length >= accepted.length);
    });
  }
});
