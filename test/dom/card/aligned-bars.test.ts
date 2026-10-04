/*
 * bar_aligned: the rows of a group take the text column of the widest. true is
 * one Multi; a name, every card sharing it. happy-dom lays nothing out, so the
 * widths are the members' own.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';

import '../../../src/index.js';
import { joinAlignedRows, alignTiming } from '../../../src/card/aligned-bars.js';

const ALIGN_VAR = '--current-align-width';
const FLOOR_VAR = '--current-align-text-floor';
const MULTI = 'entity-progress-multi-card';
const CARD = 'entity-progress-card';

// A row whose text can change: width is what the next measurement reads.
const member = (initial: number, cap = 1000) => {
  const applied: string[] = [];
  const row = {
    width: initial,
    measures: 0,
    last: () => applied.at(-1),
    measure: () => {
      row.measures += 1;
      return row.width;
    },
    cap: () => cap,
    apply: (value: string) => applied.push(value),
  };
  return row;
};

// Any object stands for the Multi the rows sit in.
const MULTI_ROOT = {};
const joinAll = (...rows: ReturnType<typeof member>[]) => rows.map((row) => joinAlignedRows(MULTI_ROOT, row));
const leaveAll = (handles: ReturnType<typeof joinAll>) => handles.forEach((handle) => handle.leave());

describe('bar_aligned - one width per Multi', () => {
  test('every row takes the widest, and another Multi keeps its own', async () => {
    const narrow = member(40);
    const wide = member(90.2);
    const elsewhere = member(30);
    const handles = [...joinAll(narrow, wide), joinAlignedRows({}, elsewhere)];
    await flushFrames();
    assert.deepEqual([narrow.last(), wide.last(), elsewhere.last()], ['91px', '91px', '30px']);
    leaveAll(handles);
  });

  test('a name gathers rows from different places, and only those', async () => {
    const card = member(40);
    const row = member(90);
    const handles = [joinAlignedRows('batteries', card), joinAlignedRows('batteries', row), ...joinAll(member(20))];
    await flushFrames();
    assert.deepEqual([card.last(), row.last()], ['90px', '90px']);
    leaveAll(handles);
  });

  test("a row's own cap wins over the shared width", async () => {
    const capped = member(40, 50);
    const handles = joinAll(capped, member(90));
    await flushFrames();
    assert.equal(capped.last(), '50px');
    leaveAll(handles);
  });

  test('a row that leaves gets its own width back, the rest is measured again', async () => {
    const staying = member(40);
    const leaving = member(90);
    const [handle] = joinAll(staying);
    joinAlignedRows(MULTI_ROOT, leaving).leave();
    await flushFrames();
    assert.equal(leaving.last(), '');
    assert.equal(staying.last(), '40px');
    handle.leave();
  });

  test('a shorter text keeps the column, a longer one widens it for every row', async () => {
    const short = member(40);
    const long = member(90);
    const handles = joinAll(short, long);
    await flushFrames();
    const shortMeasures = short.measures;
    long.width = 60;
    handles[1].textChanged();
    await flushFrames();
    assert.deepEqual([short.last(), long.last()], ['90px', '90px'], 'the column shrank');
    assert.equal(short.measures, shortMeasures, 'a row whose text did not change was measured');
    short.width = 120;
    handles[0].textChanged();
    await flushFrames();
    assert.deepEqual([short.last(), long.last()], ['120px', '120px']);
    leaveAll(handles);
  });

  test('changes within a frame are measured once', async () => {
    const one = member(40);
    const [handle] = joinAll(one);
    await flushFrames();
    const before = one.measures;
    for (let i = 0; i < 5; i += 1) handle.textChanged();
    await flushFrames();
    assert.equal(one.measures, before + 1);
    handle.leave();
  });
});

describe('bar_aligned - when the column shrinks', () => {
  test('a narrower text that holds shrinks the column once the delay is over', async () => {
    const delay = alignTiming.shrinkDelay;
    alignTiming.shrinkDelay = 20;
    const one = member(40);
    const two = member(90);
    const handles = joinAll(one, two);
    await flushFrames();
    two.width = 60;
    handles[1].textChanged();
    await flushFrames();
    assert.equal(one.last(), '90px', 'shrank before the delay');
    await new Promise((resolve) => {
      setTimeout(resolve, 60);
    });
    assert.deepEqual([one.last(), two.last()], ['60px', '60px']);
    leaveAll(handles);
    alignTiming.shrinkDelay = delay;
  });

  test('a resize measures every row again, and lets the column shrink', async () => {
    const one = member(40);
    const two = member(90);
    const handles = joinAll(one, two);
    await flushFrames();
    two.width = 60;
    handles[0].resized();
    await flushFrames();
    assert.deepEqual([one.last(), two.last()], ['60px', '60px']);
    leaveAll(handles);
  });
});

describe('bar_aligned - on real cards', () => {
  type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };

  const mount = (tag: string, config: Record<string, unknown>): CardEl => {
    const el = document.createElement(tag) as CardEl;
    el.setConfig?.({ type: `custom:${tag}`, ...config });
    document.body.appendChild(el);
    el.hass = makeHass();
    return el;
  };

  const styleOf = (card: Element, name: string) =>
    card.shadowRoot?.querySelector<HTMLElement>('ha-card')?.style.getPropertyValue(name) ?? '';
  const widthOf = (card: Element) => styleOf(card, ALIGN_VAR);

  test("a Multi's rows are aligned by default, a card on its own isn't", async () => {
    const multi = mount(MULTI, { entities: [TEST_ENTITY, TEST_ENTITY] });
    const card = mount(CARD, { entity: TEST_ENTITY, density: 'single_line', bar_aligned: true });
    await flushFrames();
    const rows = [...(multi.shadowRoot?.querySelectorAll(CARD) ?? [])];
    assert.equal(rows.length, 2);
    for (const row of rows) assert.match(widthOf(row), /^\d+px$/);
    for (const row of rows) assert.equal(styleOf(row, FLOOR_VAR), '0px', "the text's own floor stayed");
    assert.equal(widthOf(card), '');
  });

  test('cards sharing a name line up wherever the value sits beside the bar', async () => {
    const named = { entity: TEST_ENTITY, bar_aligned: 'batteries' };
    const cards = [mount(CARD, { ...named, density: 'single_line' }), mount(CARD, named)];
    const barOnTop = mount(CARD, { ...named, bar_position: 'top' });
    await flushFrames();
    for (const card of cards) assert.match(widthOf(card), /^\d+px$/);
    assert.equal(widthOf(barOnTop), '', 'a bar on its own row has nothing to line up');
  });

  test('bar_aligned: false leaves a Multi as its rows size themselves', async () => {
    const multi = mount(MULTI, { bar_aligned: false, entities: [TEST_ENTITY] });
    await flushFrames();
    const row = multi.shadowRoot?.querySelector(CARD);
    assert.ok(row, 'no row');
    assert.equal(widthOf(row), '');
  });

  test('bar_max_width leaves the text column alone', async () => {
    const multi = mount(MULTI, { bar_aligned: true, bar_max_width: '100px', entities: [TEST_ENTITY] });
    await flushFrames();
    const row = multi.shadowRoot?.querySelector(CARD);
    assert.ok(row, 'no row');
    assert.equal(widthOf(row), '');
  });
});
