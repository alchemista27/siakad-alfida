import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const relativePath = "src/components/ymq-progress-evidence-uploader.tsx";
const target = path.join(root, relativePath);
assert.ok(existsSync(target), `Expected ${relativePath} to exist`);
const source = readFileSync(target, "utf8");

assert.match(source, /https:\/\/api\.cloudinary\.com\/v1_1\//);
assert.match(source, /NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME/);
assert.match(source, /NEXT_PUBLIC_CLOUDINARY_YMQ_UPLOAD_PRESET\s*\|\|\s*process\.env\.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET/);
assert.match(source, /secure_url/);
assert.match(source, /public_id/);
assert.match(source, /payload\.error\?\.message|payload\.error\.message/);
assert.match(source, /siyaum\/ymq\/\$\{groupId\}\/\$\{sessionId\}/);
assert.match(source, /\/learning-progress\/\$\{progressId\}\/evidence/);
assert.match(source, /NotificationModal/);
assert.ok(!/type=["']text["']/.test(source), "Evidence uploader must not expose an editable URL field");
assert.ok(!/\balert\s*\(/.test(source), "Evidence uploader must not use alert()");
assert.ok(!/\bconfirm\s*\(/.test(source), "Evidence uploader must not use confirm()");

console.log("SIYAUM YMQ Cloudinary upload UI contract passed");
