/*
 * layout: vertical turns a Multi-Card's rows into columns: each row card is
 * drawn as a vertical stack, its bar upright, and the card asks for the rows
 * a vertical card needs. The Feature has no columns.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';
import '../../../src/index.js';

type MultiEl = HTMLElement & {
  setConfig?: (c: unknown) => void;
  hass?: unknown;
  getGridOptions?: () => { rows: number };
};

const MULTI_CARD = 'entity-progress-multi-card';

const mount = async (tag: string, config: Record<string, unknown>) => {
  const el = document.createElement(tag) as MultiEl;
  el.setConfig?.({ type: `custom:${tag}`, entities: [TEST_ENTITY, TEST_ENTITY], ...config });
  document.body.appendChild(el);
  el.hass = makeHass();
  await flushFrames();
  await flushFrames();
  const rowClasses = [...(el.shadowRoot as ShadowRoot).querySelectorAll('entity-progress-card')].map(
    (row) => row.shadowRoot?.querySelector('ha-card')?.getAttribute('class') ?? '',
  );
  return { el, rowClasses };
};

describe('Multi-Card in columns', () => {
  test('each row is a vertical stack, its bar upright', async () => {
    const { rowClasses } = await mount(MULTI_CARD, { layout: 'vertical' });
    assert.equal(rowClasses.length, 2);
    for (const classes of rowClasses) {
      assert.match(classes, /\bvertical\b/);
      assert.match(classes, /\bup-orientation\b/);
    }
  });

  test('down keeps the upright rules', async () => {
    const { rowClasses } = await mount(MULTI_CARD, { layout: 'vertical', bar_orientation: 'down' });
    for (const classes of rowClasses) {
      assert.match(classes, /\bdown-orientation\b/);
      assert.match(classes, /\bup-orientation\b/);
    }
  });

  test('horizontal rows stay horizontal', async () => {
    const { rowClasses } = await mount(MULTI_CARD, {});
    for (const classes of rowClasses) assert.match(classes, /\bhorizontal\b/);
  });

  test('columns ask for a vertical card height, rows one per entity', async () => {
    assert.equal((await mount(MULTI_CARD, { layout: 'vertical' })).el.getGridOptions?.().rows, 3);
    assert.equal((await mount(MULTI_CARD, {})).el.getGridOptions?.().rows, 2);
    assert.equal((await mount(MULTI_CARD, { layout: 'vertical', rows: 4 })).el.getGridOptions?.().rows, 4);
  });

  test('the Feature ignores layout', async () => {
    const { el, rowClasses } = await mount('entity-progress-multi-feature', { layout: 'vertical' });
    for (const classes of rowClasses) assert.match(classes, /\bhorizontal\b/);
    assert.equal(el.shadowRoot?.querySelector('.multi-container.vertical'), null);
  });
});
