/*
 * content_order lays the vertical stack out in the order asked, and up/down
 * stands the bar in it. The default order must build the very same markup.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';
import { HassProviderSingleton, type HomeAssistant } from '../../../src/utils/hass-provider.js';
import '../../../src/index.js';

type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };

// Every text set: a token with no field behind it has no leaf.
const VERTICAL = {
  layout: 'vertical',
  name: 'Garage',
  name_info: 'Left',
  custom_info: 'Door',
  state_content: ['last_changed'],
};

const mount = async (extra: Record<string, unknown>, tag = 'entity-progress-card') => {
  const hass = makeHass();
  // setConfig reads the one shared hass: this test's, not a push test's.
  HassProviderSingleton.getInstance().hass = hass as unknown as HomeAssistant;
  const el = document.createElement(tag) as CardEl;
  el.setConfig?.({ type: `custom:${tag}`, entity: TEST_ENTITY, ...VERTICAL, ...extra });
  document.body.appendChild(el);
  el.hass = hass;
  await flushFrames();
  return el;
};

// _renderJinja applies a push after an 80ms debounce, on real time.
const RENDER_MS = 120;
// JinjaSubscriptions.process' trailing pass, 300ms.
const JINJA_PASS_MS = 350;
const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
const TEMPLATE = "{{ 'door' }}";
const JINJA = { ...VERTICAL, custom_info: TEMPLATE };

// others: a fixed result for any other template.
const mountWithPush = async (extra: Record<string, unknown>, others: Record<string, unknown> = {}) => {
  let send: ((message: { result: unknown }) => void) | undefined;
  let last: string | undefined;
  const hass = makeHass() as Record<string, unknown> & { connection: Record<string, unknown> };
  hass.connection.connected = true;
  // As in Home Assistant, a new subscription gets the current result.
  hass.connection.subscribeMessage = (callback: NonNullable<typeof send>, message: { template: string }) => {
    if (message.template in others) queueMicrotask(() => callback({ result: others[message.template] }));
    if (message.template !== TEMPLATE) return Promise.resolve(() => undefined);
    send = callback;
    if (last !== undefined) queueMicrotask(() => callback({ result: last }));
    return Promise.resolve(() => undefined);
  };
  HassProviderSingleton.getInstance().hass = hass as unknown as HomeAssistant;
  const el = document.createElement('entity-progress-card') as CardEl;
  el.setConfig?.({ type: 'custom:entity-progress-card', entity: TEST_ENTITY, ...JINJA, ...extra });
  document.body.appendChild(el);
  el.hass = hass;
  await flushFrames();
  const push = async (result: string) => {
    assert.ok(send, 'no custom_info subscription');
    last = result;
    send({ result });
    await sleep(RENDER_MS);
    await flushFrames();
  };
  return { el, hass, push };
};

const content = (el: Element) => el.shadowRoot?.querySelector('.content-section') as HTMLElement;

// The ordered body as lines of tokens: a .content-line lists its leaves'
// data-block, a bar standing alone is ['bar'].
const BAR_CLASS = 'bar-container';
const layoutOf = (el: Element) =>
  [...content(el).children].map((child) =>
    child.classList.contains(BAR_CLASS)
      ? ['bar']
      : [...child.children].flatMap((part) =>
          part.classList.contains(BAR_CLASS)
            ? ['bar']
            : [...part.children].map((leaf) => leaf.getAttribute('data-block')),
        ),
  );
const textOf = (el: Element, token: string) =>
  el.shadowRoot?.querySelector(`[data-block="${token}"]`)?.textContent ?? '';

const rows = (el: Element) => (el as unknown as { _cardView: { minGridRows: number } })._cardView.minGridRows;

describe('content_order in the vertical stack', () => {
  test('the default lines build the markup they always did', async () => {
    const plain = await mount({});
    const ordered = await mount({
      content_order: [['name', 'name_info'], ['info', 'state_content', 'value'], ['bar']],
    });
    assert.equal(content(ordered).innerHTML, content(plain).innerHTML);
  });

  test('a flat list is one row per token, the missing ones next to their host', async () => {
    assert.deepEqual(layoutOf(await mount({ content_order: ['bar'] })), [
      ['bar'],
      ['name'],
      ['name_info'],
      ['info'],
      ['state_content'],
      ['value'],
    ]);
  });

  test('lines group their tokens in one row each', async () => {
    const el = await mount({ content_order: [['value'], ['name', 'name_info'], ['info', 'state_content'], ['bar']] });
    assert.deepEqual(layoutOf(el), [['value'], ['name', 'name_info'], ['info', 'state_content'], ['bar']]);
    assert.equal(el.shadowRoot?.querySelectorAll('#entity-value').length, 1, 'one value, one id');
    assert.equal(textOf(el, 'value'), '42%', 'the unit moves with it');
  });

  test('a bar left out gets a row of its own', async () => {
    const el = await mount({
      bar_orientation: 'up',
      content_order: [
        ['name', 'name_info', 'state_content'],
        ['value', 'info'],
      ],
    });
    assert.deepEqual(layoutOf(el), [['name', 'name_info', 'state_content'], ['value', 'info'], ['bar']]);
  });

  test('multiline keeps both info lines in one leaf', async () => {
    const el = await mount({ multiline: true, content_order: [['info'], ['bar'], ['value']] });
    assert.ok(content(el).querySelector('[data-block="info"] > .secondary-info-extra-2'));
  });

  test('Template orders name, info and bar', async () => {
    const el = await mount(
      { secondary: 'Door', content_order: [['bar'], ['name'], ['info']] },
      'entity-progress-card-template',
    );
    assert.deepEqual(layoutOf(el), [['bar'], ['name'], ['info']]);
  });
});

describe('content_order texts in their leaves', () => {
  test('the custom_info text goes to its leaf, with no spacer', async () => {
    const { el, push } = await mountWithPush({ content_order: [['bar'], ['value', 'name'], ['info']] });
    await push('Door');
    assert.equal(textOf(el, 'info'), 'Door');
  });

  test('a new order on the same card moves the custom_info text too', async () => {
    const { el, hass, push } = await mountWithPush({});
    await push('Door');
    el.setConfig?.({
      type: 'custom:entity-progress-card',
      entity: TEST_ENTITY,
      ...JINJA,
      content_order: [['bar'], ['info']],
    });
    el.hass = { ...hass };
    await flushFrames();
    await sleep(JINJA_PASS_MS + RENDER_MS);
    assert.equal(textOf(el, 'info'), 'Door');
  });

  test('state_content gets a leaf of its own, the value alone in its', async () => {
    const el = await mount({
      state_content: ['last_changed'],
      content_order: [['state_content'], ['name'], ['value']],
    });
    assert.notEqual(textOf(el, 'state_content'), '');
    assert.equal(textOf(el, 'value'), '42%');
  });

  test('a text with no field behind it has no leaf', async () => {
    const el = await mount({
      name_info: undefined,
      custom_info: undefined,
      content_order: [['name_info', 'name'], ['info', 'value'], ['bar']],
    });
    assert.equal(el.shadowRoot?.querySelector('[data-block="name_info"]'), null);
    assert.equal(el.shadowRoot?.querySelector('[data-block="info"]'), null);
  });
});

describe('content_order in horizontal', () => {
  const HORIZONTAL = { layout: 'horizontal' };

  test('the default lines build the markup they always did', async () => {
    const plain = await mount(HORIZONTAL);
    const ordered = await mount({
      ...HORIZONTAL,
      content_order: [
        ['name', 'name_info'],
        ['info', 'state_content', 'value', 'bar'],
      ],
    });
    assert.equal(content(ordered).innerHTML, content(plain).innerHTML);
  });

  test('one row per line', async () => {
    const el = await mount({
      ...HORIZONTAL,
      unit_position: 'after',
      content_order: [
        ['name', 'value'],
        ['info', 'bar'],
      ],
    });
    assert.deepEqual(layoutOf(el), [
      ['name', 'name_info', 'state_content', 'value'],
      ['info', 'bar'],
    ]);
    assert.equal(textOf(el, 'value'), '42%', 'the unit moves with it');
  });

  test('texts group between bars; a value closing a bar-less line stands alone', async () => {
    const el = await mount({
      ...HORIZONTAL,
      content_order: [
        ['name', 'value'],
        ['info', 'bar'],
      ],
    });
    const [first, second] = [...content(el).querySelectorAll('.content-line')];
    assert.equal(first.querySelectorAll('.content-group').length, 2);
    assert.equal(first.lastElementChild?.className, 'content-group value-end');
    assert.ok(second.classList.contains('with-bar'));
    assert.deepEqual(
      [...second.children].map((part) => part.className.split(' ')[0]),
      ['content-group', BAR_CLASS],
    );
  });

  test('a flat list is a single line', async () => {
    assert.deepEqual(layoutOf(await mount({ ...HORIZONTAL, content_order: ['bar'] })), [
      ['bar', 'name', 'name_info', 'info', 'state_content', 'value'],
    ]);
  });

  test('compact_below orders its line and keeps the bar below', async () => {
    const el = await mount({ ...HORIZONTAL, bar_position: 'compact_below', content_order: [['value', 'name']] });
    assert.deepEqual(layoutOf(el), [['state_content', 'value', 'name', 'name_info', 'info'], ['bar']]);
  });

  test('with the bar outside the text, only the texts are ordered', async () => {
    for (const bar_position of ['below', 'top', 'bottom', 'overlay', 'background']) {
      const el = await mount({ ...HORIZONTAL, bar_position, content_order: [['value', 'bar'], ['name']] });
      assert.deepEqual(
        layoutOf(el).filter((line) => line[0] !== 'bar'),
        [
          ['state_content', 'value'],
          ['name', 'name_info', 'info'],
        ],
        bar_position,
      );
      assert.equal(el.shadowRoot?.querySelectorAll('.bar-container').length, 1, `${bar_position}: one bar`);
    }
  });

  test('icon position ignores it', async () => {
    const plain = await mount({ ...HORIZONTAL, bar_position: 'icon' });
    const ordered = await mount({ ...HORIZONTAL, bar_position: 'icon', content_order: ['bar'] });
    assert.equal(content(ordered).innerHTML, content(plain).innerHTML);
  });
});

describe('content_order in single_line', () => {
  const SINGLE = { density: 'single_line' };

  test('the default order builds the markup it always did', async () => {
    const plain = await mount(SINGLE);
    const ordered = await mount({
      ...SINGLE,
      content_order: [['name', 'name_info', 'info', 'state_content', 'value', 'bar']],
    });
    assert.equal(content(ordered).innerHTML, content(plain).innerHTML);
  });

  test('one line, the bar among the texts, no title line', async () => {
    const el = await mount({ ...SINGLE, content_order: ['bar', 'value'] });
    assert.deepEqual(layoutOf(el), [['bar', 'state_content', 'value', 'name', 'name_info', 'info']]);
    assert.equal(content(el).querySelector('.content-line.lead'), null);
  });

  test('an ordered row leaves reverse_secondary_info_row nothing to do', async () => {
    const el = await mount({ ...SINGLE, reverse_secondary_info_row: true, content_order: ['bar'] });
    assert.equal(el.shadowRoot?.querySelector('ha-card.row-reverse'), null);
  });
});

describe('hide reaches each text block', () => {
  test('state_content goes, the value stays', async () => {
    for (const content_order of [undefined, [['name'], ['state_content', 'value']]]) {
      const el = await mount({ state_content: ['last_changed'], hide: ['state_content'], content_order });
      const info = el.shadowRoot?.querySelector('.secondary-info-main')?.textContent ?? '';
      assert.equal(info, '42%', `order ${JSON.stringify(content_order)}`);
      assert.equal(textOf(el, 'state_content'), '');
    }
  });

  test('a text a list hide removes has no leaf: the bar stands alone', async () => {
    const el = await mount({
      state_content: ['last_changed'],
      hide: ['info'],
      content_order: [['name', 'name_info', 'state_content'], ['value'], ['bar']],
    });
    assert.deepEqual(layoutOf(el), [['name', 'name_info', 'state_content'], ['value'], ['bar']]);
  });

  test('a Jinja hide blanks custom_info', async () => {
    const HIDE = "{{ ['info'] }}";
    const { el, push } = await mountWithPush({ hide: HIDE }, { [HIDE]: ['info'] });
    await push('Door');
    assert.equal(el.shadowRoot?.querySelector('.secondary-info-extra-1')?.textContent, '');
  });

  // A leaf hidden by a class is not :empty: its neighbour's " · " would hang.
  test('a Jinja hide blanks the ordered leaves of its group', async () => {
    const HIDE = "{{ ['name', 'secondary_info'] }}";
    const { el, push } = await mountWithPush(
      {
        hide: HIDE,
        layout: 'horizontal',
        content_order: [
          ['name', 'value'],
          ['info', 'bar'],
        ],
      },
      { [HIDE]: ['name', 'secondary_info'] },
    );
    await push('Door');
    await sleep(JINJA_PASS_MS);
    for (const token of ['name', 'name_info', 'value', 'info', 'state_content']) {
      assert.equal(textOf(el, token), '', token);
    }
  });
});

describe('an ordered stack sizes its rows', () => {
  const FOUR_LINES = { content_order: [['name', 'name_info'], ['value'], ['info'], ['bar']] };

  test('a line more than the default stack takes a row more', async () => {
    assert.equal(rows(await mount(FOUR_LINES)), rows(await mount({})) + 1);
  });

  test('no icon leaves it room', async () => {
    assert.equal(rows(await mount({ ...FOUR_LINES, hide: ['icon'] })), 2);
  });

  test('an xlarge bar, moved below, counts under the lines', async () => {
    const el = await mount({
      bar_size: 'xlarge',
      hide: ['icon'],
      content_order: [['name', 'name_info'], ['state_content'], ['bar'], ['info'], ['value']],
    });
    assert.equal(rows(el), 3);
  });

  test('an overlay bar sits behind the lines it outgrows', async () => {
    const el = await mount({
      bar_position: 'overlay',
      content_order: [['name', 'name_info'], ['state_content'], ['value'], ['info']],
    });
    assert.equal(rows(el), 3);
  });

  test('an upright bar: overlay behind the lines, default under them', async () => {
    const order = [['name'], ['state_content'], ['value'], ['name_info']];
    const overlay = await mount({ bar_position: 'overlay', bar_orientation: 'up', content_order: order });
    const stack = await mount({ bar_orientation: 'up', content_order: [...order, ['bar']] });
    assert.equal(rows(overlay), 3);
    assert.equal(rows(stack), 4);
  });

  test('the default lines keep the default rows', async () => {
    assert.equal(rows(await mount({ content_order: [['info'], ['name'], ['bar']] })), rows(await mount({})));
  });
});

describe('an upright bar in the vertical stack', () => {
  test('takes the vertical-bar class and a row of its own', async () => {
    const plain = await mount({});
    const upright = await mount({ bar_orientation: 'up' });
    assert.ok(upright.shadowRoot?.querySelector('ha-card.vertical-bar'));
    assert.equal(plain.shadowRoot?.querySelector('ha-card.vertical-bar'), null);
    assert.equal(rows(upright), rows(plain) + 1);
  });

  test('down is up mirrored', async () => {
    const el = await mount({ bar_orientation: 'down' });
    assert.ok(el.shadowRoot?.querySelector('ha-card.vertical-bar.up-orientation.down-orientation'));
  });
});
