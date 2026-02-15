// 你之後就一直往這個陣列加資料就好。
// link 可指向：
// 1) 文章頁：./posts/xxx.html
// 2) PDF：  ./assets/xxx.pdf
// 3) 外部連結：https://...

window.POSTS = [
    {
        id: "qm-ntu-2024-final",
        status: "pin",           // "pin" | "hot" | "new" | ""
        category: "final",       // "mid" | "final" | "grad" | "notes" | "solution"
        subject: "量子力學",
        title: "【期末】台大 2024 量子力學期末考古題（含題目掃描）",
        tags: ["台大", "期末", "掃描"],
        author: "allen",
        replies: 12,
        views: 4580,
        createdAt: "2025-12-20",
        lastReplyAt: "2026-02-14 11:52",
        lastReplyBy: "marcopolo",
        link: "#"
    },
    {
        id: "ss-112-mid-solution",
        status: "hot",
        category: "solution",
        subject: "固態物理",
        title: "【解答】固態 112 上 期中（K-space / Brillouin zone）詳解",
        tags: ["解答", "推導", "BZ"],
        author: "dyson",
        replies: 27,
        views: 75300,
        createdAt: "2026-01-08",
        lastReplyAt: "2026-02-13 03:27",
        lastReplyBy: "js901020",
        link: "#"
    },
    {
        id: "pchem-2022-final",
        status: "",
        category: "final",
        subject: "物理化學",
        title: "【期末】物化 2022 熱力學/統計段（題目+重點整理）",
        tags: ["期末", "熱力學", "統計"],
        author: "hiteku",
        replies: 7,
        views: 20985,
        createdAt: "2025-11-03",
        lastReplyAt: "2026-02-12 22:02",
        lastReplyBy: "mole2160985",
        link: "#"
    },
    {
        id: "oc-usc-2023-grad",
        status: "new",
        category: "grad",
        subject: "有機化學",
        title: "【研究所】USC 2023 Organic Qual Exam（反應機構整理）",
        tags: ["USC", "研究所", "機構"],
        author: "sheep1219",
        replies: 3,
        views: 2980,
        createdAt: "2026-02-09",
        lastReplyAt: "2026-02-14 09:10",
        lastReplyBy: "f622230208",
        link: "#"
    },
    {
        id: "la-ntu-notes",
        status: "",
        category: "notes",
        subject: "線性代數",
        title: "【筆記】對角化、Jordan form 常見陷阱（含考古題整理）",
        tags: ["筆記", "陷阱", "總整理"],
        author: "phoenix",
        replies: 0,
        views: 320,
        createdAt: "2026-02-10",
        lastReplyAt: "2026-02-10 08:44",
        lastReplyBy: "a37601416",
        link: "#"
    }
];