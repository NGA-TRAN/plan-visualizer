import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { gzipSync, gunzipSync } from "node:zlib";

declare global {
  interface Window {
    metricDrawnText: string[];
    pauseMetricHash: boolean;
    metricHashWaiting: boolean;
    releaseMetricHash: () => void;
  }
}

const metricSample = "src/features/plan-visualizer/data/samples/metrics/";
const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const pageErrors: string[] = [];
  errors.set(page, pageErrors);
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    window.metricDrawnText = [];
    const original = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (
      text,
      x,
      y,
      maxWidth,
    ) {
      window.metricDrawnText.push(text);
      if (maxWidth === undefined) original.call(this, text, x, y);
      else original.call(this, text, x, y, maxWidth);
    };
    for (const method of [
      "showOpenFilePicker",
      "showSaveFilePicker",
      "showDirectoryPicker",
    ])
      Reflect.deleteProperty(window, method);
  });
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
});

async function render(page: Page, expectedText: string) {
  await page.evaluate(() => {
    window.metricDrawnText = [];
  });
  await page.getByRole("button", { name: "Visualize", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        (text) => window.metricDrawnText.some((drawn) => drawn.includes(text)),
        expectedText,
      ),
    )
    .toBe(true);
  await expect(page.locator("#plan-input")).not.toHaveClass(/border-red-300/);
}

async function exportScene(page: Page) {
  await page.getByTestId("main-menu-trigger").click();
  await page.getByText("Save to...", { exact: true }).click();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save to file", exact: true }).click();
  const download = await downloaded;
  expect(await download.failure()).toBeNull();
  const scene = JSON.parse(readFileSync((await download.path())!, "utf8")) as {
    elements: {
      id: string;
      type: string;
      text?: string;
      backgroundColor: string;
      groupIds: string[];
      containerId?: string;
    }[];
  };
  await page.keyboard.press("Escape");
  return scene;
}

for (const sample of ["single-node-metrics", "distributed-metrics"]) {
  test(`${sample}: normal, labels and heatmap remain editable and exportable`, async ({
    page,
  }, testInfo) => {
    await page.goto("./");
    await page.selectOption("#sample-metrics", sample);
    await expect(
      page.getByRole("radio", { name: "Normal", exact: true }),
    ).toBeChecked();
    await render(page, "Exec");
    const normal = await exportScene(page);
    expect(
      normal.elements.some((e) => e.text?.includes("elapsed_compute —")),
    ).toBe(false);

    await page.getByRole("radio", { name: "Labels", exact: true }).check();
    await expect(
      page.getByRole("combobox", { name: "Color", exact: true }),
    ).toHaveCount(0);
    await render(page, "elapsed_compute — ready");
    const labels = await exportScene(page);
    expect(
      labels.elements.some((e) =>
        e.text?.includes(sample.startsWith("single") ? "45ms" : "200ms"),
      ),
    ).toBe(true);

    await page
      .getByRole("radio", { name: "Labels + heatmap", exact: true })
      .check();
    for (const palette of ["orange", "blue", "purple"]) {
      await page
        .getByRole("combobox", { name: "Color", exact: true })
        .selectOption(palette);
      await render(page, `Palette: ${palette}`);
      const scene = await exportScene(page);
      const strongest = {
        orange: "#ffc078",
        blue: "#91caff",
        purple: "#c4a1f2",
      }[palette];
      expect(scene.elements.some((e) => e.backgroundColor === strongest)).toBe(
        true,
      );
      expect(
        scene.elements.some(
          (e) => e.type === "text" && e.containerId && e.groupIds.length,
        ),
      ).toBe(true);
    }
    await page
      .getByRole("combobox", { name: "Metric", exact: true })
      .selectOption("output_rows");
    await render(page, "output_rows — ready");
    if (sample === "distributed-metrics") {
      await page.screenshot({
        path: testInfo.outputPath("metrics-desktop.png"),
        fullPage: true,
      });
    }
  });
}

test("missing metrics stay selected, and pasted plans do not inherit sample assumptions", async ({
  page,
}) => {
  await page.goto("./");
  await page.selectOption("#sample-metrics", "single-node-metrics");
  await page
    .getByRole("radio", { name: "Labels + heatmap", exact: true })
    .check();
  await page
    .locator("#plan-input")
    .fill("ProjectionExec: expr=[item@0 as item]\n  EmptyExec");
  await page.getByText("Metric interpretation", { exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Metric definitions", exact: true }),
  ).toHaveValue("");
  await render(page, "Not reported");
  await expect(
    page.getByRole("radio", { name: "Labels + heatmap", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("status").filter({ hasText: "Selected metric" }),
  ).toHaveText("Selected metric: Not reported in this plan.");
});

test("manual metric interpretation enables comparison and keeps zero distinct from missing", async ({
  page,
}) => {
  await page.goto("./");
  await page
    .locator("#plan-input")
    .fill(
      "ProjectionExec: expr=[item@0 as item], metrics=[output_rows=0]\n  CoalescePartitionsExec\n    EmptyExec, metrics=[output_rows=10]",
    );
  await page
    .getByRole("radio", { name: "Labels + heatmap", exact: true })
    .check();
  await page
    .getByRole("combobox", { name: "Metric", exact: true })
    .selectOption("output_rows");
  await render(page, "output_rows — incomparable");
  const raw = await exportScene(page);
  expect(raw.elements.some((e) => e.backgroundColor === "#ffc078")).toBe(false);
  expect(raw.elements.some((e) => e.text === "0 (raw)")).toBe(true);
  await page.getByText("Metric interpretation", { exact: true }).click();
  const definitions = page.getByRole("combobox", {
    name: "Metric definitions",
    exact: true,
  });
  await expect(definitions).toHaveValue("");
  await definitions.selectOption("datafusion-7865139");
  await render(page, "output_rows — ready");
  const scene = await exportScene(page);
  const projection = scene.elements.find((e) => e.text === "ProjectionExec");
  const missing = scene.elements.find(
    (e) => e.text === "CoalescePartitionsExec",
  );
  expect(projection?.containerId).toBeTruthy();
  expect(
    scene.elements.find((e) => e.id === projection!.containerId)
      ?.backgroundColor,
  ).toBe("#ffffff");
  expect(
    scene.elements.find((e) => e.id === missing!.containerId)?.backgroundColor,
  ).not.toBe("#ffffff");
  expect(scene.elements.some((e) => e.text === "Not reported")).toBe(true);
  expect(scene.elements.some((e) => e.text === "0")).toBe(true);
  expect(scene.elements.some((e) => e.backgroundColor === "#ffc078")).toBe(
    true,
  );
});

test("comparison groups are selected explicitly, shared, and reset after metric changes", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const plan = readFileSync(
    metricSample + "distributed-metrics.sql",
    "utf8",
  ).replace(
    "preserve_partitioning=[false]",
    "preserve_partitioning=[false], metrics=[elapsed_compute=1ms]",
  );
  await page.goto("./");
  await page.locator("#plan-input").fill(plan);
  await page
    .getByRole("radio", { name: "Labels + heatmap", exact: true })
    .check();
  await page.getByText("Metric interpretation", { exact: true }).click();
  await page
    .getByRole("combobox", { name: "Metric definitions", exact: true })
    .selectOption("datafusion-7865139");
  await page
    .getByRole("combobox", { name: "Task metrics", exact: true })
    .selectOption("distributed-b32ee66");
  const group = page.getByRole("combobox", {
    name: "Comparison group",
    exact: true,
  });
  await expect(group).toHaveValue("");
  await render(page, "elapsed_compute — cohort-required");
  const unselected = await exportScene(page);
  expect(unselected.elements.some((e) => e.backgroundColor === "#ffc078")).toBe(
    false,
  );
  await group.selectOption({
    label: "elapsed_compute / instance / assumed-profile",
  });
  const selectedGroup = await group.inputValue();
  await render(page, "elapsed_compute — ready");
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(
    page.getByText("Plan link copied!", { exact: true }).first(),
  ).toBeVisible();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  await page.goto("./" + new URL(link).hash);
  await expect(group).toHaveValue(selectedGroup);
  await expect(page.locator(".excalidraw canvas").first()).toBeVisible();
  const restored = await exportScene(page);
  expect(
    restored.elements.some((e) => e.text?.includes("elapsed_compute — ready")),
  ).toBe(true);
  expect(restored.elements.some((e) => e.backgroundColor === "#ffc078")).toBe(
    true,
  );
  await page
    .getByRole("combobox", { name: "Metric", exact: true })
    .selectOption("output_rows");
  await expect(group).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Metric", exact: true })
    .selectOption("elapsed_compute");
  await expect(group).toHaveValue("");
});

test("shared links restore metric, palette and interpretation in a fresh session", async ({
  page,
  context,
  browser,
  baseURL,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  await page.selectOption("#sample-metrics", "distributed-metrics");
  await page
    .getByRole("radio", { name: "Labels + heatmap", exact: true })
    .check();
  await page
    .getByRole("combobox", { name: "Metric", exact: true })
    .selectOption("output_rows");
  await page
    .getByRole("combobox", { name: "Color", exact: true })
    .selectOption("blue");
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(
    page.getByText("Plan link copied!", { exact: true }).first(),
  ).toBeVisible();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  const payload = JSON.parse(
    gunzipSync(
      Buffer.from(new URL(link).hash.slice(9), "base64url"),
    ).toString(),
  );
  expect(payload.settings).toMatchObject({
    display: "heatmap",
    metric: "output_rows",
    palette: "blue",
    interpretation: {
      metricProfile: "datafusion-7865139",
      exportProfile: "distributed-b32ee66",
    },
  });
  const recipientContext = await browser.newContext();
  try {
    await recipientContext.addInitScript(() => {
      for (const method of [
        "showOpenFilePicker",
        "showSaveFilePicker",
        "showDirectoryPicker",
      ])
        Reflect.deleteProperty(window, method);
    });
    const recipient = await recipientContext.newPage();
    await recipient.goto(baseURL! + new URL(link).hash);
    await expect(
      recipient.getByRole("radio", { name: "Labels + heatmap", exact: true }),
    ).toBeChecked();
    await expect(
      recipient.getByRole("combobox", { name: "Metric", exact: true }),
    ).toHaveValue("output_rows");
    await expect(
      recipient.getByRole("combobox", { name: "Color", exact: true }),
    ).toHaveValue("blue");
    await expect(recipient.locator(".excalidraw canvas").first()).toBeVisible();
    await expect(recipient.getByRole("alert")).toHaveCount(0);
    const scene = await exportScene(recipient);
    expect(
      scene.elements.some((e) => e.text?.includes("output_rows — ready")),
    ).toBe(true);
    expect(scene.elements.some((e) => e.backgroundColor === "#91caff")).toBe(
      true,
    );
  } finally {
    await recipientContext.close();
  }
});

test("mobile controls fit and render a heatmap", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await page.selectOption("#sample-metrics", "single-node-metrics");
  await page
    .getByRole("combobox", { name: "Display", exact: true })
    .selectOption("heatmap");
  const displayBounds = await page
    .getByRole("combobox", { name: "Display", exact: true })
    .boundingBox();
  expect(displayBounds!.width).toBeGreaterThan(160);
  await render(page, "Palette: orange");
  await expect(
    page.getByRole("button", { name: "Share", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({
    path: testInfo.outputPath("metrics-mobile.png"),
    fullPage: true,
  });
});

test("rejects unsupported shared view settings", async ({ page }) => {
  const plan = readFileSync(metricSample + "single-node-metrics.sql", "utf8");
  for (const patch of [
    { display: "unknown" },
    { metric: "query_cpu_time" },
    { palette: "red" },
    { interpretation: { metricProfile: "unknown" } },
    { input: { section: -1 } },
  ]) {
    const settings = {
      display: "heatmap",
      metric: "elapsed_compute",
      palette: "orange",
      interpretation: {},
      ...patch,
    };
    const hash =
      "#plan=v2." +
      gzipSync(JSON.stringify({ plan, settings })).toString("base64url");
    await page.goto("./" + hash);
    await expect(page.getByRole("alert")).toContainText(
      "invalid or incomplete",
    );
  }
});

test("an old metrics conversion cannot replace a newer normal diagram", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = crypto.subtle.digest.bind(crypto.subtle);
    crypto.subtle.digest = async (algorithm, data) => {
      if (window.pauseMetricHash) {
        window.pauseMetricHash = false;
        window.metricHashWaiting = true;
        await new Promise<void>((resolve) => {
          window.releaseMetricHash = resolve;
        });
      }
      return original(algorithm, data);
    };
  });
  await page.goto("./");
  await page.selectOption("#sample-metrics", "single-node-metrics");
  await page
    .getByRole("radio", { name: "Labels + heatmap", exact: true })
    .check();
  await expect(
    page
      .getByRole("combobox", { name: "Metric", exact: true })
      .locator("option"),
  ).not.toHaveCount(1);
  await page.evaluate(() => {
    window.pauseMetricHash = true;
  });
  await page.getByRole("button", { name: "Visualize", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.metricHashWaiting))
    .toBe(true);
  await page.getByRole("radio", { name: "Normal", exact: true }).check();
  await render(page, "HashJoinExec");
  await page.evaluate(() => window.releaseMetricHash());
  const scene = await exportScene(page);
  expect(
    scene.elements.some((e) => e.text?.includes("elapsed_compute —")),
  ).toBe(false);
});
