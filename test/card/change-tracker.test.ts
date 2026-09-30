import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ChangeTracker } from '../../src/card/change-tracker.js';
import type { HomeAssistant } from '../../src/utils/hass-provider.js';

const CARD_ENTITY = 'sensor.washer_progress';
const STATUS_ENTITY = 'sensor.washer_status';
const OTHER_ENTITY = 'sensor.outdoor_temperature';
const MISSING_ENTITY = 'sensor.removed';
const WASHER_DEVICE = 'washer';

type Registry = Record<string, { device_id?: string; area_id?: string; display_precision?: number }>;

const stateOf = (entityId: string, state: string) => ({ entity_id: entityId, state, attributes: {} });

const makeHass = (states: Record<string, unknown>, entities: Registry) =>
  ({ states, entities }) as unknown as HomeAssistant;

// What Home Assistant does on every state change: a new hass and a new states
// object, in which only the entity that changed gets a new state object.
const withState = (hass: HomeAssistant, entityId: string, state: string) =>
  ({ ...hass, states: { ...hass.states, [entityId]: stateOf(entityId, state) } }) as unknown as HomeAssistant;

const trackerOn = (hass: HomeAssistant, watched: string[], sameDeviceOf: string[] = []) => {
  const tracker = new ChangeTracker();
  for (const entityId of watched) tracker.watchEntity(entityId);
  for (const entityId of sameDeviceOf) tracker.watchSameDevice(entityId);
  tracker.hassState = hass; // a first hass always counts as a change
  return tracker;
};

const REGISTRY: Registry = {
  [CARD_ENTITY]: { device_id: WASHER_DEVICE },
  [STATUS_ENTITY]: { device_id: WASHER_DEVICE },
  [OTHER_ENTITY]: {},
};
const INITIAL = makeHass(
  {
    [CARD_ENTITY]: stateOf(CARD_ENTITY, '10'),
    [STATUS_ENTITY]: stateOf(STATUS_ENTITY, 'stop'),
    [OTHER_ENTITY]: stateOf(OTHER_ENTITY, '20'),
  },
  REGISTRY,
);

describe('ChangeTracker - what counts as a change', () => {
  // The regression: the precision cache held `null` where the registry reads
  // `undefined`, so every card on an entity without one refreshed on every
  // state change of the whole install.
  test('an unrelated entity changing is not a change, without a display_precision', () => {
    const tracker = trackerOn(INITIAL, [CARD_ENTITY]);
    tracker.hassState = withState(INITIAL, OTHER_ENTITY, '21');
    assert.equal(tracker.isUpdated, false);
  });

  test('the watched entity changing is a change', () => {
    const tracker = trackerOn(INITIAL, [CARD_ENTITY]);
    tracker.hassState = withState(INITIAL, CARD_ENTITY, '11');
    assert.equal(tracker.isUpdated, true);
  });

  test('a display_precision set in the registry is a change', () => {
    const tracker = trackerOn(INITIAL, [CARD_ENTITY]);
    const withPrecision = { ...REGISTRY, [CARD_ENTITY]: { device_id: WASHER_DEVICE, display_precision: 2 } };
    tracker.hassState = makeHass(INITIAL.states, withPrecision);
    assert.equal(tracker.isUpdated, true);
  });

  test('the watched entity moved to another area is a change', () => {
    const tracker = trackerOn(INITIAL, [CARD_ENTITY]);
    const moved = { ...REGISTRY, [CARD_ENTITY]: { device_id: WASHER_DEVICE, area_id: 'laundry' } };
    tracker.hassState = makeHass(INITIAL.states, moved);
    assert.equal(tracker.isUpdated, true);
  });

  test('a registry edit on an unrelated entity is not a change', () => {
    const tracker = trackerOn(INITIAL, [CARD_ENTITY]);
    const edited = { ...REGISTRY, [OTHER_ENTITY]: { area_id: 'garden' } };
    tracker.hassState = makeHass(INITIAL.states, edited);
    assert.equal(tracker.isUpdated, false);
  });

  test('a missing entity is one change when it goes, not one per update after', () => {
    const tracker = trackerOn(INITIAL, [MISSING_ENTITY]);
    tracker.hassState = withState(INITIAL, OTHER_ENTITY, '21');
    assert.equal(tracker.isUpdated, false);
  });
});

describe('ChangeTracker - what hass carries besides states', () => {
  const FRENCH = 'fr';
  const formatter = () => '';
  const context = {
    language: FRENCH,
    locale: { language: FRENCH },
    localize: formatter,
    formatEntityState: formatter,
    formatEntityAttributeValue: formatter,
    devices: {},
    areas: {},
    floors: {},
    config: { unit_system: { temperature: '°C' } },
  };
  const withContext = (overrides: Record<string, unknown>) =>
    ({ ...INITIAL, ...context, ...overrides }) as unknown as HomeAssistant;

  test('the same language, format and registries on a new hass are not a change', () => {
    const tracker = trackerOn(withContext({}), [CARD_ENTITY]);
    tracker.hassState = withState(withContext({}), OTHER_ENTITY, '21');
    assert.equal(tracker.isUpdated, false);
  });

  test('a language change is a change', () => {
    const tracker = trackerOn(withContext({}), [CARD_ENTITY]);
    tracker.hassState = withContext({ language: 'de' });
    assert.equal(tracker.isUpdated, true);
  });

  test("Home Assistant's formatters, swapped once its translations load, are a change", () => {
    const tracker = trackerOn(withContext({}), [CARD_ENTITY]);
    tracker.hassState = withContext({ formatEntityState: () => 'Indisponible' });
    assert.equal(tracker.isUpdated, true);
  });

  test('a new core config - the unit system a climate reads - is a change', () => {
    const tracker = trackerOn(withContext({}), [CARD_ENTITY]);
    tracker.hassState = withContext({ config: { unit_system: { temperature: '°F' } } });
    assert.equal(tracker.isUpdated, true);
  });

  test('a replaced device registry is a change', () => {
    const tracker = trackerOn(withContext({}), [CARD_ENTITY]);
    tracker.hassState = withContext({ devices: { washer: { name_by_user: 'Lave-linge' } } });
    assert.equal(tracker.isUpdated, true);
  });
});

describe('ChangeTracker - entities on the card own device', () => {
  test('a status entity on the same device is ignored by default', () => {
    const tracker = trackerOn(INITIAL, [CARD_ENTITY]);
    tracker.hassState = withState(INITIAL, STATUS_ENTITY, 'run');
    assert.equal(tracker.isUpdated, false);
  });

  test('watchSameDevice makes that status entity a change', () => {
    const tracker = trackerOn(INITIAL, [CARD_ENTITY], [CARD_ENTITY]);
    tracker.hassState = withState(INITIAL, STATUS_ENTITY, 'run');
    assert.equal(tracker.isUpdated, true);
  });

  test('watchSameDevice still ignores entities of other devices', () => {
    const tracker = trackerOn(INITIAL, [CARD_ENTITY], [CARD_ENTITY]);
    tracker.hassState = withState(INITIAL, OTHER_ENTITY, '21');
    assert.equal(tracker.isUpdated, false);
  });

  test('resetWatchedEntities drops the same-device watch too', () => {
    const tracker = trackerOn(INITIAL, [CARD_ENTITY], [CARD_ENTITY]);
    tracker.resetWatchedEntities();
    tracker.watchEntity(CARD_ENTITY);
    tracker.hassState = withState(INITIAL, STATUS_ENTITY, 'run');
    assert.equal(tracker.isUpdated, false);
  });
});
