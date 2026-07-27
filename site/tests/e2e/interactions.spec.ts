import { expect, test } from "@playwright/test";

test("schedule demo tells one causal story", async ({ page }) => {
  await page.goto("/");
  const demo = page.locator(".schedule-demo").first();

  await expect(demo).toContainText("13:20");
  await expect(demo).toContainText("Ауд. 312");
  await expect(demo).toContainText("Ожидает проверки");

  await demo.getByRole("button", { name: /Конфликт/ }).click();
  await expect(demo).toContainText("312 занята");
  await expect(demo).toContainText("214 свободна");
  await expect(demo.getByRole("button", { name: /Конфликт/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await demo.getByRole("button", { name: /Публикация/ }).click();
  await expect(demo).toContainText("v19 · опубликовано");
  await expect(demo).toContainText("Ауд. 214");
  await expect(demo).toContainText("Новая версия доступна ролям");
});

test("reduced motion keeps the demo usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const demo = page.locator(".schedule-demo").first();
  await demo.getByRole("button", { name: /Публикация/ }).click();
  await expect(demo).toContainText("Ауд. 214");

  const durations = await demo.evaluate((element) =>
    element.getAnimations().map((animation) => {
      const timing = animation.effect?.getComputedTiming();
      return Number(timing?.duration ?? 0);
    }),
  );
  expect(durations.every((duration) => duration <= 1)).toBe(true);
});
