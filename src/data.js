// 你之後就一直往這個陣列加資料就好。
// attachment 可指向：
// 1) PDF：  ./化學系必修/普通化學/xxx.pdf
// 2) 其他檔案
// 也支援 attachments: ["./a.pdf","./b.pdf"]（同一篇多檔）
// ⚠️ 若路徑包含中文或空格，請使用 encodeURI()

window.POSTS = [
    {
        id: "calculator-stat-tutorial-2026",
        status: "new",
        category: "notes",
        department: "通識課",
        subject: "計算機統計",
        title: "【教學】計算機統計功能教學（平均值 / 標準差 / 線性回歸）",
        tags: ["教學", "計算機", "統計"],
        author: "allen",
        replies: 0,
        views: 120,
        createdAt: "2026-02-16",
        lastReplyAt: "2026-02-16 20:10",
        lastReplyBy: "allen",
        attachment: "./assets/calculate_pratice/calculator_statistics_practice.pdf"
    },
    {
        id: "analytical-chem-1-first-archive",
        status: "new",
        category: "mid1",
        department: "化學系",
        subject: "分析化學一",
        title: "【期中一】分析化學一 mid1 考古題",
        tags: ["分析化學一", "first", "歷年"],
        author: "陳貴通",
        replies: 0,
        views: 60,
        createdAt: "2026-02-16",
        lastReplyAt: "2026-02-16 20:35",
        lastReplyBy: "陳貴通",
        attachments: [
            "./assets/analytical_chem/analytical1/first/2024_first_midterm_exam_solutions.pdf",
            "./assets/analytical_chem/analytical1/first/2023_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/first/2021_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/first/2020_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/first/2019_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/first/2017_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/first/2016_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/first/2018_analytical_chem_1.pdf"
        ]
    },
    {
        id: "analytical-chem-1-second-archive",
        status: "new",
        category: "mid2",
        department: "化學系",
        subject: "分析化學一",
        title: "【期中二】分析化學一 mid2 考古題",
        tags: ["分析化學一", "second", "歷年"],
        author: "陳貴通",
        replies: 0,
        views: 42,
        createdAt: "2026-02-16",
        lastReplyAt: "2026-02-17 09:30",
        lastReplyBy: "陳貴通",
        attachments: [
            "./assets/analytical_chem/analytical1/second/2024_second_midterm_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/second/2023_second_midterm_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/second/2022_second_midterm_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/second/2021_second_midterm_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/second/2020_second_midterm_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/second/2019_second_midterm_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/second/2018_second_midterm_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/second/2017_second_midterm_analytical_chem_1.pdf"
        ]
    },
    {
        id: "analytical-chem-1-final-archive",
        status: "new",
        category: "final",
        department: "化學系",
        subject: "分析化學一",
        title: "【期末】分析化學一 final 考古題",
        tags: ["分析化學一", "final", "歷年"],
        author: "陳貴通",
        replies: 0,
        views: 40,
        createdAt: "2026-02-16",
        lastReplyAt: "2026-02-17 09:35",
        lastReplyBy: "陳貴通",
        attachments: [
            "./assets/analytical_chem/analytical1/final/2024_final_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/final/2023_final_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/final/2021_final_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/final/2020_final_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/final/2019_final_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/final/2018_final_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/final/2017_final_analytical_chem_1.pdf",
            "./assets/analytical_chem/analytical1/final/2016_final_analytical_chem_1.pdf"
        ]
    },
    {
        id: "analytical-chem-2-mid1-archive",
        status: "new",
        category: "mid1",
        department: "化學系",
        subject: "分析化學二",
        title: "【期中一】分析化學二 mid1 考古題",
        tags: ["分析化學二", "mid1", "歷年"],
        author: "Urban",
        replies: 0,
        views: 20,
        createdAt: "2026-02-17",
        lastReplyAt: "2026-02-17 11:20",
        lastReplyBy: "Urban",
        attachments: [
            "./assets/analytical_chem/analytical2/mid1/113-midterm1.pdf",
            "./assets/analytical_chem/analytical2/mid1/112-midterm1.pdf",
            "./assets/analytical_chem/analytical2/mid1/111-midterm1.pdf",
            "./assets/analytical_chem/analytical2/mid1/110-midterm1.pdf",
            "./assets/analytical_chem/analytical2/mid1/109-midterm1.pdf",
            "./assets/analytical_chem/analytical2/mid1/108-midterm1.pdf"
        ]
    },
    {
        id: "analytical-chem-2-mid2-archive",
        status: "new",
        category: "mid2",
        department: "化學系",
        subject: "分析化學二",
        title: "【期中二】分析化學二 mid2 考古題",
        tags: ["分析化學二", "mid2", "歷年"],
        author: "Urban",
        replies: 0,
        views: 20,
        createdAt: "2026-02-17",
        lastReplyAt: "2026-02-17 11:22",
        lastReplyBy: "Urban",
        attachments: [
            "./assets/analytical_chem/analytical2/mid2/113-midterm2.pdf",
            "./assets/analytical_chem/analytical2/mid2/112-midterm2.pdf",
            "./assets/analytical_chem/analytical2/mid2/111-midterm2.pdf",
            "./assets/analytical_chem/analytical2/mid2/110-midterm2.pdf",
            "./assets/analytical_chem/analytical2/mid2/109-midterm2.pdf",
            "./assets/analytical_chem/analytical2/mid2/108-midterm2.pdf"
        ]
    },
    {
        id: "analytical-chem-2-final-archive",
        status: "new",
        category: "final",
        department: "化學系",
        subject: "分析化學二",
        title: "【期末】分析化學二 final 考古題",
        tags: ["分析化學二", "final", "歷年"],
        author: "Urban",
        replies: 0,
        views: 18,
        createdAt: "2026-02-17",
        lastReplyAt: "2026-02-17 11:24",
        lastReplyBy: "Urban",
        attachments: [
            "./assets/analytical_chem/analytical2/final/113-final.pdf",
            "./assets/analytical_chem/analytical2/final/112-final.pdf",
            "./assets/analytical_chem/analytical2/final/111-final.pdf",
            "./assets/analytical_chem/analytical2/final/110-final.pdf",
            "./assets/analytical_chem/analytical2/final/108-final.pdf"
        ]
    },
    {
        id: "analytical-chem-2-assistant-materials",
        status: "new",
        category: "other",
        department: "化學系",
        subject: "分析化學二",
        title: "【其他】分析化學二助教教材",
        tags: ["分析化學二", "助教教材", "assistant"],
        author: "Urban",
        replies: 0,
        views: 30,
        createdAt: "2026-02-17",
        lastReplyAt: "2026-02-17 11:26",
        lastReplyBy: "Urban",
        attachments: [
            "./assets/analytical_chem/analytical2/assistant/l15_l16_20210506.pdf",
            "./assets/analytical_chem/analytical2/assistant/ch10_20210408.pdf",
            "./assets/analytical_chem/analytical2/assistant/ch5_9_20210325.pdf",
            "./assets/analytical_chem/analytical2/assistant/ch2_3_20210311.pdf",
            "./assets/analytical_chem/analytical2/assistant/ch1_20210304.pdf",
            "./assets/analytical_chem/analytical2/assistant/chapter_28.pdf",
            "./assets/analytical_chem/analytical2/assistant/chapter_26_27.pdf",
            "./assets/analytical_chem/analytical2/assistant/chapter_20_26.pdf",
            "./assets/analytical_chem/analytical2/assistant/ch15_1.pdf",
            "./assets/analytical_chem/analytical2/assistant/ch13_15.pdf",
            "./assets/analytical_chem/analytical2/assistant/ch4_1.pdf",
            "./assets/analytical_chem/analytical2/assistant/l9.pdf"
        ]
    },
    {
        id: "analytical-chem-2-quiz-archive",
        status: "new",
        category: "quiz",
        department: "化學系",
        subject: "分析化學二",
        title: "【小考】分析化學二 Quiz ",
        tags: ["分析化學二", "quiz", "歷屆"],
        author: "Urban",
        replies: 0,
        views: 25,
        createdAt: "2026-02-17",
        lastReplyAt: "2026-02-17 11:28",
        lastReplyBy: "Urban",
        attachments: [
            "./assets/analytical_chem/analytical2/quiz/class21/quiz_01.pdf",
            "./assets/analytical_chem/analytical2/quiz/class21/quiz_02.pdf",
            "./assets/analytical_chem/analytical2/quiz/class21/quiz_03.pdf",
            "./assets/analytical_chem/analytical2/quiz/class21/quiz_04.pdf",
            "./assets/analytical_chem/analytical2/quiz/class21/quiz_05.pdf",
            "./assets/analytical_chem/analytical2/quiz/class21/quiz_06.pdf",
            "./assets/analytical_chem/analytical2/quiz/class21/quiz_07.pdf",
            "./assets/analytical_chem/analytical2/quiz/class21/quiz_08.pdf",
            "./assets/analytical_chem/analytical2/quiz/class22/quiz_9th_march_2021_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class22/quiz_16th_march_2021_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class23/quiz_1st_march_2022_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class23/quiz_8th_march_2022_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class23/quiz_7th_apr_2022_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class23/quiz_12th_apr_2022_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class23/quiz_19th_apr_2022_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class23/quiz_26th_apr_2022_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class25/quiz_5th_march_2024_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class25/quiz_12th_march_2024_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class25/quiz_9th_april_2024_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class25/quiz_16th_april_2024_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class25/quiz_23rd_april_2024_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class25/quiz_14th_may_2024_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class25/quiz_14th_may_2024_answers_1.pdf",
            "./assets/analytical_chem/analytical2/quiz/class26/quiz_4th_march_2025_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class26/quiz_11th_march_2025_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class26/quiz_1st_apr_2025_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class26/quiz_8th_april_2025_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class26/quiz_6th_may_2025_answers.pdf",
            "./assets/analytical_chem/analytical2/quiz/class26/quiz_13th_may_2025_answers.pdf"
        ]
    },
    {
        id: "inorganic-chem-1-solid-mid2-notes",
        status: "new",
        category: "mid2",
        department: "化學系",
        subject: "無機化學一",
        title: "【期中二】無機化學一（固態）筆記",
        tags: ["無機化學一", "固態", "筆記"],
        author: "黃暄益",
        replies: 0,
        views: 1,
        createdAt: "2026-02-17",
        lastReplyAt: "2026-02-17 01:00",
        lastReplyBy: "黃暄益",
        attachment: "./assets/inorganic_chem/mid2_note/inorganic_chem_mid2_note_photos.pdf"
    }
,
{
    "id": "organic1-auto-mid1-item-3c6lyg-20260217_031943",
    "status": "new",
    "category": "mid1",
    "department": "化學系",
    "subject": "有機化學一",
    "title": "【期中一】有機化學一 2022-2023（林俊成）",
    "tags": [
        "有機化學一",
        "期中一",
        "自動整理"
    ],
    "author": "林俊成",
    "replies": 0,
    "views": 0,
    "createdAt": "2026-02-17",
    "lastReplyAt": "2026-02-17 00:00",
    "lastReplyBy": "林俊成",
    "attachments": [
        "./assets/organic_chemistry/organ_1/112有機一(林俊成)/mid 1/mid 1_merged.pdf",
        "./assets/organic_chemistry/organ_1/111有機一(林俊成)/111林俊成/有機一first exam.pdf"
    ]
},
{
    "id": "organic1-auto-mid2-item-3c6lyg-20260217_031943",
    "status": "new",
    "category": "mid2",
    "department": "化學系",
    "subject": "有機化學一",
    "title": "【期中二】有機化學一 2022-2023（林俊成）",
    "tags": [
        "有機化學一",
        "期中二",
        "自動整理"
    ],
    "author": "林俊成",
    "replies": 0,
    "views": 0,
    "createdAt": "2026-02-17",
    "lastReplyAt": "2026-02-17 00:00",
    "lastReplyBy": "林俊成",
    "attachments": [
        "./assets/organic_chemistry/organ_1/112有機一(林俊成)/mid 2/mid 2_merged.pdf",
        "./assets/organic_chemistry/organ_1/111有機一(林俊成)/111林俊成/有機一second exam.pdf",
        "./assets/organic_chemistry/organ_1/111有機一(林俊成)/111林俊成/Ans/Ans for second exam.pdf"
    ]
},
{
    "id": "organic1-auto-final-item-3c6lyg-20260217_031943",
    "status": "new",
    "category": "final",
    "department": "化學系",
    "subject": "有機化學一",
    "title": "【期末】有機化學一 2022-2023（林俊成）",
    "tags": [
        "有機化學一",
        "期末",
        "自動整理"
    ],
    "author": "林俊成",
    "replies": 0,
    "views": 0,
    "createdAt": "2026-02-17",
    "lastReplyAt": "2026-02-17 00:00",
    "lastReplyBy": "林俊成",
    "attachments": [
        "./assets/organic_chemistry/organ_1/112有機一(林俊成)/final(偏難，都是CCL的ㄘㄨㄛˋ啦)/「112期末難題解析.pdf",
        "./assets/organic_chemistry/organ_1/112有機一(林俊成)/final(偏難，都是CCL的ㄘㄨㄛˋ啦)/final(偏難，都是CCL的ㄘㄨㄛˋ啦)_merged.pdf",
        "./assets/organic_chemistry/organ_1/112有機一(林俊成)/final(偏難，都是CCL的ㄘㄨㄛˋ啦)/「112期末答案卷.pdf",
        "./assets/organic_chemistry/organ_1/112有機一(林俊成)/final(偏難，都是CCL的ㄘㄨㄛˋ啦)/「112期末答案卷(1).pdf",
        "./assets/organic_chemistry/organ_1/111有機一(林俊成)/111林俊成/有機一third exam.pdf"
    ]
},
{
    "id": "organic1-auto-mid1-item-2j3d3r-20260217_031943",
    "status": "new",
    "category": "mid1",
    "department": "化學系",
    "subject": "有機化學一",
    "title": "【期中一】有機化學一 2017-2021（陳建添）",
    "tags": [
        "有機化學一",
        "期中一",
        "自動整理"
    ],
    "author": "陳建添",
    "replies": 0,
    "views": 0,
    "createdAt": "2026-02-17",
    "lastReplyAt": "2026-02-17 00:00",
    "lastReplyBy": "陳建添",
    "attachments": [
        "./assets/organic_chemistry/organ_1/110有機一(陳建添)/1/題目卷.pdf",
        "./assets/organic_chemistry/organ_1/110有機一(陳建添)/1/答案卷.pdf",
        "./assets/organic_chemistry/organ_1/106有機一(陳建添)（化學系）/1 st/1 st_merged.pdf"
    ]
},
{
    "id": "organic1-auto-mid2-item-2j3d3r-20260217_031943",
    "status": "new",
    "category": "mid2",
    "department": "化學系",
    "subject": "有機化學一",
    "title": "【期中二】有機化學一 2017-2021（陳建添）",
    "tags": [
        "有機化學一",
        "期中二",
        "自動整理"
    ],
    "author": "陳建添",
    "replies": 0,
    "views": 0,
    "createdAt": "2026-02-17",
    "lastReplyAt": "2026-02-17 00:00",
    "lastReplyBy": "陳建添",
    "attachments": [
        "./assets/organic_chemistry/organ_1/110有機一(陳建添)/2/題目卷.pdf",
        "./assets/organic_chemistry/organ_1/110有機一(陳建添)/2/答案卷.pdf",
        "./assets/organic_chemistry/organ_1/107有機一(陳建添)/期中第二次/期中第二次_merged.pdf",
        "./assets/organic_chemistry/organ_1/106有機一(陳建添)（化學系）/2 nd/2 nd_merged.pdf"
    ]
},
{
    "id": "organic1-auto-mid3-item-2j3d3r-20260217_031943",
    "status": "new",
    "category": "mid3",
    "department": "化學系",
    "subject": "有機化學一",
    "title": "【期中三】有機化學一 2017-2021（陳建添）",
    "tags": [
        "有機化學一",
        "期中三",
        "自動整理"
    ],
    "author": "陳建添",
    "replies": 0,
    "views": 0,
    "createdAt": "2026-02-17",
    "lastReplyAt": "2026-02-17 00:00",
    "lastReplyBy": "陳建添",
    "attachments": [
        "./assets/organic_chemistry/organ_1/110有機一(陳建添)/3/題目卷.pdf",
        "./assets/organic_chemistry/organ_1/107有機一(陳建添)/期中第三次/期中第三次_merged.pdf",
        "./assets/organic_chemistry/organ_1/106有機一(陳建添)（化學系）/3 rd/3 rd_merged.pdf"
    ]
},
{
    "id": "organic1-auto-final-item-2j3d3r-20260217_031943",
    "status": "new",
    "category": "final",
    "department": "化學系",
    "subject": "有機化學一",
    "title": "【期末】有機化學一 2017-2018（陳建添）",
    "tags": [
        "有機化學一",
        "期末",
        "自動整理"
    ],
    "author": "陳建添",
    "replies": 0,
    "views": 0,
    "createdAt": "2026-02-17",
    "lastReplyAt": "2026-02-17 00:00",
    "lastReplyBy": "陳建添",
    "attachments": [
        "./assets/organic_chemistry/organ_1/107有機一(陳建添)/期中第四次/期中第四次_merged.pdf",
        "./assets/organic_chemistry/organ_1/106有機一(陳建添)（化學系）/final/final_merged.pdf"
    ]
},
{
    "id": "organic1-auto-mid1-item-3dil4y-20260217_031943",
    "status": "new",
    "category": "mid1",
    "department": "化學系",
    "subject": "有機化學一",
    "title": "【期中一】有機化學一 2017-2020（汪炳鈞）",
    "tags": [
        "有機化學一",
        "期中一",
        "自動整理"
    ],
    "author": "汪炳鈞",
    "replies": 0,
    "views": 0,
    "createdAt": "2026-02-17",
    "lastReplyAt": "2026-02-17 00:00",
    "lastReplyBy": "汪炳鈞",
    "attachments": [
        "./assets/organic_chemistry/organ_1/109有機一(汪炳鈞)/一/109上第一次期中.pdf",
        "./assets/organic_chemistry/organ_1/109有機一(汪炳鈞)/一/一_merged.pdf",
        "./assets/organic_chemistry/organ_1/108有機一(汪炳鈞)/1/1_merged.pdf",
        "./assets/organic_chemistry/organ_1/106有機一(汪炳鈞)（非化學系）/汪炳鈞_106有機期中一.pdf"
    ]
},
{
    "id": "organic1-auto-mid2-item-3dil4y-20260217_031943",
    "status": "new",
    "category": "mid2",
    "department": "化學系",
    "subject": "有機化學一",
    "title": "【期中二】有機化學一 2017-2020（汪炳鈞）",
    "tags": [
        "有機化學一",
        "期中二",
        "自動整理"
    ],
    "author": "汪炳鈞",
    "replies": 0,
    "views": 0,
    "createdAt": "2026-02-17",
    "lastReplyAt": "2026-02-17 00:00",
    "lastReplyBy": "汪炳鈞",
    "attachments": [
        "./assets/organic_chemistry/organ_1/109有機一(汪炳鈞)/二/109上第二次期中.pdf",
        "./assets/organic_chemistry/organ_1/109有機一(汪炳鈞)/二/二_merged.pdf",
        "./assets/organic_chemistry/organ_1/108有機一(汪炳鈞)/2/2_merged.pdf",
        "./assets/organic_chemistry/organ_1/106有機一(汪炳鈞)（非化學系）/汪炳鈞_106有機期中二.pdf"
    ]
},
{
    "id": "organic1-auto-mid3-item-3dil4y-20260217_031943",
    "status": "new",
    "category": "mid3",
    "department": "化學系",
    "subject": "有機化學一",
    "title": "【期中三】有機化學一 2017-2020（汪炳鈞）",
    "tags": [
        "有機化學一",
        "期中三",
        "自動整理"
    ],
    "author": "汪炳鈞",
    "replies": 0,
    "views": 0,
    "createdAt": "2026-02-17",
    "lastReplyAt": "2026-02-17 00:00",
    "lastReplyBy": "汪炳鈞",
    "attachments": [
        "./assets/organic_chemistry/organ_1/109有機一(汪炳鈞)/三/109上第三次期中.pdf",
        "./assets/organic_chemistry/organ_1/109有機一(汪炳鈞)/三/三_merged.pdf",
        "./assets/organic_chemistry/organ_1/108有機一(汪炳鈞)/3/3_merged.pdf",
        "./assets/organic_chemistry/organ_1/106有機一(汪炳鈞)（非化學系）/汪炳鈞_106有機期中三.pdf"
    ]
},
{
    "id": "organic1-auto-final-item-3dil4y-20260217_031943",
    "status": "new",
    "category": "final",
    "department": "化學系",
    "subject": "有機化學一",
    "title": "【期末】有機化學一 2017-2020（汪炳鈞）",
    "tags": [
        "有機化學一",
        "期末",
        "自動整理"
    ],
    "author": "汪炳鈞",
    "replies": 0,
    "views": 0,
    "createdAt": "2026-02-17",
    "lastReplyAt": "2026-02-17 00:00",
    "lastReplyBy": "汪炳鈞",
    "attachments": [
        "./assets/organic_chemistry/organ_1/109有機一(汪炳鈞)/期末/109上期末.pdf",
        "./assets/organic_chemistry/organ_1/109有機一(汪炳鈞)/期末/期末_merged.pdf",
        "./assets/organic_chemistry/organ_1/108有機一(汪炳鈞)/期末考/期末考_merged.pdf",
        "./assets/organic_chemistry/organ_1/106有機一(汪炳鈞)（非化學系）/汪炳鈞_106有機期末.pdf"
    ]
}
];
