import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "src/app/admin/unit-identity/page.tsx",
  "src/components/unit-identity-form.tsx",
  "src/components/unit-asset-uploader.tsx",
];

for (const file of requiredFiles) {
  assert.equal(existsSync(resolve(root, file)), true, `missing unit identity UI file: ${file}`);
}

const page = readFileSync(resolve(root, "src/app/admin/unit-identity/page.tsx"), "utf8");
const form = readFileSync(resolve(root, "src/components/unit-identity-form.tsx"), "utf8");
const uploader = readFileSync(resolve(root, "src/components/unit-asset-uploader.tsx"), "utf8");

assert.match(page, /SiakadAuthGate/, "identity page must preserve SIAKAD authorization UI");
assert.match(page, /AppShell activePath="\/admin\/unit-identity"/, "identity page must render within the operational shell");
assert.match(form, /siakadApiFetch<.*>\("\/unit-identity\/me"\)/s, "identity form must load only the caller-scoped identity endpoint");
assert.match(form, /"\/unit-identity\/me"/, "identity form must patch only the caller-scoped identity endpoint");
assert.doesNotMatch(form, /unit-identity\/\$\{/, "identity form must not select a unit through the URL");
assert.doesNotMatch(form, /type=["']url["']/, "identity form must not expose raw URL inputs");
assert.doesNotMatch(form, /name=["']unitId["']/, "identity form must not expose an editable unit ID");
assert.match(form, /method:\s*"PATCH"/, "identity form must persist changes with PATCH");
assert.match(form, /JSON\.stringify\(\{\s*logoUrl,/s, "identity form must patch uploaded secure URLs");
assert.match(form, /InlineNotice/, "identity form must render status and error feedback inline");
assert.doesNotMatch(form, /alert\(|confirm\(/, "identity form may not use blocking browser dialogs");

assert.match(uploader, /api\.cloudinary\.com\/v1_1/, "assets must upload directly to Cloudinary");
assert.match(uploader, /NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME/, "uploader must use the public Cloudinary cloud name");
assert.match(uploader, /NEXT_PUBLIC_CLOUDINARY_UNIT_UPLOAD_PRESET/, "uploader must prefer the unit upload preset");
assert.match(uploader, /NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET/, "uploader must fall back to the shared upload preset");
assert.match(uploader, /alfida_unsigned/, "uploader must provide the documented unsigned preset fallback");
assert.match(uploader, /units\/\$\{unitId\}\/logo/, "logo uploads must use the caller unit folder");
assert.match(uploader, /units\/\$\{unitId\}\/principal-signature/, "signature uploads must use the caller unit folder");
assert.match(uploader, /upload_preset/, "uploader must send the unsigned preset");
assert.match(uploader, /secure_url/, "uploader must return Cloudinary secure URLs only");
assert.match(uploader, /mimeTypes\.includes\(file\.type\)/, "uploader must validate allowed file types");
assert.match(uploader, /file\.size <= 0 \|\| file\.size > rule\.maxBytes/, "uploader must validate file size");
assert.match(uploader, /"error" in payload/, "uploader must parse nested Cloudinary errors");
assert.match(uploader, /"message" in error/, "uploader must surface nested Cloudinary error messages");
assert.doesNotMatch(uploader, /alert\(|confirm\(/, "uploader may not use blocking browser dialogs");

console.log("SIAKAD unit identity UI contract passed");
