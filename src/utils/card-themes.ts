/*
 * THEME: the built-in theme presets. Each is a list of value zones (min/max +
 * color, optionally an icon), plus `linear` (split 0-100% evenly, ignore
 * min/max), `percent` (zones are already 0-100 vs raw values), and `signed`
 * (zones span -100..100, for center_zero's own signed percent scale - see
 * ThemeManager.isSigned/ViewBase.themeDivergingGradient). No logic, just
 * data - consumed by card/value-helpers.ts's ThemeManager.
 */

import { HA_CONTEXT } from './ha-context.js';

const THEME = {
  // Virtual theme, resolved by ViewCore.resolvedTheme (src/card/view.ts) to
  // critical_when_extreme (charging) or critical_when_low (not charging)
  // before it ever reaches ThemeManager - these zones are only a fallback in
  // case that resolution is ever bypassed.
  battery_adaptive: {
    linear: false,
    percent: true,
    signed: false,
    style: [
      { min: 0, max: 10, icon: null, color: HA_CONTEXT.colors.red },
      { min: 10, max: 20, icon: null, color: HA_CONTEXT.colors.orange },
      { min: 20, max: 30, icon: null, color: HA_CONTEXT.colors.yellow },
      { min: 30, max: 40, icon: null, color: HA_CONTEXT.colors.green },
      { min: 40, max: 100, icon: null, color: HA_CONTEXT.colors.green },
    ],
  },
  critical_when_low: {
    linear: false,
    percent: true,
    signed: false,
    style: [
      { min: 0, max: 10, icon: null, color: HA_CONTEXT.colors.red },
      { min: 10, max: 20, icon: null, color: HA_CONTEXT.colors.orange },
      { min: 20, max: 30, icon: null, color: HA_CONTEXT.colors.yellow },
      { min: 30, max: 40, icon: null, color: HA_CONTEXT.colors.green },
      { min: 40, max: 100, icon: null, color: HA_CONTEXT.colors.green },
    ],
  },
  optimal_when_low: {
    linear: false,
    percent: true,
    signed: false,
    style: [
      { min: 0, max: 20, icon: null, color: HA_CONTEXT.colors.green },
      { min: 20, max: 40, icon: null, color: HA_CONTEXT.colors.lightGreen },
      { min: 40, max: 60, icon: null, color: HA_CONTEXT.colors.yellow },
      { min: 60, max: 80, icon: null, color: HA_CONTEXT.colors.orange },
      { min: 80, max: 100, icon: null, color: HA_CONTEXT.colors.red },
    ],
  },
  critical_when_high: {
    linear: false,
    percent: true,
    signed: false,
    style: [
      { min: 0, max: 60, icon: null, color: HA_CONTEXT.colors.green },
      { min: 60, max: 70, icon: null, color: HA_CONTEXT.colors.green },
      { min: 70, max: 80, icon: null, color: HA_CONTEXT.colors.yellow },
      { min: 80, max: 90, icon: null, color: HA_CONTEXT.colors.orange },
      { min: 90, max: 100, icon: null, color: HA_CONTEXT.colors.red },
    ],
  },
  optimal_when_high: {
    linear: false,
    percent: true,
    signed: false,
    style: [
      { min: 0, max: 20, icon: null, color: HA_CONTEXT.colors.red },
      { min: 20, max: 40, icon: null, color: HA_CONTEXT.colors.orange },
      { min: 40, max: 60, icon: null, color: HA_CONTEXT.colors.yellow },
      { min: 60, max: 80, icon: null, color: HA_CONTEXT.colors.lightGreen },
      { min: 80, max: 100, icon: null, color: HA_CONTEXT.colors.green },
    ],
  },
  critical_when_extreme: {
    linear: false,
    percent: true,
    signed: false,
    style: [
      { min: 0, max: 10, icon: null, color: HA_CONTEXT.colors.red },
      { min: 10, max: 20, icon: null, color: HA_CONTEXT.colors.orange },
      { min: 20, max: 30, icon: null, color: HA_CONTEXT.colors.yellow },
      { min: 30, max: 40, icon: null, color: HA_CONTEXT.colors.green },
      { min: 40, max: 60, icon: null, color: HA_CONTEXT.colors.green },
      { min: 60, max: 70, icon: null, color: HA_CONTEXT.colors.green },
      { min: 70, max: 80, icon: null, color: HA_CONTEXT.colors.yellow },
      { min: 80, max: 90, icon: null, color: HA_CONTEXT.colors.orange },
      { min: 90, max: 100, icon: null, color: HA_CONTEXT.colors.red },
    ],
  },
  // center_zero's own equivalent of critical_when_extreme above - same
  // shape, linearly stretched from 0-100 onto -100..100 (old 50% midpoint ->
  // new 0) instead of duplicated per arm. `signed: true` tells
  // ThemeManager/ViewBase.themeDivergingGradient to treat it as one
  // continuous -100..100 scale rather than projecting the same zones onto
  // each arm independently (which would put red at the center - backwards).
  critical_when_extreme_center: {
    linear: false,
    percent: true,
    signed: true,
    style: [
      { min: -100, max: -80, icon: null, color: HA_CONTEXT.colors.red },
      { min: -80, max: -60, icon: null, color: HA_CONTEXT.colors.orange },
      { min: -60, max: -40, icon: null, color: HA_CONTEXT.colors.yellow },
      { min: -40, max: -20, icon: null, color: HA_CONTEXT.colors.green },
      { min: -20, max: 20, icon: null, color: HA_CONTEXT.colors.green },
      { min: 20, max: 40, icon: null, color: HA_CONTEXT.colors.green },
      { min: 40, max: 60, icon: null, color: HA_CONTEXT.colors.yellow },
      { min: 60, max: 80, icon: null, color: HA_CONTEXT.colors.orange },
      { min: 80, max: 100, icon: null, color: HA_CONTEXT.colors.red },
    ],
  },
  // `light` theme (colors + lightbulb icon progression) contributed by
  // @harmonie-durrant. @see https://github.com/harmonie-durrant
  light: {
    linear: true,
    percent: true,
    signed: false,
    style: [
      { icon: HA_CONTEXT.icons.lightbulbOutline, color: '#4B4B4B' },
      { icon: HA_CONTEXT.icons.lightbulbOutline, color: '#877F67' },
      { icon: HA_CONTEXT.icons.lightbulb, color: '#C3B382' },
      { icon: HA_CONTEXT.icons.lightbulb, color: '#FFE79E' },
      { icon: HA_CONTEXT.icons.lightbulb, color: '#FFE79E' },
    ],
  },
  temperature: {
    linear: false,
    percent: false,
    signed: false,
    style: [
      { min: -50, max: -20, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.indigo },
      { min: -20, max: -2, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.blue },
      { min: -2, max: 2, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.lightBlue },
      { min: 2, max: 15, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.cyan },
      { min: 15, max: 20, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.teal },
      { min: 20, max: 25, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.green },
      { min: 25, max: 27, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.yellow },
      { min: 27, max: 30, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.amber },
      { min: 30, max: 100, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.red },
    ],
  },
  humidity: {
    linear: false,
    percent: true,
    signed: false,
    // Warm (dry) -> cool (humid) hue direction kept, band widths mirror
    // around the 40-60 comfort zone (now one solid green band, not
    // green/teal split - teal read as a washed-out green there instead of a
    // distinct color) instead of the old lopsided split (7/10/23 dry vs
    // 5/15/20 humid) - a 95% reading (mold/condensation risk) used to read
    // as merely "different" (deep-purple) while a 15% reading hit red, the
    // opposite of the actual risk profile.
    style: [
      { min: 0, max: 20, icon: HA_CONTEXT.icons.waterPercent, color: HA_CONTEXT.colors.red },
      { min: 20, max: 30, icon: HA_CONTEXT.icons.waterPercent, color: HA_CONTEXT.colors.orange },
      { min: 30, max: 40, icon: HA_CONTEXT.icons.waterPercent, color: HA_CONTEXT.colors.yellow },
      { min: 40, max: 60, icon: HA_CONTEXT.icons.waterPercent, color: HA_CONTEXT.colors.green },
      { min: 60, max: 70, icon: HA_CONTEXT.icons.waterPercent, color: 'var(--light-blue-color)' },
      { min: 70, max: 80, icon: HA_CONTEXT.icons.waterPercent, color: HA_CONTEXT.colors.indigo },
      { min: 80, max: 100, icon: HA_CONTEXT.icons.waterPercent, color: HA_CONTEXT.colors.deepPurple },
    ],
  },
  voc: {
    linear: false,
    percent: false,
    signed: false,
    style: [
      { min: 0, max: 300, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.green },
      { min: 300, max: 500, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.yellow },
      { min: 500, max: 3000, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.orange },
      { min: 3000, max: 25000, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.red },
      { min: 25000, max: 50000, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.deepPurple },
    ],
  },
  pm25: {
    linear: false,
    percent: false,
    signed: false,
    style: [
      { min: 0, max: 12, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.green },
      { min: 12, max: 35, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.yellow },
      { min: 35, max: 55, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.orange },
      { min: 55, max: 150, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.red },
      { min: 150, max: 200, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.deepPurple },
    ],
  },
};

// Theme keys usable where only a 0-100 percent is available (no min_value/
// max_value to project real-value zones onto) - e.g. Template's `theme:`
// field (schema.ts) and its editor selector (editor/base.ts). Single source
// so both stay in sync automatically as themes are added/changed.
const PERCENT_THEME_KEYS = Object.keys(THEME).filter((key) => THEME[key as keyof typeof THEME].percent);

export { THEME, PERCENT_THEME_KEYS };
