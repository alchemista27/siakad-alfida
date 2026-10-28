import { BadRequestException } from "@nestjs/common";

type UnitLetterheadAsset = "logo" | "principalSignature";

function cloudName() {
  return process.env.CLOUDINARY_CLOUD_NAME?.trim()
    || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim()
    || "hb1ropwm";
}

function expectedFolder(unitId: string, asset: UnitLetterheadAsset) {
  return asset === "logo"
    ? `simpeg/unit/${unitId}/logo/`
    : `simpeg/unit/${unitId}/principal-signature/`;
}

export function assertUnitLetterheadCloudinaryUrl(
  url: string | null | undefined,
  unitId: string,
  asset: UnitLetterheadAsset,
) {
  if (!url) return;

  try {
    const parsed = new URL(url);
    const allowed = parsed.protocol === "https:"
      && parsed.hostname === "res.cloudinary.com"
      && parsed.pathname.startsWith(`/${cloudName()}/image/upload/`)
      && parsed.pathname.includes(`/${expectedFolder(unitId, asset)}`);
    if (allowed) return;
  } catch {
    // Handled by the common rejection below.
  }

  throw new BadRequestException("URL aset profil unit harus berasal dari folder Cloudinary unit yang sesuai.");
}
