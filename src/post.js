(function () {
  const posts = Array.isArray(window.POSTS) ? window.POSTS : [];
  const $ = (id) => document.getElementById(id);

  // ---------- Theme ----------
  function applyTheme(mode) {
    const isDark = mode === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", mode);
  }
  const saved = localStorage.getItem("theme");
  if (saved) applyTheme(saved);

  $("themeBtn")?.addEventListener("click", () => {
    const isDark = document.documentElement.classList.contains("dark");
    applyTheme(isDark ? "light" : "dark");
  });

  // ---------- Utils ----------
  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderSearchLink(el, keyword, label, emptyText = "—") {
    const q = String(keyword || "").trim();
    if (!el) return;
    if (!q) {
      el.textContent = emptyText;
      el.setAttribute("href", "../index.html");
      return;
    }
    el.textContent = q;
    el.setAttribute("href", `../index.html?q=${encodeURIComponent(q)}`);
    if (label) el.setAttribute("aria-label", label);
  }

  // post.html 在 /posts/，把 attachment 轉成可用路徑（並 encode）
  function resolveAttachmentPath(path) {
    if (!path) return "";
    const p = String(path).trim();
    if (!p) return "";

    // data.js 用 ./assets/... （相對 repo root）最穩
    if (p.startsWith("./")) return "../" + encodeURI(p.slice(2));

    // 已經寫 ../ 就照用
    if (p.startsWith("../")) return encodeURI(p);

    // project pages 禁用 /assets 這種 domain-root 絕對路徑
    if (p.startsWith("/")) return "../" + encodeURI(p.slice(1));

    // 其他：當作相對 repo root
    return "../" + encodeURI(p);
  }

  function getFileName(path) {
    const clean = String(path || "").split("#")[0].split("?")[0];
    const seg = clean.split("/");
    return decodeURIComponent(seg[seg.length - 1] || "附件");
  }

  function getAttachmentYear(path, fallbackYear) {
    const txt = String(path || "");
    const key = txt
      .replace(/^\.\/+/, "")
      .replace(/^\.\.\/+/, "")
      .replace(/\\/g, "/");
    const mapped = window.YEAR_MAP && window.YEAR_MAP[key];
    if (mapped) return String(mapped);
    const ad = txt.match(/(19|20)\d{2}/);
    if (ad) return ad[0];
    // 民國年（如 108、109、110）轉西元
    const roc = txt.match(/(?:^|[^0-9])([1-2]\d{2})(?:[^0-9]|$)/);
    if (roc) {
      const n = Number(roc[1]);
      if (n >= 100 && n <= 199) return String(n + 1911);
    }
    return fallbackYear || "未標註";
  }

  function getQuizAttachmentYear(path, fallbackYear) {
    const direct = getAttachmentYear(path, "");
    if (direct) return direct;
    const cls = String(path || "").match(/class(\d{2})/i);
    if (cls) {
      const n = Number(cls[1]);
      if (Number.isFinite(n)) return String(2000 + n - 1);
    }
    return fallbackYear || "未標註";
  }

  // year（可有可無）
  const yearEl = $("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- Find post ----------
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const post = posts.find((p) => String(p.id) === String(id)) || null;

  if (!post) {
    document.title = "找不到文章";
    const titleNF = $("postTitle");
    if (titleNF) titleNF.textContent = "找不到這篇文章";
    const bodyNF = $("postBody");
    if (bodyNF) bodyNF.innerHTML = `
      <div class="callout">
        <b>錯誤：</b> 文章不存在或連結不正確。<br/>
        請回到列表頁重新點選。
        <div class="links" style="margin-top:12px;">
          <a class="a" href="../index.html">← 回列表</a>
        </div>
      </div>
    `;
    return;
  }

  // ---------- Meta ----------
  const categoryName =
    ({
      mid1: "期中一",
      mid2: "期中二",
      mid3: "期中三",
      final: "期末",
      notes: "筆記",
      quiz: "小考",
      other: "其他",
      // backward compatibility for old data
      mid: "期中一",
      grad: "期中二",
      solution: "期中二",
    }[post.category] || "綜合討論");

  const statusText =
    ({
      pin: "置頂",
      hot: "精華",
      new: "NEW",
      "": "一般",
    }[post.status ?? ""] || "一般");

  document.title = post.title || "文章";
  const postTitleEl = $("postTitle");
  if (postTitleEl) postTitleEl.textContent = post.title || "（無標題）";
  const postAuthorEl = $("postAuthor");
  renderSearchLink(postAuthorEl, post.author, `搜尋作者 ${post.author || ""}`, "—");
  const postTimeEl = $("postTime");
  if (postTimeEl) postTimeEl.textContent = post.createdAt || "—";
  const heroCategoryEl = $("heroCategory");
  if (heroCategoryEl) heroCategoryEl.textContent = categoryName;
  const heroSubjectEl = $("heroSubject");
  renderSearchLink(heroSubjectEl, post.subject, `搜尋科目 ${post.subject || ""}`, "未設定科目");
  const chipStatusEl = $("chipStatus");
  if (chipStatusEl) chipStatusEl.textContent = statusText;

  // ---------- Attachment ----------
  const rawAttachments = Array.isArray(post.attachments)
    ? post.attachments
    : (typeof post.attachment === "string" && post.attachment.trim() ? [post.attachment] : []);
  const resolvedAttachments = rawAttachments
    .map((x) => resolveAttachmentPath(x))
    .filter(Boolean);
  const hasAttachment = resolvedAttachments.length > 0;
  const postYear = /^\d{4}/.test(String(post.createdAt || ""))
    ? String(post.createdAt).slice(0, 4)
    : "未知年份";
  const isQuizPost =
    String(post.id || "").toLowerCase().includes("quiz") ||
    (post.tags || []).some((t) => String(t || "").toLowerCase() === "quiz");

  function renderAttachmentCard(path, idx, forceYear = "") {
    const name = escapeHtml(getFileName(path));
    const panelId = `pdfInline${idx + 1}`;
    const isPdf = /\.pdf($|[?#])/i.test(path);
    const attachmentYear = forceYear || getAttachmentYear(path, postYear);
    return `
      <div class="attachment-block">
        <div class="callout attachment-card">
          <div class="attachment-title">附件 ${idx + 1}：<b>${name}</b></div>
          <div class="attachment-year">年份：<b>${escapeHtml(attachmentYear)}</b></div>
          <div class="attachment-actions">
            <a class="a" href="${path}" target="_blank" rel="noopener">📄 開啟</a>
            <a class="a" href="${path}" download>⬇️ 下載</a>
          </div>
          ${isPdf ? `
          <button class="pdf-summary pdf-toggle-inline" type="button" data-target="${panelId}" aria-expanded="false">
            ⤢ 點擊預覽 / 收合
          </button>
          <div class="pdf-inline-panel" id="${panelId}" hidden>
            <iframe class="pdf-inline-frame" src="${path}#view=FitH" title="PDF ${idx + 1}"></iframe>
          </div>` : `
          <div class="pdf-summary" style="opacity:.78;">此檔案格式不支援站內預覽（請用開啟/下載）</div>`}
        </div>
      </div>
    `;
  }

  const attachmentCards = hasAttachment
    ? (isQuizPost
      ? (() => {
        const groups = new Map();
        resolvedAttachments.forEach((path, idx) => {
        const y = getQuizAttachmentYear(path, postYear);
          if (!groups.has(y)) groups.set(y, []);
          groups.get(y).push({ path, idx });
        });
        const years = [...groups.keys()].sort((a, b) => {
          const na = Number(a);
          const nb = Number(b);
          if (Number.isFinite(na) && Number.isFinite(nb)) return nb - na;
          if (Number.isFinite(na)) return -1;
          if (Number.isFinite(nb)) return 1;
          return String(b).localeCompare(String(a), "zh-Hant");
        });
        return years
          .map((y, i) => {
            const panelId = `yearPanel${i + 1}`;
            const list = groups.get(y) || [];
            const open = i === 0;
            const cards = list.map(({ path, idx }) => renderAttachmentCard(path, idx, String(y))).join("");
            return `
              <section class="quiz-year-group callout">
                <button class="year-toggle" type="button" data-target="${panelId}" aria-expanded="${open ? "true" : "false"}">
                  ${escapeHtml(String(y))} 年（${list.length} 份）
                </button>
                <div class="year-panel" id="${panelId}" ${open ? "" : "hidden"}>
                  ${cards}
                </div>
              </section>
            `;
          })
          .join("");
      })()
      : resolvedAttachments.map((path, idx) => renderAttachmentCard(path, idx)).join(""))
    : "";

  // ---------- Body ----------
  const tags = (post.tags || []).map((t) => `#${escapeHtml(t)}`).join("　");
  const subject = post.subject
    ? `<a class="tag search-trigger" href="../index.html?q=${encodeURIComponent(post.subject)}">${escapeHtml(post.subject)}</a>`
    : "未設定科目";

  const attachmentSection = hasAttachment
    ? attachmentCards
    : `
      <div class="callout" style="margin-top:14px;">
        <b>提示：</b> 這篇沒有設定 attachment / attachments，所以不會顯示 PDF。<br/>
        請到 <span class="kbd">src/data.js</span> 幫這篇加上：
        <div style="margin-top:8px;">
          <span class="kbd">attachments: ["./assets/101.pdf","./assets/102.pdf"]</span>
        </div>
      </div>
    `;

  const defaultBody = `
    <h2>簡介</h2>
    <p>留白</p>

    <div class="callout">
      <p class="muted" style="margin:0;">
        科目：${subject}<br/>
        標籤：<span class="muted">${escapeHtml(tags || "（無）")}</span>
      </p>
    </div>

    ${attachmentSection}

    <div class="callout">
      <div class="links" style="margin-top:0;">
        <a class="a" href="../index.html">📚 回文章列表</a>
      </div>
    </div>
  `;

  const body = post.bodyHtml ? post.bodyHtml : defaultBody;

  const postBodyEl = $("postBody");
  if (postBodyEl) {
    postBodyEl.innerHTML = body;
    postBodyEl.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const yearBtn = target.closest(".year-toggle");
      if (yearBtn) {
        const targetId = yearBtn.getAttribute("data-target");
        if (!targetId) return;
        const panel = document.getElementById(targetId);
        if (!panel) return;
        const willOpen = panel.hasAttribute("hidden");
        if (willOpen) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
        yearBtn.setAttribute("aria-expanded", willOpen ? "true" : "false");
        return;
      }
      const btn = target.closest(".pdf-toggle-inline");
      if (!btn) return;
      const panelId = btn.getAttribute("data-target");
      if (!panelId) return;
      const panel = document.getElementById(panelId);
      if (!panel) return;
      const willOpen = panel.hasAttribute("hidden");
      if (willOpen) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
  }
})();
