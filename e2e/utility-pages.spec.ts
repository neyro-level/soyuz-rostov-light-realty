import { expect, test } from "@playwright/test";
import { buildHref } from "../src/platform/grammar";
import { features } from "../src/project/features.config";
import { grammar } from "../src/project/grammar.config";
import { H5_UTILITY_PAGE_KEYS } from "../src/project/utility-pages.config";

test.describe("H5 utility pages", () => {
  test.describe.configure({ mode: "serial" });

  test("404 page renders starter shell", async ({ page }) => {
    await page.goto("/this-route-does-not-exist-ams/", {
      waitUntil: "networkidle",
    });
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByTestId("not-found-content")).toBeVisible();
  });

  for (const pageKey of H5_UTILITY_PAGE_KEYS) {
    test(`${pageKey} utility route renders content block`, async ({ page }) => {
      const path = buildHref(grammar, features, pageKey) ?? "/";
      expect(path).not.toBe("/");
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByTestId("utility-content")).toBeVisible();
      const robots = await page
        .locator('meta[name="robots"]')
        .getAttribute("content");
      expect(robots?.toLowerCase()).toContain("noindex");
    });
  }
});
