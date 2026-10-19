import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { UnitIdentityService } from "../src/unit-identity/unit-identity.service";
import { isAllowedUnitCloudinaryUrl } from "../src/unit-identity/unit-identity-cloudinary.policy";

const unitId = "11111111-1111-4111-8111-111111111111";
const otherUnitId = "22222222-2222-4222-8222-222222222222";
const logoUrl = `https://res.cloudinary.com/hb1ropwm/image/upload/v1/units/${unitId}/logo/logo.png`;
const signatureUrl = `https://res.cloudinary.com/hb1ropwm/image/upload/v1/units/${unitId}/principal-signature/signature.png`;

assert.equal(isAllowedUnitCloudinaryUrl(logoUrl, "hb1ropwm", unitId, "logo"), true);
assert.equal(isAllowedUnitCloudinaryUrl(signatureUrl, "hb1ropwm", unitId, "principal-signature"), true);
assert.equal(isAllowedUnitCloudinaryUrl(`https://res.cloudinary.com/hb1ropwm/image/upload/v1/units/${otherUnitId}/logo/logo.png`, "hb1ropwm", unitId, "logo"), false);
assert.equal(isAllowedUnitCloudinaryUrl("https://res.cloudinary.com/hb1ropwm/image/upload/v1/foundation/logo/logo.png", "hb1ropwm", unitId, "logo"), false);
assert.equal(isAllowedUnitCloudinaryUrl("https://example.test/units/x/logo/a.png", "hb1ropwm", unitId, "logo"), false);

const identity = { unitId, logoUrl: null, principalName: null, principalSignatureUrl: null };
const prisma = {
  unitProjection: {
    findUnique: async ({ where }: any) => where.id === unitId
      ? { id: unitId, category: "pendidikan", status: "active" }
      : { id: otherUnitId, category: "nondik", status: "active" },
  },
  unitIdentity: {
    findUnique: async () => identity,
    upsert: async ({ create, update }: any) => ({ ...identity, ...(create ?? update) }),
  },
};

const service = new UnitIdentityService(prisma as any);
const admin = { id: "admin-id", roles: [{ app: "siakad", role: "admin_unit", unitId }] };
const nondikAdmin = { id: "nondik-admin", roles: [{ app: "siakad", role: "admin_unit", unitId: otherUnitId }] };

async function run() {
  const updated = await service.updateMe(admin, { logoUrl, principalName: "Kepala Sekolah", principalSignatureUrl: signatureUrl });
  assert.equal(updated.unitId, unitId);
  assert.equal(updated.logoUrl, logoUrl);

  await assert.rejects(
    () => service.updateMe(nondikAdmin, { logoUrl }),
    (error: unknown) => error instanceof ForbiddenException,
  );
  await assert.rejects(
    () => service.updateMe(admin, { logoUrl: `https://res.cloudinary.com/hb1ropwm/image/upload/v1/units/${otherUnitId}/logo/logo.png` }),
    (error: unknown) => error instanceof BadRequestException,
  );

  console.log("SIAKAD unit identity contract passed");
}

void run();
