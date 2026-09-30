/*
 * The gap `node --check` and `es-check` leave open: they parse a shipped
 * bundle, nothing ever *runs* it. Issue #108 was exactly that - the bundle
 * threw at load time from an `import.meta` the source alone never revealed -
 * and #128 was es2022 syntax esbuild emitted on its own.
 *
 * So this mounts every element from a real artifact in dist/, after the whole
 * build pipeline: bundling, CSS inlining, release-flag forcing and
 * minification - then loads the editor file beside it, which reads its shared
 * modules off the bundle's host table: one the table misses shows up here.
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

import './dom-setup.js';
import { makeHass, TEST_ENTITY } from './ha-stubs.js';
import { assertUndefined } from './helpers.js';

// Tag names only - plain data, and importing it registers nothing (that only
// happens in src/index.ts, which this file deliberately never loads).
import { META, VERSION } from '../src/utils/parameters.js';

type CardClass = CustomElementConstructor & { getConfigElement?: () => Promise<HTMLElement | null> };

const describeBundle = (file: string) => {
  const bundle = path.resolve(file);
  const editorFile = bundle.replace(/\.js$/, '-editor.js');

  describe(`the shipped bundle ${path.basename(bundle)}`, () => {
    before(async () => {
      assert.ok(fs.existsSync(bundle), `${bundle} is missing - run the build first (check:github does).`);
      // A computed specifier: esbuild cannot resolve it at build time, so the
      // real file is loaded at runtime instead of being re-bundled into this
      // test - which would defeat the point of testing the artifact.
      await import(pathToFileURL(bundle).href);
    });

    for (const [key, meta] of Object.entries(META.types)) {
      const { typeName: tag, editor } = meta as { typeName: string; editor?: string };

      test(`registers and mounts ${key} (${tag})`, () => {
        assert.ok(customElements.get(tag), `${tag} is not registered by the bundle`);

        const el = document.createElement(tag) as HTMLElement & {
          setConfig?: (c: unknown) => void;
          hass?: unknown;
        };
        const config = key.startsWith('multi')
          ? { type: `custom:${tag}`, entities: [{ entity: TEST_ENTITY }] }
          : { type: `custom:${tag}`, entity: TEST_ENTITY };

        el.setConfig?.(config);
        document.body.appendChild(el);
        el.hass = makeHass();

        assert.ok(el.shadowRoot, `${tag} built no shadow root`);
      });

      test(`${key} leaves its editor to the editor file`, () => {
        assertUndefined(customElements.get(String(editor)), `${editor} is defined by the bundle itself`);
      });
    }

    // The editor reads its shared modules off this table: nothing may swap it.
    test('publishes its host table once, locked', () => {
      const key = Symbol.for(`epb-host:${path.basename(bundle, '.js')}:${VERSION}`);
      const slot = Object.getOwnPropertyDescriptor(globalThis, key);
      assert.ok(slot, 'no host table');
      assert.equal(slot.writable, false);
      assert.equal(slot.configurable, false);
      assert.ok(Object.isFrozen(slot.value));
    });

    describe('with its editor file', () => {
      before(async () => {
        assert.ok(fs.existsSync(editorFile), `${editorFile} is missing - run the build first (check:github does).`);
        await import(pathToFileURL(editorFile).href);
      });

      for (const [key, meta] of Object.entries(META.types)) {
        const { typeName: tag, editor } = meta as { typeName: string; editor?: string };
        test(`${key} hands back its visual editor`, async () => {
          const editorEl = await (customElements.get(tag) as CardClass).getConfigElement?.();
          assert.equal(editorEl?.tagName.toLowerCase(), editor);
        });
      }
    });
  });
};

export { describeBundle };
