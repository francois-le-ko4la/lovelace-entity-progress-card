/*
 * The range the editor hints for an unset min_value/max_value is the range the
 * card then draws from: same config, same states, one answer. A range the
 * entity brings itself (number, input_number, counter) and center_zero both
 * moved it once without the other noticing.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';

import '../../../src/index.js';
import '../../../src/editor/entry.js';

type Drawn = { min: number; max: number };
type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown; _cardView?: { drawnFrom: Drawn } };
type EditorEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };
type FieldEl = HTMLElement & { value?: unknown; placeholder?: unknown };

const NUMBER = 'number.setpoint';
const LEVEL = 'number.level';

const states = {
  [TEST_ENTITY]: { entity_id: TEST_ENTITY, state: '42', attributes: { friendly_name: 'Battery' } },
  [NUMBER]: { entity_id: NUMBER, state: '-25', attributes: { min: -50, max: 10 } },
  [LEVEL]: { entity_id: LEVEL, state: '5', attributes: { min: 0, max: 10 } },
  'input_number.temperature': {
    entity_id: 'input_number.temperature',
    state: '21.5',
    attributes: { min: -20, max: 40 },
  },
  'counter.visits': { entity_id: 'counter.visits', state: '3', attributes: { minimum: 0, maximum: 9 } },
};

const cardDrawsFrom = async (config: Record<string, unknown>): Promise<Drawn> => {
  const el = document.createElement('entity-progress-card') as CardEl;
  el.setConfig?.({ type: 'custom:entity-progress-card', ...config });
  document.body.appendChild(el);
  el.hass = makeHass({ states });
  await flushFrames();
  const drawn = el._cardView?.drawnFrom;
  el.remove();
  assert.ok(drawn, 'the card built no view');
  return drawn;
};

// What the field tells: the number the user wrote, else its greyed hint.
const editorShows = async (tag: string, config: Record<string, unknown>): Promise<Drawn> => {
  const el = document.createElement(tag) as EditorEl;
  el.hass = makeHass({ states });
  el.setConfig?.({ type: 'custom:entity-progress-card', ...config });
  document.body.appendChild(el);
  await flushFrames();
  const shown = (name: string) => {
    const field = (el.shadowRoot as ShadowRoot).querySelector(`[id="${name}"]`) as FieldEl | null;
    assert.ok(field, `no field named ${name}`);
    return Number(typeof field.value === 'number' ? field.value : field.placeholder);
  };
  const result = { min: shown('min_value'), max: shown('max_value') };
  el.remove();
  return result;
};

const cases: { label: string; config: Record<string, unknown> }[] = [
  { label: 'a plain sensor', config: { entity: TEST_ENTITY } },
  { label: 'a plain sensor, center_zero', config: { entity: TEST_ENTITY, center_zero: true } },
  {
    label: 'a plain sensor, center_zero and max_value',
    config: { entity: TEST_ENTITY, center_zero: true, max_value: 30 },
  },
  {
    label: 'a plain sensor, center_zero and a raw-value theme',
    config: { entity: TEST_ENTITY, center_zero: true, theme: 'temperature' },
  },
  { label: 'a number', config: { entity: NUMBER } },
  { label: 'a number, center_zero (own min below zero)', config: { entity: NUMBER, center_zero: true } },
  { label: 'a number, center_zero (own min at zero)', config: { entity: LEVEL, center_zero: true } },
  { label: 'a number, min_value written', config: { entity: NUMBER, min_value: -100 } },
  { label: 'a number, max_value written', config: { entity: NUMBER, max_value: 50 } },
  { label: 'a number, center_zero and max_value written', config: { entity: LEVEL, center_zero: true, max_value: 20 } },
  { label: 'an input_number', config: { entity: 'input_number.temperature' } },
  { label: 'a counter', config: { entity: 'counter.visits' } },
];

// A Multi row is edited with the card's own options: same hint, same card.
const editors = [
  'entity-progress-card-editor',
  'entity-progress-multi-card-row-editor',
  'entity-progress-multi-feature-row-editor',
];

describe('the editor hints the range the card draws from', () => {
  for (const tag of editors) {
    for (const { label, config } of cases) {
      test(`${tag}: ${label}`, async () => {
        const drawn = await cardDrawsFrom(config);
        assert.deepEqual(await editorShows(tag, config), { min: drawn.min, max: drawn.max });
      });
    }
  }
});
