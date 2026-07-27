import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const auditTargets = [
  { path: "/", width: 390, height: 844 },
  { path: "/", width: 1440, height: 900 },
  { path: "/schedule", width: 390, height: 844 },
  { path: "/schedule", width: 1440, height: 900 },
  { path: "/case/kems", width: 390, height: 844 },
  { path: "/case/kems", width: 1440, height: 900 },
  { path: "/privacy", width: 390, height: 844 },
];

for (const target of auditTargets) {
  test(`${target.path} has no automatic WCAG A/AA violations at ${target.width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: target.width, height: target.height });
    await page.goto(target.path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("skip link and mobile dialog keep keyboard focus predictable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();

  const trigger = page.getByRole("button", { name: "Открыть меню" });
  await trigger.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: "Навигация" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS("overscroll-behavior-y", "contain");

  const dialogResults = await new AxeBuilder({ page })
    .include("#mobile-menu")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(dialogResults.violations).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("visible homepage controls meet the mobile target minimum", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const undersized = await page.evaluate(() => {
    return [
      ...document.querySelectorAll<HTMLElement>(
        "a, button, summary, input, select, textarea",
      ),
    ]
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          rect.width > 0 &&
          rect.height > 0 &&
          element.getAttribute("aria-hidden") !== "true" &&
          !element.classList.contains("skip-link")
        );
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          label:
            element.getAttribute("aria-label") ??
            element.textContent?.trim().slice(0, 60) ??
            element.tagName,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      })
      .filter(({ width, height }) => width < 44 || height < 44);
  });

  expect(undersized).toEqual([]);
});
