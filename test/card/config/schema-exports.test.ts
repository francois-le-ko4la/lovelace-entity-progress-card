import { test } from 'node:test';
import assert from 'node:assert/strict';

const PUBLIC_EXPORTS = [
  'ACTION_FIELDS',
  'AGGREGATOR_FIELDS',
  'BAR_AROUND_ICON',
  'BAR_POSITIONS',
  'BAR_SIZES',
  'DENSITY_COMPACT_BAR_POSITIONS',
  'DENSITY_MODES',
  'HAS_EFFECT',
  'ICON_ANIMATIONS',
  'MARK_FACTORIZATION',
  'MARK_FIELDS',
  'MARK_TYPES',
  'MARK_ZONE_TYPES',
  'OPTIONS_WITHOUT_EFFECT',
  'OWN_TRIGGER_ANIMATIONS',
  'PEAK_RANGE_TYPE_DEFAULT',
  'ROW_IDENTITY_FIELDS',
  'SCHEMA_DEFAULTS',
  'TEXT_EFFECTS',
  'THEME_ALIASES',
  'YamlSchemaFactory',
  'attributeOf',
  'densityForcedHide',
  'densityOverrides',
  'entityOf',
  'isMarkOverride',
  'isToggleDomainEntity',
  'jinjaOf',
  'markIds',
  'markInner',
  'markShown',
  'markValue',
  'peakMarkShown',
  'raisesRainbowFullRow',
  'rawThemeRange',
  'rewrapStatusLabel',
  'schemaOptions',
  'statusLabelObj',
  'translateOrientation',
];

test('schema.js keeps its public surface', async () => {
  const schema = await import('../../../src/card/config/schema.js');
  assert.deepEqual(Object.keys(schema).sort(), PUBLIC_EXPORTS);
});
