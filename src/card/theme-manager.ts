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
  #isSigned = false;
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
    this.#isSigned = THEME[newTheme as keyof typeof THEME].signed;
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

  // Only ever true for a built-in theme with signed: true (e.g.
  // critical_when_extreme_center) - zones already span -100..100 as one
  // continuous scale, for center_zero's own signed percent (see
  // ViewBase.themeDivergingGradient). Not reset in set customTheme, same as
  // isBasedOnPercentage right above - a custom_theme's zones are real-value
  // ranges, never this shape.
  get isSigned(): boolean {
    return this.#isSigned;
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
    this.#isSigned = false;
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

  // label's pill ports GitHub Primer's IssueLabelToken dark-theme recipe
  // rather than a plain luminance-switched black/white pick: background
  // stays a translucent tint of the base color, border/text are the *same
  // hue*, lightened just enough to read on a dark background - dark/
  // saturated colors get lightened more, light ones barely move. The CSS
  // side does the actual calc() math (.status-label in styles.ts, same
  // formula as Primer's); this only splits the resolved color into the
  // r/g/b/h/s/l components that formula needs. The caller passes the
  // browser's computed rgb(...) readback, so this only ever parses one
  // format regardless of the original source (HA color name, hex, theme
  // zone, card_mod override).
  static labelColorComponents(
    computedRgb: string,
  ): { r: number; g: number; b: number; h: number; s: number; l: number } | null {
    const match = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(computedRgb);
    if (!match) return null;
    const [r, g, b] = match.slice(1, 4).map(Number);
    return { r, g, b, ...ThemeManager.#rgbToHsl(r, g, b) };
  }

  static #rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    const [rNorm, gNorm, bNorm] = [r / 255, g / 255, b / 255];
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const lightness = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l: Math.round(lightness * 100) };

    const delta = max - min;
    const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    let hue: number;
    switch (max) {
      case rNorm:
        hue = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        hue = (bNorm - rNorm) / delta + 2;
        break;
      default:
        hue = (rNorm - gNorm) / delta + 4;
    }
    return { h: Math.round(hue * 60), s: Math.round(saturation * 100), l: Math.round(lightness * 100) };
  }

  // `window` is the [start, end] slice of the theme's 0-100 scale this call
  // covers - defaults to the whole scale for a normal single-arm bar. A
  // center_zero arm only covers part of it (zeroValue..max / zeroValue..min,
  // see ViewBase.themeDivergingGradient); passing that sub-range reprojects
  // the zones inside it onto the arm's own local 0-100%. `start`/`end` don't
  // need ascending order: the negative arm's window is (zeroPercent, 0) -
  // reversed from the positive arm's (zeroPercent, 100), since it grows
  // toward the opposite end of the scale.
  // `valueRange` is the bar's own min_value/max_value - the visible scope a
  // non-percentage theme's zone bounds (e.g. temperature's -50..100) get
  // projected onto, converting them into the same 0-100% space fillPercent
  // already uses. Deliberately the bar's own scope, not the theme's full
  // range: by default only [0, max_value] is in view, widening min_value (or
  // center_zero) widens it accordingly. Without this, a value-based theme's
  // zones were compared directly against fillPercent as if already
  // percentages - meaningless for bounds not already 0-100.
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

    // rainbow_full always paints every zone across the whole current window,
    // not just "up to fillPercent" (the value is conveyed by a moving marker
    // instead, see .rainbow-full-bar in styles.ts) - so the fillPercent > 0
    // guard below doesn't apply to it. The window/toLocal/style computation
    // right after is still shared: it's what makes center_zero's two arms
    // each show only their own half of the theme, same as segment/rainbow.
    if (mode !== 'rainbow_full' && !(fillPercent > 0)) return null;

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
        const localMin = toLocal(level.min ?? 0);
        const localMax = toLocal(level.max ?? 100);
        return {
          ...level,
          min: Math.max(0, Math.min(localMin, localMax)),
          max: Math.min(100, Math.max(localMin, localMax)),
        };
      })
      .filter((level) => (level.max ?? 0) > (level.min ?? 0))
      // A reversed window (the negative arm's [zeroPercent, 0]) inverts
      // position order relative to currentStyle's value-ascending order -
      // e.g. temperature's indigo ends up at the highest local position. CSS
      // linear-gradient stops must be non-decreasing or the browser clamps
      // everything past an out-of-order stop into one flat color. Sorting by
      // local position (a no-op for the normal window) keeps stops
      // monotonic regardless of direction.
      .sort((a, b) => (a.min ?? 0) - (b.min ?? 0));

    // A reversed window (center_zero's negative arm) uses the opposite CSS
    // shift direction from every other case (styles.ts's `.negative` box
    // slides the other way, growing from center toward the low end) - its
    // "tip"/"anchor" land on the box's opposite edges from what toElemPos
    // assumes. Rather than re-deriving the stop-building logic per
    // direction, mirroring the gradient's CSS direction achieves the same
    // result, reflected (verified against concrete pixel math, issue #129
    // follow-up). Hoisted above the mode branches - both need it.
    const isReversedWindow = windowEnd < windowStart;
    const direction = isReversedWindow ? (isVertical ? 'to bottom' : 'to left') : isVertical ? 'to top' : 'to right';

    // rainbow_full: every zone in the current window, laid out edge-to-edge -
    // unlike segment/rainbow just below, not clipped to "up to fillPercent"
    // (the whole window is always shown - see .rainbow-full-bar in
    // styles.ts). `style` is already windowed/clamped to this arm's own
    // slice (center_zero's [zeroPercent, 100]/[zeroPercent, 0]), so this
    // works identically for a single-arm bar and each of center_zero's two.
    if (mode === 'rainbow_full') {
      return ThemeManager.#buildFullRainbowGradient(style, defaultColor, direction);
    }

    const visible = style.filter((level) => (level.min ?? 0) < fillPercent);
    if (visible.length === 0) return null;

    // Inner element uses translateX((value-1)*100%), shifted left by
    // (100-fillPercent)%. A zone boundary at container position B → element
    // position B + offset. vertical-bar uses the exact same formula on
    // translateY instead (see the CSS on .vertical-bar .inner) - only the
    // gradient's own direction needs to follow, not this math.
    const offset = 100 - fillPercent;
    const toElemPos = (b: number) => `${(b + offset).toFixed(2)}%`;
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
      // A stop at each zone's midpoint, not its start: the first zone holds
      // its color through half its width instead of fading from the first
      // instant, matching the "hold, then fade" shape every other zone gets.
      // Two same-colored zones back to back (critical_when_* splits)
      // naturally hold flat between their midpoints. The last visible zone
      // is only partially filled, so its midpoint uses fillPercent instead
      // of its not-yet-reached max.
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

  // rainbow_full's gradient: every zone in `style` laid out edge-to-edge,
  // same "hold, then fade" shape as 'rainbow' above, just unclipped by
  // fillPercent since the whole window is always shown. `style` is already
  // windowed and `direction` already accounts for a reversed window (shared
  // with segment/rainbow), so this needs no window/direction logic of its own.
  static #buildFullRainbowGradient(style: ThemeZone[], defaultColor: string | null, direction: string): string | null {
    if (style.length === 0) return null;

    const col = (level: ThemeZone) =>
      ThemeManager.adaptColor(level.bar_color || level.color || null) || defaultColor || CARD.style.color.default;
    const first = col(style[0]);
    const last = col(style[style.length - 1]);
    const stops = [`${first} 0%`];
    style.forEach((level) => {
      const mid = ((level.min ?? 0) + (level.max ?? 100)) / 2;
      stops.push(`${col(level)} ${mid.toFixed(2)}%`);
    });
    stops.push(`${last} 100%`);
    return `linear-gradient(${direction}, ${stops.join(', ')})`;
  }
}

export { ThemeManager };
