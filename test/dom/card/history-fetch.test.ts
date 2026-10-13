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

const mount = async (extra: Record<string, unknown>, connected = true) => {
  let requests = 0;
  const now = Math.floor(Date.now() / 1000);
  const hass = makeHass() as Hass;
  hass.connection.connected = connected;
  hass.connection.sendMessagePromise = () => {
    requests++;
    return Promise.resolve({ [TEST_ENTITY]: [{ s: '40', lu: now - 600 }] });
  };

  // Every card reads the one shared hass, setConfig included - which already
  // seeds from it. Home Assistant's is current by then, a previous test's not.
  HassProviderSingleton.getInstance().hass = hass as unknown as HomeAssistant;
  const el = document.createElement('entity-progress-card') as CardEl;
  const full = (more: Record<string, unknown>) => ({
    type: 'custom:entity-progress-card',
    entity: TEST_ENTITY,
    ...more,
  });
  el.setConfig?.(full(extra));
  document.body.appendChild(el);
  el.hass = hass;
  await flushFrames();
  await flushFrames();
  const settle = async () => {
    await flushFrames();
    await flushFrames();
  };
  const refresh = async () => {
    el.hass = hass;
    await settle();
  };
  const reconfigure = async (more: Record<string, unknown>) => {
    el.setConfig?.(full(more));
    await refresh();
  };
  return { requests: () => requests, refresh, reconfigure };
};

const requestsFor = async (trendWindow: string) => {
  const { requests } = await mount({
    peak_marker: { window: '2h', min: true },
    trend_indicator: { window: trendWindow },
  });
  return requests();
};

describe('history requests', () => {
  test('peak_marker and trend_indicator on one window make one request', async () => {
    assert.equal(await requestsFor('2h'), 1);
  });

  test('on two windows, one request each', async () => {
    assert.equal(await requestsFor('1h'), 2);
  });
});

describe('seeding runs once per entity, attribute and window', () => {
  const TREND = { trend_indicator: { window: '1h' } };

  test('a later hass update does not ask again', async () => {
    const { requests, refresh } = await mount(TREND);
    assert.equal(requests(), 1);
    await refresh();
    assert.equal(requests(), 1);
  });

  test('a new window asks again', async () => {
    const { requests, reconfigure } = await mount(TREND);
    await reconfigure({ trend_indicator: { window: '2h' } });
    assert.equal(requests(), 2);
  });

  test('the same config set again does not ask again', async () => {
    const { requests, reconfigure } = await mount(TREND);
    await reconfigure(TREND);
    assert.equal(requests(), 1);
  });

  test('no live connection asks nothing', async () => {
    const { requests } = await mount(TREND, false);
    assert.equal(requests(), 0);
  });

  test('an attribute has no recorded history: nothing asked', async () => {
    const { requests } = await mount({ ...TREND, attribute: 'battery_level' });
    assert.equal(requests(), 0);
  });
});
