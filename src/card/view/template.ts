import { type LovelaceConfig, type Config } from '../../utils/types.js';
import { ThemeManager } from '../color/theme-manager.js';
import { TemplateConfigHelper, BadgeTemplateConfigHelper } from '../config/config-helpers.js';
import { ViewCore } from './core.js';
import { buildDivergingGradient } from '../color/diverging-gradient.js';

// What a Template view adds over ViewCore: its percent-based theme and the
// last color Jinja pushes, which cards/template-base.ts writes straight to CSS.
abstract class TemplateViewBase extends ViewCore<null> {
  icon: string | null = null;
  #templateTheme = new ThemeManager();
  #templateColorValue: string | null = null;
  #templateBarColorValue: string | null = null;

  set config(config: LovelaceConfig) {
    super.config = config;
    this.#templateColorValue = null;
    this.#templateBarColorValue = null;
  }

  get config(): Config {
    return super.config;
  }

  // Theme, then color, then the entity: unlike ViewBase, the user's Jinja can
  // test availability itself. Read on every repaint, not only after a push.
  get barColor(): string | null {
    if (this._configHelper.config.theme) return ThemeManager.adaptColor(this.templateThemeBarColor);
    if (this._configHelper.config.bar_color) return this.#templateBarColorValue;
    return this.entity ? this._getEntityColor() : null;
  }

  get iconColor(): string | null {
    if (this._configHelper.config.theme) return ThemeManager.adaptColor(this.templateThemeIconColor);
    if (this._configHelper.config.color) return this.#templateColorValue;
    return this.entity ? this._getEntityColor() : null;
  }

  setTemplateColorValue(value: string | null) {
    this.#templateColorValue = value;
  }

  setTemplateBarColorValue(value: string | null) {
    this.#templateBarColorValue = value;
  }

  // Only reached from _managePercent's `if (config.theme)` branch. The value
  // stays memoized, so a plain hass update repaints the themed color.
  setTemplateThemeValue(percent: number) {
    this.#templateTheme.value = percent;
  }

  // Re-resolved on every read: battery_adaptive can flip with isBatteryCharging
  // while the percent holds steady.
  #refreshTemplateTheme() {
    this.#templateTheme.configure({ theme: this.resolvedTheme, customTheme: undefined, interpolate: false });
  }

  // null when no theme is configured.
  get templateThemeIconColor(): string | null {
    this.#refreshTemplateTheme();
    return this.#templateTheme.iconColor;
  }

  get templateThemeBarColor(): string | null {
    this.#refreshTemplateTheme();
    return this.#templateTheme.barColor;
  }

  // The gradient twin of ViewBase.colorGradient; center_zero has its own below.
  get templateThemeGradient(): string | null {
    if (!this._configHelper.config.theme || this._configHelper.config.center_zero) return null;
    this.#refreshTemplateTheme();
    return this.#templateTheme.buildGradient(
      this.#templateTheme.value,
      this._configHelper.config.bar_color_mode ?? 'auto',
      {
        isVertical: this.isVerticalBar,
        isSegmented: this.isSegmented,
        isRing: this.isRing,
      },
    );
  }

  // No min_value/max_value to derive a zeroPercent from: percent is -100..100
  // under center_zero, so zero sits at 50 (a signed theme spans -100..100).
  get templateThemeDivergingGradient() {
    if (!this._configHelper.config.theme || !this._configHelper.config.center_zero) return null;
    this.#refreshTemplateTheme();
    const mode = this._configHelper.config.bar_color_mode ?? 'auto';
    const [posWindow, negWindow]: [[number, number], [number, number]] = this.#templateTheme.isSigned
      ? [
          [0, 100],
          [0, -100],
        ]
      : [
          [50, 100],
          [50, 0],
        ];
    return buildDivergingGradient({
      theme: this.#templateTheme,
      signedPercent: this.#templateTheme.value,
      mode,
      defaultColor: null,
      isVertical: this.isVerticalBar,
      isSegmented: this.isSegmented,
      posWindow,
      negWindow,
      valueRange: null,
    });
  }
}

class CardTemplateView extends TemplateViewBase {
  _configHelper = new TemplateConfigHelper();
}

class BadgeTemplateView extends TemplateViewBase {
  _configHelper = new BadgeTemplateConfigHelper();
}

// CardTemplateView and BadgeTemplateView are siblings: this names what
// EntityProgressTemplateBase's `_cardView` holds, whichever of the two.
type TemplateView = TemplateViewBase;

export { CardTemplateView, BadgeTemplateView };
export type { TemplateView };
