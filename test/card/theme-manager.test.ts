import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ThemeManager } from '../../src/card/theme-manager.js';
import { HA_CONTEXT } from '../../src/utils/parameters.js';

describe('ThemeManager - built-in theme zone at a given percent', () => {
  test('critical_when_high at 42% lands in the 0-60 green zone', () => {
    const theme = new ThemeManager();
    theme.theme = 'critical_when_high';
    theme.value = 42;
    assert.equal(theme.barColor, HA_CONTEXT.colors.green);
    assert.equal(theme.iconColor, HA_CONTEXT.colors.green);
  });

  test('critical_when_high at 75% lands in the 70-80 yellow zone', () => {
    const theme = new ThemeManager();
    theme.theme = 'critical_when_high';
    theme.value = 75;
    assert.equal(theme.barColor, HA_CONTEXT.colors.yellow);
  });

  test('critical_when_high at 95% lands in the 90-100 red zone', () => {
    const theme = new ThemeManager();
    theme.theme = 'critical_when_high';
    theme.value = 95;
    assert.equal(theme.barColor, HA_CONTEXT.colors.red);
  });

  test('zone boundaries are min-inclusive, max-exclusive', () => {
    const theme = new ThemeManager();
    theme.theme = 'critical_when_high';
    theme.value = 69.999;
    assert.equal(theme.barColor, HA_CONTEXT.colors.green, 'just under 70 is still the 60-70 zone');
    theme.value = 70;
    assert.equal(theme.barColor, HA_CONTEXT.colors.yellow, 'exactly 70 already belongs to the 70-80 zone');
  });

  test('a value below the first zone clamps to the first zone', () => {
    const theme = new ThemeManager();
    theme.theme = 'critical_when_high';
    theme.value = -20;
    assert.equal(theme.barColor, HA_CONTEXT.colors.green);
  });

  test('a value above the last zone clamps to the last zone', () => {
    const theme = new ThemeManager();
    theme.theme = 'critical_when_high';
    theme.value = 150;
    assert.equal(theme.barColor, HA_CONTEXT.colors.red);
  });
});

describe('ThemeManager - custom_theme (user-defined zones)', () => {
  test('picks the zone matching the current value', () => {
    // Hex, not an HA color name - keeps this test about zone-matching only,
    // adaptColor's own name->var resolution is covered separately below.
    const theme = new ThemeManager();
    theme.customTheme = [
      { min: 0, max: 50, color: '#ff0000' },
      { min: 50, max: 100, color: '#0000ff' },
    ];
    theme.value = 42;
    assert.equal(theme.barColor, '#ff0000');
    theme.value = 60;
    assert.equal(theme.barColor, '#0000ff');
  });

  test('a value in a gap between two non-tiling zones disengages the theme', () => {
    const theme = new ThemeManager();
    theme.customTheme = [
      { min: 0, max: 40, color: 'red' },
      { min: 60, max: 100, color: 'blue' },
    ];
    theme.value = 50;
    assert.equal(theme.barColor, null);
  });
});

describe('ThemeManager - linear theme (light) without interpolation', () => {
  test('picks the step the value falls into, no blending, by default', () => {
    const theme = new ThemeManager();
    theme.theme = 'light';
    theme.value = 42; // 5 steps over 0-100 -> step size 25, index 1
    assert.equal(theme.iconColor, '#877F67');
  });
});

describe('ThemeManager - interpolation between two zones', () => {
  test('blends the two neighboring colors via a color-mix() at the right ratio', () => {
    const theme = new ThemeManager();
    theme.configure({ theme: 'light', customTheme: null, interpolate: true });
    theme.value = 37.5; // halfway between step 1 (25) and step 2 (50)
    assert.equal(theme.iconColor, 'color-mix(in srgb, #C3B382 50%, #877F67)');
  });
});

describe('ThemeManager.adaptColor - HA color name -> CSS var, everything else passed through', () => {
  test('resolves a known HA color name to its CSS variable', () => {
    assert.equal(ThemeManager.adaptColor('primary'), 'var(--primary-color)');
  });

  test('passes an already-resolved value (hex, unknown name) through unchanged', () => {
    assert.equal(ThemeManager.adaptColor('#4B4B4B'), '#4B4B4B');
  });

  test('passes null through unchanged', () => {
    assert.equal(ThemeManager.adaptColor(null), null);
  });
});

describe('ThemeManager - invalid/unset theme', () => {
  test('an unknown theme name leaves the manager invalid with no colors', () => {
    const theme = new ThemeManager();
    theme.theme = 'not-a-real-theme';
    assert.equal(theme.isValid, false);
    assert.equal(theme.iconColor, null);
    assert.equal(theme.barColor, null);
  });
});
