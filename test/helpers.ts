/*
 * Assertion helpers shared by the test suite.
 */

import assert from 'node:assert/strict';

// assert.equal(x, undefined) reads to static analysis as a redundant trailing
// argument (DeepSource JS-W1042), even though the expectation is the point.
const assertUndefined = (actual: unknown, message?: string) => {
  assert.ok(actual === undefined, message ?? `expected undefined, got ${String(actual)}`);
};

// An editor field tree (EditorFactory.build) and the fields a config leaves
// visible in it - raw and negotiated config alike, as the pure checks need.
type EditorField = { showIf?: (c: Record<string, unknown>, n: Record<string, unknown>) => boolean };
type FieldTree = Record<string, { fields: Record<string, EditorField> }>;

const visibleFields = (tree: FieldTree, config: Record<string, unknown>): Set<string> => {
  const out = new Set<string>();
  for (const section of Object.values(tree)) {
    for (const [name, field] of Object.entries(section.fields)) {
      if (!field.showIf || field.showIf(config, config)) out.add(name);
    }
  }
  return out;
};

export { assertUndefined, visibleFields };
export type { FieldTree };
