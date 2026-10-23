import type { SiskeuUser } from "@/lib/api";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.alfida.or.id";

export async function getCurrentSiskeuUser(): Promise<SiskeuUser> {
  const response = await fetch("/api/auth/me", { credentials: "include" });
  if (!response.ok) throw new Error("AUTHENTICATION_REQUIRED");
  const payload = await response.json() as { user?: SiskeuUser };
  if (!payload.user) throw new Error("AUTHENTICATION_REQUIRED");
  return payload.user;
}

export function redirectToLogin(): void {
  window.location.href = `${AUTH_URL}/login?return_to=${encodeURIComponent(window.location.href)}`;
}
