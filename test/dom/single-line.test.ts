/*
 * density: single_line puts icon, name, secondary and bar on one row. The bar
 * has to leave .secondary-info to become a sibling of the text groups - that
 * relocation is the whole mode, so it is what these assert.
 *
 * Not to be confused with bar_single_line, which compacts an overlay bar and
 * owns the neighbouring `single-line` class.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../ha-stubs.js';
import '../../src/index.js';

const CONTENT = '.content-section';
const BAR = '.bar-container';
const INFO_ROW = '.info-row';

const mount = async (extra: Record<string, unknown>) => {
  const el = document.createElement('entity-progress-card') as HTMLElement & {
    setConfig?: (c: unknown) => void;
    hass?: unknown;
  };
  el.setConfig?.({ type: 'custom:entity-progress-card', entity: TEST_ENTITY, name: 'Garage', ...extra });
  document.body.appendChild(el);
  el.hass = makeHass();
  await flushFrames();
  return el.shadowRoot as ShadowRoot;
};

describe('density: single_line', () => {
  test('the bar leaves secondary-info and becomes a sibling of the groups', async () => {
    const plain = await mount({});
    assert.ok(plain.querySelector(`.secondary-info ${BAR}`), 'baseline keeps the bar inside secondary-info');

    const row = await mount({ density: 'single_line' });
    assert.equal(row.querySelector(`.secondary-info ${BAR}`), null, 'the bar must leave secondary-info');
    assert.ok(row.querySelector(`${CONTENT} > ${BAR}`), 'the bar must sit directly in the content row');
  });

  test('name and secondary share one box, so the row truncates once', async () => {
    const plain = await mount({});
    assert.equal(plain.querySelector(INFO_ROW), null, 'no extra box outside single_line');

    const row = await mount({ density: 'single_line' });
    const infoRow = row.querySelector(`${CONTENT} > ${INFO_ROW}`);
    assert.ok(infoRow, 'the text groups must share one box in the content row');
    assert.ok(infoRow.querySelector('.name'), 'name inside it');
    assert.ok(infoRow.querySelector('.secondary-info'), 'secondary info inside it too');
    assert.equal(infoRow.querySelector(BAR), null, 'the bar stays out of the text box');
  });

  // Not the same case as hiding secondary_info itself: the box is asked for,
  // it just has nothing to put in it once the value is gone.
  test('a row whose text all went blank stops claiming the row gap', async () => {
    const row = await mount({ density: 'single_line', hide: ['icon', 'name', 'value'] });
    const infoRow = row.querySelector(INFO_ROW) as HTMLElement | null;
    assert.ok(infoRow, 'the box is still built - the value could come back on a push');
    assert.ok(
      row.querySelector('ha-card.secondary-info-blank'),
      'the card must know its secondary info came out empty',
    );
  });

  test('vertical is negotiated back to horizontal - the mode has no other shape', async () => {
    const row = await mount({ density: 'single_line', layout: 'vertical' });
    assert.ok(row.querySelector('ha-card.horizontal'), 'layout should have been forced to horizontal');
    assert.ok(row.querySelector(`${CONTENT} > ${BAR}`), 'and the row shape still applies');
  });

  test('it composes with a static hide, down to a bar-only row', async () => {
    const row = await mount({ density: 'single_line', hide: ['icon', 'name', 'secondary_info'] });
    assert.equal(row.querySelector('.icon-section'), null, 'icon subtree still dropped');
    assert.ok(row.querySelector(`${CONTENT} > ${BAR}`), 'the bar survives every hide');
    // An empty text box is not free: it keeps claiming its share of the row's
    // own gap, which reads as a margin to the left of a lone bar.
    assert.equal(row.querySelector(INFO_ROW), null, 'nothing left to wrap, so no box');
    assert.equal(row.querySelector('.secondary-info'), null, 'nor an empty secondary-info');
    assert.equal((row.querySelector(CONTENT) as HTMLElement).childElementCount, 1, 'the bar is alone in the row');
  });
});
