const LOCAL_DEVELOPMENT_ORIGINS = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
]);

export function isTrustedSiyaumOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (LOCAL_DEVELOPMENT_ORIGINS.has(origin)) return true;

  try {
    const parsed = new URL(origin);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".alfida.or.id");
  } catch {
    return false;
  }
}
