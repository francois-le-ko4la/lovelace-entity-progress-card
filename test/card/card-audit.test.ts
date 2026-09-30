import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { auditDashboard, notesByPath } from '../../src/card/card-audit.js';

const CARD = 'custom:entity-progress-card';
const MULTI_CARD = 'custom:entity-progress-multi-card';
const TEXT_SHADOW = 'no effect: text_shadow';
const NO_EFFECT = 'no effect';

// A dashboard as Home Assistant hands it over: views, stacks, sections, tiles.
const DASHBOARD = {
  views: [
    {
      title: 'Home',
      cards: [
        { type: CARD, entity: 'sensor.clean' },
        // No layout written: horizontal by default, where compact_below works.
        { type: CARD, entity: 'sensor.compact', bar_position: 'compact_below' },
        {
          type: 'vertical-stack',
          cards: [{ type: CARD, entity: 'sensor.stacked', disable_unit: true, text_shadow: true }],
        },
      ],
    },
    {
      path: 'garage',
      sections: [
        {
          cards: [
            {
              type: 'tile',
              entity: 'sensor.tile',
              features: [{ type: 'custom:entity-progress-feature', entity: 'sensor.tile', bar_single_line: true }],
            },
            {
              type: MULTI_CARD,
              value_position: 'right',
              entities: ['sensor.first', { entity: 'sensor.second', text_shadow: true }],
            },
          ],
        },
      ],
    },
    {
      title: '',
      cards: [{ type: CARD, entity: 'sensor.untitled', text_shadow: true }],
    },
  ],
};

describe('auditDashboard - what a card carries without needing it, wherever it sits', () => {
  const findings = auditDashboard(DASHBOARD, 'Energy');
  const at = (where: string) => findings.find((finding) => finding.where === where)?.notes;

  test('a clean card is not listed, compact_below without a layout included', () => {
    for (const entity of ['sensor.clean', 'sensor.compact']) {
      assert.equal(
        findings.some((finding) => finding.where.includes(entity)),
        false,
        entity,
      );
    }
  });

  test('a view with an empty title goes by its position', () => {
    assert.deepEqual(at('Energy › view 3 › entity-progress-card (sensor.untitled)'), [TEXT_SHADOW]);
  });

  test('a card inside a stack: its deprecated options and those without effect', () => {
    assert.deepEqual(at('Energy › Home › entity-progress-card (sensor.stacked)'), [
      'deprecated: disable_unit',
      TEXT_SHADOW,
    ]);
  });

  test('a tile feature in a section, found under its view path', () => {
    assert.deepEqual(at('Energy › garage › entity-progress-feature (sensor.tile)'), ['no effect: bar_single_line']);
  });

  test('a Multi: its deprecated options, each row judged whole, and its rows new look', () => {
    const notes = at('Energy › garage › entity-progress-multi-card (sensor.first +1)') ?? [];
    assert.equal(notes[0], 'deprecated: value_position');
    assert.equal(notes[1], `row 2, ${TEXT_SHADOW}`);
    assert.match(notes[2] ?? '', /hide: \[icon, name, secondary_info\]/);
  });
});

describe('notesByPath - each note at the key it is about, for the issue report YAML', () => {
  test('a card: its own keys', () => {
    const notes = notesByPath({ type: CARD, entity: 'sensor.x', disable_unit: true, text_shadow: true });
    assert.deepEqual(Object.fromEntries(notes), { disable_unit: ['deprecated'], text_shadow: [NO_EFFECT] });
  });

  test('a Multi: a row sets it, or the shared level holds it for the rows it reaches', () => {
    const notes = notesByPath({
      type: MULTI_CARD,
      text_shadow: true,
      entities: [
        { entity: 'sensor.a', show_value: false },
        'sensor.b',
        { entity: 'sensor.c', bar_position: 'overlay' },
      ],
    });
    assert.deepEqual(Object.fromEntries(notes), {
      'entities.0.show_value': ['deprecated'],
      text_shadow: ['no effect on row 1, 2'],
    });
  });

  test('bar_size where the position sets the thickness: the one the editor parks too', () => {
    const notes = notesByPath({ type: CARD, entity: 'sensor.x', bar_position: 'overlay', bar_size: 'xlarge' });
    assert.deepEqual(Object.fromEntries(notes), { bar_size: [NO_EFFECT] });
  });

  test('a Multi on its default look: the note sits on the card itself', () => {
    const notes = notesByPath({ type: MULTI_CARD, entities: ['sensor.a'] });
    assert.match(notes.get('')?.[0] ?? '', /since 1\.6\.3/);
  });
});
