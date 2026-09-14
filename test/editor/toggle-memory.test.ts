/*
 * Turning a feature off in the editor must not cost the user what they had
 * configured in it. Every toggle here parks the value it hides in an
 * ephemeral `_`-prefixed draft and hands it back on the way in - see
 * markToggleField / enabledToggleField / draftToggle in factory.ts.
 *
 * The toggles are collected from the built field tree rather than listed, so
 * a new one is covered the day it is written. A_USER_SETTING is the one thing
 * this file cannot derive: what a real setting looks like under each key. A
 * toggle owning a key absent from that table fails the last test rather than
 * being skipped in silence.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { EditorFactory } from '../../src/editor/factory.js';
import { HassProviderSingleton } from '../../src/utils/hass-provider.js';
import type { LovelaceConfig } from '../../src/utils/types.js';

const TEST_ENTITY = 'sensor.x';

HassProviderSingleton.getInstance().hass = {
  states: { [TEST_ENTITY]: { entity_id: TEST_ENTITY, state: '42', attributes: {} } },
  locale: { language: 'en', number_format: 'comma_decimal' },
  config: { unit_system: { temperature: '°C' } },
  entities: {},
  devices: {},
  areas: {},
  floors: {},
} as never;

// What a user would have set under each key a toggle owns - merged into the
// object form, or written as-is where the key holds a scalar.
const A_USER_SETTING: Record<string, unknown> = {
  center_zero: { value: 25 },
  watermark: { line_size: '9px' },
  peak_marker: { line_size: '9px' },
  trend_indicator: { threshold: 3 },
  status_label: { position: 'left' },
  alert_when: { above: 80 },
  bar_max_width: '250px',
  badge_icon: 'mdi:alert',
  badge_color: 'red',
  height: '120px',
};

type Field = {
  type: string | ((c: LovelaceConfig) => string);
  onVirtualChange?: (value: unknown, config: LovelaceConfig) => LovelaceConfig;
  resolveVirtual?: (config: LovelaceConfig) => unknown;
};

const BASE = { type: 'custom:entity-progress-card', entity: TEST_ENTITY } as unknown as LovelaceConfig;

const typeOf = (field: Field) => (typeof field.type === 'function' ? field.type(BASE) : field.type);
const on = (field: Field) => (typeOf(field) === 'enabled_toggle' ? 'enabled' : true);
const off = (field: Field) => (typeOf(field) === 'enabled_toggle' ? 'disabled' : false);

const toggles = (): [string, Field][] => {
  const found: [string, Field][] = [];
  const tree = EditorFactory.build({ template: false, badge: false }) as unknown as Record<
    string,
    { fields?: Record<string, Field> }
  >;
  for (const section of Object.values(tree))
    for (const [name, field] of Object.entries(section.fields ?? {})) {
      const kind = typeOf(field);
      if (field.onVirtualChange && (kind === 'toggle' || kind === 'enabled_toggle')) found.push([name, field]);
    }
  return found;
};

// The `_`-prefixed drafts are editor state, stripped before the config is
// saved - what the YAML would hold is everything else.
const saved = (config: LovelaceConfig) =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(config)
        .filter(([key, value]) => !key.startsWith('_') && value !== undefined)
        .sort(),
    ),
  );

// Away from wherever the toggle currently sits, then back to it -
// `height_custom_toggle` reads off on a plain length, on for every other one.
const roundTrip = (field: Field, config: LovelaceConfig) => {
  const here = field.resolveVirtual!(config) ? on(field) : off(field);
  const there = here === on(field) ? off(field) : on(field);
  return field.onVirtualChange!(here, field.onVirtualChange!(there, config));
};

// The key a toggle writes to: what it changed against a config with the
// feature untouched.
const ownedKey = (field: Field, turnedOn: LovelaceConfig) =>
  Object.keys(turnedOn).find(
    (key) =>
      !key.startsWith('_') &&
      JSON.stringify(turnedOn[key]) !== JSON.stringify((BASE as Record<string, unknown>)[key]),
  );

describe('the editor gives back what a toggle put away', () => {
  test('the field tree still has toggles to check', () => {
    assert.ok(toggles().length >= 15, `only ${toggles().length} toggles collected`);
  });

  for (const [name, field] of toggles()) {
    test(`${name}: flipping away and back leaves the config as it was`, () => {
      const turnedOn = field.onVirtualChange!(on(field), BASE);
      assert.equal(saved(roundTrip(field, turnedOn)), saved(turnedOn));
    });
  }

  for (const [name, field] of toggles()) {
    const turnedOn = field.onVirtualChange!(on(field), BASE);
    const key = ownedKey(field, turnedOn);
    const setting = key ? A_USER_SETTING[key] : undefined;
    const held = turnedOn[key ?? ''];
    // A boolean shorthand has nowhere to carry a setting - the test above
    // already covers it.
    if (!key || setting === undefined || typeof held === 'boolean') continue;

    test(`${name}: a setting under \`${key}\` survives the round trip`, () => {
      const configured = {
        ...turnedOn,
        [key]: typeof held === 'object' ? { ...(held as object), ...(setting as object) } : setting,
      };
      assert.deepEqual(roundTrip(field, configured)[key], configured[key]);
    });
  }

  test('every toggle that owns a settable key is covered by A_USER_SETTING', () => {
    const missing = new Set<string>();
    for (const [, field] of toggles()) {
      const turnedOn = field.onVirtualChange!(on(field), BASE);
      const key = ownedKey(field, turnedOn);
      if (!key || typeof turnedOn[key] === 'boolean') continue;
      if (A_USER_SETTING[key] === undefined) missing.add(key);
    }
    assert.deepEqual([...missing], [], 'add what a user would set under these keys');
  });
});
