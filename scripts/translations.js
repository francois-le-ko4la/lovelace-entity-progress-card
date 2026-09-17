'use strict';
/**
 * translations.js — unified translation toolchain.
 *
 * Source of truth: translations/<lang>.json (one file per language).
 * template.json is the structural reference (key set), never shipped.
 * The TRANSLATIONS block inside src/utils/translations.js is GENERATED from
 * the JSON files (synchronize --to-js) and must never be edited by hand.
 *
 * Usage: node scripts/translations.js <command> [args]
 * Run without argument for the command list.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { JS_FILE, BUNDLED_PREFIX, parseJsBlock } = require('./lib/i18n-block.js');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'translations');
const SRC_DIR = path.join(ROOT, 'src');
const TEMPLATE = 'template.json';

// ─── generic helpers ─────────────────────────────────────────────────────────

class FatalError extends Error {}
const die = (msg) => { throw new FatalError(`❌ ${msg}`); };
const readJSON = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJSON = (f, data) => fs.writeFileSync(f, `${JSON.stringify(data, null, 2)}\n`);
const langFiles = () => fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== TEMPLATE).sort();
const allLangs = () => langFiles().map((f) => f.replace('.json', ''));
const langPath = (lang) => path.join(DIR, `${lang}.json`);

const flatten = (obj, prefix = '', out = {}) => {
  for (const [k, v] of Object.entries(obj)) {
    const keyPath = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object') flatten(v, keyPath, out);
    else out[keyPath] = v;
  }
  return out;
};

const getPath = (obj, dotted) => dotted.split('.').reduce((o, k) => o?.[k], obj);

/** Set `value` at `dotted`, creating any missing intermediate objects along the way. */
const setPath = (root, dotted, value) => {
  const parts = dotted.split('.');
  const key = parts.pop();
  let node = root;
  for (const p of parts) node = (node[p] ??= {});
  node[key] = value;
};

/** Insert `key: value` into the object at `parentPath`, after sibling `afterKey` (or append). */
const insertKey = (root, parentPath, key, value, afterKey = null) => {
  const parent = parentPath ? getPath(root, parentPath) : root;
  if (!parent || typeof parent !== 'object') return false;
  if (key in parent) { parent[key] = value; return true; }
  if (!afterKey || !(afterKey in parent)) { parent[key] = value; return true; }
  const rebuilt = {};
  for (const [k, v] of Object.entries(parent)) {
    rebuilt[k] = v;
    if (k === afterKey) rebuilt[key] = value;
  }
  for (const k of Object.keys(parent)) delete parent[k];
  Object.assign(parent, rebuilt);
  return true;
};

const deleteKey = (root, dotted) => {
  const parts = dotted.split('.');
  const key = parts.pop();
  const parent = parts.length ? getPath(root, parts.join('.')) : root;
  if (!parent || !(key in parent)) return false;
  delete parent[key];
  return true;
};

/** Recursively reorder `target` keys to match `reference`; extras are appended (and collected). */
const reorderLike = (reference, target, prefix = '', extras = []) => {
  if (typeof target !== 'object' || target === null) return { result: target, extras };
  const result = {};
  for (const k of Object.keys(reference ?? {})) {
    if (!(k in target)) continue;
    if (reference[k] !== null && typeof reference[k] === 'object' && typeof target[k] === 'object') {
      result[k] = reorderLike(reference[k], target[k], prefix ? `${prefix}.${k}` : k, extras).result;
    } else {
      result[k] = target[k];
    }
  }
  for (const k of Object.keys(target)) {
    if (!(k in result)) {
      extras.push(prefix ? `${prefix}.${k}` : k);
      result[k] = target[k];
    }
  }
  return { result, extras };
};

// ─── JS TRANSLATIONS block I/O ───────────────────────────────────────────────
//
// Shipped shape: TRANSLATION_KEYS (dotted leaf paths, stated once) + the
// per-language value arrays indexed on that same list. A value identical to
// English's own is stored as the sentinel 0 instead of repeating the string -
// both key names and cross-language duplicate text used to be baked into every
// one of the 39 language trees.
//
// Those arrays are cut in two at EDITOR_KEY_START, and that cut is what keeps
// the editor's share out of the shipped bundle: src/ imports TRANSLATIONS_CARD
// and TRANSLATIONS_EDITOR_EN, never TRANSLATIONS_EDITOR, so esbuild drops the
// latter (scripts/check-i18n-split.js fails the build if it ever stops doing
// so). scripts/build.js writes that binding out as one JSON per language next
// to the bundle, fetched when an editor opens.
//
// Every other command in this file still works with the nested
// {lang: {a: {b: 'x'}}} shape via readJsTranslations()/writeJsTranslations() -
// only these two functions know about the flat on-disk representation.

/** Index of the first editor key - the cut. Bundled keys lead the list. */
const editorStartOf = (keys) => {
  const start = keys.findIndex((k) => !k.startsWith(BUNDLED_PREFIX));
  if (start === -1) return keys.length;
  const stray = keys.slice(start).find((k) => k.startsWith(BUNDLED_PREFIX));
  if (stray) die(`${BUNDLED_PREFIX}* keys must all come first in ${TEMPLATE} (found ${stray} after ${keys[start]})`);
  return start;
};


const readJsTranslations = () => {
  let block;
  try {
    block = parseJsBlock(fs.readFileSync(JS_FILE, 'utf8'));
  } catch (err) {
    die(err.message);
  }
  const { keys, rows } = block;
  const tree = {};
  for (const lang of Object.keys(rows)) {
    const langTree = {};
    keys.forEach((key, i) => setPath(langTree, key, rows[lang][i] === 0 ? rows.en[i] : rows[lang][i]));
    tree[lang] = langTree;
  }
  return tree;
};

// Backslashes must be escaped before quotes (order matters), and literal newlines must
// become \n: a translation value containing either would otherwise generate a corrupted
// (or syntactically invalid) TRANSLATIONS block without any error at generation time.
const jsString = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '')}'`;

const formatJS = (value, indent = 0) => {
  const pad = '  '.repeat(indent);
  const pad1 = '  '.repeat(indent + 1);
  if (Array.isArray(value)) {
    const items = value.map((v) => pad1 + formatJS(v, indent + 1));
    return `[\n${items.join(',\n')}\n${pad}]`;
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value).map(([k, v]) => {
      const needsQuotes = !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k);
      const key = needsQuotes ? jsString(k) : k;
      return `${pad1}${key}: ${formatJS(v, indent + 1)}`;
    });
    return `{\n${entries.join(',\n')}\n${pad}}`;
  }
  return typeof value === 'number' ? String(value) : jsString(value);
};

const writeJsTranslations = (translations) => {
  const keys = Object.keys(flatten(translations.en));
  const editorStart = editorStartOf(keys);
  const enValues = keys.map((k) => getPath(translations.en, k));
  const rows = {};
  for (const lang of Object.keys(translations)) {
    rows[lang] = keys.map((k, i) => {
      const v = getPath(translations[lang], k);
      // null marks a key not yet translated (see cmdAddKey) - same 0 sentinel
      // as a real value that happens to match English, so it falls back the
      // same way at runtime.
      return lang !== 'en' && (v === null || v === enValues[i]) ? 0 : v;
    });
  }
  const card = {};
  const editor = {};
  for (const [lang, row] of Object.entries(rows)) {
    card[lang] = row.slice(0, editorStart);
    // English is the fallback dictionary every other language resolves its 0
    // sentinels against, so its editor half stays in the bundle on its own.
    if (lang !== 'en') editor[lang] = row.slice(editorStart);
  }
  const content = [
    '/*',
    ' * Generated from translations/*.json (source of truth) - do not edit by',
    ' * hand. Run: node scripts/translations.js synchronize --to-js',
    ' *',
    ` * TRANSLATION_KEYS[${editorStart}..] are the editor's own keys.`,
    ' * TRANSLATIONS_EDITOR is deliberately imported by nothing in src/: it is',
    ' * written out as one JSON per language by scripts/build.js and fetched',
    ' * when an editor opens, so it never reaches the shipped bundle.',
    ' */',
    '',
    '/* eslint-disable sonarjs/no-duplicate-string */',
    `const TRANSLATION_KEYS = ${formatJS(keys)};`,
    `const EDITOR_KEY_START = ${editorStart};`,
    `const TRANSLATIONS_CARD = ${formatJS(card)};`,
    `const TRANSLATIONS_EDITOR_EN = ${formatJS(rows.en.slice(editorStart))};`,
    `const TRANSLATIONS_EDITOR = ${formatJS(editor)};`,
    '/* eslint-enable sonarjs/no-duplicate-string */',
    '',
    'export { TRANSLATION_KEYS, EDITOR_KEY_START, TRANSLATIONS_CARD, TRANSLATIONS_EDITOR_EN, TRANSLATIONS_EDITOR };',
    '',
  ].join('\n');
  fs.writeFileSync(JS_FILE, content);
};

// .ts as well as .js: src/ is TypeScript now, and matching .js alone left the
// corpus below empty - every key then read as unused, and every localize() path
// as fine.
const walkSourceFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walkSourceFiles(full) : (/\.(js|ts)$/.test(entry.name) ? [full] : []);
});

/** Every src/ file's code, translations.js itself excluded — for code-usage searches. */
const jsCodeWithoutTranslations = () =>
  walkSourceFiles(SRC_DIR).filter((f) => f !== JS_FILE).map((f) => fs.readFileSync(f, 'utf8')).join('\n');

// ─── diff engine ─────────────────────────────────────────────────────────────

/** Compare two flat maps: what `b` is missing / has extra / has changed vs `a`. */
const diffFlat = (a, b) => {
  const missing = [], extra = [], changed = [];
  for (const k of Object.keys(a)) {
    if (!(k in b)) missing.push(k);
    else if (a[k] !== b[k]) changed.push(k);
  }
  for (const k of Object.keys(b)) if (!(k in a)) extra.push(k);
  return { missing, extra, changed };
};

// ─── commands ────────────────────────────────────────────────────────────────

/** validate: JSON ↔ JS per language + JSON ↔ template structure. Returns issue count. */
// structureOnly skips the JSON↔JS sync check (steps 1 and 3 below): a
// contributor editing only translations/*.json has no reachable way to
// regenerate the JS block themselves (synchronize --to-js is a maintainer
// step run before release), so gating their PR on JS sync would block
// translation contributions on something they can't fix. Well-formed JSON +
// template structure is the part they actually control and can act on.
const cmdValidate = ({ quiet = false, structureOnly = false } = {}) => {
  const jsTr = readJsTranslations();
  const template = flatten(readJSON(path.join(DIR, TEMPLATE)));
  let issues = 0;
  const ok = [];

  for (const lang of allLangs()) {
    const json = flatten(readJSON(langPath(lang)));
    const problems = [];

    // 1. JSON ↔ JS (per-language content sync)
    if (!structureOnly) {
      if (!jsTr[lang]) {
        problems.push('  language missing in JS (run: synchronize --to-js)');
      } else {
        const js = flatten(jsTr[lang]);
        const contentDiff = diffFlat(json, js);
        for (const k of contentDiff.missing) problems.push(`  in JSON only (JS outdated): ${k}`);
        for (const k of contentDiff.extra) problems.push(`  in JS only (JSON is the source!): ${k}`);
        for (const k of contentDiff.changed) {
          // null (untranslated) always decompresses to the English text - expected, not a drift.
          if (json[k] === null) continue;
          problems.push(`  value differs (JSON ≠ JS): ${k}`);
        }
      }
    }

    // 2. JSON ↔ template (structural reference)
    const templateDiff = diffFlat(template, json);
    for (const k of templateDiff.missing) problems.push(`  missing vs template: ${k}`);
    for (const k of templateDiff.extra) problems.push(`  not in template: ${k}`);

    if (problems.length) {
      issues += problems.length;
      console.log(`❌ ${lang}`);
      problems.forEach((p) => console.log(p));
    } else {
      ok.push(lang);
    }
  }

  // 3. languages present in JS but with no JSON file
  if (!structureOnly) {
    for (const lang of Object.keys(jsTr)) {
      if (!allLangs().includes(lang)) {
        issues++;
        console.log(`❌ ${lang}: present in JS but has no JSON file (ghost language)`);
      }
    }
  }

  if (!quiet && ok.length) console.log(`✅ ${ok.join(', ')}`);
  if (issues === 0) {
    console.log(
      structureOnly
        ? '✅ All translations are well-formed and match the template structure.'
        : '✅ All translations are in sync.',
    );
  } else {
    console.log(
      `❌ ${issues} issue(s)${structureOnly ? ' (structure only — JS sync not checked)' : ''}. Source of truth: translations/*.json`,
    );
  }
  return issues;
};

const applyToJs = (dryRun) => {
  const fromJson = {};
  for (const lang of allLangs()) fromJson[lang] = readJSON(langPath(lang));
  if (dryRun) {
    const jsTr = readJsTranslations();
    for (const lang of Object.keys(fromJson)) {
      const diff = diffFlat(flatten(fromJson[lang]), flatten(jsTr[lang] ?? {}));
      const changeCount = diff.missing.length + diff.extra.length + diff.changed.length;
      if (changeCount) console.log(`~ ${lang}: +${diff.missing.length} -${diff.extra.length} ~${diff.changed.length}`);
    }
    for (const lang of Object.keys(readJsTranslations())) {
      if (!(lang in fromJson)) console.log(`~ ${lang}: would be removed from JS (no JSON file)`);
    }
    console.log('(dry-run: nothing written)');
    return;
  }
  writeJsTranslations(fromJson);
  console.log(`✅ JS TRANSLATIONS regenerated from JSON (${Object.keys(fromJson).length} languages).`);
};

const applyToJson = (dryRun) => {
  const jsTr = readJsTranslations();
  for (const [lang, tree] of Object.entries(jsTr)) {
    const file = langPath(lang);
    const current = fs.existsSync(file) ? readJSON(file) : {};
    const diff = diffFlat(flatten(tree), flatten(current));
    const changeCount = diff.missing.length + diff.extra.length + diff.changed.length;
    if (!changeCount) continue;
    console.log(`~ ${lang}: +${diff.missing.length} -${diff.extra.length} ~${diff.changed.length}${dryRun ? '' : ' → written'}`);
    if (!dryRun) writeJSON(file, tree);
  }
  if (dryRun) console.log('(dry-run: nothing written)');
  else console.log('✅ JSON files overwritten from the JS block. Review the git diff carefully.');
};

const cmdSynchronize = async (args) => {
  const dryRun = args.includes('--dry-run');
  if (args.includes('--to-js')) { applyToJs(dryRun); return; }
  if (args.includes('--to-json')) { applyToJson(dryRun); return; }

  const issues = cmdValidate({ quiet: true });
  if (issues === 0) return;

  if (!process.stdin.isTTY) {
    console.log('\nRun again with --to-js (nominal flow: JSON → JS) or --to-json (backport a JS-side edit).');
    process.exitCode = 1;
    return;
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((res) => rl.question('\nApply [j] JSON → JS, [s] JS → JSON, [q] quit? ', res));
  rl.close();
  if (answer === 'j') applyToJs(false);
  else if (answer === 's') applyToJson(false);
  else console.log('Nothing done.');
};

/** Escapes a translation key segment for use inside a RegExp. */
const escapeForSearch = (segment) => segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** orphans: heuristic detection of unused translation keys and unresolved localize() paths. */
const cmdOrphans = () => {
  const code = jsCodeWithoutTranslations();
  const en = readJSON(langPath('en'));
  const flat = flatten(en);

  // A key is looked up under a name the code rarely spells the same way:
  // EditorBase derives editor.field_helper.<helperKey> from a field name with
  // its dots turned into underscores (base.ts's helperKey), so '_' has to match
  // '.' too. A name built by concatenation can't be proven by any search at all -
  // those are listed apart rather than called orphans.
  const COMPOSED_SUFFIX = /_(custom_)?toggle$/;
  // card.msg.words.*: getMessage builds the name from the error code's own
  // suffix (invalidTypePositiveInteger -> positiveinteger), never spells it.
  const COMPOSED_GROUP = 'card.msg.words.';
  const searchFor = (last) =>
    new RegExp(`\\b${escapeForSearch(last).replace(/_/g, '[._]')}\\b`);

  console.log('— Keys never referenced in the code (heuristic: last segment, "_" matching "." too) —');
  let candidates = 0;
  const composed = [];
  for (const key of Object.keys(flat)) {
    const last = key.split('.').pop();
    if (searchFor(last).test(code)) continue;
    if (COMPOSED_SUFFIX.test(last) || key.startsWith(COMPOSED_GROUP)) {
      composed.push(key);
      continue;
    }
    console.log(`  🕳️  ${key}`);
    candidates++;
  }
  if (!candidates) console.log('  none 🎉');

  console.log('\n— Reached by a name built at runtime - verify by hand —');
  for (const key of composed) console.log(`  🧩 ${key}`);
  if (!composed.length) console.log('  none');

  console.log('\n— localize() literal paths not found in en.json —');
  let broken = 0;
  for (const match of code.matchAll(/localize\(\s*'([^']+)'\s*\)/g)) {
    const localizePath = match[1];
    if (getPath(en, localizePath) === undefined) {
      console.log(`  💥 ${localizePath}`);
      broken++;
    }
  }
  if (!broken) console.log('  none 🎉');
  return candidates + broken === 0 ? 0 : 1;
};

const cmdStats = () => {
  const template = flatten(readJSON(path.join(DIR, TEMPLATE)));
  const total = Object.keys(template).length;
  const rows = allLangs().map((lang) => {
    const flat = flatten(readJSON(langPath(lang)));
    const templateDiff = diffFlat(template, flat);
    const untranslated = Object.values(flat).filter((v) => v === null).length;
    const pct = Math.round(((total - templateDiff.missing.length - untranslated) / total) * 100);
    return { lang, pct, missing: templateDiff.missing.length, extra: templateDiff.extra.length, untranslated };
  }).sort((a, b) => a.pct - b.pct || a.lang.localeCompare(b.lang));
  console.log(`Reference: ${TEMPLATE} — ${total} keys\n`);
  for (const r of rows) {
    const flag = r.pct === 100 && r.extra === 0 && r.untranslated === 0 ? '✅' : '⚠️ ';
    console.log(
      `${flag} ${r.lang.padEnd(8)} ${String(r.pct).padStart(3)}%  missing:${String(r.missing).padStart(3)}  ` +
        `untranslated:${String(r.untranslated).padStart(3)}  extra:${r.extra}`,
    );
  }
};

const parseFlag = (args, name) => {
  const flagIndex = args.indexOf(name);
  return flagIndex >= 0 && args[flagIndex + 1] ? args[flagIndex + 1] : null;
};

const cmdAddKey = (args) => {
  // positional args = anything that is neither a flag nor the value following a flag
  const flagValueIndexes = new Set(
    ['--values', '--after', '--en'].map((flag) => args.indexOf(flag) + 1).filter((index) => index > 0)
  );
  const [keyPath] = args.filter((arg, index) => !arg.startsWith('--') && !flagValueIndexes.has(index));
  if (!keyPath || !keyPath.includes('.')) die('usage: add-key <dotted.path> (--values <file.json> | --en "<text>") [--after <siblingKey>]');
  const valuesFile = parseFlag(args, '--values');
  const enText = parseFlag(args, '--en');
  const after = parseFlag(args, '--after');
  const values = valuesFile ? readJSON(valuesFile) : {};
  if (enText) values.en = enText;
  if (!values.en) die('an English value is required (--en or an "en" entry in --values)');

  const parts = keyPath.split('.');
  const key = parts.pop();
  const parentPath = parts.join('.');

  // Any language without an explicit translation gets null, not values.en:
  // null mechanically falls back to English at runtime (same 0 sentinel as a
  // real coincidental match, see writeJsTranslations) while staying visibly
  // untranslated to stats/validate - a literal English string would look
  // like a real translation forever.
  const translatedCount = Object.keys(values).filter((lang) => lang !== 'en').length;
  for (const lang of allLangs()) {
    const data = readJSON(langPath(lang));
    const value = lang === 'en' ? values.en : (values[lang] ?? null);
    if (!insertKey(data, parentPath, key, value, after)) die(`parent "${parentPath}" not found in ${lang}.json`);
    writeJSON(langPath(lang), data);
  }
  // template.json is the structural key reference, never shipped - stays
  // empty, unlike every real language file above.
  const tpl = readJSON(path.join(DIR, TEMPLATE));
  insertKey(tpl, parentPath, key, '', after);
  writeJSON(path.join(DIR, TEMPLATE), tpl);
  console.log(
    `✅ ${keyPath} added to ${allLangs().length} languages + template ` +
      `(${translatedCount} translated, rest set to null → falls back to en until translated).`,
  );
  console.log('Now run: node scripts/translations.js synchronize --to-js');
};

const cmdRenameKey = (args) => {
  const [oldPath, newPath] = args.filter((a) => !a.startsWith('--'));
  if (!oldPath || !newPath) die('usage: rename-key <old.dotted.path> <new.dotted.path>');
  const oldParts = oldPath.split('.'), newParts = newPath.split('.');
  const sameParent = oldParts.slice(0, -1).join('.') === newParts.slice(0, -1).join('.');

  const renameIn = (file) => {
    const data = readJSON(file);
    const value = getPath(data, oldPath);
    if (value === undefined) return false;
    if (sameParent) {
      // in-place rename preserving key order
      const parent = getPath(data, oldParts.slice(0, -1).join('.')) ?? data;
      const oldKey = oldParts.at(-1), newKey = newParts.at(-1);
      const rebuilt = {};
      for (const [k, v] of Object.entries(parent)) rebuilt[k === oldKey ? newKey : k] = v;
      for (const k of Object.keys(parent)) delete parent[k];
      Object.assign(parent, rebuilt);
    } else {
      deleteKey(data, oldPath);
      // setPath (not insertKey): a cross-parent rename's new parent may not
      // exist yet (e.g. grouping a flat key under a fresh nested group) -
      // insertKey silently no-ops without it, dropping the value.
      setPath(data, newPath, value);
    }
    writeJSON(file, data);
    return true;
  };

  let renamedCount = 0;
  for (const lang of allLangs()) if (renameIn(langPath(lang))) renamedCount++;
  renameIn(path.join(DIR, TEMPLATE));
  console.log(`✅ renamed in ${renamedCount} languages + template. Remember to update the code, then: synchronize --to-js`);
};

const cmdRemoveKey = (args) => {
  const [keyPath] = args.filter((a) => !a.startsWith('--'));
  if (!keyPath) die('usage: remove-key <dotted.path>');
  let removedCount = 0;
  for (const lang of allLangs()) {
    const data = readJSON(langPath(lang));
    if (deleteKey(data, keyPath)) { writeJSON(langPath(lang), data); removedCount++; }
  }
  const tpl = readJSON(path.join(DIR, TEMPLATE));
  if (deleteKey(tpl, keyPath)) writeJSON(path.join(DIR, TEMPLATE), tpl);
  console.log(`✅ ${keyPath} removed from ${removedCount} languages + template. Now run: synchronize --to-js`);
};

const cmdFill = (args) => {
  const [lang] = args.filter((a) => !a.startsWith('--') && a !== parseFlag(args, '--from'));
  if (!lang) die('usage: fill <lang> [--from <lang=en>] [--mark]');
  const from = parseFlag(args, '--from') ?? 'en';
  const mark = args.includes('--mark');
  if (!fs.existsSync(langPath(lang))) die(`${lang}.json does not exist (use new-lang)`);
  const source = readJSON(langPath(from));
  const target = readJSON(langPath(lang));
  const srcFlat = flatten(source), tgtFlat = flatten(target);
  let filled = 0;
  for (const [key, value] of Object.entries(srcFlat)) {
    if (key in tgtFlat) continue;
    const parts = key.split('.');
    insertKey(target, parts.slice(0, -1).join('.'), parts.at(-1), mark ? `[TODO] ${value}` : value);
    filled++;
  }
  // normalize order to the source language for clean diffs
  const { result } = reorderLike(source, target);
  writeJSON(langPath(lang), result);
  console.log(`✅ ${lang}: ${filled} key(s) filled from ${from}${mark ? ' (marked [TODO])' : ''}. Now run: synchronize --to-js`);
};

const cmdSort = () => {
  const template = readJSON(path.join(DIR, TEMPLATE));
  for (const lang of allLangs()) {
    const { result, extras } = reorderLike(template, readJSON(langPath(lang)));
    writeJSON(langPath(lang), result);
    if (extras.length) console.log(`⚠️  ${lang}: keys not in template appended at end: ${extras.join(', ')}`);
  }
  console.log(`✅ ${allLangs().length} files reordered to match ${TEMPLATE}. Now run: synchronize --to-js`);
};

const cmdNewLang = (args) => {
  const [code] = args.filter((a) => !a.startsWith('--'));
  if (!code) die('usage: new-lang <code> [--mark]');
  if (fs.existsSync(langPath(code))) die(`${code}.json already exists`);
  const mark = args.includes('--mark');
  const en = readJSON(langPath('en'));
  const markTree = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) =>
    [k, typeof v === 'object' && v !== null ? markTree(v) : (mark ? `[TODO] ${v}` : v)]));
  writeJSON(langPath(code), markTree(en));
  console.log(`✅ ${code}.json created from en${mark ? ' (all values marked [TODO])' : ''}.`);
  console.log('Translate it, then run: synchronize --to-js');
};

// ─── entry point ─────────────────────────────────────────────────────────────

const HELP = `translations.js — unified translation toolchain (source of truth: translations/*.json)

  validate [--structure-only]  compare JSON ↔ JS ↔ template, report every drift (exit 1 if any)
                               --structure-only: skip the JS sync check, only validate
                               well-formed JSON + template structure (for contributor CI)
  synchronize [--to-js|--to-json] [--dry-run]
                               validate then apply: JSON → JS (nominal) or JS → JSON (backport)
  orphans                      heuristic: translation keys unused by the code + broken localize() paths
  stats                        per-language coverage vs template.json
  add-key <path> (--values <file>|--en "<text>") [--after <sibling>]
                               add a key to every language + template (fallback: en value)
  rename-key <old> <new>       rename/move a key everywhere (order preserved)
  remove-key <path>            delete a key everywhere
  fill <lang> [--from en] [--mark]
                               copy missing keys from another language ([TODO]-mark optional)
  sort                         reorder every JSON to match template.json key order
  new-lang <code> [--mark]     bootstrap a new language file from en

After any change: synchronize --to-js regenerates the JS block. Never edit it by hand.`;

const main = async () => {
  const [cmd, ...args] = process.argv.slice(2);
  try {
    switch (cmd) {
      case 'validate':
        process.exitCode = cmdValidate({ structureOnly: args.includes('--structure-only') }) === 0 ? 0 : 1;
        break;
      case 'synchronize': await cmdSynchronize(args); break;
      case 'orphans': process.exitCode = cmdOrphans(); break;
      case 'stats': cmdStats(); break;
      case 'add-key': cmdAddKey(args); break;
      case 'rename-key': cmdRenameKey(args); break;
      case 'remove-key': cmdRemoveKey(args); break;
      case 'fill': cmdFill(args); break;
      case 'sort': cmdSort(); break;
      case 'new-lang': cmdNewLang(args); break;
      default: console.log(HELP);
    }
  } catch (error) {
    if (!(error instanceof FatalError)) throw error;
    console.error(error.message);
    process.exitCode = 1;
  }
};

main();
