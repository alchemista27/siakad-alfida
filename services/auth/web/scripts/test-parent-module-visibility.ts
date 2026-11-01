import assert from "node:assert/strict";
import { canSeeCoreServiceModule } from "../src/lib/module-visibility";

const parentRoles = [
  { app: "spmb", role: "orang_tua" },
  { app: "siakad", role: "orang_tua" },
] as const;

assert.equal(
  canSeeCoreServiceModule(parentRoles, "siakad"),
  true,
  "a parent must see SIAKAD only when the actual SIAKAD parent scope is assigned",
);
assert.equal(
  canSeeCoreServiceModule(parentRoles, "simpeg"),
  false,
  "a parent scope must not grant unrelated core services",
);
assert.equal(
  canSeeCoreServiceModule([{ app: "spmb", role: "orang_tua" }], "siakad"),
  false,
  "an SPMB-only parent assignment must not imply SIAKAD access",
);

console.log("Auth parent module visibility contract passed");
