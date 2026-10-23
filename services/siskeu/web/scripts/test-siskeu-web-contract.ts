import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function source(relativePath: string): Promise<string> {
  return readFile(resolve(process.cwd(), relativePath), "utf8").catch(() => "");
}

async function main() {
  const [config, rootPage, invoicePage, shell, api, middleware] = await Promise.all([
    source("next.config.ts"),
    source("src/app/page.tsx"),
    source("src/app/invoices/page.tsx"),
    source("src/components/siskeu-app-shell.tsx"),
    source("src/lib/api.ts"),
    source("src/middleware.ts"),
  ]);

  assert.match(config, /output:\s*"standalone"/, "SISKEU web must produce a standalone runtime");
  assert.match(config, /source:\s*"\/api\/:path\(\(\?!auth\/\)\.\*\)"/, "API rewrite must preserve Auth routes");
  assert.match(config, /\/api\/:path\*/, "API rewrite must target the Nest /api prefix");
  assert.match(rootPage, /SiskeuAppShell/, "dashboard must use the SISKEU-specific shell");
  assert.match(invoicePage, /getInvoices\(/, "invoice page must use the shared finance API client");
  assert.match(shell, /Tagihan SPP/, "finance shell must expose the invoice workflow");
  assert.match(api, /\/api\/spp\/invoices/, "browser API client must use the SISKEU invoice endpoint");
  assert.match(middleware, /alfida_session/, "protected SISKEU routes must recognize the central SSO cookie");
  assert.match(middleware, /x-forwarded-host/, "SSO return URLs must preserve the public proxy host");
  assert.match(middleware, /auth\.alfida\.or\.id/, "anonymous users must be redirected to central Auth");
  assert.doesNotMatch(`${rootPage}\n${invoicePage}\n${shell}\n${api}`, /(?:alert\(|console\.log\(|DATABASE_URL|INTERNAL_SERVICE_TOKEN|PAYMENT_URL_TEMPLATE|PROVIDER_WEBHOOK_TOKEN)/, "browser source must not use native alerts, logging, or secrets");

  console.log("SISKEU web contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
