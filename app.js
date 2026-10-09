/* free-models client — Provider / Agent / Model views + action links */
(function () {
  "use strict";

  const PROVIDER_PRIORITY = ["OpenRouter", "GMI", "百炼", "TokenHub"];
  const AGENT_PRIORITY = ["Cline", "OpenCode", "Copilot", "WorkBuddy"];

  const SCENE_LABELS = {
    coding: "写代码",
    chat: "聊天",
    image: "生图",
    video: "视频",
    api: "挂 API",
  };
  const BARRIER_LABELS = {
    zero_signup: "零注册试玩",
    need_key: "要 Key",
    need_client: "要装客户端",
    deposit_hold: "要充值占位",
    cn_account: "仅国内账号",
  };

  function asList(v) {
    return Array.isArray(v) ? v : [];
  }

  function normalizeEntry(raw) {
    if (!raw || typeof raw !== "object") return null;
    const name = String(raw.name || "").trim();
    const action_url = String(raw.action_url || raw.url || "").trim();
    if (!name) return null;
    return { name, action_url: action_url || null };
  }

  function normalizeItem(raw) {
    const o = raw && typeof raw === "object" ? raw : {};
    const deadline = o.deadline ?? o.expires_at ?? o.expire_at ?? o.expires ?? null;
    const url = o.url ?? o.link ?? o.source_url ?? "";
    const model = o.model ?? o.name ?? o.model_name ?? "未知模型";
    const type = o.type ?? (Array.isArray(o.tags) ? o.tags[0] : null) ?? "其他";
    const title = o.title ?? o.name ?? model;
    const collected = o.collected_at ?? o.collectedAt ?? o.created_at ?? o.scraped_at ?? null;
    const expiredFlag = o.expired === true || o.is_expired === true;
    const providers = asList(o.providers).map(normalizeEntry).filter(Boolean);
    const agents = asList(o.agents).map(normalizeEntry).filter(Boolean);
    const models = asList(o.models).map(normalizeEntry).filter(Boolean);
    const scenes = asList(o.scenes).map(String);
    const barriers = asList(o.barriers).map(String);
    return {
      id: String(o.id ?? url ?? title ?? Math.random()),
      title: String(title),
      model: String(model),
      type: String(type),
      deadline: deadline ? String(deadline) : null,
      url: String(url || ""),
      summary: String(o.summary ?? o.desc ?? o.description ?? ""),
      source: String(o.source ?? "x"),
      collected_at: collected ? String(collected) : null,
      expiredFlag,
      free_terms: String(o.free_terms || ""),
      product: String(o.product || ""),
      providers,
      agents,
      models,
      scenes,
      barriers,
    };
  }

  function isExpired(item, now) {
    if (item.expiredFlag) return true;
    if (!item.deadline) return false;
    const t = Date.parse(item.deadline);
    return Number.isNaN(t) ? false : t < now;
  }

  function sortKey(item) {
    const c = item.collected_at ? Date.parse(item.collected_at) : NaN;
    const d = item.deadline ? Date.parse(item.deadline) : NaN;
    return !Number.isNaN(c) ? c : !Number.isNaN(d) ? d : 0;
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    const t = Date.parse(iso);
    if (Number.isNaN(t)) return iso;
    try {
      return (
        new Intl.DateTimeFormat("zh-CN", {
          timeZone: "Asia/Shanghai",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(t) + " CST"
      );
    } catch {
      return new Date(t).toLocaleString("zh-CN");
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, """);
  }

  function prioritySort(names, priority) {
    return names.slice().sort((a, b) => {
      const ia = priority.indexOf(a);
      const ib = priority.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b, "zh");
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }

  const items = (Array.isArray(ITEMS) ? ITEMS : [])
    .map(normalizeItem)
    .sort((a, b) => sortKey(b) - sortKey(a));

  const state = {
    view: "all", // all | provider | agent | model
    scenes: new Set(),
    barriers: new Set(),
    onlyActive: true,
    entity: null, // selected provider/agent/model name within view
  };

  function collectNames(field) {
    const set = new Set();
    items.forEach((it) => asList(it[field]).forEach((e) => set.add(e.name)));
    return Array.from(set);
  }

  const allScenes = Array.from(
    new Set(items.flatMap((i) => i.scenes))
  ).sort((a, b) => a.localeCompare(b));
  const allBarriers = Array.from(
    new Set(items.flatMap((i) => i.barriers))
  ).sort((a, b) => a.localeCompare(b));

  function matchScenesBarriers(it) {
    if (state.scenes.size) {
      const ok = [...state.scenes].every((s) => it.scenes.includes(s));
      if (!ok) return false;
    }
    if (state.barriers.size) {
      const ok = [...state.barriers].every((b) => it.barriers.includes(b));
      if (!ok) return false;
    }
    return true;
  }

  function baseFiltered(now) {
    return items.filter((it) => {
      if (state.onlyActive && isExpired(it, now)) return false;
      if (!matchScenesBarriers(it)) return false;
      if (state.view === "provider") {
        if (!it.providers.length) return false;
        if (state.entity && !it.providers.some((p) => p.name === state.entity))
          return false;
      } else if (state.view === "agent") {
        if (!it.agents.length) return false;
        if (state.entity && !it.agents.some((a) => a.name === state.entity))
          return false;
      } else if (state.view === "model") {
        if (!it.models.length) return false;
        if (state.entity && !it.models.some((m) => m.name === state.entity))
          return false;
      }
      return true;
    });
  }

  function sceneLabel(k) {
    return SCENE_LABELS[k] || k;
  }
  function barrierLabel(k) {
    return BARRIER_LABELS[k] || k;
  }

  function renderViewTabs() {
    const el = document.getElementById("viewTabs");
    const tabs = [
      { id: "all", label: "全部" },
      { id: "provider", label: "Provider" },
      { id: "agent", label: "Agent" },
      { id: "model", label: "Model" },
    ];
    el.innerHTML = tabs
      .map((t) => {
        const active = state.view === t.id ? " active" : "";
        return `<button type="button" class="view-tab${active}" data-view="${t.id}">${t.label}</button>`;
      })
      .join("");
  }

  function renderEntityChips() {
    const row = document.getElementById("entityRow");
    const chips = document.getElementById("entityChips");
    const label = document.getElementById("entityLabel");
    if (state.view === "all") {
      row.hidden = true;
      return;
    }
    row.hidden = false;
    let names;
    let priority;
    if (state.view === "provider") {
      label.textContent = "渠道";
      names = prioritySort(collectNames("providers"), PROVIDER_PRIORITY);
      priority = PROVIDER_PRIORITY;
    } else if (state.view === "agent") {
      label.textContent = "Agent";
      names = prioritySort(collectNames("agents"), AGENT_PRIORITY);
      priority = AGENT_PRIORITY;
    } else {
      label.textContent = "模型";
      names = collectNames("models").sort((a, b) => a.localeCompare(b, "zh"));
      priority = [];
    }
    const opts = ["全部", ...names];
    chips.innerHTML = opts
      .map((v) => {
        const val = v === "全部" ? "" : v;
        const active =
          (v === "全部" && !state.entity) || state.entity === val
            ? " active"
            : "";
        const star =
          priority.includes(v) ? '<span class="chip-star" aria-hidden="true">★</span>' : "";
        return `<button type="button" class="chip${active}" data-entity="${escapeHtml(val)}">${star}${escapeHtml(v)}</button>`;
      })
      .join("");
  }

  function renderMultiChips(el, values, set, labelFn) {
    if (!values.length) {
      el.innerHTML = '<span class="chip-muted">暂无</span>';
      return;
    }
    el.innerHTML = values
      .map((v) => {
        const active = set.has(v) ? " active" : "";
        return `<button type="button" class="chip multi${active}" data-value="${escapeHtml(v)}">${escapeHtml(labelFn(v))}</button>`;
      })
      .join("");
  }

  function renderStats() {
    const now = Date.now();
    const active = items.filter((i) => !isExpired(i, now)).length;
    const shown = baseFiltered(now).length;
    document.getElementById("stats").innerHTML =
      `<div class="stat"><strong>${items.length}</strong>条合计</div>` +
      `<div class="stat"><strong>${active}</strong>条未过期</div>` +
      `<div class="stat"><strong>${shown}</strong>条当前显示</div>`;
  }

  function actionButtons(it) {
    const parts = [];
    it.providers.forEach((p) => {
      if (!p.action_url) return;
      parts.push(
        `<a class="action-btn provider" href="${escapeHtml(p.action_url)}" target="_blank" rel="noopener noreferrer">创建 API Key · ${escapeHtml(p.name)}</a>`
      );
    });
    it.agents.forEach((a) => {
      if (!a.action_url) return;
      parts.push(
        `<a class="action-btn agent" href="${escapeHtml(a.action_url)}" target="_blank" rel="noopener noreferrer">下载 Agent · ${escapeHtml(a.name)}</a>`
      );
    });
    it.models.forEach((m) => {
      if (!m.action_url) return;
      parts.push(
        `<a class="action-btn model" href="${escapeHtml(m.action_url)}" target="_blank" rel="noopener noreferrer">查看模型 · ${escapeHtml(m.name)}</a>`
      );
    });
    if (!parts.length) return "";
    return `<div class="actions">${parts.join("")}</div>`;
  }

  function tagPills(it) {
    const pills = [];
    it.scenes.forEach((s) =>
      pills.push(`<span class="pill scene">${escapeHtml(sceneLabel(s))}</span>`)
    );
    it.barriers.forEach((b) =>
      pills.push(
        `<span class="pill barrier">${escapeHtml(barrierLabel(b))}</span>`
      )
    );
    if (!pills.length) return "";
    return `<div class="pills">${pills.join("")}</div>`;
  }

  function renderCard(it, now) {
    const expired = isExpired(it, now);
    const statusBadge = expired
      ? `<span class="badge dead">已过期</span>`
      : `<span class="badge ok">进行中</span>`;
    const deadlineBadge = it.deadline
      ? expired
        ? `<span class="badge dead">截止 ${escapeHtml(fmtDate(it.deadline))}</span>`
        : `<span class="badge warn">截止 ${escapeHtml(fmtDate(it.deadline))}</span>`
      : `<span class="badge">无限期 / 未标注</span>`;
    const link = it.url
      ? `<a href="${escapeHtml(it.url)}" target="_blank" rel="noopener noreferrer">查看原帖</a>`
      : "";
    const titleHtml = it.url
      ? `<a href="${escapeHtml(it.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(it.title)}</a>`
      : escapeHtml(it.title);
    const entryHints = [];
    if (it.providers.length)
      entryHints.push(
        `<span class="badge entry">Provider · ${escapeHtml(it.providers.map((p) => p.name).join(" / "))}</span>`
      );
    if (it.agents.length)
      entryHints.push(
        `<span class="badge entry agent-entry">Agent · ${escapeHtml(it.agents.map((a) => a.name).join(" / "))}</span>`
      );
    if (it.models.length)
      entryHints.push(
        `<span class="badge entry model-entry">Model · ${escapeHtml(it.models.map((m) => m.name).join(" / "))}</span>`
      );
    return `<article class="card${expired ? " expired" : ""}">
      <div class="card-top">
        <h2 class="card-title">${titleHtml}</h2>
        <div class="badges">
          <span class="badge model">${escapeHtml(it.model)}</span>
          <span class="badge type">${escapeHtml(it.type)}</span>
          ${statusBadge}
        </div>
      </div>
      ${entryHints.length ? `<div class="badges entry-row">${entryHints.join("")}</div>` : ""}
      ${it.summary ? `<p class="summary">${escapeHtml(it.summary)}</p>` : ""}
      ${tagPills(it)}
      ${actionButtons(it)}
      <div class="meta">
        <span>${deadlineBadge}</span>
        <span>收录 ${escapeHtml(fmtDate(it.collected_at))}</span>
        ${link ? `<span>${link}</span>` : ""}
      </div>
    </article>`;
  }

  function groupKeyForView(it) {
    if (state.view === "provider") {
      if (state.entity) return state.entity;
      const names = prioritySort(
        it.providers.map((p) => p.name),
        PROVIDER_PRIORITY
      );
      return names[0] || "其他";
    }
    if (state.view === "agent") {
      if (state.entity) return state.entity;
      const names = prioritySort(
        it.agents.map((a) => a.name),
        AGENT_PRIORITY
      );
      return names[0] || "其他";
    }
    if (state.view === "model") {
      if (state.entity) return state.entity;
      return (it.models[0] && it.models[0].name) || it.model || "其他";
    }
    return null;
  }

  function groupOrder(keys) {
    if (state.view === "provider") return prioritySort(keys, PROVIDER_PRIORITY);
    if (state.view === "agent") return prioritySort(keys, AGENT_PRIORITY);
    return keys.slice().sort((a, b) => a.localeCompare(b, "zh"));
  }

  function renderList() {
    const list = document.getElementById("list");
    const now = Date.now();
    if (!items.length) {
      list.innerHTML = `<div class="empty"><div class="emoji">🛰️</div><h2>暂无条目</h2><p>猎手还在扫描 X 上的免费模型帖子，有新发现会自动更新到这里。</p></div>`;
      return;
    }
    const rows = baseFiltered(now);
    if (!rows.length) {
      list.innerHTML = `<div class="empty"><div class="emoji">🔍</div><h2>没有匹配的结果</h2><p>试试调整视图或筛选条件，或取消「只看未过期」。</p></div>`;
      return;
    }

    if (state.view === "all") {
      list.innerHTML = rows.map((it) => renderCard(it, now)).join("");
      return;
    }

    const groups = new Map();
    rows.forEach((it) => {
      // When no entity selected, an item with multiple providers/agents
      // appears under each matching group so every channel is findable.
      let keys;
      if (state.entity) {
        keys = [state.entity];
      } else if (state.view === "provider") {
        keys = it.providers.map((p) => p.name);
      } else if (state.view === "agent") {
        keys = it.agents.map((a) => a.name);
      } else {
        keys = it.models.map((m) => m.name);
        if (!keys.length) keys = [it.model];
      }
      keys.forEach((k) => {
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(it);
      });
    });

    const ordered = groupOrder(Array.from(groups.keys()));
    list.innerHTML = ordered
      .map((name) => {
        const cards = groups
          .get(name)
          .map((it) => renderCard(it, now))
          .join("");
        const count = groups.get(name).length;
        return `<section class="group">
          <h3 class="group-title"><span>${escapeHtml(name)}</span><span class="group-count">${count}</span></h3>
          <div class="group-cards">${cards}</div>
        </section>`;
      })
      .join("");
  }

  function renderAll() {
    renderViewTabs();
    renderEntityChips();
    renderMultiChips(
      document.getElementById("sceneChips"),
      allScenes,
      state.scenes,
      sceneLabel
    );
    renderMultiChips(
      document.getElementById("barrierChips"),
      allBarriers,
      state.barriers,
      barrierLabel
    );
    renderStats();
    renderList();
  }

  document.getElementById("viewTabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-view]");
    if (!btn) return;
    state.view = btn.dataset.view;
    state.entity = null;
    renderAll();
  });

  document.getElementById("entityChips").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-entity]");
    if (!btn) return;
    const v = btn.dataset.entity;
    state.entity = v || null;
    renderAll();
  });

  document.getElementById("sceneChips").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-value]");
    if (!btn) return;
    const v = btn.dataset.value;
    if (state.scenes.has(v)) state.scenes.delete(v);
    else state.scenes.add(v);
    renderAll();
  });

  document.getElementById("barrierChips").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-value]");
    if (!btn) return;
    const v = btn.dataset.value;
    if (state.barriers.has(v)) state.barriers.delete(v);
    else state.barriers.add(v);
    renderAll();
  });

  document.getElementById("onlyActive").addEventListener("change", (e) => {
    state.onlyActive = e.target.checked;
    renderStats();
    renderList();
  });

  (function themeInit() {
    const html = document.documentElement;
    const saved = localStorage.getItem("fm-theme");
    if (saved === "light" || saved === "dark")
      html.classList.add("theme-" + saved);
    document.getElementById("themeToggle").addEventListener("click", () => {
      const isDark =
        html.classList.contains("theme-dark") ||
        (!html.classList.contains("theme-light") &&
          matchMedia("(prefers-color-scheme: dark)").matches);
      html.classList.remove("theme-light", "theme-dark");
      html.classList.add(isDark ? "theme-light" : "theme-dark");
      localStorage.setItem("fm-theme", isDark ? "light" : "dark");
    });
  })();

  renderAll();
})();
