import assert from "node:assert/strict";
import { isAllowedCorsOrigin } from "../src/common/cors-policy";
import { SIAKAD_ALLOWED_ORIGINS } from "../src/main";

assert.equal(isAllowedCorsOrigin("https://siakad.alfida.or.id", SIAKAD_ALLOWED_ORIGINS), true);
assert.equal(isAllowedCorsOrigin("https://auth.alfida.or.id", SIAKAD_ALLOWED_ORIGINS), true);
assert.equal(isAllowedCorsOrigin("http://localhost:3000", SIAKAD_ALLOWED_ORIGINS), true);
assert.equal(isAllowedCorsOrigin("https://admin.alfida.or.id", SIAKAD_ALLOWED_ORIGINS), false);
assert.equal(isAllowedCorsOrigin("https://untrusted.alfida.or.id", SIAKAD_ALLOWED_ORIGINS), false);
assert.equal(isAllowedCorsOrigin("https://siakad.alfida.or.id.evil.test", SIAKAD_ALLOWED_ORIGINS), false);
assert.equal(isAllowedCorsOrigin("invalid", SIAKAD_ALLOWED_ORIGINS), false);

console.log("SIAKAD CORS policy contract passed");
