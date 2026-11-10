/* free-models — simple list of active free offers */
(function () {
  "use strict";

  function asList(v) {
    return Array.isArray(v) ? v : [];
  }

  function escapeHtml(s) {
    var AMP = String.fromCharCode(38);
    var map = {
      "\u0026": AMP + "amp;",
      "\u003c": AMP + "lt;",
      "\u003e": AMP + "gt;",
      "\u0022": AMP + "quot;",
    };
    return String(s).replace(/[\u0026\u003c\u003e\u0022]/g, function (c) {
      return map[c];
    });
  }

  function isExpired(item, now) {
    if (item.expired === true || item.is_expired === true) return true;
    var deadline = item.deadline || item.expires_at || item.expire_at || item.expires;
    if (!deadline) return false;
    var t = Date.parse(deadline);
    return Number.isNaN(t) ? false : t < now;
  }

  function isSuperseded(item) {
    if (item.superseded === true || item.is_superseded === true) return true;
    var by = item.superseded_by != null ? item.superseded_by : item.supersededBy;
    if (by == null || by === false) return false;
    return String(by).trim() !== "";
  }

  function redactSecrets(s) {
    var out = String(s);
    out = out.replace(/\b(?:sk|pk|rk|ak|ghp|gho|github_pat)_[A-Za-z0-9_\-]{8,}/g, "[redacted]");
    out = out.replace(/\b(?:sk|pk|rk|ak)-[A-Za-z0-9_\-]{12,}/g, "[redacted]");
    out = out.replace(
      /((?:api[_-]?key|access[_-]?token|refresh[_-]?token|token|secret|password)\s*[:=]\s*)\S+/gi,
      "$1[redacted]"
    );
    out = out.replace(/\bBearer\s+[A-Za-z0-9._\-]{8,}/gi, "Bearer [redacted]");
    return out;
  }

  function clipText(s, max) {
    var t = String(s).replace(/\s+/g, " ").trim();
    if (t.length <= max) return t;
    return t.slice(0, max).replace(/[\s,，。；;、]+$/g, "") + "\u2026";
  }

  function autoClaimView(item) {
    var ac, status, note, at;
    ac = item && item.auto_claim;
    if (!ac || typeof ac !== "object" || Array.isArray(ac)) return null;
    status = String(ac.status == null ? "" : ac.status).trim().toLowerCase();
    note = ac.note == null ? "" : clipText(redactSecrets(String(ac.note)), 240);
    at = ac.at == null ? "" : clipText(redactSecrets(String(ac.at)), 48);
    if (status === "success") return { kind: "success", label: "已自动领取", note: note, at: at };
    if (status === "failed") return { kind: "failed", label: "自动申请失败", note: note, at: at };
    if (status === "needs_user") return { kind: "needs-user", label: "需要你本人操作", note: note, at: at };
    return null;
  }

  function renderAutoClaim(item) {
    var view, badge, note, visible;
    view = autoClaimView(item);
    if (!view) return { badge: "", note: "" };
    badge = '<span class="auto-claim ' + view.kind + '">' + escapeHtml(view.label) + "</span>";
    note = "";
    if (view.note || view.at) {
      note = '<p class="auto-claim-note">';
      if (view.note) {
        visible = clipText(view.note, 42);
        note +=
          '<span class="auto-claim-text" title="' +
          escapeHtml(view.note) +
          '">' +
          escapeHtml(visible) +
          "</span>";
      }
      if (view.at) note += '<span class="auto-claim-at">' + escapeHtml(view.at) + "</span>";
      note += "</p>";
    }
    return { badge: badge, note: note };
  }

  function sortKey(item) {
    var c = item.collected_at || item.collectedAt || item.created_at || item.scraped_at;
    var t = c ? Date.parse(c) : NaN;
    return Number.isNaN(t) ? 0 : t;
  }

  function fmtDeadlineMD(iso) {
    var t = Date.parse(iso);
    if (Number.isNaN(t)) return "";
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Shanghai",
        month: "numeric",
        day: "numeric",
      }).format(t);
    } catch (e) {
      var d = new Date(t);
      return d.getMonth() + 1 + "/" + d.getDate();
    }
  }

  function daysUntil(iso, now) {
    var t = Date.parse(iso);
    if (Number.isNaN(t)) return Infinity;
    return Math.ceil((t - now) / 86400000);
  }

  function claimUrl(item) {
    var i, list, e;
    list = asList(item.providers);
    for (i = 0; i < list.length; i++) {
      e = list[i];
      if (e && (e.action_url || e.url)) return String(e.action_url || e.url);
    }
    list = asList(item.agents);
    for (i = 0; i < list.length; i++) {
      e = list[i];
      if (e && (e.action_url || e.url)) return String(e.action_url || e.url);
    }
    list = asList(item.models);
    for (i = 0; i < list.length; i++) {
      e = list[i];
      if (e && (e.action_url || e.url)) return String(e.action_url || e.url);
    }
    return String(item.url || item.link || item.source_url || "");
  }

  function claimStepsOf(item) {
    // claim_steps wins so a step may contain ； or ;. Otherwise split
    // free_terms (then summary) on those semicolons or newlines.
    var i, step, out, raw, parts, part;
    out = [];
    if (Array.isArray(item.claim_steps)) {
      for (i = 0; i < item.claim_steps.length; i++) {
        step = item.claim_steps[i];
        step = String(step == null ? "" : step).replace(/\s+/g, " ").trim();
        if (step) out.push(step);
      }
      if (out.length) return out;
    }
    raw = item.free_terms || item.summary || item.desc || item.description || "";
    parts = String(raw).split(/[；;\r\n]+/);
    for (i = 0; i < parts.length; i++) {
      part = parts[i].replace(/\s+/g, " ").trim();
      if (part) out.push(part);
    }
    return out;
  }

  function renderSteps(steps) {
    var i, html;
    if (!steps.length) return "";
    html = '<ul class="claim-steps" aria-label="如何领取">';
    for (i = 0; i < steps.length; i++) {
      html += "<li>" + escapeHtml(steps[i]) + "</li>";
    }
    return html + "</ul>";
  }

  function renderCard(item, now) {
    var title = String(item.title || item.name || item.model || "未命名");
    var steps = claimStepsOf(item);
    var deadline = item.deadline || item.expires_at || item.expire_at || item.expires || null;
    var href = claimUrl(item);
    var source = String(item.url || item.link || item.source_url || "");

    var deadlineHtml = "";
    if (deadline) {
      var md = fmtDeadlineMD(String(deadline));
      if (md) {
        var soon = daysUntil(String(deadline), now) <= 2;
        deadlineHtml =
          '<p class="card-deadline"><span class="deadline' +
          (soon ? " soon" : "") +
          '">截止 ' +
          escapeHtml(md) +
          "</span></p>";
      }
    }

    var stepsHtml = renderSteps(steps);
    var ac = renderAutoClaim(item);

    var goHtml = href
      ? '<a class="go" href="' +
        escapeHtml(href) +
        '" target="_blank" rel="noopener noreferrer">去领取 →</a>'
      : "";

    var sourceHtml =
      source && source !== href
        ? '<a class="source" href="' +
          escapeHtml(source) +
          '" target="_blank" rel="noopener noreferrer">原帖</a>'
        : source && !href
          ? '<a class="source" href="' +
            escapeHtml(source) +
            '" target="_blank" rel="noopener noreferrer">原帖</a>'
          : "";

    return (
      '<article class="card">' +
      '<div class="title-row">' +
      '<h2 class="card-title">' +
      escapeHtml(title) +
      "</h2>" +
      ac.badge +
      "</div>" +
      ac.note +
      stepsHtml +
      deadlineHtml +
      '<div class="card-actions">' +
      goHtml +
      sourceHtml +
      "</div>" +
      "</article>"
    );
  }

  var now = Date.now();
  var all = Array.isArray(ITEMS) ? ITEMS : [];
  var active = all
    .filter(function (it) {
      return it && typeof it === "object" && !isExpired(it, now) && !isSuperseded(it);
    })
    .slice()
    .sort(function (a, b) {
      return sortKey(b) - sortKey(a);
    });

  var list = document.getElementById("list");
  if (!active.length) {
    list.innerHTML = '<div class="empty">暂时没有进行中的免费活动。</div>';
  } else {
    list.innerHTML = active
      .map(function (it) {
        return renderCard(it, now);
      })
      .join("");
  }

  // Expose counts for local verification / debugging
  window.__FM_COUNTS = { total: all.length, shown: active.length, hidden: all.length - active.length };
})();
