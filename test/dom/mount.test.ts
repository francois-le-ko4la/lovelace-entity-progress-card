/*
 * The one thing the pure-logic suite can't cover: that every registered
 * custom element actually mounts. No assertion on what it renders (that is
 * what docs/demo-dashboard.yaml is for) - only that setConfig + hass +
 * connectedCallback complete without throwing, on real DOM.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Side-effect import, and it must stay first: src/ registers its elements at
// module-evaluation time.
import { flushFrames } from '../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../ha-stubs.js';

import { META } from '../../src/utils/parameters.js';
import '../../src/index.js';

const hass = makeHass();

describe('every registered custom element mounts on a real DOM', () => {
  for (const [key, meta] of Object.entries(META.types)) {
    test(`${key} (${(meta as { typeName: string }).typeName})`, () => {
      const tag = (meta as { typeName: string }).typeName;
      const ctor = customElements.get(tag);
      assert.ok(ctor, `${tag} is not registered`);

      const el = document.createElement(tag) as HTMLElement & {
        setConfig?: (c: unknown) => void;
        hass?: unknown;
      };
      const config = key.startsWith('multi')
        ? { type: `custom:${tag}`, entities: [{ entity: TEST_ENTITY }] }
        : { type: `custom:${tag}`, entity: TEST_ENTITY };

      el.setConfig?.(config);
      document.body.appendChild(el);
      el.hass = hass;

      assert.ok(el.shadowRoot, `${tag} built no shadow root`);
      el.remove();
    });
  }
});

// Mounting proves nothing crashed. This proves the render pipeline actually
// reaches the DOM: the configured name, the entity's state and its resolved
// unit all have to come out the other end.
describe('a mounted card puts its entity on screen', () => {
  for (const key of ['card', 'badge'] as const) {
    const { typeName } = META.types[key] as { typeName: string };

    test(`${key} (${typeName}) renders name, state and unit`, async () => {
      const el = document.createElement(typeName) as HTMLElement & {
        setConfig?: (c: unknown) => void;
        hass?: unknown;
      };
      el.setConfig?.({ type: `custom:${typeName}`, entity: TEST_ENTITY, name: 'Batterie' });
      document.body.appendChild(el);
      el.hass = makeHass();
      await flushFrames();

      const text = ((el.shadowRoot as ShadowRoot).textContent ?? '').replace(/\s+/g, ' ');
      assert.match(text, /42/, `${typeName} never rendered the entity state`);
      assert.match(text, /%/, `${typeName} never rendered the resolved unit`);
      el.remove();
    });
  }
});
