import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { rowConfigsOf } from '../../../src/card/config/multi-rows.js';
import { YamlSchemaFactory } from '../../../src/card/config/schema.js';
import type { LovelaceConfig } from '../../../src/utils/types.js';
import { assertUndefined } from '../../helpers.js';

type Rec = Record<string, unknown>;

const rows = (config: Rec): Rec[] => rowConfigsOf(config as unknown as LovelaceConfig) as unknown as Rec[];
const card = (config: Rec): Rec => YamlSchemaFactory.card.validate({ entity: 'sensor.a', ...config }).config as Rec;

describe('the shape a Multi hands its rows', () => {
  test('horizontal: a single_line row each', () => {
    const [row] = rows({ entities: ['sensor.a'], layout: 'horizontal', bar_position: 'overlay' });
    assert.equal(row.density, 'single_line');
  });

  test('vertical: a single_column each, the container placing every bar', () => {
    const handed = rows({
      layout: 'vertical',
      bar_position: 'overlay',
      entities: ['sensor.a', { entity: 'sensor.b', density: 'compact', bar_position: 'top' }],
    });
    for (const row of handed) {
      assert.equal(row.density, 'single_column');
      assert.equal(row.bar_position, 'overlay');
    }
  });
});

// The whole path a row config takes: the Multi's own negotiation, the split,
// then the row's own negotiation as the child card runs it.
const rendered = (multi: Rec): Rec[] => {
  const { config } = YamlSchemaFactory.multiCard.validate({ entities: ['sensor.a', 'sensor.b'], ...multi });
  return rows(config as Rec).map(card);
};

describe('what a Multi row renders with', () => {
  test('unset: horizontal rows, one a line', () => {
    for (const row of rendered({})) {
      assert.equal(row.layout, 'horizontal');
      assert.equal(row.density, 'single_line');
      assert.equal(row.bar_position, 'default');
    }
  });

  test('vertical: columns, each bar upright under its texts', () => {
    for (const row of rendered({ layout: 'vertical' })) {
      assert.equal(row.layout, 'vertical');
      assert.equal(row.bar_orientation, 'up');
      assert.equal(row.bar_position, 'default');
      assert.equal(row.multiline, false);
    }
  });

  test('vertical + overlay: every bar behind its texts, whatever a row asks', () => {
    const handed = rendered({
      layout: 'vertical',
      bar_position: 'overlay',
      entities: ['sensor.a', { entity: 'sensor.b', bar_position: 'default' }],
    });
    for (const row of handed) assert.equal(row.bar_position, 'overlay');
  });

  test('vertical: down travels, shared or per row', () => {
    const handed = rendered({
      layout: 'vertical',
      entities: ['sensor.a', { entity: 'sensor.b', bar_orientation: 'down' }],
    });
    assert.deepEqual(
      handed.map((row) => row.bar_orientation),
      ['up', 'down'],
    );
    for (const row of rendered({ layout: 'vertical', bar_orientation: 'down' }))
      assert.equal(row.bar_orientation, 'down');
  });

  test('horizontal: a row asking for a column stays a line', () => {
    const [row] = rendered({ entities: [{ entity: 'sensor.a', layout: 'vertical', density: 'single_column' }] });
    assert.equal(row.layout, 'horizontal');
    assert.equal(row.density, 'single_line');
  });

  test('a row keeps its own content_order and hide in a column', () => {
    const [row] = rendered({
      layout: 'vertical',
      hide: ['icon'],
      entities: [{ entity: 'sensor.a', content_order: ['value', 'name'] }],
    });
    assert.deepEqual(row.hide, ['icon']);
    assert.deepEqual(row.content_order, ['state_content', 'value', 'name', 'name_info', 'info', 'bar']);
  });
});

describe('the Multi schema', () => {
  test('layout defaults to horizontal, bar_position to default', () => {
    const { config } = YamlSchemaFactory.multiCard.validate({ entities: ['sensor.a'] });
    assert.equal(config?.layout, 'horizontal');
    assert.equal(config?.bar_position, 'default');
  });

  test('a column bar is default or overlay, nothing else', () => {
    assert.equal(YamlSchemaFactory.multiCard.validate({ entities: ['sensor.a'], bar_position: 'top' }).isValid, false);
  });

  test('the Feature has no columns', () => {
    const { config } = YamlSchemaFactory.multiFeature.validate({ entities: ['sensor.a'], layout: 'vertical' });
    assertUndefined(config?.layout);
    for (const row of rows(config as Rec)) assert.equal(row.density, 'single_line');
  });
});

describe('density: single_column', () => {
  test('a vertical stack, its bar upright', () => {
    const config = card({ density: 'single_column', layout: 'horizontal', bar_position: 'top', multiline: true });
    assert.equal(config.layout, 'vertical');
    assert.equal(config.bar_position, 'default');
    assert.equal(config.bar_orientation, 'up');
    assert.equal(config.multiline, false);
  });

  test('keeps overlay and down', () => {
    const config = card({ density: 'single_column', bar_position: 'overlay', bar_orientation: 'down' });
    assert.equal(config.bar_position, 'overlay');
    assert.equal(config.bar_orientation, 'down');
  });
});

describe('density: compact', () => {
  test('keeps the ring around the icon', () => {
    for (const layout of ['horizontal', 'vertical'])
      assert.equal(card({ density: 'compact', layout, bar_position: 'icon' }).bar_position, 'icon', layout);
  });

  test('a position it has no room for falls back to top', () => {
    assert.equal(card({ density: 'compact', bar_position: 'below' }).bar_position, 'top');
  });
});
