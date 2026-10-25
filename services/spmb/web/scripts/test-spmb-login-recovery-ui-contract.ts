import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const selector = readFileSync(resolve(root, "src/components/spmb-entry-selector.tsx"), "utf8");

assert.match(selector, /SsoClientError/, "entry selector must distinguish SSO error kinds");
assert.match(selector, /Coba lagi/, "entry selector must provide a retry action");
assert.match(selector, /retryKey/, "entry selector retry must rerun the SSO lookup");
assert.match(selector, /kind === "unauthorized"/, "only an explicit unauthorized error may redirect to login");
assert.doesNotMatch(selector, /Internal Server Error/, "entry selector must not expose raw upstream errors");

console.log("SPMB login recovery UI contract passed");
