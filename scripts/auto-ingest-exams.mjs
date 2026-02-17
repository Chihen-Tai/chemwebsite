#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const args = process.argv.slice(2);
const getArg = (name, def = "") => {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : def;
};
const hasFlag = (name) => args.includes(name);

const root = process.cwd();
const inputDir = path.resolve(getArg("--input", path.join(root, "test")));
const subject = getArg("--subject", "未分類科目");
const defaultAuthor = getArg("--author", "unknown");
const department = getArg("--department", "通識課");
const idPrefix = getArg("--id-prefix", "auto-ingest");
const apply = hasFlag("--apply");

const reportDir = path.join(root, "reports");
fs.mkdirSync(reportDir, { recursive: true });
const now = new Date();
const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
const csvPath = path.join(reportDir, `ingest_${stamp}_classification.csv`);
const postsPath = path.join(reportDir, `ingest_${stamp}_generated_posts.js`);

const CATEGORY_KEYS = ["mid1", "mid2", "final"];
const CATEGORY_LABEL = { mid1: "期中一", mid2: "期中二", final: "期末" };

const MIME_EXT = new Map([
  ["application/pdf", ".pdf"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/gif", ".gif"],
  ["image/webp", ".webp"],
  ["image/heic", ".heic"],
  ["image/heif", ".heif"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"],
  ["application/vnd.openxmlformats-officedocument.presentationml.presentation", ".pptx"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".xlsx"]
]);

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".jfif", ".png", ".webp", ".heic", ".heif"]);
const JPEG_EXT = new Set([".jpg", ".jpeg", ".jfif"]);

function* walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith(".")) continue;
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) yield* walk(abs);
    else if (ent.isFile()) yield abs;
  }
}

function relFromRoot(abs) {
  const rel = path.relative(root, abs).replace(/\\/g, "/");
  return rel.startsWith(".") ? rel : `./${rel}`;
}

function detectMime(abs) {
  const r = spawnSync("file", ["-b", "--mime-type", abs], { encoding: "utf8" });
  return r.status === 0 ? String(r.stdout || "").trim().toLowerCase() : "";
}

function cleanNameBase(base) {
  return base
    .replace(/[「」『』【】]/g, "")
    .replace(/\s*複本\s*$/i, "")
    .replace(/\s+copy\s*$/i, "")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function slugifySegment(seg) {
  const dict = [
    ["期中一", "mid1"],
    ["期中二", "mid2"],
    ["期中", "mid"],
    ["期末", "final"],
    ["小考", "quiz"],
    ["答案", "answers"],
    ["筆記", "notes"],
    ["解析", "analysis"],
    ["有機", "organic"],
    ["無機", "inorganic"],
    ["分析", "analytical"],
    ["化學", "chemistry"],
    ["固態", "solid_state"],
    ["教授", "professor"],
    ["第一", "first"],
    ["第二", "second"],
    ["級", "class"]
  ];
  let out = String(seg);
  for (const [k, v] of dict) out = out.split(k).join(v);
  out = out
    .replace(/[「」『』【】]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^\x00-\x7F]+/g, "_")
    .replace(/[^A-Za-z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
  return out || "item";
}

function shortHash(input) {
  const s = String(input || "");
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36).slice(0, 6);
}

function inferMetaFromPath(relPath) {
  const s = String(relPath);
  const lower = s.toLowerCase();
  const segs = s.split("/").filter(Boolean);

  let professor = "";
  for (const seg of segs) {
    const m = seg.match(/\(([^)]+)\)/);
    if (m && m[1].trim()) {
      professor = m[1].trim();
      break;
    }
  }

  let year = "";
  const ad = s.match(/(19|20)\d{2}/);
  if (ad) year = ad[0];
  if (!year) {
    const roc = s.match(/(?:^|[^0-9])(1\d{2})(?:[^0-9]|$)/);
    if (roc) year = String(Number(roc[1]) + 1911);
  }
  if (!year) {
    const cls = lower.match(/class(\d{2})/);
    if (cls) year = String(2000 + Number(cls[1]) - 1);
  }

  let hint = "";
  if (/\/mid1\/|midterm1|mid_?1|first/.test(lower)) hint = "mid1";
  if (/\/mid2\/|midterm2|mid_?2|second/.test(lower)) hint = "mid2";
  if (/\/final\/|\bfinal\b/.test(lower)) hint = "final";

  return { professor, year, hint };
}

function pdfText(abs) {
  if (!/\.pdf$/i.test(abs)) return "";
  const r = spawnSync("strings", ["-n", "4", abs], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  return r.status === 0 ? String(r.stdout || "").toLowerCase() : "";
}

function scoreCategory(relPath, text, hint) {
  const lower = relPath.toLowerCase();
  const t = String(text || "").toLowerCase();
  const score = { mid1: 0, mid2: 0, final: 0 };
  if (hint && score[hint] != null) score[hint] += 8;
  if (/\/mid1\/|midterm1|mid_?1|first/.test(lower)) score.mid1 += 10;
  if (/\/mid2\/|midterm2|mid_?2|second/.test(lower)) score.mid2 += 10;
  if (/\/final\/|\bfinal\b/.test(lower)) score.final += 10;
  if (/midterm\s*1|first\s*midterm|期中一/.test(t)) score.mid1 += 12;
  if (/midterm\s*2|second\s*midterm|期中二/.test(t)) score.mid2 += 12;
  if (/final\s*exam|\bfinal\b|期末/.test(t)) score.final += 12;

  const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const [topKey, topScore] = ranked[0];
  const conf = topScore - ranked[1][1];
  if (topScore <= 0 || conf < 4) return { suggested: "unknown", confidence: Math.max(conf, 0), score };
  return { suggested: topKey, confidence: conf, score };
}

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function jpegSize(buf) {
  if (!(buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8)) throw new Error("not jpeg");
  let i = 2;
  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) { i += 1; continue; }
    const marker = buf[i + 1];
    i += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (marker === 0xda) break;
    if (i + 2 > buf.length) break;
    const len = (buf[i] << 8) + buf[i + 1];
    if (len < 2 || i + len > buf.length) break;
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return { h: (buf[i + 3] << 8) + buf[i + 4], w: (buf[i + 5] << 8) + buf[i + 6] };
    }
    i += len;
  }
  throw new Error("jpeg size fail");
}

function buildPdfFromJpegs(jpegFiles, outPdf) {
  const objs = [];
  const push = (num, body) => objs.push({ num, body });
  push(1, Buffer.from("<< /Type /Catalog /Pages 2 0 R >>", "latin1"));
  const page = [];
  const img = [];
  const cnt = [];

  jpegFiles.forEach((p, idx) => {
    const data = fs.readFileSync(p);
    const { w, h } = jpegSize(data);
    const iNum = 3 + idx * 3;
    const cNum = iNum + 1;
    const pNum = iNum + 2;
    const n = idx + 1;
    img.push({
      num: iNum,
      body: Buffer.concat([
        Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${data.length} >>\nstream\n`, "latin1"),
        data,
        Buffer.from("\nendstream", "latin1")
      ])
    });
    const draw = Buffer.from(`q\n${w} 0 0 ${h} 0 0 cm\n/Im${n} Do\nQ\n`, "latin1");
    cnt.push({
      num: cNum,
      body: Buffer.concat([Buffer.from(`<< /Length ${draw.length} >>\nstream\n`, "latin1"), draw, Buffer.from("endstream", "latin1")])
    });
    page.push({
      num: pNum,
      body: Buffer.from(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im${n} ${iNum} 0 R >> >> /Contents ${cNum} 0 R >>`, "latin1")
    });
  });

  push(2, Buffer.from(`<< /Type /Pages /Count ${page.length} /Kids [ ${page.map((x) => `${x.num} 0 R`).join(" ")} ] >>`, "latin1"));
  [...img, ...cnt, ...page].forEach((x) => push(x.num, x.body));
  objs.sort((a, b) => a.num - b.num);
  const max = objs[objs.length - 1].num;
  let pdf = Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "binary");
  const off = new Array(max + 1).fill(0);
  for (const o of objs) {
    off[o.num] = pdf.length;
    pdf = Buffer.concat([pdf, Buffer.from(`${o.num} 0 obj\n`, "latin1"), o.body, Buffer.from("\nendobj\n", "latin1")]);
  }
  const xrefPos = pdf.length;
  let xref = `xref\n0 ${max + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= max; i++) xref += `${String(off[i]).padStart(10, "0")} 00000 n \n`;
  const trailer = `trailer\n<< /Size ${max + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  fs.writeFileSync(outPdf, Buffer.concat([pdf, Buffer.from(xref + trailer, "latin1")]));
}

const originalFiles = [...walk(inputDir)];
const renamePlans = [];

for (const abs of originalFiles) {
  const rel = path.relative(inputDir, abs).replace(/\\/g, "/");
  const dirRel = path.dirname(rel) === "." ? "" : path.dirname(rel);
  const dirSlug = dirRel ? dirRel.split("/").map(slugifySegment).join("/") : "";
  const p = path.parse(path.basename(abs));
  const mime = detectMime(abs);
  const ext = (MIME_EXT.get(mime) || p.ext || "").toLowerCase();
  const base = cleanNameBase(p.name) || "file";
  const fileSlug = slugifySegment(base).replace(/\.[^.]+$/g, "");
  const targetRel = (dirSlug ? `${dirSlug}/` : "") + `${fileSlug}${ext}`;
  const targetAbs = path.join(inputDir, targetRel);
  if (targetAbs !== abs) renamePlans.push({ from: abs, to: targetAbs, mime: mime || "unknown" });
}

if (apply) {
  for (const r of renamePlans) {
    fs.mkdirSync(path.dirname(r.to), { recursive: true });
    let to = r.to;
    if (fs.existsSync(to) && to !== r.from) {
      const p = path.parse(to);
      let i = 2;
      while (true) {
        const cand = path.join(p.dir, `${p.name}_${i}${p.ext}`);
        if (!fs.existsSync(cand)) {
          to = cand;
          break;
        }
        i += 1;
      }
    }
    fs.renameSync(r.from, to);
    r.to = to;
  }
}

const currentFiles = apply ? [...walk(inputDir)] : originalFiles;
const byDir = new Map();
for (const f of currentFiles) {
  const d = path.dirname(f);
  if (!byDir.has(d)) byDir.set(d, []);
  byDir.get(d).push(f);
}

const mergedPdfs = [];
if (apply) {
  for (const [dir, files] of byDir.entries()) {
    const nonHidden = files.filter((f) => !path.basename(f).startsWith("."));
    if (!nonHidden.length) continue;
    const extSet = new Set(nonHidden.map((f) => path.extname(f).toLowerCase()));
    const allImage = [...extSet].every((e) => IMAGE_EXT.has(e));
    if (!allImage) continue;
    const jpegs = nonHidden.filter((f) => JPEG_EXT.has(path.extname(f).toLowerCase())).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
    if (!jpegs.length) continue;
    const out = path.join(dir, `${path.basename(dir)}_merged.pdf`);
    buildPdfFromJpegs(jpegs, out);
    mergedPdfs.push(out);
  }
}

const allForClassify = apply ? [...currentFiles, ...mergedPdfs] : currentFiles;
const rows = [];
for (const abs of allForClassify) {
  const rel = relFromRoot(abs);
  const meta = inferMetaFromPath(rel);
  const text = /\.pdf$/i.test(abs) ? pdfText(abs) : "";
  const { suggested, confidence, score } = scoreCategory(rel, text, meta.hint);
  rows.push({
    original_file: relFromRoot(abs),
    inferred_professor: meta.professor || "",
    inferred_year: meta.year || "",
    suggested_category: suggested,
    confidence,
    score_mid1: score.mid1,
    score_mid2: score.mid2,
    score_final: score.final
  });
}

rows.sort((a, b) => a.original_file.localeCompare(b.original_file, "en"));

const grouped = new Map();
for (const r of rows) {
  if (!CATEGORY_KEYS.includes(r.suggested_category)) continue;
  if (r.confidence < 4) continue;
  const prof = r.inferred_professor || defaultAuthor;
  const key = `${r.suggested_category}||${prof}`;
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key).push(r);
}

const generatedPosts = [];
for (const [key, list] of grouped.entries()) {
  const [cat, prof] = key.split("||");
  list.sort((a, b) => (Number(b.inferred_year) || 0) - (Number(a.inferred_year) || 0));
  const years = list.map((x) => Number(x.inferred_year)).filter((x) => Number.isFinite(x) && x > 1900);
  const yMax = years.length ? Math.max(...years) : "";
  const yMin = years.length ? Math.min(...years) : "";
  const yText = yMax ? (yMax === yMin ? `${yMax}` : `${yMin}-${yMax}`) : "";
  generatedPosts.push({
    id: `${idPrefix}-${cat}-${slugifySegment(prof)}-${shortHash(prof)}-${stamp}`,
    status: "new",
    category: cat,
    department,
    subject,
    title: `【${CATEGORY_LABEL[cat]}】${subject}${yText ? ` ${yText}` : ""}（${prof}）`,
    tags: [subject, CATEGORY_LABEL[cat], "自動匯入"],
    author: prof,
    replies: 0,
    views: 0,
    createdAt: dateStr,
    lastReplyAt: `${dateStr} 00:00`,
    lastReplyBy: prof,
    attachments: list.map((x) => x.original_file)
  });
}

const stats = rows.reduce((acc, r) => {
  acc[r.suggested_category] = (acc[r.suggested_category] || 0) + 1;
  return acc;
}, {});

const csvHeader = [
  "original_file",
  "inferred_professor",
  "inferred_year",
  "suggested_category",
  "confidence",
  "score_mid1",
  "score_mid2",
  "score_final"
];
const csv = [
  csvHeader.join(","),
  ...rows.map((r) => csvHeader.map((k) => csvEscape(r[k])).join(",")),
  "",
  "最後結果,數量",
  `mid1,${stats.mid1 || 0}`,
  `mid2,${stats.mid2 || 0}`,
  `final,${stats.final || 0}`,
  `unknown,${stats.unknown || 0}`,
  `total,${rows.length}`
].join("\n") + "\n";
fs.writeFileSync(csvPath, csv, "utf8");

const snippet = `// Auto-generated posts snippet\n${generatedPosts.map((p) => JSON.stringify(p, null, 2)).join(",\n")}\n`;
fs.writeFileSync(postsPath, snippet, "utf8");

if (apply && generatedPosts.length) {
  const dataPath = path.join(root, "src", "data.js");
  const src = fs.readFileSync(dataPath, "utf8");
  const insert = generatedPosts.map((p) => JSON.stringify(p, null, 4)).join(",\n");
  const next = src.replace(/\]\s*;\s*$/, `,\n${insert}\n];\n`);
  fs.writeFileSync(dataPath, next, "utf8");
}

console.log(`Input: ${inputDir}`);
console.log(`Apply mode: ${apply}`);
console.log(`Rename planned: ${renamePlans.length}`);
console.log(`Merged PDFs: ${mergedPdfs.length}`);
console.log(`Classification report: ${csvPath}`);
console.log(`Generated posts snippet: ${postsPath}`);
console.log(`Generated post count: ${generatedPosts.length}`);
console.log("Suggested counts:", stats);
if (!apply) console.log("Dry-run mode: no file rename/merge and no data.js mutation.");
