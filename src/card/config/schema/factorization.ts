import { is } from '../../../utils/common-checks.js';
import { Factorization, type FactorRule } from '../factorization.js';
import {
  type MarkFamily,
  type Rec,
  markIds,
  markOwn,
  type Mark,
  type MarkField,
  MARK_FIELDS,
  type MarkFieldRules,
  MARK_FIELD_KEYS,
  rewrapMark,
  rewrapPeakMark,
  peakMarkShown,
  type PeakMark,
} from './marks.js';
import { SCHEMA_DEFAULTS } from './defaults.js';

const markFamily = (
  family: MarkFamily,
  write: (id: string, item: unknown, patch: Rec) => unknown,
  votes: (item: unknown) => boolean,
) => {
  const ids = markIds(family);
  const familyOf = (config: Rec): Rec => (is.plainObject(config[family]) ? config[family] : {});
  return new Factorization({
    shared: familyOf,
    items: (config) => Object.fromEntries(ids.map((id) => [id, familyOf(config)[id]])),
    rebuild: (config, shared, items) => ({
      ...config,
      [family]: { ...shared, ...Object.fromEntries(Object.entries(items).filter(([, item]) => item !== undefined)) },
    }),
    own: (item, key) => markOwn(item as Mark, key as MarkField),
    write,
    rule: (id, key): FactorRule | null => {
      const rules = (MARK_FIELDS[family] as Record<string, MarkFieldRules>)[id];
      if (!rules || !(key in rules)) return null;
      return rules[key as MarkField] ? 'inherits' : 'own';
    },
    votes: (config, id) => votes(familyOf(config)[id]),
    isKey: (key) => MARK_FIELD_KEYS.has(key),
  });
};

const MARK_FACTORIZATION: Record<MarkFamily, Factorization> = {
  // A side is shown unless `false`; a peak mark only once set.
  watermark: markFamily(
    'watermark',
    (id, item, patch) =>
      rewrapMark(item, patch, id === 'low' ? SCHEMA_DEFAULTS.watermark.low : SCHEMA_DEFAULTS.watermark.high),
    (item) => item !== false,
  ),
  peak_marker: markFamily(
    'peak_marker',
    (_id, item, patch) => rewrapPeakMark(item, patch),
    (item) => peakMarkShown(item as PeakMark),
  ),
};

export { MARK_FACTORIZATION };
