import { Collapsible } from "radix-ui";
import { Fragment, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  autoClaimView, categoryOf, claimGuideOf, deadlineOf, fmtDeadlineBJ, goUrl, itemUrl,
  offersByDeadline, statusLabels, summaryStatus, titleOf, type ClaimStatus, type GuideStep, type Offer, type PlatformGroup,
} from "./catalog";
import { ExternalLink, useMobileLayout } from "./shared";
import { linkLabel, normalize, redactSecrets, safeUrl } from "./text";

export function StatusDot({ status }: { status: ClaimStatus }) {
  if (!status) return null;
  const label = statusLabels[status];
  return <span className={"dot " + status} title={label}><span className="sr">{label}</span></span>;
}

function Paragraphs({ text, className }: { text: string; className: string }) {
  return text.split(/\n{2,}/).filter((part) => part.trim()).map((part, index) => (
    <p className={className} key={index}>
      {part.split("\n").filter((line) => line.trim()).map((line, lineIndex) => (
        <Fragment key={lineIndex}>{lineIndex > 0 && <br />}{line}</Fragment>
      ))}
    </p>
  ));
}

function ClaimBadge({ offer }: { offer: Offer }) {
  const view = autoClaimView(offer);
  if (!view) return null;
  return (
    <div className="auto-claim-row">
      <span className={"auto-claim " + view.kind}>{view.label}</span>
      {(view.note || view.at) && (
        <p className="auto-claim-note">
          {view.note && <span className="auto-claim-text">{view.note}</span>}
          {view.at && <span className="auto-claim-at">{view.at}</span>}
        </p>
      )}
    </div>
  );
}

function OfferIntro({ summary, terms }: { summary: string; terms: string }) {
  const mobile = useMobileLayout();
  const textRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflow, setOverflow] = useState(false);

  useLayoutEffect(() => {
    const text = textRef.current;
    if (!text || !mobile || expanded) return;

    const measure = () => setOverflow(text.scrollHeight > text.clientHeight + 2);
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(text);
    return () => resize.disconnect();
  }, [mobile, expanded, summary, terms]);

  return (
    <section className="block">
      <h4>详情介绍</h4>
      <div className="fold-text" ref={textRef} data-collapsed={mobile && !expanded ? "true" : undefined}>
        {summary && <Paragraphs text={summary} className="body" />}
        {terms && <Paragraphs text={terms} className="body" />}
      </div>
      <button className="fold-toggle" type="button" aria-expanded={expanded}
        hidden={!mobile || (!overflow && !expanded)} onClick={() => setExpanded(!expanded)}>
        {expanded ? "收起" : "展开"}
      </button>
    </section>
  );
}

function ClaimSteps({ steps }: { steps: GuideStep[] }) {
  const mobile = useMobileLayout();
  const [choice, setChoice] = useState<boolean>();
  const guideLength = steps
    .map(({ step, detail, url, note }) => step + detail + (safeUrl(url) ? linkLabel(url) : "") + (note ? "注意" + note : ""))
    .join("").replace(/\s+/g, "").length;
  const open = !mobile || (choice ?? (steps.length < 3 && guideLength <= 180));

  return (
    <section className="block steps-block">
      <Collapsible.Root className="steps" open={open} onOpenChange={setChoice}>
        <Collapsible.Trigger className="steps-summary" disabled={!mobile}>
          <span className="steps-label">领取步骤</span>
          <span className="steps-count">{steps.length}</span>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <ol className="guide">
            {steps.map((step, index) => (
              <li key={index}>
                {step.step && <p className="guide-title">{step.step}</p>}
                {step.detail && <Paragraphs text={step.detail} className="guide-detail" />}
                <ExternalLink url={step.url} className="guide-link">{linkLabel(step.url)}</ExternalLink>
                {step.note && <p className="guide-note"><span className="note-label">注意</span>{step.note}</p>}
              </li>
            ))}
          </ol>
        </Collapsible.Content>
      </Collapsible.Root>
    </section>
  );
}

function OfferCard({ offer, now, platform }: { offer: Offer; now: number; platform?: string }) {
  const summary = redactSecrets(offer.summary).trim();
  const rawTerms = redactSecrets(offer.free_terms).trim();
  const terms = normalize(rawTerms) === normalize(summary) ? "" : rawTerms;
  const deadline = deadlineOf(offer);
  const beijing = fmtDeadlineBJ(deadline);
  const urgent = Math.ceil((Date.parse(deadline) - now) / 86_400_000) <= 2;
  const href = safeUrl(goUrl(offer));
  const source = safeUrl(itemUrl(offer));
  const steps = claimGuideOf(offer);

  return (
    <article className="offer" data-kind={categoryOf(offer)}>
      <div className="offer-top">
        <div className="offer-heading">
          {platform && <p className="offer-platform">{redactSecrets(platform)}</p>}
          <h3 className="offer-title">{redactSecrets(titleOf(offer))}</h3>
          {beijing ? <p className={urgent ? "deadline soon" : "deadline"}>截止 {beijing}</p>
            : <p className="deadline quiet">未标明截止时间</p>}
        </div>
        <div className="offer-actions">
          <ExternalLink url={href} className="go">去领取</ExternalLink>
          {source !== href && <ExternalLink url={source} className="source">来源</ExternalLink>}
        </div>
      </div>
      <ClaimBadge offer={offer} />
      {(summary || terms) && <OfferIntro summary={summary} terms={terms} />}
      {steps.length > 0 && <ClaimSteps steps={steps} />}
    </article>
  );
}

export function CatalogDetail({ group, now }: { group: PlatformGroup; now: number }) {
  const status = summaryStatus(group.offers);
  return (
    <div className="detail-inner">
      <header className="platform-head">
        <p className="kicker">平台</p>
        <h2>{redactSecrets(group.name)}</h2>
        <p className="platform-meta">
          <span>{group.offers.length} 项进行中</span>
          <StatusDot status={status} />
          {status && <span className="dot-label">{statusLabels[status]}</span>}
        </p>
      </header>
      {group.offers.map((offer, index) => <OfferCard key={offer.id ? offer.id + "-" + index : index} offer={offer} now={now} />)}
    </div>
  );
}

const offersPerBatch = 30;

export function CatalogTimeline({ groups, now }: { groups: PlatformGroup[]; now: number }) {
  const offers = useMemo(() => offersByDeadline(groups), [groups]);
  const [limit, setLimit] = useState(offersPerBatch);
  return (
    <div className="detail-inner">
      <header className="platform-head">
        <h2>全部活动</h2>
        <p className="platform-meta">按截止时间排序</p>
      </header>
      {offers.slice(0, limit).map(({ offer, platform }, index) => (
        <OfferCard key={offer.id ? offer.id + "-" + index : index} offer={offer} now={now} platform={platform} />
      ))}
      {offers.length > limit && (
        <button type="button" className="jump-kind timeline-more" onClick={() => setLimit((shown) => shown + offersPerBatch)}>
          加载更多活动
        </button>
      )}
    </div>
  );
}
