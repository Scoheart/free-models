import { readFileSync } from "node:fs";
import { Tabs } from "radix-ui";
import { renderToStaticMarkup } from "react-dom/server";
import {
  buildGroups, categoryOf, filterGroups, groupsInKind, isExpired, isSuperseded, platformOf,
  offersByDeadline, summaryStatus, type Offer, type PlatformGroup,
} from "../web/src/catalog";
import { PlatformTabs } from "../web/src/catalog-page";
import { CatalogDetail } from "../web/src/offer-components";
import { decideRoute, parseRouteHash, resolvePageForSlug, routeOnPage, sectionUrl } from "../web/src/routes";
import { updatedLine, VpsContent, type VpsData } from "../web/src/vps-page";

function renderDetail(group: PlatformGroup, now: number): string {
  return renderToStaticMarkup(<CatalogDetail group={group} now={now} />);
}

function renderTabs(groups: PlatformGroup[], slug: string): string {
  return renderToStaticMarkup(
    <Tabs.Root value={slug}><PlatformTabs groups={groups} slug={slug} label="平台" /></Tabs.Root>,
  );
}

function renderVps(data: VpsData): string {
  return renderToStaticMarkup(<VpsContent data={data} />);
}

const now = Date.parse("2026-11-10T12:00:00+08:00");
const items: Offer[] = [
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

const failures: string[] = [];

function check(cond: unknown, message: string) {
  if (!cond) failures.push(message);
}

const timelineGroups = buildGroups([
  { id: "alpha-first", platform: "Alpha", deadline: "2026-11-11T10:00:00+08:00" },
  { id: "alpha-later", platform: "Alpha", deadline: "2026-11-14T10:00:00+08:00" },
  { id: "beta-middle", platform: "Beta", expires_at: "2026-11-12T10:00:00+08:00" },
  { id: "no-deadline", platform: "Beta" },
  { id: "expired", platform: "Alpha", deadline: "2026-11-09T10:00:00+08:00" },
], now);
const timeline = offersByDeadline(timelineGroups);
check(timeline.map(({ offer }) => offer.id).join(",") === "alpha-first,beta-middle,alpha-later,no-deadline",
  "timeline orders active offers across platforms and puts missing deadlines last");
check(timeline[1].platform === "Beta", "timeline keeps each offer's platform");

const groups = buildGroups(items, now);
const names = groups.map(function (g) { return g.name; });
const slugs = groups.map(function (g) { return g.slug; });
check(names.join(" > ") === "Groq > Vercel AI Gateway > OpenRouter > Google AI Studio > Cohere", "platform order " + names.join(" > "));
check(slugs[0] === "groq" && slugs.indexOf("google-ai-studio") !== -1 && slugs.indexOf("vercel-ai-gateway") !== -1, "slugs " + slugs.join(","));

const groq = groups[0];
check(groq.offers.length === 1 && groq.offers[0].id === "groq-guide", "expired groq rows hidden");
check(summaryStatus(groq.offers) === "success", "groq dot success");

const cohere = groups.filter(function (g) { return g.name === "Cohere"; })[0];
const openrouter = groups.filter(function (g) { return g.name === "OpenRouter"; })[0];
const google = groups.filter(function (g) { return g.name === "Google AI Studio"; })[0];
check(cohere && summaryStatus(cohere.offers) === "needs-user", "cohere needs_user");
check(openrouter && summaryStatus(openrouter.offers) === "failed", "openrouter failed");
check(google && summaryStatus(google.offers) === "", "google unmarked");
check(google && google.offers.length === 1, "google derived from hostname");

const allTabs = renderTabs(groups, "");
check(allTabs.includes("全部平台") && allTabs.indexOf("全部平台") < allTabs.indexOf("Groq"), "all-platform tab is first");
const tabs = renderTabs(groups, "groq");
check(tabs.indexOf('class="dot success"') !== -1, "green dot");
check(tabs.indexOf('class="dot needs-user"') !== -1, "amber dot");
check(tabs.indexOf('class="dot failed"') !== -1, "red dot");
const googleTab = (tabs.split('data-slug="google-ai-studio"')[1] ?? "").split("</button>")[0];
check(googleTab.indexOf('class="dot') === -1, "unmarked platform has no dot");

const html = groups.map(function (g) { return renderDetail(g, now); }).join("\n");
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
check(html.indexOf("地区可能受限") !== -1 && html.indexOf("无需信用卡即可创建密钥") !== -1, "leftover free_terms appear in 详情介绍");

const filtered = filterGroups(groups, "试用");
check(filtered.length === 1 && filtered[0].name === "Cohere", "search matches offer text");
const byName = filterGroups(groups, "groq");
check(byName.length === 1 && byName[0].offers.length === 1, "search matches platform");

const realPath = new URL("../items.json", import.meta.url);
const real: Offer[] = JSON.parse(readFileSync(realPath, "utf8"));
const realGroups = buildGroups(real, Date.now());
const realHtml = realGroups.map(function (g) { return renderDetail(g, Date.now()); }).join("\n");
check(realHtml.indexOf("qoder-deepseek-v41-flash-1017-free-oct24-20261020") === -1, "real superseded id not rendered");
check(realGroups.length > 5 && realHtml.indexOf("去领取") !== -1, "real catalog renders");
check(realHtml.indexOf("<script") === -1, "real render has no script tag");
check(realHtml.indexOf('data-kind="providers"') !== -1 || realHtml.indexOf('data-kind="agents"') !== -1, "offer kind attribute");
check(html.indexOf("领取步骤") !== -1 && html.indexOf('class="steps"') !== -1, "steps disclosure");
check(html.indexOf("详情介绍") !== -1 && html.indexOf('class="fold-text"') !== -1, "foldable 详情介绍");
check(html.indexOf("免费条款") === -1, "no 免费条款 label");
check(html.indexOf("简介") === -1, "简介 renamed");

function itemWhere(pred: (offer: Offer) => boolean) {
  return real.find(pred);
}
const groqItem = itemWhere(function (it) { return platformOf(it) === "Groq" && !isExpired(it, Date.now()); });
const openrouterItem = itemWhere(function (it) { return platformOf(it) === "OpenRouter" && categoryOf(it) === "providers"; });
const vercelItem = itemWhere(function (it) { return platformOf(it) === "Vercel AI Gateway"; });
const opencodeItem = itemWhere(function (it) { return platformOf(it) === "OpenCode"; });
const kiroItem = itemWhere(function (it) { return platformOf(it) === "AWS Kiro"; });
const traycerItem = itemWhere(function (it) { return platformOf(it) === "Traycer"; });
const devinItem = itemWhere(function (it) { return /Devin/.test(platformOf(it)); });
const cursorItem = itemWhere(function (it) { return /^Cursor/.test(it.title || ""); });
const minimaxCodeItem = itemWhere(function (it) { return /MiniMax Code/.test(it.title || ""); });
const claudeApiItem = itemWhere(function (it) { return platformOf(it) === "Anthropic" && /API 额度/.test(it.title || ""); });
check(groqItem && categoryOf(groqItem) === "providers", "groq is a provider");
check(openrouterItem && categoryOf(openrouterItem) === "providers", "openrouter is a provider");
check(vercelItem && categoryOf(vercelItem) === "providers", "vercel gateway is a provider");
check(opencodeItem && categoryOf(opencodeItem) === "agents", "opencode is an agent");
check(kiroItem && categoryOf(kiroItem) === "agents", "kiro is an agent");
check(traycerItem && categoryOf(traycerItem) === "agents", "traycer is an agent");
check(devinItem && categoryOf(devinItem) === "agents", "devin is an agent");
check(cursorItem && categoryOf(cursorItem) === "agents", "cursor title is an agent");
check(minimaxCodeItem && categoryOf(minimaxCodeItem) === "agents", "minimax code is an agent");
check(claudeApiItem && categoryOf(claudeApiItem) === "providers", "anthropic api credits stay providers");
check(categoryOf({ title: "Anything", platform: "Cursor", category: "providers" }) === "providers", "explicit category wins");
check(categoryOf({ title: "Brand new gateway", platform: "ZyxwGateway" }) === "providers", "unknown gateway falls back to providers");
check(categoryOf({ title: "Foo IDE 免费", platform: "Foo IDE" }) === "agents", "ide pattern is an agent");
check(categoryOf(items[0]) === "providers", "sample groq row is a provider");

const realNow = Date.now();
const realBuilt = buildGroups(real, realNow);
const agentNames = groupsInKind(realBuilt, "agents").map(function (g) { return g.name; });
const providerNames = groupsInKind(realBuilt, "providers").map(function (g) { return g.name; });
check(agentNames.indexOf("OpenCode") !== -1 && agentNames.indexOf("Groq") === -1, "agent platforms " + agentNames.slice(0, 6).join(","));
check(providerNames.indexOf("OpenRouter") !== -1 && providerNames.indexOf("Groq") !== -1, "provider platforms");
const agentSearch = filterGroups(groupsInKind(realBuilt, "agents"), "opencode");
check(agentSearch.length >= 1 && agentSearch[0].name === "OpenCode", "search stays inside agents");
const kindCounts = { providers: 0, agents: 0 };
real.forEach(function (it) {
  if (isExpired(it, realNow) || isSuperseded(it)) return;
  kindCounts[categoryOf(it)] += 1;
});
check(kindCounts.providers > 50 && kindCounts.agents > 10, "both kinds have offers " + JSON.stringify(kindCounts));

check(parseRouteHash("providers/groq").page === "provider" && parseRouteHash("providers/groq").slug === "groq" && parseRouteHash("providers/groq").legacy === true, "legacy providers hash");
check(parseRouteHash("agents/opencode").page === "agent" && parseRouteHash("agents/opencode").slug === "opencode", "legacy agents hash");
check(parseRouteHash("groq").page === "" && parseRouteHash("groq").slug === "groq", "bare platform hash");
check(parseRouteHash("").slug === "" && parseRouteHash("providers").page === "provider" && parseRouteHash("agents").page === "agent", "category-only hashes");
const routeItems = items.concat([
  { id: "oc", platform: "OpenCode", title: "OpenCode 免费额度", deadline: "2026-12-01T00:00:00+08:00", url: "https://opencode.ai" },
]);
const routeGroups = buildGroups(routeItems, now);
const routeKinds = {
  providers: groupsInKind(routeGroups, "providers"),
  agents: groupsInKind(routeGroups, "agents"),
};
check(routeOnPage(parseRouteHash(""), "provider", routeKinds).slug === "", "empty hash keeps all platforms");
check(routeOnPage(parseRouteHash("groq"), "provider", routeKinds).slug === "groq", "explicit hash selects a platform");
check(resolvePageForSlug("groq", routeKinds) === "provider", "groq resolves to provider");
check(resolvePageForSlug("opencode", routeKinds) === "agent", "opencode resolves to agent");
check(decideRoute(parseRouteHash("providers/groq"), routeKinds).page === "provider", "decide legacy groq");
check(decideRoute(parseRouteHash("agents/opencode"), routeKinds).page === "agent", "decide legacy opencode");
check(decideRoute(parseRouteHash("groq"), routeKinds).page === "provider", "bare groq");
check(decideRoute(parseRouteHash("opencode"), routeKinds).page === "agent", "bare opencode");
check(decideRoute(parseRouteHash("agents/groq"), routeKinds).page === "provider", "wrong section still follows the platform");
const bothKinds = {
  providers: routeKinds.providers.concat([{ name: "OpenCode", slug: "opencode", offers: [{}], nearest: Infinity }]),
  agents: routeKinds.agents,
};
check(decideRoute(parseRouteHash("agents/opencode"), bothKinds).page === "agent", "explicit agents hash stays when the platform exists there too");
check(decideRoute(parseRouteHash("opencode"), bothKinds).page === "provider", "bare slug prefers provider when both sections have it");
check(routeOnPage(parseRouteHash("opencode"), "agent", bothKinds).redirect === "" && routeOnPage(parseRouteHash("opencode"), "agent", bothKinds).slug === "opencode", "agent page keeps its own opencode");
check(routeOnPage(parseRouteHash("agents/opencode"), "provider", bothKinds).redirect === "agent", "explicit agents hash leaves the provider page");
check(routeOnPage(parseRouteHash("groq"), "agent", routeKinds).redirect === "provider", "agent page sends a provider-only slug away");
check(sectionUrl("provider", "groq", "home") === "provider/#groq", "home provider url");
check(sectionUrl("agent", "opencode", "provider") === "../agent/#opencode", "provider to agent url");
check(sectionUrl("vps", "", "agent") === "../vps/", "agent to vps url");

const deployedVps: VpsData = JSON.parse(readFileSync(new URL("../vps.json", import.meta.url), "utf8"));
check(renderVps(deployedVps).includes("补货监控"), "repository VPS feed renders");
const vps: VpsData = {
  sample: true,
  updated_at_beijing: "2026-11-15 09:30",
  free_vps: [
    { id: "always", provider: "Always", type: "always_free", free_conditions: { card_required: false }, posts: [{ url: "https://x.com/fixture/status/1" }] },
    { id: "trial", provider: "Trial", type: "trial", free_conditions: { card_required: true } },
    { id: "student", provider: "Student", type: "student" },
    { id: "paas", provider: "PaaS", type: "paas" },
  ],
  stock: {
    providers: [
      { name: "DMIT", sources: [{ url: "https://t.me/dmitnews" }], plans: [{ key: "missing", stock: "out_of_stock" }] },
      {
        name: "搬瓦工",
        sources: [{ url: "https://stock.bwg.la" }],
        plans: [{
          key: "found", stock: "in_stock", price: "10 USD",
          order_urls: [{ url: "https://bandwagonhost.com" }, { url: "https://bwh81.net" }],
        }],
      },
    ],
  },
  black_friday: {
    official: [
      { provider: "Ordering", orderable_now: true },
      { provider: "Announced" },
      { provider: "Off", status: "not_this_year" },
    ],
    leads: [{ source: "Monitor", note: "Check vendor." }],
  },
};
const vpsHtml = renderVps(vps);
check(vpsHtml.indexOf("示例数据，等待首次同步") !== -1, "sample banner");
check(vpsHtml.indexOf("一直免费") !== -1 && vpsHtml.indexOf("试用额度") !== -1, "free type labels");
check(vpsHtml.indexOf("学生额度") !== -1 && vpsHtml.indexOf("非 root 的 PaaS") !== -1, "student and paas labels");
check(vpsHtml.indexOf("据 X 上的帖子") !== -1, "x post attribution");
check(vpsHtml.indexOf("要绑卡") !== -1 && vpsHtml.indexOf("不绑卡") !== -1, "card conditions");
check(vpsHtml.indexOf("有货") !== -1 && vpsHtml.indexOf("缺货") !== -1, "stock pills");
check(vpsHtml.indexOf("bandwagonhost.com") !== -1 && vpsHtml.indexOf("bwh81.net") !== -1, "bandwagon order links");
check(vpsHtml.indexOf("目录里没有对应的价格和下单链接") !== -1, "unmatched plan stays blank");
check(vpsHtml.indexOf("现在能下单") !== -1 && vpsHtml.indexOf("预告未开卖") !== -1 && vpsHtml.indexOf("今年不办") !== -1, "black friday statuses");
check(vpsHtml.indexOf("仅线索，未经官方确认") !== -1, "third-party disclaimer");
check(vpsHtml.indexOf("t.me/dmitnews") !== -1 && vpsHtml.indexOf("stock.bwg.la") !== -1, "stock sources");
check(vpsHtml.indexOf("<script") === -1, "vps html has no script");
check(updatedLine(vps).indexOf("2026-11-15 09:30") !== -1 && updatedLine(vps).indexOf("北京时间") !== -1, "updated line");
const evil = renderVps({
  sample: false,
  free_vps: [{
    provider: "<b>x</b>",
    type_label: "一直免费",
    notes: "mail evil@example.com sk-abcdefghijklmnopqrstuvwxyz",
    official_url: "javascript:alert(1)",
    posts: [{ url: "https://x.com/a/status/1" }],
  }],
});
check(evil.indexOf("示例数据，等待首次同步") === -1, "non-sample has no banner");
check(evil.indexOf("<b>") === -1 && evil.indexOf("&lt;b&gt;") !== -1, "vps escapes html");
check(evil.indexOf("evil@example.com") === -1 && evil.indexOf("sk-abcdefghijklmnopqrstuvwxyz") === -1, "vps scrubs email and key");
check(evil.indexOf("javascript:") === -1, "vps drops javascript url");

if (failures.length) {
  console.error("SAMPLE RENDER FAILED");
  failures.forEach(function (msg) { console.error(" - " + msg); });
  process.exit(1);
}

console.log("SAMPLE RENDER OK");
console.log("platforms: " + names.join(" > "));
console.log("real platforms: " + realGroups.length + " offers shown: " + realGroups.reduce(function (n, g) { return n + g.offers.length; }, 0));
