(function () {
  const posts = Array.isArray(window.POSTS) ? window.POSTS : [];
  const $ = (id) => document.getElementById(id);

  // ---- Theme toggle ----
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

  // topbar search: 回列表並帶 query
  $("qTop")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = encodeURIComponent(e.target.value.trim());
      window.location.href = `../index.html?q=${q}`;
    }
  });

  // ---- get id ----
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const post = posts.find((p) => String(p.id) === String(id)) || null;

  // footer year (可有可無)
  $("year")?.textContent = new Date().getFullYear();

  // ---- helpers ----
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

    if (p.startsWith("./")) return "../" + encodeURI(p.slice(2));
    if (p.startsWith("../")) return encodeURI(p);

    // GitHub project pages 不能用 /assets/...（會掉到 domain root）
    if (p.startsWith("/")) return "../" + encodeURI(p.slice(1));

    // 其他：當作相對 repo root
    return "../" + encodeURI(p);
  }

  // ---- not found ----
  if (!post) {
    document.title = "找不到文章";
    $("postTitle")?.textContent = "找不到這篇文章";
    $("postBody")?.innerHTML = `
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

  // ---- category label ----
  const categoryName =
    ({
      mid: "期中",
      final: "期末",
      grad: "研究所",
      notes: "筆記",
      solution: "解答",
    }[post.category] || "綜合討論");

  // ---- status chip ----
  const statusText =
    ({
      pin: "置頂",
      hot: "精華",
      new: "NEW",
      "": "一般",
    }[post.status ?? ""] || "一般");

  // ---- Title / meta ----
  document.title = post.title || "文章";
  $("postTitle")?.textContent = post.title || "（無標題）";
  $("postAuthor")?.textContent = post.author || "—";
  $("postTime")?.textContent = post.createdAt || "—";
  $("heroCategory")?.textContent = categoryName;
  $("chipStatus")?.textContent = statusText;

  $("gp")?.textContent = String(post.gp ?? 0);
  $("bp")?.textContent = String(post.bp ?? 0);

  // ---- attachment ----
  const rawAttachment =
    typeof post.attachment === "string" ? post.attachment.trim() : "";
  const resolvedAttachment = resolveAttachmentPath(rawAttachment);

  // ---- download button ----
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

  // ---- Body ----
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

  // ---- PDF embed ----
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
    : "";

  $("postBody")?.innerHTML = body + pdfEmbed;
})();