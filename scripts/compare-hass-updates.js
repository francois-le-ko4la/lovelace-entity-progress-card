'use strict';

// Compares what two or more bundles cost on the hot path, synchronous part:
// `set hass`, which Home Assistant calls on every card for every state change
// anywhere in the instance, and the local tick that moves a running timer or a
// relative time with no state change. The runtime counterpart of
// compare-bundles.js, which never runs a bundle.
//
//   node scripts/compare-hass-updates.js a.js [b.js ...]
//
// A published bundle to compare against:
//   gh release download 1.6.3-rc9 -p entity-progress-card.js -D /tmp/rc9
//
// Node + happy-dom, not a browser: only the ratio between two bundles carries
// over, never the absolute microseconds. A few minutes per bundle.
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const { spawnSync } = require('child_process');

const HARNESS = path.join(__dirname, 'lib', 'hass-update-bench.mjs');
// Inside the project, not a temp dir: happy-dom stays external, and Node
// resolves it from the bundle's own location.
const OUT_DIR = 'test-dist';

function buildHarness() {
  const outfile = path.join(OUT_DIR, 'hass-update-bench.mjs');
  esbuild.buildSync({
    entryPoints: [HARNESS],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile,
    packages: 'external',
    logLevel: 'error',
  });
  return outfile;
}

function measure(harness, file, out) {
  const result = spawnSync(process.execPath, [harness], {
    encoding: 'utf8',
    env: { ...process.env, EPB_BENCH_BUNDLE: path.resolve(file), EPB_BENCH_OUT: out },
  });
  if (result.status !== 0) throw new Error(`${file}: ${result.stderr || `exit ${result.status}`}`);
  return JSON.parse(fs.readFileSync(out, 'utf8'));
}

function report(files) {
  const harness = buildHarness();
  const runs = files.map((file, index) => {
    console.log(`measuring ${file}…`);
    const out = path.join(OUT_DIR, `hass-updates-${index}.json`);
    return { label: path.basename(file, '.js'), ...measure(harness, file, out) };
  });

  const [first] = runs;
  const scenarios = Object.keys(first.results);
  const labelWidth = Math.max(...scenarios.map((scenario) => scenario.length)) + 2;
  const width = Math.max(14, ...runs.map((run) => run.label.length + 2));
  const line = (label, cells, tail = '') =>
    console.log(
      `  ${label.padEnd(labelWidth)}${cells.map((cell) => cell.padStart(width)).join('')}${tail.padStart(8)}`,
    );
  const delta = (before, after) => `${(((after - before) / before) * 100).toFixed(0)}%`;

  console.log(
    `\nsynchronous part: µs per card, median of ${first.iterations} hass updates or ticks` +
      ` (${first.cards} cards, ${first.registry}-entity registry)\n`,
  );
  line(
    '',
    runs.map((run) => run.label),
    runs.length === 2 ? 'Δ' : '',
  );
  for (const scenario of scenarios) {
    const values = runs.map((run) => run.results[scenario]);
    line(
      scenario,
      values.map((value) => `${value.toFixed(1)} µs`),
      runs.length === 2 ? delta(values[0], values[1]) : '',
    );
  }
  console.log('');
}

function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('Usage: node scripts/compare-hass-updates.js a.js [b.js ...]');
    process.exitCode = 1;
    return;
  }
  const missing = files.filter((file) => !fs.existsSync(file));
  if (missing.length > 0) {
    console.error(`No such file: ${missing.join(', ')}`);
    process.exitCode = 1;
    return;
  }
  report(files);
}

main();
