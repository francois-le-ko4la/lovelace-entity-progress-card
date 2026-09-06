// Editor "duration field" (number+unit) for peak_marker.window (schema.ts's
// types.duration) - same split as length.ts, minus the calc()/custom fallback.

import { CARD } from './parameters.js';

type DurationUnit = 's' | 'min' | 'h' | 'd';
type ParsedDuration = { value: number; unit: DurationUnit };

// Each unit's max is the maxWindowSeconds equivalent - _fetchHistory's own
// cap, derived here rather than mirrored so the two can't drift apart.
const DURATION_MAX = Object.fromEntries(
  (['s', 'min', 'h', 'd'] as DurationUnit[]).map((unit) => [
    unit,
    Math.floor(CARD.config.history.maxWindowSeconds / CARD.config.duration.secondsPerUnit[unit]),
  ]),
) as Record<DurationUnit, number>;
const DURATION_RE = /^(\d+(?:\.\d+)?)(s|min|h|d)$/;

const parseDuration = (raw: unknown): ParsedDuration => {
  const match = typeof raw === 'string' ? raw.match(DURATION_RE) : null;
  return match ? { value: parseFloat(match[1]), unit: match[2] as DurationUnit } : { value: 2, unit: 'h' };
};

// Always a valid string, never unset (unlike length's 0px) - peak_marker.
// window is required once the section is on. Rounded: the slider steps by 1.
const serializeDuration = (value: number, unit: string): string => `${Math.max(1, Math.round(value))}${unit}`;

const durationSliderSelector = (unit: string): Record<string, unknown> => ({
  number: { min: 1, max: DURATION_MAX[unit as DurationUnit] ?? DURATION_MAX.h, step: 1, mode: 'slider' },
});

export { parseDuration, serializeDuration, durationSliderSelector };
