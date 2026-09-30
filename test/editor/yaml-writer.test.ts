/*
 * The issue report's YAML is pasted into a bug report and read back by Home
 * Assistant's own parser (js-yaml): whatever it prints must load as the very
 * config it came from, however the strings in it are shaped.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { load as loadYaml } from 'js-yaml';

import { toYaml } from '../../src/editor/yaml-writer.js';

const CARD = 'custom:entity-progress-card';

const TRICKY = {
  type: CARD,
  entity: 'sensor.power',
  name: 'on',
  label: 'double  space ',
  unit: '12',
  color: '#ff0000',
  secondary: 'a: b',
  icon: 'mdi:battery-50',
  custom_info: '{{ states(entity) }}',
  percent: '{% if is_state(entity, "on") %}\n  100\n{% endif %}\n',
  name_info: 'first line\nsecond line',
  badge_icon: ' leading space\nsecond line',
  badge_color: 'carriage\r\nreturn',
  decimal: 0,
  frameless: false,
  min_value: -3.5,
  hide: ['icon', 'name'],
  bar_effect: [],
  tap_action: {},
  watermark: { low: { value: 20, color: 'red' }, high: false },
  custom_theme: [
    { min: 0, max: 50, color: 'yes' },
    { min: 50, max: 100, color: 'var(--green-color)' },
  ],
  state_content: [['nested']],
  max_value: null,
};

describe('toYaml - a config, as YAML Home Assistant reads back unchanged', () => {
  test('every string shape round-trips', () => {
    assert.deepEqual(loadYaml(toYaml(TRICKY)), TRICKY);
  });

  test('a multi-line template is a literal block, not an escaped string', () => {
    assert.match(toYaml({ name_info: TRICKY.name_info }), /^name_info: \|-\n {2}first line\n {2}second line$/);
  });

  test('words a single space apart stay unquoted, as Home Assistant writes them', () => {
    assert.equal(
      toYaml({ name: 'Living room', icon: 'mdi:sofa outline' }),
      'name: Living room\nicon: mdi:sofa outline',
    );
  });

  test('an undefined key is left out, as JSON would', () => {
    const config: Record<string, unknown> = { entity: 'sensor.power' };
    config.name = config.missing;
    assert.equal(toYaml(config), 'entity: sensor.power');
  });

  test('notes sit beside their key, the one for the whole card on top', () => {
    const config = { type: CARD, disable_unit: true, entities: [{ entity: 'sensor.a', hide: ['icon'] }] };
    const notes = new Map([
      ['', ['whole card']],
      ['disable_unit', ['deprecated']],
      ['entities.0.hide', ['no effect', 'second note']],
    ]);
    const yaml = toYaml(config, notes);
    assert.equal(
      yaml,
      [
        '# whole card',
        `type: ${CARD}`,
        'disable_unit: true  # deprecated',
        'entities:',
        '  - entity: sensor.a',
        '    hide:  # no effect; second note',
        '      - icon',
      ].join('\n'),
    );
    assert.deepEqual(loadYaml(yaml), config);
  });
});
