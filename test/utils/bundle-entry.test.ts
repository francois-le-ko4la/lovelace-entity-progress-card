/*
 * Where the bundle thinks it was served from decides where its editor file is
 * imported from - so only this bundle's own script entry may answer, never an
 * image or a fetch whose URL happens to carry the same name.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { isBundleEntry, scriptUrlFromStack, suffixOf } from '../../src/utils/parameters.js';

const STEM = 'entity-progress-card';
const HACS_URL = 'https://ha.local:8123/hacsfiles/lovelace-entity-progress-card/entity-progress-card.js?hacstag=123';

const entry = (name: string, initiatorType: string) => ({ name, initiatorType }) as unknown as PerformanceEntry;

describe('isBundleEntry - the resource the editor is imported beside', () => {
  test('the bundle itself, loaded as a module script or dynamically', () => {
    assert.equal(isBundleEntry(entry(HACS_URL, 'script'), STEM), true);
    assert.equal(isBundleEntry(entry(HACS_URL, 'other'), STEM), true);
  });

  test('an image or a fetch with the same URL is never it', () => {
    for (const type of ['img', 'fetch', 'xmlhttprequest', 'css', 'link']) {
      assert.equal(isBundleEntry(entry(HACS_URL, type), STEM), false, type);
    }
  });

  test('the name has to end the path, not sit anywhere in the URL', () => {
    for (const url of [
      'https://evil.example/other.js?file=entity-progress-card.js',
      'https://evil.example/entity-progress-card.js.png',
      'https://evil.example/my-entity-progress-card.js',
      'not a url',
    ]) {
      assert.equal(isBundleEntry(entry(url, 'script'), STEM), false, url);
    }
  });

  test('a dev bundle and the shipped one never answer for each other', () => {
    assert.equal(isBundleEntry(entry(HACS_URL, 'script'), `${STEM}_dev`), false);
  });
});

describe('scriptUrlFromStack - the exact file a bundle runs from', () => {
  const TEST_COPY = 'https://ha.local:8123/local/test/entity-progress-card.js?suffix=rc';

  test('read off Chrome, Firefox and Safari frames, port and query kept', () => {
    for (const stack of [
      `Error\n    at ${TEST_COPY}:1:2345\n    at other.js:1:1`,
      `Error\n    at Object.<anonymous> (${TEST_COPY}:1:2345)`,
      `@${TEST_COPY}:1:2345\n@https://ha.local:8123/other.js:3:4`,
      `global code@${TEST_COPY}:1:2345`,
    ]) {
      assert.equal(scriptUrlFromStack(stack), TEST_COPY, stack);
    }
  });

  test('nothing to read: no URL', () => {
    assert.equal(scriptUrlFromStack(''), '');
    assert.equal(scriptUrlFromStack('Error\n    at <anonymous>'), '');
  });
});

describe('suffixOf - the names a copy registers under', () => {
  const params = (query: string) => new URLSearchParams(query);

  test('?suffix= names a test copy, ahead of dev mode', () => {
    assert.equal(suffixOf(params('suffix=rc'), false), 'rc');
    assert.equal(suffixOf(params('suffix=rc11'), true), 'rc11');
  });

  test('a dev build is the -dev one, the shipped file none', () => {
    assert.equal(suffixOf(params(''), true), 'dev');
    assert.equal(suffixOf(params(''), false), '');
  });

  test('anything that would not make a valid tag is ignored', () => {
    for (const asked of ['RC', 'rc-1', 'rc_1', '', 'a'.repeat(17), 'x y']) {
      assert.equal(suffixOf(params(`suffix=${encodeURIComponent(asked)}`), false), '', asked);
    }
  });
});
