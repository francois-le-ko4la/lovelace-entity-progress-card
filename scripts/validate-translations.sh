#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

TRANSLATIONS_DIR="$PROJECT_DIR/translations"
REFERENCE="$TRANSLATIONS_DIR/template.json"
ERRORS=0

echo "🔍 Validating translations against template.json..."

# Extraire toutes les clés d'un JSON (chemin complet ex: card.msg.entityNotFound)
get_keys() {
  node -e "
    const obj = JSON.parse(require('fs').readFileSync('$1', 'utf8'));
    const keys = [];
    const walk = (o, prefix) => {
      for (const [k, v] of Object.entries(o)) {
        const path = prefix ? prefix + '.' + k : k;
        if (typeof v === 'object') walk(v, path);
        else keys.push(path);
      }
    };
    walk(obj, '');
    console.log(keys.join('\n'));
  "
}

REF_KEYS=$(get_keys "$REFERENCE")

for file in "$TRANSLATIONS_DIR"/*.json; do
  lang=$(basename "$file" .json)
  if [ "$lang" = "template" ]; then continue; fi

  LANG_KEYS=$(get_keys "$file")

  # Clés manquantes
  MISSING=$(comm -23 <(echo "$REF_KEYS" | sort) <(echo "$LANG_KEYS" | sort))
  # Clés en trop
  EXTRA=$(comm -13 <(echo "$REF_KEYS" | sort) <(echo "$LANG_KEYS" | sort))

  if [ -n "$MISSING" ] || [ -n "$EXTRA" ]; then
    echo ""
    echo "❌ $lang"
    [ -n "$MISSING" ] && echo "  missing: $(echo "$MISSING" | tr '\n' ' ')"
    [ -n "$EXTRA" ]   && echo "  extra:   $(echo "$EXTRA" | tr '\n' ' ')"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ $lang"
  fi
done

echo ""
[ $ERRORS -eq 0 ] && echo "All translations are valid!" || echo "$ERRORS language(s) have issues."
exit $ERRORS
