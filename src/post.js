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

    // 你可以把 GP/BP 當作自訂欄位，沒給就 0
    $("gp").textContent = String(post.gp ?? 0);
    $("bp").textContent = String(post.bp ?? 0);

    // ---- download button ----
    const dl = post.attachment || post.link || "#";
    const btn = $("downloadBtn");
    if (!dl || dl === "#") {
        btn.textContent = "沒有附件";
        btn.classList.remove("primary");
        btn.style.pointerEvents = "none";
        btn.style.opacity = "0.6";
    } else {
        btn.href = dl;
    }

    // ---- Body ----
    // 你可以在 data.js 裡加 post.bodyHtml（最自由）
    // 或只用 tags/subject/attachment 這種自動生成內容
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
        ${dl && dl !== "#" ? `<a class="a" href="${dl}" target="_blank" rel="noopener">📎 開啟/下載附件</a>` : ""}
        <a class="a" href="../index.html">📚 回文章列表</a>
      </div>
    </div>

    <hr class="hr"/>

    <h2>注意事項</h2>
    <ol>
      <li>如果你有同科目其他年份題目，歡迎補充。</li>
      <li>解答/詳解請盡量附推導或參考來源。</li>
      <li>檔案建議放在 <span class="kbd">/assets/</span>，連結比較穩。</li>
    </ol>

    <hr class="hr"/>

    <p class="muted">（提示）你可以在 <span class="kbd">src/data.js</span> 這篇的物件裡加 <span class="kbd">bodyHtml</span>，這裡就會顯示你的自訂內容。</p>
  `;

    const body = post.bodyHtml ? post.bodyHtml : defaultBody;
    $("postBody").innerHTML = body;

    // ---- helpers ----
    function escapeHtml(s) {
        return String(s ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
})();