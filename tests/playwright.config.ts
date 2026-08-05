import { defineConfig, devices } from "@playwright/test";

const baseURL = (process.env.SITE_URL || "http://localhost:3000").replace(
  /\/+$/,
  "",
);

// Allows running against a system Chromium (e.g. CI images or sandboxes without
// the Playwright-bundled browser's shared libraries): CHROMIUM_PATH=/bin/chromium
const executablePath = process.env.CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    launchOptions: executablePath ? { executablePath } : {},
  },

  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
