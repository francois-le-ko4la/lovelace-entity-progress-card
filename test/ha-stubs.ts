/*
 * Minimal stand-ins for the custom elements Home Assistant provides to a card
 * at runtime. They are NOT stubs of the code under test - they replace the
 * host, exactly as HA would, so the card's own logic runs for real.
 *
 * Only the surface the card actually reaches for is implemented: <action-
 * handler>'s bind(), and enough of a shape for the rest to be appended and
 * queried like any element.
 */

// Imported for its side effect and always after dom-setup.js, which is what
// puts customElements/HTMLElement on globalThis in the first place.
import './dom-setup.js';

const PASSIVE_TAGS = [
  'ha-card',
  'ha-alert',
  'ha-button',
  'ha-icon',
  'ha-state-icon',
  'ha-svg-icon',
  'ha-ripple',
  'ha-selector',
  'ha-expansion-panel',
];

const installHaStubs = () => {
  for (const tag of PASSIVE_TAGS) {
    if (customElements.get(tag)) continue;
    customElements.define(tag, class extends HTMLElement {});
  }

  if (!customElements.get('action-handler')) {
    customElements.define(
      'action-handler',
      // HA's own action-handler exposes bind(target, options) and then
      // dispatches `action` events on that target - the card only ever calls
      // bind, and listens for the events itself.
      class extends HTMLElement {
        // eslint-disable-next-line class-methods-use-this -- HA's own API shape
        bind() {
          /* no-op: gesture detection is HA's, not this card's */
        }
      },
    );
  }
};

installHaStubs();

export { installHaStubs, PASSIVE_TAGS };

// A hass object with just what a card reaches for on mount. `connection` is a
// real EventTarget: HABase._watchWebSocket subscribes to its
// 'disconnected'/'ready' events (see core.ts).
// The one entity makeHass() defines. Tests mount against it by name, so it
// belongs next to the fixture rather than being retyped in each file.
const TEST_ENTITY = 'sensor.battery';

const makeHass = (overrides: Record<string, unknown> = {}) => {
  const connection = new EventTarget() as EventTarget & {
    subscribeMessage?: (...args: unknown[]) => Promise<() => void>;
  };
  // What HA hands back from subscribeMessage: the caller keeps it to drop the
  // subscription. Nothing to undo here, but it has to be callable.
  const unsubscribe = () => {
    /* no subscription to tear down in a stub */
  };
  // Promise.resolve, not async: there is nothing to await, and `async` would
  // only claim otherwise.
  connection.subscribeMessage = () => Promise.resolve(unsubscribe);

  return {
    states: {
      [TEST_ENTITY]: {
        entity_id: TEST_ENTITY,
        state: '42',
        attributes: { unit_of_measurement: '%', friendly_name: 'Battery', device_class: 'battery' },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      },
    },
    entities: {},
    devices: {},
    areas: {},
    config: { version: '2026.9.0' },
    locale: { language: 'en', number_format: 'language' },
    themes: { darkMode: false, theme: 'default' },
    language: 'en',
    localize: (key: string) => key,
    callWS: () => Promise.resolve([]),
    callService: () => Promise.resolve(undefined),
    connection,
    ...overrides,
  } as unknown as Record<string, unknown>;
};

export { makeHass, TEST_ENTITY };
