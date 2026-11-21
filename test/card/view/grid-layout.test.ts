import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { assertUndefined } from '../../helpers.js';
import { YamlSchemaFactory } from '../../../src/card/config/schema.js';
import { cardLayoutOptions, type GridInputs } from '../../../src/card/view/core/grid-layout.js';

const layoutOf = (overrides: Record<string, unknown>) =>
  cardLayoutOptions({
    config: YamlSchemaFactory.card.validate({ entity: 'sensor.test', ...overrides }).config as GridInputs['config'],
    isHidden: () => false,
    isRing: false,
  });

describe('cardLayoutOptions - density: compact', () => {
  test('pins the height but only floors the width (#151)', () => {
    const grid = layoutOf({ density: 'compact' });
    assert.equal(grid.grid_columns, grid.grid_min_columns);
    assert.equal(grid.grid_max_rows, grid.grid_rows);
    assertUndefined(grid.grid_max_columns);
  });
});
