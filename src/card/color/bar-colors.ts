import { CARD } from '../../utils/parameters.js';
import { type Config } from '../../utils/types.js';
import { ThemeManager } from './theme-manager.js';
import { type EntityCollectionHelper } from '../values/entity-collection.js';
import { type Progress } from '../view/progress-display.js';
import { buildDivergingGradient } from './diverging-gradient.js';

type BarColorsDeps = {
  progress: () => Progress;
  theme: () => ThemeManager;
  collection: () => EntityCollectionHelper;
  config: () => Pick<Config, 'bar_color' | 'bar_color_mode'>;
  entityColor: () => string | null;
  fallbackColor: () => string;
  percent: () => number;
  isAvailable: () => boolean;
  isUnknown: () => boolean;
  hasCollection: () => boolean;
  isVertical: () => boolean;
  isSegmented: () => boolean;
  isRing: () => boolean;
};

type ArmWindows = [[number, number], [number, number]];

class BarColors {
  readonly #deps: BarColorsDeps;

  constructor(deps: BarColorsDeps) {
    this.#deps = deps;
  }

  get #isCenterZero(): boolean {
    return this.#deps.progress().input.centerZero !== null;
  }

  get #mode(): string {
    return this.#deps.config().bar_color_mode ?? 'auto';
  }

  #curBarColor(): string | null {
    const { theme, config, fallbackColor } = this.#deps;
    return ThemeManager.adaptColor(theme().barColor || config().bar_color || null) || fallbackColor();
  }

  get barColor(): string | null {
    const { isAvailable, isUnknown, hasCollection, collection, percent, progress, isVertical } = this.#deps;
    if (!isAvailable()) return isUnknown() ? CARD.style.color.default : CARD.style.color.disabled;
    const curColor = this.#curBarColor();
    // 'net' is one flat segment; center_zero stacks go through
    // divergingBarStack. This path owns the non-centered gradient only.
    return hasCollection() && collection().mode !== 'net' && !this.#isCenterZero
      ? collection().getEntitiesColor(
          curColor,
          percent() / 100,
          progress().input.max - progress().input.min,
          isVertical(),
        )
      : curColor;
  }

  // 'stacked'/'proportional' + center_zero: per-arm gradients; null when not
  // applicable, so callers know to clear the dedicated CSS variables.
  get divergingBarStack() {
    const { min, max, centerZero } = this.#deps.progress().input;
    if (!this.#deps.isAvailable() || !centerZero) return null;
    if (!this.#deps.hasCollection() || this.#deps.collection().mode === 'net') return null;
    return this.#deps
      .collection()
      .getDivergingGradients(
        this.#curBarColor(),
        { min, max, zeroValue: centerZero.zeroValue },
        this.#deps.isVertical(),
      );
  }

  get colorGradient(): string | null {
    const { isAvailable, isRing, progress, theme, entityColor, isVertical, isSegmented } = this.#deps;
    if (!isAvailable()) return null;
    if (this.#isCenterZero) return isRing() ? this.#ringDivergingGradient() : null;
    return theme().buildGradient(progress().math.percent ?? 0, this.#mode, {
      defaultColor: entityColor(),
      isVertical: isVertical(),
      valueRange: { min: progress().input.min, max: progress().input.max },
      isSegmented: isSegmented(),
      isRing: isRing(),
    });
  }

  // divergingBarStack's theme counterpart: one gradient per arm, null with no
  // active theme gradient. _updateCSS uses it only when the stack is null.
  get themeDivergingGradient() {
    const windows = this.#armWindows();
    if (!windows) return null;
    const { progress, theme, entityColor, isVertical, isSegmented } = this.#deps;
    const { min, max } = progress().input;
    const [posWindow, negWindow] = windows;
    return buildDivergingGradient({
      theme: theme(),
      signedPercent: progress().math.percent ?? 0,
      mode: this.#mode,
      defaultColor: entityColor(),
      isVertical: isVertical(),
      isSegmented: isSegmented(),
      posWindow,
      negWindow,
      valueRange: { min, max },
    });
  }

  // center_zero's two arms, each as a window over the min/max_value scale.
  #armWindows(): ArmWindows | null {
    const { min, max, centerZero } = this.#deps.progress().input;
    if (!this.#deps.isAvailable() || !centerZero || max === min) return null;
    // A signed theme already spans -100..100; a regular one mirrors its zones
    // onto each arm, windowed against zeroPercent.
    if (this.#deps.theme().isSigned)
      return [
        [0, 100],
        [0, -100],
      ];
    const zeroPercent = ((centerZero.zeroValue - min) / (max - min)) * 100;
    return [
      [zeroPercent, 100],
      [zeroPercent, 0],
    ];
  }

  // center_zero around the icon: one conic gradient over both arms.
  #ringDivergingGradient(): string | null {
    const windows = this.#armWindows();
    if (!windows) return null;
    const { min, max } = this.#deps.progress().input;
    return this.#deps.theme().buildRingDiverging(this.#mode, {
      defaultColor: this.#deps.entityColor(),
      posWindow: windows[0],
      negWindow: windows[1],
      valueRange: { min, max },
      perArm: this.#deps.theme().isPercentScaled,
    });
  }
}

export { BarColors };
