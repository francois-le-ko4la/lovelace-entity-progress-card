/*
 * A tile feature that sets no entity renders its tile's (cards.ts), and Home
 * Assistant hands the feature's editor that tile's context. The editor has to
 * judge by the same entity - peak_marker, attribute - without ever writing it.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../../ha-stubs.js';
import { assertUndefined } from '../../helpers.js';

import '../../../src/index.js';
import '../../../src/editor/entry.js';

type EditorEl = HTMLElement & {
  setConfig?: (c: unknown) => void;
  hass?: unknown;
  context?: { entity_id?: string };
};

const PEAK_TOGGLE = 'peak_marker.toggle';

// Home Assistant's own order: context first, then the config.
const mountFeatureEditor = async (context: { entity_id?: string }) => {
  const el = document.createElement('entity-progress-feature-editor') as EditorEl;
  el.hass = makeHass();
  el.context = context;
  el.setConfig?.({ type: 'custom:entity-progress-feature' });
  document.body.appendChild(el);
  await flushFrames();
  const field = (name: string) => el.shadowRoot?.querySelector<HTMLElement>(`[id="${name}"]`) ?? null;
  return { el, field };
};

describe('a feature any card can host', () => {
  // HA lists a custom feature by isSupported(hass, context) since 2025.6: a
  // host with no entity (Mushroom's template card) passes an empty context.
  test('is offered whether or not the host card has an entity', async () => {
    // register.ts pushes the entries one second after load.
    await new Promise((resolve) => {
      setTimeout(resolve, 1100);
    });
    const entries = (window as unknown as { customCardFeatures?: Record<string, unknown>[] }).customCardFeatures ?? [];
    for (const type of ['entity-progress-feature', 'entity-progress-multi-feature']) {
      const entry = entries.find((candidate) => candidate.type === type) as
        { isSupported?: (hass: unknown, context: unknown) => boolean; supported?: () => boolean } | undefined;
      assert.ok(entry, `${type} is not registered`);
      assert.equal(entry.isSupported?.(makeHass(), {}), true, `${type}: isSupported`);
      assert.equal(entry.supported?.(), true, `${type}: supported, for HA before 2025.6`);
    }
  });
});

describe('a feature editor judges by its tile entity', () => {
  test('peak_marker and attribute are offered for the tile entity', async () => {
    const { field } = await mountFeatureEditor({ entity_id: TEST_ENTITY });
    for (const name of [PEAK_TOGGLE, 'attribute']) {
      const el = field(name);
      assert.ok(el, `no ${name} field`);
      assert.notEqual(el.style.display, 'none', `${name} is hidden`);
    }
  });

  test('without a tile entity, they stay hidden', async () => {
    const { field } = await mountFeatureEditor({});
    assert.equal(field(PEAK_TOGGLE)?.style.display, 'none');
  });

  test('turning peak_marker on writes neither the entity nor the context key', async () => {
    const { el, field } = await mountFeatureEditor({ entity_id: TEST_ENTITY });
    const sent: Record<string, unknown>[] = [];
    el.addEventListener('config-changed', (event) => sent.push((event as CustomEvent).detail.config));
    field(PEAK_TOGGLE)?.dispatchEvent(
      new CustomEvent('value-changed', { detail: { value: 'enabled' }, bubbles: true, composed: true }),
    );
    await flushFrames();
    const written = sent.at(-1);
    assert.ok(written?.peak_marker, 'peak_marker was not written');
    assertUndefined(written.entity);
    assertUndefined(written._context_entity);
  });
});
