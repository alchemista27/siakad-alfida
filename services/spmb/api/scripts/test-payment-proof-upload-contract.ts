import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { PaymentProofCloudinaryService } from "../src/registrations/payment-proof-cloudinary.service";

const registrationId = "11111111-1111-4111-8111-111111111111";
const parentId = "22222222-2222-4222-8222-222222222222";
const unitId = "33333333-3333-4333-8333-333333333333";
const proofUrl = `https://res.cloudinary.com/test-cloud/raw/upload/v1/spmb/${registrationId}/payment-proof/transfer-proof.pdf`;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function expectRejects(label: string, fn: () => Promise<unknown>, Expected: new (...args: any[]) => Error) {
  try {
    await fn();
    throw new Error(`${label}: unexpectedly succeeded`);
  } catch (error) {
    if (error instanceof Error && error.message.endsWith("unexpectedly succeeded")) throw error;
    if (!(error instanceof Expected)) {
      throw new Error(`${label}: expected ${Expected.name}, received ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

function registration(status = "pending_payment") {
  return {
    id: registrationId,
    parentId,
    status,
    period: { unitId, fee: 250000 },
    payment: { registrationId, amount: 250000, status: "pending" },
  };
}

async function run() {
  process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";

  let paymentUpdate: Record<string, unknown> | undefined;
  let registrationUpdate: Record<string, unknown> | undefined;
  let eventCreate: Record<string, unknown> | undefined;
  const service = new PaymentProofCloudinaryService({
    payment: {
      upsert: async ({ update }: any) => {
        paymentUpdate = update;
        return { registrationId, ...update };
      },
    },
    registrationEvent: { create: async ({ data }: any) => { eventCreate = data; return data; } },
    registration: {
      findUnique: async () => registration(),
      update: async ({ data }: any) => {
        registrationUpdate = data;
        return { ...registration(), ...data };
      },
    },
    $transaction: async (operations: any[]) => Promise.all(operations),
  } as any);

  await service.recordUpload(registrationId, parentId, {
    fileUrl: proofUrl,
    fileName: "transfer-proof.pdf",
    mimeType: "application/pdf",
    fileSize: 300,
  });
  assert(paymentUpdate?.proofUrl === proofUrl, "payment proof must persist its Cloudinary URL");
  assert(paymentUpdate?.proofObjectKey === null, "Cloudinary proof uploads must not persist an S3 object key");
  assert(paymentUpdate?.status === "uploaded", "upload must mark the payment uploaded");
  assert(registrationUpdate?.status === "payment_uploaded", "upload must advance the registration atomically");
  assert(eventCreate?.toStatus === "payment_uploaded", "upload must audit the transition");

  await expectRejects(
    "another parent cannot submit a payment proof",
    () => service.recordUpload(registrationId, "other-parent", { fileUrl: proofUrl, fileName: "transfer-proof.pdf", mimeType: "application/pdf", fileSize: 300 }),
    ForbiddenException,
  );
  await expectRejects(
    "payment proof rejects a URL outside the registration folder",
    () => service.recordUpload(registrationId, parentId, { fileUrl: "https://res.cloudinary.com/test-cloud/raw/upload/v1/spmb/other/payment-proof/proof.pdf", fileName: "transfer-proof.pdf", mimeType: "application/pdf", fileSize: 300 }),
    BadRequestException,
  );
  await expectRejects(
    "payment proof rejects an external URL",
    () => service.recordUpload(registrationId, parentId, { fileUrl: "https://example.test/proof.pdf", fileName: "transfer-proof.pdf", mimeType: "application/pdf", fileSize: 300 }),
    BadRequestException,
  );

  const download = new PaymentProofCloudinaryService({
    registration: {
      findUnique: async () => ({
        ...registration("payment_uploaded"),
        payment: { registrationId, proofUrl },
      }),
    },
  } as any);
  const ownerResult = await download.createDownloadUrl(registrationId, { id: parentId, roles: [] });
  assert(ownerResult.downloadUrl === proofUrl, "authorized owner must receive the Cloudinary proof URL");
  await download.createDownloadUrl(registrationId, { id: "staff-1", roles: [{ app: "spmb", role: "tim_spmb", unitId }] });
  await expectRejects(
    "foreign parent cannot open payment proof",
    () => download.createDownloadUrl(registrationId, { id: "other-parent", roles: [] }),
    ForbiddenException,
  );

  console.log("SPMB Cloudinary payment proof contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
