/*
 * One rule, two readers: density compact + layout vertical forces name and
 * secondary_info hidden. The card toggles the hide-* class from it, the hide
 * chips lock the same targets - they must never disagree.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';
import { EditorFactory } from '../../../src/editor/factory.js';
import { EntityProgressHideChips } from '../../../src/editor/elements/chips.js';
import '../../../src/index.js';

type CardEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };
type Component = { label: string; class: string };
type ChipsEl = HTMLElement & { items: string[]; updateConfig: (c: unknown) => void; _chips: Map<string, HTMLElement> };

const CARD_TAG = 'entity-progress-card';

const hiddenOnCard = async (config: Record<string, unknown>) => {
  const el = document.createElement(CARD_TAG) as CardEl;
  el.setConfig?.({ type: `custom:${CARD_TAG}`, entity: TEST_ENTITY, ...config });
  document.body.appendChild(el);
  el.hass = makeHass();
  await flushFrames();
  const card = el.shadowRoot?.querySelector('ha-card');
  const components = (el as unknown as { hiddenComponents: Component[] }).hiddenComponents;
  return components.filter((component) => card?.classList.contains(component.class)).map((c) => c.label);
};

const forcedOnChips = (config: Record<string, unknown>) => {
  const chips = document.createElement(EntityProgressHideChips.ELEMENT_NAME) as ChipsEl;
  chips.items = EditorFactory.hideChipsItems('card');
  chips.updateConfig(config);
  document.body.appendChild(chips);
  return [...chips._chips].filter(([, chip]) => chip.classList.contains('forced')).map(([item]) => item);
};

describe('the forced hide rule is the same on the card and in the hide chips', () => {
  const CASES: [string, Record<string, unknown>, string[]][] = [
    ['default', {}, []],
    ['compact horizontal', { density: 'compact', layout: 'horizontal' }, []],
    ['compact vertical', { density: 'compact', layout: 'vertical' }, ['name', 'secondary_info']],
    ['default vertical', { layout: 'vertical' }, []],
    ['single_line', { density: 'single_line' }, []],
  ];

  for (const [label, config, expected] of CASES) {
    test(`${label}: card and chips force the same targets`, async () => {
      assert.deepEqual((await hiddenOnCard(config)).sort(), [...expected].sort(), 'card');
      assert.deepEqual(forcedOnChips(config).sort(), [...expected].sort(), 'chips');
    });
  }
});
