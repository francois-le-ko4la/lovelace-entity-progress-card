/*
 * Chrome's User-Agent stops at the major version and says Windows 10 on
 * Windows 11: the dump's browser line reads Client Hints instead.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import '../dom-setup.js';
import { browserOf } from '../../src/utils/diagnostic.js';

const CHROME = '153.0.7300.42';
const BRANDS = [
  { brand: 'Not)A;Brand', version: '8.0.0.0' },
  { brand: 'Chromium', version: CHROME },
  { brand: 'Google Chrome', version: CHROME },
];

describe('browserOf - the exact browser and OS behind a frozen User-Agent', () => {
  test('the named brand over Chromium and the made-up one, Windows 11 from its platform version', () => {
    const hints = { fullVersionList: BRANDS, platform: 'Windows', platformVersion: '15.0.0' };
    assert.equal(browserOf(hints, true), `Google Chrome ${CHROME} — Windows 11 (15.0.0)`);
  });

  test('Chromium itself when no other brand, and the real macOS version', () => {
    const hints = { fullVersionList: BRANDS.slice(0, 2), platform: 'macOS', platformVersion: '15.3.0' };
    assert.equal(browserOf(hints, true), `Chromium ${CHROME} — macOS 15.3.0`);
  });

  test('Windows 10 below platform version 13', () => {
    const hints = { fullVersionList: BRANDS, platform: 'Windows', platformVersion: '10.0.0' };
    assert.match(browserOf(hints, true), /Windows 10 or older \(10\.0\.0\)$/);
  });

  test('Chrome < 98: brands and uaFullVersion, its old grease brand led by a space', () => {
    const hints = {
      brands: [
        { brand: ' Not;A Brand', version: '99' },
        { brand: 'Chromium', version: '92' },
      ],
      uaFullVersion: '92.0.4496.0',
      platform: 'Windows',
      platformVersion: '10.0',
    };
    assert.equal(browserOf(hints, true), 'Chromium 92.0.4496.0 — Windows 10 or older (10.0)');
  });

  test('no hints: the user agent line, and why over http', () => {
    assert.equal(browserOf(null, true), 'see user agent');
    assert.match(browserOf(null, false), /over http/);
  });
});
