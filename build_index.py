#!/usr/bin/env python3
"""Generate site/ from items.json: index.html, data.js, app.js (ITEMS in data.js)."""
from __future__ import annotations
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ITEMS_PATH = ROOT / "items.json"
SITE = ROOT / "site"

INDEX_TMPL = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<meta name="description" content="免费 AI 模型与额度汇总"/>
<meta name="color-scheme" content="light dark"/>
<title>免费模型</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23111113'/%3E%3Ctext x='16' y='22' text-anchor='middle' font-size='16' fill='%238b8bf5'%3EF%3C/text%3E%3C/svg%3E"/>
<link rel="stylesheet" href="./styles.css?v=__CACHE_V__"/>
</head>
<body>
<main class="wrap">
<header class="hero">
<h1>免费模型</h1>
<p class="lead">汇总正在免费的 AI 模型与额度，最新的在上面。</p>
</header>
<div class="list" id="list" aria-live="polite"></div>
<footer class="foot">数据来自公开帖子，领取前请自行核对官方条款。</footer>
</main>
<script src="./data.js?v=__CACHE_V__"></script>
<script src="./app.js?v=__CACHE_V__"></script>
</body>
</html>
"""


def load_css() -> str:
    for p in (ROOT / "templates" / "styles.css", SITE / "index.html", ROOT / "index.html"):
        if not p.exists():
            continue
        text = p.read_text(encoding="utf-8")
        if p.suffix == ".css":
            return text
        m = re.search(r"<style>(.*?)</style>", text, re.S)
        if m:
            return m.group(1)
    return ""


def load_app_js() -> str:
    for p in (ROOT / "templates" / "app.js", ROOT / "app.js", SITE / "app.js"):
        if p.exists():
            return p.read_text(encoding="utf-8")
    raise SystemExit("app.js template not found")


def main() -> None:
    SITE.mkdir(parents=True, exist_ok=True)
    raw = json.loads(ITEMS_PATH.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raw = []
    compact = json.dumps(raw, ensure_ascii=False, separators=(",", ":"))
    css = load_css()
    app_js = load_app_js()
    data_js = f"const ITEMS = {compact};\n"
    digest = hashlib.sha256()
    digest.update(app_js.encode("utf-8"))
    digest.update(css.encode("utf-8"))
    digest.update(data_js.encode("utf-8"))
    cache_v = digest.hexdigest()[:10]
    (SITE / "data.js").write_text(data_js, encoding="utf-8")
    (SITE / "app.js").write_text(app_js, encoding="utf-8")
    (SITE / "styles.css").write_text(css, encoding="utf-8")
    (SITE / "index.html").write_text(
        INDEX_TMPL.replace("__CACHE_V__", cache_v), encoding="utf-8"
    )
    print(f"Built site/ with {len(raw)} items (index.html, data.js, app.js, styles.css) v={cache_v}")


if __name__ == "__main__":
    main()
