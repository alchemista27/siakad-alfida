import assert from "node:assert/strict";

import { ROLE_CATALOG } from "../../../../packages/contracts/src/role-catalog";

function main() {
  assert.deepEqual(
    ROLE_CATALOG.siyaum,
    [
      "admin_ymq",
      "pembina_ymq",
      "admin_kelompok",
      "pengawas",
      "pimpinan",
      "peserta",
      "musyrif",
    ],
    "SIYAUM must expose the canonical YMQ roles while retaining musyrif for legacy assignments",
  );

  console.log("Auth YMQ role catalog contract passed");
}

main();
