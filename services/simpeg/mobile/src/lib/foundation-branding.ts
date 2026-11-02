export const FOUNDATION_SETTINGS_URL = "https://admin.alfida.or.id/api/public/foundation-settings";

export type FoundationBranding = {
  foundationName: string;
  logoUrl: string | null;
};

const fallback: FoundationBranding = {
  foundationName: "Yayasan Alfida",
  logoUrl: null,
};

export function parseFoundationBranding(value: unknown): FoundationBranding {
  if (!value || typeof value !== "object") return fallback;
  const source = value as { foundationName?: unknown; logoUrl?: unknown };
  const foundationName = typeof source.foundationName === "string" && source.foundationName.trim()
    ? source.foundationName.trim()
    : fallback.foundationName;
  if (typeof source.logoUrl !== "string") return { foundationName, logoUrl: null };
  try {
    const url = new URL(source.logoUrl);
    return {
      foundationName,
      logoUrl: url.protocol === "https:" && url.hostname === "res.cloudinary.com" && decodeURIComponent(url.pathname).includes("/foundation/logo/")
        ? url.toString()
        : null,
    };
  } catch {
    return { foundationName, logoUrl: null };
  }
}

export async function getFoundationBranding(fetcher: typeof fetch = fetch): Promise<FoundationBranding> {
  try {
    const response = await fetcher(FOUNDATION_SETTINGS_URL, { headers: { accept: "application/json" } });
    if (!response.ok) return fallback;
    return parseFoundationBranding(await response.json().catch(() => null));
  } catch {
    return fallback;
  }
}
