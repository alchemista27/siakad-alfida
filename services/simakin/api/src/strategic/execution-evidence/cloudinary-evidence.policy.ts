export function isAllowedEvidenceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && url.pathname.startsWith("/hb1ropwm/");
  } catch {
    return false;
  }
}
