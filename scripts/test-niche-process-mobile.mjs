import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync } from "fs";
import { dirname, join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
};

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let path = decodeURIComponent(req.url.split("?")[0]);
      if (path.startsWith("/Planovo/")) path = path.slice("/Planovo".length);
      if (path === "/") path = "/index.html";
      const file = join(ROOT, path.replace(/^\//, ""));
      if (!existsSync(file)) {
        res.writeHead(404);
        res.end("404");
        return;
      }
      res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
      res.end(readFileSync(file));
    });
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

const { server, port } = await startServer();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

try {
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.setItem("planovo_cookie_consent", JSON.stringify({ version: 1 }));
    document.getElementById("planovoCookieBanner")?.remove();
  });
  await page.evaluate(() => document.querySelector("#niches")?.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(3000);

  const titles = [];
  for (let i = 0; i < 3; i++) {
    const t = await page.evaluate(() => {
      const card = document.querySelector(".niche-card.is-niche-active") || document.querySelector(".niche-card[aria-hidden='false']");
      return card?.querySelector("h3")?.textContent?.trim() || null;
    });
    titles.push(t);
    if (i < 2) {
      await page.evaluate(() => document.querySelector(".niches-carousel-next")?.click());
    }
    await page.waitForTimeout(450);
  }

  console.log("Carousel titles:", titles);

  const unique = new Set(titles.filter(Boolean));
  if (unique.size < 3) {
    console.error("FAIL: carousel did not show 3 different cards");
    process.exitCode = 1;
  }

  await page.evaluate(() => document.querySelector("#how-it-works")?.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(300);

  const p0 = await page.evaluate(() => {
    const line = document.querySelector(".process-path-line");
    return {
      dash: line?.style?.strokeDashoffset,
      len: line ? line.getTotalLength() : 0,
    };
  });

  await page.evaluate(() => window.scrollBy(0, 280));
  await page.waitForTimeout(400);

  const p1 = await page.evaluate(() => document.querySelector(".process-path-line")?.style?.strokeDashoffset);

  console.log("Process dash offset start:", p0.dash, "after scroll:", p1);

  if (p0.len > 0 && p0.dash === p1) {
    console.error("FAIL: process line did not animate on scroll");
    process.exitCode = 1;
  }
} finally {
  await browser.close();
  server.close();
}
