/*
 * bar_position: icon draws the bar as a ring round the icon (styles.ts): no
 * straight bar is built, the ring's layers sit in the shape, and the bar's own
 * marks reach their ring twins through the same shown/wm-* classes.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../ha-stubs.js';
import '../../src/index.js';

type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };

const CARD = 'entity-progress-card';
const RING = { bar_position: 'icon' };

const mount = async (tag: string, extra: Record<string, unknown>) => {
  const el = document.createElement(tag) as CardEl;
  el.setConfig?.({ type: `custom:${tag}`, entity: TEST_ENTITY, ...extra });
  document.body.appendChild(el);
  el.hass = makeHass();
  await flushFrames();
  return el;
};

const haCard = (el: Element) => el.shadowRoot?.querySelector('ha-card') ?? null;

describe('bar_position: icon', () => {
  test('a ring instead of a bar: no bar container, the layers in the shape', async () => {
    const root = (await mount(CARD, RING)).shadowRoot;
    assert.ok(haCard(root?.host as Element)?.classList.contains('bar-around-icon'));
    assert.equal(root?.querySelector('.bar-container'), null, 'a straight bar was built');
    for (const layer of ['ring-low', 'ring-high', 'ring-range', 'ring-min', 'ring-max', 'ring-avg', 'ring-mark']) {
      assert.ok(root?.querySelector(`.shape .${layer}`), `no ${layer} in the shape`);
    }
  });

  test('a screen reader still gets a progressbar, kept at the value', async () => {
    const progress = (await mount(CARD, RING)).shadowRoot?.querySelector('[role="progressbar"]');
    assert.ok(progress, 'no progressbar left once the bar is a ring');
    assert.equal(progress.getAttribute('aria-valuenow'), '42');
  });

  test('never the class "icon": the icon element owns it', async () => {
    const el = await mount(CARD, RING);
    assert.equal(haCard(el)?.classList.contains('icon'), false);
  });

  test("a watermark reaches its ring twin, shown and typed like the bar's own", async () => {
    const el = await mount(CARD, { ...RING, watermark: { low: 20, high: 80, type: 'line' } });
    const low = el.shadowRoot?.querySelector('.ring-low');
    assert.ok(low?.classList.contains('shown'), 'the low mark is not shown');
    assert.ok(low?.classList.contains('wm-line'), 'the low mark lost its type');
  });

  test('xlarge thickens the ring, it adds no grid row', async () => {
    const ring = await mount(CARD, { ...RING, bar_size: 'xlarge' });
    const plain = await mount(CARD, {});
    const rows = (el: Element) => (el as unknown as { _cardView: { minGridRows: number } })._cardView.minGridRows;
    assert.equal(rows(ring), rows(plain));
  });

  test('a badge takes it too, and nothing past default and icon', async () => {
    const badge = await mount('entity-progress-badge', RING);
    assert.ok(haCard(badge)?.classList.contains('bar-around-icon'));
    const top = await mount('entity-progress-badge', { bar_position: 'top' });
    assert.equal(haCard(top)?.classList.contains('top'), false, 'a badge accepted bar_position: top');
  });
});
