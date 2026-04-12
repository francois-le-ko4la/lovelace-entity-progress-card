#!/bin/bash
# add-background-translation.sh

declare -A translations=(
  ["ar"]="خلفية البطاقة"
  ["bn"]="কার্ড পটভূমি"
  ["ca"]="Fons de la targeta"
  ["cs"]="Pozadí karty"
  ["da"]="Kortbaggrund"
  ["de"]="Kartenhintergrund"
  ["el"]="Φόντο κάρτας"
  ["en"]="Full card background"
  ["es"]="Fondo de la tarjeta"
  ["es-419"]="Fondo de la tarjeta"
  ["et"]="Kaardi taust"
  ["fi"]="Kortin tausta"
  ["fr"]="Arrière-plan de la carte"
  ["hi"]="कार्ड पृष्ठभूमि"
  ["hr"]="Pozadina kartice"
  ["hu"]="Kártya háttér"
  ["id"]="Latar belakang kartu"
  ["it"]="Sfondo della scheda"
  ["ja"]="カードの背景"
  ["ko"]="카드 배경"
  ["lt"]="Kortelės fonas"
  ["lv"]="Kartes fons"
  ["mk"]="Позадина на картичката"
  ["nb"]="Kortbakgrunn"
  ["nl"]="Kaartachtergrond"
  ["pl"]="Tło karty"
  ["pt"]="Fundo do cartão"
  ["pt-BR"]="Fundo do cartão"
  ["ro"]="Fundal card"
  ["ru"]="Фон карточки"
  ["sk"]="Pozadie karty"
  ["sl"]="Ozadje kartice"
  ["sv"]="Kortbakgrund"
  ["th"]="พื้นหลังการ์ด"
  ["tr"]="Kart arka planı"
  ["uk"]="Фон картки"
  ["vi"]="Nền thẻ"
  ["zh-Hans"]="卡片背景"
  ["zh-Hant"]="卡片背景"
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
  if jq -e '.editor.option.bar_position.background' "$file" > /dev/null 2>&1; then
    echo "✓  ${lang}.json already has background, skipping"
    continue
  fi

  # Vérifie que le chemin parent existe
  if ! jq -e '.editor.option.bar_position' "$file" > /dev/null 2>&1; then
    echo "⚠️  Path editor.option.bar_position not found in ${lang}.json"
    continue
  fi

  # Ajoute la clé
  tmp=$(mktemp)
  jq --arg val "$value" \
    '.editor.option.bar_position.background = $val' \
    "$file" > "$tmp" && mv "$tmp" "$file"

  echo "✅  ${lang}.json updated"
done

echo "Done."
