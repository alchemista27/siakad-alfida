import assert from "node:assert/strict";
import { getSpmbEntries } from "../src/spmb-entry";

const entryIds = (roles: Parameters<typeof getSpmbEntries>[0]) =>
  getSpmbEntries(roles).map((entry) => entry.id);

assert.deepEqual(
  entryIds([{ app: "spmb", role: "orang_tua" }]),
  ["parent"],
  "parent must enter only the parent portal",
);
assert.deepEqual(
  entryIds([{ app: "spmb", role: "admin_unit", unitId: "unit-a" }]),
  ["admin"],
  "unit admin must enter only the committee portal",
);
assert.deepEqual(
  entryIds([{ app: "spmb", role: "tim_ppdb", unitId: "unit-a" }]),
  ["admin"],
  "committee member must enter the committee portal",
);
assert.deepEqual(
  entryIds([{ app: "spmb", role: "observer", unitId: "unit-a" }]),
  ["observer"],
  "observer must enter only the observer portal",
);
assert.deepEqual(
  entryIds([
    { app: "spmb", role: "orang_tua" },
    { app: "spmb", role: "admin_unit", unitId: "unit-a" },
  ]),
  ["parent", "admin"],
  "multi-role account must retain both parent and committee entry choices",
);
assert.deepEqual(
  entryIds([{ app: "simpeg", role: "pegawai" }]),
  [],
  "a foreign-app role must not be treated as an SPMB parent",
);
assert.deepEqual(
  entryIds([{ app: "auth", role: "super_admin" }]),
  ["admin"],
  "central super admin must enter the SPMB admin portal",
);

console.log("SPMB entry route contract passed");
