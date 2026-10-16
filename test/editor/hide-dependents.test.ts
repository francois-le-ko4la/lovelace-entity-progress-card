/*
 * The editor retires fields by name when a hide target leaves them nothing to
 * do (HIDE_DEPENDENTS, BAR_MARK_PREFIXES). Names are plain strings, so a field
 * renamed or dropped would leave a dead entry and the gate would silently stop
 * covering it. This asserts every name still reaches a built field and that
 * the field really goes away under its target.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { EditorFactory } from '../../src/editor/factory.js';
import { HIDE_DEPENDENTS, BAR_MARK_PREFIXES } from '../../src/editor/fields/base.js';

type Gated = { showIf?: (config: Record<string, unknown>, normalized: Record<string, unknown>) => boolean };

// field name -> its definitions, wherever a `fields` map sits in a form.
const collect = (tree: unknown, found = new Map<string, Gated[]>()): Map<string, Gated[]> => {
  if (!tree || typeof tree !== 'object') return found;
  const node = tree as Record<string, unknown>;
  if (node.fields && typeof node.fields === 'object') {
    for (const [name, def] of Object.entries(node.fields as Record<string, Gated>)) {
      found.set(name, [...(found.get(name) ?? []), def]);
    }
  }
  for (const child of Object.values(node)) collect(child, found);
  return found;
};

// Only the card family is gated by hide: a Feature and a Multi have no such
// option, so their fields count for existence but not for the gate.
const GATED = [
  EditorFactory.build({ template: false, badge: false }),
  EditorFactory.build({ template: true, badge: false }),
  EditorFactory.build({ template: false, badge: true }),
  EditorFactory.build({ template: true, badge: true }),
];
const UNGATED = [
  EditorFactory.buildFeature(),
  EditorFactory.buildMulti(false),
  EditorFactory.buildMulti(true),
  EditorFactory.buildMultiRow(false),
  EditorFactory.buildMultiRow(true),
];

const merge = (forms: unknown[]) => {
  const fields = new Map<string, Gated[]>();
  for (const form of forms) {
    for (const [name, defs] of collect(form)) fields.set(name, [...(fields.get(name) ?? []), ...defs]);
  }
  return fields;
};
const GATED_FIELDS = merge(GATED);
const FIELDS = merge([...GATED, ...UNGATED]);

describe('the hide gates still point at editor fields', () => {
  for (const [target, names] of Object.entries(HIDE_DEPENDENTS)) {
    test(`${target}: every listed field exists`, () => {
      const missing = names.filter((name) => !FIELDS.has(name));
      assert.deepEqual(missing, [], `no editor field named ${missing.join(', ')}`);
    });

    test(`${target}: a listed field is not shown once the target is hidden`, () => {
      for (const name of names) {
        for (const def of GATED_FIELDS.get(name) ?? []) {
          assert.ok(def.showIf, `${name} has no showIf`);
          assert.equal(def.showIf?.({ hide: [target] }, {}), false, `${name} stays shown under hide: ${target}`);
        }
      }
    });
  }

  for (const prefix of BAR_MARK_PREFIXES) {
    test(`the prefix ${prefix} still matches a field`, () => {
      assert.ok([...FIELDS.keys()].some((name) => name.startsWith(prefix)));
    });
  }
});
