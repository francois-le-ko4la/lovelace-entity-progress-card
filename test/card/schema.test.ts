import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { assertUndefined } from '../helpers.js';
import {
  entityOf,
  attributeOf,
  jinjaOf,
  markShown,
  peakMarkShown,
  markType,
  markOpacity,
  markColor,
  markLineSize,
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
    assert.deepEqual(YamlSchemaFactory.badge.fieldOptions('bar_orientation'), ['ltr', 'rtl']);
    assert.deepEqual(YamlSchemaFactory.card.fieldOptions('bar_orientation'), ['ltr', 'rtl', 'up']);
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

// One cascade serves both mark kinds (ViewCore's watermark and peak_marker
// getters call these same helpers). The two differences are pinned here so a
// future "simplification" of either side can't quietly re-fork them.
describe('mark helpers - one cascade for watermark and peak marks alike', () => {
  test('an override wins over the family value, on either mark kind', () => {
    assert.equal(markType({ type: 'round' }, 'line'), 'round');
    assert.equal(markOpacity({ opacity: 0.5 }, 0.8), 0.5);
    assert.equal(markLineSize({ line_size: '4px' }, '2px'), '4px');
    assert.equal(markColor({ color: 'blue' }, 'grey'), 'blue');
  });

  test('a mark carrying nothing of its own inherits the family value', () => {
    for (const mark of [undefined, true, false, {}] as const) {
      assert.equal(markType(mark, 'line'), 'line');
      assert.equal(markOpacity(mark, 0.8), 0.8);
      assert.equal(markLineSize(mark, '2px'), '2px');
      assert.equal(markColor(mark, 'grey'), 'grey');
    }
  });

  test('a threshold-shaped mark is a value, not an override - it inherits everything', () => {
    assert.equal(markType({ entity: 'sensor.x' }, 'line'), 'line');
    assert.equal(markColor({ jinja: '{{ 20 }}' }, 'grey'), 'grey');
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
