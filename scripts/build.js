#!/usr/bin/env node
'use strict';

// Builds dist/entity-progress-card.js from the src/ module split - the only
// build pipeline; HACS installs from the release assets this produces (see
// .github/workflows/release.yaml), there's no root-level file anymore.
//
// src/editor/editors.js is the true entry point: it's the last file in the
// dependency order and is the one that actually registers the card/badge/
// feature types and prints the console banner.
//
// esbuild bundles the ES modules into one script first (import/export
// resolved away), then a CSS-in-JS resolve+minify pass (scripts/lib/
// inline-css.js - esbuild's own --minify never touches CSS embedded in JS
// template literals) runs over the bundled source, then a final esbuild
// minify pass produces the shipped file.
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const { resolveCssBlocks } = require('./lib/inline-css.js');
const { forceCleanCardContext } = require('./lib/release-flags.js');

const ENTRY = 'src/editor/editors.js';
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
  const { src, minifiedCount } = resolveCssBlocks(bundled);

  const result = esbuild.transformSync(src, { minify: true, target: 'es2022' });

  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(path.join(OUTDIR, OUTFILE), result.code);

  console.log(
    `✅ Built ${path.join(OUTDIR, OUTFILE)} from ${ENTRY} [${isProd ? 'prod' : 'test'}] (${minifiedCount} CSS block(s) minified, bundled source ${bundled.length} → ${src.length} bytes pre-JS-minify).`,
  );
}

main();
