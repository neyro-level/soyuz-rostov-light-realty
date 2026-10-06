import { expect, test } from "@playwright/test";
import { site } from "../src/project/site.config";

const columnTitles = ["Недвижимость", "Услуги", "Компания", "Документы"];

test.describe("footer", () => {
  for (const width of [375, 768, 1440]) {
    test(`viewport ${width} shows brand, nav columns and legal`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const footer = page.getByRole("contentinfo");
      await expect(footer).toBeVisible();
      await expect(
        footer.getByRole("link", { name: site.brand }),
      ).toBeVisible();
      for (const title of columnTitles) {
        await expect(footer.getByRole("heading", { name: title })).toBeVisible();
      }
      await expect(
        footer.getByRole("link", { name: site.phoneDisplay }),
      ).toBeVisible();
      await expect(footer.getByText(site.inn, { exact: false })).toBeVisible();
    });
  }
});
