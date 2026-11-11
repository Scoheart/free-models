#!/usr/bin/env node
"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var root = path.resolve(__dirname, "..");
var appPath = path.join(root, "templates", "app.js");
var sandbox = { console: console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(appPath, "utf8"), sandbox, { filename: appPath });

var FM = sandbox.__FM;
if (!FM) {
  console.error("app.js did not expose __FM");
  process.exit(1);
}

var now = Date.parse("2026-11-10T12:00:00+08:00");
var items = [
  {
    id: "groq-guide",
    platform: "Groq",
    title: "Groq 免费额度 <live>",
    deadline: "2026-11-12T23:59:00+08:00",
    url: "https://console.groq.com/keys",
    summary: "新用户可领免费 token。示例 sk-testkey1234567890 不应出现。",
    free_terms: "每日限额以控制台为准。",
    claim_guide: [
      {
        step: "注册账号",
        detail: "打开控制台并用邮箱注册。不要提交 api_key=sk-abcdefghijklmnopqrstuvwxyz。可以分两句说明。",
        url: "https://console.groq.com",
        note: "需要手机号",
      },
      {
        step: "创建密钥",
        detail: "在 API Keys 页面创建密钥，只显示一次。",
        url: "https://console.groq.com/keys",
      },
    ],
    auto_claim: {
      status: "success",
      note: "已写入账号 token=secret-token-value",
      at: "2026-11-10 09:00",
    },
  },
  {
    id: "cohere-steps",
    title: "Cohere 试用",
    deadline: "2026-12-01T00:00:00+08:00",
    url: "https://dashboard.cohere.com/api-keys",
    summary: "试用额度，按控制台显示。",
    free_terms: "试用条款以官网为准。",
    claim_steps: ["打开控制台", "创建试用 key"],
    auto_claim: { status: "needs_user", note: "需要你登录确认", at: "2026-11-09 18:00" },
  },
  {
    id: "openrouter-string-steps",
    platform: "OpenRouter",
    title: "OpenRouter 免费模型",
    deadline: "2026-11-20T12:00:00+08:00",
    url: "https://openrouter.ai/keys",
    summary: "部分模型免费。",
    free_terms: "受免费档限制。",
    claim_steps: "登录 OpenRouter\n打开 Keys 页面\n创建密钥",
    auto_claim: { status: "failed", note: "自动申请被拒绝 Bearer sk-live-should-not-leak", at: "2026-11-08 10:00" },
  },
  {
    id: "google-unmarked",
    title: "Google AI Studio 免费层",
    deadline: "2026-11-30T00:00:00+08:00",
    url: "https://aistudio.google.com/apikey",
    summary: "有免费层，地区可能不同。",
    free_terms: "地区可能受限；无需信用卡即可创建密钥。",
  },
  {
    id: "vercel-gateway",
    platform: "Vercel AI Gateway",
    title: "Gateway 免费模型",
    deadline: "2026-11-18T00:00:00+08:00",
    url: "https://vercel.com/docs/ai-gateway",
    summary: "网关上的免费模型。",
    free_terms: "以文档为准。",
    claim_steps: ["打开 AI Gateway 文档", "选择免费模型"],
  },
  {
    id: "expired-hidden",
    platform: "Groq",
    title: "已过期的 Groq 活动不应出现",
    expired: true,
    deadline: "2026-12-31T00:00:00+08:00",
    url: "https://console.groq.com/old",
    summary: "这条不该出现。",
    claim_steps: ["不要显示过期条目"],
  },
  {
    id: "past-deadline-hidden",
    platform: "Groq",
    title: "截止日期已过的条目",
    deadline: "2020-01-01T00:00:00+08:00",
    url: "https://console.groq.com/past",
    summary: "过去的截止时间。",
  },
  {
    id: "superseded-hidden",
    platform: "Cohere",
    title: "已被取代的 Cohere 活动",
    deadline: "2026-12-15T00:00:00+08:00",
    superseded_by: "cohere-steps",
    url: "https://dashboard.cohere.com/old",
    summary: "这条也不该出现。",
  },
];

var failures = [];

function check(cond, message) {
  if (!cond) failures.push(message);
}

var groups = FM.buildGroups(items, now);
var names = groups.map(function (g) { return g.name; });
var slugs = groups.map(function (g) { return g.slug; });
check(names.join(" > ") === "Groq > Vercel AI Gateway > OpenRouter > Google AI Studio > Cohere", "platform order " + names.join(" > "));
check(slugs[0] === "groq" && slugs.indexOf("google-ai-studio") !== -1 && slugs.indexOf("vercel-ai-gateway") !== -1, "slugs " + slugs.join(","));

var groq = groups[0];
check(groq.offers.length === 1 && groq.offers[0].id === "groq-guide", "expired groq rows hidden");
check(FM.summaryStatus(groq.offers) === "success", "groq dot success");

var cohere = groups.filter(function (g) { return g.name === "Cohere"; })[0];
var openrouter = groups.filter(function (g) { return g.name === "OpenRouter"; })[0];
var google = groups.filter(function (g) { return g.name === "Google AI Studio"; })[0];
check(cohere && FM.summaryStatus(cohere.offers) === "needs-user", "cohere needs_user");
check(openrouter && FM.summaryStatus(openrouter.offers) === "failed", "openrouter failed");
check(google && FM.summaryStatus(google.offers) === "", "google unmarked");
check(google && google.offers.length === 1, "google derived from hostname");

var tabs = FM.renderTabs(groups, "groq");
check(tabs.indexOf('class="dot success"') !== -1, "green dot");
check(tabs.indexOf('class="dot needs-user"') !== -1, "amber dot");
check(tabs.indexOf('class="dot failed"') !== -1, "red dot");
var googleTab = tabs.split('data-slug="google-ai-studio"')[1] || "";
googleTab = googleTab.split("</button>")[0];
check(googleTab.indexOf('class="dot') === -1, "unmarked platform has no dot");

var html = groups.map(function (g) { return FM.renderDetail(g, now); }).join("\n");
check(html.indexOf("已过期的 Groq 活动不应出现") === -1, "expired title hidden");
check(html.indexOf("截止日期已过的条目") === -1, "past deadline hidden");
check(html.indexOf("已被取代的 Cohere 活动") === -1, "superseded hidden");
check(html.indexOf("不要显示过期条目") === -1, "expired steps hidden");
check(html.indexOf("注册账号") !== -1 && html.indexOf("需要手机号") !== -1, "claim_guide step and note");
check(html.indexOf("guide-note") !== -1 && html.indexOf("注意") !== -1, "warning callout");
check(html.indexOf('href="https://console.groq.com"') !== -1, "guide link");
check(html.indexOf("打开控制台") !== -1 && html.indexOf("创建试用 key") !== -1, "claim_steps array");
check(html.indexOf("登录 OpenRouter") !== -1 && html.indexOf("打开 Keys 页面") !== -1 && html.indexOf("创建密钥") !== -1, "claim_steps string");
check(html.indexOf("已自动领取") !== -1, "success badge");
check(html.indexOf("需要你本人操作") !== -1, "needs_user badge");
check(html.indexOf("自动申请失败") !== -1, "failed badge");
check(html.indexOf("2026-11-10 09:00") !== -1, "auto_claim at");
check(html.indexOf("北京时间") !== -1, "deadline in Beijing time");
check(html.indexOf("去领取") !== -1 && html.indexOf('href="https://console.groq.com/keys"') !== -1, "claim link");
check(html.indexOf("每日限额以控制台为准") !== -1, "free_terms");
check(html.indexOf("新用户可领免费 token") !== -1, "summary");
check(html.indexOf("&lt;live&gt;") !== -1 && html.indexOf("<live>") === -1, "html escaped");
check(html.indexOf("sk-testkey1234567890") === -1, "sk- secret scrubbed");
check(html.indexOf("sk-abcdefghijklmnopqrstuvwxyz") === -1, "api_key secret scrubbed");
check(html.indexOf("secret-token-value") === -1, "token assignment scrubbed");
check(html.indexOf("sk-live-should-not-leak") === -1, "bearer secret scrubbed");
check(html.indexOf("[redacted]") !== -1, "redaction marker present");
check(html.indexOf("地区可能受限") !== -1 && html.indexOf("无需信用卡即可创建密钥") !== -1, "free_terms fallback steps");

var filtered = FM.filterGroups(groups, "试用");
check(filtered.length === 1 && filtered[0].name === "Cohere", "search matches offer text");
var byName = FM.filterGroups(groups, "groq");
check(byName.length === 1 && byName[0].offers.length === 1, "search matches platform");

var realPath = path.join(root, "items.json");
var real = JSON.parse(fs.readFileSync(realPath, "utf8"));
var realGroups = FM.buildGroups(real, Date.now());
var realHtml = realGroups.map(function (g) { return FM.renderDetail(g, Date.now()); }).join("\n");
check(realHtml.indexOf("qoder-deepseek-v41-flash-1017-free-oct24-20261020") === -1, "real superseded id not rendered");
check(realGroups.length > 5 && realHtml.indexOf("去领取") !== -1, "real catalog renders");
check(realHtml.indexOf("<script") === -1, "real render has no script tag");
check(realHtml.indexOf('data-kind="providers"') !== -1 || realHtml.indexOf('data-kind="agents"') !== -1, "offer kind attribute");
check(html.indexOf("领取步骤") !== -1 && html.indexOf('class="steps"') !== -1, "steps disclosure");
check(html.indexOf("简介") !== -1 && html.indexOf('class="fold-text"') !== -1, "foldable summary");

function itemWhere(pred) {
  var i;
  for (i = 0; i < real.length; i++) if (pred(real[i])) return real[i];
  return null;
}
var groqItem = itemWhere(function (it) { return FM.platformOf(it) === "Groq" && !FM.isExpired(it, Date.now()); });
var openrouterItem = itemWhere(function (it) { return FM.platformOf(it) === "OpenRouter" && FM.categoryOf(it) === "providers"; });
var vercelItem = itemWhere(function (it) { return FM.platformOf(it) === "Vercel AI Gateway"; });
var opencodeItem = itemWhere(function (it) { return FM.platformOf(it) === "OpenCode"; });
var kiroItem = itemWhere(function (it) { return FM.platformOf(it) === "AWS Kiro"; });
var traycerItem = itemWhere(function (it) { return FM.platformOf(it) === "Traycer"; });
var devinItem = itemWhere(function (it) { return /Devin/.test(FM.platformOf(it)); });
var cursorItem = itemWhere(function (it) { return /^Cursor/.test(it.title || ""); });
var minimaxCodeItem = itemWhere(function (it) { return /MiniMax Code/.test(it.title || ""); });
var claudeApiItem = itemWhere(function (it) { return FM.platformOf(it) === "Anthropic" && /API 额度/.test(it.title || ""); });
check(groqItem && FM.categoryOf(groqItem) === "providers", "groq is a provider");
check(openrouterItem && FM.categoryOf(openrouterItem) === "providers", "openrouter is a provider");
check(vercelItem && FM.categoryOf(vercelItem) === "providers", "vercel gateway is a provider");
check(opencodeItem && FM.categoryOf(opencodeItem) === "agents", "opencode is an agent");
check(kiroItem && FM.categoryOf(kiroItem) === "agents", "kiro is an agent");
check(traycerItem && FM.categoryOf(traycerItem) === "agents", "traycer is an agent");
check(devinItem && FM.categoryOf(devinItem) === "agents", "devin is an agent");
check(cursorItem && FM.categoryOf(cursorItem) === "agents", "cursor title is an agent");
check(minimaxCodeItem && FM.categoryOf(minimaxCodeItem) === "agents", "minimax code is an agent");
check(claudeApiItem && FM.categoryOf(claudeApiItem) === "providers", "anthropic api credits stay providers");
check(FM.categoryOf({ title: "Anything", platform: "Cursor", category: "providers" }) === "providers", "explicit category wins");
check(FM.categoryOf({ title: "Brand new gateway", platform: "ZyxwGateway" }) === "providers", "unknown gateway falls back to providers");
check(FM.categoryOf({ title: "Foo IDE 免费", platform: "Foo IDE" }) === "agents", "ide pattern is an agent");
check(FM.categoryOf(items[0]) === "providers", "sample groq row is a provider");

var realNow = Date.now();
var realBuilt = FM.buildGroups(real, realNow);
var agentNames = FM.groupsInKind(realBuilt, "agents").map(function (g) { return g.name; });
var providerNames = FM.groupsInKind(realBuilt, "providers").map(function (g) { return g.name; });
check(agentNames.indexOf("OpenCode") !== -1 && agentNames.indexOf("Groq") === -1, "agent platforms " + agentNames.slice(0, 6).join(","));
check(providerNames.indexOf("OpenRouter") !== -1 && providerNames.indexOf("OpenCode") === -1, "provider platforms");
var agentSearch = FM.filterGroups(FM.groupsInKind(realBuilt, "agents"), "opencode");
check(agentSearch.length >= 1 && agentSearch[0].name === "OpenCode", "search stays inside agents");
var kindCounts = { providers: 0, agents: 0 };
real.forEach(function (it) {
  if (FM.isExpired(it, realNow) || FM.isSuperseded(it)) return;
  kindCounts[FM.categoryOf(it)] += 1;
});
check(kindCounts.providers > 50 && kindCounts.agents > 10, "both kinds have offers " + JSON.stringify(kindCounts));

if (failures.length) {
  console.error("SAMPLE RENDER FAILED");
  failures.forEach(function (msg) { console.error(" - " + msg); });
  process.exit(1);
}

console.log("SAMPLE RENDER OK");
console.log("platforms: " + names.join(" > "));
console.log("real platforms: " + realGroups.length + " offers shown: " + realGroups.reduce(function (n, g) { return n + g.offers.length; }, 0));
console.log("--- groq detail excerpt ---");
var excerpt = FM.renderDetail(groq, now).replace(/\s+/g, " ").slice(0, 500);
console.log(excerpt);
