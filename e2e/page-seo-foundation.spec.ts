import { expect, test } from "@playwright/test";

for (const [scenario, verdict] of [
  ["Header says noindex", "No"],
  ["All required checks clear", "Yes"],
  ["HTTP evidence unavailable", "Unknown"],
  ["Noindex + unavailable access", "No"],
]) {
  test(`foundation case ${scenario} reaches ${verdict}`, async ({ page }) => {
    await page.goto("/demos/page-seo-foundation");
    await page.getByRole("combobox", { name: "Test case" }).click();
    await page.getByRole("option", { name: scenario, exact: true }).click();
    for (let step = 1; step <= 6; step++) {
      await expect(page.getByRole("status")).toContainText(`${step} / 7`);
      await page.getByRole("button", { name: "Next step" }).click();
    }
    await expect(
      page.getByRole("heading", { name: `Verdict: ${verdict}`, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Next step" }),
    ).toBeDisabled();
    if (scenario.startsWith("Noindex +"))
      await expect(
        page.getByText("Crawler access remains unknown."),
      ).toBeVisible();
  });
}

test("foundation keyboard controls, disclosures and stale-document boundary work", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/demos/page-seo-foundation");
  await page.getByRole("button", { name: "Next step" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("2 / 7");
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("status")).toContainText("1 / 7");
  await expect(page.getByText("Evidence packet", { exact: true })).toBeHidden();
  await page.getByText("Under the hood", { exact: true }).focus();
  await page.keyboard.press("Enter");
  await page.getByText("Evidence packet", { exact: true }).click();
  await expect(page.locator("pre")).toContainText('"schemaVersion": 1');
  await page.getByText("The nine checks", { exact: true }).click();
  await expect(page.locator("#technical strong")).toHaveCount(9);
  await page.getByText("Try a late page result", { exact: true }).click();
  await page.getByRole("button", { name: "Send old result" }).click();
  await expect(
    page.getByText(
      "Rejected. Document-2 keeps waiting for its own assessment.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset boundary" }).click();
  await expect(
    page.getByRole("button", { name: "Send old result" }),
  ).toBeEnabled();
});

for (const width of [320, 360, 736, 1440]) {
  test(`foundation expanded code fits ${width}px in light and dark`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/demos/page-seo-foundation");
    for (let step = 0; step < 3; step++)
      await page.getByRole("button", { name: "Next step" }).click();
    await page.getByText("Under the hood", { exact: true }).click();
    await page
      .locator("#technical")
      .getByText("Evidence packet", { exact: true })
      .click();
    await page.getByText("The nine checks", { exact: true }).click();
    await page.getByText("Try a late page result", { exact: true }).click();
    for (const theme of ["light", "dark"]) {
      if (theme === "dark")
        await page
          .getByRole("button", { name: "Switch to dark theme" })
          .click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
    }
  });
}

test("foundation renders a real Three.js canvas", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/demos/page-seo-foundation");
  await expect(
    page.getByTestId("scene-viewport").locator("canvas"),
  ).toBeVisible();
  await expect(
    page.getByText("3D unavailable. The walkthrough still works."),
  ).toBeHidden();
  expect(errors).toEqual([]);
});

test("foundation remains usable when WebGL is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      contextId: string,
      ...args: unknown[]
    ) {
      if (contextId === "webgl" || contextId === "webgl2") return null;
      return original.call(
        this,
        contextId as "2d",
        ...args,
      ) as RenderingContext | null;
    };
  });
  await page.goto("/demos/page-seo-foundation");
  await expect(
    page.getByText("3D unavailable. The walkthrough still works."),
  ).toBeVisible();
  for (let step = 0; step < 6; step++)
    await page.getByRole("button", { name: "Next step" }).click();
  await expect(
    page.getByRole("heading", { name: "Verdict: No" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Replay" }).click();
  await expect(page.getByRole("status")).toContainText("1 / 7");
});
