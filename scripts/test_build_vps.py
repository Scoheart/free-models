#!/usr/bin/env python3
"""Fixture checks for scripts/build_vps.py. Not part of the deployed site."""
from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import build_vps  # noqa: E402


def main() -> int:
    failures: list[str] = []

    def check(cond: bool, message: str) -> None:
        if not cond:
            failures.append(message)

    stock = {
        "schema_version": 1,
        "scanned_at_beijing": "2026-11-15 08:00:00",
        "dmit": {
            "sources": {
                "vpsrestock": {
                    "url": "https://vpsrestock.com/dmit",
                    "page_updated_beijing": "2026-11-15 07:40",
                    "counts_as_shown": "3/10",
                },
                "telegram_dmitnews": {
                    "url": "https://t.me/dmitnews",
                    "latest_post": {
                        "url": "https://t.me/dmitnews/100",
                        "time_beijing": "2026-11-14 21:00",
                        "summary": "LA 补货",
                    },
                },
                "dmit_official_site": {
                    "url": "https://www.dmit.io/",
                    "email": "leak@dmit.example",
                },
            },
            "watched_plans": {
                "LAX-PRO": {
                    "key": "LAX-PRO",
                    "stock": "in_stock",
                    "config": {
                        "cpu": "1 vCPU",
                        "ram": "1 GB",
                        "disk": "20 GB SSD",
                        "port": "1 Gbps",
                        "traffic": "2 TB",
                        "location": "Los Angeles",
                    },
                    "price_as_shown": "$6.9/月",
                    "last_restock": "2026-11-14 补货",
                    "official_order_url": "https://www.dmit.io/cart/?id=lax-pro",
                },
                "HK-OUT": {
                    "stock": "out_of_stock",
                    "config": {"cpu": "2 vCPU", "ram": "2 GB"},
                    "price_as_shown": "$12/月",
                },
            },
        },
        "bandwagonhost": {
            "sources": {
                "vpsrestock": {"url": "https://vpsrestock.com/bwh", "page_updated_beijing": "2026-11-15 07:50"},
                "stock_bwg_la": {"url": "https://stock.bwg.la/", "counts_as_shown": "CN2 有货"},
            },
            "summary": {"watched_in_stock": ["CN2-GIA"]},
            "watched_plans": {
                "CN2-GIA": {
                    "key": "CN2-GIA",
                    "display_name": "CN2 GIA-E",
                    "aliases": ["CN2 GIA E-Commerce"],
                    "category": "limited",
                    "stock": "in_stock",
                    "limited_edition": True,
                    "config": {"CPU": "2 核", "内存": "1 GB", "硬盘": "20 GB", "端口": "1 Gbps", "流量": "1 TB/月"},
                },
                "PID-ONLY": {
                    "key": "PID-ONLY",
                    "display_name": "目录名不同",
                    "pid": "99",
                    "stock": "out_of_stock",
                    "config": {"CPU": "1 核"},
                },
                "UNKNOWN-PLAN": {
                    "key": "UNKNOWN-PLAN",
                    "display_name": "不存在的套餐",
                    "aliases": ["no-such-plan"],
                    "stock": "out_of_stock",
                    "config": {"CPU": "1 核", "内存": "512 MB"},
                },
            },
            "catalog_stock_bwg_la": [
                {
                    "name": "CN2 GIA E-Commerce",
                    "stock": "in_stock",
                    "specs": "2C1G",
                    "prices": ["$49.99/年", "$9.99/月"],
                    "pid": "88",
                    "official_order_url": "https://bandwagonhost.com/cart.php?pid=88",
                    "official_order_url_cn_mirror": "https://bwh81.net/cart.php?pid=88",
                }
            ],
            "catalog_vpsrestock": [
                {
                    "name": "Some Other Label",
                    "stock": "out_of_stock",
                    "specs": "1 vCPU",
                    "price": "$11/年",
                    "restock_note": "上周见过",
                    "pid": "99",
                }
            ],
        },
        "source_issues": ["vpsrestock 超时一次"],
        "last_alert": {"password": "should-not-appear", "email": "alert@example.com"},
        "this_run": {"token": "ghp_abcdefghijklmnopqrstuvwxyz"},
    }
    free = {
        "schema_version": 1,
        "scanned_at_beijing": "2026-11-15 06:00",
        "items": [
            {
                "id": "oracle",
                "provider": "Oracle Cloud",
                "type": "always free",
                "genuine": True,
                "specs": {"CPU": "4 OCPU", "内存": "24 GB"},
                "free_conditions": {
                    "card_required": True,
                    "card_notes": "验证用",
                    "region_limits": "部分区域",
                    "idle_reclaim": "闲置可能回收",
                    "deadline": "",
                    "deadline_note": "没有固定截止",
                },
                "official_url": "https://www.oracle.com/cloud/free/",
                "posts": [
                    {
                        "url": "https://x.com/example/status/1",
                        "time_beijing": "2026-11-01 12:00",
                        "author": "someone",
                        "role": "转发",
                    }
                ],
                "notes": "联系 me@example.com 或 sk-abcdefghijklmnopqrstuvwxyz 不要出现",
            },
            {
                "id": "student",
                "provider": "GitHub Education",
                "type": "student",
                "genuine": "true",
                "official_url": "https://education.github.com/pack",
            },
            {
                "id": "paas",
                "provider": "Render",
                "type": "non-root paas",
                "genuine": True,
                "official_url": "https://render.com/",
            },
            {
                "id": "fake",
                "provider": "Not Genuine Host",
                "type": "trial",
                "genuine": False,
                "official_url": "https://example.com/nope",
                "notes": "不应出现",
            },
        ],
        "dropped": [{"id": "old", "provider": "Dropped Provider Should Not Show"}],
        "watch_accounts": [{"email": "watcher@example.com", "password": "hunter2"}],
    }
    bf = {
        "schema_version": 1,
        "scanned_at_beijing": "2026-11-15 09:30:00",
        "black_friday_2026_date_note": "2026 年黑色星期五是 11 月 27 日",
        "official": [
            {
                "provider": "RackNerd",
                "status": "official_orderable_now",
                "orderable_now": True,
                "summary": "年付套餐可以下单",
                "sources": [
                    {
                        "type": "official",
                        "url": "https://www.racknerd.com/",
                        "title": "RackNerd",
                        "fetched_beijing": "2026-11-15 09:00",
                    }
                ],
                "sale_hub": "https://www.racknerd.com/black-friday",
                "plans": [{"name": "1C 1G", "price": "$10.99/年", "url": "https://www.racknerd.com/"}],
            },
            {
                "provider": "Netcup",
                "status": "official_preannouncement_no_skus_yet",
                "orderable_now": False,
                "summary": "已预告，还没有套餐",
                "sources": [{"type": "official", "url": "https://www.netcup.com/", "title": "Netcup"}],
                "plans": [],
            },
            {
                "provider": "OVH",
                "status": "official_no_black_friday_this_year",
                "orderable_now": False,
                "summary": "今年不办黑五",
                "sources": [{"type": "official", "url": "https://www.ovhcloud.com/", "title": "OVH"}],
            },
        ],
        "leads_third_party_only": [
            {"source": "https://example.com/thread", "note": "有人说会打折，邮箱 leak@example.com"}
        ],
        "new_orderable_plans_this_scan": [{"name": "should-not-be-required"}],
    }

    with tempfile.TemporaryDirectory() as tmp:
        folder = Path(tmp)
        (folder / "stock-state.json").write_text(json.dumps(stock), encoding="utf-8")
        (folder / "bf-seen.json").write_text(json.dumps(bf), encoding="utf-8")
        (folder / "free-vps-seen.json").write_text(json.dumps(free), encoding="utf-8")
        (folder / "signups.json").write_text(
            json.dumps(
                {
                    "note": "SIGNUP_CANARY_PLEASE_LEAK",
                    "email": "signup-canary@example.com",
                    "password": "SignupCanaryPassword",
                    "token": "sk-SIGNUPSECRETKEY1234567890",
                }
            ),
            encoding="utf-8",
        )
        # Extra unexpected file must not be required, and must not be read.
        (folder / "notes.json").write_text(json.dumps({"password": "ignore-me"}), encoding="utf-8")
        document = build_vps.build_vps(folder)

    raw = json.dumps(document, ensure_ascii=False)
    for needle in (
        "SIGNUP_CANARY_PLEASE_LEAK",
        "signup-canary@example.com",
        "SignupCanaryPassword",
        "sk-SIGNUPSECRETKEY1234567890",
        "leak@dmit.example",
        "alert@example.com",
        "should-not-appear",
        "ghp_abcdefghijklmnopqrstuvwxyz",
        "me@example.com",
        "sk-abcdefghijklmnopqrstuvwxyz",
        "watcher@example.com",
        "hunter2",
        "Not Genuine Host",
        "Dropped Provider Should Not Show",
        "leak@example.com",
        "ignore-me",
    ):
        check(needle not in raw, "leaked " + needle)

    check(document["sample"] is False, "generated file is not sample data")
    check(document["updated_at_beijing"] == "2026-11-15 09:30:00", "latest beijing time " + document["updated_at_beijing"])
    check(document["free_vps"][0]["type_label"] == "一直免费", "always free label")
    labels = [item["type_label"] for item in document["free_vps"]]
    check(labels == ["一直免费", "学生额度", "非 root 的 PaaS"], "type labels " + ",".join(labels))
    check("Oracle Cloud" in raw and "验证用" in raw, "free conditions kept")
    check(document["free_vps"][0]["notes"] == "" or "me@example.com" not in document["free_vps"][0]["notes"], "note scrubbed")
    check("[redacted]" not in raw or "sk-" not in raw, "secret marker did not keep the key")

    dmit = document["stock"]["providers"][0]
    bwh = document["stock"]["providers"][1]
    check(dmit["name"] == "DMIT" and bwh["name"] == "搬瓦工", "provider names")
    check(dmit["official_url"] == "https://www.dmit.io/", "dmit official url")
    check(any(item["name"] == "vpsrestock.com" for item in dmit["sources"]), "dmit vpsrestock source")
    check(any(item["name"] == "t.me/dmitnews" for item in dmit["sources"]), "dmit telegram source")
    check(all(item["name"] != "DMIT 官网" for item in dmit["sources"]), "homepage is not a stock source")
    lax = dmit["plans"][0]
    check(lax["stock"] == "in_stock" and lax["price"] == "$6.9/月", "dmit price kept")
    check(lax["order_urls"][0]["url"].startswith("https://www.dmit.io/cart/"), "dmit order url")
    check("1 vCPU" in lax["config"] and "Los Angeles" in lax["config"], "dmit config " + lax["config"])

    cn2 = next(plan for plan in bwh["plans"] if plan["key"] == "CN2-GIA")
    check(cn2["price"] == "$49.99/年 / $9.99/月", "alias matched prices " + cn2["price"])
    hosts = [link["label"] for link in cn2["order_urls"]]
    check(hosts == ["bandwagonhost.com", "bwh81.net"], "bwh order labels " + ",".join(hosts))
    check(cn2["limited"] is True and cn2["stock"] == "in_stock", "limited in stock")
    pid_plan = next(plan for plan in bwh["plans"] if plan["key"] == "PID-ONLY")
    check(pid_plan["price"] == "$11/年", "pid matched price")
    check(pid_plan["last_restock"] == "上周见过", "pid matched restock note")
    check(pid_plan["order_urls"] == [], "pid match without order url stays empty")
    unknown = next(plan for plan in bwh["plans"] if plan["key"] == "UNKNOWN-PLAN")
    check(unknown["price"] == "" and unknown["order_urls"] == [], "unmatched plan stays blank")
    check(document["stock"]["source_notes"] == ["vpsrestock 超时一次"], "source note kept")

    by_name = {item["provider"]: item for item in document["black_friday"]["official"]}
    check(by_name["RackNerd"]["status_label"] == "现在能下单", "racknerd orderable")
    check(by_name["Netcup"]["status_label"] == "预告未开卖", "netcup preview")
    check(by_name["OVH"]["status_label"] == "今年不办", "ovh skipped")
    check(by_name["RackNerd"]["plans"][0]["name"] == "1C 1G", "bf plan")
    check(document["black_friday"]["leads"][0]["url"] == "https://example.com/thread", "lead url")
    check("leak@example.com" not in document["black_friday"]["leads"][0]["note"], "lead email removed")
    check("should-not-be-required" not in raw, "unspecified scan list is not copied")

    # Missing nested objects should not crash, and both stock vendors still appear.
    with tempfile.TemporaryDirectory() as tmp:
        folder = Path(tmp)
        (folder / "stock-state.json").write_text("{}", encoding="utf-8")
        (folder / "bf-seen.json").write_text('{"official": [{"provider": "DMIT"}]}', encoding="utf-8")
        (folder / "free-vps-seen.json").write_text('{"items": [{"provider": "No Flag"}]}', encoding="utf-8")
        sparse = build_vps.build_vps(folder)
    check(sparse["free_vps"] == [], "missing genuine is hidden")
    check([item["id"] for item in sparse["stock"]["providers"]] == ["dmit", "bandwagonhost"], "vendors always listed")
    check(sparse["black_friday"]["official"][0]["status_label"] == "预告未开卖", "unknown status defaults to not on sale")
    check(sparse["stock"]["providers"][1]["plans"] == [], "no plans without input")

    if failures:
        print("BUILD VPS FAILED")
        for message in failures:
            print(" - " + message)
        return 1
    print("BUILD VPS OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
