import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const middleware = fs.readFileSync(path.resolve(__dirname, "../src/middleware.ts"), "utf8");
assert.match(middleware, /__Secure-better-auth\.session_token/, "middleware must support HTTPS Better Auth session cookies");
assert.match(middleware, /const isProtected = true/, "SIAKAD root must be edge-protected rather than leaving a public placeholder");
console.log("SIAKAD middleware protection contract passed");
