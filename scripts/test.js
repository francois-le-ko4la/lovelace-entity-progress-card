'use strict';

// Builds test/**/*.test.ts into test-dist/ (gitignored) and hands off to
// Node's own test runner. A separate esbuild pass is needed (not plain
// `node --test`) because src/ imports its siblings with a .js extension
// (standard ESM-from-TS convention) and reads __EPB_DEV_BUILD__, a
// build-time esbuild `define` (see build.js) rather than a real global -
// Node's native TS support resolves neither on its own.
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const TEST_DIR = 'test';
const OUT_DIR = 'test-dist';

function findTestFiles(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...findTestFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.test.ts')) found.push(full);
  }
  return found;
}

function main() {
  if (!fs.existsSync(TEST_DIR)) {
    console.log(`No ${TEST_DIR}/ directory - nothing to test.`);
    return;
  }
  const files = findTestFiles(TEST_DIR);
  if (files.length === 0) {
    console.log(`No *.test.ts file found under ${TEST_DIR}/.`);
    return;
  }

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  for (const file of files) {
    const outfile = path.join(OUT_DIR, path.relative(TEST_DIR, file).replace(/\.ts$/, '.mjs'));
    esbuild.buildSync({
      entryPoints: [file],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile,
      // Deterministic for tests regardless of committed CARD_CONTEXT state -
      // same reasoning as build.js's own --prod define, dev flags aren't
      // what's under test here.
      define: { __EPB_DEV_BUILD__: 'false' },
    });
  }
  console.log(`✅ Built ${files.length} test file(s) into ${OUT_DIR}/`);
}

main();
