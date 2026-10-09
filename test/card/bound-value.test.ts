import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  boundFrom,
  boundState,
  boundUsable,
  boundValue,
  isEntityBound,
  isFaultState,
  refreshBound,
  usableBoundValue,
} from '../../src/card/bound-value.js';
import { EntityHelper } from '../../src/card/entity-helper.js';
import { HassProviderSingleton } from '../../src/utils/hass-provider.js';

const TEMPERATURE = 'sensor.temperature';

HassProviderSingleton.getInstance().hass = {
  states: {
    [TEMPERATURE]: { entity_id: TEMPERATURE, state: '21', attributes: { device_class: 'temperature' } },
    'sensor.gone': { entity_id: 'sensor.gone', state: 'unavailable', attributes: {} },
  },
  locale: { language: 'en', number_format: 'comma_decimal' },
  config: { unit_system: { temperature: '°C' } },
  entities: {},
  devices: {},
  areas: {},
  floors: {},
} as never;

const entityBound = (config: Parameters<typeof boundFrom>[0]): EntityHelper => {
  const bound = boundFrom(config, null);
  assert.ok(isEntityBound(bound));
  return bound;
};

describe('boundFrom - one decision per config shape', () => {
  test('a number is kept as is', () => {
    assert.equal(boundFrom(42, null), 42);
    assert.equal(boundFrom(0, 100), 0);
  });

  test('nothing configured takes the fallback, or stays empty', () => {
    const absent: { config?: number } = {};
    assert.equal(boundFrom(absent.config, 100), 100);
    assert.equal(boundFrom(null, null), null);
  });

  test('an {entity} object gives an entity', () => {
    assert.equal(entityBound({ entity: TEMPERATURE }).entityId, TEMPERATURE);
  });

  test('the attribute travels with the entity', () => {
    assert.equal(entityBound({ entity: TEMPERATURE, attribute: 'humidity' }).attribute, 'humidity');
    assert.equal(entityBound({ entity: TEMPERATURE }).attribute, null);
  });

  test('a Jinja object is fed elsewhere: no bound, not even the fallback', () => {
    assert.equal(boundFrom({ jinja: '{{ 1 }}' }, 100), null);
  });

  test('an object with neither entity nor Jinja takes the fallback', () => {
    assert.equal(boundFrom({ attribute: 'x' }, 100), 100);
  });
});

describe('a bound that is not an entity never waits for anything', () => {
  test('a number or nothing is usable and carries no state', () => {
    for (const bound of [7, null]) {
      assert.equal(boundUsable(bound), true);
      assert.equal(boundState(bound), null);
      refreshBound(bound);
    }
  });

  test('boundValue answers the number, or null for nothing', () => {
    assert.equal(boundValue(7), 7);
    assert.equal(boundValue(null), null);
  });
});

describe('an entity bound reads through its helper', () => {
  test('value and state are the helper own, once refreshed', () => {
    const bound = entityBound({ entity: TEMPERATURE });
    refreshBound(bound);
    assert.equal(boundValue(bound), bound.current);
    assert.equal(boundState(bound), bound.state);
  });

  test('an unknown entity is in a fault state: its 0 is not a value', () => {
    const bound = entityBound({ entity: 'sensor.nope' });
    refreshBound(bound);
    assert.equal(boundUsable(bound), false);
    assert.equal(usableBoundValue(bound), null);
  });

  test('an entity in an unavailable state is in a fault state too', () => {
    const bound = entityBound({ entity: 'sensor.gone' });
    refreshBound(bound);
    assert.equal(boundUsable(bound), false);
    assert.equal(usableBoundValue(bound), null);
  });

  test('a healthy entity reads through', () => {
    const bound = entityBound({ entity: TEMPERATURE });
    refreshBound(bound);
    assert.equal(boundUsable(bound), true);
    assert.equal(usableBoundValue(bound), bound.current);
  });
});

describe('isFaultState', () => {
  test('unavailable, unknown and not found are faults; a reading or nothing is not', () => {
    for (const state of ['unavailable', 'unknown']) assert.equal(isFaultState(state), true);
    for (const state of ['on', '21', null]) assert.equal(isFaultState(state), false);
  });
});
