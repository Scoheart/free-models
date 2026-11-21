#!/usr/bin/env bash
# Build the static site and update the files published by GitHub Pages.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

npm run build
node scripts/package-site.mjs --mirror

echo "部署目录 dist/"
echo "GitHub Pages 发布文件已更新。"
