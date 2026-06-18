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
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
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
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

const { server, port } = await startServer();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

try {
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.querySelector("#how-it-works")?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(4000);

  const state = await page.evaluate(() => {
    const wrap = document.querySelector(".process-timeline-wrap");
    const track = document.querySelector(".process-path-track");
    const line = document.querySelector(".process-path-line");
    return {
      processReady: document.querySelector(".how-it-works")?.dataset?.processReady,
      hasWrap: !!wrap,
      wrapH: wrap ? wrap.getBoundingClientRect().height : 0,
      trackD: track?.getAttribute("d") || "",
      pathLength: line ? line.getTotalLength() : 0,
    };
  });

  console.log(JSON.stringify(state, null, 2));

  if (!state.hasWrap || state.pathLength <= 0 || !state.trackD) {
    console.error("FAIL: process SVG not initialized on mobile");
    process.exitCode = 1;
  }
} finally {
  await browser.close();
  server.close();
}
