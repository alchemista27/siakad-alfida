import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "src/components/foundation-asset-uploader.tsx"), "utf8");

assert.match(source, /api\.cloudinary\.com\/v1_1/);
assert.match(source, /upload_preset/);
assert.match(source, /foundation\/logo/);
assert.match(source, /foundation\/favicon/);
assert.match(source, /foundation\/chairman-signature/);
assert.match(source, /NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME/);
assert.match(source, /NEXT_PUBLIC_CLOUDINARY_FOUNDATION_UPLOAD_PRESET/);
assert.doesNotMatch(source, /foundation-assets\/presign/);
assert.doesNotMatch(source, /S3_|MINIO_|x-amz-tagging/);

console.log("Foundation Cloudinary upload UI contract passed");
