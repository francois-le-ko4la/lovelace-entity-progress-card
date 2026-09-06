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

  // Only true for a signed built-in theme (e.g. critical_when_extreme_center)
  // - zones span -100..100 as one scale (ViewBase.themeDivergingGradient).
  // Not reset in set customTheme, same as isBasedOnPercentage above - custom
  // zones are never this shape.
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
    this.#iconColor = this.#resolveColor('icon_color', themeData, nextThemeData, ratio);
    this.#barColor = this.#resolveColor('bar_color', themeData, nextThemeData, ratio);
  }

  // Shared by #applyColors above - icon/bar only differ in which zone field
  // they read, both falling back to the zone's plain color.
  #resolveColor(
    key: 'icon_color' | 'bar_color',
    themeData: ThemeZone,
    nextThemeData: ThemeZone | null,
    ratio: number,
  ): string | null {
    const from = ThemeManager.adaptColor(themeData[key] || themeData.color || null);
    if (!this.#interpolate || !nextThemeData) return from;
    const to = ThemeManager.adaptColor(nextThemeData[key] || nextThemeData.color || null);
    return ThemeManager.#interpolateColor(from, to, ratio);
  }

  static #interpolateColor(from: string | null, to: string | null, ratio: number): string | null {
    if (!from || !to) return null;
    const pct = Math.round(ratio * 100);
    return `color-mix(in srgb, ${to} ${pct}%, ${from})`; // from/to already adapted
  }
  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  // Fill direction for every gradient: a vertical bar fills upward, a
  // horizontal one rightward; `reversed` mirrors both (center_zero's arm).
  static gradientDirection(isVertical: boolean, reversed = false): string {
    if (reversed) return isVertical ? 'to bottom' : 'to left';
    return isVertical ? 'to top' : 'to right';
  }

  static adaptColor(curColor: string | null): string | null {
    return HA_CONTEXT.haColors.get(curColor as string) ?? curColor;
  }

  // Splits a resolved color into the r/g/b/h/s/l components styles.ts's
  // label calc() math needs. Canvas, not a regex: interpolate: true's
  // color-mix() stays unresolved in a computed-style readback, so
  // getImageData is what actually evaluates it to concrete bytes.
  static #probeCtx: CanvasRenderingContext2D | null = null;
  static #UNRESOLVED_SENTINEL = '#010203'; // a color this project never produces

  static labelColorComponents(
    computedColor: string,
  ): { r: number; g: number; b: number; h: number; s: number; l: number } | null {
    ThemeManager.#probeCtx ??= document.createElement('canvas').getContext('2d');
    const ctx = ThemeManager.#probeCtx;
    if (!ctx) return null;
    // Canvas drops an invalid fillStyle silently, so a surviving sentinel is
    // the only way to tell a bad color apart from one that resolved.
    ctx.fillStyle = ThemeManager.#UNRESOLVED_SENTINEL; // skipcq: JS-W1032 - the pair IS the probe
    ctx.fillStyle = computedColor;
    if (ctx.fillStyle === ThemeManager.#UNRESOLVED_SENTINEL) return null;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
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

  // `window`: [start,end] slice of the theme's 0-100 scale in view - a
  // center_zero arm passes its own half (ViewBase.themeDivergingGradient),
  // reversed for the negative arm. `valueRange`: the bar's own min/max, not
  // the theme's - projects a raw-value theme's zone bounds onto the same
  // 0-100% scale fillPercent uses (else compared as if already %, #129).
  buildGradient(
    fillPercent: number,
    mode: string,
    {
      defaultColor = null,
      isVertical = false,
      window = [0, 100],
      valueRange = null,
      isSegmented = false,
    }: {
      defaultColor?: string | null;
      isVertical?: boolean;
      window?: [number, number];
      valueRange?: { min: number; max: number } | null;
      isSegmented?: boolean;
    } = {},
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

    // rainbow_full paints the whole window, not just up to fillPercent - the
    // value is a moving marker instead (.rainbow-full-bar, styles.ts), so it
    // skips the guard below. The window/toLocal/style computation right after
    // still applies to it (same center_zero per-arm windowing as segment/
    // rainbow).
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
      // A reversed window can invert local position order (e.g. temperature's
      // indigo ending up highest) - CSS gradient stops must be non-decreasing
      // or the browser clamps past an out-of-order one. Sorting keeps them
      // monotonic regardless of direction (no-op for a normal window).
      .sort((a, b) => (a.min ?? 0) - (b.min ?? 0));

    // A reversed window (center_zero's negative arm) mirrors the gradient's
    // own CSS direction instead of re-deriving the stop logic per direction.
    const isReversedWindow = windowEnd < windowStart;
    const direction = ThemeManager.gradientDirection(isVertical, isReversedWindow);

    // style is already windowed to this arm's own slice, so this works
    // identically for a single-arm bar and each of center_zero's two arms.
    if (mode === 'rainbow_full') {
      return ThemeManager.#buildFullRainbowGradient(style, defaultColor, direction);
    }

    const visible = style.filter((level) => (level.min ?? 0) < fillPercent);
    if (visible.length === 0) return null;

    // .inner reveals via translateX(-(100-fillPercent)%), so element position
    // = container position + offset (vertical-bar: same via translateY).
    // bar_segments has no .inner to shift - each cell windows this gradient
    // by its own true position, so offset is 0 there.
    const offset = isSegmented ? 0 : 100 - fillPercent;
    // '100%' below pins a stop to .inner's shifted edge (= fillPercent) -
    // segmented has no such edge, so it needs the real position instead.
    const filledEdge = isSegmented ? `${fillPercent.toFixed(2)}%` : '100%';

    if (mode === 'segment') {
      return ThemeManager.#buildSegmentGradient(visible, direction, defaultColor, offset, fillPercent, filledEdge);
    }
    if (mode === 'rainbow') {
      return ThemeManager.#buildRainbowGradient(visible, direction, defaultColor, offset, fillPercent, filledEdge);
    }
    return null;
  }

  // Shared by #buildSegmentGradient/#buildRainbowGradient/
  // #buildFullRainbowGradient below - a zone's own bar/color, falling back to
  // defaultColor then the plain default.
  static #zoneColor(level: ThemeZone, defaultColor: string | null): string {
    return ThemeManager.adaptColor(level.bar_color || level.color || null) || defaultColor || CARD.style.color.default;
  }

  // eslint-disable-next-line max-params -- private, single call site.
  static #buildSegmentGradient(
    visible: ThemeZone[],
    direction: string,
    defaultColor: string | null,
    offset: number,
    fillPercent: number,
    filledEdge: string,
  ): string {
    const toElemPos = (b: number) => `${(b + offset).toFixed(2)}%`;
    const col = (level: ThemeZone) => ThemeManager.#zoneColor(level, defaultColor);
    const stops = visible.flatMap((level, i) => {
      const start = i === 0 ? '0%' : toElemPos(level.min ?? 0);
      const end = (level.max ?? 0) >= fillPercent ? filledEdge : toElemPos(level.max ?? 0);
      return [`${col(level)} ${start}`, `${col(level)} ${end}`];
    });
    return `linear-gradient(${direction}, ${stops.join(', ')})`;
  }

  // Stops at each zone's midpoint, not its start - last one uses fillPercent.
  // eslint-disable-next-line max-params -- private, single call site.
  static #buildRainbowGradient(
    visible: ThemeZone[],
    direction: string,
    defaultColor: string | null,
    offset: number,
    fillPercent: number,
    filledEdge: string,
  ): string {
    const toElemPos = (b: number) => `${(b + offset).toFixed(2)}%`;
    const col = (level: ThemeZone) => ThemeManager.#zoneColor(level, defaultColor);
    const first = col(visible[0]);
    const stops = [`${first} 0%`];
    if (offset > 0) stops.push(`${first} ${offset.toFixed(2)}%`);
    visible.forEach((level, i) => {
      const start = level.min ?? 0;
      const end = i === visible.length - 1 ? fillPercent : (level.max ?? 100);
      stops.push(`${col(level)} ${toElemPos((start + end) / 2)}`);
    });
    stops.push(`${col(visible[visible.length - 1])} ${filledEdge}`);
    return `linear-gradient(${direction}, ${stops.join(', ')})`;
  }

  // rainbow_full's gradient: every zone in `style` laid out edge-to-edge,
  // same "hold, then fade" shape as 'rainbow' above, just unclipped by
  // fillPercent since the whole window is always shown. `style` is already
  // windowed and `direction` already accounts for a reversed window (shared
  // with segment/rainbow), so this needs no window/direction logic of its own.
  static #buildFullRainbowGradient(style: ThemeZone[], defaultColor: string | null, direction: string): string | null {
    if (style.length === 0) return null;

    const col = (level: ThemeZone) => ThemeManager.#zoneColor(level, defaultColor);
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
