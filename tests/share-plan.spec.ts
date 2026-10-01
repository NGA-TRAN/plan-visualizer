import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { gzipSync, gunzipSync } from "node:zlib";
import { randomBytes } from "node:crypto";

const sample = readFileSync(
  "src/features/plan-visualizer/data/samples/simple-filter.sql",
  "utf8",
);
const sharedHash = (text: string) =>
  "#plan=v1." + gzipSync(text).toString("base64url");
const pageErrors = new WeakMap<Page, string[]>();

declare global {
  interface Window {
    sharedPlanDrawnText: string[];
    releaseSharedDecode: () => void;
    sharedDecodeWaiting: boolean;
  }
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.sharedPlanDrawnText = [];
    const original = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (
      text,
      x,
      y,
      maxWidth,
    ) {
      window.sharedPlanDrawnText.push(text);
      if (maxWidth === undefined) original.call(this, text, x, y);
      else original.call(this, text, x, y, maxWidth);
    };
  });
});
test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page)).toEqual([]);
});

async function expectDiagram(page: Page, operator = "FilterExec") {
  await expect
    .poll(() =>
      page.evaluate(
        (name) =>
          window.sharedPlanDrawnText.some((text) => text.includes(name)),
        operator,
      ),
    )
    .toBe(true);
  await expect(page.locator(".excalidraw canvas").first()).toBeVisible();
  await expect(page.locator("#plan-input")).not.toHaveClass(/border-red-300/);
  await expect(
    page.getByText("Visualization Error", { exact: true }),
  ).toHaveCount(0);
}

async function copyLink(page: Page) {
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(
    page.getByText("Plan link copied!", { exact: true }).first(),
  ).toBeVisible();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toMatch(
    /^https:\/\/nga-tran\.github\.io\/plan-visualizer\/#plan=v1\.[A-Za-z0-9_-]+$/,
  );
  expect(link.length).toBeLessThanOrEqual(32_000);
  return link;
}

// Use the real clipboard for the successful path; links always target production.
test("shares exact Unicode text and opens it as a diagram in a fresh session", async ({
  page,
  context,
  browser,
  baseURL,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  await expect(
    page.getByRole("button", { name: "Share", exact: true }),
  ).toBeDisabled();
  const text =
    "\n" + sample.replace("orders.parquet", "数据-#&+%?-café.parquet") + "\n  ";
  await page.locator("#plan-input").fill(text);
  const link = await copyLink(page);
  expect(
    gunzipSync(Buffer.from(new URL(link).hash.slice(9), "base64url")).toString(
      "utf8",
    ),
  ).toBe(text);
  const recipientContext = await browser.newContext();
  try {
    const recipient = await recipientContext.newPage();
    await recipient.goto(baseURL! + new URL(link).hash);
    await expect(recipient.locator("#plan-input")).toHaveValue(text);
    await expect(recipient.locator(".excalidraw canvas").first()).toBeVisible();
    await expect(
      recipient.getByText("No Plan Visualized", { exact: true }),
    ).toHaveCount(0);
  } finally {
    await recipientContext.close();
  }
  await page.goto("./" + new URL(link).hash);
  await expectDiagram(page);
  // Share the current input even when a different plan is still displayed.
  const edited = sample.replace("100", "999");
  await page.locator("#plan-input").fill(edited);
  const updatedLink = await copyLink(page);
  expect(
    gunzipSync(
      Buffer.from(new URL(updatedLink).hash.slice(9), "base64url"),
    ).toString("utf8"),
  ).toBe(edited);
});

test("all sample categories fit in share links and render automatically", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  const samples = await page
    .locator('select[id^="sample-"] option')
    .evaluateAll((options) =>
      options
        .map((option) => ({
          id: (option as HTMLOptionElement).value,
          menu: option.closest("select")!.id,
        }))
        .filter((option) => option.id),
    );
  expect(samples).toHaveLength(19);
  for (const sample of samples) {
    await page.selectOption(`#${sample.menu}`, sample.id);
    const text = await page.locator("#plan-input").inputValue();
    const link = await copyLink(page);
    expect(
      gunzipSync(
        Buffer.from(new URL(link).hash.slice(9), "base64url"),
      ).toString("utf8"),
    ).toBe(text);
    await page.evaluate((hash) => {
      window.sharedPlanDrawnText = [];
      window.location.hash = hash;
    }, new URL(link).hash);
    await expectDiagram(page, "Exec");
    await expect(page.locator("#plan-input")).toHaveValue(text);
    for (const menu of ["single-node", "custom", "distributed"]) {
      await expect(page.locator(`#sample-${menu}`)).toHaveValue("");
    }
  }
});

test("shared plans fit into a mobile viewport automatically", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./" + sharedHash(sample));
  await expect(page.locator("#plan-input")).toHaveValue(sample);
  await expectDiagram(page);
  await expect(
    page.getByRole("button", { name: "Scroll back to content" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Share", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});

test("provides a selected copyable link when clipboard access is denied", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new DOMException("Denied", "NotAllowedError");
        },
      },
    });
  });
  await page.goto("./");
  await page.locator("#plan-input").fill(sample);
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Copy plan link" }),
  ).toBeVisible();
  const input = page.getByRole("textbox", { name: "Plan share link" });
  await expect(input).toBeFocused();
  const selection = await input.evaluate((element: HTMLInputElement) => ({
    start: element.selectionStart,
    end: element.selectionEnd,
    readOnly: element.readOnly,
    link: element.value,
  }));
  expect(selection).toMatchObject({
    start: 0,
    end: selection.link.length,
    readOnly: true,
  });
  expect(
    gunzipSync(
      Buffer.from(new URL(selection.link).hash.slice(9), "base64url"),
    ).toString("utf8"),
  ).toBe(sample);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Share", exact: true }),
  ).toBeFocused();
});

test("rejects damaged links and allows manual recovery", async ({ page }) => {
  const invalid = [
    "#plan=",
    "#plan=v2.abc",
    "#plan=v1.a",
    "#plan=v1.a?b",
    "#plan=v1." + Buffer.from("not gzip").toString("base64url"),
    sharedHash(sample).slice(0, -8),
    sharedHash(" \n"),
  ];
  for (const hash of invalid) {
    await page.goto("./" + hash);
    await expect(page.getByRole("alert")).toContainText(
      "invalid or incomplete",
    );
    await expect(page.locator("#plan-input")).toHaveValue("");
  }
  await page.locator("#plan-input").fill(sample);
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByRole("button", { name: "Visualize", exact: true }).click();
  await expectDiagram(page);
});

test("rejects oversized links and compressed payloads", async ({ page }) => {
  for (const hash of [
    "#plan=v1." + "a".repeat(32_000),
    sharedHash("x".repeat(1024 * 1024 + 1)),
  ]) {
    await page.goto("./" + hash);
    await expect(page.getByRole("alert")).toContainText(
      "too large for a share link",
    );
    await expect(page.locator("#plan-input")).toHaveValue("");
  }
  await page.goto("./");
  // Check both the uncompressed text limit and the encoded URL length limit.
  for (const text of [
    "x".repeat(1024 * 1024 + 1),
    randomBytes(35_000).toString("hex"),
  ]) {
    await page.locator("#plan-input").fill(text);
    await page.getByRole("button", { name: "Share", exact: true }).click();
    await expect(
      page
        .getByText(
          "This plan is too large for a share link. Share the plan as a text file instead.",
          { exact: true },
        )
        .first(),
    ).toBeVisible();
  }
});

test("does not overwrite edits when shared decoding finishes later", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const Original = DecompressionStream;
    const gate = new Promise<void>((resolve) => {
      window.releaseSharedDecode = resolve;
    });
    Object.defineProperty(window, "DecompressionStream", {
      value: class {
        readable: ReadableStream;
        writable: WritableStream;
        constructor(format: CompressionFormat) {
          const stream = new Original(format);
          this.writable = stream.writable;
          this.readable = stream.readable.pipeThrough(
            new TransformStream({
              async transform(chunk, controller) {
                window.sharedDecodeWaiting = true;
                await gate;
                controller.enqueue(chunk);
              },
            }),
          );
        }
      },
    });
  });
  await page.goto("./" + sharedHash(sample));
  await expect
    .poll(() => page.evaluate(() => window.sharedDecodeWaiting))
    .toBe(true);
  const edit = sample.replace("100", "321");
  await page.locator("#plan-input").fill(edit);
  await page.evaluate(() => window.releaseSharedDecode());
  await page.getByRole("button", { name: "Visualize", exact: true }).click();
  await expectDiagram(page);
  await expect(page.locator("#plan-input")).toHaveValue(edit);
});
