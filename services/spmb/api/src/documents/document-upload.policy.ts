import { BadRequestException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { DocumentType } from "../generated/prisma";

export const ACCEPTED_UPLOADS = {
  "image/jpeg": { extensions: ["jpg", "jpeg"], maxBytes: 2 * 1024 * 1024 },
  "image/png": { extensions: ["png"], maxBytes: 2 * 1024 * 1024 },
  "application/pdf": { extensions: ["pdf"], maxBytes: 5 * 1024 * 1024 },
} as const;

export type UploadMetadata = {
  documentType: DocumentType;
  fileName: string;
  mimeType: string;
  fileSize: number;
};

const PHOTO_MIME_TYPES = new Set(["image/jpeg", "image/png"]);

export function getFileExtension(fileName: string): string {
  if (!fileName || fileName.includes("/") || fileName.includes("\\") || fileName.startsWith(".")) {
    throw new BadRequestException("Nama berkas tidak valid.");
  }
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension || extension === fileName.toLowerCase()) {
    throw new BadRequestException("Nama berkas harus memiliki ekstensi.");
  }
  return extension;
}

export function assertUploadMetadata(metadata: UploadMetadata): void {
  const accepted = ACCEPTED_UPLOADS[metadata.mimeType as keyof typeof ACCEPTED_UPLOADS];
  if (!accepted) {
    throw new BadRequestException("Tipe MIME berkas tidak diizinkan.");
  }
  const extension = getFileExtension(metadata.fileName);
  if (!(accepted.extensions as readonly string[]).includes(extension)) {
    throw new BadRequestException("Ekstensi berkas tidak sesuai dengan tipe MIME.");
  }
  if (!Number.isSafeInteger(metadata.fileSize) || metadata.fileSize <= 0 || metadata.fileSize > accepted.maxBytes) {
    throw new BadRequestException("Ukuran berkas tidak diizinkan.");
  }
  if (metadata.documentType === DocumentType.photo && !PHOTO_MIME_TYPES.has(metadata.mimeType)) {
    throw new BadRequestException("Dokumen foto harus berformat JPEG atau PNG.");
  }
}

export function createDocumentObjectKey(registrationId: string, documentType: DocumentType, extension: string): string {
  return `spmb/${registrationId}/${documentType}/${randomUUID()}.${extension}`;
}

export function assertDocumentObjectKey(registrationId: string, documentType: DocumentType, objectKey: string, extension: string): void {
  const escapedRegistrationId = registrationId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedDocumentType = documentType.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedExtension = extension.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expected = new RegExp(
    `^spmb/${escapedRegistrationId}/${escapedDocumentType}/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.${escapedExtension}$`,
  );
  if (!expected.test(objectKey)) {
    throw new BadRequestException("Kunci objek dokumen tidak valid.");
  }
}
