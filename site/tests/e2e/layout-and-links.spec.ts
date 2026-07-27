import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

const productPageTargets = [
  { path: "/schedule", width: 390, height: 844 },
  { path: "/schedule", width: 1440, height: 900 },
  { path: "/case/kems", width: 390, height: 844 },
  { path: "/case/kems", width: 1440, height: 900 },
];

async function inspectHorizontalOverflow(page: Page) {
  await page.evaluate(() => document.fonts.ready);

  return page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          rect.width === 0 ||
          rect.height === 0 ||
          element.dataset.qaOverflow === "intentional"
        ) {
          return false;
        }

        return rect.right > viewportWidth + 1 || rect.left < -1;
      })
      .slice(0, 12)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id,
          className:
            typeof element.className === "string"
              ? element.className
              : element.getAttribute("class") ?? "",
          left: Math.round(rect.left * 10) / 10,
          right: Math.round(rect.right * 10) / 10,
          width: Math.round(rect.width * 10) / 10,
        };
      });

    return {
      viewportWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      offenders,
    };
  });
}

for (const viewport of viewports) {
  test(`homepage stays inside ${viewport.width}px viewport`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const overflow = await inspectHorizontalOverflow(page);

    expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewportWidth + 1);
    expect(overflow.bodyWidth).toBeLessThanOrEqual(overflow.viewportWidth + 1);
    expect(overflow.offenders).toEqual([]);
  });
}

for (const target of productPageTargets) {
  test(`${target.path} stays inside ${target.width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width: target.width, height: target.height });
    await page.goto(target.path);
    await expect(page.locator("main")).toBeVisible();

    const overflow = await inspectHorizontalOverflow(page);
    expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewportWidth + 1);
    expect(overflow.bodyWidth).toBeLessThanOrEqual(overflow.viewportWidth + 1);
    expect(overflow.offenders).toEqual([]);
  });
}

test("mobile first viewport contains conversion and product evidence", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const primary = page.getByRole("link", { name: "Обсудить пилот" }).first();
  await expect(primary).toBeVisible();

  const productTop = await page.locator(".hero-product").evaluate((element) => {
    return element.getBoundingClientRect().top;
  });
  expect(productTop).toBeLessThan(900);
});

test("hash navigation applies the sticky-header offset only once", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844, expectedTop: 76 },
    { width: 1440, height: 900, expectedTop: 88 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/#workflow");

    await expect
      .poll(async () =>
        page.locator("#workflow").evaluate((element) => {
          return Math.round(element.getBoundingClientRect().top);
        }),
      )
      .toBe(viewport.expectedTop);
  }
});

test("unknown routes render a branded recovery page", async ({ page }) => {
  const response = await page.goto("/definitely-not-a-planovo-route");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: /Такой страницы нет/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "На главную", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Посмотреть сценарий" }),
  ).toBeVisible();
});

test("all same-origin navigation links return a non-error response", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const hrefs = await page.locator("a[href]").evaluateAll((links) =>
    links
      .map((link) => (link as HTMLAnchorElement).href)
      .filter((href) => new URL(href).origin === location.origin),
  );

  for (const href of new Set(hrefs)) {
    const response = await request.get(href);
    expect(response.status(), href).toBeLessThan(400);
  }
});
