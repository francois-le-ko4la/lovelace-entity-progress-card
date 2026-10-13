/*
 * badge_icon / badge_color paint the inner badge on the icon. Pins the visible
 * rule (shown when either source resolves, colors cleared when none does,
 * alert badge wins, setConfig empties it) so the state can move out of HABase.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';
import { HassProviderSingleton, type HomeAssistant } from '../../../src/utils/hass-provider.js';
import { CARD } from '../../../src/utils/parameters.js';
import '../../../src/index.js';

type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };
type Push = (message: { result: unknown }) => void;
type Hass = Record<string, unknown> & { connection: Record<string, unknown> };

const RENDER_MS = 120;
const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const ICON_TEMPLATE = '{{ icon }}';
const COLOR_TEMPLATE = '{{ color }}';
const SHOWN = `${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class}`;
const ICON_ATTRIBUTE = CARD.style.icon.badge.default.attribute;
const BACKGROUND_VAR = CARD.style.dynamic.badge.backgroundColor.var;
const COLOR_VAR = CARD.style.dynamic.badge.color.var;

const mount = async (config: Record<string, unknown>, entityState = '42') => {
  const pushes = new Map<string, Push>();
  const hass = makeHass() as Hass;
  hass.connection.connected = true;
  (hass.states as Record<string, { state: string }>)[TEST_ENTITY].state = entityState;
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
  const card = () => root.querySelector('ha-card') as HTMLElement;
  const shown = () => card().classList.contains(SHOWN);
  const icon = () =>
    root.querySelector(`.${CARD.htmlStructure.elements.badge.icon.class}`)?.getAttribute(ICON_ATTRIBUTE) ?? '';
  const background = () => card().style.getPropertyValue(BACKGROUND_VAR);
  const color = () => card().style.getPropertyValue(COLOR_VAR);
  return { push, reconfigure, shown, icon, background, color };
};

const BOTH = { badge_icon: ICON_TEMPLATE, badge_color: COLOR_TEMPLATE };

describe('the inner badge', () => {
  test('is hidden until a source resolves', async () => {
    const { shown } = await mount(BOTH);
    assert.equal(shown(), false);
  });

  test('an icon alone shows the badge with no color', async () => {
    const { push, shown, icon, background } = await mount({ badge_icon: ICON_TEMPLATE });
    await push(ICON_TEMPLATE, 'mdi:fire');
    assert.equal(shown(), true);
    assert.equal(icon(), 'mdi:fire');
    assert.equal(background(), '');
  });

  test('a color alone shows the badge with an empty icon', async () => {
    const { push, shown, icon, background, color } = await mount(BOTH);
    await push(COLOR_TEMPLATE, '#ff0000');
    assert.equal(shown(), true);
    assert.equal(icon(), '');
    assert.notEqual(background(), '');
    assert.equal(color(), 'var(--white-color)');
  });

  test('icon and color together', async () => {
    const { push, shown, icon, background } = await mount(BOTH);
    await push(ICON_TEMPLATE, 'mdi:fire');
    await push(COLOR_TEMPLATE, '#ff0000');
    assert.equal(shown(), true);
    assert.equal(icon(), 'mdi:fire');
    assert.notEqual(background(), '');
  });

  test('an icon that is not an icon name resolves to nothing', async () => {
    const { push, shown } = await mount({ badge_icon: ICON_TEMPLATE });
    await push(ICON_TEMPLATE, 'fire');
    assert.equal(shown(), false);
  });

  test('a dict return drives icon and color; its color wins over badge_color', async () => {
    const { push, shown, icon, background } = await mount(BOTH);
    await push(COLOR_TEMPLATE, '#00ff00');
    const fieldBackground = background();
    await push(ICON_TEMPLATE, { icon: 'mdi:fire', color: '#ff0000' });
    assert.equal(shown(), true);
    assert.equal(icon(), 'mdi:fire');
    assert.notEqual(background(), fieldBackground);
  });

  test('clearing every source hides the badge and unsets the color', async () => {
    const { push, shown, icon, background, color } = await mount(BOTH);
    await push(ICON_TEMPLATE, 'mdi:fire');
    await push(COLOR_TEMPLATE, '#ff0000');
    await push(ICON_TEMPLATE, '');
    await push(COLOR_TEMPLATE, '');
    assert.equal(shown(), false);
    assert.equal(icon(), '');
    assert.equal(background(), '');
    assert.equal(color(), '');
  });

  test('a color left alone keeps the badge when only the icon clears', async () => {
    const { push, shown, icon } = await mount(BOTH);
    await push(ICON_TEMPLATE, 'mdi:fire');
    await push(COLOR_TEMPLATE, '#ff0000');
    await push(ICON_TEMPLATE, '');
    assert.equal(shown(), true);
    assert.equal(icon(), '');
  });

  test('an unavailable entity shows its own badge', async () => {
    const { shown, icon } = await mount(BOTH, 'unavailable');
    assert.equal(shown(), true);
    assert.equal(icon(), CARD.style.icon.badge.unavailable.icon);
  });

  test('setConfig drops the cached icon: a later color push repaints without it', async () => {
    const { push, reconfigure, shown, icon } = await mount(BOTH);
    await push(ICON_TEMPLATE, 'mdi:fire');
    await reconfigure(BOTH);
    await push(COLOR_TEMPLATE, '#ff0000');
    assert.equal(shown(), true);
    assert.equal(icon(), '');
  });
});
