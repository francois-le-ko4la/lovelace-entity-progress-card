/*
 * The card's percentage math. Immutable on purpose: the whole input comes in
 * through the constructor, so no formula here can read what it was not given.
 */

// Grouped, not three flat fields: a null centerZero makes zeroValue and
// growthPercent unrepresentable rather than merely ignored.
type CenterZero = { zeroValue: number; growthPercent: boolean };

type ProgressInput = {
  min: number;
  max: number;
  current: number;
  decimal: number;
  reversed: boolean;
  scale: string;
  centerZero: CenterZero | null;
};

class ProgressMath {
  readonly #input: ProgressInput;

  constructor(input: ProgressInput) {
    this.#input = input;
  }

  // log(0)/log(negative) are undefined, and center_zero's two arms have no log
  // equivalent: both fall back to linear rather than producing NaN.
  get isLogScale(): boolean {
    const { scale, centerZero, min, max } = this.#input;
    return scale === 'log' && centerZero === null && min > 0 && max > min;
  }

  // Reversed measures the distance left to max instead of travelled from min.
  get actual(): number {
    const { reversed, max, current } = this.#input;
    return reversed ? max - current : current;
  }

  get range(): number {
    const { centerZero, min, max, current } = this.#input;
    return centerZero === null ? max - min : this.#halfRangeFor(centerZero, current);
  }

  get isValid(): boolean {
    return this.range !== 0;
  }

  get correctedValue(): number {
    const { centerZero, min, current } = this.#input;
    return centerZero === null ? this.actual - min : current - centerZero.zeroValue;
  }

  // null when the range is degenerate (min === max, or a zero-width arm):
  // there is no percentage to speak of, which is not the same as 0%.
  get percent(): number | null {
    if (!this.isValid) return null;
    const { centerZero, current, decimal } = this.#input;
    return Number(this.percentFor(centerZero === null ? this.actual : current).toFixed(decimal));
  }

  // growth_percent's own number: the change relative to the zero point. A zero
  // point of 0 makes that ratio undefined, so the bar percentage stands in.
  get growthPercent(): number | null {
    if (!this.isValid) return null;
    const { centerZero, current, decimal } = this.#input;
    if (centerZero === null || centerZero.zeroValue === 0) return this.percent;
    return Number((((current - centerZero.zeroValue) / centerZero.zeroValue) * 100).toFixed(decimal));
  }

  /** Where `value` lands on the bar, in percent. Unclamped on purpose. */
  percentFor(value: number): number {
    const { centerZero, min, max } = this.#input;
    if (centerZero !== null) {
      const halfRange = this.#halfRangeFor(centerZero, value);
      return halfRange === 0 ? 0 : ((value - centerZero.zeroValue) / halfRange) * 100;
    }
    if (this.isLogScale) {
      // Clamped to min before the log: a below-range value would otherwise give
      // NaN/-Infinity instead of the "0%, let CSS clamp it" a linear scale gives.
      const clamped = Math.max(value, min);
      return ((Math.log(clamped) - Math.log(min)) / (Math.log(max) - Math.log(min))) * 100;
    }
    const fullRange = max - min;
    return fullRange === 0 ? 0 : ((value - min) / fullRange) * 100;
  }

  // What a percentage is allowed to be on this bar. Static because the
  // Jinja path clamps a pushed number with no input to build (cards.ts's
  // _managePercent). The fill is translateX-based, so it does not self-clamp:
  // past the bounds it overshoots the container and the bar draws a gap.
  static clampPercent(percent: number, centerZero: boolean): number {
    return centerZero ? Math.max(-100, Math.min(100, percent)) : Math.max(0, Math.min(100, percent));
  }

  // A threshold on the bar's own 0-100 scale: center_zero's percent runs
  // -100..100, a mark's position does not, hence the halving and re-centering.
  watermarkFor(value: number): number {
    const percent = this.percentFor(value);
    return this.#input.centerZero === null ? percent : 50 + percent / 2;
  }

  // Which arm a value sits on, and how wide it is. Asked for the current value
  // by `range`, and for whatever is being projected by percentFor - a
  // watermark is not the current value.
  #halfRangeFor(centerZero: CenterZero, value: number): number {
    const { min, max } = this.#input;
    return value >= centerZero.zeroValue ? max - centerZero.zeroValue : centerZero.zeroValue - min;
  }
}

export { ProgressMath };
export type { ProgressInput };
