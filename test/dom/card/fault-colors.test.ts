/*
 * An entity Home Assistant cannot read paints its icon and bar with a fixed
 * colour, whichever view reads it: the Card family decides from the faulty
 * entity (its own or a min/max one), the Template family from its own entity.
 * Pins that both give the same colour for the same state.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';
import { HassProviderSingleton, type HomeAssistant } from '../../../src/utils/hass-provider.js';
import { CARD } from '../../../src/utils/parameters.js';
import '../../../src/index.js';

type View = { iconColor: string | null; barColor: string | null };
type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown; _cardView?: View };
type Hass = Record<string, unknown> & { states: Record<string, Record<string, unknown>> };

const mount = async (tag: string, config: Record<string, unknown>, hassState: string | null) => {
  const hass = makeHass() as Hass;
  if (hassState === null) Reflect.deleteProperty(hass.states, TEST_ENTITY);
  else hass.states[TEST_ENTITY] = { ...hass.states[TEST_ENTITY], state: hassState };
  HassProviderSingleton.getInstance().hass = hass as unknown as HomeAssistant;

  const el = document.createElement(tag) as CardEl;
  el.setConfig?.({ type: `custom:${tag}`, entity: TEST_ENTITY, ...config });
  document.body.appendChild(el);
  el.hass = hass;
  await flushFrames();
  const view = el._cardView;
  assert.ok(view, `${tag} has no view`);
  return view;
};

const VIEWS = [
  ['entity-progress-card', {}],
  ['entity-progress-card-template', { percent: 50 }],
] as const;

describe('a faulty entity paints the fixed fault colours', () => {
  for (const [tag, config] of VIEWS) {
    test(`${tag}: unavailable`, async () => {
      const view = await mount(tag, config, 'unavailable');
      assert.equal(view.iconColor, CARD.style.color.unavailable);
    });

    test(`${tag}: not found`, async () => {
      const view = await mount(tag, config, null);
      assert.equal(view.iconColor, CARD.style.color.notFound);
    });
  }

  test('the two fault colours differ from each other', () => {
    assert.notEqual(CARD.style.color.unavailable, CARD.style.color.notFound);
  });
});
