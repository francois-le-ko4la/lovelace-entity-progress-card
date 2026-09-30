/*
 * The card's own clock: what ages with no state change - a running timer, a
 * relative time, a peak_marker window sliding over its history - gets a local
 * tick at the instant what it shows next changes. Anything else gets none.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../ha-stubs.js';
import '../../src/index.js';

const TIMER = 'timer.laundry';
const SECOND = 1000;
const MINUTE = 60000;
const TIMER_DURATION = 5 * MINUTE;
const CARD_TAG = 'entity-progress-card';
const RELATIVE = { state_content: ['last_changed'] };

type View = {
  nextTickAt: (now: number) => number | null;
  seedPeakMarker: (points: { t: number; value: number }[]) => void;
};
type CardEl = HTMLElement & {
  setConfig?: (c: unknown) => void;
  hass?: unknown;
  _cardView?: View;
  _onAutoRefreshTick?: () => void;
};
type Refreshable = { _startAutoRefresh: (...args: unknown[]) => unknown };

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * MINUTE).toISOString();

const timerState = (state: string) => ({
  entity_id: TIMER,
  state,
  attributes: {
    duration: '0:05:00',
    remaining: '0:05:00',
    finishes_at: new Date(Date.now() + TIMER_DURATION).toISOString(),
  },
});
const startedAtOf = (state: ReturnType<typeof timerState>) => Date.parse(state.attributes.finishes_at) - TIMER_DURATION;

const sensorState = (lastChanged: string) => ({
  entity_id: TEST_ENTITY,
  state: '42',
  attributes: { unit_of_measurement: '%' },
  last_changed: lastChanged,
  last_updated: lastChanged,
});

const mount = async (config: Record<string, unknown>, states: Record<string, unknown>) => {
  const el = document.createElement(CARD_TAG) as CardEl;
  el.setConfig?.({ type: `custom:${CARD_TAG}`, ...config });
  document.body.appendChild(el);
  el.hass = makeHass({ states });
  await flushFrames();
  return el;
};

// The next tick, as a delay from `now` and as the instant itself.
const nextTick = (el: CardEl) => {
  const now = Date.now();
  const at = el._cardView?.nextTickAt(now) ?? null;
  return { at, delay: at === null ? null : at - now };
};

describe('when the next tick lands', () => {
  test("a running timer turns on its own second, not the wall clock's", async () => {
    const state = timerState('active');
    const el = await mount({ entity: TIMER }, { [TIMER]: state });
    const { at, delay } = nextTick(el);
    assert.ok(delay !== null && delay > 0 && delay <= SECOND, `due in ${delay}ms`);
    assert.equal(((at as number) - startedAtOf(state)) % SECOND, 0);
  });

  test('in %, a timer moves one percent at a time, half a step in (the value rounds)', async () => {
    const state = timerState('active');
    const el = await mount({ entity: TIMER, unit: '%' }, { [TIMER]: state });
    const step = TIMER_DURATION / 100;
    const { at, delay } = nextTick(el);
    assert.ok(delay !== null && delay > 0 && delay <= step, `due in ${delay}ms`);
    assert.equal(((at as number) - startedAtOf(state)) % step, step / 2);
  });

  test('in hours, a timer still counts its seconds: they are what it shows', async () => {
    const el = await mount({ entity: TIMER, unit: 'h' }, { [TIMER]: timerState('active') });
    const { delay } = nextTick(el);
    assert.ok(delay !== null && delay <= SECOND, `due in ${delay}ms`);
  });

  test('an idle timer needs none', async () => {
    const el = await mount({ entity: TIMER }, { [TIMER]: timerState('idle') });
    assert.equal(nextTick(el).at, null);
  });

  test('a relative time ticks when its reading changes, not before', async () => {
    const cases: [string, number, number][] = [
      ['5s old reads 5 seconds until 6s', 5.2 * SECOND, 6 * SECOND],
      ['100s old reads 2 minutes until 150s', 100 * SECOND, 150 * SECOND],
      ['2h10 old reads 2 hours until 2h30', 130 * MINUTE, 150 * MINUTE],
    ];
    for (const [label, age, changesAt] of cases) {
      const since = Date.now() - age;
      const el = await mount(
        { entity: TEST_ENTITY, ...RELATIVE },
        { [TEST_ENTITY]: sensorState(new Date(since).toISOString()) },
      );
      assert.equal(nextTick(el).at, since + changesAt, label);
    }
  });

  test('a seeded peak_marker window slides on the minute', async () => {
    const el = await mount(
      { entity: TEST_ENTITY, peak_marker: { window: '2h', min: true } },
      {
        [TEST_ENTITY]: sensorState(minutesAgo(5)),
      },
    );
    el._cardView?.seedPeakMarker([{ t: Date.now() - MINUTE, value: 40 }]);
    const { at, delay } = nextTick(el);
    assert.ok(delay !== null && delay <= MINUTE, `due in ${delay}ms`);
    assert.equal((at as number) % MINUTE, 0);
  });

  test('a trend_indicator window slides on the minute, a shorter one sooner', async () => {
    for (const [window, step] of [
      ['1h', MINUTE],
      ['30s', 30 * SECOND],
    ] as const) {
      const el = await mount(
        { entity: TEST_ENTITY, trend_indicator: { window } },
        {
          [TEST_ENTITY]: sensorState(minutesAgo(5)),
        },
      );
      const { at, delay } = nextTick(el);
      assert.ok(delay !== null && delay <= step, `${window}: due in ${delay}ms`);
      assert.equal((at as number) % step, 0, window);
    }
  });

  test('a card with nothing that ages asks for no tick at all', async () => {
    const el = await mount({ entity: TEST_ENTITY }, { [TEST_ENTITY]: sensorState(minutesAgo(5)) });
    assert.equal(nextTick(el).at, null);
  });
});

describe('an earlier deadline takes over at once', () => {
  test('a relative time turning fresh re-arms the loop to its next second, once', async () => {
    const proto = (customElements.get(CARD_TAG) as CustomElementConstructor).prototype as Refreshable;
    const original = proto._startAutoRefresh;
    let starts = 0;
    proto._startAutoRefresh = function counted(this: unknown, ...args: unknown[]) {
      starts++;
      return original.apply(this, args);
    };
    try {
      const config = { entity: TEST_ENTITY, ...RELATIVE };
      const el = await mount(config, { [TEST_ENTITY]: sensorState(minutesAgo(5)) });
      assert.ok((nextTick(el).delay ?? 0) > SECOND, 'a 5-minute-old reading changes in about 30s');
      // Counted from here: setConfig already runs on the shared hass a previous
      // test left behind, and arms the loop from it too.
      starts = 0;

      const fresh = () => makeHass({ states: { [TEST_ENTITY]: sensorState(new Date().toISOString()) } });
      el.hass = fresh();
      assert.equal(starts, 1, 'a fresh relative time should re-arm the loop to its next second');
      el.hass = fresh();
      assert.equal(starts, 1, 'a later deadline must not re-arm it again');
    } finally {
      proto._startAutoRefresh = original;
    }
  });
});

// A running timer never sends a new state: the tick is all that moves it, so
// whatever reads its value has to follow the bar on that tick.
describe('what the tick carries besides the bar', () => {
  test('a running timer crossing alert_when.above lights the alert on the tick alone', async () => {
    const state = timerState('active');
    const el = await mount({ entity: TIMER, alert_when: { above: 240 } }, { [TIMER]: state });
    const alertOn = () => Boolean(el.shadowRoot?.querySelector('ha-card')?.classList.contains('alert-active'));
    assert.equal(alertOn(), false, 'the timer has only just started');

    // Time passes and nothing else: the same state object, 30s from its end.
    state.attributes.finishes_at = new Date(Date.now() + 30 * SECOND).toISOString();
    el._onAutoRefreshTick?.();
    await flushFrames();
    assert.equal(alertOn(), true, '270s into a 300s timer is above 240');
  });

  test('the countdown moves, the name is not rewritten', async () => {
    const state = timerState('active');
    const el = await mount({ entity: TIMER }, { [TIMER]: state });
    const textOf = (selector: string) => el.shadowRoot?.querySelector(selector)?.firstChild;
    const name = textOf('.name-main');
    const value = textOf('.secondary-info-main');

    state.attributes.finishes_at = new Date(Date.now() + 30 * SECOND).toISOString();
    el._onAutoRefreshTick?.();
    assert.notEqual(textOf('.secondary-info-main'), value, 'the countdown did not move');
    assert.equal(textOf('.name-main'), name, 'an unchanged name was written again');
  });
});
