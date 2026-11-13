/*
 * README.md is what HACS and the docs site show for a release: a stable
 * release must ship the README written from today's .github/README.md.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { VERSION } from '../../src/utils/parameters.js';
import { readmeStable, README, README_GITHUB } from '../../scripts/lib/readme-stable.js';

const skip = VERSION.includes('-rc') && 'an RC ships the previous stable README';

test(`${README} is up to date`, { skip }, () => {
  const stale = fs.readFileSync(README, 'utf8') !== readmeStable(fs.readFileSync(README_GITHUB, 'utf8'));
  assert.ok(!stale, `${README} is stale: run npm run docs:readme`);
});
