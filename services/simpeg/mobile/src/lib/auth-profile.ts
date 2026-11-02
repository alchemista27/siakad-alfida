const AUTH_ME_URL = "https://auth.alfida.or.id/api/auth/me";

export type AuthProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  roles: Array<{ app?: string; role: string }>;
};

function parseProfile(value: unknown): AuthProfile | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Partial<AuthProfile>;
  if (typeof source.id !== "string" || typeof source.fullName !== "string" || typeof source.email !== "string" || !Array.isArray(source.roles)) return null;
  return {
    id: source.id,
    fullName: source.fullName,
    email: source.email,
    phone: typeof source.phone === "string" ? source.phone : null,
    avatarUrl: typeof source.avatarUrl === "string" && source.avatarUrl.startsWith("https://") ? source.avatarUrl : null,
    roles: source.roles.filter((role): role is { app?: string; role: string } => Boolean(role && typeof role === "object" && typeof role.role === "string")),
  };
}

export async function getAuthProfile(token: string, fetcher: typeof fetch = fetch): Promise<AuthProfile> {
  const response = await fetcher(AUTH_ME_URL, {
    headers: { accept: "application/json", Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => null) as { user?: unknown; message?: unknown } | null;
  if (response.status === 401) throw new Error("Sesi berakhir. Masuk kembali untuk melihat profil.");
  const user = parseProfile(body?.user);
  if (!response.ok || !user) {
    throw new Error(typeof body?.message === "string" ? body.message : "Profil belum dapat dimuat.");
  }
  return user;
}
