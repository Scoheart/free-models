import { createRoot, type Root } from "react-dom/client";
import { loadItems, loadVps } from "./data";
import { decideRoute, parseRouteHash, sectionUrl, type Page } from "./routes";
import { PageFooter, PageHeader } from "./shared";
import "./styles.css";

function Landing() {
  return (
    <main className="home-wrap">
      <p className="eyebrow">Free</p><h1>免费</h1>
      <p className="lead">正在打开模型、网关和 API 额度。</p>
      <p className="home-links"><a href="provider/">模型</a><a href="agent/">Agent</a><a href="vps/">VPS</a></p>
    </main>
  );
}

function LoadingPage({ page, failed }: { page: Exclude<Page, "home">; failed?: boolean }) {
  return (
    <div className="app">
      <div className="chrome"><PageHeader page={page} /></div>
      <div className="layout">
        <main className="detail">
          <div className="empty" role={failed ? "alert" : "status"}>
            <p>{failed ? "暂时无法加载数据。请刷新页面重试。" : "正在加载数据…"}</p>
          </div>
        </main>
        <PageFooter page={page} />
      </div>
    </div>
  );
}

async function start(root: Root, page: Page) {
  const parsed = parseRouteHash(window.location.hash);
  if (page === "home") {
    root.render(<Landing />);
    let destination = parsed.page || "provider";
    let slug = destination === "vps" ? "" : parsed.slug;
    if (!parsed.page && slug) {
      try {
        const [items, { buildCatalog }] = await Promise.all([loadItems(), import("./catalog")]);
        const route = decideRoute(parsed, buildCatalog(items, Date.now()));
        destination = route.page || "provider";
        slug = route.page ? route.slug : "";
      } catch {
        slug = "";
      }
    }
    window.location.replace(sectionUrl(destination, slug, page));
    return;
  }

  if (page === "vps" && (parsed.page === "agent" || parsed.page === "provider")) {
    window.location.replace(sectionUrl(parsed.page, parsed.slug, page));
    return;
  }

  root.render(<LoadingPage page={page} />);
  try {
    if (page === "vps") {
      const [data, { VpsPage }] = await Promise.all([loadVps(), import("./vps-page")]);
      root.render(<VpsPage data={data} />);
    } else {
      const [items, { buildCatalog }, { CatalogPage }] = await Promise.all([
        loadItems(), import("./catalog"), import("./catalog-page"),
      ]);
      const now = Date.now();
      root.render(<CatalogPage page={page} catalog={buildCatalog(items, now)} now={now} />);
    }
  } catch {
    root.render(<LoadingPage page={page} failed />);
  }
}

const node = document.getElementById("root");
if (node) {
  const page = document.body.dataset.page;
  void start(createRoot(node), page === "provider" || page === "agent" || page === "vps" ? page : "home");
}
