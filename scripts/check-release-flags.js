'use strict';

// Fails the release build if CARD_CONTEXT (dev mode + debug logging) isn't
// fully clean. A forgotten `dev: true` registers every card/badge/feature
// under a "-dev" type name, breaking every dashboard using the documented
// type; a forgotten debug flag ships verbose console logging to every user.
const fs = require('fs');

const SOURCE = 'src/utils/parameters.ts';
const src = fs.readFileSync(SOURCE, 'utf8');
const match = src.match(/const CARD_CONTEXT = \{[\s\S]*?\n\};/);

if (!match) {
  throw new Error(`❌ CARD_CONTEXT block not found in ${SOURCE}.`);
}

if (/true/.test(match[0])) {
  throw new Error(`❌ CARD_CONTEXT has a dev/debug flag set to true - not safe to release:\n${match[0]}`);
}

console.log('✅ CARD_CONTEXT is clean for release (dev: false, all debug flags false).');
