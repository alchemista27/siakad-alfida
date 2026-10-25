import assert from "node:assert/strict";
import { isParentOnlyPortalUser } from "../src/lib/module-visibility";

assert.equal(
  isParentOnlyPortalUser([
    { app: "spmb", role: "orang_tua" },
    { app: "siakad", role: "orang_tua" },
  ]),
  true,
  "the two standard parent scopes must use the restricted catalog",
);
assert.equal(
  isParentOnlyPortalUser([{ app: "spmb", role: "orang_tua" }]),
  true,
  "a parent-only account with one returned scope must still be restricted",
);
assert.equal(
  isParentOnlyPortalUser([]),
  false,
  "an unresolved/empty role list must not masquerade as a parent account",
);
assert.equal(
  isParentOnlyPortalUser([
    { app: "spmb", role: "orang_tua" },
    { app: "siakad", role: "guru" },
  ]),
  false,
  "multi-role accounts must retain the non-parent catalog",
);

console.log("Auth parent-only module visibility contract passed");
