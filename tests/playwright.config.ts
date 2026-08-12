import { defineConfig, devices } from "@playwright/test";

const baseURL = (process.env.SITE_URL || "http://localhost:3001").replace(
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
  webServer: {
    command: "npm run dev --workspace @jm/frontend -- -p 3001",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
      TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
      ADMIN_PASSWORD: "test-password-123",
      SUPER_ADMIN_PASSWORD: "janta@123",
    },
  },
});
