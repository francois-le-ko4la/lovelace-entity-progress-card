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
// test/dom/ mounts real custom elements through happy-dom - slower, and only
// worth paying for before a release (see the check:push npm script).
// Everything else is pure logic and runs on every push.
const DOM_DIR = path.join(TEST_DIR, 'dom');
const DOM_ONLY = process.argv.includes('--dom');

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
  // OUT_DIR is wiped below, so the runner's own glob needs no filter: it runs
  // whatever this pass decided to build.
  const files = findTestFiles(TEST_DIR).filter((file) =>
    DOM_ONLY ? file.startsWith(DOM_DIR) : !file.startsWith(DOM_DIR),
  );
  if (files.length === 0) {
    console.log(`No *.test.ts file found under ${DOM_ONLY ? DOM_DIR : TEST_DIR}/.`);
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
      // src/ has no runtime dependency, so this only ever leaves the test-only
      // ones (happy-dom) to Node's own resolver instead of inlining a whole
      // DOM implementation into every test bundle.
      packages: 'external',
    });
  }
  console.log(`✅ Built ${files.length} ${DOM_ONLY ? 'DOM' : 'logic'} test file(s) into ${OUT_DIR}/`);
}

main();
