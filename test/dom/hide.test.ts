/*
 * `hide` has two shapes and they cannot cost the same. A static array is
 * settled at setConfig, so the subtree is never built; a Jinja can flip on any
 * push, so it has to stay in the DOM for the class toggle to reach it.
 *
 * The class goes on the card either way: it carries the layout compensation
 * (--current-content-width, --name-height), not just the display: none. Drop
 * it along with the subtree and the card renders with a hole where the icon
 * used to be.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../ha-stubs.js';
import '../../src/index.js';

type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };

const mount = async (extra: Record<string, unknown>) => {
  const el = document.createElement('entity-progress-card') as CardEl;
  el.setConfig?.({ type: 'custom:entity-progress-card', entity: TEST_ENTITY, ...extra });
  document.body.appendChild(el);
  el.hass = makeHass();
  await flushFrames();
  return el.shadowRoot as ShadowRoot;
};

const count = (root: ShadowRoot) => root.querySelectorAll('*').length;

// The two subtrees a static hide is allowed to drop.
const ICON = '.icon-section';
const NAME = '.name';
const WRAPPER = '.secondary-info-wrapper';
const BAR = '.progress-bar';

describe('hide: static drops the subtree, Jinja keeps it', () => {
  test('a static array leaves the icon and name out of the markup', async () => {
    const plain = await mount({});
    const hidden = await mount({ hide: ['icon', 'name'] });

    assert.ok(plain.querySelector(ICON), 'baseline should build an icon section');
    assert.equal(hidden.querySelector(ICON), null, 'icon subtree should not be built');
    assert.equal(hidden.querySelector(NAME), null, 'name subtree should not be built');
    assert.ok(count(hidden) < count(plain), 'the static form must cost fewer nodes');
  });

  test('the hide-* classes stay on the card, they carry the layout math', async () => {
    const hidden = await mount({ hide: ['icon', 'name'] });
    assert.ok(hidden.querySelector('ha-card.hide-icon'), 'hide-icon must still be applied');
    assert.ok(hidden.querySelector('ha-card.hide-name'), 'hide-name must still be applied');
  });

  // .secondary-info holds the progress bar at the default bar_position, so
  // only its wrapper may go - which is what the CSS targets too.
  test('hiding secondary_info drops its wrapper and keeps the bar', async () => {
    for (const barPosition of ['default', 'top']) {
      const root = await mount({ hide: ['secondary_info'], bar_position: barPosition });
      assert.equal(root.querySelector(WRAPPER), null, `wrapper should be gone (${barPosition})`);
      assert.ok(root.querySelector(BAR), `the bar must survive (${barPosition})`);
    }
  });

  test('a Jinja hide keeps every subtree, so a later push can reveal it', async () => {
    const jinja = await mount({ hide: "{{ ['icon','name'] }}" });
    assert.ok(jinja.querySelector(ICON), 'a Jinja hide must keep the icon in the DOM');
    assert.ok(jinja.querySelector(NAME), 'a Jinja hide must keep the name in the DOM');
  });
});
