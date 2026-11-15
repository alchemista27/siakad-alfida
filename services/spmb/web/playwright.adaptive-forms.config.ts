import { defineConfig } from "@playwright/test";

const reuseExistingServer = process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === "1";
const gracefulShutdown = { signal: "SIGTERM", timeout: 5_000 } as const;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "adaptive-parent-forms.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3200",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "pnpm exec tsx tests/e2e/adaptive-form-fixture-api.ts",
      url: "http://127.0.0.1:3201/__e2e__/health",
      timeout: 30_000,
      reuseExistingServer,
      gracefulShutdown,
    },
    {
      command: "server=$(find .next/standalone -path '*/services/spmb/web/server.js' -print -quit); app_dir=$(dirname \"$server\"); mkdir -p \"$app_dir/.next\"; cp -R .next/static \"$app_dir/.next/\"; exec env INTERNAL_API_URL=http://127.0.0.1:3201 SPMB_API_URL=http://127.0.0.1:3201 HOSTNAME=127.0.0.1 PORT=3200 node \"$server\"",
      url: "http://127.0.0.1:3200/parent/form-student",
      timeout: 30_000,
      reuseExistingServer,
      gracefulShutdown,
    },
  ],
});
