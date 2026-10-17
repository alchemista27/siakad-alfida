import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { DocumentsService } from "../src/documents/documents.service";
import { assertUploadMetadata } from "../src/documents/document-upload.policy";

const registrationId = "11111111-1111-4111-8111-111111111111";
const parentId = "22222222-2222-4222-8222-222222222222";
const unitId = "33333333-3333-4333-8333-333333333333";
const documentId = "44444444-4444-4444-8444-444444444444";

function expectThrows(label: string, fn: () => unknown, Expected: new (...args: any[]) => Error) {
  try {
    fn();
    throw new Error(`${label}: unexpectedly succeeded`);
  } catch (error) {
    if (error instanceof Error && error.message.endsWith("unexpectedly succeeded")) throw error;
    if (!(error instanceof Expected)) {
      throw new Error(`${label}: expected ${Expected.name}, received ${error instanceof Error ? error.message : String(error)}`);
    }
  }
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

function registration(status = "documents_uploaded") {
  return { id: registrationId, parentId, status };
}

async function run() {
  process.env.S3_BUCKET = "spmb-private";
  process.env.S3_ENDPOINT = "http://object-store.test";
  process.env.S3_ACCESS_KEY = "test-access-key";
  process.env.S3_SECRET_KEY = "test-secret-key";

  assertUploadMetadata({ documentType: "photo", fileName: "photo.jpg", mimeType: "image/jpeg", fileSize: 2 * 1024 * 1024 });
  expectThrows(
    "mime must match extension",
    () => assertUploadMetadata({ documentType: "photo", fileName: "photo.pdf", mimeType: "image/jpeg", fileSize: 100 }),
    BadRequestException,
  );
  expectThrows(
    "photo cannot be a PDF",
    () => assertUploadMetadata({ documentType: "photo", fileName: "photo.pdf", mimeType: "application/pdf", fileSize: 100 }),
    BadRequestException,
  );
  expectThrows(
    "size limit is enforced",
    () => assertUploadMetadata({ documentType: "family_card", fileName: "family.pdf", mimeType: "application/pdf", fileSize: 5 * 1024 * 1024 + 1 }),
    BadRequestException,
  );

  const presign = new DocumentsService({
    registration: { findUnique: async () => registration() },
  } as any);
  const signed = await presign.presignUpload(parentId, {
    registrationId,
    documentType: "photo" as never,
    fileName: "photo.jpg",
    mimeType: "image/jpeg",
    fileSize: 200,
  });
  if ("fileUrl" in signed || !("uploadUrl" in signed) || !("objectKey" in signed)) {
    throw new Error("presign must return only a private upload URL and server-generated objectKey");
  }
  if (!new RegExp(`^spmb/${registrationId}/photo/[0-9a-f-]+\\.jpg$`).test(signed.objectKey)) {
    throw new Error("presign key must be server-generated and document-type scoped");
  }

  let persisted: Record<string, unknown> | undefined;
  const complete = new DocumentsService({
    registration: { findUnique: async () => registration() },
    document: {
      findFirst: async () => ({ id: documentId }),
      update: async ({ data }: any) => {
        persisted = data;
        return { id: documentId, ...data };
      },
      create: async ({ data }: any) => ({ id: documentId, ...data }),
    },
  } as any);
  (complete as any).s3Client = {
    send: async () => ({
      ContentType: "image/jpeg",
      ContentLength: 200,
      Metadata: {
        "registration-id": registrationId,
        "document-type": "photo",
        "file-name": encodeURIComponent("photo.jpg"),
      },
    }),
  };
  await complete.upsertDocument(parentId, {
    registrationId,
    documentType: "photo" as never,
    objectKey: signed.objectKey,
    fileName: "photo.jpg",
    fileSize: 200,
    mimeType: "image/jpeg",
  });
  if (!persisted?.objectKey || "fileUrl" in persisted) {
    throw new Error("completion must persist objectKey and never persist a caller URL");
  }

  await expectRejects(
    "completion rejects another registration prefix",
    () => complete.upsertDocument(parentId, {
      registrationId,
      documentType: "photo" as never,
      objectKey: `spmb/other-registration/photo/11111111-1111-4111-8111-111111111111.jpg`,
      fileName: "photo.jpg",
      fileSize: 200,
      mimeType: "image/jpeg",
    }),
    BadRequestException,
  );

  let getSignedUrlCalls = 0;
  const download = new DocumentsService({
    document: {
      findUnique: async () => ({
        id: documentId,
        objectKey: signed.objectKey,
        registration: { parentId, period: { unitId } },
      }),
    },
  } as any);
  (download as any).s3Client = { send: async () => ({}) };
  (download as any).createSignedDownloadUrl = async () => {
    getSignedUrlCalls += 1;
    return "https://signed.example.test/private";
  };
  const parentDownload = await download.createDownloadUrl(documentId, { id: parentId, roles: [] });
  if (parentDownload.downloadUrl !== "https://signed.example.test/private" || getSignedUrlCalls !== 1) {
    throw new Error("owner must receive a short-lived signed download URL");
  }
  await download.createDownloadUrl(documentId, {
    id: "staff-1",
    roles: [{ app: "spmb", role: "tim_ppdb", unitId }],
  });
  await expectRejects(
    "foreign parent cannot download private document",
    () => download.createDownloadUrl(documentId, { id: "other-parent", roles: [] }),
    ForbiddenException,
  );
  await expectRejects(
    "foreign-unit staff cannot download private document",
    () => download.createDownloadUrl(documentId, {
      id: "staff-2",
      roles: [{ app: "spmb", role: "admin_unit", unitId: "other-unit" }],
    }),
    ForbiddenException,
  );

  console.log("SPMB document upload contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
