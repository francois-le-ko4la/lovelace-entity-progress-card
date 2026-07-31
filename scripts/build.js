'use strict';

// Builds dist/entity-progress-card.js from the src/ module split - the only
// build pipeline; HACS installs from the release assets this produces (see
// .github/workflows/release.yaml), there's no root-level file anymore.
//
// src/index.ts is the entry point: it registers the card/badge/feature types
// and prints the console banner (everything else in src/ is imported from
// there, directly or transitively). src/ mixes .ts and plain .js - esbuild
// bundles both natively, no separate compile step.
//
// esbuild bundles the ES modules into one script first (import/export
// resolved away), then a CSS-in-JS resolve pass (scripts/lib/inline-css.js -
// esbuild's own --minify never touches CSS embedded in JS template literals)
// runs over the bundled source, then a final esbuild pass produces the
// shipped file. Both the CSS pass and this final pass only minify for --prod;
// a test/dev build stays fully readable.
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const { resolveCssBlocks } = require('./lib/inline-css.js');
const { forceCleanCardContext } = require('./lib/release-flags.js');

const ENTRY = 'src/index.ts';
const OUTDIR = 'dist';
// --prod: force dev:false + all debug flags false regardless of the
// committed source state (see scripts/lib/release-flags.js). Default (no
// flag, "test" build): CARD_CONTEXT is left exactly as committed.
const isProd = process.argv.includes('--prod');
// Filename suffix keeps a stray test build from ever being mistaken for (or
// overwriting) the shipped prod one in dist/.
const OUTFILE = isProd ? 'entity-progress-card.js' : 'entity-progress-card_dev.js';

function main() {
  let bundled = esbuild.buildSync({
    entryPoints: [ENTRY],
    bundle: true,
    format: 'esm',
    write: false,
    minify: false,
    // Bake dev mode into the *_dev.js build itself (vs the shipped .js): the
    // URL can't be read when the bundle is loaded as an ES module (no
    // document.currentScript), so a filename/?dev=true signal alone would miss
    // it. ?dev=true still works as a runtime override on the prod file.
    define: { __EPB_DEV_BUILD__: isProd ? 'false' : 'true' },
    // Preserve original class/function names through bundling: esbuild
    // otherwise prefixes some cross-module classes (e.g. _ThemeManager,
    // _EntityHelper) to avoid collisions, which would surface in every
    // `.name`-based debug line (initLogger's per-class logger and
    // traceInstance's ?debug=instances counter).
    keepNames: true,
  }).outputFiles[0].text;

  if (isProd) bundled = forceCleanCardContext(bundled);
  const { src, minifiedCount } = resolveCssBlocks(bundled, isProd);

  // es2021, not es2022 (issue #128): es2022 lets esbuild emit `static {}`
  // class blocks (its keepNames technique for static members) and other
  // es2022-only syntax, which is a hard SyntaxError on any pre-2022 engine -
  // not caught by dev-mode testing (modern browser) and not caught by
  // `node --check` in CI (Node's parser is newer than the target). That
  // broke the shipped card entirely on older/embedded Chromium (kiosk
  // panels) that worked fine on the pre-esbuild 1.5.x monolith. es2021 keeps
  // every syntax feature actually used here (private fields, `??=`,
  // optional chaining) while forcing static blocks into an es2021-safe form.
  const result = esbuild.transformSync(src, { minify: isProd, target: 'es2021' });

  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(path.join(OUTDIR, OUTFILE), result.code);

  const cssVerb = isProd ? 'minified' : 'resolved';
  console.log(
    `✅ Built ${path.join(OUTDIR, OUTFILE)} from ${ENTRY} [${isProd ? 'prod' : 'test'}] (${minifiedCount} CSS block(s) ${cssVerb}, bundled source ${bundled.length} → ${src.length} bytes pre-JS-minify).`,
  );
}

main();
