import type { UserRoleScope } from "@alfida/contracts";

export type SsoUser = {
  id?: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string | null;
  roles?: UserRoleScope[];
};

type UpstreamFetch = typeof fetch;

export type SsoLookupResult =
  | { status: 200; body: { user: SsoUser } }
  | { status: 401; body: { message: string } }
  | { status: 502; body: { message: string } };

export function getAuthApiBaseUrl() {
  return (
    process.env.INTERNAL_AUTH_API_URL ||
    process.env.AUTH_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_AUTH_URL ||
    "https://auth.alfida.or.id"
  ).replace(/\/$/, "");
}

export async function lookupSsoUser(
  cookie: string,
  fetchImpl: UpstreamFetch = fetch,
  baseUrl = getAuthApiBaseUrl(),
): Promise<SsoLookupResult> {
  let response: Response;
  try {
    response = await fetchImpl(`${baseUrl}/api/auth/me`, {
      cache: "no-store",
      headers: { accept: "application/json", cookie },
    });
  } catch {
    return {
      status: 502,
      body: { message: "Layanan identitas sedang tidak dapat dihubungi. Silakan coba lagi." },
    };
  }

  if (response.status === 401) {
    return {
      status: 401,
      body: { message: "Sesi masuk telah berakhir. Silakan masuk kembali." },
    };
  }

  if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
    return {
      status: 502,
      body: { message: "Layanan identitas belum dapat memuat akses SPMB. Silakan coba lagi." },
    };
  }

  try {
    const payload = (await response.json()) as { user?: SsoUser };
    if (!payload.user) throw new Error("missing user");
    return { status: 200, body: { user: payload.user } };
  } catch {
    return {
      status: 502,
      body: { message: "Respons layanan identitas tidak valid. Silakan coba lagi." },
    };
  }
}
