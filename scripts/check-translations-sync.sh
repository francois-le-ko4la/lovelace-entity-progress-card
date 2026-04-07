#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TRANSLATIONS_DIR="$PROJECT_DIR/translations"
JS_FILE="$PROJECT_DIR/entity-progress-card.js"
ERRORS=0

echo "🔍 Checking translations sync..."

TEMP_FILE=$(mktemp /tmp/translations_XXXXXX.json)
trap 'rm -f "$TEMP_FILE"' EXIT

node -e "
const src = require('fs').readFileSync('$JS_FILE', 'utf8');
const match = src.match(/const TRANSLATIONS = (\{[\s\S]*?\n\};)/);
if (!match) { console.error('TRANSLATIONS not found'); process.exit(1); }
const TRANSLATIONS = eval('(' + match[1].replace(/};$/, '}') + ')');
require('fs').writeFileSync('$TEMP_FILE', JSON.stringify(TRANSLATIONS));
"

for file in "$TRANSLATIONS_DIR"/*.json; do
  lang=$(basename "$file" .json)
  if [ "$lang" = "template" ]; then continue; fi

  node -e "
const fs = require('fs');
const lang = '$lang';
const json = JSON.parse(fs.readFileSync('$file', 'utf8'));
const TRANSLATIONS = JSON.parse(fs.readFileSync('$TEMP_FILE', 'utf8'));
const jsLang = TRANSLATIONS[lang];

if (!jsLang) {
  console.log('⚠️  ' + lang + ': not found in TRANSLATIONS');
  process.exit(1);
}

const diffs = [];
const walk = (jsonObj, jsObj, prefix) => {
  for (const [k, v] of Object.entries(jsonObj)) {
    const path = prefix ? prefix + '.' + k : k;
    if (typeof v === 'object') {
      walk(v, jsObj?.[k] ?? {}, path);
    } else {
      if (!(k in (jsObj ?? {}))) {
        diffs.push({ type: 'missing', path, jsonVal: v });
      } else if (jsObj[k] !== v) {
        diffs.push({ type: 'diff', path, jsonVal: v, jsVal: jsObj[k] });
      }
    }
  }
  for (const k of Object.keys(jsObj ?? {})) {
    const path = prefix ? prefix + '.' + k : k;
    if (!(k in jsonObj)) {
      diffs.push({ type: 'extra', path, jsVal: jsObj[k] });
    }
  }
};

walk(json, jsLang, '');

if (diffs.length === 0) {
  console.log('✅ ' + lang);
  process.exit(0);
}

console.log('❌ ' + lang);
for (const d of diffs) {
  if (d.type === 'missing') console.log('   ➕ missing: ' + d.path + ' = \"' + d.jsonVal + '\"');
  if (d.type === 'extra')   console.log('   ➖ extra:   ' + d.path + ' = \"' + d.jsVal + '\"');
  if (d.type === 'diff')    console.log('   ✏️  changed: ' + d.path + '\n        json: \"' + d.jsonVal + '\"\n        js:   \"' + d.jsVal + '\"');
}
process.exit(1);
" || ERRORS=$((ERRORS + 1))

done

echo ""
[ $ERRORS -eq 0 ] && echo "✅ All translations are in sync!" || echo "❌ $ERRORS language(s) out of sync."