'use strict';

// Compares what two or more shipped bundles cost a browser: bytes on the wire,
// and the parse/compile work gzip can never remove (issue #141 - the NSPanel
// case is about JS the device must process, not about download size).
//
//   node scripts/compare-bundles.js                        # prod vs prod light
//   node scripts/compare-bundles.js a.js b.js [c.js ...]   # any set of files
//
// Measures size (raw + gzip), parse+compile time, and the bytecode V8 keeps.
// It does NOT measure evaluation or heap: those need a DOM, and the module
// top-level has to actually run - see docs/development.md.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const vm = require('vm');
const { spawnSync } = require('child_process');

const DEFAULT_FILES = ['dist/entity-progress-card.js', 'dist/entity-progress-card-light.js'];
const RUNS = 40;
const EAGER_FLAG = '--no-lazy';
const CHILD_MARKER = '--eager-child';

// Node's own V8 on this machine, not the target device: only the ratio between
// two bundles carries over, never the absolute milliseconds.
function compile(file, runs) {
  const base = fs.readFileSync(file, 'utf8');
  const times = [];
  let bytecode = 0;
  for (let i = 0; i < runs; i++) {
    // A unique trailing comment per run: V8 caches compilation keyed on the
    // source string, so recompiling the same text measures the cache, not V8.
    const src = `${base}\n//${'x'.repeat(i + 1)}`;
    const started = process.hrtime.bigint();
    const script = new vm.Script(src, { filename: `${path.basename(file)}#${i}` });
    times.push(Number(process.hrtime.bigint() - started) / 1e6);
    if (i === 0) bytecode = script.createCachedData().length;
  }
  times.sort((a, b) => a - b);
  const quartile = times.slice(0, Math.ceil(times.length / 4));
  return {
    min: times[0],
    mean: quartile.reduce((sum, ms) => sum + ms, 0) / quartile.length,
    bytecode,
  };
}

// The eager pass needs --no-lazy, which is an isolate-wide V8 flag: a child
// process is the only way to get it without tainting the lazy numbers above.
function compileEager(files, runs) {
  const result = spawnSync(process.execPath, [EAGER_FLAG, __filename, CHILD_MARKER, String(runs), ...files], {
    encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error(`eager pass failed: ${result.stderr || result.status}`);
  return JSON.parse(result.stdout);
}

function sizes(file) {
  const body = fs.readFileSync(file);
  return { raw: body.length, gzip: zlib.gzipSync(body).length };
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const ms = (value) => `${value.toFixed(1)} ms`;

function report(files) {
  const rows = files.map((file) => ({
    file,
    label: path.basename(file, '.js'),
    ...sizes(file),
    lazy: compile(file, RUNS),
  }));
  const eager = compileEager(files, RUNS);
  rows.forEach((row, index) => {
    row.eager = eager[index];
  });

  const width = Math.max(14, ...rows.map((row) => row.label.length + 2));
  const line = (label, pick) =>
    console.log(`  ${label.padEnd(26)}${rows.map((row) => String(pick(row)).padStart(width)).join('')}`);

  console.log(`\nparse/compile: min and best-quartile mean over ${RUNS} compilations\n`);
  line('', (row) => row.label);
  line('raw size', (row) => kb(row.raw));
  line('gzip size', (row) => kb(row.gzip));
  line('compile lazy (min)', (row) => ms(row.lazy.min));
  line('compile lazy (Q1 mean)', (row) => ms(row.lazy.mean));
  line('compile eager (min)', (row) => ms(row.eager.min));
  line('compile eager (Q1 mean)', (row) => ms(row.eager.mean));
  line('bytecode lazy', (row) => kb(row.lazy.bytecode));
  line('bytecode eager', (row) => kb(row.eager.bytecode));

  if (rows.length === 2) {
    const [from, to] = rows;
    const delta = (before, after) => `${(((after - before) / before) * 100).toFixed(0)}%`;
    console.log(`\n  ${from.label} → ${to.label}`);
    console.log(`    raw ${delta(from.raw, to.raw)}   gzip ${delta(from.gzip, to.gzip)}`);
    console.log(
      `    compile lazy ${delta(from.lazy.min, to.lazy.min)}   eager ${delta(from.eager.min, to.eager.min)}` +
        `   bytecode ${delta(from.lazy.bytecode, to.lazy.bytecode)}`,
    );
  }
  console.log('');
}

function main() {
  const argv = process.argv.slice(2);

  if (argv[0] === CHILD_MARKER) {
    const runs = Number(argv[1]);
    process.stdout.write(JSON.stringify(argv.slice(2).map((file) => compile(file, runs))));
    return;
  }

  const files = argv.length > 0 ? argv : DEFAULT_FILES;
  const missing = files.filter((file) => !fs.existsSync(file));
  if (missing.length > 0) {
    console.error(`No such file: ${missing.join(', ')}`);
    console.error('Build them first: npm run build:prod && npm run build:light');
    process.exitCode = 1;
    return;
  }
  report(files);
}

main();
