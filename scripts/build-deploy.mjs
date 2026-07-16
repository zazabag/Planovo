/**
 * Build static site for planovo.pro (root domain, no /Planovo/ prefix).
 * Output: dist/planovo-pro/
 *
 * Usage: node scripts/build-deploy.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "dist", "planovo-pro");

const COPY_PATHS = [
  "index.html",
  "404.html",
  "education.html",
  "education.demo.js",
  "privacy.html",
  "cookies.html",
  "consent-pdn.html",
  "logo.png",
  "logo.svg",
  "logo-icon.svg",
  "favicon-32.png",
  "favicon.ico",
  "assets",
  "_next",
  "404",
];

const TEXT_EXT = new Set([
  ".html",
  ".js",
  ".css",
  ".json",
  ".svg",
  ".txt",
  ".xml",
  ".htaccess",
]);

const REWRITE_FROM = "/Planovo/";

function rmDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) rmDir(p);
    else fs.unlinkSync(p);
  }
  fs.rmdirSync(dir);
}

function copyEntry(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyEntry(path.join(src, name), path.join(dest, name));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function rewriteTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath);
  if (!TEXT_EXT.has(ext) && base !== ".htaccess") return;
  let text = fs.readFileSync(filePath, "utf8");
  if (!text.includes(REWRITE_FROM)) return;
  text = text.split(REWRITE_FROM).join("/");
  fs.writeFileSync(filePath, text, "utf8");
}

function walkRewrite(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkRewrite(p);
    else rewriteTextFile(p);
  }
}

const htaccess = `# Planovo — planovo.pro (Reg.ru)
DirectoryIndex index.html

# HTTPS redirect handled by Reg.ru nginx — do not force here (causes loop)

ErrorDocument 404 /404.html
`;

function main() {
  console.log("Building deploy package for planovo.pro …");
  rmDir(OUT);
  fs.mkdirSync(OUT, { recursive: true });

  for (const rel of COPY_PATHS) {
    const src = path.join(ROOT, rel);
    if (!fs.existsSync(src)) {
      console.warn("  skip (missing):", rel);
      continue;
    }
    copyEntry(src, path.join(OUT, rel));
    console.log("  copied:", rel);
  }

  fs.writeFileSync(path.join(OUT, ".htaccess"), htaccess, "utf8");
  console.log("  wrote: .htaccess");

  walkRewrite(OUT);

  const files = [];
  function countFiles(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) countFiles(p);
      else files.push(p);
    }
  }
  countFiles(OUT);

  console.log(`\nDone: ${OUT}`);
  console.log(`Files: ${files.length}`);
}

main();
