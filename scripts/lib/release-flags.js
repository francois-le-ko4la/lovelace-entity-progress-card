'use strict';

// Forces CARD_CONTEXT (dev mode + debug logging) to its clean/shipped state
// in a build's source string, regardless of what's currently committed -
// used by the --prod mode of scripts/build.js so a forgotten `dev: true` (or
// a stray debug flag left on) can never ship, the same failure mode
// scripts/check-release-flags.js already guards against by gating the
// release workflow on the committed source being clean.
//
// (?:const|let|var) - esbuild's bundler rewrites top-level `const`/`let` to
// `var` when it concatenates modules.
const CARD_CONTEXT_RE = /(?:const|let|var)(\s+CARD_CONTEXT\s*=\s*)\{[\s\S]*?\n\};/;

const CLEAN_CARD_CONTEXT_BODY = `{
  dev: false,
  debug: { card: false, editor: false, interactionHandler: false, ressourceManager: false, hass: false },
};`;

function forceCleanCardContext(src) {
  const match = CARD_CONTEXT_RE.exec(src);
  if (!match) {
    throw new Error('CARD_CONTEXT block not found - refusing to produce a --prod build.');
  }
  return src.slice(0, match.index) + `const${match[1]}${CLEAN_CARD_CONTEXT_BODY}` + src.slice(match.index + match[0].length);
}

module.exports = { forceCleanCardContext };
