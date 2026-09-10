import { expect, test } from "@playwright/test";

test("gallery filters, theme persists, and demo navigation works", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Difficult processes, made inspectable.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page
    .getByRole("textbox", { name: "Search explainers" })
    .fill("workflow");
  await page
    .getByRole("link", { name: "Open How an interactive explainer is built" })
    .click();
  await expect(page).toHaveURL(/\/demos\/how-explainers-work$/);
  await expect(
    page.getByRole("heading", {
      name: "How an interactive explainer is built",
    }),
  ).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("renderer filter uses the shared shadcn select", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Renderer" }).click();
  await page.getByRole("option", { name: "DOM / SVG" }).click();
  await expect(page.getByText("No matching signals")).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(
    page.getByRole("link", {
      name: "Open How an interactive explainer is built",
    }),
  ).toBeVisible();
});

test("dry run supports keyboard interaction and reset", async ({ page }) => {
  await page.goto("/demos/how-explainers-work");
  const next = page.getByRole("button", { name: "Next step" });
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/STEP\s+2 \/ 7/)).toBeVisible();
  await page.getByRole("button", { name: "Boundary" }).click();
  await expect(page.getByText(/CASE\s+BOUNDARY/)).toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByText(/CASE\s+NORMAL/)).toBeVisible();
});

for (const viewport of [
  { width: 360, height: 800 },
  { width: 736, height: 900 },
  { width: 1440, height: 1000 },
]) {
  test(`has no horizontal overflow at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/demos/how-explainers-work");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("retains the lesson when WebGL is unavailable", async ({ page }) => {
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
  await page.goto("/demos/how-explainers-work");
  await expect(page.getByText(/3D unavailable/)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Think of it as an observatory" }),
  ).toBeVisible();
});

test("supports reduced motion and an accessible 404", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/not-a-route");
  await expect(
    page.getByRole("heading", {
      name: "This route has no observable process.",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Return to the observatory" }).click();
  await expect(page).toHaveURL(/\/$/);
});
