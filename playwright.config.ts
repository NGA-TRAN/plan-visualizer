import { defineConfig, devices } from "@playwright/test";

const base = process.env.GITHUB_PAGES === "true" ? "/plan-visualizer/" : "/";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    channel: process.env.PLAYWRIGHT_CHANNEL,
    baseURL: `http://127.0.0.1:4177${base}`,
    viewport: { width: 1440, height: 1000 },
    colorScheme: "light",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command:
      "node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4177 --strictPort",
    url: `http://127.0.0.1:4177${base}`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
