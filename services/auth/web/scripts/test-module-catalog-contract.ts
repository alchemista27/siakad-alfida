import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const source = await readFile(resolve(process.cwd(), "src/app/modules/page.tsx"), "utf8");

  assert.match(source, /href:\s*SERVICE_URL\.siakad/, "sidebar must use the canonical SIAKAD URL");
  assert.match(source, /url:\s*SERVICE_URL\.siakad/, "SIAKAD card must use the canonical URL");
  assert.match(source, /getSpmbEntries\(roles\)/, "SPMB entry must be resolved from actual SSO roles");
  assert.doesNotMatch(source, /spmb:\s*["']https:\/\/spmb\.alfida\.or\.id\/admin["']/, "SPMB must not have a universal admin URL");
  assert.match(source, /spmbEntries\.map/, "SPMB cards must be rendered from role-specific entries");
  assert.match(
    source,
    /id:\s*"siskeu"[\s\S]*?url:\s*SERVICE_URL\.siskeu[\s\S]*?isActive:\s*true/,
    "SISKEU must be an active module targeting its public domain",
  );
  assert.match(source, /label:\s*"SISKEU \(Keuangan & SPP\)"[\s\S]*?href:\s*SERVICE_URL\.siskeu/, "sidebar must include SISKEU");

  console.log("Auth module catalog contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
