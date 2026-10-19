export type UnitIdentityAssetKind = "logo" | "principal-signature";

export function isAllowedUnitCloudinaryUrl(
  raw: string,
  cloudName: string,
  unitId: string,
  kind: UnitIdentityAssetKind,
): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") return false;

    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] !== cloudName) return false;
    const unitIndex = segments.indexOf("units");
    return (
      unitIndex >= 0 &&
      segments[unitIndex + 1] === unitId &&
      segments[unitIndex + 2] === kind &&
      !segments.slice(unitIndex + 3).some((segment) => segment === "." || segment === "..")
    );
  } catch {
    return false;
  }
}
