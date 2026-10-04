// What each row of a Multi is handed: the shared options under its own (the
// row wins), then the row shape. Pure, so the editor's resolve can be held to
// it (test/editor/factorization.test.ts).

import { is } from '../utils/common-checks.js';
import { AGGREGATOR_FIELDS } from './schema.js';
import type { LovelaceConfig } from '../utils/types.js';

// What never travels down to a row: the aggregator's own keys, plus the
// derived ones the negotiated config carries (a child re-derives its own).
const NOT_ROW_OPTIONS = new Set<string>([...AGGREGATOR_FIELDS, 'centerZero', 'resolvedUnit', 'resolvedDecimal']);

// The row shape itself, which is the aggregator's to impose and not the
// user's - hence absent from YamlSchemaFactory.multiRow.
const toRowConfig = (row: Record<string, unknown>): LovelaceConfig =>
  ({ ...row, density: 'single_line', frameless: true, marginless: true }) as unknown as LovelaceConfig;

// bar_size defaults to 'small' (not the card schema's own default): a stack of
// N rows needs a compact one. Still overridable, shared or per-item.
const rowConfigsOf = (config: LovelaceConfig | null): LovelaceConfig[] => {
  if (!config || !is.array(config.entities)) return [];
  const shared: Record<string, unknown> = { bar_size: 'small' };
  for (const [key, value] of Object.entries(config)) {
    if (!NOT_ROW_OPTIONS.has(key)) shared[key] = value;
  }
  return (config.entities as Record<string, unknown>[]).map((item) =>
    toRowConfig({ ...shared, ...(is.plainObject(item) ? item : { entity: item }) }),
  );
};

export { rowConfigsOf };
