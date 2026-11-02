import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseFoundationBranding } from "../src/lib/foundation-branding";

assert.deepEqual(parseFoundationBranding({
  foundationName: "Yayasan Alfida",
  logoUrl: "https://res.cloudinary.com/example/image/upload/foundation/logo/official.png",
}), {
  foundationName: "Yayasan Alfida",
  logoUrl: "https://res.cloudinary.com/example/image/upload/foundation/logo/official.png",
});
assert.equal(parseFoundationBranding({ foundationName: 123, logoUrl: "https://evil.example/logo.png" }).logoUrl, null);
assert.deepEqual(parseFoundationBranding(null), { foundationName: "Yayasan Alfida", logoUrl: null });

const component = resolve(import.meta.dirname, "../src/components/foundation-logo.tsx");
assert.ok(existsSync(component), "FoundationLogo component must exist");
const source = readFileSync(component, "utf8");
assert.match(source, /onError/);
assert.match(source, /resizeMode="contain"/);
console.log("foundation branding contract passed");
