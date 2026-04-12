#!/bin/bash
# update-layout-translation.sh

declare -A translations=(
  ["ar"]="محتوى الحالة"
  ["bn"]="স্টেটের বিষয়বস্তু"
  ["ca"]="Contingut de l'estat"
  ["cs"]="Obsah stavu"
  ["da"]="Indhold af tilstand"
  ["de"]="Statusinhalt"
  ["el"]="Περιεχόμενο κατάστασης"
  ["en"]="State content"
  ["es"]="Contenido del estado"
  ["es-419"]="Contenido del estado"
  ["et"]="Oleku sisu"
  ["fi"]="Tilan sisältö"
  ["fr"]="Contenu de l’état"
  ["hi"]="स्थिति की सामग्री"
  ["hr"]="Sadržaj stanja"
  ["hu"]="Állapot tartalma"
  ["id"]="Konten status"
  ["it"]="Contenuto dello stato"
  ["ja"]="状態の内容"
  ["ko"]="상태 콘텐츠"
  ["lt"]="Būsenos turinys"
  ["lv"]="Stāvokļa saturs"
  ["mk"]="Содржина на состојба"
  ["nb"]="Innhold i tilstand"
  ["nl"]="Inhoud van de status"
  ["pl"]="Zawartość stanu"
  ["pt"]="Conteúdo do estado"
  ["pt-BR"]="Conteúdo do estado"
  ["ro"]="Conținutul stării"
  ["ru"]="Содержимое состояния"
  ["sk"]="Obsah stavu"
  ["sl"]="Vsebina stanja"
  ["sv"]="Statusinnehåll"
  ["th"]="เนื้อหาของสถานะ"
  ["tr"]="Durum içeriği"
  ["uk"]="Вміст стану"
  ["vi"]="Nội dung trạng thái"
  ["zh-Hans"]="状态内容"
  ["zh-Hant"]="狀態內容"
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

  if ! jq -e '.editor.field.state_content' "$file" > /dev/null 2>&1; then
    echo "⚠️  Path editor.field.state_content not found in ${lang}.json"
    continue
  fi

  tmp=$(mktemp)
  jq --arg val "$value" \
    '.editor.field.state_content = $val' \
    "$file" > "$tmp" && mv "$tmp" "$file"

  echo "✅  ${lang}.json updated"
done

echo "Done."