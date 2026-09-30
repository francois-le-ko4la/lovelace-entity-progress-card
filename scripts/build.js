'use strict';

// Builds dist/entity-progress-card.js from the src/ module split - the only
// build pipeline; HACS installs from the release assets this produces (see
// .github/workflows/release.yaml), there's no root-level file anymore.
//
// src/index.ts is the entry point: it registers the card/badge/feature types
// and prints the console banner. The visual editors ship beside it in
// <stem>-editor.js (src/editor/entry.ts), imported the first time one opens;
// the modules both need exist once, in the bundle, which hands them to the
// editor file through a host table - see development.md's Editor file.
// src/ mixes .ts and plain .js - esbuild bundles both natively.
//
// esbuild bundles the ES modules into one script first (import/export
// resolved away), then a CSS-in-JS resolve pass (scripts/lib/inline-css.js -
// esbuild's own --minify never touches CSS embedded in JS template literals)
// runs over the bundled source, then a final esbuild pass produces the
// shipped file. Both the CSS pass and this final pass only minify for --prod;
// a test/dev build stays fully readable.
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const { resolveCssBlocks } = require('./lib/inline-css.js');
const { forceCleanCardContext } = require('./lib/release-flags.js');
const { JS_FILE, parseJsBlock } = require('./lib/i18n-block.js');

const OUTDIR = 'dist';
const ROOT = path.resolve(__dirname, '..');
const CARD_ENTRY = 'src/index.ts';
const EDITOR_ENTRY = 'src/editor/entry.ts';
// --prod: force dev:false + all debug flags false regardless of the
// committed source state (see scripts/lib/release-flags.js). Default (no
// flag, "test" build): CARD_CONTEXT is left exactly as committed.
const isProd = process.argv.includes('--prod');
// Filename suffix keeps a stray test build from ever being mistaken for (or
// overwriting) the shipped prod one in dist/ - and lets a dev and a prod file
// loaded side by side each find their own translation files.
const STEM = `entity-progress-card${isProd ? '' : '_dev'}`;
const OUTFILE = `${STEM}.js`;
const EDITOR_OUTFILE = `${STEM}-editor.js`;
const VERSION = fs.readFileSync(path.join(ROOT, 'src/utils/meta.ts'), 'utf8').match(/const VERSION = '([^']+)'/)[1];
// Per build and version: a dev and a prod bundle loaded side by side, or an
// editor file left over from another version, never read each other's table.
const HOST_KEY = `epb-host:${STEM}:${VERSION}`;
const HOST_TABLE = 'epb-host-table';
// The es2021 floor (#128) is about class static blocks, which break Chrome 92.
// Every other class feature runs natively there, so it's kept native instead of
// being lowered to WeakMap helpers.
const NATIVE_CLASS_FEATURES = {
  'class-field': true,
  'class-static-field': true,
  'class-private-field': true,
  'class-private-method': true,
  'class-private-accessor': true,
  'class-private-static-field': true,
  'class-private-static-method': true,
  'class-private-static-accessor': true,
  'class-private-brand-check': true,
  'class-static-blocks': false,
};

// The editor's translations ship beside the bundle rather than inside it: one
// positional array per language, indexed on TRANSLATION_KEYS from
// EDITOR_KEY_START on, fetched when an editor opens (see
// HassProviderSingleton#ensureEditorTranslations). English stays in the bundle
// as the fallback dictionary, so it gets no file here.
function writeEditorTranslations() {
  const { editor } = parseJsBlock(fs.readFileSync(JS_FILE, 'utf8'));
  for (const stale of fs.readdirSync(OUTDIR)) {
    if (stale.startsWith(`${STEM}-`) && stale.endsWith('.json')) fs.unlinkSync(path.join(OUTDIR, stale));
  }
  let bytes = 0;
  for (const [lang, values] of Object.entries(editor)) {
    const body = JSON.stringify(values);
    bytes += body.length;
    fs.writeFileSync(path.join(OUTDIR, `${STEM}-${lang}.json`), body);
  }
  return { count: Object.keys(editor).length, bytes };
}

const BUNDLE_OPTIONS = {
  absWorkingDir: ROOT,
  bundle: true,
  format: 'esm',
  write: false,
  minify: false,
  metafile: true,
  // Bake dev mode into the *_dev.js build itself (vs the shipped .js): the
  // URL can't be read when the bundle is loaded as an ES module (no
  // document.currentScript), so a filename/?dev=true signal alone would miss
  // it. ?dev=true still works as a runtime override on the prod file.
  define: { __EPB_DEV_BUILD__: isProd ? 'false' : 'true' },
};

// The card modules the editor's own code imports: what the bundle hands over.
function sharedModules() {
  const card = esbuild.buildSync({ ...BUNDLE_OPTIONS, entryPoints: [CARD_ENTRY] }).metafile.inputs;
  const editor = esbuild.buildSync({ ...BUNDLE_OPTIONS, entryPoints: [EDITOR_ENTRY] }).metafile.inputs;
  const shared = new Set();
  for (const [file, input] of Object.entries(editor)) {
    if (file in card) continue;
    for (const { path: imported } of input.imports) if (imported in card) shared.add(imported);
  }
  return [...shared].sort();
}

// src/index.ts, then the table: evaluated once the bundle has run, long before
// any editor opens. First copy wins and locks it: a second load of the same
// version (HACS plus a manual resource), or any later script, can't swap it.
function cardEntry(shared) {
  const table = shared.map((file, i) => `${JSON.stringify(file)}: m${i}`).join(', ');
  return [
    `import './${CARD_ENTRY}';`,
    ...shared.map((file, i) => `import * as m${i} from './${file}';`),
    `const hostKey = Symbol.for(${JSON.stringify(HOST_KEY)});`,
    `if (!(hostKey in globalThis)) Object.defineProperty(globalThis, hostKey, { value: Object.freeze({ ${table} }) });`,
  ].join('\n');
}

// Every editor import of a shared module reads the bundle's copy back from the
// table instead of bundling a second one - a second HassProviderSingleton, a
// second schema.
function hostPlugin(shared) {
  const sharedPaths = new Map(shared.map((file) => [path.join(ROOT, file), file]));
  return {
    name: 'epb-host',
    setup(build) {
      build.onResolve({ filter: new RegExp(`^${HOST_TABLE}$`) }, () => ({ path: HOST_TABLE, namespace: 'epb-host' }));
      build.onResolve({ filter: /^\./ }, async (args) => {
        if (args.pluginData === 'epb-host') return undefined;
        const { path: resolved, errors } = await build.resolve(args.path, {
          kind: args.kind,
          resolveDir: args.resolveDir,
          pluginData: 'epb-host',
        });
        const file = errors.length === 0 ? sharedPaths.get(resolved) : undefined;
        return file ? { path: file, namespace: 'epb-host' } : undefined;
      });
      build.onLoad({ filter: /.*/, namespace: 'epb-host' }, (args) => ({
        loader: 'js',
        contents:
          args.path === HOST_TABLE
            ? `const table = globalThis[Symbol.for(${JSON.stringify(HOST_KEY)})];
if (!table) throw new Error('this editor file belongs to another version than the card (${VERSION})');
module.exports = table;`
            : `module.exports = require('${HOST_TABLE}')[${JSON.stringify(args.path)}];`,
      }));
    },
  };
}

function finish(bundled, { cardContext }) {
  const cleaned = isProd && cardContext ? forceCleanCardContext(bundled) : bundled;
  const { src, minifiedCount } = resolveCssBlocks(cleaned, isProd);
  const { code } = esbuild.transformSync(src, { minify: isProd, target: 'es2021', supported: NATIVE_CLASS_FEATURES });
  return { code, src, minifiedCount };
}

async function main() {
  const shared = sharedModules();
  const card = esbuild.buildSync({
    ...BUNDLE_OPTIONS,
    stdin: { contents: cardEntry(shared), resolveDir: ROOT, sourcefile: 'card-entry.js', loader: 'js' },
  });
  const editor = await esbuild.build({ ...BUNDLE_OPTIONS, entryPoints: [EDITOR_ENTRY], plugins: [hostPlugin(shared)] });

  const twice = Object.keys(editor.metafile.inputs).filter((file) => file in card.metafile.inputs);
  if (twice.length > 0) throw new Error(`bundled in both the card and the editor file: ${twice.join(', ')}`);

  const bundled = card.outputFiles[0].text;
  const built = finish(bundled, { cardContext: true });
  const builtEditor = finish(editor.outputFiles[0].text, { cardContext: false });

  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(path.join(OUTDIR, OUTFILE), built.code);
  fs.writeFileSync(path.join(OUTDIR, EDITOR_OUTFILE), builtEditor.code);
  const cssVerb = isProd ? 'minified' : 'resolved';
  const variant = isProd ? 'prod' : 'test';
  console.log(
    `✅ Built ${path.join(OUTDIR, OUTFILE)} from ${CARD_ENTRY} [${variant}] (${built.minifiedCount} CSS block(s) ${cssVerb}, bundled source ${bundled.length} → ${built.src.length} bytes pre-JS-minify).`,
  );
  console.log(
    `✅ Built ${path.join(OUTDIR, EDITOR_OUTFILE)} from ${EDITOR_ENTRY} [${variant}] (${shared.length} module(s) read from the bundle, none bundled twice).`,
  );

  const editorTranslations = writeEditorTranslations();
  console.log(
    `✅ Wrote ${editorTranslations.count} editor translation file(s) ${path.join(OUTDIR, `${STEM}-<lang>.json`)} (${editorTranslations.bytes} bytes total).`,
  );
}

main().catch((error) => {
  console.error(`❌ ${error.message}`);
  process.exit(1);
});
