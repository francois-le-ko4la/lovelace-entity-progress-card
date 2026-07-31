/*
 * Feature-detects whether the running engine satisfies the browser matrix
 * this card documents support for (README's Prerequisites table: Chrome 98+,
 * Edge 98+, Firefox 94+, Safari 15.4+, Opera 84+). A couple of runtime APIs
 * used elsewhere shipped right around those same versions - below the
 * matrix, this card should degrade gracefully instead of hard-crashing on an
 * older/embedded engine (issue #128: a kiosk-panel Chromium in the low 90s).
 *
 * `es-check` in the release pipeline only catches syntax the parser can't
 * read at all (see scripts/build.js) - it can't catch a function that
 * parses fine but simply doesn't exist yet at runtime. This variable, plus
 * the shims below that branch on it, cover that separate failure mode.
 *
 * structuredClone is the probe: its own browser-compat table (Chrome/Edge 98,
 * Firefox 94, Safari 15.4, Opera 84) matches this card's documented matrix
 * almost exactly - a single, honest feature check rather than brittle
 * User-Agent sniffing (spoofable, and every Chromium fork reports its own
 * version numbering anyway).
 */
const IN_SUPPORTED_MATRIX = (() => {
  try {
    return typeof structuredClone === 'function';
  } catch {
    return false;
  }
})();

// Recursive plain-object/array clone for the below-matrix fallback. Only
// meant for config-shaped data (nested plain objects/arrays of primitives -
// no functions, Dates, Maps, Sets or circular refs), which is the only thing
// this card ever clones - not a general structuredClone replacement.
function manualClone<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => manualClone(item)) as unknown as T;
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      out[key] = manualClone((value as Record<string, unknown>)[key]);
    }
    return out as T;
  }
  return value;
}

// structuredClone (Chrome/Edge 98, Firefox 94, Safari 15.4) - see
// IN_SUPPORTED_MATRIX above. Callers get a plain function, no inline
// if/fallback logic at the call site.
function cloneValue<T>(value: T): T {
  return IN_SUPPORTED_MATRIX ? structuredClone(value) : manualClone(value);
}

export { IN_SUPPORTED_MATRIX, cloneValue };
