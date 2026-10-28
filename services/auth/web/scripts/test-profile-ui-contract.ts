import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (relative: string) => {
  const file = resolve(root, relative);
  assert.ok(existsSync(file), `Missing ${relative}`);
  return readFileSync(file, "utf8");
};

const page = read("src/app/profile/page.tsx");
const form = read("src/components/profile-form.tsx");
const uploader = read("src/components/profile-avatar-uploader.tsx");

assert.match(page, /ProfileForm/);
assert.match(form, /\/api\/auth\/me/, "profile form must load and save through current-user endpoint");
assert.match(form, /method:\s*"PATCH"/, "profile save must be PATCH");
assert.match(form, /\/api\/auth\/me\/password/, "password update must use dedicated endpoint");
assert.match(form, /currentPassword/);
assert.match(form, /newPassword/);
assert.match(form, /confirmPassword/);
assert.match(form, /Nama Lengkap/);
assert.match(form, /Email/);
assert.match(form, /Nomor HP/);
assert.match(uploader, /image\/png,image\/jpeg,image\/webp/);
assert.match(uploader, /auth\/user\/\$\{userId\}\/avatar/);
assert.match(uploader, /NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET/);
assert.match(uploader, /role="status"/);
assert.doesNotMatch(`${form}\n${uploader}`, /\balert\s*\(/);
assert.doesNotMatch(`${form}\n${uploader}`, /\bconfirm\s*\(/);

console.log("Auth profile UI contract passed");
