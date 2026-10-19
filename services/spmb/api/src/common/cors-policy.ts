export function isAllowedCorsOrigin(origin: string | undefined, allowedOrigins: readonly string[]): boolean {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  try {
    return allowedOrigins.includes(new URL(origin).origin);
  } catch {
    return false;
  }
}
