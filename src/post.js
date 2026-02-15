(function () {
  const posts = Array.isArray(window.POSTS) ? window.POSTS : [];
  const $ = (id) => document.getElementById(id);

  // ---- Theme toggle（跟列表頁一致） ----
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

  // topbar search: 導回列表並帶 query
  $("qTop")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = encodeURIComponent(e.target.value.trim());
      window.location.href = `../index.html?q=${q}`;
    }
  });

  // ---- get id ----
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const post = posts.find(p => String(p.id) === String(id)) || null;

  $("year").textContent = new Date().getFullYear();

  if (!post) {
    document.title = "找不到文章";
    $("postTitle").textContent = "找不到這篇文章";
    $("postBody").innerHTML = `
          <div class="callout">
            <b>錯誤：</b> 文章不存在或連結不正確。<br/>
            請回到列表頁重新點選。
            <div class="links" style="margin-top:12px;">
              <a class="a" href="../index.html">← 回列表</a>
            </div>
          </div>
        `;
    $("downloadBtn").style.display = "none";
    return;
  }

  // ---- category label ----
  const categoryName = {
    mid: "期中",
    final: "期末",
    grad: "研究所",
    notes: "筆記",
    solution: "解答"
  }[post.category] || "綜合討論";

  // ---- status chip ----
  const statusText = {
    pin: "置頂",
    hot: "精華",
    new: "NEW",
    "": "一般"
  }[post.status ?? ""] || "一般";

  // ---- Title / meta ----
  document.title = post.title;
  $("postTitle").textContent = post.title;
  $("postAuthor").textContent = post.author || "—";
  $("postTime").textContent = post.createdAt || "—";
  $("heroCategory").textContent = categoryName;
  $("chipStatus").textContent = statusText;

  $("gp").textContent = String(post.gp ?? 0);
  $("bp").textContent = String(post.bp ?? 0);

  // ---- attachment (PDF) ----
  const rawAttachment = (typeof post.attachment === "string" ? post.attachment.trim() : "");
  const resolvedAttachment = resolveAttachmentPath(rawAttachment);

  // ---- download button ----
  const btn = $("downloadBtn");
  if (!resolvedAttachment) {
    btn.textContent = "沒有附件";
    btn.classList.remove("primary");
    btn.style.pointerEvents = "none";
    btn.style.opacity = "0.6";
    btn.href = "#";
  } else {
    btn.textContent = "下載附件";
    btn.href = resolvedAttachment;
    // 你 post.html 本來就有 target=_blank，不用再改
  }

  // ---- Body ----
  const tags = (post.tags || []).map(t => `#${escapeHtml(t)}`).join("　");
  const subject = post.subject ? `<span class="tag">${escapeHtml(post.subject)}</span>` : "";

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

  // ⭐⭐ 這段就是「直接在頁面顯示 PDF」⭐⭐
  const pdfEmbed = resolvedAttachment ? `
      <div class="pdf-actions">
        <a class="a" href="${resolvedAttachment}" download>⬇️ 下載 PDF</a>
      </div>
      <div class="pdf-embed">
        <iframe class="pdf-frame" src="${resolvedAttachment}#view=FitH" title="PDF Preview"></iframe>
      </div>
    ` : "";

  $("postBody").innerHTML = body + pdfEmbed;

  // ---- helpers ----
  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ✅ 重點：post.html 在 /posts/，attachment 常用 ./assets/...（相對 repo root）
  // 這裡會自動轉成 ../assets/... 並 encode URI（中文路徑也OK）
  function resolveAttachmentPath(path) {
    if (!path) return "";

    // ./xxx 代表相對 repo root；post.html 需要回上一層
    if (path.startsWith("./")) {
      return "../" + encodeURI(path.slice(2));
    }

    // 已經是 ../ 開頭就直接用（仍 encode）
    if (path.startsWith("../")) {
      return encodeURI(path);
    }

    // / 開頭（少見）保留
    if (path.startsWith("/")) {
      // GitHub project pages 不能用 /assets/...（會掉到 domain root）
      // 把 /xxx 轉成 ../xxx
      return "../" + encodeURI(path.slice(1));
    }

    // 其他情況：當作相對 root
    return "../" + encodeURI(path);
  }
})();