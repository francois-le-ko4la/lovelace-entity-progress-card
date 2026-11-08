/*
 * A duration entity reads in one working unit: a time `unit` when the config
 * sets one (seconds for timer/flextimer), else the entity's own. Its value,
 * min/max and a duration bound all follow that unit.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass } from '../../ha-stubs.js';
import '../../../src/index.js';

type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };

const FILTER = 'sensor.filter_time_left';
const LIFESPAN = 'sensor.filter_lifespan';

const stateOf = (entity: string, state: string, unit: string) => ({
  entity_id: entity,
  state,
  attributes: { device_class: 'duration', unit_of_measurement: unit },
  last_changed: new Date().toISOString(),
  last_updated: new Date().toISOString(),
});

const mount = async (extra: Record<string, unknown>) => {
  const el = document.createElement('entity-progress-card') as CardEl;
  el.setConfig?.({ type: 'custom:entity-progress-card', entity: FILTER, ...extra });
  document.body.appendChild(el);
  const base = makeHass() as { states: Record<string, unknown> };
  el.hass = makeHass({
    states: { ...base.states, [FILTER]: stateOf(FILTER, '132', 'h'), [LIFESPAN]: stateOf(LIFESPAN, '9000', 'min') },
  });
  await flushFrames();
  return el.shadowRoot?.querySelector('.secondary-info-main')?.textContent ?? '';
};

const digits = (text: string) => text.replace(/\D/g, '');

describe('a duration entity without a time unit', () => {
  test('reads max_value in its own unit', async () => {
    assert.equal(digits(await mount({ max_value: 150, unit: '%' })), '88');
  });

  test('a duration bound in another unit is converted to it', async () => {
    assert.equal(digits(await mount({ max_value: { entity: LIFESPAN }, unit: '%' })), '88');
  });
});

describe('a duration entity with a time unit', () => {
  test('h: the value as the entity states it', async () => {
    const text = await mount({ unit: 'h', max_value: 150 });
    assert.equal(digits(text), '132');
    assert.ok(text.includes('h'));
  });

  test('min: the value converted, with max_value in minutes', async () => {
    assert.equal(digits(await mount({ unit: 'min', max_value: 9000 })), '7920');
  });

  test('timer: formatted from seconds', async () => {
    assert.ok((await mount({ unit: 'timer', max_value: 540000 })).includes('132:00:00'));
  });
});
