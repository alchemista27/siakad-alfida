import assert from "node:assert/strict";

import { ROLE_CATALOG } from "../../../../packages/contracts/src/role-catalog";

function main() {
  assert.deepEqual(
    ROLE_CATALOG.siyaum,
    ["admin_ymq", "pembina_ymq", "admin_kelompok", "pengawas", "pimpinan", "peserta"],
    "SIYAUM must expose only the current canonical YMQ roles",
  );
  assert.equal(
    ROLE_CATALOG.simpeg.includes("pimpinan" as never),
    true,
    "SIMPEG must expose pimpinan as a canonical role",
  );
  console.log("Auth YMQ role catalog contract passed");
}

main();
