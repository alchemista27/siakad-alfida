import { DocumentType } from "../generated/prisma";

export class PresignUploadDto {
  registrationId: string;
  fileName: string;
  mimeType: string;
}

export class UpsertDocumentDto {
  registrationId: string;
  type: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}
