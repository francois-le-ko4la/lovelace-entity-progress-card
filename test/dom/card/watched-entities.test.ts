/*
 * Every option that takes an entity refreshes the card when that entity - and
 * only that entity - changes. One left out of _registerWatchedEntities freezes.
 * The other half is the hot path: Home Assistant hands every card every state
 * change, and a card that refreshes on one that is not its own pays for it on
 * every update of the whole instance.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Side-effect import, and it must stay first: src/ registers its elements at
// module-evaluation time.
import { flushFrames } from '../../dom-setup.js';
import { makeHass } from '../../ha-stubs.js';

import { META } from '../../../src/utils/parameters.js';
import '../../../src/index.js';

const MAIN = 'sensor.main';
const REFERENCED = 'sensor.referenced';
const UNRELATED = 'sensor.unrelated';
const { typeName } = META.types.card as { typeName: string };

type Hass = Record<string, unknown> & { states: Record<string, unknown> };
type CardElement = HTMLElement & { setConfig: (config: unknown) => void; hass: unknown };
type Refreshable = { _handleHassUpdate: (...args: unknown[]) => unknown };

const stateOf = (entityId: string, state: string) => ({
  entity_id: entityId,
  state,
  attributes: { friendly_name: entityId, max: 100 },
});

// What Home Assistant does on a state change: only `states` is replaced.
const withState = (hass: Hass, entityId: string, state: string): Hass => ({
  ...hass,
  states: { ...hass.states, [entityId]: stateOf(entityId, state) },
});

// Counts _handleHassUpdate on every card - the refresh a hass update costs.
const spyRefreshes = () => {
  const proto = (customElements.get(typeName) as CustomElementConstructor).prototype as Refreshable;
  const original = proto._handleHassUpdate;
  const spy = {
    count: 0,
    restore: () => {
      proto._handleHassUpdate = original;
    },
  };
  proto._handleHassUpdate = function counted(this: unknown, ...args: unknown[]) {
    spy.count++;
    return original.apply(this, args);
  };
  return spy;
};

const mountCard = async (option: Record<string, unknown>) => {
  const card = document.createElement(typeName) as CardElement;
  card.setConfig({ type: `custom:${typeName}`, entity: MAIN, ...option });
  document.body.appendChild(card);
  const hass = makeHass({
    states: {
      [MAIN]: stateOf(MAIN, '40'),
      [REFERENCED]: stateOf(REFERENCED, '80'),
      [UNRELATED]: stateOf(UNRELATED, '1'),
    },
  }) as Hass;
  card.hass = hass;
  await flushFrames();
  return { card, hass };
};

const OPTIONS: [string, Record<string, unknown>][] = [
  ['min_value: { entity }', { min_value: { entity: REFERENCED } }],
  ['max_value: { entity }', { max_value: { entity: REFERENCED } }],
  ['max_value: { entity, attribute }', { max_value: { entity: REFERENCED, attribute: 'max' } }],
  ['watermark.high: { entity }', { watermark: { high: { entity: REFERENCED } } }],
  ['watermark.low: { value: { entity } }', { watermark: { low: { value: { entity: REFERENCED }, color: 'red' } } }],
  ['alert_when.above: { entity }', { alert_when: { above: { entity: REFERENCED } } }],
  ['alert_when.below: { entity }', { alert_when: { below: { entity: REFERENCED } } }],
  ['bar_stack.entities[].entity', { bar_stack: { entities: [{ entity: REFERENCED }] } }],
];

describe('an entity-valued option refreshes the card on that entity alone', () => {
  for (const [label, option] of OPTIONS) {
    test(label, async () => {
      const spy = spyRefreshes();
      try {
        const mounted = await mountCard(option);
        const { card } = mounted;
        let { hass } = mounted;

        spy.count = 0;
        hass = withState(hass, UNRELATED, '2');
        card.hass = hass;
        assert.equal(spy.count, 0, 'a change on an unrelated entity refreshed the card');

        hass = withState(hass, REFERENCED, '60');
        card.hass = hass;
        assert.equal(spy.count, 1, `${label}: its entity changed and the card did not refresh`);
      } finally {
        spy.restore();
      }
    });
  }
});

describe('a hass update the card has no stake in costs it nothing', () => {
  test('only its own entity, a new language or new formatters refresh a plain card', async () => {
    const spy = spyRefreshes();
    try {
      const mounted = await mountCard({});
      const { card } = mounted;
      let { hass } = mounted;

      spy.count = 0;
      card.hass = hass;
      assert.equal(spy.count, 0, 'the very same hass handed twice refreshed the card');

      hass = withState(hass, UNRELATED, '2');
      card.hass = hass;
      assert.equal(spy.count, 0, 'a change on an unrelated entity refreshed the card');

      hass = { ...hass, language: 'fr' };
      card.hass = hass;
      assert.equal(spy.count, 1, 'a new language must re-render the labels');

      // HA's own formatters follow a moment later, once its translations load.
      hass = { ...hass, formatEntityState: () => 'Indisponible' };
      card.hass = hass;
      assert.equal(spy.count, 2, "Home Assistant's new formatters left the card in the old language");

      hass = withState(hass, MAIN, '41');
      card.hass = hass;
      assert.equal(spy.count, 3, 'its own entity changed and the card did not refresh');
    } finally {
      spy.restore();
    }
  });
});
