import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const baseURL = process.env.PLANOVO_QA_URL ?? "http://127.0.0.1:43118";
const outputDirectory =
  process.env.PLANOVO_QA_OUTPUT ?? "/private/tmp/planovo-redesign-qa";

const captures = [
  { name: "home-desktop", path: "/", width: 1440, height: 900 },
  { name: "home-mobile", path: "/", width: 390, height: 844 },
  { name: "schedule-desktop", path: "/schedule", width: 1440, height: 900 },
  { name: "schedule-mobile", path: "/schedule", width: 390, height: 844 },
  { name: "case-desktop", path: "/case/kems", width: 1440, height: 900 },
  { name: "case-mobile", path: "/case/kems", width: 390, height: 844 },
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch();

for (const capture of captures) {
  const page = await browser.newPage({
    viewport: { width: capture.width, height: capture.height },
    deviceScaleFactor: 1,
  });
  await page.goto(`${baseURL}${capture.path}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  await page.screenshot({
    path: `${outputDirectory}/${capture.name}-top.png`,
    animations: "disabled",
  });
  await page.screenshot({
    path: `${outputDirectory}/${capture.name}-full.png`,
    animations: "disabled",
    fullPage: true,
  });

  const metrics = await page.evaluate(() => ({
    title: document.title,
    height: document.documentElement.scrollHeight,
    width: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  process.stdout.write(`${capture.name} ${JSON.stringify(metrics)}\n`);
  await page.close();
}

await browser.close();
