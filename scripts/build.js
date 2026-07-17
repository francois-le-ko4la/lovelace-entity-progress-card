#!/usr/bin/env node
'use strict';

// esbuild --minify never touches CSS embedded in JS strings/template literals
// - only actual CSS content is minified here, the rest of the file is plain
// JS handled by esbuild's normal pass afterwards.
//
// Every CSS-in-JS block in the source is tagged with the `css` identity tag
// (see its own comment in entity-progress-card.js) specifically so this
// script can find all of them by that one marker, instead of needing to know
// each variable/usage by name - a future CSS block just needs the tag to be
// picked up automatically.
//
// Resolving a tagged block's value:
//   - `const NAME = css\`...\`;` at the top level: tried in isolation first
//     (fast, works for anything self-contained). If that throws (the block's
//     `${...}` interpolations reference other constants defined earlier in
//     the file, e.g. CARD_CSS -> CARD.htmlStructure...), falls back to
//     evaluating everything in the file up to that declaration.
//   - Any other usage (e.g. `style.textContent = css\`...\``, inside a method
//     body): isolation only - there's no top-level variable to re-export for
//     a prefix-eval fallback. Left unminified (with a warning) if isolation
//     fails, rather than risk mishandling it.
//
// The source file itself (what HACS installs on the default branch) is never
// touched - only the dist/ build output.
const fs = require('fs');
const path = require('path');
const os = require('os');
const esbuild = require('esbuild');

const SOURCE = 'entity-progress-card.js';
const OUTDIR = 'dist';
const CSS_TAG_RE = /(?<![\w$])css`/g;

// Identity tag, matching the one in entity-progress-card.js - provided so an
// isolated eval of a `css\`...\`` expression has `css` in scope.
const CSS_TAG_SHIM = "const css = (s, ...v) => s.reduce((a, x, i) => a + x + (i < v.length ? v[i] : ''), '');";

// Scans forward from `contentStart` (just after the opening backtick) and
// returns the index of the matching closing backtick, correctly skipping
// over `${...}` interpolations (balanced braces, nested strings/template
// literals, escapes) instead of stopping at the first backtick found.
function findTemplateLiteralEnd(src, contentStart) {
  let i = contentStart;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '\\') {
      i += 2;
      continue;
    }
    if (ch === '`') return i;
    if (ch === '$' && src[i + 1] === '{') {
      i = skipInterpolation(src, i + 2);
      continue;
    }
    i++;
  }
  throw new Error('Unterminated template literal.');
}

function skipInterpolation(src, start) {
  let i = start;
  let depth = 1;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '\\') {
      i += 2;
      continue;
    }
    if (ch === '{') {
      depth++;
      i++;
      continue;
    }
    if (ch === '}') {
      depth--;
      i++;
      if (depth === 0) return i;
      continue;
    }
    if (ch === '"' || ch === "'") {
      i = skipStringLiteral(src, i);
      continue;
    }
    if (ch === '`') {
      i = findTemplateLiteralEnd(src, i + 1) + 1;
      continue;
    }
    i++;
  }
  throw new Error('Unterminated interpolation.');
}

function skipStringLiteral(src, start) {
  const quote = src[start];
  let i = start + 1;
  while (i < src.length) {
    if (src[i] === '\\') {
      i += 2;
      continue;
    }
    if (src[i] === quote) return i + 1;
    i++;
  }
  throw new Error('Unterminated string literal.');
}

// Finds the end of the enclosing statement (the first top-level ';' after
// `fromIndex`, outside any string/template literal) - used for the
// full-prefix eval fallback.
function findStatementEnd(src, fromIndex) {
  let i = fromIndex;
  let quote = null;
  while (i < src.length) {
    const ch = src[i];
    if (quote) {
      if (ch === '\\') {
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      i++;
      continue;
    }
    if (ch === ';') return i + 1;
    i++;
  }
  throw new Error(`Statement end not found from index ${fromIndex}.`);
}

function evalInFile(code) {
  const tmpFile = path.join(os.tmpdir(), `epb-css-build-${Date.now()}-${Math.random().toString(36).slice(2)}.js`);
  fs.writeFileSync(tmpFile, code);
  try {
    delete require.cache[require.resolve(tmpFile)];
    return require(tmpFile);
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

function minifyCss(css) {
  return esbuild.transformSync(css, { loader: 'css', minify: true }).code.trim();
}

function main() {
  let src = fs.readFileSync(SOURCE, 'utf8');
  const originalLength = src.length;
  let minifiedCount = 0;
  let skippedCount = 0;

  // Iterate right-to-left so earlier replacements don't shift the indices of
  // matches still to be processed.
  const matches = [...src.matchAll(CSS_TAG_RE)].reverse();

  for (const m of matches) {
    const tagStart = m.index;
    const contentStart = tagStart + m[0].length;
    const contentEnd = findTemplateLiteralEnd(src, contentStart);
    const literalEnd = contentEnd + 1; // include the closing backtick
    const fullExpr = src.slice(tagStart, literalEnd); // css`...`

    let resolved;
    try {
      resolved = evalInFile(`${CSS_TAG_SHIM}\nmodule.exports = ${fullExpr};\n`);
    } catch {
      const constMatch = /const\s+(\w+)\s*=\s*$/.exec(src.slice(0, tagStart));
      if (!constMatch) {
        console.warn(`⚠️  Skipped a css\`...\` block at index ${tagStart} (not self-contained, no top-level const).`);
        skippedCount++;
        continue;
      }
      const varName = constMatch[1];
      try {
        const prefix = `${src.slice(0, literalEnd)}\nmodule.exports = ${varName};\n`;
        resolved = evalInFile(prefix);
      } catch (error) {
        console.warn(`⚠️  Skipped css\`...\` block for ${varName}: ${error.message}`);
        skippedCount++;
        continue;
      }
    }

    const minified = minifyCss(resolved);
    src = src.slice(0, tagStart) + JSON.stringify(minified) + src.slice(literalEnd);
    minifiedCount++;
  }

  if (skippedCount > 0) {
    console.warn(`⚠️  ${skippedCount} css block(s) left unminified - see warnings above.`);
  }

  const result = esbuild.transformSync(src, { minify: true, target: 'es2022' });

  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(path.join(OUTDIR, SOURCE), result.code);

  console.log(
    `✅ Built ${path.join(OUTDIR, SOURCE)} (${minifiedCount} CSS block(s) minified, source ${originalLength} → ${src.length} bytes pre-JS-minify).`,
  );
}

main();
