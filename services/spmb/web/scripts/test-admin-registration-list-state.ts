import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const source = await readFile(resolve(process.cwd(), "src/app/admin/page.tsx"), "utf8");

  assert.match(source, /type RegistrationLoadState\s*=/, "registration loading must be modelled explicitly");
  assert.match(source, /kind:\s*"forbidden"/, "401/403 must have a distinct state");
  assert.match(source, /kind:\s*"error"/, "network/server failures must have a distinct state");
  assert.match(source, /Belum ada pendaftar/, "an unfiltered empty collection must use the required copy");
  assert.match(source, /Tidak ada pendaftar yang sesuai filter\./, "filtered empty copy must remain specific");
  assert.match(source, /Coba lagi/, "error UI must let the user retry");
  assert.match(source, /Funnel seleksi santri/, "SPMB must expose its service-specific admissions funnel");
  assert.doesNotMatch(source, /fetch\("\/api\/registrations\?\$\{params\.toString\(\)\}"\)[\s\S]{0,500}\(r\)\s*=>\s*\(r\.ok\s*\?\s*r\.json\(\)\s*:\s*\[\]\)/, "registration failures must not become empty arrays");

  console.log("SPMB admin registration load-state contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
