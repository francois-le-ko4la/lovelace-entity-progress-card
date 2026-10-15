/*
 * All CSS for the card: CARD_CSS (the card/badge/feature/template
 * stylesheet, assembled from the sections in styles/) and the
 * Constructable-Stylesheet caching helpers that let every card instance share
 * one parsed sheet instead of re-parsing per instance. The editor components'
 * styles live in styles/editor.ts.
 */

import { PARAMS_CSS } from './styles/params.js';
import { BASE_CSS } from './styles/base.js';
import { CONTAINER_CSS } from './styles/container.js';
import { TREND_STATUS_CSS } from './styles/trend-status.js';
import { ICON_CSS } from './styles/icon.js';
import { CONTENT_CSS } from './styles/content.js';
import { BAR_CSS } from './styles/bar.js';
import { BAR_SEGMENTS_CSS } from './styles/bar-segments.js';
import { ICON_ANIMATION_CSS } from './styles/icon-animation.js';
import { ALERT_CSS } from './styles/alert.js';
import { BAR_VARIANTS_CSS } from './styles/bar-variants.js';
import { WATERMARKS_CSS } from './styles/watermarks.js';
import { DOWN_PEAK_CSS } from './styles/down-peak.js';
import { RAINBOW_CSS } from './styles/rainbow.js';
import { STATES_CSS } from './styles/states.js';

const CARD_CSS = [
  PARAMS_CSS,
  BASE_CSS,
  CONTAINER_CSS,
  TREND_STATUS_CSS,
  ICON_CSS,
  CONTENT_CSS,
  BAR_CSS,
  BAR_SEGMENTS_CSS,
  ICON_ANIMATION_CSS,
  ALERT_CSS,
  BAR_VARIANTS_CSS,
  WATERMARKS_CSS,
  DOWN_PEAK_CSS,
  RAINBOW_CSS,
  STATES_CSS,
].join('\n');

/**
 * Shared constructed stylesheets (Constructable Stylesheets API).
 *
 * CF5 - issue (perf) resolved - each instance used to hold its own <style>
 * element with the full ~55 KB CARD_CSS, so N cards meant N parses and N CSSOM
 * copies, redone on every editor keystroke. A constructed sheet is parsed once
 * per unique CSS text and shared by reference by every shadowRoot adopting it.
 *
 * Progressive enhancement only: `new CSSStyleSheet()` needs Firefox 101 /
 * Safari 16.4, past the README's own 94+/15.4+ promise, so older engines (a
 * wall-mounted iPad on iPadOS 15) get null here and fall back to the legacy
 * per-instance <style>. The cache is keyed by CSS text, not by class, so a
 * subclass overriding _cardStyle gets its own sheet; adoptedStyleSheets survive
 * reset()'s `innerHTML = ''`, so adopting happens once per shadowRoot.
 */
const CONSTRUCTED_SHEETS = new Map<string, CSSStyleSheet | null>();
const getSharedStyleSheet = (cssText: string): CSSStyleSheet | null => {
  if (CONSTRUCTED_SHEETS.has(cssText)) return CONSTRUCTED_SHEETS.get(cssText) ?? null;
  let sheet: CSSStyleSheet | null = null;
  try {
    const constructed = new CSSStyleSheet();
    constructed.replaceSync(cssText);
    sheet = constructed;
  } catch {
    // Firefox < 101, Safari < 16.4 (not constructible) → keep null, legacy
    // <style> fallback
  }
  CONSTRUCTED_SHEETS.set(cssText, sheet);
  return sheet;
};

// The shared sheet adopted by the shadow root, or - when the engine cannot
// construct one - the per-instance <style> the caller has to insert.
const adoptStyle = (shadow: ShadowRoot, cssText: string): HTMLStyleElement | null => {
  const sheet = getSharedStyleSheet(cssText);
  if (sheet) {
    if (!shadow.adoptedStyleSheets.includes(sheet)) shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, sheet];
    return null;
  }
  const style = document.createElement('style');
  style.textContent = cssText;
  return style;
};

// Browser capability probe, independent of whether any card has been built yet
// (CONSTRUCTED_SHEETS fills lazily on first render, so an empty map means "none
// built", NOT "unsupported"). Mirrors getSharedStyleSheet's exact requirement:
// construct + replaceSync. Used by the diagnostic dump to tell a genuine legacy
// fallback apart from a not-yet-rendered state.
const CONSTRUCTIBLE_STYLESHEETS = (() => {
  try {
    // Split like getSharedStyleSheet above (not a chained call) so
    // eslint-plugin-compat doesn't misflag this feature-detection probe.
    const probe = new CSSStyleSheet();
    probe.replaceSync('');
    return true;
  } catch {
    return false;
  }
})();

export { CARD_CSS };
export { CONSTRUCTED_SHEETS };
export { CONSTRUCTIBLE_STYLESHEETS };
export { adoptStyle };
