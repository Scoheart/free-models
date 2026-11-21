import type { CatalogGroups, CatalogKind, PlatformGroup } from "./catalog";

export type CatalogPage = "provider" | "agent";
export type Section = CatalogPage | "vps";
export type Page = Section | "home";

export interface RouteHash {
  page: Section | "";
  slug: string;
  legacy: boolean;
}

export function kindFor(page: CatalogPage): CatalogKind {
  return page === "agent" ? "agents" : "providers";
}

export function otherCatalog(page: CatalogPage): CatalogPage {
  return page === "agent" ? "provider" : "agent";
}

export function parseRouteHash(hash: string): RouteHash {
  const text = hash.replace(/^#/, "");
  let raw = text;
  try {
    raw = decodeURIComponent(text);
  } catch {
    // A malformed escape should behave like an unknown platform.
  }
  raw = raw.trim().replace(/^\/+|\/+$/g, "");
  const match = raw.match(/^(providers|agents|provider|agent|vps)(?:\/(.*))?$/);
  if (!match) return { page: "", slug: raw, legacy: false };
  const key = match[1];
  const page = key === "agent" || key === "agents" ? "agent" : key === "vps" ? "vps" : "provider";
  return { page, slug: (match[2] ?? "").replace(/^\/+|\/+$/g, ""), legacy: key === "providers" || key === "agents" };
}

export function sectionUrl(page: Section, slug: string, from: Page): string {
  const prefix = from === "home" ? "" : "../";
  return prefix + page + "/" + (slug ? "#" + encodeURIComponent(slug) : "");
}

function hasPlatform(groups: PlatformGroup[], slug: string): boolean {
  return groups.some((group) => group.slug === slug);
}

export function resolvePageForSlug(slug: string, catalog: CatalogGroups): CatalogPage | "" {
  if (hasPlatform(catalog.providers, slug)) return "provider";
  if (hasPlatform(catalog.agents, slug)) return "agent";
  return "";
}

export function decideRoute(parsed: RouteHash, catalog: CatalogGroups): { page: Section | ""; slug: string } {
  const { page, slug } = parsed;
  if (page === "vps") return { page, slug: "" };
  if (!page) return { page: resolvePageForSlug(slug, catalog), slug };
  const other = otherCatalog(page);
  const belongsHere = hasPlatform(catalog[kindFor(page)], slug);
  if (slug && !belongsHere && hasPlatform(catalog[kindFor(other)], slug)) return { page: other, slug };
  return { page, slug };
}

export function routeOnPage(parsed: RouteHash, page: CatalogPage, catalog: CatalogGroups): { redirect: Section | ""; slug: string } {
  const decided = decideRoute(parsed, catalog);
  if (decided.page === "vps") return { redirect: "vps", slug: "" };
  const local = hasPlatform(catalog[kindFor(page)], parsed.slug);
  const explicitElsewhere = parsed.page && parsed.page !== page;
  const otherHasSlug = explicitElsewhere && hasPlatform(catalog[kindFor(otherCatalog(page))], parsed.slug);
  if (decided.page && decided.page !== page && (!local || otherHasSlug)) {
    return { redirect: decided.page, slug: decided.slug };
  }
  return { redirect: "", slug: local ? parsed.slug : "" };
}
