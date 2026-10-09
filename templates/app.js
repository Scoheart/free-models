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

  function sortKey(item) {
    var c = item.collected_at || item.collectedAt || item.created_at || item.scraped_at;
    var t = c ? Date.parse(c) : NaN;
    return Number.isNaN(t) ? 0 : t;
  }

  function firstSentence(text, maxChars) {
    var s = String(text || "").replace(/\s+/g, " ").trim();
    if (!s) return "";
    var cut = s.search(/[。！？.!?]/);
    if (cut >= 0 && cut < maxChars) return s.slice(0, cut + 1);
    if (s.length <= maxChars) return s;
    return s.slice(0, maxChars).replace(/[，,、\s]+$/, "") + "…";
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

  function blurbOf(item) {
    var raw = item.free_terms || item.summary || item.desc || item.description || "";
    return firstSentence(raw, 60);
  }

  function renderCard(item, now) {
    var title = String(item.title || item.name || item.model || "未命名");
    var blurb = blurbOf(item);
    var deadline = item.deadline || item.expires_at || item.expire_at || item.expires || null;
    var href = claimUrl(item);
    var source = String(item.url || item.link || item.source_url || "");

    var deadlineHtml = "";
    if (deadline) {
      var md = fmtDeadlineMD(String(deadline));
      if (md) {
        var soon = daysUntil(String(deadline), now) <= 2;
        deadlineHtml =
          ' <span class="deadline' +
          (soon ? " soon" : "") +
          '">· 截止 ' +
          escapeHtml(md) +
          "</span>";
      }
    }

    var blurbHtml = blurb
      ? '<p class="card-blurb">' + escapeHtml(blurb) + deadlineHtml + "</p>"
      : deadlineHtml
        ? '<p class="card-blurb">' + deadlineHtml.trim() + "</p>"
        : "";

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
      '<h2 class="card-title">' +
      escapeHtml(title) +
      "</h2>" +
      blurbHtml +
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
      return it && typeof it === "object" && !isExpired(it, now);
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
