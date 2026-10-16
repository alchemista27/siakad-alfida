const FOUNDATION_CLOUDINARY_PREFIXES = [
  "foundation/logo/",
  "foundation/favicon/",
  "foundation/chairman-signature/",
] as const;

export function isAllowedFoundationCloudinaryUrl(
  url: string | null | undefined,
  cloudName: string,
): boolean {
  if (!url) return true;
  if (!cloudName) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:"
      && parsed.hostname === "res.cloudinary.com"
      && parsed.pathname.startsWith(`/${cloudName}/image/upload/`)
      && FOUNDATION_CLOUDINARY_PREFIXES.some((prefix) => parsed.pathname.includes(`/${prefix}`));
  } catch {
    return false;
  }
}
