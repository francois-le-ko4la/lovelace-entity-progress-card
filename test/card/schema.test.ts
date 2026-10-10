import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { assertUndefined } from '../helpers.js';
import {
  entityOf,
  attributeOf,
  jinjaOf,
  markShown,
  peakMarkShown,
  MARK_FACTORIZATION,
  type PeakMark,
  YamlSchemaFactory,
} from '../../src/card/schema.js';

describe('entityOf/attributeOf/jinjaOf', () => {
  test('read their own sub-field off an {entity, attribute} object', () => {
    const cfg = { entity: 'sensor.battery', attribute: 'level' };
    assert.equal(entityOf(cfg), 'sensor.battery');
    assert.equal(attributeOf(cfg), 'level');
    assertUndefined(jinjaOf(cfg));
  });

  test('read their own sub-field off a {jinja} object', () => {
    const cfg = { jinja: '{{ 42 }}' };
    assertUndefined(entityOf(cfg));
    assertUndefined(attributeOf(cfg));
    assert.equal(jinjaOf(cfg), '{{ 42 }}');
  });

  test('return undefined for a plain number (fixed value, not entity/jinja)', () => {
    assertUndefined(entityOf(42));
    assertUndefined(attributeOf(42));
    assertUndefined(jinjaOf(42));
  });
});

describe('config negotiation - an invalid value degrades to its default, never rejected', () => {
  test('an invalid bar_orientation falls back to ltr but keeps the config valid', () => {
    const result = YamlSchemaFactory.card.validate({ entity: 'sensor.test', bar_orientation: 'up' });
    assert.equal(result.isValid, true);
    assert.equal((result.config as { bar_orientation?: string })?.bar_orientation, 'ltr');
  });
});

describe('bar_orientation speaks the words of its bar_position', () => {
  const orientationOf = (config: Record<string, unknown>) =>
    (YamlSchemaFactory.card.validate({ entity: 'sensor.test', ...config }).config as { bar_orientation?: string })
      ?.bar_orientation;

  test('a ring turns ltr/rtl and the default into clockwise/counterclockwise', () => {
    assert.equal(orientationOf({ bar_position: 'icon' }), 'clockwise');
    assert.equal(orientationOf({ bar_position: 'icon', bar_orientation: 'rtl' }), 'counterclockwise');
  });

  test('a straight bar turns clockwise/counterclockwise back into ltr/rtl', () => {
    assert.equal(orientationOf({ bar_orientation: 'clockwise' }), 'ltr');
    assert.equal(orientationOf({ bar_orientation: 'counterclockwise' }), 'rtl');
  });

  test('up has no effect on a ring and leaves it clockwise', () => {
    assert.equal(orientationOf({ bar_position: 'icon', bar_orientation: 'up' }), 'clockwise');
  });
});

describe('YamlSchemaFactory.<type>.fieldDefault - real schema defaults, not a hand-copied table', () => {
  test('bar_orientation defaults to ltr on every type that has it', () => {
    assert.equal(YamlSchemaFactory.card.fieldDefault('bar_orientation'), 'ltr');
    assert.equal(YamlSchemaFactory.badge.fieldDefault('bar_orientation'), 'ltr');
    assert.equal(YamlSchemaFactory.feature.fieldDefault('bar_orientation'), 'ltr');
  });

  test('reverse defaults to false on Card', () => {
    assert.equal(YamlSchemaFactory.card.fieldDefault('reverse'), false);
  });

  test('bar_size genuinely diverges by type - Feature is xlarge, everything else is small', () => {
    assert.equal(YamlSchemaFactory.feature.fieldDefault('bar_size'), 'xlarge');
    assert.equal(YamlSchemaFactory.card.fieldDefault('bar_size'), 'small');
    assert.equal(YamlSchemaFactory.badge.fieldDefault('bar_size'), 'small');
  });

  test('watermark sub-defaults come from the nested object, not a flat value', () => {
    const watermark = YamlSchemaFactory.card.fieldDefault('watermark') as { low: number; high: number };
    assert.equal(watermark.low, 20);
    assert.equal(watermark.high, 80);
  });
});

describe('YamlSchemaFactory.<type>.fieldOptions - allowed values read off the live validator', () => {
  test('the per-variant restriction is the schema itself, not a parallel list', () => {
    assert.deepEqual(YamlSchemaFactory.badge.fieldOptions('bar_orientation'), [
      'ltr',
      'rtl',
      'clockwise',
      'counterclockwise',
    ]);
    assert.deepEqual(YamlSchemaFactory.card.fieldOptions('bar_orientation'), [
      'ltr',
      'rtl',
      'up',
      'down',
      'clockwise',
      'counterclockwise',
    ]);
    assert.deepEqual(YamlSchemaFactory.feature.fieldOptions('bar_orientation'), ['ltr', 'rtl']);
    assert.deepEqual(YamlSchemaFactory.feature.fieldOptions('bar_position'), ['default', 'top', 'bottom']);
    assert.equal(YamlSchemaFactory.badge.fieldOptions('bar_size')?.includes('xlarge'), false);
    assert.equal(YamlSchemaFactory.card.fieldOptions('bar_size')?.includes('xlarge'), true);
  });

  test('reaches through optional() and fallbackTo() to the enum underneath', () => {
    // unit_spacing is enumsWithDefault (fallbackTo), watermark.type is
    // optional(enums).
    assert.deepEqual(YamlSchemaFactory.card.fieldOptions('unit_spacing'), ['auto', 'space', 'no-space']);
    assert.deepEqual(YamlSchemaFactory.badge.fieldOptions('layout'), ['horizontal']);
  });

  test('hide carries its own per-variant target list', () => {
    assert.deepEqual(YamlSchemaFactory.card.fieldOptions('hide'), [
      'icon',
      'name',
      'value',
      'unit',
      'secondary_info',
      'progress_bar',
      'shape',
    ]);
    assert.equal(YamlSchemaFactory.badgeTemplate.fieldOptions('hide')?.includes('unit'), false);
  });

  test('a field with no enumerable values has none', () => {
    assertUndefined(YamlSchemaFactory.card.fieldOptions('entity'));
    assertUndefined(YamlSchemaFactory.card.fieldOptions('decimal'));
  });
});

describe('YamlSchemaFactory.card.validate - end-to-end shape', () => {
  test('accepts a minimal config with just an entity', () => {
    const result = YamlSchemaFactory.card.validate({ entity: 'sensor.test' });
    assert.equal(result.isValid, true);
  });

  test('rejects a config missing the required entity', () => {
    const result = YamlSchemaFactory.card.validate({});
    assert.equal(result.isValid, false);
  });
});

// One resolver serves every mark (MARK_FACTORIZATION): the card's watermark and
// peak_marker getters both go through it. The differences between marks are
// the table's, pinned here so neither side can quietly re-fork.
describe('MARK_FACTORIZATION.resolve - one cascade for every mark', () => {
  const FAMILY = { type: 'line', opacity: 0.8, line_size: '2px', color: 'grey', as: 'percent' };

  test('an override wins over the family value, on either mark kind', () => {
    const watermark = { ...FAMILY, low: { type: 'round', opacity: 0.5, line_size: '4px', color: 'blue', as: 'auto' } };
    for (const [field, own] of [
      ['type', 'round'],
      ['opacity', 0.5],
      ['line_size', '4px'],
      ['color', 'blue'],
      ['as', 'auto'],
    ] as const)
      assert.equal(MARK_FACTORIZATION.watermark.resolve({ watermark }, 'low', field), own);
    assert.equal(
      MARK_FACTORIZATION.peak_marker.resolve({ peak_marker: { ...FAMILY, min: 'red' } }, 'min', 'color'),
      'red',
      'a bare string is a color',
    );
  });

  test('a mark carrying nothing of its own inherits the family value', () => {
    for (const mark of [true, false, {}, 20, { entity: 'sensor.x' }, { jinja: '{{ 20 }}' }]) {
      const watermark = { ...FAMILY, low: mark };
      for (const field of ['type', 'opacity', 'line_size', 'color', 'as'] as const)
        assert.equal(
          MARK_FACTORIZATION.watermark.resolve({ watermark }, 'low', field),
          FAMILY[field],
          `${field} of ${JSON.stringify(mark)}`,
        );
    }
  });

  test('the band keeps its own type, and has no line or scale to inherit', () => {
    const peak = { ...FAMILY, range: true };
    assertUndefined(MARK_FACTORIZATION.peak_marker.resolve({ peak_marker: peak }, 'range', 'type'));
    assertUndefined(MARK_FACTORIZATION.peak_marker.resolve({ peak_marker: peak }, 'range', 'line_size'));
    assert.equal(MARK_FACTORIZATION.peak_marker.resolve({ peak_marker: peak }, 'range', 'color'), 'grey');
  });

  test('only a watermark has a scale to read its threshold on', () => {
    assertUndefined(MARK_FACTORIZATION.peak_marker.resolve({ peak_marker: { ...FAMILY, min: true } }, 'min', 'as'));
  });

  test('a watermark side exists unless turned off; a peak mark only once set', () => {
    // Read off an object rather than written as a literal: this is what an
    // unset peak_marker.min actually hands the helper.
    const unset = ({} as { min?: PeakMark }).min;
    // The schema always fills a watermark side, so markShown never sees
    // undefined in production - the cast states that, and pins the contrast.
    assert.equal(markShown(undefined as unknown as boolean), true);
    assert.equal(markShown(false), false);
    assert.equal(peakMarkShown(unset), false);
    assert.equal(peakMarkShown(false), false);
    assert.equal(peakMarkShown(true), true);
    assert.equal(peakMarkShown({}), true);
    assert.equal(peakMarkShown('red'), true);
  });
});
