/*
 * The render_template subscription lifecycle beyond "one per field": what a
 * refusal, a transport failure, a removed field, a forced refresh and a
 * reconnection each do. Pins the behavior across moving it out of HACore.
 */

import { test, describe, mock } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';
import { HassProviderSingleton, type HomeAssistant } from '../../../src/utils/hass-provider.js';
import '../../../src/index.js';

type CardEl = HTMLElement & {
  setConfig?: (c: unknown) => void;
  hass?: unknown;
  _jinjaSubscriptions?: { resubscribeAll: () => void };
};
type Listener = () => void;
type Connection = {
  connected?: boolean;
  addEventListener: (type: string, listener: Listener) => void;
  removeEventListener: (type: string, listener: Listener) => void;
  emit: (type: string) => void;
  subscribeMessage?: (callback: unknown, message: { template: string }) => Promise<() => void>;
};
type Hass = Record<string, unknown> & { states: Record<string, Record<string, unknown>>; connection: Connection };

// JinjaSubscriptions.process runs at most once per 300ms and catches up with a
// trailing pass on ResourceManager's own timer - real time, not happy-dom's.
const TRAILING_PASS_MS = 350;
const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const NAME_INFO = 'name_info';
const TEMPLATE_A = "{{ 'a' }}";
const TEMPLATE_B = "{{ 'b' }}";

const mount = async (config: Record<string, unknown>, subscribe: (template: string) => Promise<() => void>) => {
  const sent: string[] = [];
  const hass = makeHass() as Hass;
  // A plain emitter: Node's EventTarget refuses happy-dom's Event class.
  const listeners = new Map<string, Set<Listener>>();
  const connection: Connection = {
    connected: true,
    addEventListener: (type, listener) => {
      listeners.set(type, (listeners.get(type) ?? new Set()).add(listener));
    },
    removeEventListener: (type, listener) => {
      listeners.get(type)?.delete(listener);
    },
    emit: (type) => {
      listeners.get(type)?.forEach((listener) => listener());
    },
    subscribeMessage: (_callback, message) => {
      sent.push(message.template);
      return subscribe(message.template);
    },
  };
  hass.connection = connection;
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
  await sleep(TRAILING_PASS_MS);

  // Its own entity moves: a full refresh, which re-runs the Jinja pass.
  const refresh = async () => {
    const own = hass.states[TEST_ENTITY];
    const state = String(Number(own.state) + 1);
    hass.states = { ...hass.states, [TEST_ENTITY]: { ...own, state } };
    el.hass = { ...hass };
    await flushFrames();
    await sleep(TRAILING_PASS_MS);
  };
  const reconfigure = async (extra: Record<string, unknown>) => {
    el.setConfig?.(full(extra));
    el.hass = { ...hass };
    await flushFrames();
    await sleep(TRAILING_PASS_MS);
  };
  return { el, hass, sent, refresh, reconfigure };
};

const ok = () => Promise.resolve(() => undefined);
const refused = () => Promise.reject(Object.assign(new Error('bad template'), { code: 'template_error' }));

describe('a refused template', () => {
  test('is not sent again until it changes', async () => {
    mock.method(console, 'warn', () => undefined);
    const { sent, refresh, reconfigure } = await mount({ [NAME_INFO]: TEMPLATE_A }, refused);
    assert.deepEqual(sent, [TEMPLATE_A]);
    await refresh();
    assert.deepEqual(sent, [TEMPLATE_A], 'an unchanged refused template must not be re-sent');
    await reconfigure({ [NAME_INFO]: TEMPLATE_B });
    assert.deepEqual(sent, [TEMPLATE_A, TEMPLATE_B], 'editing the template lifts the block');
    mock.restoreAll();
  });

  test('a transport failure stays retryable', async () => {
    mock.method(console, 'warn', () => undefined);
    const dropped = () => Promise.reject(new Error('socket dropped'));
    const { sent, refresh } = await mount({ [NAME_INFO]: TEMPLATE_A }, dropped);
    const before = sent.length;
    await refresh();
    assert.ok(sent.length > before, 'a transport error must be retried on the next pass');
    mock.restoreAll();
  });

  test('an unclosed delimiter is never sent and warned about once', async () => {
    const warn = mock.method(console, 'warn', () => undefined);
    const { sent, refresh } = await mount({ [NAME_INFO]: '{{ broken' }, ok);
    await refresh();
    assert.deepEqual(sent, []);
    assert.equal(warn.mock.callCount(), 1);
    mock.restoreAll();
  });
});

describe('subscription upkeep', () => {
  test('a field removed from the config drops its subscription', async () => {
    let unsubscribed = 0;
    const { reconfigure } = await mount({ [NAME_INFO]: TEMPLATE_A }, () =>
      Promise.resolve(() => {
        unsubscribed++;
      }),
    );
    assert.equal(unsubscribed, 0);
    await reconfigure({});
    assert.equal(unsubscribed, 1);
  });

  test('resubscribing all fields sends an identical template again', async () => {
    const { el, sent } = await mount({ [NAME_INFO]: TEMPLATE_A }, ok);
    el._jinjaSubscriptions?.resubscribeAll();
    assert.deepEqual(sent, [TEMPLATE_A, TEMPLATE_A]);
  });

  test('disconnected then ready subscribes every field again', async () => {
    const { hass, sent } = await mount({ [NAME_INFO]: TEMPLATE_A }, ok);
    hass.connection.emit('disconnected');
    hass.connection.emit('ready');
    await flushFrames();
    await sleep(TRAILING_PASS_MS);
    assert.deepEqual(sent, [TEMPLATE_A, TEMPLATE_A]);
  });
});
