import { defineConfig } from "@playwright/test";

const reuseExistingServer = process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === "1";
const gracefulShutdown = { signal: "SIGTERM", timeout: 5_000 } as const;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "letterhead-pdf.spec.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: [
    {
      command: "pnpm exec tsx tests/e2e/letterhead-fixture-api.ts",
      url: "http://127.0.0.1:3101/__e2e__/health",
      timeout: 30_000,
      reuseExistingServer,
      gracefulShutdown,
    },
    {
      command: "server=$(find .next/standalone -path '*/services/spmb/web/server.js' -print -quit); app_dir=$(dirname \"$server\"); mkdir -p \"$app_dir/.next\"; cp -R .next/static \"$app_dir/.next/\"; exec env NODE_OPTIONS=--require=./tests/e2e/letterhead-fetch-preload.cjs INTERNAL_API_URL=http://127.0.0.1:3101 SPMB_API_URL=http://127.0.0.1:3101 HOSTNAME=127.0.0.1 PORT=3100 node \"$server\"",
      url: "http://127.0.0.1:3100/api/pdf/acceptance",
      timeout: 30_000,
      reuseExistingServer,
      gracefulShutdown,
    },
  ],
});
