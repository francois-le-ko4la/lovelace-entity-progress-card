import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { contrastTextColor, fillEndColor, relativeLuminance } from '../../../src/card/color/text-contrast.js';

const rgb = (r: number, g: number, b: number) => ({ r, g, b });

describe('contrastTextColor', () => {
  test('black on bright bars, white on dark ones', () => {
    assert.equal(contrastTextColor(rgb(255, 235, 59)), '#000');
    assert.equal(contrastTextColor(rgb(0, 255, 255)), '#000');
    assert.equal(contrastTextColor(rgb(20, 40, 120)), '#fff');
    assert.equal(contrastTextColor(rgb(0, 0, 0)), '#fff');
  });

  test('luminance spans 0 to 1', () => {
    assert.equal(relativeLuminance(rgb(0, 0, 0)), 0);
    assert.ok(Math.abs(relativeLuminance(rgb(255, 255, 255)) - 1) < 1e-9);
  });

  test('flips at the equal-contrast grey', () => {
    assert.equal(contrastTextColor(rgb(117, 117, 117)), '#fff');
    assert.equal(contrastTextColor(rgb(120, 120, 120)), '#000');
  });
});

describe('fillEndColor', () => {
  test('no gradient: the bar color', () => {
    assert.equal(fillEndColor(null, 'var(--blue-color)'), 'var(--blue-color)');
  });

  test('a gradient: its last stop, position removed', () => {
    assert.equal(fillEndColor('linear-gradient(to right, red 0%, #ffeb3b 100%)', 'blue'), '#ffeb3b');
  });

  test('a nested color-mix stop keeps its commas', () => {
    const stop = 'color-mix(in srgb, var(--a) 40%, var(--b))';
    assert.equal(fillEndColor(`linear-gradient(to right, red 0%, ${stop} 100%)`, null), stop);
  });
});
