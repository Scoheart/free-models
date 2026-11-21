import { useSyncExternalStore, type ReactNode } from "react";
import { sectionUrl, type Section } from "./routes";
import { safeUrl } from "./text";

const mobileWidth = "(max-width: 860px)";

function subscribeToWidth(update: () => void) {
  const media = window.matchMedia(mobileWidth);
  media.addEventListener("change", update);
  return () => media.removeEventListener("change", update);
}

export function useMobileLayout() {
  return useSyncExternalStore(subscribeToWidth, () => window.matchMedia(mobileWidth).matches, () => false);
}

export function ExternalLink({ url, className, children }: { url: unknown; className?: string; children: ReactNode }) {
  const href = safeUrl(url);
  if (!href) return null;
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}

const sections = [
  ["provider", "模型"], ["agent", "Agent"], ["vps", "VPS"],
] as const;

const leads: Record<Section, string> = {
  provider: "查看还没过期的模型、网关和 API 额度。离截止最近的排在前面。",
  agent: "编程 Agent、CLI 和 IDE 里还能用的免费额度，附领取步骤。",
  vps: "免费机器、两家补货监控，以及黑五优惠。价格和库存以下单页为准。",
};

export function PageHeader({ page, stats, counts }: {
  page: Section;
  stats?: string;
  counts?: Record<"provider" | "agent", number>;
}) {
  return (
    <header className="top">
      <div className="brand">
        <p className="eyebrow">Free</p>
        <h1>免费</h1>
        <p className="lead">{leads[page]}</p>
      </div>
      <div className="top-side">
        <nav className="kind-switch" aria-label="栏目">
          {sections.map(([section, title]) => (
            <a className="kind" key={section} href={sectionUrl(section, "", page)}
              aria-current={section === page ? "page" : undefined}>
              {title}
              {counts && section !== "vps" && <span className="kind-count">{counts[section]}</span>}
            </a>
          ))}
        </nav>
        <p className="stats" id="stats" aria-live="polite">{stats}</p>
      </div>
    </header>
  );
}

export function PageFooter({ page }: { page: Section }) {
  return <footer className="foot">{page === "vps"
    ? "库存、价格和资格会变，下单前请打开官方页面核对。页面不展示账号、邮箱或密钥。"
    : "数据来自公开帖子，领取前请自行核对官方条款。页面不展示 API Key。"}</footer>;
}
