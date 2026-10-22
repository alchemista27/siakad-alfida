export interface CloudinaryEvidenceInput {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  bytes?: number;
}

export interface CloudinaryEvidenceOptions {
  cloudName: string;
  groupId: string;
  sessionId: string;
  maxBytes: number;
}

export type CloudinaryValidation = { valid: true } | { valid: false; reason: string };

export function validateCloudinaryEvidence(input: CloudinaryEvidenceInput, options: CloudinaryEvidenceOptions): CloudinaryValidation {
  if (!options.cloudName || !["image", "video", "raw"].includes(input.resourceType)) {
    return { valid: false, reason: "Tipe resource Cloudinary tidak diizinkan." };
  }
  if (input.bytes !== undefined && (!Number.isInteger(input.bytes) || input.bytes < 0 || input.bytes > options.maxBytes)) {
    return { valid: false, reason: "Ukuran berkas bukti melewati batas." };
  }
  const prefix = `siyaum/ymq/${options.groupId}/${options.sessionId}/`;
  if (!input.publicId.startsWith(prefix)) return { valid: false, reason: "public_id bukti berada di luar folder sesi." };

  try {
    const url = new URL(input.secureUrl);
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") {
      return { valid: false, reason: "URL bukti bukan HTTPS Cloudinary." };
    }
    const expectedPath = new RegExp(`^/${escapeRegex(options.cloudName)}/(?:image|video|raw)/upload/(?:v\\d+/)?${escapeRegex(prefix)}`);
    if (!expectedPath.test(url.pathname)) return { valid: false, reason: "URL bukti tidak memakai folder sesi Cloudinary yang benar." };
    return { valid: true };
  } catch {
    return { valid: false, reason: "URL bukti tidak valid." };
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
