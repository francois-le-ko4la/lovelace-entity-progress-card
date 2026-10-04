/*
 * history/history_during_period is the heaviest call a card makes to Home
 * Assistant. peak_marker and trend_indicator both seed from it: on the same
 * window they share one request in flight, on two windows they cannot.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';
import { HassProviderSingleton, type HomeAssistant } from '../../../src/utils/hass-provider.js';
import '../../../src/index.js';

type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };
type Hass = Record<string, unknown> & {
  connection: { connected?: boolean; sendMessagePromise?: () => Promise<unknown> };
};

const requestsFor = async (trendWindow: string) => {
  let requests = 0;
  const now = Math.floor(Date.now() / 1000);
  const hass = makeHass() as Hass;
  hass.connection.connected = true;
  hass.connection.sendMessagePromise = () => {
    requests++;
    return Promise.resolve({ [TEST_ENTITY]: [{ s: '40', lu: now - 600 }] });
  };

  // Every card reads the one shared hass, setConfig included - which already
  // seeds from it. Home Assistant's is current by then, a previous test's not.
  HassProviderSingleton.getInstance().hass = hass as unknown as HomeAssistant;
  const el = document.createElement('entity-progress-card') as CardEl;
  el.setConfig?.({
    type: 'custom:entity-progress-card',
    entity: TEST_ENTITY,
    peak_marker: { window: '2h', min: true },
    trend_indicator: { window: trendWindow },
  });
  document.body.appendChild(el);
  el.hass = hass;
  await flushFrames();
  await flushFrames();
  return requests;
};

describe('history requests', () => {
  test('peak_marker and trend_indicator on one window make one request', async () => {
    assert.equal(await requestsFor('2h'), 1);
  });

  test('on two windows, one request each', async () => {
    assert.equal(await requestsFor('1h'), 2);
  });
});
