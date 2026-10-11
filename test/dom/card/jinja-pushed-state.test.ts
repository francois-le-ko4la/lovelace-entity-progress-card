/*
 * What a Jinja result does once Home Assistant pushes it: the observable
 * effect of each pushed option, and that nothing pushed outlives a setConfig.
 * Pins the behavior across moving the pushed state to a single owner.
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

// _renderJinja applies a push after an 80ms debounce, on ResourceManager's own
// timer - real time, not happy-dom's. TEST_ENTITY reads 42.
const RENDER_MS = 120;
const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const BAR = '.bar-container';
const NOW = 'aria-valuenow';
const ALERT = 'alert-active';
const SPIN = 'icon-anim-spin';

const mountWithPush = async (config: Record<string, unknown>, tag = 'entity-progress-card') => {
  const pushes = new Map<string, Push>();
  const hass = makeHass() as Hass;
  hass.connection.connected = true;
  hass.connection.subscribeMessage = (callback: Push, message: { template: string }) => {
    pushes.set(message.template, callback);
    return Promise.resolve(() => undefined);
  };
  HassProviderSingleton.getInstance().hass = hass as unknown as HomeAssistant;

  const el = document.createElement(tag) as CardEl;
  const full = (extra: Record<string, unknown>) => ({ type: `custom:${tag}`, entity: TEST_ENTITY, ...extra });
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
  const card = () => root.querySelector('ha-card') as HTMLElement;
  return { root, push, reconfigure, card };
};

describe('pushed min_value / max_value move the bar', () => {
  test('max_value: 84 puts 42 at half', async () => {
    const template = '{{ max }}';
    const { root, push } = await mountWithPush({ max_value: { jinja: template } });
    await push(template, 84);
    assert.equal(root.querySelector(BAR)?.getAttribute(NOW), '50');
  });

  test('min_value: 21 against a fixed max of 63 puts 42 at half', async () => {
    const template = '{{ min }}';
    const { root, push } = await mountWithPush({ min_value: { jinja: template }, max_value: 63 });
    await push(template, 21);
    assert.equal(root.querySelector(BAR)?.getAttribute(NOW), '50');
  });

  test('a push that is no number empties the bar', async () => {
    const template = '{{ max }}';
    const { root, push } = await mountWithPush({ max_value: { jinja: template } });
    await push(template, 84);
    await push(template, 'unavailable');
    assert.equal(root.querySelector(BAR)?.getAttribute(NOW), '0');
  });

  test('setConfig drops what was pushed', async () => {
    const template = '{{ max }}';
    const { root, push, reconfigure } = await mountWithPush({ max_value: { jinja: template } });
    await push(template, 84);
    await reconfigure({});
    assert.equal(root.querySelector(BAR)?.getAttribute(NOW), '42');
  });
});

describe('pushed watermark.low / watermark.high move the marks', () => {
  test('both sides take the pushed numbers and a new config clears them', async () => {
    const low = '{{ low }}';
    const high = '{{ high }}';
    const { push, reconfigure, card } = await mountWithPush({
      watermark: { low: { jinja: low }, high: { jinja: high } },
    });
    await push(low, 30);
    await push(high, 70);
    assert.equal(card().style.getPropertyValue('--low-watermark-value'), '30%');
    assert.equal(card().style.getPropertyValue('--high-watermark-value'), '70%');

    await reconfigure({});
    assert.equal(card().style.getPropertyValue('--low-watermark-value'), '');
  });
});

describe('pushed alert_when', () => {
  test('above: a pushed threshold under the value raises the alert, over it clears it', async () => {
    const template = '{{ limit }}';
    const { push, card } = await mountWithPush({ alert_when: { above: { jinja: template } } });
    await push(template, 10);
    assert.ok(card().classList.contains(ALERT), 'threshold 10 under 42 should alert');
    await push(template, 100);
    assert.ok(!card().classList.contains(ALERT), 'threshold 100 over 42 should not');
  });

  test('below: a pushed threshold over the value raises the alert', async () => {
    const template = '{{ limit }}';
    const { push, card } = await mountWithPush({ alert_when: { below: { jinja: template } } });
    await push(template, 100);
    assert.ok(card().classList.contains(ALERT), 'threshold 100 over 42 should alert');
  });

  test('jinja true/false triggers and clears; an object overrides the highlight', async () => {
    const template = '{{ on }}';
    const { push, card } = await mountWithPush({ alert_when: { jinja: template } });
    await push(template, true);
    assert.ok(card().classList.contains(ALERT));
    assert.ok(!card().classList.contains('alert-background'));
    await push(template, { highlight: 'background' });
    assert.ok(card().classList.contains('alert-background'));
    await push(template, false);
    assert.ok(!card().classList.contains(ALERT));
  });

  test('setConfig drops a pushed alert', async () => {
    const template = '{{ on }}';
    const { push, reconfigure, card } = await mountWithPush({ alert_when: { jinja: template } });
    await push(template, true);
    await reconfigure({});
    assert.ok(!card().classList.contains(ALERT));
  });
});

describe('pushed status_label, icon_animation and bar_effect', () => {
  test('status_label shows the pushed text', async () => {
    const template = '{{ label }}';
    const { root, push } = await mountWithPush({ status_label: template });
    await push(template, 'hot');
    assert.match(root.querySelector('.status-label')?.textContent ?? '', /hot/);
  });

  test('icon_animation: the pushed boolean starts and stops the effect', async () => {
    const template = '{{ spinning }}';
    const { push, card } = await mountWithPush({ icon_animation: { effect: 'spin', jinja: template } });
    assert.ok(!card().classList.contains(SPIN), 'no push yet: off');
    await push(template, true);
    assert.ok(card().classList.contains(SPIN), 'true: on');
    await push(template, false);
    assert.ok(!card().classList.contains(SPIN), 'false: off');
  });

  test('bar_effect: the pushed list toggles the effect classes', async () => {
    const template = '{{ effects }}';
    const { push, card } = await mountWithPush({ bar_effect: template });
    const before = card().className;
    await push(template, ['glass']);
    const glass = card().className;
    assert.notEqual(glass, before, 'a pushed effect must change the card classes');
    await push(template, []);
    assert.equal(card().className, before, 'an empty list clears the effects');
  });
});

// A new config empties what was pushed, and the subscriptions are sent again so
// Home Assistant hands the result back: an identical setConfig (a keystroke on
// another option in the editor) must not lose it.
describe('an identical setConfig keeps what Jinja pushed', () => {
  const SETTLE_MS = 600;

  const pushThenReconfigure = async (
    config: Record<string, unknown>,
    template: string,
    result: unknown,
    tag = 'entity-progress-card',
  ) => {
    const mounted = await mountWithPush(config, tag);
    await mounted.push(template, result);
    await mounted.reconfigure(config);
    await mounted.push(template, result);
    await sleep(SETTLE_MS);
    await flushFrames();
    return mounted;
  };

  test('alert_when.jinja', async () => {
    const template = '{{ on }}';
    const { card } = await pushThenReconfigure({ alert_when: { jinja: template } }, template, true);
    assert.ok(card().classList.contains(ALERT));
  });

  test('max_value', async () => {
    const template = '{{ max }}';
    const { root } = await pushThenReconfigure({ max_value: { jinja: template } }, template, 84);
    assert.equal(root.querySelector(BAR)?.getAttribute(NOW), '50');
  });

  test('hide', async () => {
    const template = "{{ ['icon'] }}";
    const { card } = await pushThenReconfigure({ hide: template }, template, ['icon']);
    assert.ok(card().classList.contains('hide-icon'));
  });

  test('icon_animation on a Template card', async () => {
    const template = '{{ spinning }}';
    const { card } = await pushThenReconfigure(
      { percent: 50, icon_animation: { effect: 'spin', jinja: template } },
      template,
      true,
      'entity-progress-card-template',
    );
    assert.ok(card().classList.contains(SPIN));
  });

  test('a hide that stops being Jinja stops using the last push', async () => {
    const template = "{{ ['icon'] }}";
    const { push, reconfigure, card } = await mountWithPush({ hide: template });
    await push(template, ['icon']);
    await reconfigure({ hide: ['name'] });
    assert.ok(!card().classList.contains('hide-icon'), 'the old Jinja result still hides the icon');
    assert.ok(card().classList.contains('hide-name'));
  });
});
