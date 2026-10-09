/*
 * What the bar's value reads as: the unit, timer and locale formatting applied
 * to a ProgressMath answer. Pure functions over an immutable Progress.
 */

import { CARD } from '../utils/parameters.js';
import { HassProviderSingleton } from '../utils/hass-provider.js';
import { NumberFormatter } from './formatting.js';
import { ProgressMath, type ProgressInput } from './progress-math.js';
import type { UnitHelper } from './value-primitives.js';

type ProgressDisplay = {
  unit: UnitHelper;
  isTimer: boolean;
  unitSpacing: string;
  unitPosition: string;
  compact: boolean;
  sign: boolean;
};

type Progress = { input: ProgressInput; math: ProgressMath; display: ProgressDisplay };

const hasTimerUnit = ({ display }: Progress): boolean => display.isTimer && display.unit.isTimerUnit;

const hasFlexTimerUnit = ({ display }: Progress): boolean => display.isTimer && display.unit.isFlexTimerUnit;

const hasTimerOrFlexTimerUnit = (progress: Progress): boolean => hasTimerUnit(progress) || hasFlexTimerUnit(progress);

function processedValue({ input, math, display }: Progress): number | null {
  if (display.unit.value !== CARD.config.unit.default) return math.actual;
  return input.centerZero?.growthPercent ? math.growthPercent : math.percent;
}

function valueForThemes(
  { math, display }: Progress,
  isCustomTheme: boolean,
  valueBasedOnPercentage: boolean,
): number | null {
  let value = math.actual;
  if (isCustomTheme) return value;
  const unit = display.unit.value;
  if (unit === CARD.config.unit.fahrenheit) value = ((value - 32) * 5) / 9;
  return valueBasedOnPercentage || [CARD.config.unit.default, CARD.config.unit.disable].includes(unit)
    ? math.percent
    : value;
}

function formatProgress(progress: Progress): string {
  const { input, math, display } = progress;
  if (!math.isValid) return 'Div0';
  const hass = HassProviderSingleton.getInstance();
  if (hasTimerOrFlexTimerUnit(progress))
    return NumberFormatter.formatTiming(math.actual, input.decimal, {
      locale: hass.numberFormat,
      language: hass.language,
      flex: hasFlexTimerUnit(progress),
      unitSpacing: display.unitSpacing,
    });
  return NumberFormatter.formatValueAndUnit(processedValue(progress), input.decimal, display.unit.value, {
    locale: hass.numberFormat,
    language: hass.language,
    unitSpacing: display.unitSpacing,
    compact: display.compact,
    sign: display.sign,
    unitPosition: display.unitPosition,
  });
}

export { formatProgress, hasFlexTimerUnit, hasTimerOrFlexTimerUnit, hasTimerUnit, processedValue, valueForThemes };
export type { Progress, ProgressDisplay };
