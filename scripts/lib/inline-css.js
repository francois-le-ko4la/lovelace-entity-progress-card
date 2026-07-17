'use strict';

// Resolves every `css`...`` tagged template literal in a JS source string to
// its static string value, then minifies it as real CSS - esbuild's own
// --minify pass never touches CSS embedded in JS strings/template literals.
// Used by scripts/build.js, which bundles src/ with esbuild before running
// this pass.
const fs = require('fs');
const path = require('path');
const os = require('os');
const esbuild = require('esbuild');

const CSS_TAG_RE = /(?<![\w$])css`/g;

// Identity tag, matching the one defined in the source - provided so an
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

// Resolving a tagged block's value:
//   - `const NAME = css\`...\`;` at the top level: tried in isolation first
//     (fast, works for anything self-contained). If that throws (the block's
//     `${...}` interpolations reference other constants defined earlier in
//     the file), falls back to evaluating everything in the file up to that
//     declaration.
//   - Any other usage (e.g. `style.textContent = css\`...\``, inside a method
//     body): isolation only - there's no top-level variable to re-export for
//     a prefix-eval fallback. Left unminified (with a warning) if isolation
//     fails, rather than risk mishandling it.
function resolveCssBlocks(src) {
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
      // esbuild's bundler rewrites top-level `const`/`let` declarations to
      // `var` when it concatenates modules - match all three so the
      // fallback still finds the variable name.
      const constMatch = /(?:const|let|var)\s+(\w+)\s*=\s*$/.exec(src.slice(0, tagStart));
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

  return { src, minifiedCount, skippedCount };
}

module.exports = { resolveCssBlocks };
