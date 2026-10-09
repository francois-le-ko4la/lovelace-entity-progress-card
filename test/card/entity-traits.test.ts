/*
 * What an entity's domain, device class and state make of it: the default
 * color (HA's own state-color variables), the value kind, and whether an
 * icon may animate. Every expected color is a real HA theme variable, built
 * with the same name helper the card uses.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { EntityHelper, hasUsableHistory } from '../../src/card/entity-helper.js';
import { isStateActive, isToggleDomain } from '../../src/card/ha-state.js';
import { HassProviderSingleton } from '../../src/utils/hass-provider.js';
import { isToggleDomainEntity } from '../../src/card/schema.js';
import { stateColorName } from '../../src/utils/ha-context.js';

const entities: Record<string, { state: string; attributes?: Record<string, unknown> }> = {
  'light.on': { state: 'on', attributes: { brightness: 255 } },
  'light.off': { state: 'off' },
  'cover.open': { state: 'open', attributes: { current_position: 0 } },
  'cover.closed': { state: 'closed', attributes: { current_position: 0 } },
  'fan.on': { state: 'on', attributes: { percentage: 0 } },
  'fan.off': { state: 'off' },
  'climate.heat': { state: 'heat' },
  'climate.heat_cool': { state: 'heat_cool' },
  'climate.auto': { state: 'auto' },
  'climate.off': { state: 'off' },
  'timer.active': {
    state: 'active',
    attributes: { duration: '0:10:00', finishes_at: new Date(Date.now() + 60000).toISOString() },
  },
  'timer.idle': { state: 'idle', attributes: { duration: '0:10:00' } },
  'sensor.battery_low': { state: '29', attributes: { device_class: 'battery' } },
  'sensor.battery_medium': { state: '30', attributes: { device_class: 'battery' } },
  'sensor.battery_high': { state: '70', attributes: { device_class: 'battery' } },
  'sensor.temperature': { state: '21', attributes: { device_class: 'temperature' } },
  'sensor.uptime': { state: '42', attributes: { device_class: 'duration', unit_of_measurement: 's' } },
  'binary_sensor.daylight': { state: 'on', attributes: { device_class: 'light' } },
  'binary_sensor.gas': { state: 'on', attributes: { device_class: 'gas' } },
  'lock.front': { state: 'locked' },
  'switch.plug': { state: 'on' },
  'group.lights': { state: 'on', attributes: { entity_id: ['light.on', 'light.off'] } },
  'group.mixed': { state: 'on', attributes: { entity_id: ['light.on', 'switch.plug'] } },
  'input_number.level': { state: '5', attributes: { min: 0, max: 10 } },
  'number.level': { state: '5', attributes: { min: 0, max: 10 } },
  'counter.visits': { state: '3', attributes: { minimum: 0, maximum: 9 } },
};

HassProviderSingleton.getInstance().hass = {
  states: Object.fromEntries(
    Object.entries(entities).map(([id, { state, attributes = {} }]) => [id, { entity_id: id, state, attributes }]),
  ),
  locale: { language: 'en', number_format: 'comma_decimal' },
  config: { unit_system: { temperature: '°C' } },
  entities: {},
  devices: {},
  areas: {},
  floors: {},
} as never;

const helperFor = (entityId: string, attribute?: string): EntityHelper => {
  const helper = new EntityHelper();
  helper.entityId = entityId;
  if (attribute) helper.attribute = attribute;
  helper.refresh();
  return helper;
};

const cssVar = (...parts: string[]) => `var(${stateColorName(...parts)})`;
const ACTIVE = cssVar('active');
const UPTIME = 'sensor.uptime';
const INPUT_NUMBER = 'input_number.level';
const INACTIVE = cssVar('inactive');

describe('defaultColor - HA state colors, first defined variable wins', () => {
  const cases: [string, string | null][] = [
    ['light.on', cssVar('light', 'active')],
    ['light.off', INACTIVE],
    ['cover.open', cssVar('cover', 'active')],
    ['cover.closed', INACTIVE],
    ['fan.on', cssVar('fan', 'active')],
    ['fan.off', INACTIVE],
    ['climate.heat', cssVar('climate', 'heat')],
    ['climate.heat_cool', ACTIVE],
    ['climate.auto', cssVar('climate', 'auto')],
    ['climate.off', INACTIVE],
    ['timer.active', ACTIVE],
    ['timer.idle', INACTIVE],
    ['sensor.battery_low', cssVar('sensor', 'battery', 'low')],
    ['sensor.battery_medium', cssVar('sensor', 'battery', 'medium')],
    ['sensor.battery_high', cssVar('sensor', 'battery', 'high')],
    ['sensor.temperature', null],
    ['binary_sensor.daylight', cssVar('binary_sensor', 'active')],
    ['binary_sensor.gas', cssVar('binary_sensor', 'gas', 'on')],
    ['lock.front', cssVar('lock', 'locked')],
    ['switch.plug', cssVar('switch', 'active')],
    ['group.lights', cssVar('light', 'active')],
    ['group.mixed', ACTIVE],
  ];
  for (const [entityId, expected] of cases) {
    test(entityId, () => assert.equal(helperFor(entityId).defaultColor, expected));
  }
});

describe('valueKind - how value, min and max are read', () => {
  const cases: [string, string, string?][] = [
    ['timer.idle', 'timer'],
    ['counter.visits', 'counter'],
    ['number.level', 'number'],
    [INPUT_NUMBER, 'number'],
    [UPTIME, 'duration'],
    [UPTIME, 'default', 'unit_of_measurement'],
    ['sensor.temperature', 'default'],
    ['light.on', 'default'],
  ];
  for (const [entityId, expected, attribute] of cases) {
    test(`${entityId}${attribute ? ` (${attribute})` : ''}`, () =>
      assert.equal(helperFor(entityId, attribute).valueKind, expected));
  }

  test('input_number reads its own min and max', () => {
    assert.deepEqual(helperFor(INPUT_NUMBER).reading, { kind: 'ranged', current: 5, min: 0, max: 10 });
  });
});

describe('isStateActive - HA state_active.ts', () => {
  const cases: [string, string, boolean][] = [
    ['light', 'on', true],
    ['light', 'off', false],
    ['cover', 'closed', false],
    ['cover', 'opening', true],
    ['lock', 'locked', false],
    ['vacuum', 'docked', false],
    ['media_player', 'standby', false],
    ['media_player', 'idle', true],
    ['alert', 'off', true],
    ['alert', 'idle', false],
    ['timer', 'paused', false],
    ['timer', 'active', true],
    ['button', '2026-01-01T00:00:00Z', true],
    ['sensor', 'unavailable', false],
  ];
  for (const [domain, state, expected] of cases) {
    test(`${domain} ${state}`, () => assert.equal(isStateActive(domain, state), expected));
  }
});

describe('isToggleDomain - where the tile card icon toggles by default', () => {
  test('toggles', () => {
    for (const domain of ['light', 'switch', 'valve', 'group', 'button', 'input_button', 'scene'])
      assert.equal(isToggleDomain(domain), true, domain);
  });
  test('does not', () => {
    for (const domain of ['climate', 'cover', 'media_player', 'script', 'vacuum', 'water_heater', 'sensor'])
      assert.equal(isToggleDomain(domain), false, domain);
  });
});

describe('default icon tap follows the tile card', () => {
  test('a light toggles, a climate does not', () => {
    assert.equal(isToggleDomainEntity('light.on'), true);
    assert.equal(isToggleDomainEntity('climate.living_room'), false);
  });
});

describe('hasUsableHistory follows the value kind', () => {
  test('input_number keeps a history like number', () => {
    assert.equal(hasUsableHistory(INPUT_NUMBER), true);
  });
});
