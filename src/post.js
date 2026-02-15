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

  // ---------- Top search ----------
  $("qTop")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = encodeURIComponent(e.target.value.trim());
      window.location.href = `../index.html?q=${q}`;
    }
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
    const btnNF = $("downloadBtn");
    if (btnNF?.style) btnNF.style.display = "none";
    return;
  }

  // ---------- Meta ----------
  const categoryName =
    ({
      mid: "期中",
      final: "期末",
      grad: "研究所",
      notes: "筆記",
      solution: "解答",
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
  if (postAuthorEl) postAuthorEl.textContent = post.author || "—";
  const postTimeEl = $("postTime");
  if (postTimeEl) postTimeEl.textContent = post.createdAt || "—";
  const heroCategoryEl = $("heroCategory");
  if (heroCategoryEl) heroCategoryEl.textContent = categoryName;
  const heroSubjectEl = $("heroSubject");
  if (heroSubjectEl) heroSubjectEl.textContent = post.subject || "未設定科目";
  const chipStatusEl = $("chipStatus");
  if (chipStatusEl) chipStatusEl.textContent = statusText;
  const gpEl = $("gp");
  if (gpEl) gpEl.textContent = String(post.gp ?? 0);
  const bpEl = $("bp");
  if (bpEl) bpEl.textContent = String(post.bp ?? 0);

  // ---------- Attachment ----------
  const rawAttachment =
    typeof post.attachment === "string" ? post.attachment.trim() : "";
  const resolvedAttachment = resolveAttachmentPath(rawAttachment);

  // download button（可有可無）
  const btn = $("downloadBtn");
  if (btn) {
    if (!resolvedAttachment) {
      btn.textContent = "沒有附件";
      btn.classList.remove("primary");
      btn.style.pointerEvents = "none";
      btn.style.opacity = "0.6";
      btn.href = "#";
    } else {
      btn.textContent = "下載附件";
      btn.href = resolvedAttachment;
    }
  }

  // ---------- Body ----------
  const tags = (post.tags || []).map((t) => `#${escapeHtml(t)}`).join("　");
  const subject = post.subject
    ? `<span class="tag">${escapeHtml(post.subject)}</span>`
    : "";

  const defaultBody = `
    <h2>簡介</h2>
    <p>這裡是 <b>${escapeHtml(post.author || "—")}</b> 整理的資料頁。</p>

    <div class="callout">
      <p class="muted" style="margin:0;">
        科目：${subject}<br/>
        標籤：<span class="muted">${escapeHtml(tags || "（無）")}</span>
      </p>

      <div class="links">
        ${resolvedAttachment ? `<a class="a" href="${resolvedAttachment}" target="_blank" rel="noopener">📄 在新分頁開啟</a>` : ""}
        <a class="a" href="../index.html">📚 回文章列表</a>
      </div>
    </div>
  `;

  const body = post.bodyHtml ? post.bodyHtml : defaultBody;

  const pdfEmbed = resolvedAttachment
    ? `
      <div class="pdf-actions">
        <a class="a" href="${resolvedAttachment}" target="_blank" rel="noopener">📄 在新分頁開啟</a>
        <a class="a" href="${resolvedAttachment}" download>⬇️ 下載 PDF</a>
      </div>
      <div class="pdf-embed">
        <iframe class="pdf-frame" src="${resolvedAttachment}#view=FitH" title="PDF Preview"></iframe>
      </div>
    `
    : `
      <div class="callout" style="margin-top:14px;">
        <b>提示：</b> 這篇沒有設定 attachment，所以不會顯示 PDF。<br/>
        請到 <span class="kbd">src/data.js</span> 幫這篇加上：
        <div style="margin-top:8px;">
          <span class="kbd">attachment: "./assets/xxx.pdf"</span>
        </div>
      </div>
    `;

  const postBodyEl = $("postBody");
  if (postBodyEl) postBodyEl.innerHTML = body + pdfEmbed;
})();
