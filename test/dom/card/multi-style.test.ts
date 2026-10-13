/*
 * A Multi carries its stylesheet the way the cards do: one constructed sheet
 * shared by every instance, or a per-instance <style> where the engine cannot
 * construct one - never both, never none.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';
import '../../../src/index.js';

type MultiEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };

const mount = async (tag: string) => {
  const el = document.createElement(tag) as MultiEl;
  el.setConfig?.({ type: `custom:${tag}`, entities: [TEST_ENTITY] });
  document.body.appendChild(el);
  el.hass = makeHass();
  await flushFrames();
  const root = el.shadowRoot as ShadowRoot;
  return { sheets: root.adoptedStyleSheets, styles: root.querySelectorAll('style').length };
};

const MULTI_CARD = 'entity-progress-multi-card';

describe('the Multi stylesheet', () => {
  for (const tag of [MULTI_CARD, 'entity-progress-multi-feature']) {
    test(`${tag}: one source of CSS`, async () => {
      const { sheets, styles } = await mount(tag);
      assert.equal(sheets.length + styles, 1, 'exactly one of the adopted sheet or the <style> fallback');
    });
  }

  test('two instances adopt the same sheet', async () => {
    const first = await mount(MULTI_CARD);
    const second = await mount(MULTI_CARD);
    if (first.sheets.length === 0) return;
    assert.equal(first.sheets[0], second.sheets[0]);
  });
});
