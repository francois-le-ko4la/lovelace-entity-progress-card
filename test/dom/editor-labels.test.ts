/*
 * Every field an editor builds says what it is. A label moved between
 * translation groups without its field following leaves an untitled input in
 * every language at once - which is what the attribute picker, and the
 * Feature's entity picker, were left with.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../ha-stubs.js';
import '../../src/index.js';
import '../../src/editor/entry.js';

type FieldEl = HTMLElement & { label?: unknown; _fieldDef?: { name: string; type?: unknown; noLabel?: boolean } };
type EditorEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };

// Built without a label on purpose: a heading carries its own text, and chip
// groups and the action picker show none. _-prefixed ones are editor state.
const LABEL_FREE_TYPES = new Set(['section_label', 'effect_chips', 'hide_chips', 'action_picker']);

const EDITORS: [string, Record<string, unknown>][] = [
  ['entity-progress-card-editor', { type: 'custom:entity-progress-card' }],
  ['entity-progress-card-template-editor', { type: 'custom:entity-progress-card-template' }],
  ['entity-progress-badge-editor', { type: 'custom:entity-progress-badge' }],
  ['entity-progress-badge-template-editor', { type: 'custom:entity-progress-badge-template' }],
  ['entity-progress-feature-editor', { type: 'custom:entity-progress-feature' }],
  ['entity-progress-multi-card-editor', { type: 'custom:entity-progress-multi-card', entities: [TEST_ENTITY] }],
  ['entity-progress-multi-card-row-editor', {}],
  ['entity-progress-multi-feature-row-editor', {}],
];

describe('every editor field has a label', () => {
  for (const [tag, config] of EDITORS) {
    test(tag, async () => {
      const el = document.createElement(tag) as EditorEl;
      el.hass = makeHass();
      el.setConfig?.({ entity: TEST_ENTITY, ...config });
      document.body.appendChild(el);
      await flushFrames();

      const fields = [...(el.shadowRoot as ShadowRoot).querySelectorAll<FieldEl>('*')].filter((node) => {
        const def = node._fieldDef;
        return def && !def.noLabel && !def.name.startsWith('_') && !LABEL_FREE_TYPES.has(String(def.type));
      });
      assert.ok(fields.length > 0, `${tag} built no field to check`);
      const unlabelled = fields
        .filter((node) => !(typeof node.label === 'string' && node.label.trim() !== ''))
        .map((node) => node.id);
      assert.deepEqual(unlabelled, [], `${tag} has fields with no label`);
    });
  }
});
