(function () {
    const posts = Array.isArray(window.POSTS) ? window.POSTS : [];

    const statusMap = {
        pin: { text: "置頂", cls: "pin" },
        hot: { text: "精華", cls: "hot" },
        new: { text: "NEW", cls: "new" },
        "": { text: "一般", cls: "" }
    };

    const state = {
        tab: "all",
        q: "",
        subject: "",
        sort: "latest",
        page: 1,
        perPage: 8
    };

    const $ = (id) => document.getElementById(id);

    const elRows = $("rows");
    const elPager = $("pager");
    const elYear = $("year");
    const elTopAuthors = $("topAuthors");
    const qTop = $("qTop");
    const q = $("q");

    // ---- Theme toggle (class-based + persistence) ----
    const themeBtn = $("themeBtn");

    function applyTheme(mode) {
        const isDark = mode === "dark";
        document.documentElement.classList.toggle("dark", isDark);
        localStorage.setItem("theme", mode);
    }

    const saved = localStorage.getItem("theme");
    if (saved) applyTheme(saved);

    themeBtn?.addEventListener("click", () => {
        const isDark = document.documentElement.classList.contains("dark");
        applyTheme(isDark ? "light" : "dark");
    });

    // ---- Search sync ----
    function setQuery(v) {
        state.q = (v || "").trim();
        qTop.value = state.q;
        q.value = state.q;
        state.page = 1;
        render();
    }
    qTop.addEventListener("input", (e) => setQuery(e.target.value));
    q.addEventListener("input", (e) => setQuery(e.target.value));

    // Shortcut: /
    window.addEventListener("keydown", (e) => {
        if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
            e.preventDefault();
            q.focus();
        }
    });

    // ---- Subject options (auto from data) ----
    const subjectSel = $("subject");
    const subjects = [...new Set(posts.map(p => p.subject).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-Hant"));
    for (const s of subjects) {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        subjectSel.appendChild(opt);
    }

    subjectSel.addEventListener("change", (e) => {
        state.subject = e.target.value;
        state.page = 1;
        render();
    });

    $("sort").addEventListener("change", (e) => {
        state.sort = e.target.value;
        state.page = 1;
        render();
    });

    // Tabs
    document.querySelectorAll(".tab").forEach(t => {
        t.addEventListener("click", () => {
            document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
            t.classList.add("active");
            state.tab = t.dataset.tab;
            state.page = 1;
            render();
        });
    });

    // ---- Utils ----
    function escapeHtml(s) {
        return String(s ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function fmtNum(n) {
        if (n == null) return "0";
        const x = Number(n);
        if (x >= 1000 && x < 1000000) return (x / 1000).toFixed(1).replace(".0", "") + "k";
        if (x >= 1000000) return (x / 1000000).toFixed(1).replace(".0", "") + "m";
        return String(x);
    }

    function filterPosts() {
        return posts.filter(p => {
            if (state.tab !== "all" && p.category !== state.tab) return false;
            if (state.subject && p.subject !== state.subject) return false;

            if (state.q) {
                const hay = [p.title, p.subject, p.author, ...(p.tags || [])].join(" ").toLowerCase();
                if (!hay.includes(state.q.toLowerCase())) return false;
            }
            return true;
        });
    }

    function sortPosts(list) {
        const copy = [...list];

        // primary sort by pin
        copy.sort((a, b) => (a.status === "pin" ? -1 : 0) - (b.status === "pin" ? -1 : 0));

        // secondary sort
        if (state.sort === "replies") {
            copy.sort((a, b) => (b.replies || 0) - (a.replies || 0));
        } else if (state.sort === "hot") {
            copy.sort((a, b) => (b.views || 0) - (a.views || 0));
        } else if (state.sort === "newest") {
            copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            // latest reply
            copy.sort((a, b) => new Date((b.lastReplyAt || "").replace(" ", "T")) - new Date((a.lastReplyAt || "").replace(" ", "T")));
        }
        return copy;
    }

    function paginate(list) {
        const total = list.length;
        const pages = Math.max(1, Math.ceil(total / state.perPage));
        state.page = Math.min(state.page, pages);
        const start = (state.page - 1) * state.perPage;
        return { pageItems: list.slice(start, start + state.perPage), pages, total };
    }

    function renderRows(items) {
        elRows.innerHTML = items.map(p => {

            const st = statusMap[p.status ?? ""] || statusMap[""];
            const badgeCls = ["badge", st.cls].filter(Boolean).join(" ");
            const tags = (p.tags || [])
                .slice(0, 4)
                .map(t => `<span class="tag">#${escapeHtml(t)}</span>`)
                .join("");

            // ⭐ 重點：永遠連到 post.html
            const href = p.id
                ? `./posts/post.html?id=${encodeURIComponent(p.id)}`
                : "#";

            return `
        <div class="row">
          <div><span class="${badgeCls}">${st.text}</span></div>

          <div class="title">
            <a href="${href}" title="${escapeHtml(p.title)}">
              ${escapeHtml(p.title)}
            </a>

            <div class="sub">
              <span class="tag">${escapeHtml(p.subject)}</span>
              ${tags}
              <span>·</span>
              <span>by <b>${escapeHtml(p.author)}</b></span>
              <span>·</span>
              <span>${escapeHtml(p.createdAt)}</span>
            </div>
          </div>

          <div class="stat hide-sm">
            <div><strong>${fmtNum(p.replies)}</strong> 回覆</div>
            <div><strong>${fmtNum(p.views)}</strong> 瀏覽</div>
          </div>

          <div class="last">
            <div>
              <a href="${href}">
                ${escapeHtml(p.lastReplyBy)}
              </a>
            </div>
            <time datetime="${(p.lastReplyAt || "").replace(" ", "T")}">
              ${escapeHtml(p.lastReplyAt)}
            </time>
          </div>
        </div>
        `;
        }).join("");
    }

    function renderPager(pages) {
        const maxButtons = 9;
        const buttons = [];
        const cur = state.page;

        const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
        const half = Math.floor(maxButtons / 2);

        let start = clamp(cur - half, 1, Math.max(1, pages - maxButtons + 1));
        let end = clamp(start + maxButtons - 1, 1, pages);

        const push = (label, page, active = false) => buttons.push({ label, page, active });

        if (cur > 1) push("‹", cur - 1);
        for (let i = start; i <= end; i++) push(String(i), i, i === cur);
        if (cur < pages) push("›", cur + 1);

        elPager.innerHTML = buttons.map(b => `
      <div class="page ${b.active ? "active" : ""}" data-page="${b.page}" aria-label="page ${b.label}">
        ${b.label}
      </div>
    `).join("");

        elPager.querySelectorAll(".page").forEach(p => {
            p.addEventListener("click", () => {
                state.page = Number(p.dataset.page);
                render();
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });
    }

    function renderTopAuthors() {
        const map = new Map();
        for (const p of posts) map.set(p.author, (map.get(p.author) || 0) + 1);

        const top = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
        elTopAuthors.innerHTML = top.map(([name, count]) => `
      <div class="creator">
        <div class="avatar">${escapeHtml(name).slice(0, 1).toUpperCase()}</div>
        <div class="info">
          <b>${escapeHtml(name)}</b>
          <small>最近整理 ${count} 篇</small>
        </div>
      </div>
    `).join("") || `<div class="note">還沒有資料，先去新增幾篇吧。</div>`;
    }

    function render() {
        const filtered = filterPosts();
        const sorted = sortPosts(filtered);
        const { pageItems, pages } = paginate(sorted);

        renderRows(pageItems);
        renderPager(pages);
        renderTopAuthors();

        if (pageItems.length === 0) {
            elRows.innerHTML = `
        <div style="padding:18px; color:var(--muted);">
          找不到符合條件的項目。試試看清空搜尋或換分類。
        </div>
      `;
            elPager.innerHTML = "";
        }
    }

    // init
    if (elYear) elYear.textContent = new Date().getFullYear();
    render();
})();