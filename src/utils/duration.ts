// Editor "duration field" (number+unit) for peak_marker.window (schema.ts's
// types.duration) - same split as length.ts, minus the calc()/custom fallback.

type DurationUnit = 's' | 'min' | 'h' | 'd';
type ParsedDuration = { value: number; unit: DurationUnit };

// Each unit's max is the 7-day equivalent (CARD.config.history.
// maxWindowSeconds) - _fetchHistory's own cap, never silently exceeded here.
const DURATION_MAX: Record<DurationUnit, number> = { s: 604800, min: 10080, h: 168, d: 7 };
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
