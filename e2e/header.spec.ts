import { expect, test } from "@playwright/test";
import { site } from "../src/project/site.config";

const groupTitles = ["Недвижимость", "Услуги", "Компания"];

test.describe("header navigation", () => {
  test("desktop 1440 exposes main nav groups", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const mainNav = page.getByRole("navigation", { name: "Main" });
    await expect(mainNav).toBeVisible();
    for (const title of groupTitles) {
      await expect(mainNav.getByRole("button", { name: title })).toBeVisible();
    }
    const banner = page.getByRole("banner");
    await expect(
      banner.getByRole("button", { name: "Подобрать вариант" }),
    ).toBeVisible();
    await expect(banner.getByRole("link", { name: site.brand })).toBeVisible();
  });

  test("mobile 375 exposes groups via sheet", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(
      page.getByRole("navigation", { name: "Main" }),
    ).toBeHidden();
    const menuButton = page.getByRole("button", { name: "Открыть меню" });
    await menuButton.scrollIntoViewIfNeeded();
    await menuButton.click();
    const sheet = page.locator('[data-slot="sheet-content"]');
    await expect(sheet).toBeVisible();
    const mobileNav = sheet.getByRole("navigation", { name: "Mobile" });
    await expect(mobileNav).toBeVisible();
    for (const title of groupTitles) {
      await expect(mobileNav.getByText(title, { exact: true })).toBeVisible();
    }
    await expect(
      mobileNav.getByRole("button", { name: "Подобрать вариант" }),
    ).toBeVisible();
    await expect(
      mobileNav.getByRole("link", { name: site.phoneDisplay }),
    ).toBeVisible();
  });

  test("mobile sheet closes with Escape and traps focus", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.getByRole("button", { name: "Открыть меню" }).click();
    const sheet = page.locator('[data-slot="sheet-content"]');
    await expect(sheet).toBeVisible();

    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press("Tab");
      const activeInSheet = await sheet.evaluate((node) =>
        node.contains(document.activeElement),
      );
      expect(activeInSheet).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  });

  test("mobile sheet closes via close control", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.getByRole("button", { name: "Открыть меню" }).click();
    const sheet = page.locator('[data-slot="sheet-content"]');
    await expect(sheet).toBeVisible();
    await sheet.getByRole("button", { name: "Close" }).click();
    await expect(sheet).toBeHidden();
  });
});
