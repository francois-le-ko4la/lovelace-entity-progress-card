/*
 * Where a Multi's shared level comes from. Nothing here touches the DOM: it is
 * the one piece of the editor whose output is a config a user reads, so it
 * lives on its own and is exercised by the logic suite.
 */

import { is } from '../utils/common-checks.js';
import { ROW_IDENTITY_FIELDS } from '../card/schema.js';
import type { LovelaceConfig } from '../utils/types.js';

// The aggregator's own keys: never a row's, so never factorised up or down.
// _-prefixed keys are ephemeral editor state and go the same way.
const AGGREGATOR_KEYS = new Set(['entities', 'rows', 'type']);
const isRowOption = (key: string) => !AGGREGATOR_KEYS.has(key) && !key.startsWith('_');

// The same four the aggregator schemas refuse (ROW_IDENTITY_FIELDS): a value
// whose whole job is telling one row from its neighbours is meaningless as a
// default for all of them. They never rise, and one found at the shared level
// - hand-written, or left by an older build - is pushed back down.
const NEVER_SHARED = new Set<string>(ROW_IDENTITY_FIELDS);

// Config values are plain schema-shaped data (numbers, strings, small maps
// built by the same field code), so a structural compare is enough - and it
// is the only one that answers "does this row still agree with the others"
// for a watermark or an action map.
const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const sharedOf = (config: LovelaceConfig): Record<string, unknown> =>
  Object.fromEntries(Object.entries(config).filter(([key]) => isRowOption(key)));

// `entities` accepts a bare entity id as shorthand for { entity }.
const asRow = (row: unknown): Record<string, unknown> => (is.plainObject(row) ? { ...row } : { entity: row as string });

const rowsOf = (config: LovelaceConfig): Record<string, unknown>[] =>
  is.array(config.entities) ? config.entities.map(asRow) : [];

/**
 * The shared level is not a place to configure - it is where agreement ends
 * up. A row keeps only what it says differently; once every row says the same
 * thing it moves up and no row carries it any more; once every row contradicts
 * the shared value, nothing reads it and it goes. Same cascade the watermark
 * and peak_marker marks already run over their own keys (see factory.ts's
 * factorizeGlobalOverride/pruneGlobalOverride) - one level up.
 */
// A key that identifies a row, found at the shared level: hand-written, or
// left behind by an older build. Every row that hasn't already said its own
// gets it back, then it goes.
const pushDown = (key: string, shared: Record<string, unknown>, rows: Record<string, unknown>[]) => {
  if (!(key in shared)) return;
  for (const row of rows) if (!(key in row)) row[key] = shared[key];
  delete shared[key];
};

// No value carried enough weight to become the shared one. Its own symbol,
// not undefined: "most rows set nothing" is a real outcome and has to be told
// apart from "no election happened".
const NO_WINNER = Symbol('no winner');

const tally = (values: unknown[]): { value: unknown; count: number }[] => {
  const counts = new Map<string, { value: unknown; count: number }>();
  for (const value of values) {
    const key = JSON.stringify(value ?? null);
    const entry = counts.get(key) ?? { value, count: 0 };
    entry.count += 1;
    counts.set(key, entry);
  }
  return [...counts.values()];
};

// What the rows elect: the value most of them carry, and only if more than one
// does - a value with a single copy describes one entity, not the stack. A tie
// keeps whatever is already shared, so editing an unrelated row can't make the
// winner flip back and forth.
const elect = (values: unknown[], current: unknown): unknown => {
  const entries = tally(values);
  const best = Math.max(...entries.map((entry) => entry.count));
  if (best < 2) return NO_WINNER;
  const winners = entries.filter((entry) => entry.count === best);
  return (winners.find((entry) => same(entry.value, current)) ?? winners[0]).value;
};

// One key, one election. Whatever the outcome, a row that was reading the
// shared value has to write it down before that value moves or goes - the
// election decides where a value lives, never what a row renders.
const settle = (key: string, shared: Record<string, unknown>, rows: Record<string, unknown>[]) => {
  const values = rows.map((row) => (key in row ? row[key] : shared[key]));
  const winner = elect(values, shared[key]);
  const materialise = (row: Record<string, unknown>, index: number) => {
    if (values[index] === undefined) delete row[key];
    else row[key] = values[index];
  };

  if (winner === NO_WINNER || winner === undefined) {
    delete shared[key];
    rows.forEach(materialise);
    return;
  }

  shared[key] = winner;
  rows.forEach((row, index) => {
    if (same(values[index], winner)) delete row[key];
    else materialise(row, index);
  });
};

const cascade = (config: LovelaceConfig): LovelaceConfig => {
  const rows = rowsOf(config);
  if (rows.length === 0) return config;
  const shared = { ...sharedOf(config) };
  const keys = new Set([...Object.keys(shared), ...rows.flatMap((row) => Object.keys(row))].filter(isRowOption));

  for (const key of keys) {
    if (NEVER_SHARED.has(key)) pushDown(key, shared, rows);
    else settle(key, shared, rows);
  }

  const cleaned = Object.fromEntries(Object.entries(shared).filter(([, value]) => value !== undefined));
  const kept = Object.fromEntries(Object.entries(config).filter(([key]) => !isRowOption(key)));
  return { ...kept, ...cleaned, entities: rows } as unknown as LovelaceConfig;
};

export { cascade, sharedOf, rowsOf, isRowOption };
