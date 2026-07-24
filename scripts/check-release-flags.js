'use strict';

// Fails the release build if the committed debug baseline (DEBUG_DEFAULTS in
// parameters.ts) isn't fully clean. A forgotten debug flag would ship verbose
// console logging to every user. `dev` is no longer checked here: it's derived
// at runtime from the served URL (import.meta.url - *_dev.js or ?dev), so a
// file shipped as entity-progress-card.js can never register under a "-dev"
// type name in the first place.
const fs = require('fs');

const SOURCE = 'src/utils/parameters.ts';
const src = fs.readFileSync(SOURCE, 'utf8');
const match = src.match(/const DEBUG_DEFAULTS = \{[\s\S]*?\};/);

if (!match) {
  throw new Error(`❌ DEBUG_DEFAULTS block not found in ${SOURCE}.`);
}

if (/true/.test(match[0])) {
  throw new Error(`❌ DEBUG_DEFAULTS has a debug flag set to true - not safe to release:\n${match[0]}`);
}

console.log('✅ DEBUG_DEFAULTS is clean for release (all debug flags false).');
