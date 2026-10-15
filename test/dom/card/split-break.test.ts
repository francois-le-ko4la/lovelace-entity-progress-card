/*
 * multiline splits the secondary text at its first <br>. Pins the split: first
 * break wins, a 2nd break drops the tail,
 * markup stays balanced on both sides, multiline off strips every break.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import '../../dom-setup.js';
import { splitAtFirstBreak } from '../../../src/card/core/base/split-break.js';

const split = splitAtFirstBreak;

describe('splitAtFirstBreak', () => {
  test('multiline off strips every break and returns no second line', () => {
    assert.deepEqual(split('a<br>b<br/>c', false), ['abc', null]);
  });

  test('multiline on without a break keeps the text as one line', () => {
    assert.deepEqual(split('plain', true), ['plain', null]);
  });

  test('splits at the first break', () => {
    assert.deepEqual(split('one<br>two', true), ['one', 'two']);
  });

  test('accepts <br/> and <BR >', () => {
    assert.deepEqual(split('one<br/>two', true), ['one', 'two']);
    assert.deepEqual(split('one<BR >two', true), ['one', 'two']);
  });

  test('drops anything from a second break onward', () => {
    assert.deepEqual(split('one<br>two<br>three', true), ['one', 'two']);
  });

  test('keeps nested markup balanced on both sides', () => {
    assert.deepEqual(split('<b>one<br>two</b>', true), ['<b>one</b>', '<b>two</b>']);
  });

  test('coerces non-string content', () => {
    assert.deepEqual(split(42, true), ['42', null]);
  });
});
