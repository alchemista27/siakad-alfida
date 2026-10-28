import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const page = readFileSync(resolve(root, "src/app/settings/page.tsx"), "utf8");
const uploader = readFileSync(resolve(root, "src/components/foundation-asset-uploader.tsx"), "utf8");

assert.match(page, /id="foundation-settings-form"/, "foundation settings form must have a stable id");
assert.match(page, /form="foundation-settings-form"/, "header save action must submit the foundation form");
assert.match(page, /type="submit"/, "settings must expose a submit button");
assert.match(page, /Simpan Perubahan/, "settings must label its submit action clearly");
assert.doesNotMatch(page, /chairmanSignatureUrl|chairman_signature/, "foundation settings must not collect a signature upload");
assert.doesNotMatch(uploader, /chairman_signature|chairman-signature/, "foundation uploader must not expose a signature asset kind");

console.log("Foundation settings save contract passed");
