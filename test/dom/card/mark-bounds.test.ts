/*
 * The bounds a card reads besides min/max - watermark low/high and alert_when
 * above/below - when they are bound to another entity: they follow it on every
 * hass update, a bad state costs only their own mark or alert, and a new config
 * starts from scratch. Pins the behavior across moving their state out of
 * the view.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';
import '../../../src/index.js';

type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };

const LIMIT = 'sensor.limit';
const TIMER = 'timer.kitchen';
const LOW_VAR = '--low-watermark-value';
const ALERT = 'alert-active';

const stateOf = (entity: string, state: string, attributes: Record<string, unknown> = {}) => ({
  entity_id: entity,
  state,
  attributes,
  last_changed: new Date().toISOString(),
  last_updated: new Date().toISOString(),
});

const hassWith = (limit: string) => {
  const base = makeHass() as { states: Record<string, unknown> };
  return makeHass({
    states: {
      ...base.states,
      [LIMIT]: stateOf(LIMIT, limit, { unit_of_measurement: '%' }),
      [TIMER]: stateOf(TIMER, 'idle', { duration: '0:10:00' }),
    },
  });
};

const mount = async (extra: Record<string, unknown>, limit = '30') => {
  const el = document.createElement('entity-progress-card') as CardEl;
  const full = (config: Record<string, unknown>) => ({ type: 'custom:entity-progress-card', entity: TEST_ENTITY, ...config });
  el.setConfig?.(full(extra));
  document.body.appendChild(el);
  el.hass = hassWith(limit);
  await flushFrames();
  const root = el.shadowRoot as ShadowRoot;
  const card = () => root.querySelector('ha-card') as HTMLElement;
  const mark = (side: 'low' | 'high') => root.querySelector(`.bar-container .${side}`) as HTMLElement | null;
  const update = async (next: string) => {
    el.hass = hassWith(next);
    await flushFrames();
  };
  const reconfigure = async (config: Record<string, unknown>) => {
    el.setConfig?.(full(config));
    await flushFrames();
  };
  return { card, mark, update, reconfigure };
};

describe('a watermark bound to an entity', () => {
  test('follows the entity on every hass update', async () => {
    const { card, update } = await mount({ watermark: { low: { entity: LIMIT } } });
    assert.equal(card().style.getPropertyValue(LOW_VAR), '30%');
    await update('55');
    assert.equal(Math.round(Number.parseFloat(card().style.getPropertyValue(LOW_VAR))), 55);
  });

  test('an unusable state hides its own mark and leaves the other one', async () => {
    const { mark, update } = await mount({ watermark: { low: { entity: LIMIT }, high: 80 } });
    assert.ok(mark('low')?.classList.contains('shown'));
    await update('unavailable');
    assert.ok(!mark('low')?.classList.contains('shown'), 'the bound side has no value to draw');
    assert.ok(mark('high')?.classList.contains('shown'));
  });

  test('a new config drops the bound entity', async () => {
    const { mark, reconfigure } = await mount({ watermark: { low: { entity: LIMIT } } });
    assert.ok(mark('low')?.classList.contains('shown'));
    await reconfigure({});
    assert.ok(!mark('low')?.classList.contains('shown'));
  });
});

describe('a watermark on a timer', () => {
  test('takes the value as a percentage, not as a duration', async () => {
    const { card } = await mount({ entity: TIMER, watermark: { low: 30, high: 70 } });
    assert.equal(card().style.getPropertyValue(LOW_VAR), '30%');
    assert.equal(card().style.getPropertyValue('--high-watermark-value'), '70%');
  });
});

describe('alert_when above/below bound to an entity', () => {
  test('above: follows the entity, over the value 42 or under it', async () => {
    const { card, update } = await mount({ alert_when: { above: { entity: LIMIT } } }, '100');
    assert.ok(!card().classList.contains(ALERT), 'limit 100 over 42: no alert');
    await update('10');
    assert.ok(card().classList.contains(ALERT), 'limit 10 under 42: alert');
  });

  test('below: follows the entity', async () => {
    const { card, update } = await mount({ alert_when: { below: { entity: LIMIT } } }, '10');
    assert.ok(!card().classList.contains(ALERT), 'limit 10 under 42: no alert');
    await update('100');
    assert.ok(card().classList.contains(ALERT), 'limit 100 over 42: alert');
  });

  test('an unusable state raises nothing', async () => {
    const { card } = await mount({ alert_when: { above: { entity: LIMIT } } }, 'unavailable');
    assert.ok(!card().classList.contains(ALERT));
  });

  test('a new config drops the bound entity', async () => {
    const { card, reconfigure } = await mount({ alert_when: { above: { entity: LIMIT } } }, '10');
    assert.ok(card().classList.contains(ALERT));
    await reconfigure({});
    assert.ok(!card().classList.contains(ALERT));
  });
});
