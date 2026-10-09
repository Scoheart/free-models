#!/usr/bin/env python3
"""Generate site/ from items.json: index.html, data.js, app.js (ITEMS embedded in data.js)."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ITEMS_PATH = ROOT / "items.json"
SITE = ROOT / "site"
CSS_PATH = ROOT / "templates" / "styles.css"
APP_JS_PATH = ROOT / "templates" / "app.js"

INDEX_TMPL = """<!DOCTYPE html>
<html lang=\"zh-CN\">
<head>
<meta charset=\"UTF-8\"/>
<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\"/>
<meta name=\"description\" content=\"免费 AI 模型额度与活动汇总 — 来自公开 X 帖子\"/>
<meta name=\"color-scheme\" content=\"light dark\"/>
<title>免费模型 · Free Models</title>
<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\"/>
<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin/>
<link href=\"https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap\" rel=\"stylesheet\"/>
<style>{css}</style>
</head>
<body>
<div class=\"wrap\">
<header class=\"hero\">
<div class=\"hero-text\">
<h1>免费模型</h1>
<p>汇总公开 X 帖子中的免费 AI 模型额度与限时活动。最新在上，可按模型 / 类型筛选。</p>
</div>
<div class=\"hero-actions\">
<button type=\"button\" class=\"btn btn-icon\" id=\"themeToggle\" title=\"切换主题\" aria-label=\"切换主题\">◐</button>
</div>
</header>
<div class=\"stats\" id=\"stats\"></div>
<section class=\"filters\" aria-label=\"筛选\">
<div class=\"filter-row\"><span class=\"filter-label\">模型</span><div class=\"chips\" id=\"modelChips\"></div></div>
<div class=\"filter-row\"><span class=\"filter-label\">类型</span><div class=\"chips\" id=\"typeChips\"></div></div>
<div class=\"filter-row\"><span class=\"filter-label\">状态</span><label class=\"toggle\"><input type=\"checkbox\" id=\"onlyActive\" checked/>只看未过期</label></div>
</section>
<main class=\"list\" id=\"list\" aria-live=\"polite\"></main>
<footer class=\"site-footer\">数据来自公开 X 帖子，仅汇总不担保可用性。<br/>原始数据：<a href=\"./items.json\">items.json</a> · 内容自动更新</footer>
</div>
<script src=\"./data.js\"></script>
<script src=\"./app.js\"></script>
</body>
</html>
"""

def main() -> None:
    SITE.mkdir(parents=True, exist_ok=True)
    raw = json.loads(ITEMS_PATH.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raw = []
    compact = json.dumps(raw, ensure_ascii=False, separators=(",", ":"))
    css = CSS_PATH.read_text(encoding="utf-8") if CSS_PATH.exists() else ""
    app_js = APP_JS_PATH.read_text(encoding="utf-8") if APP_JS_PATH.exists() else "renderAll();"
    (SITE / "data.js").write_text(f"const ITEMS = {compact};\n", encoding="utf-8")
    (SITE / "app.js").write_text(app_js, encoding="utf-8")
    (SITE / "index.html").write_text(INDEX_TMPL.format(css=css), encoding="utf-8")
    print(f"Built site/ with {len(raw)} items (index.html, data.js, app.js)")

if __name__ == "__main__":
    main()
