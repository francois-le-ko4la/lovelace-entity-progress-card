import { is } from '../utils/common-checks.js';

// Values pushed by Jinja subscriptions; null = no override.
class JinjaState {
  minValue: number | null = null;
  maxValue: number | null = null;
  alertAbove: number | null = null;
  alertBelow: number | null = null;
  watermarkLow: number | null = null;
  watermarkHigh: number | null = null;
  // alert_when.jinja: true or an override object = active, else inactive.
  alertResult: boolean | Record<string, unknown> | null = null;
  // Numeric fields HA could not render, by option key; '' = no message.
  failures = new Map<string, string>();
  // icon_animation { effect, jinja }: null = not in that mode or unresolved.
  iconAnimationActive: boolean | null = null;
  // hide's Jinja push; null = no push yet, fall back to config.hide.
  resolvedHide: Set<string> | null = null;
  // What a host (the Multi Feature) takes off this card whatever hide says.
  forcedHide = new Set<string>();

  failure(key: string): string | null {
    return this.failures.get(key) ?? null;
  }

  setFailure(key: string, message: string | null) {
    if (message === null) this.failures.delete(key);
    else this.failures.set(key, message);
  }

  setAlertResult(value: unknown) {
    this.alertResult = is.boolean(value) || is.plainObject(value) ? value : null;
  }

  setIconAnimationActive(value: unknown) {
    this.iconAnimationActive = is.boolean(value) ? value : null;
  }

  setResolvedHide(items: string[]) {
    this.resolvedHide = new Set(items);
  }

  forceHidden(targets: string[]) {
    this.forcedHide = new Set(targets);
  }

  resetCommon() {
    this.failures.clear();
    this.watermarkLow = null;
    this.watermarkHigh = null;
  }

  resetBounds() {
    this.minValue = null;
    this.maxValue = null;
  }

  resetAlert() {
    this.alertAbove = null;
    this.alertBelow = null;
    this.alertResult = null;
  }

  resetHideAndIcon() {
    this.iconAnimationActive = null;
    this.resolvedHide = null;
  }
}

export { JinjaState };
