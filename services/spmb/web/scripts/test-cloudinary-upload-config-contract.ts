import assert from "node:assert/strict";
import { resolveSpmbCloudinaryUploadConfig, validateSpmbUploadFile } from "../src/lib/spmb-registration";

assert.deepEqual(
  resolveSpmbCloudinaryUploadConfig({
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "alfida-cloud",
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: "spmb_unsigned",
  }),
  { cloudName: "alfida-cloud", uploadPreset: "spmb_unsigned" },
);

assert.throws(
  () => resolveSpmbCloudinaryUploadConfig({ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "alfida-cloud" }),
  /Konfigurasi upload Cloudinary belum tersedia/,
);

assert.throws(
  () => validateSpmbUploadFile({ type: "application/pdf", size: 5 * 1024 * 1024 + 1, name: "hasil.pdf" } as File),
  /maksimal 5 MB/,
);

assert.throws(
  () => validateSpmbUploadFile({ type: "image/jpeg", size: 2 * 1024 * 1024 + 1, name: "hasil.jpg" } as File),
  /maksimal 2 MB/,
);

validateSpmbUploadFile({ type: "application/pdf", size: 5 * 1024 * 1024, name: "hasil.pdf" } as File);
console.log("SPMB Cloudinary upload configuration contract passed");
