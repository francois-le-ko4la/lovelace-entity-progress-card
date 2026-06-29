#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TRANSLATIONS_DIR="$PROJECT_DIR/translations"
JS_FILE="$PROJECT_DIR/entity-progress-card.js"

echo "📦 Rebuilding JSON files from TRANSLATIONS in JS..."

cat > /tmp/update-json.js << 'JSEOF'
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
const jsFile = process.argv[3];

const src = fs.readFileSync(jsFile, 'utf8');

// Même regex que le script JSON->JS, pour rester symétrique
const match = src.match(/const TRANSLATIONS = (\{[\s\S]*?\n\});/);
if (!match) {
  console.error('❌ TRANSLATIONS block not found in JS file');
  process.exit(1);
}

// On évalue le littéral d'objet avec le moteur JS lui-même : aucun souci
// d'échappement (apostrophes, guillemets, accents...), contrairement à un
// parsing regex/texte fait à la main.
let TRANSLATIONS;
try {
  TRANSLATIONS = new Function(`return (${match[1]});`)();
} catch (err) {
  console.error('❌ Failed to evaluate TRANSLATIONS object:', err.message);
  process.exit(1);
}

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const langs = Object.keys(TRANSLATIONS);
let written = 0;

for (const lang of langs) {
  const filePath = path.join(dir, `${lang}.json`);
  const json = JSON.stringify(TRANSLATIONS[lang], null, 2) + '\n';
  fs.writeFileSync(filePath, json, 'utf8');
  written += 1;
}

console.log(`✅ ${written} JSON file(s) written to ${dir}`);
console.log('Languages: ' + langs.join(', '));
JSEOF

node /tmp/update-json.js "$TRANSLATIONS_DIR" "$JS_FILE"