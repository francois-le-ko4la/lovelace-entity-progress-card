/*
 * Assertion helpers shared by the test suite.
 */

import assert from 'node:assert/strict';

// assert.equal(x, undefined) reads to static analysis as a redundant trailing
// argument (DeepSource JS-W1042), even though the expectation is the point.
const assertUndefined = (actual: unknown, message?: string) => {
  assert.ok(actual === undefined, message ?? `expected undefined, got ${String(actual)}`);
};

export { assertUndefined };
