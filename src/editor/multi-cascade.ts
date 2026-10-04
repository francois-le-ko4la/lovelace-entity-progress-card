/*
 * Where a Multi's shared level comes from. Nothing here touches the DOM: it is
 * the one piece of the editor whose output is a config a user reads, so it
 * lives on its own and is exercised by the logic suite.
 */

import { is } from '../utils/common-checks.js';
import { AGGREGATOR_FIELDS, ROW_IDENTITY_FIELDS } from '../card/schema.js';
import type { LovelaceConfig } from '../utils/types.js';
import { Factorization } from '../card/factorization.js';

// Never factorised up or down, like the _-prefixed (editor state) keys.
const AGGREGATOR_KEYS = new Set<string>(AGGREGATOR_FIELDS);
const isRowOption = (key: string) => !AGGREGATOR_KEYS.has(key) && !key.startsWith('_');

// The same four the aggregator schemas refuse (ROW_IDENTITY_FIELDS): a value
// whose whole job is telling one row from its neighbours is meaningless as a
// default for all of them. They never rise, and one found at the shared level
// - hand-written, or left by an older build - is pushed back down.
const NEVER_SHARED = new Set<string>(ROW_IDENTITY_FIELDS);

const sharedOf = (config: LovelaceConfig): Record<string, unknown> =>
  Object.fromEntries(Object.entries(config).filter(([key]) => isRowOption(key)));

// `entities` accepts a bare entity id as shorthand for { entity }.
const asRow = (row: unknown): Record<string, unknown> => (is.plainObject(row) ? { ...row } : { entity: row as string });

const rowsOf = (config: LovelaceConfig): Record<string, unknown>[] =>
  is.array(config.entities) ? config.entities.map(asRow) : [];

// The shared level is where agreement ends up, not a place to configure: the
// one factorisation every shared level runs (factorization.ts), over rows.
const MULTI_ROWS = new Factorization({
  shared: (config) => sharedOf(config as LovelaceConfig),
  items: (config) => Object.fromEntries(rowsOf(config as LovelaceConfig).map((row, index) => [String(index), row])),
  rebuild: (config, shared, items) => {
    const kept = Object.fromEntries(Object.entries(config).filter(([key]) => !isRowOption(key)));
    const cleaned = Object.fromEntries(Object.entries(shared).filter(([, value]) => value !== undefined));
    return { ...kept, ...cleaned, entities: Object.values(items) };
  },
  own: (row, key) => (row as Record<string, unknown>)[key],
  write: (_id, row, patch) => {
    const next = { ...(row as Record<string, unknown>) };
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined) Reflect.deleteProperty(next, key);
      else next[key] = value;
    }
    return next;
  },
  rule: (_id, key) => (NEVER_SHARED.has(key) ? 'pinned' : 'inherits'),
  votes: () => true,
  isKey: isRowOption,
});

const cascade = (config: LovelaceConfig): LovelaceConfig =>
  rowsOf(config).length === 0 ? config : (MULTI_ROWS.settle(config) as LovelaceConfig);

export { cascade, sharedOf, rowsOf, isRowOption };
