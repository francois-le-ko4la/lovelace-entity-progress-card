#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TRANSLATIONS_DIR="$PROJECT_DIR/translations"
JS_FILE="$PROJECT_DIR/entity-progress-card.js"

echo "📦 Rebuilding TRANSLATIONS from JSON files..."

cat > /tmp/update-languages.js << 'JSEOF'
const fs = require('fs');

const dir = process.argv[2];
const jsFile = process.argv[3];

const TRANSLATIONS = {};
for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'translation.template.json').sort()) {
  const lang = file.replace('.json', '');
  TRANSLATIONS[lang] = JSON.parse(fs.readFileSync(dir + '/' + file, 'utf8'));
}

const formatJS = (obj, indent = 0) => {
  const pad = '  '.repeat(indent);
  const pad1 = '  '.repeat(indent + 1);

  const entries = Object.entries(obj).map(([k, v]) => {
    // Si la clé contient autre chose que [a-zA-Z0-9_$], ou commence par un chiffre, on met des guillemets
    const needsQuotes = !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k);
    const key = needsQuotes ? `'${k.replace(/'/g, "\\'")}'` : k;

    let val;
    if (typeof v === 'object' && v !== null) {
      val = formatJS(v, indent + 1);
    } else {
      val = `'${String(v).replace(/'/g, "\\'")}'`;
    }

    return `${pad1}${key}: ${val}`;
  });

  return `{\n${entries.join(',\n')}\n${pad}}`;
};

const newBlock = 'const TRANSLATIONS = ' + formatJS(TRANSLATIONS) + ';';

const src = fs.readFileSync(jsFile, 'utf8');
const updated = src.replace(/const TRANSLATIONS = \{[\s\S]*?\n\};/, newBlock);

if (src === updated) {
  console.error('❌ TRANSLATIONS block not found in JS file');
  process.exit(1);
}

fs.writeFileSync(jsFile, updated);
console.log('✅ TRANSLATIONS updated with ' + Object.keys(TRANSLATIONS).length + ' languages.');
JSEOF

node /tmp/update-languages.js "$TRANSLATIONS_DIR" "$JS_FILE"
