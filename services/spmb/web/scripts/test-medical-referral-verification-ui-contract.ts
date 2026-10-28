import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const pagePath = resolve(root, "src/app/verify/medical-referral/[verificationToken]/page.tsx");
const middleware = readFileSync(resolve(root, "src/middleware.ts"), "utf8");

assert(existsSync(pagePath), "public medical referral verification page is required");
const page = readFileSync(pagePath, "utf8");
assert.match(page, /api\/public\/medical-referrals/, "verification page must use the narrow public verifier");
assert.match(page, /cache:\s*["']no-store["']/, "verification page must not cache verification results");
assert.match(page, /Surat tidak dapat diverifikasi/, "invalid token response must stay generic");
assert.doesNotMatch(middleware, /"\/verify"/, "verification page must remain public");

console.log("SPMB medical referral verification UI contract passed");
