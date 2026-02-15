// 你之後就一直往這個陣列加資料就好。
// attachment 可指向：
// 1) PDF：  ./化學系必修/普通化學/xxx.pdf
// 2) 其他檔案
// 也支援 attachments: ["./a.pdf","./b.pdf"]（同一篇多檔）
// ⚠️ 若路徑包含中文或空格，請使用 encodeURI()

window.POSTS = [
    {
        id: "qm-ntu-2024-final",
        status: "pin",           // "pin" | "hot" | "new" | ""
        category: "final",       // "mid" | "final" | "grad" | "notes" | "solution"
        department: "物理系",
        subject: "量子力學",
        title: "【期末】台大 2024 量子力學期末考古題（含題目掃描）",
        tags: ["台大", "期末", "掃描"],
        author: "allen",
        replies: 12,
        views: 4580,
        createdAt: "2025-12-20",
        lastReplyAt: "2026-02-14 11:52",
        lastReplyBy: "marcopolo",
        attachments: [
            "./assets/general_chem/101.pdf",
            "./assets/general_chem/102.pdf"
        ]
    },
    {
        id: "ss-112-mid-solution",
        status: "hot",
        category: "solution",
        department: "物理系",
        subject: "固態物理",
        title: "【解答】固態 112 上 期中（K-space / Brillouin zone）詳解",
        tags: ["解答", "推導", "BZ"],
        author: "dyson",
        replies: 27,
        views: 75300,
        createdAt: "2026-01-08",
        lastReplyAt: "2026-02-13 03:27",
        lastReplyBy: "js901020",
        attachment: ""
    },
    {
        id: "pchem-2022-final",
        status: "",
        category: "final",
        department: "化學系",
        subject: "物理化學",
        title: "【期末】物化 2022 熱力學/統計段（題目+重點整理）",
        tags: ["期末", "熱力學", "統計"],
        author: "hiteku",
        replies: 7,
        views: 20985,
        createdAt: "2025-11-03",
        lastReplyAt: "2026-02-12 22:02",
        lastReplyBy: "mole2160985",
        attachment: ""
    },
    {
        id: "oc-usc-2023-grad",
        status: "new",
        category: "grad",
        department: "化學所",
        subject: "有機化學",
        title: "【研究所】USC 2023 Organic Qual Exam（反應機構整理）",
        tags: ["USC", "研究所", "機構"],
        author: "sheep1219",
        replies: 3,
        views: 2980,
        createdAt: "2026-02-09",
        lastReplyAt: "2026-02-14 09:10",
        lastReplyBy: "f622230208",
        attachment: ""
    },
    {
        id: "la-ntu-notes",
        status: "",
        category: "notes",
        department: "資工系",
        subject: "線性代數",
        title: "【筆記】對角化、Jordan form 常見陷阱（含考古題整理）",
        tags: ["筆記", "陷阱", "總整理"],
        author: "phoenix",
        replies: 0,
        views: 320,
        createdAt: "2026-02-10",
        lastReplyAt: "2026-02-10 08:44",
        lastReplyBy: "a37601416",
        attachment: "./assets/general_chem/101.pdf"
    },
    {
        id: "genchem-mid-2025",
        status: "new",
        category: "mid",
        department: "化學系",
        subject: "普通化學",
        title: "【期中】普通化學 2025 上學期重點題型整理",
        tags: ["期中", "普通化學", "題型"],
        author: "michelle",
        replies: 5,
        views: 1420,
        createdAt: "2026-02-01",
        lastReplyAt: "2026-02-14 18:21",
        lastReplyBy: "allen",
        attachment: ""
    },
    {
        id: "algo-notes-2026",
        status: "",
        category: "notes",
        department: "資工系",
        subject: "演算法",
        title: "【筆記】演算法常見題型（Greedy / DP / Graph）",
        tags: ["筆記", "演算法", "DP"],
        author: "charlie",
        replies: 2,
        views: 760,
        createdAt: "2026-01-30",
        lastReplyAt: "2026-02-11 10:05",
        lastReplyBy: "phoenix",
        attachment: ""
    },
    {
        id: "seminar-surface-chem",
        status: "hot",
        category: "grad",
        department: "化學所",
        subject: "表面化學",
        title: "【研究所】表面化學 Seminar 重點與考古題方向",
        tags: ["研究所", "表面", "seminar"],
        author: "iris",
        replies: 11,
        views: 3890,
        createdAt: "2026-01-15",
        lastReplyAt: "2026-02-13 20:30",
        lastReplyBy: "dyson",
        attachment: ""
    },
    {
        id: "general-edu-writing-2024",
        status: "",
        category: "final",
        department: "通識課",
        subject: "學術寫作",
        title: "【期末】學術寫作 2024 期末題目與配分回憶",
        tags: ["通識", "寫作", "期末"],
        author: "rachel",
        replies: 4,
        views: 980,
        createdAt: "2026-01-05",
        lastReplyAt: "2026-02-12 16:42",
        lastReplyBy: "michelle",
        attachment: ""
    },
    {
        id: "general-edu-ethics-notes",
        status: "new",
        category: "notes",
        department: "通識課",
        subject: "科技倫理",
        title: "【筆記】科技倫理課堂重點與申論題模板",
        tags: ["通識", "倫理", "申論"],
        author: "kevin",
        replies: 1,
        views: 410,
        createdAt: "2026-02-08",
        lastReplyAt: "2026-02-14 07:50",
        lastReplyBy: "rachel",
        attachment: ""
    }
];
