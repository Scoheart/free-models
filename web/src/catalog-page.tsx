import { Tabs } from "radix-ui";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  countOffers, filterGroups, groupBySlug, summaryStatus, type CatalogGroups, type PlatformGroup,
} from "./catalog";
import { CatalogDetail, CatalogTimeline, StatusDot } from "./offer-components";
import { PageFooter, PageHeader, useMobileLayout } from "./shared";
import { kindFor, otherCatalog, parseRouteHash, routeOnPage, sectionUrl, type CatalogPage as Section } from "./routes";
import { redactSecrets } from "./text";

const titles: Record<Section, string> = { provider: "模型", agent: "Agent" };

function writePlatformHash(slug: string, push: boolean) {
  const hash = slug ? "#" + encodeURIComponent(slug) : "";
  if (window.location.hash === hash) return;
  const url = window.location.pathname + window.location.search + hash;
  if (push) window.history.pushState({ slug }, "", url);
  else window.history.replaceState({ slug }, "", url);
}

export function PlatformTabs({ groups, slug, label }: {
  groups: PlatformGroup[];
  slug: string;
  label: string;
}) {
  const list = useRef<HTMLDivElement>(null);
  const [fades, setFades] = useState("");
  const mobile = useMobileLayout();

  function updateFades() {
    const tabs = list.current;
    if (!tabs) return;
    const max = tabs.scrollWidth - tabs.clientWidth;
    const left = max > 8 && tabs.scrollLeft > 6;
    const right = max > 8 && tabs.scrollLeft < max - 6;
    setFades((left ? " can-left" : "") + (right ? " can-right" : ""));
  }

  useLayoutEffect(() => {
    const tabs = list.current;
    if (!tabs) return;
    const layout = () => {
      const current = tabs.querySelector('[aria-selected="true"]');
      if (current) {
        const button = current.getBoundingClientRect();
        const rail = tabs.getBoundingClientRect();
        if (mobile && (button.left < rail.left - 1 || button.right > rail.right + 1)) {
          tabs.scrollLeft += button.left - rail.left - 28;
        } else if (!mobile && button.top < rail.top) {
          tabs.scrollTop -= rail.top - button.top;
        } else if (!mobile && button.bottom > rail.bottom) {
          tabs.scrollTop += button.bottom - rail.bottom;
        }
      }
      updateFades();
    };
    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(tabs);
    return () => observer.disconnect();
  }, [groups, slug, mobile]);

  return (
    <div className={"tab-rail" + fades} id="tab-rail">
      <Tabs.List ref={list} className="tabs" id="tabs" loop={false} aria-label={label} onScroll={updateFades}>
        <Tabs.Trigger className="tab" value="">
          <span className="tab-name">全部平台</span>
        </Tabs.Trigger>
        {groups.map((group) => (
          <Tabs.Trigger className="tab" key={group.slug} value={group.slug} data-slug={group.slug}>
            <span className="tab-name">{redactSecrets(group.name)}</span>
            <span className="tab-meta"><span className="tab-count">{group.offers.length}</span>
              <StatusDot status={summaryStatus(group.offers)} />
            </span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </div>
  );
}

function CatalogEmpty({ query, matchPage, found, clearPlatform }: {
  query: string;
  matchPage: Section;
  found: PlatformGroup[];
  clearPlatform?: () => void;
}) {
  const slug = found.length === 1 ? found[0].slug : "";
  return (
    <div className="empty">
      <p>{clearPlatform ? "此平台没有匹配的活动。" : query.trim()
        ? "没有匹配的平台或活动。换个关键词，或清空搜索。"
        : "暂时没有进行中的免费活动。"}</p>
      {clearPlatform && <button type="button" className="jump-kind" onClick={clearPlatform}>查看全部平台</button>}
      {found.length > 0 && (
        <p className="empty-switch">
          {titles[matchPage]} 里有 {countOffers(found)} 项匹配。
          <a className="jump-kind" href={sectionUrl(matchPage, slug, otherCatalog(matchPage))}>切换到 {titles[matchPage]}</a>
        </p>
      )}
    </div>
  );
}

export function CatalogPage({ page, catalog, now }: { page: Section; catalog: CatalogGroups; now: number }) {
  const base = catalog[kindFor(page)];
  const [selected, setSelected] = useState(
    () => routeOnPage(parseRouteHash(window.location.hash), page, catalog).slug,
  );
  const [query, setQuery] = useState("");
  const mobile = useMobileLayout();
  const groups = useMemo(() => filterGroups(base, query), [base, query]);
  const platform = groupBySlug(base, selected);
  const match = groupBySlug(groups, selected);
  const options = platform && !match ? [{ ...platform, offers: [] }, ...groups] : groups;
  const visible = platform ? (match ? [match] : []) : groups;
  const other = otherCatalog(page);
  const matches = !groups.length && query.trim() ? filterGroups(catalog[kindFor(other)], query) : [];
  const counts = useMemo(() => ({
    provider: countOffers(catalog.providers),
    agent: countOffers(catalog.agents),
  }), [catalog]);
  const stats = query.trim() ? "找到 " + visible.length + " 个平台 · " + countOffers(visible) + " 项"
    : counts[page] + " 项进行中 · " + base.length + " 个平台";

  useEffect(() => {
    const onNavigate = () => {
      const route = routeOnPage(parseRouteHash(window.location.hash), page, catalog);
      if (route.redirect) {
        window.location.replace(sectionUrl(route.redirect, route.slug, page));
        return;
      }
      setSelected(route.slug);
      writePlatformHash(route.slug, false);
    };
    onNavigate();
    window.addEventListener("hashchange", onNavigate);
    window.addEventListener("popstate", onNavigate);
    return () => {
      window.removeEventListener("hashchange", onNavigate);
      window.removeEventListener("popstate", onNavigate);
    };
  }, [catalog, page]);

  function select(next: string) {
    setSelected(next);
    writePlatformHash(next, true);
  }

  return (
    <Tabs.Root className="app" value={selected} onValueChange={select}
      orientation={mobile ? "horizontal" : "vertical"}>
      <div className="chrome">
        <PageHeader page={page} stats={stats} counts={counts} />
        <aside className="sidebar">
          <div className="search-wrap" role="search">
            <label className="sr" htmlFor="q">搜索平台或活动</label>
            <input id="q" type="search" placeholder="搜索平台、模型或条款" autoComplete="off"
              spellCheck={false} value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
          </div>
          <p className="legend" aria-hidden="true"><span className="dot success" />已领取
            <span className="dot needs-user" />待操作<span className="dot failed" />失败</p>
          <label className="sr" htmlFor="platform-select">选择平台</label>
          <select id="platform-select" className="platform-select" value={selected}
            onChange={(event) => select(event.currentTarget.value)}>
            <option value="">全部平台</option>
            {options.map((entry) => {
              const status = summaryStatus(entry.offers);
              const badge = status === "success" ? "● " : status === "needs-user" ? "◐ " : status === "failed" ? "○ " : "";
              return <option key={entry.slug} value={entry.slug}>
                {badge + redactSecrets(entry.name) + "（" + entry.offers.length + "）"}
              </option>;
            })}
          </select>
          <PlatformTabs groups={options} slug={selected} label={titles[page] + " 平台"} />
        </aside>
      </div>
      <div className="layout">
        <Tabs.Content value={selected} key={selected} asChild>
          <main className="detail" aria-label={platform ? redactSecrets(platform.name) : "全部活动"}>
            {match && <CatalogDetail group={match} now={now} />}
            {!platform && groups.length > 0 && <CatalogTimeline groups={groups} now={now} key={query} />}
            {visible.length === 0 && (
              <CatalogEmpty query={query} matchPage={other} found={matches}
                clearPlatform={platform && groups.length > 0 ? () => select("") : undefined} />
            )}
          </main>
        </Tabs.Content>
        <PageFooter page={page} />
      </div>
    </Tabs.Root>
  );
}
