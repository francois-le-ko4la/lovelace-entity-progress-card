/*
 * Helpers for the editor's "length field" (number + unit) used by size options
 * like min_width / height / bar_max_width. A config value stays a plain CSS
 * string ("120px") - these only split it into { value, unit } for the slider +
 * unit-select controls, and put it back together on change. Values that aren't
 * a plain number+unit (calc(), auto, unknown units) are flagged `custom` so the
 * editor falls back to a raw text input instead of the slider.
 */

type ParsedLength = { custom: false; value: number; unit: string } | { custom: true; raw: string };

// Slider bounds/step per unit. `%` and `px` step by 1, em/rem by 0.1.
const LENGTH_MAX: Record<string, number> = { px: 500, em: 40, rem: 40, '%': 500 };
const LENGTH_STEP: Record<string, number> = { px: 1, em: 0.1, rem: 0.1, '%': 1 };

const LENGTH_RE = /^\s*(-?\d*\.?\d+)\s*(px|em|rem|%)\s*$/;

const parseLength = (raw: unknown): ParsedLength => {
  if (typeof raw !== 'string' || raw.trim() === '') return { custom: false, value: 0, unit: 'px' };
  const match = raw.match(LENGTH_RE);
  if (!match) return { custom: true, raw };
  return { custom: false, value: parseFloat(match[1]), unit: match[2] };
};

// Back to a config string. Only the true default (0px) collapses to undefined
// (i.e. unset); any other unit is kept even at 0 so a chosen unit sticks while
// the value is still 0 (e.g. "0em").
const serializeLength = (value: number, unit: string): string | undefined =>
  value === 0 && unit === 'px' ? undefined : `${value}${unit}`;

// Slider params for a raw value: the range widens past LENGTH_MAX when the
// stored value already exceeds it (a YAML-set value stays editable, never
// clamped down on load - typed input is clamped to `max` natively by HA).
const lengthSliderSelector = (raw: unknown): Record<string, unknown> => {
  const parsed = parseLength(raw);
  const unit = parsed.custom ? 'px' : parsed.unit;
  const value = parsed.custom ? 0 : parsed.value;
  const max = Math.max(LENGTH_MAX[unit] ?? 500, value);
  return { number: { min: 0, max, step: LENGTH_STEP[unit] ?? 1, mode: 'slider', unit_of_measurement: unit } };
};

const lengthUnitSelector = (units: string[]): Record<string, unknown> => ({
  select: { mode: 'dropdown', options: units.map((u) => ({ value: u, label: u })) },
});

// New value when the unit changes: a real px<->% conversion when a reference
// width is given (only min_width on a badge, where 100% = the default badge
// width), otherwise the number is kept and clamped into the new unit's range
// (card/em/rem have no fixed parent width to convert against).
const convertLengthValue = (value: number, from: string, to: string, ref?: number): number => {
  if (from === to) return value;
  if (ref && from === '%' && to === 'px') return Math.round((value / 100) * ref);
  if (ref && from === 'px' && to === '%') return Math.round((value / ref) * 100);
  return Math.min(value, LENGTH_MAX[to] ?? 500);
};

export { parseLength, serializeLength, lengthSliderSelector, lengthUnitSelector, convertLengthValue };
export type { ParsedLength };
