/*
 * Where the bundle thinks it was served from decides where its editor file is
 * imported from - so only this bundle's own script entry may answer, never an
 * image or a fetch whose URL happens to carry the same name.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { isBundleEntry } from '../../src/utils/parameters.js';

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
