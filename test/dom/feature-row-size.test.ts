/*
 * A tile feature drawn at the top or bottom of the tile takes back the grid row
 * Home Assistant reserves for it: --row-size, written inline on the section's
 * .card, loses one - and again each time HA writes its own value back.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../ha-stubs.js';
import { HassProviderSingleton, type HomeAssistant } from '../../src/utils/hass-provider.js';
import '../../src/index.js';

const TAG = 'entity-progress-feature';
const ROW_SIZE = '--row-size';

type FeatureEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };

// What hui-grid-section renders around a tile and its features.
const mountInTile = async (rowSize: string) => {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.setProperty(ROW_SIZE, rowSize);
  const features = document.createElement('hui-card-features');
  card.append(features);

  const hass = makeHass();
  HassProviderSingleton.getInstance().hass = hass as unknown as HomeAssistant;
  const el = document.createElement(TAG) as FeatureEl;
  el.setConfig?.({ type: `custom:${TAG}`, entity: TEST_ENTITY, bar_position: 'top' });
  features.append(el);
  document.body.append(card);
  el.hass = hass;
  await flushFrames();
  return card;
};

describe('a top or bottom tile feature gives back its reserved row', () => {
  test('--row-size loses one, and again once HA re-applies its own', async () => {
    const card = await mountInTile('3');
    assert.equal(card.style.getPropertyValue(ROW_SIZE), '2');

    card.style.setProperty(ROW_SIZE, '4');
    await flushFrames();
    assert.equal(card.style.getPropertyValue(ROW_SIZE), '3');
  });
});
