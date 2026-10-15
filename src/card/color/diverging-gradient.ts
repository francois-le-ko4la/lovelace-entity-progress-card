import { type ThemeManager } from './theme-manager.js';

// Shared by ViewBase.themeDivergingGradient/ViewCore's own
// templateThemeDivergingGradient below - center_zero's two independent
// per-arm theme gradients, differing only in how each resolves its own
// window/valueRange/defaultColor.
const buildDivergingGradient = (params: {
  theme: ThemeManager;
  signedPercent: number;
  mode: string;
  defaultColor: string | null;
  isVertical: boolean;
  isSegmented: boolean;
  posWindow: [number, number];
  negWindow: [number, number];
  valueRange: { min: number; max: number } | null;
}) => {
  const { theme, signedPercent, mode, defaultColor, isVertical, isSegmented, posWindow, negWindow, valueRange } =
    params;
  // Capped at 100, not just floored at 0 - a raw/Jinja percent isn't bounded
  // the way ProgressMath's own division is; posSize/negSize feed
  // --stack-size-pos/-neg directly, and a value above 1 there pushes the
  // fill past .half's own overflow: hidden instead of just filling it.
  const posFill = Math.min(100, Math.max(0, signedPercent));
  const negFill = Math.min(100, Math.max(0, -signedPercent));
  // A percent-scaled theme reads each arm's own 0-100%: the positive arm shows
  // its zones as they are, the negative one sits below the first zone.
  const perArm = theme.isPercentScaled;
  const posGradient = theme.buildGradient(posFill, mode, {
    defaultColor,
    isVertical,
    window: perArm ? [0, 100] : posWindow,
    valueRange,
    isSegmented,
  });
  const negGradient = perArm
    ? theme.buildFloorGradient(negFill, mode, defaultColor)
    : theme.buildGradient(negFill, mode, { defaultColor, isVertical, window: negWindow, valueRange, isSegmented });
  if (!posGradient && !negGradient) return null;
  return { posGradient, negGradient, posSize: posFill / 100, negSize: negFill / 100 };
};

export { buildDivergingGradient };
