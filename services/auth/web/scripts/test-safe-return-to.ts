import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { safeReturnTo } from "../src/lib/safe-return-to";

const authOrigin = "https://auth.alfida.or.id";
const middleware = readFileSync(resolve(import.meta.dirname, "../src/middleware.ts"), "utf8");

assert.equal(safeReturnTo("/modules", authOrigin), "/modules");
assert.equal(safeReturnTo("/modules?tab=staff", authOrigin), "/modules?tab=staff");
assert.equal(safeReturnTo("https://spmb.alfida.or.id/parent", authOrigin), "https://spmb.alfida.or.id/parent");
assert.equal(safeReturnTo("https://siyaum.alfida.or.id", authOrigin), "https://siyaum.alfida.or.id/");
assert.equal(safeReturnTo("https://attacker.example/steal", authOrigin), "/modules");
assert.equal(safeReturnTo("//attacker.example", authOrigin), "/modules");
assert.equal(safeReturnTo("javascript:alert(1)", authOrigin), "/modules");
assert.equal(safeReturnTo("https://auth.alfida.or.id.evil.test", authOrigin), "/modules");
assert.equal(safeReturnTo("  ", authOrigin), "/modules");
assert.match(middleware, /const returnTo = `\$\{pathname\}\$\{request\.nextUrl\.search\}`/, "middleware must derive return_to from the public path, not proxy-internal request URL");
assert.match(middleware, /searchParams\.set\("return_to", returnTo\)/, "middleware must preserve the requested local route after login");

console.log("Auth safe return_to contract passed");
