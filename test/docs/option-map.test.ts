/*
 * docs/option-map.md is generated: it must be what the generator renders from
 * today's schema, editors, docs, demo and tests - else it misleads.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { optionMap, OPTION_MAP } from './option-map.js';

test(`${OPTION_MAP} is up to date`, () => {
  assert.ok(fs.readFileSync(OPTION_MAP, 'utf8') === optionMap(), `${OPTION_MAP} is stale: run npm run docs:options`);
});
