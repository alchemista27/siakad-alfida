import assert from "node:assert/strict";
import { getSpmbEntries, type UserRoleScope } from "@alfida/contracts";
import {
  canSeeCoreServiceModule,
  type CoreServiceModule,
} from "../src/lib/module-visibility";

const coreApps: readonly CoreServiceModule[] = ["simakin", "simpeg", "siyaum", "siakad", "siskeu"];

function visibleCoreApps(roles: readonly UserRoleScope[]): CoreServiceModule[] {
  return coreApps.filter((app) => canSeeCoreServiceModule(roles, app));
}

function spmbEntryIds(roles: readonly UserRoleScope[]): string[] {
  return getSpmbEntries(roles).map((entry) => entry.id);
}

assert.deepEqual(
  visibleCoreApps([
    { app: "simpeg", role: "pegawai" },
    { app: "siyaum", role: "peserta" },
  ]),
  ["simpeg", "siyaum"],
  "SIMPEG staff and SIYAUM participants must see exactly their assigned core services",
);

assert.deepEqual(
  visibleCoreApps([
    { app: "simpeg", role: "pegawai" },
    { app: "siakad", role: "guru" },
    { app: "siyaum", role: "peserta" },
  ]),
  ["simpeg", "siyaum", "siakad"],
  "teachers must retain every explicitly assigned core service",
);

const observerRoles: UserRoleScope[] = [
  { app: "simpeg", role: "pegawai" },
  { app: "spmb", role: "observer" },
];
assert.deepEqual(
  visibleCoreApps(observerRoles),
  ["simpeg"],
  "an SPMB observer must not gain unassigned SIMAKIN or SISKEU access",
);
assert.deepEqual(
  spmbEntryIds(observerRoles),
  ["observer"],
  "an SPMB observer must receive only the observer-specific SPMB entry",
);

assert.deepEqual(
  visibleCoreApps([{ app: "simpeg", role: "pimpinan" }]),
  ["simpeg"],
  "SIMPEG leaders must not automatically gain SIYAUM access",
);

const globalSuperAdmin: UserRoleScope[] = [{ app: "*", role: "super_admin" }];
assert.deepEqual(
  visibleCoreApps(globalSuperAdmin),
  [...coreApps],
  "a global Super Admin must see every active core service",
);
assert.deepEqual(
  spmbEntryIds(globalSuperAdmin),
  ["admin"],
  "a global Super Admin must receive the active SPMB admin entry",
);

assert.deepEqual(
  visibleCoreApps([]),
  [],
  "an empty role set must not see any active core service",
);
assert.deepEqual(spmbEntryIds([]), [], "an empty role set must not see any SPMB entry");

console.log("Auth assignment module visibility contract passed");
