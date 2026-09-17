// Editor "duration field" (number+unit) for peak_marker.window (schema.ts's
// types.duration) - same split as length.ts, minus the calc()/custom fallback.

import { CARD } from './parameters.js';

type DurationUnit = 's' | 'min' | 'h' | 'd';
type ParsedDuration = { value: number; unit: DurationUnit };

// h and d span the whole window _fetchHistory allows - derived from its own
// cap rather than mirrored, so the two cannot drift. s and min stop where they
// stop meaning anything instead: the same derivation gave seconds a slider of
// 604800 positions, and under ~10s a window holds no state change at all, so
// min, max and average collapse onto the current value.
const derivedMax = (unit: DurationUnit) =>
  Math.floor(CARD.config.history.maxWindowSeconds / CARD.config.duration.secondsPerUnit[unit]);
const DURATION_RANGE: Record<DurationUnit, { min: number; max: number }> = {
  s: { min: 10, max: 300 },
  min: { min: 1, max: 180 },
  h: { min: 1, max: derivedMax('h') },
  d: { min: 1, max: derivedMax('d') },
};
const DURATION_RE = /^(\d+(?:\.\d+)?)(s|min|h|d)$/;

const parseDuration = (raw: unknown): ParsedDuration => {
  const match = typeof raw === 'string' ? raw.match(DURATION_RE) : null;
  return match ? { value: parseFloat(match[1]), unit: match[2] as DurationUnit } : { value: 2, unit: 'h' };
};

// Always a valid string, never unset (unlike length's 0px) - peak_marker.
// window is required once the section is on. Rounded: the slider steps by 1.
const serializeDuration = (value: number, unit: string): string => `${Math.max(1, Math.round(value))}${unit}`;

const durationSliderSelector = (unit: string): Record<string, unknown> => {
  const range = DURATION_RANGE[unit as DurationUnit] ?? DURATION_RANGE.h;
  return { number: { ...range, step: 1, mode: 'slider' } };
};

export { parseDuration, serializeDuration, durationSliderSelector };
