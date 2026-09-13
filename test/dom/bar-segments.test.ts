/*
 * A segment gap is a hole, not a painted strip. It used to copy
 * --ha-card-background so it would read as a cut through the card - which
 * stops being true the moment the card isn't that color: `frameless` sets
 * --ha-card-background: transparent itself, and the gaps then showed .bar's
 * own track through, in the same color as the cells around them.
 *
 * Two rules hold the invariant, and both are asserted here: the cell row
 * paints nothing at all (read off the stylesheet - happy-dom won't resolve a
 * var() chain), and .bar gives up its own track in segmented mode, where each
 * cell already paints its share of it.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../ha-stubs.js';
import { CARD_CSS } from '../../src/utils/styles.js';
import '../../src/index.js';

const LAYOUTS: [string, Record<string, unknown>][] = [
  ['plain', {}],
  ['frameless', { frameless: true }],
  ['center_zero', { center_zero: true, min_value: -100 }],
  ['vertical', { layout: 'vertical' }],
  ['overlay', { bar_position: 'overlay' }],
];

const mount = async (extra: Record<string, unknown>) => {
  const el = document.createElement('entity-progress-card') as HTMLElement & {
    setConfig?: (c: unknown) => void;
    hass?: unknown;
  };
  el.setConfig?.({ type: 'custom:entity-progress-card', entity: TEST_ENTITY, ...extra });
  document.body.appendChild(el);
  el.hass = makeHass();
  await flushFrames();
  return el.shadowRoot as ShadowRoot;
};

const barBackground = (root: ShadowRoot) => {
  const bar = root.querySelector('.progress-bar');
  assert.ok(bar, 'the bar is missing');
  return getComputedStyle(bar as HTMLElement).backgroundColor;
};

// The rule block for a selector, up to its closing brace.
const ruleFor = (selector: string) => {
  const start = CARD_CSS.indexOf(`\n${selector} {`);
  assert.notEqual(start, -1, `no rule found for ${selector}`);
  return CARD_CSS.slice(start, CARD_CSS.indexOf('}', start));
};

describe('bar_segments - the gap is a hole, not a painted strip', () => {
  test('the cell row declares no background of its own', () => {
    assert.doesNotMatch(ruleFor('.bar-segments'), /background/, 'a painted gap stops being a cut');
  });

  for (const [label, extra] of LAYOUTS) {
    test(`${label}: the bar gives up its track once segmented`, async () => {
      const root = await mount({ bar_segments: 5, ...extra });
      assert.ok(root.querySelector('.segment-cell'), 'no cells were built');
      assert.equal(barBackground(root), 'transparent', 'the bar would show through every gap');
    });
  }

  test('an unsegmented bar keeps its track', async () => {
    const root = await mount({});
    assert.equal(root.querySelector('.segment-cell'), null, 'no cells without bar_segments');
    assert.notEqual(barBackground(root), 'transparent');
  });
});
