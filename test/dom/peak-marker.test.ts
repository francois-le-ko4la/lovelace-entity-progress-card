/*
 * A mark is only drawn if the renderer can reach its element: HACore._domKeys
 * is what _storeDOM registers, and DOMHelper silently ignores a key it was
 * never given. An element can therefore sit in the template, carry the right
 * config, and never receive the `shown` class that takes it out of
 * `display: none` - which is exactly what peak_marker.range did on arrival.
 *
 * So this mounts a card whose four peak marks are all configured, feeds it
 * real history, and checks each one actually reached the DOM.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../ha-stubs.js';
import '../../src/index.js';

// Compressed-state shape, the one _fetchHistory reads (s/lu, lu in seconds).
const history = () => {
  const now = Math.floor(Date.now() / 1000);
  return {
    [TEST_ENTITY]: [
      { s: '24.5', lu: now - 7200 },
      { s: '27.5', lu: now - 3600 },
      { s: '26', lu: now - 60 },
    ],
  };
};

const mount = async (peakMarker: Record<string, unknown>) => {
  const el = document.createElement('entity-progress-card') as HTMLElement & {
    setConfig?: (c: unknown) => void;
    hass?: unknown;
  };
  el.setConfig?.({
    type: 'custom:entity-progress-card',
    entity: TEST_ENTITY,
    min_value: 24,
    max_value: 28,
    peak_marker: peakMarker,
  });
  document.body.appendChild(el);
  const hass = makeHass() as Record<string, unknown> & {
    connection: { connected?: boolean; sendMessagePromise?: () => Promise<unknown> };
  };
  hass.connection.connected = true;
  hass.connection.sendMessagePromise = () => Promise.resolve(history());
  el.hass = hass;
  // One for the mount, one for the history round trip it starts.
  await flushFrames();
  await flushFrames();
  return el.shadowRoot as ShadowRoot;
};

const RANGE = '.peak-range';
const classesOf = (root: ShadowRoot, selector: string) => {
  const el = root.querySelector(selector);
  assert.ok(el, `${selector} is missing from the rendered card`);
  return (el.getAttribute('class') ?? '').split(/\s+/);
};

describe('peak_marker - every configured mark reaches the DOM', () => {
  test('the four marks are shown, each with its own shape', async () => {
    const root = await mount({
      window: '2h',
      range: { type: 'area' },
      min: { type: 'striped' },
      max: { type: 'striped' },
      average: { type: 'round' },
    });

    for (const [selector, shape] of [
      [RANGE, 'wm-area'],
      ['.peak-min', 'wm-striped'],
      ['.peak-max', 'wm-striped'],
      ['.peak-avg', 'wm-round'],
    ] as const) {
      const classes = classesOf(root, selector);
      assert.ok(classes.includes('shown'), `${selector} never got the shown class - is its key in _domKeys?`);
      assert.ok(classes.includes(shape), `${selector} should be drawn as ${shape}, got ${classes.join(' ')}`);
    }
  });

  test('a mark left out stays hidden', async () => {
    const root = await mount({ window: '2h', min: true });
    assert.ok(classesOf(root, '.peak-min').includes('shown'));
    for (const selector of [RANGE, '.peak-max', '.peak-avg'])
      assert.equal(classesOf(root, selector).includes('shown'), false, `${selector} was never asked for`);
  });

  test('the band spans the two marks it sits between, drawn or not', async () => {
    const root = await mount({ window: '2h', range: true });
    const style = (root.querySelector('ha-card') as HTMLElement).getAttribute('style') ?? '';
    // min/max positions are published whether or not their own mark is shown -
    // the band reads them straight from there (see styles.ts, .peak-range).
    assert.match(style, /--peak-min-value:\s*12\.5%/);
    assert.match(style, /--peak-max-value:\s*87\.5%/);
    assert.ok(classesOf(root, RANGE).includes('shown'));
    assert.equal(classesOf(root, '.peak-min').includes('shown'), false);
  });
});
