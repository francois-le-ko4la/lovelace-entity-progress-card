/*
 * center_zero on an entity that brings its own range (a number, a counter).
 * Each arm scales on its own half, so only a value below the zero point shows
 * which minimum the card fell back to: -25 over a -50 floor is half the arm,
 * over the -100 the card used to fill in, a quarter.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass } from '../../ha-stubs.js';
import '../../../src/index.js';

const NUMBER = 'number.setpoint';

type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };

const valueNowFor = async (option: Record<string, unknown>) => {
  const el = document.createElement('entity-progress-card') as CardEl;
  el.setConfig?.({ type: 'custom:entity-progress-card', entity: NUMBER, center_zero: true, ...option });
  document.body.appendChild(el);
  el.hass = makeHass({
    states: {
      [NUMBER]: { entity_id: NUMBER, state: '-25', attributes: { min: -50, max: 10, friendly_name: 'Setpoint' } },
    },
  });
  await flushFrames();
  return el.shadowRoot?.querySelector('.bar-container')?.getAttribute('aria-valuenow');
};

describe('center_zero on a number keeps the range the entity brings', () => {
  test('its own min already reaches below zero, so -25 is half the negative arm', async () => {
    assert.equal(await valueNowFor({}), '-50');
  });

  test('a min_value the user wrote still wins over it', async () => {
    assert.equal(await valueNowFor({ min_value: -100 }), '-25');
  });
});
