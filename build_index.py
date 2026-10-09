#!/usr/bin/env python3
"""Generate site/ from items.json: index.html, data.js, app.js (ITEMS in data.js)."""
from __future__ import annotations
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
<meta name="description" content="免费 AI 模型额度与活动汇总 — 按 Provider / Agent / Model 分类，一键领取"/>
<meta name="color-scheme" content="light dark"/>
<title>免费模型 · Free Models</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="./styles.css"/>
</head>
<body>
<div class="wrap">
<header class="hero">
<div class="hero-text">
<h1>免费模型</h1>
<p>汇总公开 X 帖子中的免费 AI 额度与限时活动。按 Provider / Agent / Model 找入口，一点直达创建 Key 或下载客户端。</p>
</div>
<div class="hero-actions">
<button type="button" class="btn btn-icon" id="themeToggle" title="切换主题" aria-label="切换主题">◐</button>
</div>
</header>
<div class="stats" id="stats"></div>
<nav class="view-tabs" id="viewTabs" aria-label="视图"></nav>
<section class="filters" aria-label="筛选">
<div class="filter-row" id="entityRow" hidden><span class="filter-label" id="entityLabel">渠道</span><div class="chips" id="entityChips"></div></div>
<div class="filter-row"><span class="filter-label">场景</span><div class="chips" id="sceneChips"></div></div>
<div class="filter-row"><span class="filter-label">门槛</span><div class="chips" id="barrierChips"></div></div>
<div class="filter-row"><span class="filter-label">状态</span><label class="toggle"><input type="checkbox" id="onlyActive" checked/>只看未过期</label></div>
</section>
<main class="list" id="list" aria-live="polite"></main>
<footer class="site-footer">数据来自公开 X 帖子，仅汇总不担保可用性。领取前请自行核对官网条款。<br/>原始数据：<a href="./items.json">items.json</a> · 内容自动更新</footer>
</div>
<script src="./data.js"></script>
<script src="./app.js"></script>
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
    (SITE / "data.js").write_text(f"const ITEMS = {compact};\n", encoding="utf-8")
    (SITE / "app.js").write_text(app_js, encoding="utf-8")
    (SITE / "styles.css").write_text(css, encoding="utf-8")
    (SITE / "index.html").write_text(INDEX_TMPL, encoding="utf-8")
    print(f"Built site/ with {len(raw)} items (index.html, data.js, app.js, styles.css)")


if __name__ == "__main__":
    main()
