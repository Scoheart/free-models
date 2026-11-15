#!/usr/bin/env python3
"""Build a clean vps.json from a vps-watch directory.

Usage:
  python3 scripts/build_vps.py --in /path/to/vps-watch --out vps.json

Reads only these three files (schema_version 1, Beijing-time fields *_beijing):

  stock-state.json      DMIT and BandwagonHost stock
  bf-seen.json          Black Friday official status and third-party leads
  free-vps-seen.json    Free-VPS intelligence (only genuine == true is kept)

Never reads signups.json or any other file in that directory. Missing fields
are left blank. Strings that look like an email, a password, or an API key
are dropped. Prices and order links are copied from the input only — a
BandwagonHost watched plan has no price of its own, so those are filled by
matching pid / display_name / aliases against catalog_stock_bwg_la and
catalog_vpsrestock. Unmatched plans keep an empty price and no order link.

The committed vps.json in this repo is sample data (sample: true). This
script writes sample: false. Real publishes run the script locally and then
./build-site.sh.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

FORBIDDEN_NAMES = {
    "signups.json",
    "signup.json",
    "accounts.json",
    "secrets.json",
    "credentials.json",
}

UNSAFE_KEY_EXACT = {
    "password",
    "passwd",
    "pass",
    "secret",
    "token",
    "access_token",
    "refresh_token",
    "id_token",
    "api_key",
    "apikey",
    "api_token",
    "credential",
    "credentials",
    "private_key",
    "email",
    "e_mail",
    "mail",
    "authorization",
    "cookie",
    "cookies",
    "session",
    "session_id",
}

EMAIL_RE = re.compile(
    r"(?<![A-Za-z0-9._%+\-])[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}(?![A-Za-z0-9.\-])"
)
SECRET_RE = re.compile(
    r"(?:"
    r"\b(?:sk|pk|rk|ak|ghp|gho|github_pat)_[A-Za-z0-9_\-]{8,}"
    r"|\b(?:sk|pk|rk|ak)-[A-Za-z0-9_\-]{12,}"
    r"|\bAKIA[0-9A-Z]{16}\b"
    r"|\bBearer\s+[A-Za-z0-9._\-]{8,}"
    r"|(?:api[_-]?key|access[_-]?token|refresh[_-]?token|secret|password)\s*[:=]\s*\S+"
    r")",
    re.IGNORECASE,
)

SPEC_LABELS = {
    "cpu": "CPU",
    "vcpu": "CPU",
    "ram": "内存",
    "memory": "内存",
    "内存": "内存",
    "disk": "硬盘",
    "storage": "硬盘",
    "ssd": "硬盘",
    "硬盘": "硬盘",
    "port": "端口",
    "端口": "端口",
    "bandwidth": "带宽",
    "带宽": "带宽",
    "traffic": "流量",
    "transfer": "流量",
    "流量": "流量",
    "location": "位置",
    "region": "区域",
    "位置": "位置",
    "区域": "区域",
}

TYPE_LABELS = {
    "always free": ("always_free", "一直免费"),
    "always_free": ("always_free", "一直免费"),
    "free": ("always_free", "一直免费"),
    "free forever": ("always_free", "一直免费"),
    "forever free": ("always_free", "一直免费"),
    "trial": ("trial", "试用额度"),
    "trial credit": ("trial", "试用额度"),
    "free trial": ("trial", "试用额度"),
    "credit": ("trial", "试用额度"),
    "student": ("student", "学生额度"),
    "student credit": ("student", "学生额度"),
    "education": ("student", "学生额度"),
    "github student": ("student", "学生额度"),
    "paas": ("paas", "非 root 的 PaaS"),
    "paas non root": ("paas", "非 root 的 PaaS"),
    "non root paas": ("paas", "非 root 的 PaaS"),
    "non root": ("paas", "非 root 的 PaaS"),
    "一直免费": ("always_free", "一直免费"),
    "试用额度": ("trial", "试用额度"),
    "学生额度": ("student", "学生额度"),
    "非 root 的 paas": ("paas", "非 root 的 PaaS"),
}

SOURCE_LABELS = {
    "vpsrestock": "vpsrestock.com",
    "telegram_dmitnews": "t.me/dmitnews",
    "dmit_telegram": "t.me/dmitnews",
    "stock_bwg_la": "stock.bwg.la",
    "stock.bwg.la": "stock.bwg.la",
    "dmit_official_site": "DMIT 官网",
}


def unsafe_key(key: Any) -> bool:
    raw = str(key or "").strip()
    if not raw:
        return False
    if any(word in raw for word in ("邮箱", "密码", "密钥")):
        return True
    norm = raw.lower().replace("-", "_").replace(" ", "_")
    if norm in UNSAFE_KEY_EXACT:
        return True
    return norm.endswith(("_password", "_secret", "_token", "_email", "_apikey", "_api_key"))


def as_list(value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        return list(value.values())
    return []


def as_text(value: Any) -> str:
    if value is None or isinstance(value, bool):
        return ""
    if isinstance(value, (int, float)):
        if isinstance(value, float) and value.is_integer():
            return str(int(value))
        return str(value)
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, list):
        parts = [as_text(item) for item in value]
        return "；".join(part for part in parts if part)
    if isinstance(value, dict):
        for key in ("summary", "note", "text", "message", "title", "time_beijing", "at"):
            if unsafe_key(key):
                continue
            text = as_text(value.get(key))
            if text:
                return text
        return ""
    return ""


def scrub(value: str) -> str:
    text = EMAIL_RE.sub("[redacted]", value)
    text = SECRET_RE.sub("[redacted]", text)
    return text


def clean_text(value: Any) -> str:
    text = scrub(as_text(value)).strip()
    if not text:
        return ""
    leftover = text.replace("[redacted]", "").strip(" ；,，")
    if not leftover:
        return ""
    return text


def clean_url(value: Any) -> str:
    text = clean_text(value)
    if not re.match(r"https?://", text, re.IGNORECASE):
        return ""
    if re.search(r"[\s<>\"']", text):
        return ""
    if EMAIL_RE.search(text) or SECRET_RE.search(text):
        return ""
    return text


def as_bool(value: Any) -> bool | None:
    if isinstance(value, bool):
        return value
    if value is None or value == "":
        return None
    text = str(value).strip().lower()
    if text in {"true", "yes", "1", "required", "y"}:
        return True
    if text in {"false", "no", "0", "n"}:
        return False
    return None


def norm_space(value: Any) -> str:
    return re.sub(r"\s+", " ", as_text(value).casefold()).strip()


def norm_compact(value: Any) -> str:
    return re.sub(r"[\s\-_/]+", "", norm_space(value))


def hostname(url: str) -> str:
    match = re.match(r"https?://([^/?#]+)", url or "", re.IGNORECASE)
    if not match:
        return ""
    return match.group(1).lower().split(":")[0].removeprefix("www.")


def parse_beijing(value: Any) -> datetime | None:
    text = clean_text(value)
    text = text.replace("（北京时间）", "").replace("(北京时间)", "").strip()
    if not text:
        return None
    candidates = [text, text.replace("T", " ")[:19]]
    formats = (
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y/%m/%d %H:%M:%S",
        "%Y/%m/%d %H:%M",
        "%Y-%m-%d",
    )
    for candidate in candidates:
        for fmt in formats:
            try:
                return datetime.strptime(candidate[: len(datetime.now().strftime(fmt)) + 2], fmt)
            except ValueError:
                continue
        try:
            parsed = datetime.fromisoformat(candidate.replace("Z", "+00:00"))
            return parsed.replace(tzinfo=None)
        except ValueError:
            continue
    return None


def latest_beijing(values: list[Any]) -> str:
    best_dt: datetime | None = None
    best_raw = ""
    for value in values:
        raw = clean_text(value)
        parsed = parse_beijing(raw)
        if parsed is None:
            if raw and not best_raw and best_dt is None:
                best_raw = raw
            continue
        if best_dt is None or parsed > best_dt:
            best_dt = parsed
            best_raw = raw
    return best_raw


def spec_label(key: Any) -> str:
    raw = str(key or "").strip()
    if not raw or unsafe_key(raw):
        return ""
    if raw in SPEC_LABELS:
        return SPEC_LABELS[raw]
    lowered = raw.lower()
    if lowered in SPEC_LABELS:
        return SPEC_LABELS[lowered]
    return raw


def specs_from(value: Any) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    if isinstance(value, list):
        for item in value:
            if isinstance(item, dict):
                label = clean_text(item.get("label") or item.get("name") or item.get("key"))
                cell = clean_text(item.get("value") if "value" in item else item.get("text"))
                if label or cell:
                    rows.append({"label": spec_label(label) or label, "value": cell})
            else:
                cell = clean_text(item)
                if cell:
                    rows.append({"label": "", "value": cell})
        return rows
    if isinstance(value, dict):
        for key, cell in value.items():
            label = spec_label(key)
            if not label:
                continue
            text = clean_text(cell)
            if text:
                rows.append({"label": label, "value": text})
        return rows
    text = clean_text(value)
    if text:
        rows.append({"label": "", "value": text})
    return rows


def config_line(specs: list[dict[str, str]]) -> str:
    parts: list[str] = []
    for row in specs:
        value = row.get("value") or ""
        if not value:
            continue
        label = row.get("label") or ""
        if label in {"位置", "区域"}:
            parts.append(value)
        else:
            parts.append(value)
    return " / ".join(parts)


def classify_type(value: Any) -> tuple[str, str]:
    raw = clean_text(value)
    if not raw:
        return "other", "其他"
    key = raw.casefold().replace("-", " ").replace("_", " ")
    key = re.sub(r"\s+", " ", key).strip()
    if key in TYPE_LABELS:
        return TYPE_LABELS[key]
    if "学生" in raw:
        return "student", "学生额度"
    if "试用" in raw:
        return "trial", "试用额度"
    if "paas" in key or "非 root" in raw or "非root" in raw.casefold():
        return "paas", "非 root 的 PaaS"
    if "always" in key or "一直" in raw:
        return "always_free", "一直免费"
    if len(raw) <= 24:
        return "other", raw
    return "other", "其他"


def classify_status(status: str, orderable: bool | None) -> tuple[str, str]:
    folded = status.casefold().replace("-", "_").replace(" ", "_")
    if "no_black_friday" in folded or "not_this_year" in folded or "no_sale_this_year" in folded:
        return "今年不办", "off"
    if orderable is True:
        return "现在能下单", "now"
    if any(token in folded for token in ("preannounce", "no_sku", "not_open", "upcoming", "coming_soon", "announced")):
        return "预告未开卖", "soon"
    if any(token in folded for token in ("cancelled", "canceled", "skipped")):
        return "今年不办", "off"
    if orderable is not False and any(token in folded for token in ("orderable", "on_sale", "orders_open", "sale_live")):
        return "现在能下单", "now"
    return "预告未开卖", "soon"


def normalize_stock(value: Any) -> str:
    if isinstance(value, bool):
        return "in_stock" if value else "out_of_stock"
    text = norm_space(value).replace(" ", "_").replace("-", "_")
    if text in {"in_stock", "instock", "available", "yes", "true", "有货"}:
        return "in_stock"
    if text in {"out_of_stock", "outofstock", "out", "sold_out", "soldout", "unavailable", "no", "false", "缺货"}:
        return "out_of_stock"
    return "out_of_stock" if text else ""


def pid_of(obj: Any) -> str:
    if not isinstance(obj, dict):
        return ""
    sources = [obj]
    config = obj.get("config")
    if isinstance(config, dict):
        sources.append(config)
    for source in sources:
        for key in ("pid", "product_id", "plan_id"):
            if unsafe_key(key):
                continue
            text = clean_text(source.get(key))
            if text and text.casefold() not in {"0", "none", "null"}:
                return text
    return ""


def order_label(url: str, explicit: str = "") -> str:
    label = clean_text(explicit)
    if label and label.casefold() not in {"official_order_url", "official_order_url_cn_mirror"}:
        return label
    host = hostname(url)
    if "bwh81.net" in host:
        return "bwh81.net"
    if "bandwagonhost.com" in host:
        return "bandwagonhost.com"
    return "官网下单"


def push_order_url(links: list[dict[str, str]], url: Any, label: str = "") -> None:
    cleaned = clean_url(url)
    if not cleaned:
        return
    if any(item.get("url") == cleaned for item in links):
        return
    links.append({"label": order_label(cleaned, label), "url": cleaned})


def order_urls_from(obj: Any) -> list[dict[str, str]]:
    links: list[dict[str, str]] = []
    if not isinstance(obj, dict):
        return links
    pairs = (
        ("official_order_url", ""),
        ("official_order_url_cn_mirror", "bwh81.net"),
        ("order_url", ""),
        ("order_url_cn", "bwh81.net"),
        ("cn_mirror_url", "bwh81.net"),
        ("order_url_mirror", "bwh81.net"),
    )
    for key, label in pairs:
        if key in obj:
            push_order_url(links, obj.get(key), label)
    return links


def price_text(value: Any) -> str:
    if isinstance(value, list):
        parts = [clean_text(item) for item in value]
        return " / ".join(part for part in parts if part)
    return clean_text(value)


def read_watch_file(src: Path, name: str) -> dict[str, Any]:
    lowered = name.lower()
    if lowered in FORBIDDEN_NAMES or "signup" in lowered or "credential" in lowered or "secret" in lowered:
        raise SystemExit(f"refusing to read {name}")
    path = src / name
    if not path.is_file():
        raise SystemExit(f"missing {name} in {src}")
    try:
        data = json.loads(path.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"{name} is not valid JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise SystemExit(f"{name} must be a JSON object")
    return data


def names_of_plan(plan: dict[str, Any]) -> set[str]:
    found: set[str] = set()
    for key in ("display_name", "name", "key"):
        text = clean_text(plan.get(key))
        if text:
            found.add(norm_space(text))
            found.add(norm_compact(text))
    for alias in as_list(plan.get("aliases")):
        text = clean_text(alias)
        if text:
            found.add(norm_space(text))
            found.add(norm_compact(text))
    found.discard("")
    return found


def catalog_names(item: dict[str, Any]) -> set[str]:
    found: set[str] = set()
    for key in ("name", "display_name", "key"):
        text = clean_text(item.get(key))
        if text:
            found.add(norm_space(text))
            found.add(norm_compact(text))
    for alias in as_list(item.get("aliases")):
        text = clean_text(alias)
        if text:
            found.add(norm_space(text))
            found.add(norm_compact(text))
    found.discard("")
    return found


def match_catalog(plan: dict[str, Any], catalogs: list[Any]) -> list[dict[str, Any]]:
    wanted_pid = pid_of(plan)
    wanted_names = names_of_plan(plan)
    matches: list[dict[str, Any]] = []
    seen: set[int] = set()
    items: list[dict[str, Any]] = []
    for catalog in catalogs:
        for item in as_list(catalog):
            if isinstance(item, dict):
                items.append(item)
    for item in items:
        item_pid = pid_of(item)
        if wanted_pid and item_pid and wanted_pid == item_pid:
            if id(item) not in seen:
                matches.append(item)
                seen.add(id(item))
    for item in items:
        if id(item) in seen:
            continue
        if wanted_names and (catalog_names(item) & wanted_names):
            matches.append(item)
            seen.add(id(item))
    return matches


def clean_source_entry(key: str, value: Any) -> dict[str, str] | None:
    if not isinstance(value, dict):
        url = clean_url(value)
        if not url:
            return None
        return {"name": SOURCE_LABELS.get(key, hostname(url) or key), "url": url, "checked_at_beijing": ""}
    url = clean_url(value.get("url") or value.get("href"))
    name = clean_text(value.get("name") or value.get("title")) or SOURCE_LABELS.get(key, "")
    if not name and url:
        name = hostname(url)
    checked = clean_text(
        value.get("page_updated_beijing")
        or value.get("checked_at_beijing")
        or value.get("updated_at_beijing")
        or value.get("time_beijing")
    )
    latest = value.get("latest_post")
    if isinstance(latest, dict):
        post_url = clean_url(latest.get("url"))
        if post_url and not url:
            url = post_url
        post_time = clean_text(latest.get("time_beijing"))
        if post_time and not checked:
            checked = post_time
    note = clean_text(value.get("counts_as_shown") or value.get("note"))
    if not url and not name:
        return None
    entry = {"name": name or "来源", "url": url, "checked_at_beijing": checked}
    if note:
        entry["note"] = note
    return entry


def clean_sources(sources: Any) -> list[dict[str, str]]:
    cleaned: list[dict[str, str]] = []
    if isinstance(sources, dict):
        pairs = list(sources.items())
    elif isinstance(sources, list):
        pairs = [(str(index), item) for index, item in enumerate(sources)]
    else:
        return cleaned
    for key, value in pairs:
        if unsafe_key(key):
            continue
        entry = clean_source_entry(str(key), value)
        if entry:
            cleaned.append(entry)
    return cleaned


def is_limited(plan: dict[str, Any], matches: list[dict[str, Any]]) -> bool:
    flag = as_bool(plan.get("limited_edition"))
    if flag is None:
        flag = as_bool(plan.get("limited"))
    if flag is True:
        return True
    category = norm_space(plan.get("category"))
    if category in {"limited", "limited edition", "限量"}:
        return True
    for item in matches:
        if as_bool(item.get("limited_edition")) is True or as_bool(item.get("limited")) is True:
            return True
    return False


def clean_watched_plan(key: str, plan: Any, catalogs: list[Any]) -> dict[str, Any] | None:
    if isinstance(plan, str):
        plan = {"key": key, "display_name": plan}
    if not isinstance(plan, dict):
        return None
    matches = match_catalog(plan, catalogs)
    config = plan.get("config")
    if isinstance(config, str):
        config_text = clean_text(config)
        specs = specs_from(plan.get("specs"))
    else:
        specs = specs_from(config if config not in (None, "") else plan.get("specs"))
        config_text = config_line(specs)
    if not config_text:
        for item in matches:
            config_text = clean_text(item.get("specs") or item.get("config"))
            if config_text:
                break
    if not specs:
        for item in matches:
            specs = specs_from(item.get("specs") or item.get("config"))
            if specs:
                if not config_text:
                    config_text = config_line(specs)
                break
    price = price_text(plan.get("price_as_shown"))
    if not price:
        price = price_text(plan.get("price"))
    if not price:
        for item in matches:
            price = price_text(item.get("prices"))
            if not price:
                price = price_text(item.get("price") or item.get("price_as_shown"))
            if price:
                break
    links = order_urls_from(plan)
    for item in matches:
        for link in order_urls_from(item):
            push_order_url(links, link["url"], link["label"])
    display = clean_text(plan.get("display_name") or plan.get("name") or plan.get("key") or key)
    if not display and matches:
        display = clean_text(matches[0].get("name"))
    if not display:
        return None
    last = clean_text(plan.get("last_restock") or plan.get("restock_note") or plan.get("restock"))
    if not last:
        for item in matches:
            last = clean_text(item.get("restock_note") or item.get("last_restock"))
            if last:
                break
    stock = normalize_stock(plan.get("stock"))
    if not stock:
        for item in matches:
            stock = normalize_stock(item.get("stock"))
            if stock:
                break
    plan_key = clean_text(plan.get("key") or key or display)
    return {
        "key": plan_key,
        "display_name": display,
        "config": config_text,
        "specs": specs,
        "price": price,
        "stock": stock or "out_of_stock",
        "limited": is_limited(plan, matches),
        "last_restock": last,
        "order_urls": links,
    }


def plans_from(raw: Any, catalogs: list[Any]) -> list[dict[str, Any]]:
    plans: list[dict[str, Any]] = []
    if isinstance(raw, dict):
        items = list(raw.items())
    elif isinstance(raw, list):
        items = [(str(index), item) for index, item in enumerate(raw)]
    else:
        return plans
    for key, plan in items:
        if unsafe_key(key):
            continue
        cleaned = clean_watched_plan(str(key), plan, catalogs)
        if cleaned:
            plans.append(cleaned)
    return plans


def official_url_from_sources(sources: Any) -> str:
    if not isinstance(sources, dict):
        return ""
    for key in ("dmit_official_site", "official_site", "official", "homepage"):
        block = sources.get(key)
        if isinstance(block, dict):
            url = clean_url(block.get("url") or block.get("homepage"))
        else:
            url = clean_url(block)
        if url:
            return url
    return ""


def clean_provider(provider_id: str, name: str, block: Any, catalogs: list[Any], checked: str) -> dict[str, Any]:
    block = block if isinstance(block, dict) else {}
    sources = clean_sources(block.get("sources"))
    # The company homepage is not a stock data source.
    sources = [item for item in sources if item.get("name") not in {"DMIT 官网"}]
    return {
        "id": provider_id,
        "name": name,
        "checked_at_beijing": checked,
        "official_url": official_url_from_sources(block.get("sources")) or clean_url(block.get("official_url")),
        "sources": sources,
        "plans": plans_from(block.get("watched_plans") or block.get("plans"), catalogs),
    }


def source_notes(value: Any) -> list[str]:
    notes: list[str] = []
    for item in as_list(value):
        text = clean_text(item)
        if text and len(text) <= 180:
            notes.append(text)
    return notes


def clean_free_item(item: Any) -> dict[str, Any] | None:
    if not isinstance(item, dict):
        return None
    if as_bool(item.get("genuine")) is not True:
        return None
    provider = clean_text(item.get("provider") or item.get("name"))
    if not provider:
        return None
    type_key, type_label = classify_type(item.get("type") or item.get("kind"))
    conditions = item.get("free_conditions")
    if isinstance(conditions, str):
        conditions = {"deadline_note": conditions}
    if not isinstance(conditions, dict):
        conditions = {}
    card_required = as_bool(conditions.get("card_required"))
    specs = specs_from(item.get("specs") or item.get("config"))
    posts: list[dict[str, str]] = []
    for post in as_list(item.get("posts")):
        if isinstance(post, str):
            url = clean_url(post)
            if url:
                posts.append({"url": url, "time_beijing": "", "author": "", "role": ""})
            continue
        if not isinstance(post, dict):
            continue
        url = clean_url(post.get("url"))
        if not url:
            continue
        posts.append(
            {
                "url": url,
                "time_beijing": clean_text(post.get("time_beijing")),
                "author": clean_text(post.get("author")),
                "role": clean_text(post.get("role")),
            }
        )
    return {
        "id": clean_text(item.get("id")) or norm_compact(provider) or "vps",
        "provider": provider,
        "type": type_key,
        "type_label": type_label,
        "specs": specs,
        "free_conditions": {
            "card_required": card_required,
            "card_notes": clean_text(conditions.get("card_notes")),
            "region_limits": clean_text(conditions.get("region_limits")),
            "idle_reclaim": clean_text(conditions.get("idle_reclaim")),
            "deadline": clean_text(conditions.get("deadline")),
            "deadline_note": clean_text(conditions.get("deadline_note")),
        },
        "official_url": clean_url(item.get("official_url") or item.get("url")),
        "posts": posts,
        "notes": clean_text(item.get("notes") or item.get("note")),
    }


def clean_bf_plan(plan: Any) -> dict[str, str] | None:
    if isinstance(plan, str):
        name = clean_text(plan)
        return {"name": name} if name else None
    if not isinstance(plan, dict):
        return None
    name = clean_text(plan.get("name") or plan.get("title") or plan.get("plan") or plan.get("sku") or plan.get("display_name"))
    price = price_text(plan.get("price") or plan.get("price_as_shown") or plan.get("prices"))
    specs = clean_text(plan.get("specs"))
    if not specs and not isinstance(plan.get("config"), (dict, list)):
        specs = clean_text(plan.get("config"))
    if not specs:
        rows = specs_from(plan.get("config") if isinstance(plan.get("config"), (dict, list)) else None)
        if not rows:
            rows = []
            for key in ("cpu", "ram", "memory", "disk", "location", "bandwidth", "traffic"):
                cell = clean_text(plan.get(key))
                if cell:
                    rows.append({"label": spec_label(key), "value": cell})
        specs = config_line(rows)
    url = clean_url(plan.get("official_order_url") or plan.get("order_url") or plan.get("url"))
    if not any((name, price, specs, url)):
        return None
    out: dict[str, str] = {}
    if name:
        out["name"] = name
    if price:
        out["price"] = price
    if specs:
        out["specs"] = specs
    if url:
        out["url"] = url
    return out


def clean_official(entry: Any) -> dict[str, Any] | None:
    if not isinstance(entry, dict):
        return None
    provider = clean_text(entry.get("provider") or entry.get("name"))
    if not provider:
        return None
    status = clean_text(entry.get("status"))
    orderable = as_bool(entry.get("orderable_now"))
    label, kind = classify_status(status, orderable)
    sources: list[dict[str, str]] = []
    for src in as_list(entry.get("sources")):
        if isinstance(src, str):
            url = clean_url(src)
            if url:
                sources.append({"url": url})
            continue
        if not isinstance(src, dict):
            continue
        item: dict[str, str] = {}
        typ = clean_text(src.get("type"))
        url = clean_url(src.get("url"))
        title = clean_text(src.get("title"))
        fetched = clean_text(src.get("fetched_beijing") or src.get("time_beijing"))
        if typ:
            item["type"] = typ
        if url:
            item["url"] = url
        if title:
            item["title"] = title
        if fetched:
            item["fetched_beijing"] = fetched
        if item.get("url") or item.get("title"):
            sources.append(item)
    plans = []
    for plan in as_list(entry.get("plans")):
        cleaned = clean_bf_plan(plan)
        if cleaned:
            plans.append(cleaned)
    return {
        "provider": provider,
        "status": status,
        "status_label": label,
        "status_kind": kind,
        "orderable_now": orderable is True,
        "summary": clean_text(entry.get("summary") or entry.get("note")),
        "sources": sources,
        "sale_hub": clean_url(entry.get("sale_hub") or entry.get("sale_url")),
        "plans": plans,
    }


def clean_lead(entry: Any) -> dict[str, str] | None:
    if isinstance(entry, str):
        text = clean_text(entry)
        return {"source": text, "note": "", "url": clean_url(text)} if text else None
    if not isinstance(entry, dict):
        return None
    source = clean_text(entry.get("source") or entry.get("title") or entry.get("name"))
    note = clean_text(entry.get("note") or entry.get("summary"))
    url = clean_url(entry.get("url")) or clean_url(source)
    if not source and not note and not url:
        return None
    return {"source": source or url, "note": note, "url": url}


def build_vps(src: Path) -> dict[str, Any]:
    if not src.is_dir():
        raise SystemExit(f"not a directory: {src}")
    # Intentionally do not listdir-and-read. signups.json must never be opened.
    stock = read_watch_file(src, "stock-state.json")
    black_friday = read_watch_file(src, "bf-seen.json")
    free_seen = read_watch_file(src, "free-vps-seen.json")

    stock_at = clean_text(stock.get("scanned_at_beijing"))
    bf_at = clean_text(black_friday.get("scanned_at_beijing"))
    free_at = clean_text(free_seen.get("scanned_at_beijing"))

    dmit = stock.get("dmit") if isinstance(stock.get("dmit"), dict) else {}
    bandwagon = stock.get("bandwagonhost") if isinstance(stock.get("bandwagonhost"), dict) else {}
    if not bandwagon and isinstance(stock.get("bandwagon"), dict):
        bandwagon = stock.get("bandwagon") or {}
    catalogs = [bandwagon.get("catalog_stock_bwg_la"), bandwagon.get("catalog_vpsrestock")]

    free_items = []
    for item in as_list(free_seen.get("items")):
        cleaned = clean_free_item(item)
        if cleaned:
            free_items.append(cleaned)

    official = []
    for entry in as_list(black_friday.get("official")):
        cleaned = clean_official(entry)
        if cleaned:
            official.append(cleaned)
    leads = []
    for entry in as_list(black_friday.get("leads_third_party_only") or black_friday.get("leads")):
        cleaned = clean_lead(entry)
        if cleaned:
            leads.append(cleaned)

    document = {
        "schema_version": 1,
        "sample": False,
        "updated_at_beijing": latest_beijing([stock_at, bf_at, free_at]),
        "scanned_at_beijing": {
            "stock": stock_at,
            "black_friday": bf_at,
            "free_vps": free_at,
        },
        "free_vps": free_items,
        "stock": {
            "source_notes": source_notes(stock.get("source_issues")),
            "providers": [
                clean_provider("dmit", "DMIT", dmit, [], stock_at),
                clean_provider("bandwagonhost", "搬瓦工", bandwagon, catalogs, stock_at),
            ],
        },
        "black_friday": {
            "date_note": clean_text(black_friday.get("black_friday_2026_date_note") or black_friday.get("date_note")),
            "official": official,
            "leads": leads,
        },
    }
    raw = json.dumps(document, ensure_ascii=False)
    if EMAIL_RE.search(raw) or SECRET_RE.search(raw):
        raise SystemExit("refusing to write vps.json: output still contains an email or secret-like string")
    return document


def write_vps(document: dict[str, Any], dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Build vps.json from a vps-watch directory")
    parser.add_argument("--in", dest="src", required=True, help="directory with stock-state.json, bf-seen.json, free-vps-seen.json")
    parser.add_argument("--out", required=True, help="output vps.json path")
    args = parser.parse_args(argv)
    document = build_vps(Path(args.src))
    write_vps(document, Path(args.out))
    stock_providers = document["stock"]["providers"]
    print(
        "Wrote {out} free={free} dmit_plans={dmit} bwh_plans={bwh} bf={bf} leads={leads} updated={updated}".format(
            out=args.out,
            free=len(document["free_vps"]),
            dmit=len(stock_providers[0]["plans"]),
            bwh=len(stock_providers[1]["plans"]),
            bf=len(document["black_friday"]["official"]),
            leads=len(document["black_friday"]["leads"]),
            updated=document["updated_at_beijing"] or "-",
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
