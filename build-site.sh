#!/usr/bin/env bash
# Regenerate site/ from items.json for GitHub Pages
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
ITEMS_FILE="$ROOT/items.json"
SITE_DIR="$ROOT/site"
mkdir -p "$SITE_DIR"

if [[ ! -f "$ITEMS_FILE" ]]; then
  echo '[]' > "$ITEMS_FILE"
fi

python3 -c "import json; json.load(open('$ITEMS_FILE'))" || {
  echo "ERROR: items.json is not valid JSON" >&2
  exit 1
}

cp "$ITEMS_FILE" "$SITE_DIR/items.json"
python3 "$ROOT/build_index.py"

for f in index.html data.js app.js items.json; do
  if [[ -f "$SITE_DIR/$f" ]]; then
    cp "$SITE_DIR/$f" "$ROOT/$f"
  fi
done

echo "OK: $SITE_DIR/{index.html,data.js,app.js,items.json}"
echo "Also mirrored to $ROOT/ for Pages root deploy"
