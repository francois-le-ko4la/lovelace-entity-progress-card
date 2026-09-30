/*
 * DOMHelper batches writes into the next frame and skips what is already
 * shown. Whichever write came last is the one on screen, queued or not.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../dom-setup.js';
import { DOMHelper, ResourceManager } from '../../src/card/dom-helpers.js';

const KEY = 'label';

const showing = async (value: string) => {
  const dom = new DOMHelper();
  const el = document.createElement('span');
  dom.register(KEY, el);
  dom.setText(KEY, value);
  await flushFrames();
  return { dom, el };
};

describe('the last write wins', () => {
  test('a text changed and set back within one frame stays as it was', async () => {
    const { dom, el } = await showing('A');
    for (const value of ['B', 'A']) dom.setText(KEY, value);
    await flushFrames();
    assert.equal(el.textContent, 'A');
  });

  test('an immediate write is not undone by an older one still queued', async () => {
    const { dom, el } = await showing('A');
    dom.setText(KEY, 'B');
    dom.setTextNow(KEY, 'C');
    await flushFrames();
    assert.equal(el.textContent, 'C');
  });
});

// A timeout that has run is gone: has() says so, and nothing clears it again.
describe('ResourceManager.setTimeout', () => {
  const JOB = 'job';
  const RE_ARM_MS = 30;
  const wait = (ms: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  test('a fired timeout is no longer held', async () => {
    const resources = new ResourceManager();
    let runs = 0;
    resources.setTimeout(() => runs++, 0, JOB);
    assert.equal(resources.has(JOB), true);
    await wait(5);
    assert.equal(runs, 1);
    assert.equal(resources.has(JOB), false);
  });

  test('its handler can re-arm the same id', async () => {
    const resources = new ResourceManager();
    let runs = 0;
    const run = () => {
      runs++;
      if (runs === 1) resources.setTimeout(run, RE_ARM_MS, JOB);
    };
    resources.setTimeout(run, 0, JOB);
    await wait(5);
    assert.equal(resources.has(JOB), true, 'the re-armed timeout was dropped with the one that fired');
    await wait(RE_ARM_MS * 2);
    assert.equal(runs, 2);
    assert.equal(resources.has(JOB), false);
  });
});
