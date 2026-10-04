/*
 * The editor splits a duration or a length into a number and a unit for its
 * slider, and puts it back together on change. Each pair has to be the other's
 * inverse, or editing a value the user never touched rewrites it.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { parseDuration, serializeDuration } from '../../src/utils/duration.js';
import { parseLength, serializeLength } from '../../src/utils/length.js';
import { YamlSchemaFactory } from '../../src/card/schema.js';
import { assertUndefined } from '../helpers.js';

const DURATION_UNITS = ['s', 'min', 'h', 'd'];
const LENGTH_UNITS = ['px', 'em', 'rem', '%'];

describe('a duration survives the slider', () => {
  test('number and unit back to the same string', () => {
    for (const unit of DURATION_UNITS)
      for (const value of [1, 2, 10, 90]) {
        const written = serializeDuration(value, unit);
        assert.equal(written, `${value}${unit}`);
        assert.deepEqual(parseDuration(written), { value, unit });
      }
  });

  test('whatever the editor writes, the schema reads', () => {
    for (const unit of DURATION_UNITS) {
      const window = serializeDuration(3, unit);
      const parsed = YamlSchemaFactory.card.parse({
        type: 'custom:entity-progress-card',
        entity: 'sensor.x',
        peak_marker: { window },
      }) as { config: { peak_marker?: { window?: number } } | null };
      assert.ok(parsed.config?.peak_marker?.window, `the schema dropped peak_marker.window: ${window}`);
    }
  });
});

describe('a length survives the slider', () => {
  test('number and unit back to the same string', () => {
    for (const unit of LENGTH_UNITS)
      for (const value of [1, 12.5, 120]) {
        const written = serializeLength(value, unit);
        assert.equal(written, `${value}${unit}`);
        assert.deepEqual(parseLength(written), { custom: false, value, unit });
      }
  });

  test('0px is unset, and unset reads back as 0px', () => {
    assertUndefined(serializeLength(0, 'px'));
    assert.deepEqual(parseLength(serializeLength(0, 'px')), { custom: false, value: 0, unit: 'px' });
  });

  test('a value the slider cannot hold is kept whole', () => {
    for (const raw of ['calc(100% - 10px)', 'auto', '10vw']) assert.deepEqual(parseLength(raw), { custom: true, raw });
  });
});
