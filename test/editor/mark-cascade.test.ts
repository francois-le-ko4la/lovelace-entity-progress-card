/*
 * A family value moves with its majority, and never changes what a mark is
 * drawn in - the band included. And the editor offers each mark exactly the
 * fields the card reads, both going by the one table (MARK_FIELDS).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { EditorFactory } from '../../src/editor/factory.js';
import { MARK_FIELDS } from '../../src/card/schema.js';
import { assertUndefined } from '../helpers.js';
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

type Field = { onVirtualChange?: (value: unknown, config: LovelaceConfig) => LovelaceConfig };

// The field built under `name`, wherever in the form it sits.
const fieldNamed = (tree: unknown, name: string): Field | null => {
  if (!tree || typeof tree !== 'object') return null;
  const node = tree as Record<string, unknown>;
  if (name in node && typeof node[name] === 'object') return node[name] as Field;
  for (const child of Object.values(node)) {
    const found = fieldNamed(child, name);
    if (found) return found;
  }
  return null;
};

const FORM = EditorFactory.build({ template: false, badge: false });

const setColor = (config: LovelaceConfig, mark: string, color: string) => {
  const field = fieldNamed(FORM, `peak_marker.${mark}_color`);
  assert.ok(field?.onVirtualChange, `no colour field for ${mark}`);
  return field.onVirtualChange(color, config);
};

const START = {
  type: 'custom:entity-progress-card',
  entity: TEST_ENTITY,
  peak_marker: { min: true, max: true, average: true, range: true, color: 'red' },
} as unknown as LovelaceConfig;

const peakOf = (config: LovelaceConfig) => config.peak_marker as Record<string, unknown>;
const rangeColor = (config: LovelaceConfig) => {
  const range = peakOf(config).range as string | Record<string, unknown>;
  return typeof range === 'string' ? range : range.color;
};

describe('a family value the band still reads', () => {
  test('no majority left: it goes, and the band writes down the one it used', () => {
    let config = START;
    for (const [mark, color] of [
      ['min', 'blue'],
      ['max', 'green'],
      ['average', 'yellow'],
    ])
      config = setColor(config, mark, color);
    assertUndefined(peakOf(config).color, 'no two marks agree, the family colour should go');
    assert.equal(rangeColor(config), 'red', 'the band lost the colour it was drawn in');
  });

  test('a new majority: it becomes the rule, the band keeps the old one as its own', () => {
    let config = START;
    for (const mark of ['min', 'max', 'average']) config = setColor(config, mark, 'blue');
    assert.equal(peakOf(config).color, 'blue', 'three marks agree, their colour should move up');
    assert.equal(rangeColor(config), 'red', 'the band was repainted in the marks colour');
  });
});

// The card resolves marks by MARK_FIELDS; the editor must offer exactly that.
describe('the editor offers each mark the fields the card reads', () => {
  for (const [family, marks] of Object.entries(MARK_FIELDS))
    for (const [mark, rules] of Object.entries(marks))
      test(`${family}.${mark}`, () => {
        for (const field of ['type', 'line_size', 'opacity', 'color', 'as'])
          assert.equal(
            fieldNamed(FORM, `${family}.${mark}_${field}`) !== null,
            field in rules,
            `${family}.${mark}_${field}: editor and card disagree`,
          );
      });
});
