import { BadRequestException } from "@nestjs/common";

export function getCloudinaryCloudName(): string {
  return (
    process.env.CLOUDINARY_CLOUD_NAME?.trim()
    || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim()
    || "hb1ropwm"
  );
}

export function assertCloudinaryUploadUrl(fileUrl: string, requiredFolder: string): void {
  let url: URL;
  try {
    url = new URL(fileUrl);
  } catch {
    throw new BadRequestException("URL file Cloudinary tidak valid.");
  }

  const cloudName = getCloudinaryCloudName();
  const path = decodeURIComponent(url.pathname);
  if (
    url.protocol !== "https:"
    || url.hostname !== "res.cloudinary.com"
    || !path.startsWith(`/${cloudName}/`)
    || !path.includes("/upload/")
    || !path.includes(`/${requiredFolder}/`)
  ) {
    throw new BadRequestException("File harus berasal dari folder Cloudinary pendaftaran yang sesuai.");
  }
}
