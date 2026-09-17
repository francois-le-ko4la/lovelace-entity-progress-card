'use strict';

// Guards the one assumption the editor-translation split rests on: that
// TRANSLATIONS_EDITOR, imported by nothing in src/, is dropped by esbuild and
// never reaches the shipped bundle. Nothing about that is enforced by the type
// system - a stray import, or a bundler setting turning tree shaking off,
// would silently put ~110 KB of editor labels back into every install.
//
// Run against a built dist/: the bundle must not contain a non-English editor
// label, and the sibling JSON files must. Takes the build's basename, so the
// prod and dev bundles are each checked right after they are built rather than
// whenever one happens to be lying around in dist/.
//
//   node scripts/check-i18n-split.js [entity-progress-card|entity-progress-card_dev]

const fs = require('fs');
const path = require('path');
const { JS_FILE, parseJsBlock } = require('./lib/i18n-block.js');

const OUTDIR = path.resolve(__dirname, '../dist');

const die = (msg) => {
  console.error(`❌ ${msg}`);
  process.exit(1);
};

// esbuild writes non-ASCII as \xHH / \uHHHH, so a raw `includes` of an
// accented label never matches and every probe silently passes. Decode once,
// search the decoded text.
const decodeEscapes = (src) =>
  src.replace(/\\u([0-9a-fA-F]{4})|\\x([0-9a-fA-F]{2})/g, (_, u, x) => String.fromCharCode(parseInt(u ?? x, 16)));

/**
 * A label this language translates, long enough not to collide with a
 * minified identifier (`Segmente` lives inside `isSegmented`).
 */
const probeIn = (values, keys, offset, lang) => {
  const row = values[lang];
  if (!row) return null;
  return (
    row
      .map((value, i) => ({ value, key: keys[offset + i] }))
      .find((entry) => typeof entry.value === 'string' && entry.value.length >= 12) ?? null
  );
};

const main = () => {
  const block = parseJsBlock(fs.readFileSync(JS_FILE, 'utf8'));
  const expectedLength = block.keys.length - block.editorStart;
  const stems = process.argv.slice(2);
  if (stems.length === 0) stems.push('entity-progress-card');

  for (const stem of stems) {
    if (!fs.existsSync(path.join(OUTDIR, `${stem}.js`))) die(`dist/${stem}.js not found - build it first`);
    const bundle = decodeEscapes(fs.readFileSync(path.join(OUTDIR, `${stem}.js`), 'utf8'));
    let checked = 0;
    // Positive control: the card half ships in every language, so the same
    // search must find it. Without this, "found nothing" would pass whether
    // the split works or the probe is simply broken.
    for (const lang of Object.keys(block.card)) {
      const control = probeIn(block.card, block.keys, 0, lang);
      if (control && !bundle.includes(control.value)) {
        die(`${stem}.js is missing ${lang}'s card labels (${control.key} = "${control.value}") - the probe cannot see the translation table`);
      }
    }
    for (const lang of Object.keys(block.editor)) {
      const file = path.join(OUTDIR, `${stem}-${lang}.json`);
      if (!fs.existsSync(file)) die(`${stem}: missing editor translation file for ${lang}`);
      const shipped = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!Array.isArray(shipped) || shipped.length !== expectedLength) {
        die(`${stem}-${lang}.json: expected an array of ${expectedLength} values, got ${shipped.length}`);
      }
      const probe = probeIn(block.editor, block.keys, block.editorStart, lang);
      if (!probe) continue;
      checked++;
      if (bundle.includes(probe.value)) {
        die(`${stem}.js still ships ${lang}'s editor labels (found ${probe.key} = "${probe.value}")`);
      }
    }
    console.log(
      `✅ ${stem}.js ships every language's card labels and none of its editor labels (${checked} languages probed, ${Object.keys(block.editor).length} files beside it).`,
    );
  }
};

main();
