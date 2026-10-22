export class AttachEvidenceDto {
  secureUrl: string;
  publicId: string;
  resourceType: "image" | "video" | "raw";
  originalFilename?: string;
  bytes?: number;
}
