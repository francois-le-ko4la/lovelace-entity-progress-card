import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { assertUndefined } from '../helpers.js';
import { CardConfigHelper, BaseConfigHelper } from '../../src/card/config-helpers.js';
import type { LovelaceConfig } from '../../src/utils/types.js';

const TEST_ENTITY = 'sensor.test';
const CAPACITY_ENTITY = 'sensor.capacity';
const EXTRA_ENTITY = 'sensor.extra';
const THRESHOLD_ENTITY = 'sensor.threshold';
const asConfig = (raw: Record<string, unknown>) => raw as unknown as LovelaceConfig;

describe('CardConfigHelper._migrateLegacyOptions - deprecated YAML shapes', () => {
  test('bare-entity-id max_value + max_value_attribute migrate to the {entity, attribute} map', () => {
    const migrated = CardConfigHelper._migrateLegacyOptions(
      asConfig({ entity: TEST_ENTITY, max_value: CAPACITY_ENTITY, max_value_attribute: 'level' }),
    ) as { max_value?: unknown; max_value_attribute?: unknown };

    assert.deepEqual(migrated.max_value, { entity: CAPACITY_ENTITY, attribute: 'level' });
    assertUndefined(migrated.max_value_attribute);
  });

  test('a numeric max_value is left untouched (only the legacy string form migrates)', () => {
    const migrated = CardConfigHelper._migrateLegacyOptions(asConfig({ entity: TEST_ENTITY, max_value: 100 })) as {
      max_value?: unknown;
    };
    assert.equal(migrated.max_value, 100);
  });

  test('disable_unit folds into hide, deduplicated, and is itself removed', () => {
    const migrated = CardConfigHelper._migrateLegacyOptions(
      asConfig({ entity: TEST_ENTITY, disable_unit: true, hide: ['icon'] }),
    ) as { hide?: unknown; disable_unit?: unknown };

    assert.deepEqual(migrated.hide, ['icon', 'unit']);
    assertUndefined(migrated.disable_unit);
  });

  test('disable_unit is left untouched when hide is a Jinja template string', () => {
    const migrated = CardConfigHelper._migrateLegacyOptions(
      asConfig({ entity: TEST_ENTITY, disable_unit: true, hide: '{{ ["icon"] }}' }),
    ) as { hide?: unknown; disable_unit?: unknown };

    assert.equal(migrated.hide, '{{ ["icon"] }}');
    assert.equal(migrated.disable_unit, true);
  });

  test('a bare additions array migrates to bar_stack in proportional mode', () => {
    const migrated = CardConfigHelper._migrateLegacyOptions(
      asConfig({ entity: TEST_ENTITY, additions: [{ entity: EXTRA_ENTITY }] }),
    ) as { bar_stack?: unknown; additions?: unknown };

    assert.deepEqual(migrated.bar_stack, { mode: 'proportional', entities: [{ entity: EXTRA_ENTITY }] });
    assertUndefined(migrated.additions);
  });
});

// One shared shape per legacy watermark key so low/high are exercised
// symmetrically, and every stale key's removal is checked explicitly - not
// just the ones a given case happens to set.
type LegacyWatermark = { watermark?: Record<string, unknown> };
const staleKeysCleared = (watermark: Record<string, unknown> | undefined) =>
  [
    'low_attribute',
    'high_attribute',
    'low_as',
    'high_as',
    'low_color',
    'high_color',
    'disable_low',
    'disable_high',
  ].every((key) => watermark?.[key] === undefined);

describe('BaseConfigHelper._migrateWatermarkOptions - deprecated watermark shapes', () => {
  for (const side of ['low', 'high'] as const) {
    test(`bare-entity-id watermark.${side} migrates to {entity}`, () => {
      const migrated = BaseConfigHelper._migrateWatermarkOptions(
        asConfig({ watermark: { [side]: THRESHOLD_ENTITY } }),
      ) as LegacyWatermark;

      assert.deepEqual(migrated.watermark?.[side], { entity: THRESHOLD_ENTITY, attribute: undefined });
      assert.ok(staleKeysCleared(migrated.watermark));
    });

    test(`watermark.${side}_attribute carries over onto the migrated {entity, attribute} map`, () => {
      const migrated = BaseConfigHelper._migrateWatermarkOptions(
        asConfig({ watermark: { [side]: THRESHOLD_ENTITY, [`${side}_attribute`]: 'level' } }),
      ) as LegacyWatermark;

      assert.deepEqual(migrated.watermark?.[side], { entity: THRESHOLD_ENTITY, attribute: 'level' });
    });

    test(`disable_${side} wins outright, even alongside a stale ${side}_color`, () => {
      const migrated = BaseConfigHelper._migrateWatermarkOptions(
        asConfig({ watermark: { [side]: 20, [`disable_${side}`]: true, [`${side}_color`]: 'red' } }),
      ) as LegacyWatermark;

      assert.equal(migrated.watermark?.[side], false);
      assert.ok(staleKeysCleared(migrated.watermark));
    });

    test(`watermark.${side}: false already-modern shorthand wins even without disable_${side}`, () => {
      const migrated = BaseConfigHelper._migrateWatermarkOptions(
        asConfig({ watermark: { [side]: false, [`${side}_color`]: 'red' } }),
      ) as LegacyWatermark;

      assert.equal(migrated.watermark?.[side], false);
    });

    test(`${side}_as/${side}_color alone wrap a raw value into the {value, as, color} override form`, () => {
      const migrated = BaseConfigHelper._migrateWatermarkOptions(
        asConfig({ watermark: { [side]: 20, [`${side}_as`]: 'percent', [`${side}_color`]: 'blue' } }),
      ) as LegacyWatermark;

      assert.deepEqual(migrated.watermark?.[side], { value: 20, as: 'percent', color: 'blue' });
    });

    test(`${side}_as alone (no color) wraps without a color key`, () => {
      const migrated = BaseConfigHelper._migrateWatermarkOptions(
        asConfig({ watermark: { [side]: 20, [`${side}_as`]: 'percent' } }),
      ) as LegacyWatermark;

      assert.deepEqual(migrated.watermark?.[side], { value: 20, as: 'percent' });
    });
  }

  test('only the side with legacy keys is touched - the other stays exactly as authored', () => {
    const migrated = BaseConfigHelper._migrateWatermarkOptions(
      asConfig({ watermark: { low: 20, high: THRESHOLD_ENTITY } }),
    ) as LegacyWatermark;

    assert.equal(migrated.watermark?.low, 20);
    assert.deepEqual(migrated.watermark?.high, { entity: THRESHOLD_ENTITY, attribute: undefined });
  });

  test('a config with no legacy watermark keys is returned untouched', () => {
    const config = asConfig({ watermark: { low: 20, high: 80 } });
    assert.equal(BaseConfigHelper._migrateWatermarkOptions(config), config);
  });

  test('a config with no watermark at all is returned untouched', () => {
    const config = asConfig({ entity: TEST_ENTITY });
    assert.equal(BaseConfigHelper._migrateWatermarkOptions(config), config);
  });
});

describe('CardConfigHelper._customizeConfig - end to end, a fully deprecated config still validates', () => {
  test('legacy max_value + additions + disable_unit together still produce a valid, migrated config', () => {
    const customized = CardConfigHelper._customizeConfig(
      asConfig({
        entity: TEST_ENTITY,
        max_value: CAPACITY_ENTITY,
        max_value_attribute: 'level',
        additions: [{ entity: EXTRA_ENTITY }],
        disable_unit: true,
      }),
    ) as { max_value?: unknown; bar_stack?: unknown; hide?: unknown; disable_unit?: unknown };

    assert.deepEqual(customized.max_value, { entity: CAPACITY_ENTITY, attribute: 'level' });
    assert.deepEqual(customized.bar_stack, { mode: 'proportional', entities: [{ entity: EXTRA_ENTITY }] });
    assert.deepEqual(customized.hide, ['unit']);
    assertUndefined(customized.disable_unit);
  });

  test('a fully legacy watermark (both sides, old low_as/high_color keys) migrates end to end', () => {
    const customized = CardConfigHelper._customizeConfig(
      asConfig({
        entity: TEST_ENTITY,
        watermark: { low: 20, low_as: 'percent', high: 80, high_color: 'orange', disable_low: false },
      }),
    ) as LegacyWatermark;

    assert.deepEqual(customized.watermark?.low, { value: 20, as: 'percent' });
    assert.deepEqual(customized.watermark?.high, { value: 80, color: 'orange' });
    assert.ok(staleKeysCleared(customized.watermark));
  });
});
