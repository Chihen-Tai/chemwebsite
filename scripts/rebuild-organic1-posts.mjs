#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const root = process.cwd();
const sourceDir = path.join(root, "assets", "organic_chemistry", "organ_1");
const dataPath = path.join(root, "src", "data.js");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".jfif"]);
const OFFICE_EXT = new Set([".doc", ".docx", ".ppt", ".pptx"]);
const ALLOWED_EXT = new Set([".pdf", ".jpg", ".jpeg", ".jfif", ".png", ".doc", ".docx", ".ppt", ".pptx"]);

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith(".")) continue;
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(abs));
    else if (ent.isFile()) out.push(abs);
  }
  return out;
}

function rel(abs) {
  return "./" + path.relative(root, abs).replace(/\\/g, "/");
}

function shortHash(input) {
  const s = String(input || "");
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36).slice(0, 6);
}

function extractProfessor(p) {
  const m = p.match(/有機一\(([^)]+)\)/);
  if (m && m[1]) return m[1].replace(/（.*?）/g, "").trim();
  return "陳建添";
}

function extractYearAd(p) {
  const m = p.match(/\/(1\d{2})有機一\(/);
  if (m) return Number(m[1]) + 1911;
  return null;
}

function categoryOf(p) {
  if (/\/final|期末|學期考|期末考|final exam/i.test(p)) return "final";
  if (/mid\s*3|mid_3|\/(3|3 rd)\/|第三次|第四次|期中三|\/(三)\/|third/i.test(p)) return "mid3";
  if (/mid\s*2|mid_2|\/(2|2 nd)\/|第二次|期中二|\/(二)\/|second/i.test(p)) return "mid2";
  if (/mid\s*1|mid_1|\/(1|1 st)\/|第一次|期中一|\/(一)\/|first/i.test(p)) return "mid1";
  if (/ans\//i.test(p)) return "mid2";
  return "other";
}

function normalizeCategoryByProfessor(cat, relPath, professor) {
  if (professor === "林俊成" && cat === "mid3") return "final";
  if (professor === "林俊成" && /third exam|第三次/i.test(relPath)) return "final";
  return cat;
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
    const rotate = w > h;
    const pageW = rotate ? h : w;
    const pageH = rotate ? w : h;
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
    const draw = rotate
      ? Buffer.from(`q\n0 -${pageH} ${pageW} 0 0 ${pageH} cm\n/Im${n} Do\nQ\n`, "latin1")
      : Buffer.from(`q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im${n} Do\nQ\n`, "latin1");
    cnt.push({
      num: cNum,
      body: Buffer.concat([Buffer.from(`<< /Length ${draw.length} >>\nstream\n`, "latin1"), draw, Buffer.from("endstream", "latin1")])
    });
    page.push({
      num: pNum,
      body: Buffer.from(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im${n} ${iNum} 0 R >> >> /Contents ${cNum} 0 R >>`, "latin1")
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

function tryConvertOfficeToPdf(abs) {
  const ext = path.extname(abs).toLowerCase();
  if (!OFFICE_EXT.has(ext)) return { outPdf: "", created: false };
  const dir = path.dirname(abs);
  const base = path.parse(abs).name;
  const outPdf = path.join(dir, `${base}.pdf`);
  if (fs.existsSync(outPdf) && fs.statSync(outPdf).size > 0) return { outPdf, created: false };

  const soffice = spawnSync("soffice", ["--headless", "--convert-to", "pdf", "--outdir", dir, abs], { encoding: "utf8" });
  if (soffice.status === 0 && fs.existsSync(outPdf) && fs.statSync(outPdf).size > 0) return { outPdf, created: true };

  const textutil = spawnSync("textutil", ["-convert", "pdf", abs, "-output", outPdf], { encoding: "utf8" });
  if (textutil.status === 0 && fs.existsSync(outPdf) && fs.statSync(outPdf).size > 0) return { outPdf, created: true };

  const cups = spawnSync("cupsfilter", ["-m", "application/pdf", abs], { encoding: "buffer" });
  if (cups.status === 0 && cups.stdout && cups.stdout.length > 0) {
    fs.writeFileSync(outPdf, cups.stdout);
    if (fs.statSync(outPdf).size > 0) return { outPdf, created: true };
  }

  if (fs.existsSync(outPdf) && fs.statSync(outPdf).size === 0) fs.unlinkSync(outPdf);
  return { outPdf: "", created: false };
}

if (!fs.existsSync(sourceDir)) {
  console.error(`Not found: ${sourceDir}`);
  process.exit(1);
}

let files = walk(sourceDir)
  .filter((abs) => ALLOWED_EXT.has(path.extname(abs).toLowerCase()));

let convertedCreated = 0;
let convertedExisting = 0;
for (const abs of files) {
  const { outPdf, created } = tryConvertOfficeToPdf(abs);
  if (!outPdf) continue;
  if (created) convertedCreated += 1;
  else convertedExisting += 1;
}
if (convertedCreated > 0 || convertedExisting > 0) {
  files = walk(sourceDir)
    .filter((abs) => ALLOWED_EXT.has(path.extname(abs).toLowerCase()) || path.extname(abs).toLowerCase() === ".pdf");
}

const byDir = new Map();
for (const abs of files) {
  const d = path.dirname(abs);
  if (!byDir.has(d)) byDir.set(d, []);
  byDir.get(d).push(abs);
}

const merged = [];
const CN_NUM = new Map([["零", 0], ["〇", 0], ["一", 1], ["二", 2], ["三", 3], ["四", 4], ["五", 5], ["六", 6], ["七", 7], ["八", 8], ["九", 9]]);
function cnToNum(s) {
  const t = String(s || "");
  if (!t) return NaN;
  if (t === "十") return 10;
  if (t.includes("十")) {
    const [a, b] = t.split("十");
    const tens = a ? (CN_NUM.get(a) || 0) : 1;
    const ones = b ? (CN_NUM.get(b) || 0) : 0;
    return tens * 10 + ones;
  }
  let out = 0;
  for (const ch of t) out = out * 10 + (CN_NUM.get(ch) || 0);
  return out;
}
function sortTokens(filePath) {
  let n = path.basename(filePath);
  n = n.replace(/第([零〇一二三四五六七八九十]+)(頁|页|題|题|回|張|张)?/g, (_, p1) => ` ${cnToNum(p1)} `);
  const nums = [...n.matchAll(/\d+/g)].map((m) => Number(m[0]));
  return nums;
}
function compareImageFile(a, b) {
  const aa = sortTokens(a);
  const bb = sortTokens(b);
  const len = Math.max(aa.length, bb.length);
  for (let i = 0; i < len; i += 1) {
    const av = aa[i];
    const bv = bb[i];
    if (av == null && bv == null) break;
    if (av == null) return -1;
    if (bv == null) return 1;
    if (av !== bv) return av - bv;
  }
  return path.basename(a).localeCompare(path.basename(b), "zh-Hant");
}
for (const [dir, list] of byDir.entries()) {
  const valid = list.filter((x) => !path.basename(x).startsWith("."));
  if (!valid.length) continue;
  const jpegs = valid.filter((x) => IMAGE_EXT.has(path.extname(x).toLowerCase())).sort(compareImageFile);
  if (jpegs.length < 2) continue;
  const out = path.join(dir, `${path.basename(dir)}_merged.pdf`);
  buildPdfFromJpegs(jpegs, out);
  merged.push(out);
}

files = walk(sourceDir).filter((abs) => {
  const ext = path.extname(abs).toLowerCase();
  if (path.basename(abs).startsWith(".")) return false;
  return ext === ".pdf" || ext === ".jpg" || ext === ".jpeg" || ext === ".jfif" || ext === ".png" || OFFICE_EXT.has(ext);
});

// If an office file already has a same-basename PDF, keep only the PDF.
files = files.filter((abs) => {
  const ext = path.extname(abs).toLowerCase();
  if (!OFFICE_EXT.has(ext)) return true;
  const pdf = path.join(path.dirname(abs), `${path.parse(abs).name}.pdf`);
  return !fs.existsSync(pdf);
});

const label = { mid1: "期中一", mid2: "期中二", mid3: "期中三", final: "期末" };
const grouped = new Map();

for (const abs of files) {
  const r = rel(abs);
  const year = extractYearAd(r);
  const prof = extractProfessor(r);
  const cat = normalizeCategoryByProfessor(categoryOf(r), r, prof);
  if (!year || !["mid1", "mid2", "mid3", "final"].includes(cat)) continue;
  const key = `${cat}||${prof}`;
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key).push({ rel: r, year });
}

function dedupeWithMerged(items) {
  const imageExt = new Set([".jpg", ".jpeg", ".jfif", ".png"]);
  const by = new Map();
  for (const it of items) {
    const d = path.posix.dirname(it.rel);
    if (!by.has(d)) by.set(d, []);
    by.get(d).push(it);
  }
  const out = [];
  for (const list of by.values()) {
    const hasAnyPdf = list.some((x) => /\.pdf$/i.test(path.posix.basename(x.rel)));
    for (const it of list) {
      const ext = path.extname(it.rel).toLowerCase();
      if (hasAnyPdf && imageExt.has(ext)) continue;
      out.push(it);
    }
  }
  return out;
}

function isAnswerFile(relPath) {
  const s = String(relPath || "").toLowerCase();
  return /(^|\/)ans(\/|$)|answer|answers|答案|解答/.test(s);
}

function naturalTokenCompare(a, b) {
  const aa = String(a).match(/\d+|[^\d]+/g) || [];
  const bb = String(b).match(/\d+|[^\d]+/g) || [];
  const n = Math.max(aa.length, bb.length);
  for (let i = 0; i < n; i += 1) {
    const av = aa[i];
    const bv = bb[i];
    if (av == null) return -1;
    if (bv == null) return 1;
    const an = /^\d+$/.test(av);
    const bn = /^\d+$/.test(bv);
    if (an && bn) {
      const da = Number(av);
      const db = Number(bv);
      if (da !== db) return da - db;
      continue;
    }
    const c = av.localeCompare(bv, "zh-Hant");
    if (c !== 0) return c;
  }
  return 0;
}

const now = new Date();
const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;

const posts = [];
for (const [key, raw] of grouped.entries()) {
  const [cat, prof] = key.split("||");
  const sortedBase = dedupeWithMerged(raw).sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    const aAns = isAnswerFile(a.rel) ? 1 : 0;
    const bAns = isAnswerFile(b.rel) ? 1 : 0;
    if (aAns !== bAns) return aAns - bAns; // same year: question first, answer after
    return naturalTokenCompare(path.posix.basename(a.rel), path.posix.basename(b.rel));
  });
  // Hard guarantee: for each year, non-answer files always come before answer files.
  const byYear = new Map();
  for (const it of sortedBase) {
    if (!byYear.has(it.year)) byYear.set(it.year, []);
    byYear.get(it.year).push(it);
  }
  const yearsDesc = [...byYear.keys()].sort((a, b) => b - a);
  const items = [];
  for (const y of yearsDesc) {
    const list = byYear.get(y);
    const q = list.filter((x) => !isAnswerFile(x.rel));
    const a = list.filter((x) => isAnswerFile(x.rel));
    items.push(...q, ...a);
  }
  const years = [...new Set(items.map((x) => x.year))].sort((a, b) => a - b);
  const yText = years.length ? (years[0] === years[years.length - 1] ? `${years[0]}` : `${years[0]}-${years[years.length - 1]}`) : "";
  posts.push({
    id: `organic1-auto-${cat}-item-${shortHash(prof)}-${stamp}`,
    status: "new",
    category: cat,
    department: "化學系",
    subject: "有機化學一",
    title: `【${label[cat]}】有機化學一${yText ? ` ${yText}` : ""}（${prof}）`,
    tags: ["有機化學一", label[cat], "自動整理"],
    author: prof,
    replies: 0,
    views: 0,
    createdAt: date,
    lastReplyAt: `${date} 00:00`,
    lastReplyBy: prof,
    attachments: items.map((x) => x.rel)
  });
}

posts.sort((a, b) => {
  const authorOrder = { "林俊成": 1, "陳建添": 2, "汪炳鈞": 3 };
  const catOrder = { mid1: 1, mid2: 2, mid3: 3, final: 4 };
  const ar = authorOrder[a.author] || 99;
  const br = authorOrder[b.author] || 99;
  if (ar !== br) return ar - br;
  const cr = catOrder[a.category] || 99;
  const dr = catOrder[b.category] || 99;
  if (cr !== dr) return cr - dr;
  const ay = Number((a.title.match(/(20\\d{2})(?!.*20\\d{2})/) || [0, 0])[1]);
  const by = Number((b.title.match(/(20\\d{2})(?!.*20\\d{2})/) || [0, 0])[1]);
  return by - ay;
});

let src = fs.readFileSync(dataPath, "utf8");
while (true) {
  const i = src.indexOf("\"id\": \"organic1-auto-");
  if (i < 0) break;
  let start = i;
  while (start >= 0 && src[start] !== "{") start -= 1;
  if (start < 0) break;
  let depth = 0;
  let end = i;
  for (; end < src.length; end += 1) {
    const ch = src[end];
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        end += 1;
        break;
      }
    }
  }
  while (end < src.length && /[\s,]/.test(src[end])) end += 1;
  src = src.slice(0, start) + src.slice(end);
}

const insert = posts.map((p) => JSON.stringify(p, null, 4)).join(",\n");
if (/\]\s*;\s*$/.test(src)) {
  src = src.replace(/\]\s*;\s*$/, `,\n${insert}\n];\n`);
} else {
  src = src.trimEnd().replace(/,?$/, "");
  src = `${src},\n${insert}\n];\n`;
}

fs.writeFileSync(dataPath, src, "utf8");

console.log(`Source: ${sourceDir}`);
console.log(`Office PDF created: ${convertedCreated}`);
console.log(`Office PDF already existed: ${convertedExisting}`);
console.log(`Merged image folders: ${merged.length}`);
console.log(`Generated posts: ${posts.length}`);
for (const p of posts) {
  console.log(`- ${p.id} | ${p.title} | attachments=${p.attachments.length}`);
}
