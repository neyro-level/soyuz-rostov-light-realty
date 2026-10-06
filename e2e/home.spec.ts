import { expect, test } from "@playwright/test";
import { homeContent } from "../src/project/home.config";

const viewports = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
] as const;

test.describe("home reference page", () => {
  for (const viewport of viewports) {
    test(`viewport ${viewport.width} renders core sections`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(
        page.getByRole("heading", { name: homeContent.developments.title }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: homeContent.interest.title }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: homeContent.popularSearches.title }),
      ).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
    });
  }

  test("lead dialog traps focus and closes with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const openCta = page
      .getByRole("button", { name: homeContent.hero.ctaLabel })
      .first();
    await openCta.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press("Tab");
      const activeInDialog = await dialog.evaluate((node) =>
        node.contains(document.activeElement),
      );
      expect(activeInDialog).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("prefers-reduced-motion is honored globally", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const matches = await page.evaluate(() =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    expect(matches).toBe(true);
    const transitionMs = await page.locator("body").evaluate((el) => {
      const raw = getComputedStyle(el).transitionDuration;
      const first = raw.split(",")[0]?.trim() ?? raw;
      if (first.endsWith("ms")) {
        return Number.parseFloat(first);
      }
      if (first.endsWith("s")) {
        return Number.parseFloat(first) * 1000;
      }
      return Number.parseFloat(first);
    });
    expect(transitionMs).toBeLessThanOrEqual(0.01);
  });
});
