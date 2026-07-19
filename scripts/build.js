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
  }).outputFiles[0].text;

  if (isProd) bundled = forceCleanCardContext(bundled);
  const { src, minifiedCount } = resolveCssBlocks(bundled, isProd);

  const result = esbuild.transformSync(src, { minify: isProd, target: 'es2022' });

  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(path.join(OUTDIR, OUTFILE), result.code);

  const cssVerb = isProd ? 'minified' : 'resolved';
  console.log(
    `✅ Built ${path.join(OUTDIR, OUTFILE)} from ${ENTRY} [${isProd ? 'prod' : 'test'}] (${minifiedCount} CSS block(s) ${cssVerb}, bundled source ${bundled.length} → ${src.length} bytes pre-JS-minify).`,
  );
}

main();
