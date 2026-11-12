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

async function useManualInterpretation(page: Page) {
  await page
    .getByText("Advanced metric interpretation", { exact: true })
    .click();
  await page
    .getByRole("checkbox", {
      name: "Choose interpretation automatically",
      exact: true,
    })
    .uncheck();
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
    for (const palette of ["orange", "blue", "purple", "spectrum"]) {
      await page
        .getByRole("combobox", { name: "Color", exact: true })
        .selectOption(palette);
      await render(page, `Palette: ${palette}`);
      const scene = await exportScene(page);
      const strongest = {
        orange: "#ffc078",
        blue: "#91caff",
        purple: "#c4a1f2",
        spectrum: "#ed8075",
      }[palette];
      const hottestOperator =
        sample === "single-node-metrics" ? "HashJoinExec" : "DataSourceExec";
      const operatorBodies = new Set(
        scene.elements
          .filter(
            (e) =>
              e.type === "text" &&
              (e.text === hottestOperator ||
                e.text?.startsWith(hottestOperator + ":")),
          )
          .map((e) => e.containerId),
      );
      // A colored legend alone does not establish that any operator is colored.
      expect(
        scene.elements.some(
          (e) => operatorBodies.has(e.id) && e.backgroundColor === strongest,
        ),
      ).toBe(true);
      const zeroOperator =
        sample === "single-node-metrics" ? "ProjectionExec" : "DataSourceExec";
      const zeroBodies = new Set(
        scene.elements
          .filter((e) => e.type === "text" && e.text === zeroOperator)
          .map((e) => e.containerId),
      );
      expect(
        scene.elements.some(
          (e) => zeroBodies.has(e.id) && e.backgroundColor === "#ffffff",
        ),
        `${sample}: ${palette} must paint measured zero white`,
      ).toBe(true);
      const missing = scene.elements.find(
        (e) => e.type === "text" && e.text === "CoalescePartitionsExec",
      );
      expect(missing?.containerId).toBeTruthy();
      expect(
        scene.elements.find((e) => e.id === missing!.containerId)?.backgroundColor,
      ).not.toBe("#ffffff");
      if (palette === "spectrum") {
        const positiveFloor = scene.elements.find(
          (e) => e.type === "text" && e.text === ">0",
        );
        expect(positiveFloor?.groupIds).toHaveLength(1);
        const legend = scene.elements.filter((e) =>
          e.groupIds.includes(positiveFloor!.groupIds[0]),
        );
        expect(legend.filter((e) => e.type === "rectangle")).toHaveLength(7);
        expect(legend.filter((e) => e.type === "text").map((e) => e.text)).toEqual(
          ["0", ">0", "20%", "40%", "60%", "80%", "100%"],
        );
      }
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
  await page
    .getByText("Advanced metric interpretation", { exact: true })
    .click();
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
  await useManualInterpretation(page);
  await render(page, "output_rows — incomparable");
  const raw = await exportScene(page);
  expect(raw.elements.some((e) => e.backgroundColor === "#ffc078")).toBe(false);
  expect(raw.elements.some((e) => e.text === "0 (raw)")).toBe(true);
  const definitions = page.getByRole("combobox", {
    name: "Metric definitions",
    exact: true,
  });
  await expect(definitions).toBeVisible();
  const setup = page
    .getByRole("status")
    .filter({ hasText: "Heatmap setup required" });
  await expect(setup).toContainText("Choose Metric definitions below");
  await expect(setup).not.toContainText("Task metrics");
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
  await useManualInterpretation(page);
  await expect(
    page.getByRole("combobox", { name: "Metric definitions", exact: true }),
  ).toBeVisible();
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

for (const inputMethod of ["paste", "upload"] as const) {
  test(`${inputMethod}: distributed heatmap works without choosing interpretation settings`, async ({
    page,
  }, testInfo) => {
    if (inputMethod === "upload")
      await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./");
    if (inputMethod === "paste") {
      await page
        .locator("#plan-input")
        .fill(readFileSync(metricSample + "distributed-metrics.sql", "utf8"));
      await page
        .getByRole("radio", { name: "Labels + heatmap", exact: true })
        .check();
    } else {
      await page
        .locator("#plan-file-upload")
        .setInputFiles(metricSample + "distributed-metrics.sql");
      await page
        .getByRole("combobox", { name: "Display", exact: true })
        .selectOption("heatmap");
    }
    await page
      .getByRole("combobox", { name: "Metric", exact: true })
      .selectOption("output_batches");
    await expect(
      page.getByRole("status").filter({ hasText: "Heatmap setup required" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("combobox", { name: "Metric definitions", exact: true }),
    ).toHaveCount(0);
    await render(page, "Exec");
    await page.screenshot({
      path: testInfo.outputPath(`automatic-heatmap-${inputMethod}.png`),
      fullPage: true,
    });
    if (inputMethod === "upload") {
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(390);
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    const scene = await exportScene(page);
    expect(
      scene.elements.some((e) => e.text?.includes("output_batches — ready")),
    ).toBe(true);
    const bodies = new Set(
      scene.elements
        .filter((e) => e.text === "DataSourceExec")
        .map((e) => e.containerId),
    );
    expect(
      scene.elements.some(
        (e) => bodies.has(e.id) && e.backgroundColor === "#ffc078",
      ),
    ).toBe(true);
    await page
      .getByText("Advanced metric interpretation", { exact: true })
      .click();
    await expect(
      page.getByRole("checkbox", {
        name: "Choose interpretation automatically",
        exact: true,
      }),
    ).toBeChecked();
    await expect(
      page.getByRole("combobox", { name: "Metric definitions", exact: true }),
    ).toHaveValue("datafusion-7865139");
    await expect(
      page.getByRole("combobox", { name: "Task metrics", exact: true }),
    ).toHaveValue("distributed-b32ee66");
  });
}

test("automatic interpretation resolves mixed scalar and task metrics in one visualization", async ({
  page,
}) => {
  const plan = readFileSync(
    metricSample + "distributed-metrics.sql",
    "utf8",
  ).replace(
    "preserve_partitioning=[false]",
    "preserve_partitioning=[false], metrics=[output_batches=1]",
  );
  await page.goto("./");
  await page.locator("#plan-input").fill(plan);
  await page
    .getByRole("radio", { name: "Labels + heatmap", exact: true })
    .check();
  await page
    .getByRole("combobox", { name: "Metric", exact: true })
    .selectOption("output_batches");
  await render(page, "Exec");
  const group = page.getByRole("combobox", {
    name: "Comparison group",
    exact: true,
  });
  await expect(group.locator("option")).toHaveCount(3);
  await page
    .getByText("Advanced metric interpretation", { exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Metric definitions", exact: true }),
  ).toHaveValue("datafusion-7865139");
  await expect(
    page.getByRole("combobox", { name: "Task metrics", exact: true }),
  ).toHaveValue("distributed-b32ee66");
  await group.selectOption({
    label: "output_batches / instance / assumed-profile",
  });
  await render(page, "Exec");
  const scene = await exportScene(page);
  expect(
    scene.elements.some((e) => e.text?.includes("output_batches — ready")),
  ).toBe(true);
  const bodies = new Set(
    scene.elements
      .filter((e) => e.text === "DataSourceExec")
      .map((e) => e.containerId),
  );
  expect(
    scene.elements.some(
      (e) => bodies.has(e.id) && e.backgroundColor === "#ffc078",
    ),
  ).toBe(true);
});

test("older shared heatmaps with empty settings use automatic interpretation", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const plan = readFileSync(metricSample + "distributed-metrics.sql", "utf8");
  const settings = {
    display: "heatmap",
    metric: "output_batches",
    palette: "purple",
    interpretation: {},
  };
  await page.goto(
    "./#plan=v2." +
      gzipSync(JSON.stringify({ plan, settings })).toString("base64url"),
  );
  await expect(page.locator(".excalidraw canvas").first()).toBeVisible();
  const scene = await exportScene(page);
  expect(
    scene.elements.some((e) => e.text?.includes("output_batches — ready")),
  ).toBe(true);
  const bodies = new Set(
    scene.elements
      .filter((e) => e.text === "DataSourceExec")
      .map((e) => e.containerId),
  );
  expect(
    scene.elements.some(
      (e) => bodies.has(e.id) && e.backgroundColor === "#c4a1f2",
    ),
  ).toBe(true);
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
  expect(payload.settings.interpretation).toEqual({
    metricProfile: "datafusion-7865139",
    exportProfile: "distributed-b32ee66",
  });
  await expect(
    page.getByRole("combobox", { name: "Metric", exact: true }),
  ).toHaveValue("output_batches");
  await expect(
    page.getByRole("combobox", { name: "Color", exact: true }),
  ).toHaveValue("purple");
});

test("shared manual interpretation stays manual and can switch back to automatic", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const plan = readFileSync(metricSample + "distributed-metrics.sql", "utf8");
  const settings = {
    display: "heatmap",
    metric: "output_batches",
    palette: "orange",
    interpretation: {},
    automaticInterpretation: false,
  };
  await page.goto(
    "./#plan=v2." +
      gzipSync(JSON.stringify({ plan, settings })).toString("base64url"),
  );
  const setup = page
    .getByRole("status")
    .filter({ hasText: "Heatmap setup required" });
  await expect(setup).toContainText("Metric definitions and Task metrics");
  await expect(
    page.getByRole("combobox", { name: "Metric definitions", exact: true }),
  ).toHaveValue("");
  await expect(
    page.getByRole("combobox", { name: "Task metrics", exact: true }),
  ).toHaveValue("");
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
  expect(payload.settings.automaticInterpretation).toBe(false);
  expect(payload.settings.interpretation).toEqual({});
  await page
    .getByRole("checkbox", {
      name: "Choose interpretation automatically",
      exact: true,
    })
    .check();
  await expect(setup).toHaveCount(0);
  await render(page, "Exec");
  const scene = await exportScene(page);
  expect(
    scene.elements.some((e) => e.text?.includes("output_batches — ready")),
  ).toBe(true);
});

test("absent and invalid metrics do not suggest interpretation settings", async ({
  page,
}) => {
  await page.goto("./");
  await page
    .getByRole("radio", { name: "Labels + heatmap", exact: true })
    .check();
  for (const plan of [
    "EmptyExec",
    "EmptyExec, metrics=[elapsed_compute=NaN]",
  ]) {
    await page.locator("#plan-input").fill(plan);
    await render(page, "Exec");
    await expect(
      page.getByRole("status").filter({ hasText: "Heatmap setup required" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("combobox", { name: "Metric definitions", exact: true }),
    ).toHaveCount(0);
  }
});

for (const palette of ["blue", "spectrum"] as const) {
  test(`${palette}: shared links restore metric, palette and interpretation in a fresh session`, async ({
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
      .selectOption(palette);
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
      palette,
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
      ).toHaveValue(palette);
      await expect(recipient.locator(".excalidraw canvas").first()).toBeVisible();
      await expect(recipient.getByRole("alert")).toHaveCount(0);
      const scene = await exportScene(recipient);
      expect(
        scene.elements.some((e) => e.text?.includes("output_rows — ready")),
      ).toBe(true);
      const sources = new Set(
        scene.elements
          .filter((e) => e.type === "text" && e.text === "DataSourceExec")
          .map((e) => e.containerId),
      );
      const strongest = palette === "spectrum" ? "#ed8075" : "#91caff";
      expect(
        scene.elements.some(
          (e) => sources.has(e.id) && e.backgroundColor === strongest,
        ),
      ).toBe(true);
    } finally {
      await recipientContext.close();
    }
  });
}

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
    { automaticInterpretation: "invalid" },
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
