import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { entityOf, attributeOf, jinjaOf, YamlSchemaFactory } from '../../src/card/schema.js';

describe('entityOf/attributeOf/jinjaOf', () => {
  test('read their own sub-field off an {entity, attribute} object', () => {
    const cfg = { entity: 'sensor.battery', attribute: 'level' };
    assert.equal(entityOf(cfg), 'sensor.battery');
    assert.equal(attributeOf(cfg), 'level');
    assert.equal(jinjaOf(cfg), undefined);
  });

  test('read their own sub-field off a {jinja} object', () => {
    const cfg = { jinja: '{{ 42 }}' };
    assert.equal(entityOf(cfg), undefined);
    assert.equal(attributeOf(cfg), undefined);
    assert.equal(jinjaOf(cfg), '{{ 42 }}');
  });

  test('return undefined for a plain number (fixed value, not entity/jinja)', () => {
    assert.equal(entityOf(42), undefined);
    assert.equal(attributeOf(42), undefined);
    assert.equal(jinjaOf(42), undefined);
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
