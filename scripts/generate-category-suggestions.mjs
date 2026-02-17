#!/usr/bin/env node
import fs from "fs";
import path from "path";
import vm from "vm";
import { spawnSync } from "child_process";

const root = "/Applications/codes/chemwebsite";
const dataPath = path.join(root, "src", "data.js");
const outDir = path.join(root, "reports");
const outCsv = path.join(outDir, "exam_category_suggestions.csv");

const sandbox = { window: {} };
const dataCode = fs.readFileSync(dataPath, "utf8");
vm.runInNewContext(dataCode, sandbox);
const posts = Array.isArray(sandbox.window.POSTS) ? sandbox.window.POSTS : [];

function canonicalKey(p) {
  return String(p || "")
    .replace(/^\.\/+/, "")
    .replace(/^\.\.\/+/, "")
    .replace(/\\/g, "/");
}

function resolveAbs(p) {
  return path.join(root, canonicalKey(p));
}

function readPdfText(absPath) {
  if (!/\.pdf$/i.test(absPath) || !fs.existsSync(absPath)) return "";
  const out = spawnSync("strings", ["-n", "4", absPath], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024
  });
  if (out.status !== 0) return "";
  return String(out.stdout || "").toLowerCase();
}

function scoreFromText(text) {
  const score = { mid1: 0, mid2: 0, final: 0 };
  const add = (k, n) => { score[k] += n; };

  const t = String(text || "").toLowerCase();

  // final
  if (/\bfinal\b/.test(t)) add("final", 8);
  if (/final exam/.test(t)) add("final", 10);
  if (/期末/.test(t)) add("final", 10);

  // mid1
  if (/midterm\s*1/.test(t)) add("mid1", 12);
  if (/mid\s*1/.test(t)) add("mid1", 10);
  if (/first\s*midterm/.test(t)) add("mid1", 12);
  if (/期中一/.test(t)) add("mid1", 12);
  if (/first/.test(t)) add("mid1", 3);

  // mid2
  if (/midterm\s*2/.test(t)) add("mid2", 12);
  if (/mid\s*2/.test(t)) add("mid2", 10);
  if (/second\s*midterm/.test(t)) add("mid2", 12);
  if (/期中二/.test(t)) add("mid2", 12);
  if (/second/.test(t)) add("mid2", 3);

  return score;
}

function suggestCategory(filePath, sampleText) {
  const score = { mid1: 0, mid2: 0, final: 0 };
  const key = canonicalKey(filePath).toLowerCase();
  const txt = String(sampleText || "");

  // filename/path signals
  if (/\bfinal\b|\/final\//.test(key)) score.final += 14;
  if (/midterm1|mid_?1|\/mid1\//.test(key)) score.mid1 += 14;
  if (/midterm2|mid_?2|\/mid2\//.test(key)) score.mid2 += 14;
  if (/first/.test(key)) score.mid1 += 6;
  if (/second/.test(key)) score.mid2 += 6;

  // text signals
  const st = scoreFromText(txt);
  score.mid1 += st.mid1;
  score.mid2 += st.mid2;
  score.final += st.final;

  const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const [bestKey, bestScore] = ranked[0];
  const secondScore = ranked[1][1];
  const confidence = Math.max(0, bestScore - secondScore);

  if (bestScore <= 0) {
    return { suggested: "unknown", confidence: 0, score };
  }
  if (confidence < 4) {
    return { suggested: "unknown", confidence, score };
  }
  return { suggested: bestKey, confidence, score };
}

function csvEscape(v) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const rows = [];
for (const post of posts) {
  const raw = Array.isArray(post.attachments)
    ? post.attachments
    : (typeof post.attachment === "string" && post.attachment.trim() ? [post.attachment] : []);
  for (const p of raw) {
    const rel = canonicalKey(p);
    const abs = resolveAbs(rel);
    const text = readPdfText(abs);
    const { suggested, confidence, score } = suggestCategory(rel, text);
    rows.push({
      post_id: post.id || "",
      post_title: post.title || "",
      current_category: post.category || "",
      attachment: rel,
      suggested_category: suggested,
      confidence,
      score_mid1: score.mid1,
      score_mid2: score.mid2,
      score_final: score.final
    });
  }
}

rows.sort((a, b) => {
  if (a.post_id !== b.post_id) return a.post_id.localeCompare(b.post_id, "en");
  return a.attachment.localeCompare(b.attachment, "en");
});

fs.mkdirSync(outDir, { recursive: true });
const header = [
  "post_id",
  "post_title",
  "current_category",
  "attachment",
  "suggested_category",
  "confidence",
  "score_mid1",
  "score_mid2",
  "score_final"
];

const stats = rows.reduce((acc, r) => {
  acc[r.suggested_category] = (acc[r.suggested_category] || 0) + 1;
  return acc;
}, {});

const csv = [
  header.join(","),
  ...rows.map((r) => header.map((k) => csvEscape(r[k])).join(",")),
  "",
  "最後結果,數量",
  `mid1,${stats.mid1 || 0}`,
  `mid2,${stats.mid2 || 0}`,
  `final,${stats.final || 0}`,
  `unknown,${stats.unknown || 0}`,
  `total,${rows.length}`
].join("\n") + "\n";

fs.writeFileSync(outCsv, csv, "utf8");

console.log(`Generated: ${outCsv}`);
console.log(`Rows: ${rows.length}`);
console.log("Suggested counts:", stats);
