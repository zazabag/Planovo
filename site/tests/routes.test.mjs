import assert from "node:assert/strict";
import test from "node:test";
import { render, renderHtml } from "./helpers/render-worker.mjs";

const pageRoutes = [
  ["/", "https://planovo.pro/"],
  ["/schedule", "https://planovo.pro/schedule"],
  ["/case/kems", "https://planovo.pro/case/kems"],
  ["/privacy", "https://planovo.pro/privacy"],
  ["/consent-pdn", "https://planovo.pro/consent-pdn"],
  ["/cookies", "https://planovo.pro/cookies"],
];

const redirectRoutes = [
  ["/personal-data", "/consent-pdn"],
  ["/privacy.html", "/privacy"],
  ["/consent-pdn.html", "/consent-pdn"],
  ["/cookies.html", "/cookies"],
];

const marketingRoutes = [
  ["/", "https://planovo.pro/"],
  ["/schedule", "https://planovo.pro/schedule"],
  ["/case/kems", "https://planovo.pro/case/kems"],
];

const legalRoutes = ["/privacy", "/consent-pdn", "/cookies"];
const reservedProxyPrefixes = ["/api/", "/kems/"];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractMetaContent(html, attribute, value) {
  const tag = html.match(
    new RegExp(
      `<meta\\b[^>]*\\b${attribute}="${escapeRegex(value)}"[^>]*>`,
      "i",
    ),
  )?.[0];
  assert.ok(tag, `missing meta ${attribute}="${value}"`);
  const content = tag.match(/\bcontent="([^"]*)"/i)?.[1];
  assert.ok(content, `meta ${attribute}="${value}" must have content`);
  return content;
}

for (const [pathname, canonical] of pageRoutes) {
  test(`renders ${pathname} with one main, h1 and canonical`, async () => {
    const { response, html } = await renderHtml(pathname);
    assert.equal(response.status, 200);
    assert.equal((html.match(/<h1\b/gi) ?? []).length, 1);
    assert.equal((html.match(/<main\b/gi) ?? []).length, 1);
    assert.match(html, new RegExp(`href="${canonical.replaceAll("/", "\\/")}"`));
    assert.doesNotMatch(html, /planovo\.app/i);
  });
}

for (const [pathname, destination] of redirectRoutes) {
  test(`permanently redirects ${pathname} to ${destination}`, async () => {
    const response = await render(pathname);
    assert.equal(response.status, 308);
    const location = response.headers.get("location");
    assert.ok(location, `${pathname} must return a Location header`);
    assert.equal(new URL(location).pathname, destination);
  });
}

test("product pages expose unique complete metadata", async () => {
  const titles = new Set();

  for (const [pathname, canonical] of marketingRoutes) {
    const { html } = await renderHtml(pathname);
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
    assert.ok(title, `${pathname} must have a title`);
    assert.ok(title.length >= 35, `${pathname} title is too generic`);
    assert.ok(!titles.has(title), `${pathname} title must be unique`);
    titles.add(title);

    const description = extractMetaContent(html, "name", "description");
    assert.ok(
      description.length >= 70,
      `${pathname} description must explain the page`,
    );
    assert.equal(extractMetaContent(html, "property", "og:url"), canonical);
    assert.equal(
      extractMetaContent(html, "property", "og:image"),
      "https://planovo.pro/og.png",
    );
    assert.equal(
      extractMetaContent(html, "name", "twitter:card"),
      "summary_large_image",
    );
    assert.equal(
      extractMetaContent(html, "name", "twitter:image"),
      "https://planovo.pro/og.png",
    );
  }
});

test("legal documents stay out of search results", async () => {
  for (const pathname of legalRoutes) {
    const { html } = await renderHtml(pathname);
    assert.match(
      extractMetaContent(html, "name", "robots"),
      /\bnoindex\b/i,
      `${pathname} must be noindex`,
    );
  }
});

test("all root-relative page links resolve and hash targets exist", async () => {
  const rendered = new Map();

  for (const [pathname] of pageRoutes) {
    const { html } = await renderHtml(pathname);
    rendered.set(pathname, html);
  }

  const links = [];
  for (const [sourcePath, html] of rendered) {
    for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>/gi)) {
      links.push({ sourcePath, href: match[1] });
    }

    for (const match of html.matchAll(/<a\b([^>]*\btarget="_blank"[^>]*)>/gi)) {
      assert.match(match[1], /\brel="[^"]*(?:noreferrer|noopener)[^"]*"/i);
    }
  }

  const checked = new Set();
  for (const { sourcePath, href } of links) {
    const url = new URL(href, `https://planovo.pro${sourcePath}`);
    if (!["http:", "https:"].includes(url.protocol)) continue;
    if (url.origin !== "https://planovo.pro") continue;
    if (reservedProxyPrefixes.some((prefix) => url.pathname.startsWith(prefix))) {
      continue;
    }

    const cacheKey = `${url.pathname}${url.hash}`;
    if (checked.has(cacheKey)) continue;
    checked.add(cacheKey);

    const pathname = url.pathname;
    const cachedHtml = rendered.get(pathname);
    const result = cachedHtml
      ? { response: { status: 200 }, html: cachedHtml }
      : await renderHtml(pathname);
    const { response, html } = result;
    assert.equal(response.status, 200, `${href} must resolve`);
    if (url.hash) {
      const id = decodeURIComponent(url.hash.slice(1));
      assert.match(
        html,
        new RegExp(`\\bid="${escapeRegex(id)}"`),
        `${sourcePath} → ${href} must target an existing id`,
      );
    }
  }
});

test("returns a real 404 for an unknown local route", async () => {
  const response = await render("/definitely-not-a-planovo-route");
  assert.equal(response.status, 404);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Такой страницы нет/i);
  assert.match(html, /href="\/schedule#scenario"/i);
  assert.match(extractMetaContent(html, "name", "robots"), /\bnoindex\b/i);
});
