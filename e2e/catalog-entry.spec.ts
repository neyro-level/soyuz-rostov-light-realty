import { expect, test } from "@playwright/test";
import { buildHref } from "../src/platform/grammar";
import { H3_CATALOG_ENTRY_PAGE_KEYS } from "../src/project/catalog-entry.config";
import { features } from "../src/project/features.config";
import { grammar } from "../src/project/grammar.config";

const catalogPaths = H3_CATALOG_ENTRY_PAGE_KEYS.map(
  (pageKey) => buildHref(grammar, features, pageKey) ?? "/",
);

test.describe("H3 catalog entry pages", () => {
  test.describe.configure({ mode: "serial" });

  for (const path of catalogPaths) {
    test(`${path} renders H1 and catalog grid`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator("h1")).toHaveCount(1);
      const catalog = page.getByTestId("catalog-grid");
      await expect(catalog).toBeVisible();
      const links = catalog.getByRole("link");
      if ((await links.count()) > 0) {
        await expect(links.first()).toBeVisible();
      }
    });
  }
});
