import { AGENT_VENUES, FORCE_PROVIDER, HOST_LABELS, SOURCE_HOSTS } from "./platforms";
import { asList, clipText, hostnameOf, normalize, redactSecrets } from "./text";

export type CatalogKind = "providers" | "agents";
export type ClaimStatus = "" | "success" | "failed" | "needs-user";

interface OfferLink {
  name?: string;
  action_url?: string;
  url?: string;
}

export interface GuideStep {
  step: string;
  detail: string;
  url: string;
  note: string;
}

type GuideInput = string | Partial<GuideStep> | null;

export interface Offer {
  id?: string;
  title?: string;
  name?: string;
  model?: string | null;
  product?: string;
  platform?: string;
  category?: string | null;
  kind?: string;
  summary?: string;
  free_terms?: string;
  desc?: string;
  description?: string;
  deadline?: string | null;
  expires_at?: string;
  expire_at?: string;
  expires?: string;
  expired?: boolean;
  is_expired?: boolean;
  superseded?: boolean;
  is_superseded?: boolean;
  superseded_by?: string | boolean | null;
  supersededBy?: string | boolean | null;
  url?: string;
  link?: string;
  source_url?: string;
  official_url?: string;
  terms_url?: string;
  docs_url?: string;
  providers?: (OfferLink | null)[];
  agents?: (OfferLink | null)[];
  models?: (OfferLink | null)[];
  claim_guide?: GuideInput[];
  claim_steps?: GuideInput[] | string;
  auto_claim?: { status?: string; note?: string; at?: string } | null;
}

export interface PlatformGroup {
  name: string;
  slug: string;
  offers: Offer[];
  nearest: number;
}

export type CatalogGroups = Record<CatalogKind, PlatformGroup[]>;

const compareNames = (first: string, second: string) =>
  first.localeCompare(second, "zh-CN", { sensitivity: "base", numeric: true });

const specialNames: Record<string, string> = {
  ai: "AI", api: "API", llm: "LLM", openai: "OpenAI", openrouter: "OpenRouter",
  huggingface: "Hugging Face", deepseek: "DeepSeek", chatgpt: "ChatGPT",
  github: "GitHub", nvidia: "NVIDIA", aws: "AWS",
};

export function titleOf(item: Offer): string {
  return String(item.title || item.name || item.model || "未命名");
}

export function itemUrl(item: Offer): string {
  return String(item.url || item.link || item.source_url || "");
}

export function deadlineOf(item: Offer): string {
  return item.deadline || item.expires_at || item.expire_at || item.expires || "";
}

function deadlineMs(item: Offer): number {
  const time = Date.parse(deadlineOf(item));
  return Number.isNaN(time) ? Infinity : time;
}

export function isExpired(item: Offer, now: number): boolean {
  return item.expired === true || item.is_expired === true || deadlineMs(item) < now;
}

export function isSuperseded(item: Offer): boolean {
  if (item.superseded === true || item.is_superseded === true) return true;
  const replacedBy = item.superseded_by ?? item.supersededBy;
  return replacedBy != null && replacedBy !== false && String(replacedBy).trim() !== "";
}

export function autoClaimView(item: Offer): { kind: Exclude<ClaimStatus, "">; label: string; note: string; at: string } | null {
  const claim = item.auto_claim;
  if (!claim || typeof claim !== "object" || Array.isArray(claim)) return null;
  const status = normalize(claim.status);
  const note = clipText(redactSecrets(claim.note), 240);
  const at = clipText(redactSecrets(claim.at), 48);
  if (status === "success") return { kind: "success", label: "已自动领取", note, at };
  if (status === "failed") return { kind: "failed", label: "自动申请失败", note, at };
  if (status === "needs_user") return { kind: "needs-user", label: "需要你本人操作", note, at };
  return null;
}

export function summaryStatus(offers: readonly Offer[]): ClaimStatus {
  let status: ClaimStatus = "";
  for (const offer of offers) {
    const kind = autoClaimView(offer)?.kind;
    if (kind === "success") return kind;
    if (kind === "needs-user" || (!status && kind === "failed")) status = kind;
  }
  return status;
}

export const statusLabels: Record<ClaimStatus, string> = {
  "": "", success: "有已自动领取", "needs-user": "有需要本人操作", failed: "有自动申请失败",
};

function prettifyToken(token: string): string {
  if (Object.hasOwn(specialNames, token)) return specialNames[token];
  return token.split(/[-_]+/).filter(Boolean).map((word) => {
    if (Object.hasOwn(specialNames, word)) return specialNames[word];
    return word.length <= 2 ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1);
  }).join(" ");
}

function platformFromUrl(url: string): string {
  const host = hostnameOf(url);
  if (!host) return "";
  if (host === "vercel.com" && /ai-gateway/i.test(url)) return "Vercel AI Gateway";
  const parts = host.split(".");
  for (let index = 0; index < parts.length; index++) {
    const candidate = parts.slice(index).join(".");
    if (Object.hasOwn(HOST_LABELS, candidate)) return HOST_LABELS[candidate];
  }
  const suffix = parts.at(-1);
  let domain = parts.at(-2) ?? parts[0];
  if (/^(co|com|org|net|gov|ac)$/.test(domain) && parts.length >= 3) domain = parts[parts.length - 3];
  if (suffix && Object.hasOwn(HOST_LABELS, domain + "." + suffix)) return HOST_LABELS[domain + "." + suffix];
  return Object.hasOwn(HOST_LABELS, domain) ? HOST_LABELS[domain] : prettifyToken(domain);
}

function linkUrls(list: readonly (OfferLink | null)[] | undefined): string[] {
  return asList(list).flatMap((entry) => {
    const href = entry?.action_url || entry?.url;
    return href ? [String(href)] : [];
  });
}

export function platformOf(item: Offer): string {
  const name = String(item.platform ?? "").replace(/\s+/g, " ").trim();
  if (name) return name;

  const urls = [
    ...linkUrls(item.providers), item.official_url, item.terms_url,
    ...linkUrls(item.models), ...linkUrls(item.agents), item.docs_url, itemUrl(item),
  ];
  let fallback = "";
  for (const url of urls) {
    if (!url) continue;
    const label = platformFromUrl(url);
    if (!label) continue;
    fallback ||= label;
    if (!Object.hasOwn(SOURCE_HOSTS, hostnameOf(url))) return label;
  }
  return fallback || "其他";
}

const providerVenue = /\b(api|apis|gateway|router|inference|studio|cloud|nim|endpoint|endpoints)\b|开放平台|网关|路由/;
const agentVenue = /(?:^| )(code|coder|cli|ide|desktop|agent)$|代码编辑器|编程 agent|编码 agent|coding agent|\bide\b|\bcli\b|\bdesktop\b/;

function normalizeVenue(name: unknown): string {
  return normalize(name)
    .replace(/[（(][^）)]*[）)]/g, " ")
    .replace(/\b\d+(?:\.\d+)+\b/g, " ")
    .replace(/[/|、+]+/g, " ")
    .replace(/\s+/g, " ").trim();
}

function nameLooksLikeAgent(name: unknown): boolean {
  const venue = normalizeVenue(name);
  if (!venue || Object.hasOwn(FORCE_PROVIDER, venue)) return false;
  if (Object.hasOwn(AGENT_VENUES, venue)) return true;
  if (providerVenue.test(venue)) return false;
  const words = venue.split(" ");
  return Object.hasOwn(AGENT_VENUES, words[0]) || agentVenue.test(venue) ||
    /^[a-z0-9][a-z0-9-]{1,22}code$/.test(words.at(-1) ?? "");
}

function leadIsCodingTool(lead: string): boolean {
  const name = normalizeVenue(lead);
  if (name.startsWith("claude code")) return true;
  return name.split(" ")[0] !== "claude" && nameLooksLikeAgent(name);
}

export function categoryOf(item: Offer): CatalogKind {
  const explicit = normalize(item.category ?? item.kind);
  if (explicit === "agent" || explicit === "agents") return "agents";
  if (explicit === "provider" || explicit === "providers") return "providers";

  const platform = platformOf(item);
  if (Object.hasOwn(FORCE_PROVIDER, normalizeVenue(platform))) return "providers";
  const platformAgent = nameLooksLikeAgent(platform);
  const title = String(item.title ?? "");
  const lead = title.trim().match(/^([^:：]{1,48})[:：]/)?.[1] ?? "";
  const product = String(item.product ?? "");
  const text = normalize(title + " " + product);
  const apiCredit = /api\s*额度|api credits|每月 api|api key/.test(text);
  if (apiCredit && !platformAgent && !leadIsCodingTool(lead) && !text.includes("code review")) return "providers";
  if (platformAgent || nameLooksLikeAgent(lead) || nameLooksLikeAgent(product.split(/\s*[·•]\s*/)[0])) return "agents";

  const inAppAgent = asList(item.agents).length && !asList(item.providers).length &&
    /代码编辑器|编程\s*agent|编码\s*agent|coding agent|终端编程|桌面编程|\bcli\b|\bide\b/.test(normalize(text + " " + platform));
  return inAppAgent ? "agents" : "providers";
}

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u3400-\u9fff-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "platform";
}

export function goUrl(item: Offer): string {
  const direct = itemUrl(item);
  const host = hostnameOf(direct);
  if (host && !Object.hasOwn(SOURCE_HOSTS, host)) return direct;
  for (const list of [item.providers, item.agents, item.models]) {
    const href = linkUrls(list)[0];
    if (href) return href;
  }
  return direct;
}

function guideFromValue(entry: GuideInput): GuideStep | null {
  if (entry == null) return null;
  if (typeof entry === "string") {
    const detail = redactSecrets(entry).replace(/\s+/g, " ").trim();
    return detail ? { step: "", detail, url: "", note: "" } : null;
  }
  if (typeof entry !== "object" || Array.isArray(entry)) return null;
  const step = redactSecrets(entry.step).replace(/\s+/g, " ").trim();
  const detail = redactSecrets(entry.detail).trim();
  const note = redactSecrets(entry.note).replace(/\s+/g, " ").trim();
  const url = redactSecrets(entry.url).trim();
  return step || detail || note || url ? { step, detail, url, note } : null;
}

export function claimGuideOf(item: Offer): GuideStep[] {
  const guide = asList(item.claim_guide).map(guideFromValue).filter((step) => step !== null);
  if (guide.length) return guide;

  const raw = item.claim_steps;
  if (typeof raw !== "string") return asList(raw).map(guideFromValue).filter((step) => step !== null);
  if (!raw.trim()) return [];
  const lines = raw.trim().split(/\r?\n+/);
  const parts = lines.length === 1 ? raw.split(/[；;]+/) : lines;
  return parts.map((part) => part.replace(/\s+/g, " ").trim()
    .replace(/^如何领取[:：]\s*/, "").replace(/^\d+\s*[.、)]\s*/, ""))
    .filter(Boolean).map((detail) => ({ step: "", detail: redactSecrets(detail), url: "", note: "" }));
}

function haystack(item: Offer): string {
  const steps = claimGuideOf(item).flatMap(({ step, detail, note }) => [step, detail, note]);
  const names = [item.providers, item.agents, item.models].flatMap((list) =>
    asList(list).map((entry) => entry?.name));
  const fields = [titleOf(item), item.model, item.product, item.summary, item.free_terms,
    item.desc, item.description, item.platform, ...steps, ...names];
  return normalize(redactSecrets(fields.filter(Boolean).join("\n")));
}

function compareGroups(a: PlatformGroup, b: PlatformGroup): number {
  return a.nearest === b.nearest ? compareNames(a.name, b.name) : a.nearest - b.nearest;
}

export function buildGroups(items: readonly Offer[], now: number): PlatformGroup[] {
  const grouped = new Map<string, PlatformGroup>();
  for (const item of asList(items)) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    if (isExpired(item, now) || isSuperseded(item)) continue;
    const name = platformOf(item);
    let group = grouped.get(name);
    if (!group) {
      group = { name, slug: "", offers: [], nearest: Infinity };
      grouped.set(name, group);
    }
    group.offers.push(item);
    group.nearest = Math.min(group.nearest, deadlineMs(item));
  }

  const used = new Set<string>();
  const groups = [...grouped.values()].sort(compareGroups);
  for (const group of groups) {
    group.offers.sort((a, b) => {
      const first = deadlineMs(a);
      const second = deadlineMs(b);
      return first === second ? compareNames(titleOf(a), titleOf(b)) : first - second;
    });
    const base = slugify(group.name);
    let slug = base;
    for (let i = 2; used.has(slug); i++) slug = base + "-" + i;
    group.slug = slug;
    used.add(slug);
  }
  return groups;
}

export function groupsInKind(groups: readonly PlatformGroup[], kind: CatalogKind): PlatformGroup[] {
  return groups.flatMap((group) => {
    const offers = group.offers.filter((offer) => categoryOf(offer) === kind);
    return offers.length ? [{ ...group, offers, nearest: deadlineMs(offers[0]) }] : [];
  }).sort(compareGroups);
}

export function buildCatalog(items: readonly Offer[], now: number): CatalogGroups {
  const groups = buildGroups(items, now);
  return { providers: groupsInKind(groups, "providers"), agents: groupsInKind(groups, "agents") };
}

export function filterGroups(groups: PlatformGroup[], query: string): PlatformGroup[] {
  const search = normalize(query);
  if (!search) return groups;
  return groups.flatMap((group) => {
    if (normalize(group.name).includes(search)) return [group];
    const offers = group.offers.filter((offer) => haystack(offer).includes(search));
    return offers.length ? [{ ...group, offers }] : [];
  });
}

export function groupBySlug(groups: readonly PlatformGroup[], slug: string) {
  return groups.find((group) => group.slug === slug);
}

export function countOffers(groups: readonly PlatformGroup[]): number {
  return groups.reduce((sum, group) => sum + group.offers.length, 0);
}

const deadlineDate = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai", year: "numeric", month: "long", day: "numeric",
});
const deadlineTime = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

export function fmtDeadlineBJ(iso: string): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return "";
  return deadlineDate.format(time) + " " + deadlineTime.format(time) + "（北京时间）";
}
