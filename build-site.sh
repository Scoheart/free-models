#!/usr/bin/env bash
# Build the deployable static site.
#
#   ./build-site.sh
#   deploy the dist/ directory as a whole (Netlify manual upload, or the
#   same tree for GitHub Pages).
#
# dist/ is the complete site. Publish these files, and nothing from
# templates/ or scripts/:
#   index.html                 /            redirects to /provider, keeps old hashes
#   provider/index.html        /provider/   models, gateways, API quotas
#   agent/index.html           /agent/      coding agents, CLIs, IDEs
#   vps/index.html             /vps/        free VPS, restock, Black Friday
#   app.js                     shared page logic
#   styles.css                 shared styles
#   data.js                    const ITEMS = ...
#   vps-data.js                const VPS = ...
#   items.json                 catalog source copy
#   vps.json                   VPS source copy
#   _redirects                 Netlify: / -> /provider/ and slash normalization
#   .nojekyll                  GitHub Pages: publish _redirects as a real file
#
# Asset URLs are relative (../styles.css, provider/, agent/). Do not rewrite
# them to site-root paths; GitHub Pages will be https://scoheart.github.io/free/.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
DIST="$ROOT/dist"

python3 -c "import json; json.load(open('$ROOT/items.json'))" || {
  echo "ERROR: items.json is not valid JSON" >&2
  exit 1
}
python3 -c "import json; json.load(open('$ROOT/vps.json'))" || {
  echo "ERROR: vps.json is not valid JSON" >&2
  exit 1
}

python3 "$ROOT/build_index.py"

echo "部署目录: dist/"
echo "需要发布的文件:"
find "$DIST" -type f -print | sed "s|^$DIST/||" | LC_ALL=C sort | while IFS= read -r rel; do
  echo "  - $rel"
done

# GitHub Pages for this repo publishes the main branch root, so keep a copy
# there too. templates/, scripts/, and the README stay source files.
while IFS= read -r -d '' file; do
  rel="${file#"$DIST"/}"
  mkdir -p "$ROOT/$(dirname "$rel")"
  cp "$file" "$ROOT/$rel"
done < <(find "$DIST" -type f -print0)

echo "OK: $DIST"
echo "Also mirrored onto the repository root for GitHub Pages"
