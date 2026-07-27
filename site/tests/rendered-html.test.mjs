import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { render, renderHtml } from "./helpers/render-worker.mjs";

const projectRoot = new URL("../", import.meta.url);

test("server-renders the Russian Planovo homepage", async () => {
  const { response, html } = await renderHtml("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  assert.match(html, /<html[^>]*\blang="ru"/i);
  assert.match(
    html,
    /<title>Planovo — управление расписанием для частных колледжей и школ<\/title>/i,
  );
  assert.match(html, /Одна правка/);
  assert.match(html, /Актуальное расписание/);
  assert.match(html, /Planovo уже создаётся на реальном процессе частного колледжа/);
  assert.match(html, /Демонстрационный сценарий/);
  assert.match(html, /<main\b/i);
  assert.match(html, /Перейти к содержанию/);
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1);
  assert.equal((html.match(/<main\b/gi) ?? []).length, 1);
  assert.match(
    html,
    /<link[^>]*rel="canonical"[^>]*href="https:\/\/planovo\.pro\/"/i,
  );
  assert.match(
    html,
    /property="og:image"[^>]*content="https:\/\/planovo\.pro\/og\.png"/i,
  );
  assert.match(html, /name="twitter:card"[^>]*content="summary_large_image"/i);
  assert.doesNotMatch(html, /planovo\.app/i);

  const jsonLd = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/i,
  );
  assert.ok(jsonLd, "homepage must contain JSON-LD");
  const graph = JSON.parse(jsonLd[1]);
  assert.equal(graph["@context"], "https://schema.org");
  assert.match(JSON.stringify(graph), /https:\/\/planovo\.pro\//);

  assert.doesNotMatch(html, /codex-preview|Building your site|Starter Project/i);
  assert.doesNotMatch(html, /react-loading-skeleton/i);
  assert.doesNotMatch(html, /<form\b/i);
  assert.doesNotMatch(
    html,
    /<link\b[^>]*\brel="preload"[^>]*\bas="font"/i,
    "font subsets must load on demand instead of all being globally preloaded",
  );
});

test("serves robots and sitemap metadata routes", async () => {
  const [robotsResponse, sitemapResponse] = await Promise.all([
    render("/robots.txt"),
    render("/sitemap.xml"),
  ]);

  assert.equal(robotsResponse.status, 200);
  assert.equal(sitemapResponse.status, 200);

  const [robots, sitemap] = await Promise.all([
    robotsResponse.text(),
    sitemapResponse.text(),
  ]);

  assert.match(robots, /User-Agent:\s*\*/i);
  assert.match(robots, /Disallow:\s*\/api\//i);
  assert.match(robots, /Disallow:\s*\/kems\//i);
  assert.match(robots, /Sitemap:\s*https:\/\/planovo\.pro\/sitemap\.xml/i);
  assert.match(sitemap, /<loc>https:\/\/planovo\.pro\/<\/loc>/i);
  assert.match(sitemap, /<loc>https:\/\/planovo\.pro\/schedule<\/loc>/i);
  assert.match(sitemap, /<loc>https:\/\/planovo\.pro\/case\/kems<\/loc>/i);
  assert.doesNotMatch(sitemap, /\/privacy|\/consent-pdn|\/cookies/i);
  assert.doesNotMatch(`${robots}\n${sitemap}`, /planovo\.app/i);
});

test("keeps required static assets and excludes preview scaffolding", async () => {
  await assert.rejects(access(new URL("../app/_sites-preview/", import.meta.url)));
  await access(new URL("../public/favicon.svg", import.meta.url));
  await access(new URL("../public/planovo-mark.svg", import.meta.url));
  await access(projectRoot);
});
