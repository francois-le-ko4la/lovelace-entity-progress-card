// Runs in a child process of compare-hass-updates.js, one bundle per process:
// two bundles define the same custom elements, and a registry takes a name once.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

import { flushFrames } from '../../test/dom-setup.js';
import { makeHass } from '../../test/ha-stubs.js';

const CARDS = 20;
const REGISTRY = 3000;
const ITERATIONS = 200;
const WARMUP = 20;
const NOW = new Date().toISOString();

await import(pathToFileURL(process.env.EPB_BENCH_BUNDLE).href);
const tag = ['entity-progress-card', 'entity-progress-card-dev'].find((name) => customElements.get(name));

const stateOf = (entityId, value, attributes = {}) => ({
  entity_id: entityId,
  state: value,
  attributes: { unit_of_measurement: 'W', friendly_name: entityId, ...attributes },
  last_changed: NOW,
  last_updated: NOW,
});

const states = {};
const entities = {};
const devices = {};
const addEntity = (entityId, deviceId, value, attributes) => {
  states[entityId] = stateOf(entityId, value, attributes);
  entities[entityId] = { entity_id: entityId, device_id: deviceId };
  devices[deviceId] = { id: deviceId, name: deviceId };
};
for (let i = 0; i < REGISTRY; i++) addEntity(`sensor.filler_${i}`, `filler_${Math.floor(i / 10)}`, String(i));
const own = Array.from({ length: CARDS }, (_, c) => `sensor.power_${c}`);
own.forEach((entityId, c) => {
  addEntity(entityId, `washer_${c}`, '100');
  // What washing_machine and battery_adaptive look for on the same device.
  addEntity(`${entityId}_status`, `washer_${c}`, 'run', { unit_of_measurement: undefined });
});
// What the local tick moves with no state change: a running timer, a relative time.
const timers = Array.from({ length: CARDS }, (_, c) => `timer.run_${c}`);
for (const entityId of timers) {
  const finishesAt = new Date(Date.now() + 3600000).toISOString();
  states[entityId] = {
    entity_id: entityId,
    state: 'active',
    attributes: { duration: '1:00:00', remaining: '1:00:00', finishes_at: finishesAt, friendly_name: entityId },
  };
}
const recent = Array.from({ length: CARDS }, (_, c) => `sensor.recent_${c}`);
for (const entityId of recent) addEntity(entityId, 'recent', '42');
let hass = makeHass({ states, entities, devices });

const mount = (ids, options) =>
  ids.map((entity) => {
    const card = document.createElement(tag);
    card.setConfig({ type: `custom:${tag}`, entity, max_value: 1000, ...options });
    document.body.appendChild(card);
    card.hass = hass;
    return card;
  });

const push = (cards) => {
  for (const card of cards) card.hass = hass;
};

// What Home Assistant does on a state change: only `states` is replaced.
const advance = (changed, iteration) => {
  const next = { ...hass.states };
  for (const entityId of changed) next[entityId] = stateOf(entityId, String(100 + (iteration % 800)));
  hass = { ...hass, states: next };
};

// Only `act` is timed, each run followed by the frame it queued.
const measure = async (act, prepare = () => {}) => {
  for (let i = 0; i < WARMUP; i++) {
    prepare(i);
    act();
  }
  await flushFrames();
  const times = [];
  for (let i = 0; i < ITERATIONS; i++) {
    prepare(i);
    const started = performance.now();
    act();
    times.push(performance.now() - started);
    await flushFrames();
  }
  // The median, not the mean: a garbage-collection pause lands on one run and
  // would weigh on the whole figure.
  times.sort((x, y) => x - y);
  return (times[Math.floor(ITERATIONS / 2)] / CARDS) * 1000;
};

const CONFIGS = {
  plain: {},
  washing_machine: { icon_animation: 'washing_machine' },
  battery_adaptive: { theme: 'battery_adaptive', icon_animation: 'battery_charging' },
};
const CHANGES = {
  'unrelated entity changed': (i) => [`sensor.filler_${i % REGISTRY}`],
  'own entity changed': () => own,
};

const TICKS = {
  timer: [timers, {}],
  'timer in %': [timers, { unit: '%' }],
  last_changed: [recent, { state_content: ['last_changed'] }],
};

const results = {};
for (const [name, options] of Object.entries(CONFIGS)) {
  document.body.replaceChildren();
  const cards = mount(own, options);
  await flushFrames();
  for (const [change, changedAt] of Object.entries(CHANGES)) {
    results[`${name} · ${change}`] = await measure(
      () => push(cards),
      (i) => advance(changedAt(i), i),
    );
  }
}
for (const [name, [ids, options]] of Object.entries(TICKS)) {
  document.body.replaceChildren();
  const cards = mount(ids, options);
  await flushFrames();
  // Ticked by hand below, not on their own clock as well.
  for (const card of cards) card._stopAutoRefresh();
  results[`${name} · tick`] = await measure(() => {
    for (const card of cards) card._onAutoRefreshTick();
  });
}
fs.writeFileSync(
  process.env.EPB_BENCH_OUT,
  JSON.stringify({ cards: CARDS, registry: REGISTRY, iterations: ITERATIONS, results }),
);
// The cards still mounted keep their own timers armed: without this, the
// process never exits.
process.exit(0);
