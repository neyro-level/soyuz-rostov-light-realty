import { expect, test } from "@playwright/test";
import { homeContent } from "../src/project/home.config";

test.describe("home reference page", () => {
  test("desktop 1440 exposes hero and content sections", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: `${homeContent.hero.titleLine1} ${homeContent.hero.titleLine2}`,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: homeContent.developments.title }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: homeContent.interest.title }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: homeContent.popularSearches.title }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: homeContent.hero.ctaLabel }).first(),
    ).toBeVisible();
  });

  test("mobile 375 keeps primary sections", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: homeContent.popularSearches.title }),
    ).toBeVisible();
  });
});
