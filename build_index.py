#!/usr/bin/env python3
"""Generate dist/ from items.json and vps.json.

The directory is the whole static site: /provider, /agent, /vps, and a /
page that sends people to /provider. Shared app.js, styles.css, and data.js
are written once. Asset URLs are relative, so the same files work at a domain
root and under a GitHub Pages prefix such as /free/.
"""
from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ITEMS_PATH = ROOT / "items.json"
VPS_PATH = ROOT / "vps.json"
DIST = ROOT / "dist"

ICON = (
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E"
    "%3Crect width='32' height='32' rx='8' fill='%230f6e62'/%3E%3Ctext x='16' y='22' "
    "text-anchor='middle' font-size='16' font-family='Georgia' fill='%23ffffff'%3EF%3C/text%3E%3C/svg%3E"
)

REDIRECTS = """# Manual Netlify deploys upload dist/ and do not see the repo netlify.toml.
# Browsers keep the URL hash across these redirects. Legacy hashes such as
# #providers/groq are rewritten by app.js on the destination page.
/  /provider/  302!
/provider  /provider/  301
/agent  /agent/  301
/vps  /vps/  301
"""

PAGES = {
    "provider": {
        "title": "免费 · 模型",
        "description": "正在进行的免费模型、网关和 API 额度，按平台汇总，附领取步骤。",
        "lead": "按平台查看还没过期的模型、网关和 API 额度。离截止最近的排在前面。",
        "foot": "数据来自公开帖子，领取前请自行核对官方条款。页面不展示 API Key。",
    },
    "agent": {
        "title": "免费 · Agent",
        "description": "编程 Agent、CLI 和 IDE 的免费额度，按平台汇总，附领取步骤。",
        "lead": "编程 Agent、CLI 和 IDE 里还能用的免费额度，附领取步骤。",
        "foot": "数据来自公开帖子，领取前请自行核对官方条款。页面不展示 API Key。",
    },
    "vps": {
        "title": "免费 · VPS",
        "description": "免费 VPS、DMIT 与搬瓦工补货监控，以及黑五优惠。示例数据会在页面上标明。",
        "lead": "免费机器、两家补货监控，以及黑五优惠。价格和库存以下单页为准。",
        "foot": "库存、价格和资格会变，下单前请打开官方页面核对。页面不展示账号、邮箱或密钥。",
    },
}


def nav(current: str) -> str:
    items = (("provider", "模型", "providers"), ("agent", "Agent", "agents"), ("vps", "VPS", ""))
    parts = ['<nav class="kind-switch" aria-label="栏目">']
    for key, label, count_kind in items:
        current_attr = ' aria-current="page"' if key == current else ""
        count = f'<span class="kind-count" data-kind-count="{count_kind}"></span>' if count_kind else ""
        parts.append(f'<a class="kind" href="../{key}/"{current_attr}>{label}{count}</a>')
    parts.append("</nav>")
    return "".join(parts)


def head(title: str, description: str, prefix: str, cache: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<meta name="description" content="{description}"/>
<meta name="color-scheme" content="light"/>
<title>{title}</title>
<link rel="icon" href="{ICON}"/>
<link rel="stylesheet" href="{prefix}styles.css?v={cache}"/>
</head>
"""


def catalog_page(page: str, cache: str) -> str:
    meta = PAGES[page]
    return f"""{head(meta["title"], meta["description"], "../", cache)}<body data-page="{page}">
<div class="app">
<div class="chrome">
<header class="top">
<div class="brand">
<p class="eyebrow">Free</p>
<h1>免费</h1>
<p class="lead">{meta["lead"]}</p>
</div>
<div class="top-side">
{nav(page)}
<p class="stats" id="stats" aria-live="polite"></p>
</div>
</header>
<aside class="sidebar">
<div class="search-wrap" role="search">
<label class="sr" for="q">搜索平台或活动</label>
<input id="q" type="search" placeholder="搜索平台、模型或条款" autocomplete="off" spellcheck="false"/>
</div>
<p class="legend" aria-hidden="true"><span class="dot success"></span>已领取<span class="dot needs-user"></span>待操作<span class="dot failed"></span>失败</p>
<label class="sr" for="platform-select">选择平台</label>
<select id="platform-select" class="platform-select"></select>
<div class="tab-rail" id="tab-rail"><div id="tabs" class="tabs" role="tablist" aria-label="平台"></div></div>
</aside>
</div>
<div class="layout">
<main id="detail" class="detail"></main>
<footer class="foot">{meta["foot"]}</footer>
</div>
</div>
<script src="../data.js?v={cache}"></script>
<script src="../app.js?v={cache}"></script>
</body>
</html>
"""


def vps_page(cache: str) -> str:
    meta = PAGES["vps"]
    return f"""{head(meta["title"], meta["description"], "../", cache)}<body data-page="vps">
<div class="app">
<div class="chrome">
<header class="top">
<div class="brand">
<p class="eyebrow">Free</p>
<h1>免费</h1>
<p class="lead">{meta["lead"]}</p>
</div>
<div class="top-side">
{nav("vps")}
<p class="stats" id="stats" aria-live="polite"></p>
</div>
</header>
</div>
<div class="layout">
<main id="detail" class="detail"></main>
<footer class="foot">{meta["foot"]}</footer>
</div>
</div>
<script src="../vps-data.js?v={cache}"></script>
<script src="../app.js?v={cache}"></script>
</body>
</html>
"""


def home_page(cache: str) -> str:
    # The redirect runs in <head>. Prefixed hashes (#providers/groq, #agents/opencode)
    # leave before the catalog downloads. A bare platform hash (#groq) still needs
    # data.js, loaded after the document exists, so the section can be chosen.
    opened = head(
        "免费 · Free",
        "免费额度一览：模型与 API、编程 Agent，以及 VPS 免费方案和补货。",
        "./",
        cache,
    )
    opened = opened.replace("</head>", f"""<script>
(function () {{
  var raw = (location.hash || "").replace(/^#/, "");
  try {{ raw = decodeURIComponent(raw); }} catch (e) {{}}
  raw = String(raw || "").replace(/^\\/+|\\/+$/g, "");
  function go(page, slug) {{
    var dir = page === "agent" ? "agent/" : page === "vps" ? "vps/" : "provider/";
    location.replace(dir + (slug ? "#" + encodeURIComponent(slug) : ""));
  }}
  var match = raw.match(/^(providers|agents|provider|agent|vps)(?:\\/(.*))?$/);
  if (!raw) return go("provider", "");
  if (match) {{
    var key = match[1];
    var slug = String(match[2] || "").replace(/^\\/+|\\/+$/g, "");
    var page = key === "agents" || key === "agent" ? "agent" : key === "vps" ? "vps" : "provider";
    return go(page, slug);
  }}
  function load() {{
    var data = document.createElement("script");
    data.src = "./data.js?v={cache}";
    data.onload = function () {{
      var app = document.createElement("script");
      app.src = "./app.js?v={cache}";
      document.body.appendChild(app);
    }};
    document.body.appendChild(data);
  }}
  if (document.body) load();
  else document.addEventListener("DOMContentLoaded", load);
}})();
</script>
</head>
""")
    return opened + """<body data-page="home">
<main class="home-wrap">
<p class="eyebrow">Free</p>
<h1>免费</h1>
<p class="lead">正在打开模型、网关和 API 额度。</p>
<p class="home-links"><a href="provider/">模型</a><a href="agent/">Agent</a><a href="vps/">VPS</a></p>
<noscript><p>直接打开上面的链接。</p></noscript>
</main>
</body>
</html>
"""


def load_css() -> str:
    path = ROOT / "templates" / "styles.css"
    if not path.exists():
        raise SystemExit("templates/styles.css not found")
    return path.read_text(encoding="utf-8")


def load_app_js() -> str:
    path = ROOT / "templates" / "app.js"
    if not path.exists():
        raise SystemExit("templates/app.js not found")
    return path.read_text(encoding="utf-8")


def main() -> None:
    if not ITEMS_PATH.exists():
        raise SystemExit("items.json not found")
    if not VPS_PATH.exists():
        raise SystemExit("vps.json not found")
    raw_items = json.loads(ITEMS_PATH.read_text(encoding="utf-8"))
    if not isinstance(raw_items, list):
        raise SystemExit("items.json must be a JSON array")
    raw_vps = json.loads(VPS_PATH.read_text(encoding="utf-8"))
    if not isinstance(raw_vps, dict):
        raise SystemExit("vps.json must be a JSON object")

    css = load_css()
    app_js = load_app_js()
    data_js = "const ITEMS = " + json.dumps(raw_items, ensure_ascii=False, separators=(",", ":")) + ";\n"
    vps_js = "const VPS = " + json.dumps(raw_vps, ensure_ascii=False, separators=(",", ":")) + ";\n"
    digest = hashlib.sha256()
    digest.update(app_js.encode("utf-8"))
    digest.update(css.encode("utf-8"))
    digest.update(data_js.encode("utf-8"))
    digest.update(vps_js.encode("utf-8"))
    cache = digest.hexdigest()[:10]

    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    (DIST / "provider").mkdir()
    (DIST / "agent").mkdir()
    (DIST / "vps").mkdir()
    (DIST / "index.html").write_text(home_page(cache), encoding="utf-8")
    (DIST / "provider" / "index.html").write_text(catalog_page("provider", cache), encoding="utf-8")
    (DIST / "agent" / "index.html").write_text(catalog_page("agent", cache), encoding="utf-8")
    (DIST / "vps" / "index.html").write_text(vps_page(cache), encoding="utf-8")
    (DIST / "app.js").write_text(app_js, encoding="utf-8")
    (DIST / "styles.css").write_text(css, encoding="utf-8")
    (DIST / "data.js").write_text(data_js, encoding="utf-8")
    (DIST / "vps-data.js").write_text(vps_js, encoding="utf-8")
    shutil.copyfile(ITEMS_PATH, DIST / "items.json")
    shutil.copyfile(VPS_PATH, DIST / "vps.json")
    (DIST / ".nojekyll").write_text("", encoding="utf-8")
    (DIST / "_redirects").write_text(REDIRECTS, encoding="utf-8")
    print(f"Built dist/ with {len(raw_items)} items v={cache}")


if __name__ == "__main__":
    main()
