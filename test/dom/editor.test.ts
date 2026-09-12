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

import { flushFrames } from '../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../ha-stubs.js';

import { META } from '../../src/utils/parameters.js';
import { EditorFactory } from '../../src/editor/factory.js';
import '../../src/index.js';

type EditorEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };

describe('every card hands back an editor that builds its fields', () => {
  for (const [key, meta] of Object.entries(META.types)) {
    const { typeName, editor } = meta as { typeName: string; editor?: string };
    // Every registered type declares one now - the guard stays as the
    // contract, not as an exemption for a specific pair.
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

/*
 * The Multi's rows are edited behind a pencil, in an editor its host builds by
 * tag name (see MultiEditorBase#openRow) - one per variant, since a Feature's
 * rows are not the same schema as a Card's. What can only break here: a tag
 * never getting defined, and a row editor's own config-changed escaping its
 * host to be read as the whole card's config.
 */
describe('the Multi row editors', () => {
  for (const tag of ['entity-progress-multi-card-row-editor', 'entity-progress-multi-feature-row-editor']) {
    test(`${tag} is registered and builds its own fields`, () => {
      assert.ok(customElements.get(tag), `${tag} is not defined`);

      const el = document.createElement(tag) as EditorEl;
      el.hass = makeHass();
      el.setConfig?.({ entity: TEST_ENTITY });
      document.body.appendChild(el);
      assert.ok(el.shadowRoot, 'no shadow root');
      assert.ok((el.shadowRoot as ShadowRoot).childElementCount > 0, 'empty field tree');
      el.remove();
    });
  }
});

/*
 * Hiding a component takes its own settings with it (EditorFactory's
 * HIDE_DEPENDENTS table). Asserted as an invariant rather than field by field:
 * the table is the kind of list that grows, and a row added without its gate
 * is exactly what nothing else would notice.
 */
describe('a static hide takes its own fields out of the editor', () => {
  type Field = { showIf?: (c: Record<string, unknown>, n: Record<string, unknown>) => boolean };
  type Tree = Record<string, { fields: Record<string, Field> }>;

  const visible = (tree: Tree, config: Record<string, unknown>) => {
    const out = new Set<string>();
    for (const section of Object.values(tree)) {
      for (const [name, field] of Object.entries(section.fields)) {
        if (!field.showIf || field.showIf(config, config)) out.add(name);
      }
    }
    return out;
  };

  // What each target must take with it. Written out here on purpose: a copy of
  // the table would pass whatever the table said.
  const EXPECTED: Record<string, string[]> = {
    icon: ['icon', 'color', 'icon_animation', 'force_circular_background_mode', 'badge_icon', 'icon_tap_action'],
    shape: ['force_circular_background_mode'],
    name: ['name', 'name_info'],
    value: ['decimal', 'value_compact', 'value_sign'],
    unit: ['unit', 'unit_position', 'unit_spacing'],
    secondary_info: ['decimal', 'unit', 'state_content', 'custom_info', 'reverse_secondary_info_row'],
    progress_bar: ['bar_size', 'bar_color', 'bar_position', 'bar_segments', 'watermark.toggle', 'bar_effect_mode'],
  };

  for (const [target, fields] of Object.entries(EXPECTED)) {
    test(`hide: [${target}]`, () => {
      const tree = EditorFactory.build({ template: false, badge: false }) as unknown as Tree;
      const shown = visible(tree, { hide: [target] });
      for (const field of fields) assert.equal(shown.has(field), false, `${field} should be gone with ${target}`);
    });
  }

  test('a Jinja hide gates nothing - its result is unknowable here', () => {
    const tree = EditorFactory.build({ template: false, badge: false }) as unknown as Tree;
    const shown = visible(tree, { hide: '{{ 1 }}' });
    for (const field of ['icon', 'name', 'bar_size', 'unit']) {
      assert.ok(shown.has(field), `${field} must stay reachable behind a template`);
    }
  });
});

/*
 * A top-level key with a dot in it is never a valid option here - a nested one
 * is a map. The only thing that ever wrote one was lengthField addressing
 * 'watermark.line_size' as a key rather than a path, and the value was inert.
 * Swept on the next edit, silently.
 */
describe('the editor never saves a dotted top-level key', () => {
  test('an inherited one is gone from the next config-changed', async () => {
    const el = document.createElement('entity-progress-card-editor') as EditorEl & {
      addEventListener: HTMLElement['addEventListener'];
    };
    el.hass = makeHass();
    el.setConfig?.({
      type: 'custom:entity-progress-card',
      entity: TEST_ENTITY,
      watermark: { low: { value: 20, type: 'line' } },
      'watermark.line_size': '173px',
    });
    document.body.appendChild(el);

    const sent: Record<string, unknown>[] = [];
    el.addEventListener('config-changed', (e) => sent.push((e as CustomEvent).detail.config));

    // Any field write is enough - the sweep happens on the way out.
    const field = (el.shadowRoot as ShadowRoot).querySelector('#name') as HTMLElement | null;
    assert.ok(field, 'the name field should be there to poke');
    field.dispatchEvent(new CustomEvent('value-changed', { detail: { value: 'x' }, bubbles: true, composed: true }));
    await flushFrames();

    assert.equal(sent.length > 0, true, 'the editor should have sent a config');
    for (const config of sent) {
      assert.equal('watermark.line_size' in config, false, 'the dotted key must not survive');
      assert.deepEqual(config.watermark, { low: { value: 20, type: 'line' } }, 'the real watermark is untouched');
    }
    el.remove();
  });
});
