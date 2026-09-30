/*
 * The gap `node --check` and `es-check` leave open: they parse a shipped
 * bundle, nothing ever *runs* it. Issue #108 was exactly that - the bundle
 * threw at load time from an `import.meta` the source alone never revealed -
 * and #128 was es2022 syntax esbuild emitted on its own.
 *
 * So this mounts every element from a real artifact in dist/, after the whole
 * build pipeline: bundling, CSS inlining, release-flag forcing and
 * minification. One suite, one test file per bundle: each file runs in its own
 * process, so the two never register over each other.
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
import { META } from '../src/utils/parameters.js';

type CardClass = CustomElementConstructor & { getConfigElement?: () => Promise<HTMLElement | null> };

const describeBundle = (file: string, { editors }: { editors: boolean }) => {
  const bundle = path.resolve(file);

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

      // The light bundle's promise is HA's own YAML editor: getConfigElement
      // answers null, and no editor tag is ever defined.
      test(`${key} ${editors ? 'hands back its' : 'has no'} visual editor`, async () => {
        const editorEl = await (customElements.get(tag) as CardClass).getConfigElement?.();
        if (editors) {
          assert.equal(editorEl?.tagName.toLowerCase(), editor);
        } else {
          assert.equal(editorEl ?? null, null, `${tag} offered an editor from the light bundle`);
          assertUndefined(customElements.get(String(editor)), `${editor} is defined by the light bundle`);
        }
      });
    }
  });
};

export { describeBundle };
