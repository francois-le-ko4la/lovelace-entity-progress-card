/*
 * One rule, two readers: raisesRainbowFullRow (schema.ts) both sets the class
 * styles.ts grows the bar row from and gives minGridRows the row it reserves.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';
import '../../../src/index.js';

type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };

const CARD = 'entity-progress-card';
const RAISED = 'rainbow-full-raised';
const RAINBOW = { layout: 'vertical', theme: 'temperature', bar_color_mode: 'rainbow_full' };

const mount = async (extra: Record<string, unknown>) => {
  const el = document.createElement(CARD) as CardEl;
  el.setConfig?.({ type: `custom:${CARD}`, entity: TEST_ENTITY, ...extra });
  document.body.appendChild(el);
  el.hass = makeHass();
  await flushFrames();
  return el;
};

const raised = (el: Element) => el.shadowRoot?.querySelector('ha-card')?.classList.contains(RAISED) ?? false;
const rows = (el: Element) => (el as unknown as { _cardView: { minGridRows: number } })._cardView.minGridRows;

describe('rainbow_full raises the vertical bar row', () => {
  const CASES: [string, Record<string, unknown>, boolean][] = [
    ['vertical xsmall', { ...RAINBOW, bar_size: 'xsmall' }, true],
    ['vertical small', { ...RAINBOW, bar_size: 'small' }, true],
    ['vertical medium', { ...RAINBOW, bar_size: 'medium' }, true],
    ['vertical large (16px natively)', { ...RAINBOW, bar_size: 'large' }, false],
    ['horizontal xsmall (16px cushion)', { ...RAINBOW, layout: 'horizontal', bar_size: 'xsmall' }, false],
    ['vertical xsmall, plain colors', { ...RAINBOW, bar_color_mode: 'auto', bar_size: 'xsmall' }, false],
  ];

  for (const [label, config, expected] of CASES) {
    test(`${label}: class and reserved row agree`, async () => {
      const el = await mount(config);
      const plain = await mount({ ...config, bar_color_mode: 'auto' });
      assert.equal(raised(el), expected, 'class');
      if (!expected) assert.equal(rows(el), rows(plain), 'a row reserved with no growth to hold');
    });
  }

  test('xsmall reserves one more row than the same card without rainbow_full', async () => {
    const config = { ...RAINBOW, bar_size: 'xsmall' };
    assert.equal(rows(await mount(config)), rows(await mount({ ...config, bar_color_mode: 'auto' })) + 1);
  });
});
