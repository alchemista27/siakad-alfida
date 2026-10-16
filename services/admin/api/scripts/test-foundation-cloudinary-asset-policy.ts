import assert from "node:assert/strict";
import { BadRequestException } from "@nestjs/common";
import { FoundationService } from "../src/foundation/foundation.service";
import { isAllowedFoundationCloudinaryUrl } from "../src/foundation/foundation-cloudinary-asset.policy";

const cloud = "example";

assert.equal(
  isAllowedFoundationCloudinaryUrl(
    "https://res.cloudinary.com/example/image/upload/v1/foundation/logo/abc.png",
    cloud,
  ),
  true,
);
assert.equal(
  isAllowedFoundationCloudinaryUrl(
    "https://res.cloudinary.com/example/image/upload/v1/foundation/chairman-signature/abc.webp",
    cloud,
  ),
  true,
);
assert.equal(
  isAllowedFoundationCloudinaryUrl(
    "https://res.cloudinary.com/example/image/upload/v1/foundation/favicon/abc.svg",
    cloud,
  ),
  true,
);
assert.equal(
  isAllowedFoundationCloudinaryUrl(
    "https://res.cloudinary.com/example/image/upload/v1/other-folder/abc.png",
    cloud,
  ),
  false,
);
assert.equal(
  isAllowedFoundationCloudinaryUrl(
    "https://evil.example/foundation/logo/abc.png",
    cloud,
  ),
  false,
);
assert.equal(
  isAllowedFoundationCloudinaryUrl(
    "https://res.cloudinary.com/other/image/upload/v1/foundation/logo/abc.png",
    cloud,
  ),
  false,
);
assert.equal(isAllowedFoundationCloudinaryUrl(null, cloud), true);

async function main() {
  const previousCloud = process.env.CLOUDINARY_CLOUD_NAME;
  process.env.CLOUDINARY_CLOUD_NAME = cloud;
  const existing = { id: "foundation-id", logoUrl: null, faviconUrl: null, chairmanSignatureUrl: null };
  const prisma = {
    foundationSettings: {
      findFirst: async () => existing,
      update: async ({ data }: { data: Record<string, unknown> }) => ({ ...existing, ...data }),
    },
  };
  const service = new FoundationService(prisma as never);
  const base = {
    foundationName: "Yayasan Alfida",
    faviconUrl: "",
    chairmanName: "",
    chairmanSignatureUrl: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountHolder: "",
    address: "",
    phone: "",
    email: "",
  };
  await assert.rejects(
    () => service.updateSettings({ ...base, logoUrl: "https://s3.alfida.or.id/foundation/logo.png" }),
    BadRequestException,
  );
  const updated = await service.updateSettings({
    ...base,
    logoUrl: "https://res.cloudinary.com/example/image/upload/v1/foundation/logo/official.png",
  });
  assert.equal(updated.data.logoUrl, "https://res.cloudinary.com/example/image/upload/v1/foundation/logo/official.png");
  if (previousCloud === undefined) delete process.env.CLOUDINARY_CLOUD_NAME;
  else process.env.CLOUDINARY_CLOUD_NAME = previousCloud;
  console.log("Foundation Cloudinary asset policy contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
