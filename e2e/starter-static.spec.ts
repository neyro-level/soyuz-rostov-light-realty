import { expect, test } from "@playwright/test";
import { buildHref } from "../src/platform/grammar";
import { features } from "../src/project/features.config";
import { grammar } from "../src/project/grammar.config";
import { H2_STATIC_PAGE_KEYS } from "../src/project/starter-pages.config";
import { uiText } from "../src/project/ui-text.config";

const staticPaths = H2_STATIC_PAGE_KEYS.map(
  (pageKey) => buildHref(grammar, features, pageKey) ?? "/",
);

test.describe("H2 static starter pages", () => {
  test.describe.configure({ mode: "serial" });

  for (const path of staticPaths) {
    test(`${path} renders shell with noindex`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
      const robots = await page
        .locator('meta[name="robots"]')
        .getAttribute("content");
      expect(robots?.toLowerCase()).toContain("noindex");
    });
  }

  test("contacts exposes lead form in content block", async ({ page }) => {
    const contactsPath = buildHref(grammar, features, "contacts") ?? "/kontakty/";
    await page.goto(contactsPath, { waitUntil: "networkidle" });
    await expect(
      page.getByRole("textbox", { name: uiText.form.phoneLabel }),
    ).toBeVisible();
  });
});
