const DEFAULT_RETURN_PATH = "/modules";

const TRUSTED_RETURN_ORIGINS = new Set([
  "https://auth.alfida.or.id",
  "https://admin.alfida.or.id",
  "https://spmb.alfida.or.id",
  "https://siakad.alfida.or.id",
  "https://sim.alfida.or.id",
  "https://simpeg.alfida.or.id",
  "https://simakin.alfida.or.id",
  "https://siyaum.alfida.or.id",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
]);

export function safeReturnTo(raw: string | null | undefined, currentOrigin: string): string {
  const value = raw?.trim();
  if (!value) return DEFAULT_RETURN_PATH;
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  try {
    const target = new URL(value);
    if (!TRUSTED_RETURN_ORIGINS.has(target.origin) && target.origin !== currentOrigin) {
      return DEFAULT_RETURN_PATH;
    }
    return target.toString();
  } catch {
    return DEFAULT_RETURN_PATH;
  }
}
