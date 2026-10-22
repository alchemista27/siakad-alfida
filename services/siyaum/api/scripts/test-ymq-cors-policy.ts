import assert from "node:assert/strict";
import { isTrustedSiyaumOrigin } from "../src/ymq/cors.policy";

assert.equal(isTrustedSiyaumOrigin(undefined), true);
assert.equal(isTrustedSiyaumOrigin("http://localhost:3000"), true);
assert.equal(isTrustedSiyaumOrigin("https://siyaum.alfida.or.id"), true);
assert.equal(isTrustedSiyaumOrigin("https://subdomain.alfida.or.id"), true);
assert.equal(isTrustedSiyaumOrigin("https://alfida.or.id"), false);
assert.equal(isTrustedSiyaumOrigin("https://alfida.or.id.evil.test"), false);
assert.equal(isTrustedSiyaumOrigin("http://evil.alfida.or.id"), false);
assert.equal(isTrustedSiyaumOrigin("not a url"), false);

console.log("SIYAUM YMQ CORS policy contract passed");
