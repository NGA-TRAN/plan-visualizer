import { request, type FullConfig } from "@playwright/test";

export default async function verifyTestBuild(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL;
  if (!baseURL) throw new Error("The test preview must have a baseURL.");

  const base = new URL(baseURL).pathname;
  const buildCommand =
    base === "/plan-visualizer/"
      ? "GITHUB_PAGES=true npm run build"
      : "npm run build (with GITHUB_PAGES unset)";
  const context = await request.newContext();
  try {
    const response = await context.get(baseURL);
    const html = await response.text();
    const scripts = html.match(/<script\b[^>]*>/gi) ?? [];
    const entry = scripts
      .find((script) => /\btype=["']module["']/i.test(script))
      ?.match(/\bsrc=["']([^"']+)["']/i)?.[1];

    if (!response.ok() || !entry?.startsWith(`${base}assets/`)) {
      throw new Error(
        `The preview build does not match the test base path ${base}. ` +
          `Found module entry: ${entry ?? "none"}.\n` +
          `Run ${buildCommand}, then rerun the tests with the same GITHUB_PAGES setting. ` +
          "Do not rebuild dist or run another suite while these tests are running.",
      );
    }
  } finally {
    await context.dispose();
  }
}
