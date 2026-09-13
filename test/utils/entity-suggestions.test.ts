import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { resolveEntitySuggestion } from '../../src/utils/entity-suggestions.js';
import type { HomeAssistant } from '../../src/utils/hass-provider.js';

const hass = (entityId: string, state: string, attributes: Record<string, unknown> = {}) =>
  ({ states: { [entityId]: { entity_id: entityId, state, attributes } } }) as unknown as HomeAssistant;

const suggest = (entityId: string, state: string, attributes: Record<string, unknown> = {}) =>
  resolveEntitySuggestion(hass(entityId, state, attributes), entityId)?.config ?? null;

describe('resolveEntitySuggestion - numeric-state domains', () => {
  for (const domain of ['sensor', 'number', 'input_number', 'counter']) {
    test(`${domain} needs no attribute - its state is already the value`, () => {
      assert.deepEqual(suggest(`${domain}.x`, '42'), { entity: `${domain}.x` });
    });
  }

  test('a text sensor has nothing numeric to show', () => {
    assert.equal(suggest('sensor.x', 'cloudy'), null);
  });

  test('timer is offered despite a non-numeric state - the card reads its duration natively', () => {
    assert.deepEqual(suggest('timer.x', 'active'), { entity: 'timer.x' });
  });
});

describe('resolveEntitySuggestion - attribute domains', () => {
  const cases: [string, string, Record<string, unknown>, string][] = [
    ['cover.x', 'open', { current_position: 60 }, 'current_position'],
    ['valve.x', 'open', { current_position: 60 }, 'current_position'],
    ['fan.x', 'on', { percentage: 33 }, 'percentage'],
    ['light.x', 'on', { brightness: 255 }, 'brightness'],
    ['humidifier.x', 'on', { current_humidity: 45 }, 'current_humidity'],
    ['water_heater.x', 'eco', { current_temperature: 55 }, 'current_temperature'],
    ['media_player.x', 'playing', { volume_level: 0.4 }, 'volume_level'],
  ];

  for (const [entityId, state, attributes, attribute] of cases) {
    test(`${entityId.split('.')[0]} reads ${attribute}`, () => {
      assert.deepEqual(suggest(entityId, state, attributes), { entity: entityId, attribute });
    });
  }

  test('climate offers its current reading, not the target it cannot disambiguate', () => {
    assert.deepEqual(suggest('climate.x', 'heat', { temperature: 21, current_temperature: 19 }), {
      entity: 'climate.x',
      attribute: 'current_temperature',
    });
  });

  test('an attribute that is missing or not a number rules the entity out', () => {
    assert.equal(suggest('light.x', 'off', {}), null);
    assert.equal(suggest('fan.x', 'on', { percentage: 'high' }), null);
  });
});

describe('resolveEntitySuggestion - refusals', () => {
  test('an unknown domain is left alone rather than guessed', () => {
    assert.equal(suggest('lock.x', 'locked'), null);
  });

  test('an entity absent from hass yields nothing', () => {
    assert.equal(resolveEntitySuggestion(hass('sensor.x', '42'), 'sensor.missing'), null);
  });
});

// A scaled attribute is normalized to 0-100 by EntityHelper; a max_value
// repeating that native scale would divide the fill a second time (a light at
// full brightness rendered 39%).
describe('resolveEntitySuggestion - never scales a value twice', () => {
  test('no suggestion carries a max_value, scaled attributes included', () => {
    const scaled = [
      suggest('light.x', 'on', { brightness: 255 }),
      suggest('media_player.x', 'playing', { volume_level: 1 }),
    ];
    for (const config of scaled) assert.equal('max_value' in (config as object), false);
  });
});
