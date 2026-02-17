#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const args = process.argv.slice(2);
const targetDir = path.resolve(args.find((x) => !x.startsWith("--")) || process.cwd());
const apply = args.includes("--apply");

const MIME_TO_EXT = new Map([
  ["application/pdf", "pdf"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/gif", "gif"],
  ["image/webp", "webp"],
  ["image/heic", "heic"],
  ["image/heif", "heif"],
  ["text/plain", "txt"],
  ["application/zip", "zip"],
  ["application/x-7z-compressed", "7z"],
  ["application/vnd.rar", "rar"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
  ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"]
]);

function detectMime(absPath) {
  const r = spawnSync("file", ["-b", "--mime-type", absPath], { encoding: "utf8" });
  if (r.status !== 0) return "";
  return String(r.stdout || "").trim().toLowerCase();
}

function cleanBaseName(base) {
  return base
    .replace(/[「」『』【】]/g, "")
    .replace(/\s*複本\s*$/i, "")
    .replace(/\s*\((copy|複本)\)\s*$/i, "")
    .replace(/\s+copy\s*$/i, "")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/\s+/g, " ")
    .replace(/_+/g, "_")
    .trim();
}

function extractEmbeddedExt(name) {
  const m = name.match(/\.(pdf|jfif|jpe?g|png|gif|webp|heic|heif|docx|pptx|xlsx|txt|zip|rar|7z)\b/i);
  return m ? m[1].toLowerCase() : "";
}

function desiredExt(currentExt, embeddedExt, mimeExt) {
  if (mimeExt) return mimeExt;
  if (embeddedExt) return embeddedExt === "jpeg" ? "jpg" : embeddedExt;
  if (currentExt) return currentExt.toLowerCase();
  return "";
}

function uniquePath(dir, base, ext, current = "") {
  let candidate = path.join(dir, `${base}${ext ? "." + ext : ""}`);
  if (!fs.existsSync(candidate) || candidate === current) return candidate;
  let i = 2;
  while (true) {
    candidate = path.join(dir, `${base}_${i}${ext ? "." + ext : ""}`);
    if (!fs.existsSync(candidate) || candidate === current) return candidate;
    i += 1;
  }
}

function* walk(dir) {
  const ents = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of ents) {
    if (ent.name === ".git") continue;
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) yield* walk(abs);
    else if (ent.isFile()) yield abs;
  }
}

const changes = [];
for (const abs of walk(targetDir)) {
  const dir = path.dirname(abs);
  const fileName = path.basename(abs);
  const parsed = path.parse(fileName);
  const currentExt = parsed.ext.replace(/^\./, "").toLowerCase();
  const embeddedExt = extractEmbeddedExt(parsed.name);
  const mime = detectMime(abs);
  const mimeExt = MIME_TO_EXT.get(mime) || "";

  const ext = desiredExt(currentExt, embeddedExt, mimeExt);
  let base = cleanBaseName(parsed.name);

  if (embeddedExt) {
    const reg = new RegExp(`\\.${embeddedExt}\\b`, "ig");
    base = base.replace(reg, "").trim();
  }
  if (!base) base = "file";

  const next = uniquePath(dir, base, ext, abs);
  if (next !== abs) {
    changes.push({ from: abs, to: next, mime: mime || "unknown" });
  }
}

if (!changes.length) {
  console.log("No rename needed.");
  process.exit(0);
}

console.log(`${apply ? "Applying" : "Dry-run"}: ${changes.length} rename(s)\n`);
for (const c of changes) {
  console.log(`${c.from} -> ${c.to}  [${c.mime}]`);
}

if (!apply) {
  console.log("\nRun with --apply to execute renames.");
  process.exit(0);
}

for (const c of changes) {
  fs.renameSync(c.from, c.to);
}
console.log("\nDone.");
