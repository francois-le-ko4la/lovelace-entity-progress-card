/*
 * theme.md lists the `state-*` color names a user can write. They are exactly
 * the variables HA defines, mirrored in HA_CONTEXT.stateColorVars.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HA_CONTEXT } from '../../src/utils/ha-context.js';

const text = fs.readFileSync('docs/theme.md', 'utf8');
const section = text.split('### HA State')[1]?.split(/^#{1,3} /m)[0] ?? '';

// One column: each name maps to Home Assistant's `--<name>-color`.
const documented = [...section.matchAll(/^\| `(state-[\w-]+)`\s+\|$/gm)].map(([, name]) => `--${name}-color`);

test('theme.md HA State table lists exactly the accepted state color variables', () => {
  assert.deepEqual(documented.sort(), [...HA_CONTEXT.stateColorVars].sort());
});
