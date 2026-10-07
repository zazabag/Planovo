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

// Новый сайт (site/) кладётся в корень пакета как есть.
const SITE_DIR = "site";

// Юридические страницы остались от прежнего сайта и пока рисуются его оформлением.
// Копируем только то, что им нужно, чтобы со старого сайта в пакет не попадало лишнего.
const LEGAL_PATHS = [
  "privacy.html",
  "cookies.html",
  "consent-pdn.html",
  "logo.png",
  "assets/site-legal.css",
  "assets/site-legal.js",
  "assets/site-mobile.css",
  "_next/static/chunks",
  "_next/static/media",
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

  const siteSrc = path.join(ROOT, SITE_DIR);
  if (!fs.existsSync(path.join(siteSrc, "index.html"))) {
    throw new Error("Нет site/index.html — нечего собирать");
  }
  copyEntry(siteSrc, OUT);
  console.log("  copied: site/ → корень");

  for (const rel of LEGAL_PATHS) {
    const src = path.join(ROOT, rel);
    if (!fs.existsSync(src)) {
      throw new Error(`Не найден файл юридических страниц: ${rel}`);
    }
    copyEntry(src, path.join(OUT, rel));
    console.log("  copied:", rel);
  }

  // Юридические страницы запрашивают значок с корня.
  fs.copyFileSync(path.join(OUT, "assets", "favicon-32.png"), path.join(OUT, "favicon-32.png"));

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
