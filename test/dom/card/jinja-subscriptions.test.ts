/*
 * A render_template subscription is what a Jinja field costs Home Assistant:
 * one per field, never a second one for the same template, and every one
 * dropped when the card leaves the page.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';
import { HassProviderSingleton, type HomeAssistant } from '../../../src/utils/hass-provider.js';
import '../../../src/index.js';

type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };
type Push = (message: { result: unknown }) => void;
type Connection = {
  connected?: boolean;
  subscribeMessage?: (callback: Push, message: { template: string }) => Promise<() => void>;
};
type Hass = Record<string, unknown> & { states: Record<string, Record<string, unknown>>; connection: Connection };

// _processJinjaFields runs at most once per 300ms and catches up with a
// trailing pass on ResourceManager's own timer - real time, not happy-dom's.
const TRAILING_PASS_MS = 350;
const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

describe('Jinja subscriptions', () => {
  test('one per field, kept across refreshes, all dropped on removal', async () => {
    const templates: string[] = [];
    let unsubscribed = 0;
    const hass = makeHass() as Hass;
    hass.connection.connected = true;
    hass.connection.subscribeMessage = (_callback, message) => {
      templates.push(message.template);
      return Promise.resolve(() => {
        unsubscribed++;
      });
    };

    const el = document.createElement('entity-progress-card') as CardEl;
    el.setConfig?.({
      type: 'custom:entity-progress-card',
      entity: TEST_ENTITY,
      name_info: "{{ 'a' }}",
      custom_info: "{{ 'b' }}",
    });
    document.body.appendChild(el);
    el.hass = hass;
    await flushFrames();
    await sleep(TRAILING_PASS_MS);
    assert.equal(templates.length, 2, `expected one subscription per field, got ${templates.join(', ')}`);

    // Its own entity moves: a full refresh, which re-runs the Jinja pass.
    const own = hass.states[TEST_ENTITY];
    el.hass = { ...hass, states: { ...hass.states, [TEST_ENTITY]: { ...own, state: '43' } } };
    await flushFrames();
    await sleep(TRAILING_PASS_MS);
    assert.equal(templates.length, 2, 'a refresh subscribed to an identical template again');

    el.remove();
    assert.equal(unsubscribed, 2, 'a subscription outlived its card');
  });
});

describe('a Jinja result pushed by Home Assistant reaches the card', () => {
  // _renderJinja applies a push after an 80ms debounce, on ResourceManager's
  // own timer - real time again.
  const RENDER_MS = 120;

  const mountWithPush = async (tag: string, config: Record<string, unknown>) => {
    const pushes = new Map<string, Push>();
    const hass = makeHass() as Hass;
    hass.connection.connected = true;
    hass.connection.subscribeMessage = (callback, message) => {
      pushes.set(message.template, callback);
      return Promise.resolve(() => undefined);
    };
    // setConfig reads the one shared hass: this test's, not a previous one's.
    HassProviderSingleton.getInstance().hass = hass as unknown as HomeAssistant;

    const el = document.createElement(tag) as CardEl;
    el.setConfig?.({ type: `custom:${tag}`, entity: TEST_ENTITY, ...config });
    document.body.appendChild(el);
    el.hass = hass;
    await flushFrames();

    const push = async (template: string, result: unknown) => {
      const send = pushes.get(template);
      assert.ok(send, `no subscription for ${template}`);
      send({ result });
      await sleep(RENDER_MS);
      await flushFrames();
    };
    return { root: el.shadowRoot as ShadowRoot, push };
  };

  test('name_info shows what the template returned', async () => {
    const template = "{{ 'x' }}";
    const { root, push } = await mountWithPush('entity-progress-card', { name_info: template });
    await push(template, 'Pushed');
    assert.match(root.querySelector('.name-extra')?.textContent ?? '', /Pushed/);
  });

  test("a Template card's percent moves its bar", async () => {
    const template = '{{ 42 }}';
    const { root, push } = await mountWithPush('entity-progress-card-template', { percent: template });
    await push(template, 42);
    assert.equal(root.querySelector('.bar-container')?.getAttribute('aria-valuenow'), '42');
  });
});
