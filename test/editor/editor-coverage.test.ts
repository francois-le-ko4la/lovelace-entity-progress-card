/*
 * Every option a variant's schema accepts has a field in that variant's
 * editor: an option the schema gained without one is only reachable in YAML,
 * and nothing else would say so. A Multi's own form is not walked - what a row
 * carries is edited on the row (EditorFactory.buildMulti), whose forms are.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { YamlSchemaFactory, schemaOptions, type SchemaVariant } from '../../src/card/schema.js';
import { EditorFactory } from '../../src/editor/factory.js';

// YAML only, on purpose - each with the reason it has no field.
const YAML_ONLY: Record<string, string> = {
  disable_unit: 'deprecated: Migrate config rewrites it',
  bar_aligned: 'a card is aligned by name, written in YAML; the Multi form has the toggle',
};

// The top-level key each field writes: its target or name, before any dot.
const writtenKeys = (tree: unknown, keys = new Set<string>()): Set<string> => {
  if (Array.isArray(tree)) {
    for (const node of tree) writtenKeys(node, keys);
    return keys;
  }
  if (!tree || typeof tree !== 'object') return keys;
  const node = tree as Record<string, unknown>;
  for (const prop of ['name', 'target']) {
    const value = node[prop];
    if (typeof value === 'string') keys.add(value.split('.')[0]);
  }
  for (const child of Object.values(node)) writtenKeys(child, keys);
  return keys;
};

type Fields = { fields: () => string[] };
const FORMS: [SchemaVariant, Fields, unknown][] = [
  ['card', YamlSchemaFactory.card, EditorFactory.build({ template: false, badge: false })],
  ['template', YamlSchemaFactory.template, EditorFactory.build({ template: true, badge: false })],
  ['badge', YamlSchemaFactory.badge, EditorFactory.build({ template: false, badge: true })],
  ['badgeTemplate', YamlSchemaFactory.badgeTemplate, EditorFactory.build({ template: true, badge: true })],
  ['feature', YamlSchemaFactory.feature, EditorFactory.buildFeature()],
  ['multiRow', YamlSchemaFactory.multiRow, EditorFactory.buildMultiRow(false)],
  ['multiFeatureRow', YamlSchemaFactory.multiFeatureRow, EditorFactory.buildMultiRow(true)],
];

// An enum with a single value leaves nothing to pick: the schema settles it.
const isSettled = (variant: SchemaVariant, key: string) => schemaOptions(variant, key).length === 1;

describe('every option a card accepts can be set in its editor', () => {
  for (const [variant, schema, form] of FORMS) {
    test(variant, () => {
      const fields = writtenKeys(form);
      const missing = schema
        .fields()
        .filter((key) => !fields.has(key) && !(key in YAML_ONLY) && !isSettled(variant, key));
      assert.deepEqual(missing, [], `${variant}: no editor field for ${missing.join(', ')}`);
    });
  }
});
