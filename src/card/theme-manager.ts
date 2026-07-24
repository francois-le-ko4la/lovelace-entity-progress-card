/*
 * ThemeManager: resolves a theme/custom_theme into icon/bar colors and the
 * segment/rainbow bar gradients.
 */

import { CARD, CARD_CONTEXT, HA_CONTEXT, THEME } from '../utils/parameters.js';
import { assertDefined, has, is } from '../utils/common-checks.js';
import { traceInstance } from '../utils/log.js';

// Theme "zones" come from either the built-in THEME table (parameters.ts) or
// a user's custom_theme YAML array - both are arrays of { min?, max?, color?,
// icon_color?, bar_color?, icon? } with slightly different optional fields
// (built-in entries always set icon/color, possibly to null; custom_theme
// zones may omit any of them), unified here rather than as two interfaces.
type ThemeZone = {
  min?: number;
  max?: number;
  color?: string | null;
  icon_color?: string;
  bar_color?: string;
  icon?: string | null;
};

/**
 * Manages the theme and its associated icon and color based on a percentage
 * value.
 */
class ThemeManager {
  #theme: string | null = null;
  #icon: string | null = null;
  #iconColor: string | null = null;
  #barColor: string | null = null;
  #value = 0;
  #isValid = false;
  #isLinear = false;
  #isBasedOnPercentage = false;
  #isCustomTheme = false;
  #currentStyle: ThemeZone[] | null = null;
  #interpolate = false;

  constructor() {
    traceInstance(this, CARD_CONTEXT.debug.instances);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set theme(newTheme: unknown) {
    if (is.nullish(newTheme) || !has.validKey(THEME, newTheme)) {
      this.#reset();
      return;
    }
    this.#isValid = true;
    this.#theme = newTheme;
    this.#currentStyle = THEME[newTheme as keyof typeof THEME].style;
    this.#isLinear = THEME[newTheme as keyof typeof THEME].linear;
    this.#isBasedOnPercentage = THEME[newTheme as keyof typeof THEME].percent;
  }

  get theme(): string | null {
    return this.#theme;
  }

  // Only a presence/shape check: per-zone validity (numeric min < max, sorted)
  // is already guaranteed by the schema's customTheme validator, the sole path
  // a config reaches here through — see BaseConfigHelper.set config.
  set customTheme(newTheme: unknown) {
    if (!is.nonEmptyArray(newTheme)) return;
    this.#theme = CARD.theme.default;
    this.#currentStyle = newTheme as ThemeZone[];
    this.#isValid = true;
    this.#isLinear = false;
    this.#isCustomTheme = true;
  }

  get customTheme(): ThemeZone[] | null {
    return this.#currentStyle;
  }

  get isLinear(): boolean {
    return this.#isLinear;
  }

  get isBasedOnPercentage(): boolean {
    return this.#isBasedOnPercentage;
  }

  get isCustomTheme(): boolean {
    return this.#isCustomTheme;
  }

  get isValid(): boolean {
    return this.#isValid;
  }

  set value(newValue: number) {
    this.#value = newValue;
    this.#refresh();
  }

  get value(): number {
    return this.#value;
  }

  get icon(): string | null {
    return this.#icon;
  }

  get iconColor(): string | null {
    return this.#iconColor;
  }

  get barColor(): string | null {
    return this.#barColor;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  configure({ theme, customTheme, interpolate }: { theme: unknown; customTheme: unknown; interpolate: unknown }) {
    this.theme = theme;
    this.customTheme = customTheme;
    this.#interpolate = Boolean(interpolate);
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  #reset() {
    this.#icon = null;
    this.#barColor = null;
    this.#iconColor = null;
    this.#theme = null;
    this.#currentStyle = null;
    this.#value = 0;
    this.#isValid = false;
    this.#isLinear = false;
    this.#isBasedOnPercentage = false;
    this.#isCustomTheme = false;
    this.#interpolate = false;
  }

  #refresh() {
    if (!this.#isValid) return;
    const applyStyle = this.isLinear ? this.#setLinearStyle : this.#setStyle;
    applyStyle.call(this);
  }

  #setLinearStyle() {
    // #refresh() only calls this when #isValid is true, which is only ever
    // set alongside #currentStyle (see theme/customTheme setters).
    const style = assertDefined(this.#currentStyle, 'ThemeManager.#setLinearStyle called with no #currentStyle');
    const lastStep = style.length - 1;
    const thresholdSize = CARD.config.value.max / lastStep;
    const percentage = Math.max(0, Math.min(this.#value, CARD.config.value.max));
    const index = Math.min(Math.floor(percentage / thresholdSize), lastStep);
    const ratio = (percentage - index * thresholdSize) / thresholdSize;
    this.#applyColors(style[index], style[index + 1] ?? null, ratio);
  }

  #setStyle() {
    const style = assertDefined(this.#currentStyle, 'ThemeManager.#setStyle called with no #currentStyle');
    let themeData: ThemeZone | null = null;
    let nextThemeData: ThemeZone | null = null;
    let ratio = 0;

    if (this.#value >= (style[style.length - 1].max ?? Infinity)) {
      themeData = style[style.length - 1];
    } else if (this.#value < (style[0].min ?? -Infinity)) {
      themeData = style[0];
    } else {
      // custom_theme zones no longer have to tile perfectly (gaps are
      // tolerated), so a value can land in a gap between two of them —
      // themeData then stays null and #applyColors disengages the theme for
      // this render, deferring to whatever color source is next in priority
      // (see CardView.iconColor/barColor).
      const index = style.findIndex(
        (level) => this.#value >= (level.min ?? -Infinity) && this.#value < (level.max ?? Infinity),
      );
      if (index !== -1) {
        themeData = style[index];
        nextThemeData = style[index + 1] ?? null;
        ratio = (this.#value - (themeData.min ?? 0)) / ((themeData.max ?? 0) - (themeData.min ?? 0));
      }
    }

    this.#applyColors(themeData, nextThemeData, ratio);
  }

  #applyColors(themeData: ThemeZone | null, nextThemeData: ThemeZone | null, ratio: number) {
    if (!themeData) {
      this.#icon = null;
      this.#iconColor = null;
      this.#barColor = null;
      return;
    }
    this.#icon = themeData.icon || null;

    if (this.#interpolate && nextThemeData) {
      const color = ThemeManager.#interpolateColor(
        ThemeManager.adaptColor(themeData.icon_color || themeData.color || null),
        ThemeManager.adaptColor(nextThemeData.icon_color || nextThemeData.color || null),
        ratio,
      );
      const barColor = ThemeManager.#interpolateColor(
        ThemeManager.adaptColor(themeData.bar_color || themeData.color || null),
        ThemeManager.adaptColor(nextThemeData.bar_color || nextThemeData.color || null),
        ratio,
      );
      this.#iconColor = color;
      this.#barColor = barColor;
    } else {
      this.#iconColor = ThemeManager.adaptColor(themeData.icon_color || themeData.color || null);
      this.#barColor = ThemeManager.adaptColor(themeData.bar_color || themeData.color || null);
    }
  }

  static #interpolateColor(from: string | null, to: string | null, ratio: number): string | null {
    if (!from || !to) return null;
    const pct = Math.round(ratio * 100);
    return `color-mix(in srgb, ${to} ${pct}%, ${from})`; // from/to déjà adaptés
  }
  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  static adaptColor(curColor: string | null): string | null {
    return HA_CONTEXT.haColors.get(curColor as string) ?? curColor;
  }

  // `window` is the [start, end] slice of the theme's own 0-100 scale (the
  // full min_value/max_value range) that this call represents - defaults to
  // the whole scale for the normal, non-center_zero single-arm bar. A
  // center_zero arm only ever covers part of that scale (zeroValue..max for
  // the positive arm, zeroValue..min for the negative one, see
  // ViewBase.themeDivergingGradient) - passing that sub-range here reprojects
  // just the zones that fall inside it onto the arm's own local 0-100%,
  // exactly the same idea as EntityCollectionHelper.getDivergingGradients
  // scoping bar_stack's magnitude math to each arm's own half-range. `start`
  // and `end` don't have to be in ascending order: the negative arm's window
  // is (zeroPercent, 0) - local 0% at the arm's empty edge (near center),
  // local 100% at its full edge (at the scale's own 0%/min) - deliberately
  // reversed from the positive arm's (zeroPercent, 100), since the arm grows
  // toward the opposite end of the scale.
  // `valueRange` is the bar's own min_value/max_value - needed to convert a
  // non-percentage theme's zone bounds (e.g. THEME.temperature's -50..100,
  // real degrees, `percent: false`) into the same 0-100% space fillPercent
  // and `window` already use. Without this, a value-based theme's zones were
  // compared directly against fillPercent as if they were already
  // percentages - meaningless for any theme whose bounds aren't already in
  // 0-100 (isBasedOnPercentage catches this correctly for the icon/bar color
  // in #setStyle already; buildGradient just never consulted it before).
  buildGradient(
    fillPercent: number,
    mode: string,
    defaultColor: string | null = null,
    isVertical = false,
    window: [number, number] = [0, 100],
    valueRange: { min: number; max: number } | null = null,
  ) {
    const currentStyle = this.#currentStyle;
    if (!this.#isValid || !currentStyle || mode === 'auto') return null;
    if (!(fillPercent > 0)) return null;

    // For linear themes, derive min/max boundaries by splitting 0–100% equally
    // (already percentage-based by construction, no further conversion needed).
    const toValuePercent = (v: number) =>
      !this.#isLinear && !this.#isBasedOnPercentage && valueRange && valueRange.max !== valueRange.min
        ? ((v - valueRange.min) / (valueRange.max - valueRange.min)) * 100
        : v;
    const fullStyle: ThemeZone[] = this.#isLinear
      ? currentStyle.map((level, i, arr) => ({
          ...level,
          min: (i / arr.length) * 100,
          max: ((i + 1) / arr.length) * 100,
        }))
      : currentStyle.map((level) => ({
          ...level,
          min: toValuePercent(level.min ?? 0),
          max: toValuePercent(level.max ?? 100),
        }));

    const [windowStart, windowEnd] = window;
    // A degenerate window (center_zero_value pinned exactly to min/max, so
    // one arm has zero range) would otherwise divide by zero here - the
    // fillPercent > 0 guard above already keeps this unreachable today (that
    // arm's fill is 0 whenever its window collapses), but this stays correct
    // independently of that invariant holding.
    if (windowEnd === windowStart) return null;
    const toLocal = (globalPct: number) => ((globalPct - windowStart) / (windowEnd - windowStart)) * 100;
    const style: ThemeZone[] = fullStyle
      .map((level) => {
        const a = toLocal(level.min ?? 0);
        const b = toLocal(level.max ?? 100);
        return { ...level, min: Math.max(0, Math.min(a, b)), max: Math.min(100, Math.max(a, b)) };
      })
      .filter((level) => (level.max ?? 0) > (level.min ?? 0));

    const visible = style.filter((level) => (level.min ?? 0) < fillPercent);
    if (visible.length === 0) return null;

    // Inner element uses translateX((value-1)*100%), shifted left by
    // (100-fillPercent)%. A zone boundary at container position B → element
    // position B + offset. vertical-bar uses the exact same formula on
    // translateY instead (see the CSS on .vertical-bar .inner) - only the
    // gradient's own direction needs to follow, not this math.
    const offset = 100 - fillPercent;
    const toElemPos = (b: number) => `${(b + offset).toFixed(2)}%`;
    const direction = isVertical ? 'to top' : 'to right';
    // color is optional per zone now (see types.customTheme) — a color-less
    // zone falls back the same way iconColor/barColor already do: the entity's
    // own negotiated color (e.g. a cover is pink open / grey closed, see
    // EntityHelper.defaultColor), then the card's generic default, rather than
    // a flat neutral for every domain.
    const col = (level: ThemeZone) =>
      ThemeManager.adaptColor(level.bar_color || level.color || null) || defaultColor || CARD.style.color.default;

    if (mode === 'segment') {
      const stops = visible.flatMap((level, i) => {
        const start = i === 0 ? '0%' : toElemPos(level.min ?? 0);
        const end = (level.max ?? 0) >= fillPercent ? '100%' : toElemPos(level.max ?? 0);
        return [`${col(level)} ${start}`, `${col(level)} ${end}`];
      });
      return `linear-gradient(${direction}, ${stops.join(', ')})`;
    }

    if (mode === 'rainbow') {
      const first = col(visible[0]);
      const stops = [`${first} 0%`];
      if (offset > 0) stops.push(`${first} ${offset.toFixed(2)}%`);
      // A stop at each zone's own midpoint rather than its start: the first
      // zone gets to hold its own color through half its width instead of
      // fading from the very first instant, matching the qualitative shape
      // (hold, then fade) every other zone already gets one way or another -
      // no hard cut, and two same-colored zones back to back (see the
      // critical_when_* theme splits) naturally hold flat between their
      // midpoints. The last visible zone is only ever partially filled, so
      // its midpoint uses fillPercent instead of its (not yet reached) max.
      visible.forEach((level, i) => {
        const start = level.min ?? 0;
        const end = i === visible.length - 1 ? fillPercent : (level.max ?? 100);
        stops.push(`${col(level)} ${toElemPos((start + end) / 2)}`);
      });
      stops.push(`${col(visible[visible.length - 1])} 100%`);
      return `linear-gradient(${direction}, ${stops.join(', ')})`;
    }

    return null;
  }
}

export { ThemeManager };
