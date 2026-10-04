/*
 * hasUsableHistory: the one rule the card fetches history by (peak_marker,
 * trend_indicator) and the editor offers peak_marker by - so the editor never
 * offers a mark the card would draw nothing for.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { hasUsableHistory } from '../../src/card/entity-helper.js';
import { HassProviderSingleton } from '../../src/utils/hass-provider.js';

const SENSOR = 'sensor.temperature';

const state = (entityId: string, attributes: Record<string, unknown> = {}) => ({
  [entityId]: { entity_id: entityId, state: '42', attributes },
});

HassProviderSingleton.getInstance().hass = {
  states: {
    ...state(SENSOR, { device_class: 'temperature' }),
    ...state('number.target'),
    ...state('timer.laundry'),
    ...state('counter.visits'),
    ...state('sensor.uptime', { device_class: 'duration' }),
  },
  locale: { language: 'en', number_format: 'comma_decimal' },
  config: { unit_system: { temperature: '°C' } },
  entities: {},
  devices: {},
  areas: {},
  floors: {},
} as never;

describe('hasUsableHistory - what the recorder keeps a numeric history of', () => {
  test('a sensor or a number does', () => {
    assert.equal(hasUsableHistory(SENSOR), true);
    assert.equal(hasUsableHistory('number.target'), true);
  });

  test('a timer, a counter or a duration does not', () => {
    for (const entity of ['timer.laundry', 'counter.visits', 'sensor.uptime'])
      assert.equal(hasUsableHistory(entity), false, entity);
  });

  test('an attribute does not, whatever its entity', () => {
    assert.equal(hasUsableHistory(SENSOR, 'battery'), false);
  });

  test('no entity, nothing to read', () => {
    assert.equal(hasUsableHistory(''), false);
    assert.equal(hasUsableHistory(null), false);
  });
});
