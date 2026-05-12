#!/bin/bash
# add-background-translation.sh

declare -A translations=(
  ["ar"]="إخفاء"
  ["bn"]="লুকান"
  ["ca"]="Amaga"
  ["cs"]="Skrýt"
  ["da"]="Skjul"
  ["de"]="Ausblenden"
  ["el"]="Απόκρυψη"
  ["en"]="Hide"
  ["es"]="Ocultar"
  ["es-419"]="Ocultar"
  ["et"]="Peida"
  ["fi"]="Piilota"
  ["fr"]="Masquer"
  ["hi"]="छिपाएँ"
  ["hr"]="Sakrij"
  ["hu"]="Elrejtés"
  ["id"]="Sembunyikan"
  ["it"]="Nascondi"
  ["ja"]="非表示"
  ["ko"]="숨기기"
  ["lt"]="Slėpti"
  ["lv"]="Slēpt"
  ["mk"]="Сокриј"
  ["nb"]="Skjul"
  ["nl"]="Verbergen"
  ["pl"]="Ukryj"
  ["pt"]="Ocultar"
  ["pt-BR"]="Ocultar"
  ["ro"]="Ascunde"
  ["ru"]="Скрыть"
  ["sk"]="Skryť"
  ["sl"]="Skrij"
  ["sv"]="Dölj"
  ["th"]="ซ่อน"
  ["tr"]="Gizle"
  ["uk"]="Приховати"
  ["vi"]="Ẩn"
  ["zh-Hans"]="隐藏"
  ["zh-Hant"]="隱藏"
)

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TRANSLATIONS_DIR="$PROJECT_DIR/translations"

for lang in "${!translations[@]}"; do
  file="$TRANSLATIONS_DIR/${lang}.json"
  value="${translations[$lang]}"

  if [ ! -f "$file" ]; then
    echo "⚠️  $file not found, skipping"
    continue
  fi

  # Vérifie si la clé existe déjà
  #if jq -e '.editor.option.bar_position.background' "$file" > /dev/null 2>&1; then
  #  echo "✓  ${lang}.json already has background, skipping"
  #  continue
  #fi

  # Vérifie que le chemin parent existe
  #if ! jq -e '.editor.option.bar_position' "$file" > /dev/null 2>&1; then
  #  echo "⚠️  Path editor.option.bar_position not found in ${lang}.json"
  #  continue
  #fi

  # Ajoute la clé
  tmp=$(mktemp)
  jq --arg val "$value" \
    '.editor.field.hide = $val' \
    "$file" > "$tmp" && mv "$tmp" "$file"

  echo "✅  ${lang}.json updated"
done

echo "Done."
