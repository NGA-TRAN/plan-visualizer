import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

declare global {
  interface Window {
    planVizDrawnText: string[];
  }
}

const sampleDirectory = "src/features/plan-visualizer/data/samples/";
const errors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const pageErrors: string[] = [];
  errors.set(page, pageErrors);
  page.on("pageerror", (error) => pageErrors.push(error.message));
  // Observe actual canvas text drawing, not merely the presence of a canvas.
  await page.addInitScript(() => {
    window.planVizDrawnText = [];
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (
      text,
      x,
      y,
      maxWidth,
    ) {
      window.planVizDrawnText.push(text);
      if (maxWidth === undefined) {
        fillText.call(this, text, x, y);
      } else {
        fillText.call(this, text, x, y, maxWidth);
      }
    };
  });
});

test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
});

async function visualize(page: Page) {
  await page.evaluate(() => {
    window.planVizDrawnText = [];
  });
  await page.getByRole("button", { name: "Visualize", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.planVizDrawnText.some((text) => /Exec/.test(text)),
      ),
    )
    .toBe(true);
  await expect(
    page.getByText("Visualization Error", { exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("#plan-input")).not.toHaveClass(/border-red-300/);
}

test.describe("startup budget", () => {
  // Measure foreground loading separately from the offline cache download.
  test.use({ serviceWorkers: "block" });

  test("loads the input UI without loading the editor", async ({ page }) => {
    await page.goto("./", { waitUntil: "networkidle" });
    await expect(page.locator("#sample-plan option")).toHaveCount(11);
    await expect(
      page.getByText("No Plan Visualized", { exact: true }),
    ).toBeVisible();
    const scripts = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter((entry) => /\.js(?:$|\?)/.test(entry.name))
        .map((entry) => ({
          name: entry.name,
          bytes: (entry as PerformanceResourceTiming).decodedBodySize,
        })),
    );
    expect(scripts.length).toBeGreaterThan(0);
    expect(
      scripts.some((script) => script.name.includes("ExcalidrawEditor")),
    ).toBe(false);
    expect(
      scripts.reduce((total, script) => total + script.bytes, 0),
    ).toBeLessThan(600_000);
  });
});

test("renders all samples, uploaded files, dropped files and pasted text", async ({
  page,
}) => {
  await page.goto("./");
  const samples = await page
    .locator("#sample-plan option")
    .evaluateAll((options) =>
      options
        .map((option) => (option as HTMLOptionElement).value)
        .filter(Boolean),
    );
  expect(samples).toHaveLength(10);
  for (const sample of samples) {
    await page.selectOption("#sample-plan", sample);
    await visualize(page);
  }

  const text = readFileSync(sampleDirectory + "simple-filter.sql", "utf8");
  await page
    .locator("#plan-file-upload")
    .setInputFiles(sampleDirectory + "simple-filter.sql");
  await expect(page.locator("#plan-input")).toHaveValue(text);
  await visualize(page);

  const dropped = readFileSync(sampleDirectory + "hash-join.sql", "utf8");
  const dataTransfer = await page.evaluateHandle((contents) => {
    const transfer = new DataTransfer();
    transfer.items.add(
      new File([contents], "dropped.sql", { type: "text/plain" }),
    );
    return transfer;
  }, dropped);
  await page.locator("#plan-input").dispatchEvent("drop", { dataTransfer });
  await expect(page.locator("#plan-input")).toHaveValue(dropped);
  await visualize(page);

  await page.locator("#plan-input").fill(text);
  await visualize(page);
});

test("applies light and dark theme styles to the app and editor", async ({
  page,
}) => {
  await page.goto("./");
  await page.selectOption("#sample-plan", "simple-filter");
  await visualize(page);
  const themeBackground = () =>
    page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-background")
        .trim(),
    );
  await expect.poll(themeBackground).toBe("249 250 251");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect.poll(themeBackground).toBe("17 24 39");
  await expect(page.locator(".excalidraw")).toHaveClass(/theme--dark/);
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect.poll(themeBackground).toBe("249 250 251");
  await expect(page.locator(".excalidraw")).not.toHaveClass(/theme--dark/);
});

test("first visualization works offline after the app is cached", async ({
  page,
  context,
}) => {
  await page.goto("./");
  await expect(
    page.getByText("No Plan Visualized", { exact: true }),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => resolve(),
          { once: true },
        ),
      );
    }
  });
  await context.setOffline(true);
  try {
    await page.reload();
    await page.selectOption("#sample-plan", "hash-join");
    await visualize(page);
    await expect(page.locator(".excalidraw canvas").first()).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});

test("exports valid PNG, SVG and editable scene files", async ({ page }) => {
  // Exercise browser downloads instead of opening a native OS file picker.
  await page.addInitScript(() => {
    for (const method of [
      "showOpenFilePicker",
      "showSaveFilePicker",
      "showDirectoryPicker",
    ]) {
      Reflect.deleteProperty(window, method);
    }
  });
  await page.goto("./");
  await page.selectOption("#sample-plan", "simple-filter");
  await visualize(page);
  await page.getByTestId("main-menu-trigger").click();
  await page.getByText("Export image...", { exact: true }).click();

  for (const format of ["PNG", "SVG"]) {
    const downloaded = page.waitForEvent("download", { timeout: 15_000 });
    await page
      .getByRole("button", { name: `Export to ${format}`, exact: true })
      .click();
    const download = await downloaded;
    expect(await download.failure()).toBeNull();
    const path = await download.path();
    expect(path).not.toBeNull();
    const contents = readFileSync(path!);
    if (format === "PNG") {
      expect(contents.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    } else {
      expect(contents.toString()).toContain("<svg");
      expect(contents.toString()).toContain("FilterExec");
    }
  }

  await page.locator(".Modal__background").click({ position: { x: 5, y: 5 } });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByTestId("main-menu-trigger").click();
  await page.getByText("Save to...", { exact: true }).click();
  const downloaded = page.waitForEvent("download", { timeout: 15_000 });
  await page.getByRole("button", { name: "Save to file", exact: true }).click();
  const download = await downloaded;
  expect(await download.failure()).toBeNull();
  const path = await download.path();
  expect(path).not.toBeNull();
  const scene = JSON.parse(readFileSync(path!, "utf8"));
  expect(scene.type).toBe("excalidraw");
  expect(scene.elements.length).toBeGreaterThan(0);
});

test("standalone installation state settles without repeated updates", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const matchMedia = window.matchMedia.bind(window);
    window.matchMedia = (query) => {
      const result = matchMedia(query);
      if (query === "(display-mode: standalone)") {
        Object.defineProperty(result, "matches", { value: true });
      }
      return result;
    };
  });
  await page.goto("./");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(
            localStorage.getItem("plan-visualizer-installation-state") ?? "{}",
          ).isInstalled,
      ),
    )
    .toBe(true);
  await page.selectOption("#sample-plan", "simple-filter");
  await visualize(page);
});

test("keeps mobile navigation and visualization usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await expect(
    page.getByRole("button", { name: "Upload file", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Toggle menu", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Plan Visualizer", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close menu", exact: true }).click();
  await page.selectOption("#sample-plan", "simple-filter");
  await page.getByRole("button", { name: "Visualize", exact: true }).click();
  // The existing mobile layout places the diagram outside the initial viewport.
  // Use the editor's recenter control, as in the deployed app.
  await page.getByRole("button", { name: "Scroll back to content" }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.planVizDrawnText.some((text) => /Exec/.test(text)),
      ),
    )
    .toBe(true);
});
