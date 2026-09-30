/*
 * The editor's bug icon: one click, and the clipboard holds what an issue
 * needs - the environment, then the card's YAML with its problems marked.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../ha-stubs.js';

import '../../src/index.js';
import '../../src/editor/entry.js';

type EditorEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };

const mountEditor = async (tag: string, config: Record<string, unknown>) => {
  const el = document.createElement(tag) as EditorEl;
  el.hass = makeHass();
  el.setConfig?.({ entity: TEST_ENTITY, ...config });
  document.body.appendChild(el);
  await flushFrames();
  return el;
};

const bugIconOf = (el: EditorEl) => el.shadowRoot?.querySelector<HTMLElement>('.editor-header .del-btn') ?? null;

describe('the editor header copies an issue report', () => {
  test('the card: environment, then the YAML with a deprecated option marked', async () => {
    const el = await mountEditor('entity-progress-card-editor', {
      type: 'custom:entity-progress-card',
      disable_unit: true,
    });
    const icon = bugIconOf(el);
    assert.ok(icon, 'no bug icon in the header');
    const toast = new Promise<unknown>((resolve) => {
      el.addEventListener('hass-notification', (event) => resolve((event as CustomEvent).detail.message), {
        once: true,
      });
    });
    icon.click();
    assert.ok(await toast, 'no toast after copying');

    const copied = await navigator.clipboard.readText();
    assert.match(copied, /^```text\n=== Entity Progress Card — diagnostic ===\n/u);
    assert.match(copied, /\n```yaml\n(?:.+\n)*type: custom:entity-progress-card\n/);
    assert.match(copied, /\ndisable_unit: true {2}# deprecated\n/);
  });

  test('a Multi offers it, one of its rows does not', async () => {
    const multi = await mountEditor('entity-progress-multi-card-editor', {
      type: 'custom:entity-progress-multi-card',
      entities: [TEST_ENTITY],
    });
    assert.ok(bugIconOf(multi));
    assert.equal(bugIconOf(await mountEditor('entity-progress-multi-card-row-editor', {})), null);
  });
});
