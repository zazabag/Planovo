import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { extname } from "node:path";
import test from "node:test";
import { gzipSync } from "node:zlib";

const clientAssets = new URL("../dist/client/assets/", import.meta.url);
const publicFonts = new URL("../public/fonts/", import.meta.url);

const budgets = {
  clientJavaScript: {
    raw: 460 * 1024,
    gzip: 160 * 1024,
  },
  clientCss: {
    raw: 96 * 1024,
    gzip: 24 * 1024,
  },
  largestJavaScriptChunk: {
    raw: 220 * 1024,
    gzip: 70 * 1024,
  },
  publicAssets: {
    "og.png": 256 * 1024,
    "planovo-mark.svg": 8 * 1024,
    "favicon.svg": 8 * 1024,
  },
};

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const url = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(url)));
    } else {
      files.push(url);
    }
  }

  return files;
}

async function measureFiles(files) {
  const measurements = [];

  for (const url of files) {
    const buffer = await readFile(url);
    measurements.push({
      name: decodeURIComponent(url.pathname.split("/").at(-1)),
      raw: buffer.byteLength,
      gzip: gzipSync(buffer).byteLength,
    });
  }

  return measurements;
}

function sum(measurements, field) {
  return measurements.reduce((total, measurement) => total + measurement[field], 0);
}

test("keeps emitted client JavaScript and CSS inside release budgets", async (t) => {
  const files = await collectFiles(clientAssets);
  const js = await measureFiles(files.filter((url) => extname(url.pathname) === ".js"));
  const css = await measureFiles(files.filter((url) => extname(url.pathname) === ".css"));

  assert.ok(js.length > 0, "production build must emit client JavaScript");
  assert.ok(css.length > 0, "production build must emit client CSS");

  const totals = {
    jsRaw: sum(js, "raw"),
    jsGzip: sum(js, "gzip"),
    cssRaw: sum(css, "raw"),
    cssGzip: sum(css, "gzip"),
  };
  const largestJs = js.toSorted((left, right) => right.gzip - left.gzip)[0];

  t.diagnostic(
    [
      `client JS: ${formatBytes(totals.jsRaw)} raw / ${formatBytes(totals.jsGzip)} gzip`,
      `client CSS: ${formatBytes(totals.cssRaw)} raw / ${formatBytes(totals.cssGzip)} gzip`,
      `largest JS chunk: ${largestJs.name} — ${formatBytes(largestJs.raw)} raw / ${formatBytes(largestJs.gzip)} gzip`,
    ].join("; "),
  );

  assert.ok(
    totals.jsRaw <= budgets.clientJavaScript.raw,
    `client JS raw ${formatBytes(totals.jsRaw)} exceeds ${formatBytes(budgets.clientJavaScript.raw)}`,
  );
  assert.ok(
    totals.jsGzip <= budgets.clientJavaScript.gzip,
    `client JS gzip ${formatBytes(totals.jsGzip)} exceeds ${formatBytes(budgets.clientJavaScript.gzip)}`,
  );
  assert.ok(
    totals.cssRaw <= budgets.clientCss.raw,
    `client CSS raw ${formatBytes(totals.cssRaw)} exceeds ${formatBytes(budgets.clientCss.raw)}`,
  );
  assert.ok(
    totals.cssGzip <= budgets.clientCss.gzip,
    `client CSS gzip ${formatBytes(totals.cssGzip)} exceeds ${formatBytes(budgets.clientCss.gzip)}`,
  );
  assert.ok(
    largestJs.raw <= budgets.largestJavaScriptChunk.raw,
    `${largestJs.name} raw ${formatBytes(largestJs.raw)} exceeds ${formatBytes(budgets.largestJavaScriptChunk.raw)}`,
  );
  assert.ok(
    largestJs.gzip <= budgets.largestJavaScriptChunk.gzip,
    `${largestJs.name} gzip ${formatBytes(largestJs.gzip)} exceeds ${formatBytes(budgets.largestJavaScriptChunk.gzip)}`,
  );
});

test("keeps social and brand assets inside release budgets", async (t) => {
  for (const [filename, maximumBytes] of Object.entries(budgets.publicAssets)) {
    const buffer = await readFile(new URL(`../public/${filename}`, import.meta.url));
    t.diagnostic(`${filename}: ${formatBytes(buffer.byteLength)}`);
    assert.ok(
      buffer.byteLength <= maximumBytes,
      `${filename} ${formatBytes(buffer.byteLength)} exceeds ${formatBytes(maximumBytes)}`,
    );
  }
});

test("keeps the self-hosted font payload focused", async (t) => {
  const expectedFonts = [
    "ibm-plex-mono-cyrillic-500.woff2",
    "ibm-plex-mono-latin-500.woff2",
    "onest-cyrillic.woff2",
    "onest-latin.woff2",
  ];
  const fontFiles = (await readdir(publicFonts))
    .filter((filename) => filename.endsWith(".woff2"))
    .toSorted();

  assert.deepEqual(
    fontFiles,
    expectedFonts,
    "font set must stay limited to the Cyrillic and Latin faces in use",
  );

  const measurements = await measureFiles(
    fontFiles.map((filename) => new URL(filename, publicFonts)),
  );
  const totalRaw = sum(measurements, "raw");
  t.diagnostic(
    `self-hosted fonts: ${fontFiles.length} files / ${formatBytes(totalRaw)} raw`,
  );
  assert.ok(
    totalRaw <= 70 * 1024,
    `font payload ${formatBytes(totalRaw)} exceeds 70.0 KiB`,
  );
});
