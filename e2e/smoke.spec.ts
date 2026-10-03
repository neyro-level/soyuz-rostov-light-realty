import { expect, test } from "@playwright/test";
import { buildHref } from "../src/platform/grammar";
import { features } from "../src/project/features.config";
import { grammar } from "../src/project/grammar.config";

const keys = [
  "home",
  "geoHub",
  "catNovostroyki",
  "catKvartiry",
  "ipoteka",
  "about",
  "contacts",
] as const;

test.describe("§7 smoke", () => {
  for (const pageKey of keys) {
    test(pageKey, async ({ page }) => {
      const href = buildHref(grammar, features, pageKey);
      expect(href).toBeTruthy();
      const response = await page.goto(href ?? "/");
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator("h1")).toBeVisible();
    });
  }
});
