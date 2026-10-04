'use strict';

// Writes docs/option-map.md from test/docs/option-map.ts, which reads src/ and
// test/ as TypeScript: bundled with the card's own esbuild settings first.
const path = require('path');
const esbuild = require('esbuild');
const { spawnSync } = require('child_process');
const { TARGET, NATIVE_CLASS_FEATURES, devBuildDefine } = require('./lib/esbuild-settings.js');

// Inside the project, like compare-hass-updates.js: Node resolves the
// external packages (js-yaml) from the bundle's own location.
const OUTFILE = path.join('test-dist', 'option-map.mjs');

esbuild.buildSync({
  stdin: {
    contents: [
      "import fs from 'node:fs';",
      "import { optionMap, OPTION_MAP } from './test/docs/option-map.ts';",
      'fs.writeFileSync(OPTION_MAP, optionMap());',
      'console.log(`✅ Wrote ${OPTION_MAP}`);',
    ].join('\n'),
    resolveDir: path.join(__dirname, '..'),
    loader: 'js',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: OUTFILE,
  packages: 'external',
  logLevel: 'error',
  define: devBuildDefine(false),
  target: TARGET,
  supported: NATIVE_CLASS_FEATURES,
});
const run = spawnSync(process.execPath, [OUTFILE], { stdio: 'inherit' });
process.exit(run.status ?? 1);
