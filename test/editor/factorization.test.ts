/*
 * The one factorisation (card/factorization.ts) only ever moves where a value
 * is written: settling changes nothing any item uses, and settling twice is
 * settling once. Checked on generated configs, for both of its users.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { MARK_FACTORIZATION, MARK_FIELDS } from '../../src/card/schema.js';
import { cascade, rowsOf, MULTI_ROWS } from '../../src/editor/multi-cascade.js';
import { rowConfigsOf } from '../../src/card/multi-rows.js';
import type { LovelaceConfig } from '../../src/utils/types.js';

type Rec = Record<string, unknown>;

// Deterministic, so a failure replays the same config.
const random = (seed: number) => () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};
const pick = <T>(next: () => number, values: readonly T[]): T => values[Math.floor(next() * values.length)];
const maybe = <T>(next: () => number, value: T): T | undefined => (next() < 0.5 ? value : undefined);
const RUNS = 300;

const COLORS = ['red', 'blue', 'green'];
const TYPES = ['line', 'round', 'area'];

const markFamily = (next: () => number, family: 'watermark' | 'peak_marker'): Rec => {
  const shared: Rec = { color: maybe(next, pick(next, COLORS)), type: maybe(next, pick(next, TYPES)) };
  for (const id of Object.keys(MARK_FIELDS[family])) {
    const shape = pick(next, ['plain', 'override', 'hidden']);
    if (shape === 'hidden') shared[id] = family === 'watermark' ? false : undefined;
    else if (shape === 'plain') shared[id] = family === 'watermark' ? 20 : true;
    else shared[id] = { color: maybe(next, pick(next, COLORS)), type: maybe(next, pick(next, TYPES)) };
  }
  return JSON.parse(JSON.stringify(shared));
};

// What the shown marks are drawn with: a hidden one draws nothing, and settling
// leaves it untouched - writing to it would show it again.
const usedByMarks = (family: 'watermark' | 'peak_marker', config: Rec) => {
  const marks = config[family] as Rec;
  return Object.keys(MARK_FIELDS[family])
    .filter((id) => marks[id] !== undefined && marks[id] !== false)
    .flatMap((id) => ['color', 'type'].map((key) => MARK_FACTORIZATION[family].resolve(config, id, key)));
};

describe('settling a mark family moves values, never what a mark uses', () => {
  for (const family of ['watermark', 'peak_marker'] as const)
    test(family, () => {
      const next = random(family.length);
      for (let run = 0; run < RUNS; run += 1) {
        const config = { [family]: markFamily(next, family) };
        const settled = MARK_FACTORIZATION[family].settle(config);
        assert.deepEqual(usedByMarks(family, settled), usedByMarks(family, config), JSON.stringify(config));
        assert.deepEqual(MARK_FACTORIZATION[family].settle(settled), settled, 'settling twice moved something');
      }
    });
});

const multiConfig = (next: () => number): LovelaceConfig => {
  const rows = Array.from({ length: 1 + Math.floor(next() * 4) }, (_, index) => ({
    entity: `sensor.row_${index}`,
    ...(next() < 0.5 ? { bar_color: pick(next, COLORS) } : {}),
    ...(next() < 0.5 ? { decimal: pick(next, [0, 1, 2]) } : {}),
  }));
  return {
    type: 'custom:entity-progress-multi-card',
    ...(next() < 0.5 ? { bar_color: pick(next, COLORS) } : {}),
    entities: rows,
  } as unknown as LovelaceConfig;
};

const usedByRows = (config: LovelaceConfig) =>
  rowsOf(config).map((row) => ({
    bar_color: row.bar_color ?? config.bar_color,
    decimal: row.decimal ?? config.decimal,
  }));

describe('settling a Multi moves values, never what a row uses', () => {
  test('rows', () => {
    const next = random(7);
    for (let run = 0; run < RUNS; run += 1) {
      const config = multiConfig(next);
      const settled = cascade(config);
      assert.deepEqual(usedByRows(settled), usedByRows(config), JSON.stringify(config));
      assert.deepEqual(cascade(settled), settled, 'settling twice moved something');
    }
  });
});

// The card hands each row its own merge (multi-rows.ts); the editor files the
// same config by resolve. A row must get from one what the other says it uses.
describe('a Multi row gets from the card what the editor resolves for it', () => {
  test('rows', () => {
    const next = random(11);
    for (let run = 0; run < RUNS; run += 1) {
      const config = multiConfig(next);
      const handed = rowConfigsOf(config) as unknown as Rec[];
      handed.forEach((row, index) => {
        for (const key of ['bar_color', 'decimal'])
          assert.equal(
            row[key],
            MULTI_ROWS.resolve(config, String(index), key),
            `row ${index} ${key}: ${JSON.stringify(config)}`,
          );
      });
    }
  });
});
