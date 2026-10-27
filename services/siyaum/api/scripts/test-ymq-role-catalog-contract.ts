import assert from "node:assert/strict";

import { ROLE_CATALOG } from "../../../../packages/contracts/src/role-catalog";

assert.ok(!ROLE_CATALOG.siyaum.includes("musyrif" as never), "The canonical role catalog must remove musyrif");
assert.ok(ROLE_CATALOG.siyaum.includes("pembina_ymq"), "Pembina YMQ is the verifier role");
console.log("SIYAUM role catalog contract passed");
