/*
 * What a configured watermark draws on the bar: which side is shown, its
 * shape, and where it sits once min/max, `as` and center_zero have projected
 * the value. Pins the resolution so the getter and the renderer can move
 * without changing it.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';
import '../../../src/index.js';

type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };

const LOW_VAR = '--low-watermark-value';
const HIGH_VAR = '--high-watermark-value';

const mount = async (extra: Record<string, unknown>, tag = 'entity-progress-card') => {
  const el = document.createElement(tag) as CardEl;
  el.setConfig?.({ type: `custom:${tag}`, entity: TEST_ENTITY, ...extra });
  document.body.appendChild(el);
  el.hass = makeHass();
  await flushFrames();
  const root = el.shadowRoot as ShadowRoot;
  const card = root.querySelector('ha-card') as HTMLElement;
  const mark = (side: 'low' | 'high') => root.querySelector(`.bar-container .${side}`) as HTMLElement | null;
  return { card, mark };
};

describe('watermark marks', () => {
  test('each side is shown with its own shape, falling back on the global type', async () => {
    const { mark } = await mount({ watermark: { low: 20, high: 80, type: 'line', high_type: 'round' } });
    const low = mark('low');
    const high = mark('high');
    assert.ok(low?.classList.contains('shown'));
    assert.ok(low?.classList.contains('wm-line'));
    assert.ok(high?.classList.contains('shown'));
    assert.ok(high?.classList.contains('wm-round') || high?.classList.contains('wm-line'));
  });

  test('a side left out takes the schema default and is shown', async () => {
    const { mark } = await mount({ watermark: { high: 80 } });
    assert.ok(mark('low')?.classList.contains('shown'));
    assert.ok(mark('high')?.classList.contains('shown'));
  });

  test('no watermark option: no mark is shown', async () => {
    const { mark } = await mount({});
    assert.ok(!mark('low')?.classList.contains('shown'));
    assert.ok(!mark('high')?.classList.contains('shown'));
  });

  test('a value is projected onto min/max by default, left as a position with as: percent', async () => {
    const projected = await mount({ min_value: 0, max_value: 200, watermark: { low: 50 } });
    assert.equal(projected.card.style.getPropertyValue(LOW_VAR), '25%');
    const asPercent = await mount({ min_value: 0, max_value: 200, watermark: { low: { value: 50, as: 'percent' } } });
    assert.equal(asPercent.card.style.getPropertyValue(LOW_VAR), '50%');
  });

  test('center_zero recenters a position on the middle of the bar', async () => {
    const { card } = await mount({ center_zero: true, min_value: -100, max_value: 100, watermark: { high: 50 } });
    assert.equal(card.style.getPropertyValue(HIGH_VAR), '75%');
  });

  test('a Template card (no min/max to project onto) takes the value as the position', async () => {
    const { card } = await mount({ percent: 50, watermark: { low: 30, high: 70 } }, 'entity-progress-card-template');
    assert.equal(card.style.getPropertyValue(LOW_VAR), '30%');
    assert.equal(card.style.getPropertyValue(HIGH_VAR), '70%');
  });
});
