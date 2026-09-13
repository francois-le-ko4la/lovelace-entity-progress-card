/*
 * The hide targets live in four tables that each say something different about
 * them - the allowed values, the CSS class per component, the editor fields
 * each one retires, and the chip order. Three are Records typed off
 * HIDE_TARGETS, so an omission is a compile error. The fourth is an ordered
 * tuple, which can only state what its members are, never that none is
 * missing - that is what this asserts, per variant.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { EditorFactory } from '../../src/editor/factory.js';
import { schemaOptions, type SchemaVariant } from '../../src/card/schema.js';

const VARIANTS: SchemaVariant[] = ['card', 'badge', 'template', 'badgeTemplate', 'feature'];

describe('the hide chips offer exactly what the schema allows', () => {
  for (const variant of VARIANTS) {
    test(`${variant}: every allowed target gets a chip`, () => {
      const chips = EditorFactory.hideChipsItems(variant);
      assert.deepEqual(new Set(chips), new Set(schemaOptions(variant, 'hide')));
    });
  }

  test('a card can hide all seven of them', () => {
    assert.equal(EditorFactory.hideChipsItems('card').length, 7);
  });
});
