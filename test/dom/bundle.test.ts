/*
 * The gap `node --check` and `es-check` leave open: they parse the shipped
 * bundle, nothing ever *runs* it. Issue #108 was exactly that - the bundle
 * threw at load time from an `import.meta` the source alone never revealed -
 * and #128 was es2022 syntax esbuild emitted on its own.
 *
 * So this mounts every element from `dist/entity-progress-card.js`, the real
 * artifact, after the whole build pipeline: bundling, CSS inlining, release-
 * flag forcing and minification.
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

import '../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../ha-stubs.js';

// Tag names only - plain data, and importing it registers nothing (that only
// happens in src/index.ts, which this file deliberately never loads).
import { META } from '../../src/utils/parameters.js';

const BUNDLE = path.resolve('dist/entity-progress-card.js');

describe('the shipped bundle', () => {
  before(async () => {
    assert.ok(fs.existsSync(BUNDLE), `${BUNDLE} is missing - run \`npm run build:prod\` first (check:github does).`);
    // A computed specifier: esbuild cannot resolve it at build time, so the
    // real file is loaded at runtime instead of being re-bundled into this
    // test - which would defeat the point of testing the artifact.
    const url = pathToFileURL(BUNDLE).href;
    await import(url);
  });

  for (const [key, meta] of Object.entries(META.types)) {
    const tag = (meta as { typeName: string }).typeName;

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
      el.remove();
    });
  }
});
