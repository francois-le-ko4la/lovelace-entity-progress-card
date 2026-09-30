// When what a card shows next changes with time alone - the local tick's
// deadlines, and the relative-time reading they follow.

// The first instant after `now` on the grid origin + (k + phase) × step.
const nextOnGrid = (now: number, origin: number, step: number, phase = 0): number =>
  origin + (Math.floor((now - origin) / step - phase) + 1 + phase) * step;

const RELATIVE_UNITS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: 'year', seconds: 31536000 },
  { unit: 'month', seconds: 2592000 },
  { unit: 'day', seconds: 86400 },
  { unit: 'hour', seconds: 3600 },
  { unit: 'minute', seconds: 60 },
  { unit: 'second', seconds: 1 },
];

// How an age reads - seconds truncated, larger units rounded, a timestamp ahead
// of the browser's clock as none - and the age at which that reading changes.
const relativeAge = (ageMs: number): { value: number; unit: Intl.RelativeTimeFormatUnit; changesAtMs: number } => {
  const age = Math.max(0, ageMs);
  const found = RELATIVE_UNITS.findIndex(({ seconds }) => age >= seconds * 1000);
  const index = found === -1 ? RELATIVE_UNITS.length - 1 : found;
  const { unit, seconds } = RELATIVE_UNITS[index];
  const stepMs = seconds * 1000;
  const truncated = unit === 'second';
  const nextUnit = index > 0 ? RELATIVE_UNITS[index - 1].seconds * 1000 : Infinity;
  return {
    value: truncated ? Math.floor(age / stepMs) : Math.round(age / stepMs),
    unit,
    changesAtMs: Math.min(nextOnGrid(age, 0, stepMs, truncated ? 0 : 0.5), nextUnit),
  };
};

export { nextOnGrid, relativeAge };
