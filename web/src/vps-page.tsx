import { Fragment, useEffect, type ReactNode } from "react";
import { ExternalLink, PageFooter, PageHeader } from "./shared";
import { parseRouteHash, sectionUrl } from "./routes";
import { asList, beijingTime, hostnameOf, linkLabel, normalize, safeUrl, textOf } from "./text";

interface Link {
  url?: string;
  label?: string;
}
interface Spec {
  label?: string;
  value?: string;
}
interface Conditions {
  card_required?: boolean | null;
  card_notes?: string;
  region_limits?: string;
  idle_reclaim?: string;
  deadline?: string;
  deadline_note?: string;
}
interface Post extends Link {
  time_beijing?: string;
  author?: string;
}
interface FreeOffer {
  id?: string;
  provider?: string;
  type?: string;
  type_label?: string;
  official_url?: string;
  specs?: (Spec | null)[];
  free_conditions?: Conditions | null;
  posts?: (Post | null)[];
  notes?: string;
}
interface StockPlan {
  key?: string;
  display_name?: string;
  stock?: string;
  limited?: boolean;
  config?: string;
  specs?: (Spec | null)[];
  price?: string;
  last_restock?: string;
  order_urls?: (Link | null)[];
}
interface Vendor {
  id?: string;
  name?: string;
  checked_at_beijing?: string;
  official_url?: string;
  sources?: ({ name?: string; url?: string } | null)[];
  plans?: (StockPlan | null)[];
}
interface SalePlan extends Link {
  name?: string;
  price?: string;
  specs?: string;
}
interface OfficialSale {
  provider?: string;
  status?: string;
  status_label?: string;
  status_kind?: string;
  orderable_now?: boolean;
  sale_hub?: string;
  summary?: string;
  sources?: ({ title?: string; url?: string } | null)[];
  plans?: (SalePlan | null)[];
}
interface Lead extends Link {
  source?: string;
  note?: string;
}

export interface VpsData {
  schema_version?: number;
  sample?: boolean | string;
  updated_at_beijing?: string;
  scanned_at_beijing?: { stock?: string; black_friday?: string; free_vps?: string };
  free_vps?: (FreeOffer | null)[];
  stock?: { providers?: (Vendor | null)[]; source_notes?: string[] };
  black_friday?: { official?: (OfficialSale | null)[]; leads?: (Lead | null)[]; date_note?: string };
}

type Definition = [label: string, value: string];

function Definitions({ rows, className }: { rows: readonly Definition[]; className: string }) {
  if (!rows.length) return null;
  return <dl className={className}>
    {rows.map(([label, value], index) => <div key={index}><dt>{label}</dt><dd>{value}</dd></div>)}
  </dl>;
}

function Specs({ specs }: { specs: FreeOffer["specs"] }) {
  const rows = asList(specs).flatMap<Definition>((spec) => {
    const label = textOf(spec?.label);
    const value = textOf(spec?.value);
    return label || value ? [[label || "说明", value]] : [];
  });
  return <Definitions rows={rows} className="spec-grid" />;
}

function conditionsOf(raw: Conditions | null | undefined): Definition[] {
  const card = raw?.card_required === true ? "要绑卡" : raw?.card_required === false ? "不绑卡" : "";
  const cardText = [card, textOf(raw?.card_notes)].filter(Boolean).join(" · ");
  const rows: Definition[] = [
    ["绑卡", cardText], ["区域", textOf(raw?.region_limits)], ["闲置回收", textOf(raw?.idle_reclaim)],
    ["截止", textOf(raw?.deadline)], ["截止说明", textOf(raw?.deadline_note)],
  ];
  return rows.filter(([, value]) => value);
}

const freeKinds: Record<string, string> = {
  always_free: "一直免费", "always free": "一直免费", trial: "试用额度", "trial credit": "试用额度",
  student: "学生额度", education: "学生额度", paas: "非 root 的 PaaS", "non root paas": "非 root 的 PaaS",
};

function FreeCard({ offer }: { offer: FreeOffer }) {
  const kind = normalize(offer.type);
  const label = textOf(offer.type_label) ||
    (Object.hasOwn(freeKinds, kind) ? freeKinds[kind] : textOf(offer.type)) || "其他";
  const posts = asList(offer.posts).flatMap((post) => {
    const href = safeUrl(post?.url);
    if (!href) return [];
    const fromX = ["x.com", "twitter.com", "mobile.twitter.com"].includes(hostnameOf(href));
    const title = [fromX ? "据 X 上的帖子" : "来源帖子", textOf(post?.time_beijing), textOf(post?.author)]
      .filter(Boolean).join(" · ");
    return [{ href, title }];
  });
  const notes = textOf(offer.notes);
  return (
    <article className="offer vps-card">
      <div className="offer-top">
        <div className="offer-heading">
          <span className="type-pill">{label}</span>
          <h3 className="offer-title">{textOf(offer.provider) || "未命名"}</h3>
        </div>
        <div className="offer-actions"><ExternalLink url={offer.official_url} className="go">官网</ExternalLink></div>
      </div>
      <Specs specs={offer.specs} />
      <Definitions rows={conditionsOf(offer.free_conditions)} className="cond-grid" />
      {posts.length > 0 && <div className="post-list">
        {posts.map(({ href, title }, index) => <ExternalLink url={href} key={index}>{title}</ExternalLink>)}
      </div>}
      {notes && <p className="body">{notes}</p>}
    </article>
  );
}

function PlanCard({ plan }: { plan: StockPlan }) {
  const available = plan.stock === "in_stock";
  const config = textOf(plan.config);
  const price = textOf(plan.price);
  const restock = textOf(plan.last_restock);
  const links = asList(plan.order_urls).flatMap((link) => {
    const href = safeUrl(link?.url);
    return href ? [{ href, label: textOf(link?.label) || linkLabel(href) }] : [];
  });
  return (
    <article className="plan">
      <div className="plan-top">
        <span className={"stock-pill " + (available ? "in" : "out")}>{available ? "有货" : "缺货"}</span>
        <h4>{textOf(plan.display_name) || textOf(plan.key) || "套餐"}</h4>
        {plan.limited === true && <span className="limited-pill">限量</span>}
      </div>
      {config ? <p className="plan-config">{config}</p> : <Specs specs={plan.specs} />}
      {price && <p className="plan-price">{price}</p>}
      {restock && <p className="plan-restock">最近补货 {restock}</p>}
      {links.length > 0 && <p className="plan-links">
        {links.map(({ href, label }, index) => <ExternalLink key={index} url={href} className="guide-link">{label}</ExternalLink>)}
      </p>}
      {!price && !links.length && <p className="quiet-line">目录里没有对应的价格和下单链接</p>}
    </article>
  );
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  const plans = asList(vendor.plans);
  const sources = asList(vendor.sources).flatMap((source) => {
    const href = safeUrl(source?.url);
    const name = textOf(source?.name) || hostnameOf(href);
    return name || href ? [{ href, name: name || href }] : [];
  });
  const checkedAt = textOf(vendor.checked_at_beijing);

  return (
    <section className="offer vendor">
      <div className="vendor-head">
        <h3>{textOf(vendor.name) || "厂商"}</h3>
        <ExternalLink url={vendor.official_url} className="source">官网</ExternalLink>
      </div>
      {(sources.length > 0 || checkedAt) && <p className="source-line">
        数据来源{" "}
        {sources.length ? sources.map(({ href, name }, index) => (
          <Fragment key={index}>{index > 0 && "、"}{href ? <ExternalLink url={href}>{name}</ExternalLink> : name}</Fragment>
        )) : "未标明"}
        {checkedAt && " · 最近检查 " + beijingTime(checkedAt)}
      </p>}
      {plans.length ? <div className="plan-list">
        {plans.map((plan, index) => <PlanCard plan={plan ?? {}} key={plan?.key ?? index} />)}
      </div> : <p className="quiet-line">这次检查没有套餐记录。</p>}
    </section>
  );
}

function SaleCard({ sale }: { sale: OfficialSale }) {
  const raw = normalize(sale.status).replace(/[\s-]+/g, "_");
  const label = textOf(sale.status_label) || (sale.orderable_now === true ? "现在能下单"
    : /no_black_friday|not_this_year/.test(raw) ? "今年不办" : "预告未开卖");
  const knownKind = textOf(sale.status_kind);
  const kind = ["now", "off", "soon"].includes(knownKind) ? knownKind
    : label === "现在能下单" ? "now" : label === "今年不办" ? "off" : "soon";
  const summary = textOf(sale.summary);
  const saleHub = safeUrl(sale.sale_hub);
  const sources = asList(sale.sources).filter((source) => safeUrl(source?.url));
  const plans = asList(sale.plans);
  return (
    <article className="offer bf-card">
      <div className="offer-top">
        <div className="offer-heading">
          <span className={"status-pill " + kind}>{label}</span>
          <h3 className="offer-title">{textOf(sale.provider) || "厂商"}</h3>
        </div>
        {saleHub && <div className="offer-actions"><ExternalLink url={saleHub} className="go">活动页</ExternalLink></div>}
      </div>
      {summary && <p className="body">{summary}</p>}
      {sources.length > 0 && <p className="source-links">
        {sources.map((source, index) => <ExternalLink key={index} url={source?.url}>
          {textOf(source?.title) || "官方来源"}
        </ExternalLink>)}
      </p>}
      {plans.length > 0 && <>
        <p className="kicker block">可下单套餐</p>
        <ul className="bf-list">
          {plans.map((plan, index) => {
            const price = textOf(plan?.price);
            const specs = textOf(plan?.specs);
            return <li className="bf-plan" key={index}>
              <strong>{textOf(plan?.name) || "套餐"}</strong>
              {price && <span>{price}</span>}
              {specs && <span className="plan-config">{specs}</span>}
              <ExternalLink url={plan?.url} className="guide-link">下单</ExternalLink>
            </li>;
          })}
        </ul>
      </>}
    </article>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const name = textOf(lead.source);
  const note = textOf(lead.note);
  const href = safeUrl(lead.url);
  return (
    <article className="lead">
      {href ? <ExternalLink url={href}>{name || "来源"}</ExternalLink> : name && <strong>{name}</strong>}
      {note && <p>{note}</p>}
    </article>
  );
}

function VpsSection({ id, label, title, description, children }: {
  id: string; label: string; title: string; description: string; children: ReactNode;
}) {
  return <section className="vps-section" id={id}>
    <header className="section-head"><p className="kicker">{label}</p><h2>{title}</h2><p>{description}</p></header>
    {children}
  </section>;
}

export function updatedLine(data: VpsData) {
  const scans = data.scanned_at_beijing;
  const time = textOf(data.updated_at_beijing) || textOf(scans?.black_friday || scans?.stock || scans?.free_vps);
  return time ? "最后更新 " + beijingTime(time) : "最后更新时间未知";
}

export function VpsContent({ data }: { data: VpsData }) {
  const free = asList(data.free_vps);
  const vendors = asList(data.stock?.providers);
  const notes = asList(data.stock?.source_notes).map(textOf).filter(Boolean);
  const sale = data.black_friday;
  const official = asList(sale?.official);
  const leads = asList(sale?.leads);
  const dateNote = textOf(sale?.date_note);
  return (
    <div className="detail-inner vps-inner">
      {String(data.sample).toLowerCase() === "true" && <p className="sample-banner" role="status">示例数据，等待首次同步</p>}
      <nav className="vps-jump" aria-label="本页"><a href="#free">免费方案</a><a href="#stock">补货监控</a><a href="#bf">黑五优惠</a></nav>
      <VpsSection id="free" label="免费方案" title="免费 VPS" description="一直免费、试用额度、学生额度，以及没有完整 root 的 PaaS。">
        {free.length ? free.map((offer, index) => <FreeCard key={offer?.id ?? index} offer={offer ?? {}} />)
          : <p className="quiet-line">暂时没有免费 VPS 情报。</p>}
      </VpsSection>
      <VpsSection id="stock" label="库存" title="补货监控" description="DMIT 和搬瓦工。有货是绿色，缺货是灰色。">
        {notes.map((note, index) => <p className="source-note" key={index}>{note}</p>)}
        {vendors.length ? vendors.map((vendor, index) => <VendorCard vendor={vendor ?? {}} key={vendor?.id ?? index} />)
          : <p className="quiet-line">暂时没有补货记录。</p>}
      </VpsSection>
      <VpsSection id="bf" label="优惠" title="黑五优惠" description="现在能下单、预告未开卖，或今年不办。可下单的套餐跟在官方来源后面。">
        {dateNote && <p className="date-note">{dateNote}</p>}
        {official.length ? official.map((entry, index) => <SaleCard sale={entry ?? {}} key={index} />)
          : <p className="quiet-line">暂时没有官方黑五状态。</p>}
        <section className="leads">
          <h3>第三方线索</h3><p className="disclaimer">仅线索，未经官方确认</p>
          {leads.length ? leads.map((lead, index) => <LeadCard lead={lead ?? {}} key={index} />)
            : <p className="quiet-line">这次没有单独的第三方线索。</p>}
        </section>
      </VpsSection>
    </div>
  );
}

export function VpsPage({ data }: { data: VpsData }) {
  useEffect(() => {
    const followHash = () => {
      const route = parseRouteHash(window.location.hash);
      if (route.page === "agent" || route.page === "provider") {
        window.location.replace(sectionUrl(route.page, route.slug, "vps"));
      } else if (route.slug) {
        document.getElementById(route.slug)?.scrollIntoView();
      }
    };
    followHash();
    window.addEventListener("hashchange", followHash);
    return () => window.removeEventListener("hashchange", followHash);
  }, []);

  return (
    <div className="app">
      <div className="chrome"><PageHeader page="vps" stats={updatedLine(data)} /></div>
      <div className="layout">
        <main className="detail"><VpsContent data={data} /></main>
        <PageFooter page="vps" />
      </div>
    </div>
  );
}
