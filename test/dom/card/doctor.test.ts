/*
 * EPB.doctor.cards() and .inspect(): our cards found through every shadow root
 * - a Multi's rows included - and one of them reached from a number or from
 * any element inside it, the way $0 points at one in the DevTools.
 */

import { test, describe, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';

import '../../../src/index.js';
import { cards, inspect } from '../../../src/card/doctor.js';

type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };

const CARD = 'entity-progress-card';
const MULTI = 'entity-progress-multi-card';

const mount = (tag: string, config: Record<string, unknown>): CardEl => {
  const el = document.createElement(tag) as CardEl;
  el.setConfig?.({ type: `custom:${tag}`, ...config });
  document.body.appendChild(el);
  el.hass = makeHass();
  return el;
};

describe('EPB.doctor - the cards on this page', () => {
  let card: CardEl;

  // A browser console shows an element as a node; Node's walks happy-dom's
  // whole window into it and runs out of memory. The returns are what we test.
  const muted = { info: console.info, table: Reflect.get(console, 'table') as unknown };
  before(() => {
    console.info = () => undefined;
    Reflect.set(console, 'table', () => undefined);
  });
  // dom-setup empties the page after every test.
  beforeEach(async () => {
    card = mount(CARD, { entity: TEST_ENTITY });
    mount(MULTI, { entities: [TEST_ENTITY, TEST_ENTITY] });
    await flushFrames();
  });
  after(() => {
    Object.assign(console, muted);
  });

  test("cards() finds a card, a Multi and the Multi's own rows", () => {
    const found = cards().map((element) => element.localName);
    assert.equal(found.filter((tag) => tag === MULTI).length, 1);
    assert.equal(found.filter((tag) => tag === CARD).length, 3, 'the card and its two Multi rows');
  });

  test('inspect() climbs from an element inside the card to the card', () => {
    const inner = card.shadowRoot?.querySelector('ha-card');
    assert.ok(inner, 'no ha-card inside the card');
    const report = inspect(inner);
    assert.ok(report?.element === card, 'inspect() reached another element');
    assert.equal(report?.entity, TEST_ENTITY);
    const drawnFrom = report?.drawnFrom as { value: number; min: number; max: number };
    assert.deepEqual([drawnFrom.value, drawnFrom.min, drawnFrom.max], [42, 0, 100]);
  });

  test('inspect() takes the number cards() lists, and says so when nothing matches', () => {
    assert.ok(inspect(cards().indexOf(card))?.element === card, 'inspect(n) reached another element');
    assert.equal(inspect(document.body), null);
  });

  test('a Multi row says which card it sits in', () => {
    const row = cards().find((element) => element.getRootNode() !== document);
    assert.equal(inspect(row)?.inside, MULTI);
  });

  test('a sound card, an entity not found, a deprecated option: each says so', async () => {
    const missing = mount(CARD, { entity: 'sensor.missing' });
    const deprecated = mount(CARD, { entity: TEST_ENTITY, disable_unit: true });
    await flushFrames();
    assert.deepEqual([inspect(card)?.config, inspect(card)?.['entity state']], ['✅ ok', '✅ ok']);
    assert.equal(inspect(missing)?.['entity state'], '🚫 not found');
    const report = inspect(deprecated);
    assert.equal(report?.config, '⚠️ deprecated');
    assert.match(String(report?.details), /deprecated: disable_unit/);
  });
});
