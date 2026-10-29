import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { readFile } from "node:fs/promises";
import { DocumentsService } from "../src/documents/documents.service";
import { assertUploadMetadata } from "../src/documents/document-upload.policy";
import { getCloudinaryCloudName } from "../src/documents/cloudinary-upload.policy";

const registrationId = "11111111-1111-4111-8111-111111111111";
const parentId = "22222222-2222-4222-8222-222222222222";
const unitId = "33333333-3333-4333-8333-333333333333";
const documentId = "44444444-4444-4444-8444-444444444444";
const documentUrl = `https://res.cloudinary.com/test-cloud/image/upload/v1/spmb/${registrationId}/photo/student-photo.jpg`;

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
  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  expectThrows(
    "server Cloudinary cloud name must be configured",
    () => getCloudinaryCloudName(),
    BadRequestException,
  );
  process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";

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
  await complete.upsertDocument(parentId, {
    registrationId,
    documentType: "photo" as never,
    fileUrl: documentUrl,
    fileName: "photo.jpg",
    fileSize: 200,
    mimeType: "image/jpeg",
  });
  if (persisted?.fileUrl !== documentUrl || "objectKey" in persisted) {
    throw new Error("Cloudinary document completion must persist the validated Cloudinary URL in documents.file_url");
  }
  const prismaSchema = await readFile(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
  if (!/fileUrl\s+String\s+@map\("file_url"\)/.test(prismaSchema) || /objectKey\s+String\s+@map\("object_key"\)/.test(prismaSchema)) {
    throw new Error("Document Prisma model must map the Cloudinary URL to the deployed documents.file_url column");
  }

  await expectRejects(
    "document rejects another registration folder",
    () => complete.upsertDocument(parentId, {
      registrationId,
      documentType: "photo" as never,
      fileUrl: "https://res.cloudinary.com/test-cloud/image/upload/v1/spmb/other/photo/photo.jpg",
      fileName: "photo.jpg",
      fileSize: 200,
      mimeType: "image/jpeg",
    }),
    BadRequestException,
  );

  const download = new DocumentsService({
    document: {
      findUnique: async () => ({
        id: documentId,
        fileUrl: documentUrl,
        registration: { parentId, period: { unitId } },
      }),
    },
  } as any);
  const parentDownload = await download.createDownloadUrl(documentId, { id: parentId, roles: [] });
  if (parentDownload.downloadUrl !== documentUrl) {
    throw new Error("owner must receive the stored Cloudinary document URL");
  }
  await download.createDownloadUrl(documentId, {
    id: "staff-1",
    roles: [{ app: "spmb", role: "tim_spmb", unitId }],
  });
  await expectRejects(
    "foreign parent cannot open document",
    () => download.createDownloadUrl(documentId, { id: "other-parent", roles: [] }),
    ForbiddenException,
  );
  await expectRejects(
    "foreign-unit staff cannot open document",
    () => download.createDownloadUrl(documentId, {
      id: "staff-2",
      roles: [{ app: "spmb", role: "admin_unit", unitId: "other-unit" }],
    }),
    ForbiddenException,
  );

  console.log("SPMB Cloudinary document upload contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
