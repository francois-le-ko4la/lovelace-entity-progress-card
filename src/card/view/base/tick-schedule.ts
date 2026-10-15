import { CARD } from '../../../utils/parameters.js';
import { is } from '../../../utils/common-checks.js';
import { nextOnGrid, relativeAge } from '../../../utils/clock.js';
import { hasTimerOrFlexTimerUnit, type Progress } from '../progress-display.js';
import { type Reading } from '../../values/entity-helper.js';

type TickInputs = {
  isActiveTimer: boolean;
  reading: Reading;
  progress: Progress;
  peakSeeded: boolean;
  peakWindow: unknown;
  trendWindow: unknown;
  stateTimestamps: () => number[];
};

// A sliding window moves all the time: re-read once a minute, sooner if
// shorter.
const slideTickAt = (now: number, windowSeconds: unknown): number[] =>
  is.number(windowSeconds) ? [nextOnGrid(now, 0, Math.min(60000, windowSeconds * 1000))] : [];

// Its value turns on the timer's own clock: at each whole step for a
// countdown, which truncates, half a step in for any other number (rounds).
const timerTickAt = (now: number, { reading, progress }: TickInputs): number => {
  const timer = reading.kind === 'timer' ? reading : null;
  const startedAt = timer?.startedAt;
  const perUnitMs = progress.display.unit.value === CARD.config.unit.default ? ((timer?.max ?? 0) * 1000) / 100 : 1000;
  const step = perUnitMs / 10 ** progress.input.decimal;
  const origin = is.number(startedAt) ? startedAt : 0;
  // Not Math.max: an unreadable duration (NaN) still ticks by the second.
  return nextOnGrid(now, origin, step > 1000 ? step : 1000, hasTimerOrFlexTimerUnit(progress) ? 0 : 0.5);
};

const relativeTickAt = (now: number, stateTimestamps: number[]): number[] =>
  stateTimestamps.filter((since) => is.number(since)).map((since) => since + relativeAge(now - since).changesAtMs);

// The next instant something shown moves with no state change: a running
// timer's value, a relative time, a sliding window.
const nextTickAt = (now: number, inputs: TickInputs): number | null => {
  if (inputs.isActiveTimer) return timerTickAt(now, inputs);
  const deadlines = [
    ...(inputs.peakSeeded ? slideTickAt(now, inputs.peakWindow) : []),
    ...slideTickAt(now, inputs.trendWindow),
    ...relativeTickAt(now, inputs.stateTimestamps()),
  ];
  return deadlines.length > 0 ? Math.min(...deadlines) : null;
};

export { nextTickAt };
