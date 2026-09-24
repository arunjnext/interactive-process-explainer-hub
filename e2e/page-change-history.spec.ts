import { expect, test } from "@playwright/test";

test("first, unchanged, changed, and stale visits remain interactive in full and embedded views", async ({
  page,
}) => {
  for (const width of [360, 736]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/demos/page-change-history",
      "/demos/page-change-history/embed",
    ]) {
      await page.goto(route);
      await expect(
        page.getByRole("button", { name: "1 · First visit" }),
      ).toBeVisible();
      await page.getByRole("button", { name: "2 · Same page" }).click();
      await page
        .getByRole("button", { name: "Unchanged visit is skipped" })
        .click();
      await expect(page.getByText("Unchanged visit skipped")).toBeVisible();
      await page.getByRole("button", { name: "3 · Title changed" }).click();
      await page
        .getByRole("button", { name: "Delta and event are saved" })
        .click();
      await expect(page.getByText("Title event saved")).toBeVisible();
      await page.getByRole("button", { name: "Replay" }).click();
      await expect(
        page.getByRole("heading", { name: "Updated page settles" }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Boundary · stale tab" }).click();
      await page.getByRole("button", { name: "Next step" }).click();
      await expect(page.getByText("Stale capture rejected")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
});

test("dark view remains usable without horizontal overflow", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 736, height: 900 });
  await page.goto("/demos/page-change-history/embed");
  await page.getByRole("button", { name: "3 · Title changed" }).click();
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(
    page.getByRole("heading", { name: "Capture is checked" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
