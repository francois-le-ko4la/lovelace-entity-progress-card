#!/usr/bin/env node
'use strict';

// Builds dist/entity-progress-card.js from the entity-progress-card.js
// monolith (the file HACS installs on the default branch - never touched by
// this script, only read).
//
// Every CSS-in-JS block in the source is tagged with the `css` identity tag
// (see its own comment in entity-progress-card.js) specifically so
// resolveCssBlocks (scripts/lib/inline-css.js) can find all of them by that
// one marker, instead of needing to know each variable/usage by name - a
// future CSS block just needs the tag to be picked up automatically.
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const { resolveCssBlocks } = require('./lib/inline-css.js');
const { forceCleanCardContext } = require('./lib/release-flags.js');

const SOURCE = 'entity-progress-card.js';
const OUTDIR = 'dist';
// --prod: force dev:false + all debug flags false regardless of the
// committed source state (see scripts/lib/release-flags.js). Default (no
// flag, "test" build): CARD_CONTEXT is left exactly as committed.
const isProd = process.argv.includes('--prod');
// Filename suffix keeps a stray test build from ever being mistaken for (or
// overwriting) the shipped prod one in dist/.
const OUTFILE = isProd ? SOURCE : SOURCE.replace(/\.js$/, '_dev.js');

function main() {
  let original = fs.readFileSync(SOURCE, 'utf8');
  if (isProd) original = forceCleanCardContext(original);
  const { src, minifiedCount } = resolveCssBlocks(original);

  const result = esbuild.transformSync(src, { minify: true, target: 'es2022' });

  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(path.join(OUTDIR, OUTFILE), result.code);

  console.log(
    `✅ Built ${path.join(OUTDIR, OUTFILE)} [${isProd ? 'prod' : 'test'}] (${minifiedCount} CSS block(s) minified, source ${original.length} → ${src.length} bytes pre-JS-minify).`,
  );
}

main();
