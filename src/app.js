(function () {
    try {
        const posts = Array.isArray(window.POSTS) ? window.POSTS : [];
        if (!Array.isArray(window.POSTS)) {
            console.warn("window.POSTS is not an array. Did src/data.js load correctly?");
        }

        const categoryMap = {
            mid1: "期中一",
            mid2: "期中二",
            mid3: "期中三",
            final: "期末",
            notes: "筆記",
            quiz: "小考",
            other: "其他"
        };

        const state = {
            tab: "all",
            q: "",
            department: "",
            subject: "",
            page: 1,
            perPage: 8
        };

        const $ = (id) => document.getElementById(id);

        const elRows = $("rows");
        const elPager = $("pager");
        const elYear = $("year");
        const q = $("q");
        const aboutBtn = $("aboutBtn");
        const aboutModal = $("aboutModal");
        const aboutModalClose = $("aboutModalClose");
        const aboutModalDismiss = $("aboutModalDismiss");
        const aboutModalToBanner = $("aboutModalToBanner");
        const addBtn = $("addBtn");
        const addModal = $("addModal");
        const addModalClose = $("addModalClose");
        const addModalDismiss = $("addModalDismiss");
        const addModalToCard = $("addModalToCard");
        const departmentSel = $("department");
        const subjectSel = $("subject");

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
            if (q) q.value = state.q;
            state.page = 1;
            render();
        }
        q?.addEventListener("input", (e) => setQuery(e.target.value));

        // init query from URL: /index.html?q=xxx
        const initParams = new URLSearchParams(window.location.search);
        const initQ = (initParams.get("q") || "").trim();
        if (initQ) {
            state.q = initQ;
            if (q) q.value = initQ;
        }

        // ---- Add modal ----
        function openModal(modalEl, closeFocusEl) {
            if (!modalEl) return;
            modalEl.classList.add("open");
            modalEl.setAttribute("aria-hidden", "false");
            document.body.classList.add("modal-open");
            closeFocusEl?.focus();
        }

        function closeModal(modalEl, returnFocusEl) {
            if (!modalEl) return;
            modalEl.classList.remove("open");
            modalEl.setAttribute("aria-hidden", "true");
            if (!aboutModal?.classList.contains("open") && !addModal?.classList.contains("open")) {
                document.body.classList.remove("modal-open");
            }
            returnFocusEl?.focus();
        }

        aboutBtn?.addEventListener("click", () => openModal(aboutModal, aboutModalClose));
        aboutModalClose?.addEventListener("click", () => closeModal(aboutModal, aboutBtn));
        aboutModalDismiss?.addEventListener("click", () => closeModal(aboutModal, aboutBtn));
        aboutModalToBanner?.addEventListener("click", () => closeModal(aboutModal, aboutBtn));
        addModal?.addEventListener("click", (e) => {
            if (e.target instanceof Element && e.target.closest("[data-close-modal='1']")) {
                closeModal(addModal, addBtn);
            }
        });
        aboutModal?.addEventListener("click", (e) => {
            if (e.target instanceof Element && e.target.closest("[data-close-modal='1']")) {
                closeModal(aboutModal, aboutBtn);
            }
        });
        addBtn?.addEventListener("click", () => openModal(addModal, addModalClose));
        addModalClose?.addEventListener("click", () => closeModal(addModal, addBtn));
        addModalDismiss?.addEventListener("click", () => closeModal(addModal, addBtn));
        addModalToCard?.addEventListener("click", () => closeModal(addModal, addBtn));

        // Shortcut: /
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && aboutModal?.classList.contains("open")) {
                e.preventDefault();
                closeModal(aboutModal, aboutBtn);
                return;
            }
            if (e.key === "Escape" && addModal?.classList.contains("open")) {
                e.preventDefault();
                closeModal(addModal, addBtn);
                return;
            }
            if (e.key === "/" && !aboutModal?.classList.contains("open") && !addModal?.classList.contains("open") && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
                e.preventDefault();
                q?.focus();
            }
        });

        // ---- Department -> Subject cascade ----
        function getSubjectsByDepartment(department) {
            return [...new Set(
                posts
                    .filter((p) => !department || p.department === department)
                    .map((p) => p.subject)
                    .filter(Boolean)
            )].sort((a, b) => a.localeCompare(b, "zh-Hant"));
        }

        function rebuildSubjectOptions(department) {
            if (!subjectSel) return;
            const subjects = getSubjectsByDepartment(department);
            subjectSel.innerHTML = "";

            const allOpt = document.createElement("option");
            allOpt.value = "";
            allOpt.textContent = "全部科目";
            subjectSel.appendChild(allOpt);

            for (const s of subjects) {
                const opt = document.createElement("option");
                opt.value = s;
                opt.textContent = s;
                subjectSel.appendChild(opt);
            }

            subjectSel.disabled = subjects.length === 0;
        }

        if (departmentSel) {
            departmentSel.addEventListener("change", (e) => {
                state.department = e.target.value;
                state.subject = "";
                state.page = 1;
                rebuildSubjectOptions(state.department);
                render();
            });
        }

        if (subjectSel) {
            subjectSel.addEventListener("change", (e) => {
                state.subject = e.target.value;
                state.page = 1;
                render();
            });
            rebuildSubjectOptions("");
        }

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
                if (state.department && p.department !== state.department) return false;
                if (state.subject && p.subject !== state.subject) return false;

                if (state.q) {
                    const hay = [p.title, p.department, p.subject, p.author, ...(p.tags || [])].join(" ").toLowerCase();
                    if (!hay.includes(state.q.toLowerCase())) return false;
                }
                return true;
            });
        }

        function sortPosts(list) {
            const copy = [...list];

            // primary sort by pin
            copy.sort((a, b) => (a.status === "pin" ? -1 : 0) - (b.status === "pin" ? -1 : 0));

            // secondary sort: newest first
            copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
            if (!elRows) return;
            elRows.innerHTML = items.map((p, idx) => {

                const categoryText = categoryMap[p.category] || "其他";
                const tags = (p.tags || [])
                    .slice(0, 4)
                    .map(t => `<span class="tag">#${escapeHtml(t)}</span>`)
                    .join("");

                // ⭐ 重點：永遠連到 post.html
                const href = p.id
                    ? `./posts/post.html?id=${encodeURIComponent(p.id)}`
                    : "#";
                const isClickable = href !== "#";

                return `
            <div class="row ${isClickable ? "row-clickable" : ""}" style="--row-index:${idx};" data-href="${href}" role="${isClickable ? "link" : ""}" tabindex="${isClickable ? "0" : "-1"}" aria-label="${isClickable ? `開啟 ${escapeHtml(p.title)}` : ""}">
              <div><span class="badge">${escapeHtml(categoryText)}</span></div>

              <div class="title">
                <a href="${href}" title="${escapeHtml(p.title)}">
                  ${escapeHtml(p.title)}
                </a>

                <div class="sub">
                  <span class="tag subject-tag" role="button" tabindex="0" aria-label="搜尋科目 ${escapeHtml(p.subject)}" data-subject="${escapeHtml(p.subject)}">${escapeHtml(p.subject)}</span>
                  ${tags}
                  <span>·</span>
                  <span>by <b class="author-tag" role="button" tabindex="0" aria-label="搜尋作者 ${escapeHtml(p.author)}" data-author="${escapeHtml(p.author)}">${escapeHtml(p.author)}</b></span>
                  <span>·</span>
                  <span>${escapeHtml(p.createdAt)}</span>
                </div>
              </div>
            </div>
            `;
            }).join("");

            elRows.querySelectorAll(".row-clickable").forEach((row) => {
                const href = row.getAttribute("data-href");
                if (!href || href === "#") return;

                row.addEventListener("click", (e) => {
                    if (e.target.closest("a, button, input, select, textarea, label")) return;
                    window.location.href = href;
                });

                row.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        window.location.href = href;
                    }
                });
            });

            elRows.querySelectorAll(".subject-tag").forEach((tag) => {
                const subject = tag.getAttribute("data-subject");
                if (!subject) return;

                tag.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setQuery(subject);
                });

                tag.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        setQuery(subject);
                    }
                });
            });

            elRows.querySelectorAll(".author-tag").forEach((tag) => {
                const author = tag.getAttribute("data-author");
                if (!author) return;

                tag.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setQuery(author);
                });

                tag.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        setQuery(author);
                    }
                });
            });
        }

        function renderPager(pages) {
            if (!elPager) return;
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

        function render() {
            const filtered = filterPosts();
            const sorted = sortPosts(filtered);
            const { pageItems, pages } = paginate(sorted);

            if (sorted.length === 0) {
                if (elRows) {
                    elRows.innerHTML = `
            <div style="padding:18px; color:var(--muted);">
              目前沒有任何文章資料。<br/>
              <span class="muted">請確認 <span class="kbd">src/data.js</span> 有設定 <span class="kbd">window.POSTS = [...]</span>，而且沒有語法錯誤。</span>
            </div>
          `;
                }
                if (elPager) elPager.innerHTML = "";
                return;
            }

            renderRows(pageItems);
            renderPager(pages);

            if (pageItems.length === 0) {
                if (elRows) {
                    elRows.innerHTML = `
            <div style="padding:18px; color:var(--muted);">
              找不到符合條件的項目。試試看清空搜尋或換分類。
            </div>
          `;
                }
                if (elPager) elPager.innerHTML = "";
            }
        }

        // init
        if (elYear) elYear.textContent = String(new Date().getFullYear());
        render();
    } catch (err) {
        // Show a visible error so the page doesn't look "empty" when JS crashes.
        console.error(err);
        const el = document.getElementById("rows") || document.body;
        const msg = document.createElement("div");
        msg.style.padding = "16px";
        msg.style.margin = "16px auto";
        msg.style.maxWidth = "980px";
        msg.style.border = "1px solid rgba(255,0,0,.35)";
        msg.style.borderRadius = "12px";
        msg.style.background = "rgba(255,0,0,.06)";
        msg.style.color = "#b00020";
        msg.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
        msg.innerHTML = `<b>頁面載入失敗：</b> ${String(err && err.message ? err.message : err)}<br/><small>請打開 DevTools Console 查看完整錯誤。</small>`;
        if (el === document.body) {
            document.body.prepend(msg);
        } else {
            el.innerHTML = "";
            el.appendChild(msg);
        }
    }
})();
