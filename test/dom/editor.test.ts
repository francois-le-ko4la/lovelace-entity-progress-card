/*
 * The editors, which the pure-logic suite cannot reach at all: each one is
 * asked for by its own card (getConfigElement), given a config and a hass,
 * and expected to build its field tree. No assertion on which fields appear -
 * only that every field type this editor knows how to build actually builds.
 *
 * This is the shape of failure the logic tests are blind to: a broken field
 * builder type-checks fine and passes all 126 of them.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import '../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../ha-stubs.js';

import { META } from '../../src/utils/parameters.js';
import '../../src/index.js';

type EditorEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };

describe('every card hands back an editor that builds its fields', () => {
  for (const [key, meta] of Object.entries(META.types)) {
    const { typeName, editor } = meta as { typeName: string; editor?: string };
    // Multi-Card/Multi-Feature have no editor yet (see multi.ts's own TODO).
    if (!editor) continue;

    test(`${key} -> ${editor}`, () => {
      const cardCtor = customElements.get(typeName) as
        (CustomElementConstructor & { getConfigElement?: () => HTMLElement | null }) | undefined;
      assert.ok(cardCtor, `${typeName} is not registered`);

      const el = cardCtor.getConfigElement?.() as EditorEl | null;
      assert.ok(el, `${typeName}.getConfigElement() returned nothing`);
      assert.equal(el.tagName.toLowerCase(), editor);

      el.hass = makeHass();
      el.setConfig?.({ type: `custom:${typeName}`, entity: TEST_ENTITY });
      document.body.appendChild(el);

      assert.ok(el.shadowRoot, `${editor} built no shadow root`);
      // A field tree that silently built nothing is the failure this whole
      // file exists to catch.
      assert.ok((el.shadowRoot as ShadowRoot).childElementCount > 0, `${editor} rendered an empty shadow root`);
      el.remove();
    });
  }
});
