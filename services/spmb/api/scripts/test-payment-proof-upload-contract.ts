import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { PaymentProofStorageService } from "../src/registrations/payment-proof-storage.service";

const registrationId = "11111111-1111-4111-8111-111111111111";
const parentId = "22222222-2222-4222-8222-222222222222";
const unitId = "33333333-3333-4333-8333-333333333333";

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
    period: { unitId },
    payment: { registrationId, amount: 250000, status: "pending" },
  };
}

async function run() {
  process.env.S3_BUCKET = "spmb-private";
  process.env.S3_ENDPOINT = "http://object-store.test";
  process.env.S3_ACCESS_KEY = "test-access-key";
  process.env.S3_SECRET_KEY = "test-secret-key";

  const storage = new PaymentProofStorageService({
    registration: { findUnique: async () => registration() },
  } as any);
  const signed = await storage.presignUpload(registrationId, parentId, {
    fileName: "transfer.png",
    mimeType: "image/png",
    fileSize: 300,
  });
  assert("uploadUrl" in signed && "objectKey" in signed, "presign must return a private upload URL and server-owned object key");
  assert(!("proofUrl" in signed), "presign must never return or accept a public proof URL");
  assert(
    new RegExp(`^spmb/${registrationId}/payment-proof/[0-9a-f-]+\\.png$`).test(signed.objectKey),
    "payment proof key must be server-generated and registration scoped",
  );

  let paymentUpdate: Record<string, unknown> | undefined;
  let registrationUpdate: Record<string, unknown> | undefined;
  let eventCreate: Record<string, unknown> | undefined;
  const complete = new PaymentProofStorageService({
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
  (complete as any).s3Client = {
    send: async () => ({
      ContentType: "image/png",
      ContentLength: 300,
      Metadata: {
        "registration-id": registrationId,
        "payment-proof": "true",
        "file-name": encodeURIComponent("transfer.png"),
      },
    }),
  };
  await complete.finalizeUpload(registrationId, parentId, {
    objectKey: signed.objectKey,
    fileName: "transfer.png",
    mimeType: "image/png",
    fileSize: 300,
  });
  assert(paymentUpdate?.proofObjectKey === signed.objectKey, "finalize must persist only the server-generated private object key");
  assert(paymentUpdate?.proofUrl === null, "new proof uploads must not persist public proof URLs");
  assert(paymentUpdate?.status === "uploaded", "finalize must mark the payment uploaded");
  assert(registrationUpdate?.status === "payment_uploaded", "finalize must advance the registration atomically");
  assert(eventCreate?.toStatus === "payment_uploaded", "finalize must audit the transition");

  await expectRejects(
    "other parent cannot request a payment-proof upload URL",
    () => storage.presignUpload(registrationId, "other-parent", { fileName: "transfer.png", mimeType: "image/png", fileSize: 300 }),
    ForbiddenException,
  );
  await expectRejects(
    "payment proof upload rejects a non-pending registration",
    () => new PaymentProofStorageService({ registration: { findUnique: async () => registration("payment_verified") } } as any)
      .presignUpload(registrationId, parentId, { fileName: "transfer.png", mimeType: "image/png", fileSize: 300 }),
    BadRequestException,
  );

  const download = new PaymentProofStorageService({
    registration: {
      findUnique: async () => ({
        ...registration("payment_uploaded"),
        payment: { registrationId, proofObjectKey: signed.objectKey },
      }),
    },
  } as any);
  (download as any).createSignedDownloadUrl = async () => "https://signed.example.test/private-proof";
  const ownerResult = await download.createDownloadUrl(registrationId, { id: parentId, roles: [] });
  assert(ownerResult.downloadUrl === "https://signed.example.test/private-proof", "owner must receive a short-lived proof URL");
  await download.createDownloadUrl(registrationId, { id: "staff-1", roles: [{ app: "spmb", role: "tim_ppdb", unitId }] });
  await expectRejects(
    "foreign parent cannot download payment proof",
    () => download.createDownloadUrl(registrationId, { id: "other-parent", roles: [] }),
    ForbiddenException,
  );

  console.log("SPMB payment proof upload contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
