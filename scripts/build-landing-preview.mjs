/**
 * Builds index-preview.html — local copy of landing with review-preview patches.
 * Run: node scripts/build-landing-preview.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "index.html");
const out = path.join(root, "index-preview.html");

let html = fs.readFileSync(src, "utf8");

/* Local paths — works with `npx serve .` or python -m http.server */
html = html.replace(/\/Planovo\//g, "./");

/* Mark preview mode before React loads */
html = html.replace("<html lang=\"ru\">", '<html lang="ru" class="landing-preview-root">');

/* Preview assets */
const previewAssets =
  '<link rel="stylesheet" href="./assets/landing-review-preview.css"/>' +
  '<script src="./assets/landing-review-preview.js" defer></script>';

if (!html.includes("landing-review-preview.css")) {
  html = html.replace(
    /landing-mockup\.css"\/>/,
    'landing-mockup.css"/>' + previewAssets
  );
  if (!html.includes("landing-review-preview.css")) {
    html = html.replace(
      /problem-aura\.css"\/>/,
      'problem-aura.css"/>' + previewAssets
    );
  }
}

fs.writeFileSync(out, html, "utf8");
console.log("Wrote", out);
console.log("Open: npx serve .  →  http://localhost:3000/index-preview.html");
