/*
 * The status pill is one element two options paint: status_label and
 * alert_when.highlight: 'label'. Pins who owns it and when, so the rule can
 * move to a single owner without changing what the card shows.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';
import { HassProviderSingleton, type HomeAssistant } from '../../../src/utils/hass-provider.js';
import '../../../src/index.js';

type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };
type Push = (message: { result: unknown }) => void;
type Hass = Record<string, unknown> & { connection: Record<string, unknown> };

// _renderJinja applies a push after an 80ms debounce on real time.
// TEST_ENTITY reads 42.
const RENDER_MS = 120;
const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const PILL = '.status-label';
const STATUS = '{{ status }}';
const LIMIT = '{{ limit }}';

const mount = async (config: Record<string, unknown>) => {
  const pushes = new Map<string, Push>();
  const hass = makeHass() as Hass;
  hass.connection.connected = true;
  hass.connection.subscribeMessage = (callback: Push, message: { template: string }) => {
    pushes.set(message.template, callback);
    return Promise.resolve(() => undefined);
  };
  HassProviderSingleton.getInstance().hass = hass as unknown as HomeAssistant;

  const el = document.createElement('entity-progress-card') as CardEl;
  const full = (extra: Record<string, unknown>) => ({
    type: 'custom:entity-progress-card',
    entity: TEST_ENTITY,
    ...extra,
  });
  el.setConfig?.(full(config));
  document.body.appendChild(el);
  el.hass = hass;
  await flushFrames();

  const root = el.shadowRoot as ShadowRoot;
  const push = async (template: string, result: unknown) => {
    const send = pushes.get(template);
    assert.ok(send, `no subscription for ${template}`);
    send({ result });
    await sleep(RENDER_MS);
    await flushFrames();
  };
  const reconfigure = async (extra: Record<string, unknown>) => {
    el.setConfig?.(full(extra));
    await flushFrames();
  };
  const pill = () => root.querySelector(PILL)?.textContent?.trim() ?? '';
  const card = () => root.querySelector('ha-card') as HTMLElement;
  return { push, reconfigure, pill, card };
};

describe('the status pill', () => {
  test('shows the pushed text, and a dict return carries its own label', async () => {
    const { push, pill } = await mount({ status_label: STATUS });
    await push(STATUS, 'hot');
    assert.equal(pill(), 'hot');
    await push(STATUS, { label: 'cold', color: '#0000ff' });
    assert.equal(pill(), 'cold');
  });

  test('setConfig empties what was pushed', async () => {
    const { push, reconfigure, pill } = await mount({ status_label: STATUS });
    await push(STATUS, 'hot');
    await reconfigure({});
    assert.equal(pill(), '');
  });
});

describe('alert_when.highlight: label owns the pill while the alert is on', () => {
  const ALERTING = {
    status_label: STATUS,
    alert_when: { above: { jinja: LIMIT }, highlight: 'label', label: 'too hot' },
  };

  test('the alert text replaces the status text, and a status push is ignored meanwhile', async () => {
    const { push, pill, card } = await mount(ALERTING);
    await push(STATUS, 'fine');
    assert.equal(pill(), 'fine');

    await push(LIMIT, 10);
    assert.ok(card().classList.contains('alert-active'));
    assert.ok(card().classList.contains('alert-label'));
    assert.equal(pill(), 'too hot');

    await push(STATUS, 'still fine');
    assert.equal(pill(), 'too hot', 'a status push must not fight the alert for the pill');
  });

  // A status push that lands during the alert is dropped before it is cached
  // (_renderLabel returns first), so the pill falls back to the text it had
  // when the alert took over. Pinned as is; changing it is a separate decision.
  test('when the alert clears, the pill goes back to the status text it had before', async () => {
    const { push, pill, card } = await mount(ALERTING);
    await push(STATUS, 'fine');
    await push(LIMIT, 10);
    await push(STATUS, 'newer status');
    await push(LIMIT, 100);
    assert.ok(!card().classList.contains('alert-active'));
    assert.equal(pill(), 'fine');
  });

  test('another highlight leaves the pill to the status', async () => {
    const { push, pill } = await mount({
      status_label: STATUS,
      alert_when: { above: { jinja: LIMIT }, highlight: 'background', label: 'too hot' },
    });
    await push(STATUS, 'fine');
    await push(LIMIT, 10);
    assert.equal(pill(), 'fine');
  });
});
