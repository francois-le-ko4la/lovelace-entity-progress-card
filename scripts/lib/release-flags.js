'use strict';

// Forces the committed debug baseline (DEBUG_DEFAULTS) to all-false in a
// build's source string, regardless of what's currently committed - used by
// the --prod mode of scripts/build.js so a forgotten debug flag can never
// ship, the same failure mode scripts/check-release-flags.js guards against by
// gating the release workflow on the committed source being clean.
//
// `dev` is no longer forced here: it's derived at runtime from the served URL
// (import.meta.url - *_dev.js or ?dev), so the shipped entity-progress-card.js,
// served without that marker, is inherently non-dev.
//
// (?:const|let|var) - esbuild's bundler rewrites top-level `const`/`let` to
// `var` when it concatenates modules.
const DEBUG_DEFAULTS_RE = /(?:const|let|var)(\s+DEBUG_DEFAULTS\s*=\s*)\{[\s\S]*?\};/;

const CLEAN_DEBUG_DEFAULTS_BODY =
  '{\n  card: false,\n  editor: false,\n  interactionHandler: false,\n  ressourceManager: false,\n  hass: false,\n  registration: false,\n  instances: false,\n  interference: false,\n};';

function forceCleanCardContext(src) {
  const match = DEBUG_DEFAULTS_RE.exec(src);
  if (!match) {
    throw new Error('DEBUG_DEFAULTS block not found - refusing to produce a --prod build.');
  }
  return src.slice(0, match.index) + `const${match[1]}${CLEAN_DEBUG_DEFAULTS_BODY}` + src.slice(match.index + match[0].length);
}

module.exports = { forceCleanCardContext };
