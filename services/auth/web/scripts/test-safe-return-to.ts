import assert from "node:assert/strict";
import { safeReturnTo } from "../src/lib/safe-return-to";

const authOrigin = "https://auth.alfida.or.id";

assert.equal(safeReturnTo("/modules", authOrigin), "/modules");
assert.equal(safeReturnTo("/modules?tab=staff", authOrigin), "/modules?tab=staff");
assert.equal(safeReturnTo("https://spmb.alfida.or.id/parent", authOrigin), "https://spmb.alfida.or.id/parent");
assert.equal(safeReturnTo("https://attacker.example/steal", authOrigin), "/modules");
assert.equal(safeReturnTo("//attacker.example", authOrigin), "/modules");
assert.equal(safeReturnTo("javascript:alert(1)", authOrigin), "/modules");
assert.equal(safeReturnTo("https://auth.alfida.or.id.evil.test", authOrigin), "/modules");
assert.equal(safeReturnTo("  ", authOrigin), "/modules");

console.log("Auth safe return_to contract passed");
