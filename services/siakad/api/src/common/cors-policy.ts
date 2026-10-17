export function isAllowedCorsOrigin(origin: string | undefined, allowedOrigins: readonly string[]): boolean {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  try {
    const url = new URL(origin);
    return url.protocol === "https:" && url.hostname.endsWith(".alfida.or.id");
  } catch {
    return false;
  }
}
