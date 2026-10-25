import type { SsoUser } from "./sso-server";

export class SsoClientError extends Error {
  constructor(
    public readonly kind: "unauthorized" | "unavailable" | "invalid_response",
    message: string,
  ) {
    super(message);
    this.name = "SsoClientError";
  }
}

export async function getCurrentSsoUser(): Promise<SsoUser> {
  const response = await fetch("/api/sso/me", {
    cache: "no-store",
    credentials: "same-origin",
  });
  const payload = (await response.json().catch(() => null)) as {
    user?: SsoUser;
    message?: string;
  } | null;

  if (response.status === 401) {
    throw new SsoClientError(
      "unauthorized",
      payload?.message || "Sesi masuk telah berakhir. Silakan masuk kembali.",
    );
  }

  if (!response.ok) {
    throw new SsoClientError(
      "unavailable",
      payload?.message || "Layanan identitas belum dapat dihubungi. Silakan coba lagi.",
    );
  }

  if (!payload?.user) {
    throw new SsoClientError(
      "invalid_response",
      "Respons layanan identitas tidak valid. Silakan coba lagi.",
    );
  }

  return payload.user;
}
