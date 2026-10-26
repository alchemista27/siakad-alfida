import { connection } from "next/server";
import { cache } from "react";

export type FoundationBranding = {
  foundationName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
};

const fallback: FoundationBranding = {
  foundationName: "Yayasan Alfida",
  logoUrl: null,
  faviconUrl: null,
};

export type FoundationBrandingEnv = Partial<Record<
  "INTERNAL_ADMIN_API_URL" | "ADMIN_PUBLIC_API_URL" | "FOUNDATION_API_URL" | "NEXT_PUBLIC_ADMIN_URL",
  string
>>;

export function resolveAdminFoundationBaseUrl(env: FoundationBrandingEnv): string | null {
  const baseUrl = (
    env.INTERNAL_ADMIN_API_URL
    || env.ADMIN_PUBLIC_API_URL
    || env.FOUNDATION_API_URL
    || env.NEXT_PUBLIC_ADMIN_URL
  )?.trim().replace(/\/$/, "");
  return baseUrl || null;
}

export function normalizeFoundationBranding(payload: unknown): FoundationBranding | null {
  const candidate = payload && typeof payload === "object" && "data" in payload
    ? (payload as { data: unknown }).data
    : payload;
  if (!candidate || typeof candidate !== "object") return null;

  const value = candidate as Record<string, unknown>;
  const hasSupportedValue = [value.foundationName, value.logoUrl, value.faviconUrl].some(
    (item) => typeof item === "string",
  );
  if (!hasSupportedValue) return null;

  return {
    foundationName:
      typeof value.foundationName === "string" && value.foundationName.trim()
        ? value.foundationName.trim()
        : fallback.foundationName,
    logoUrl: typeof value.logoUrl === "string" && value.logoUrl.trim() ? value.logoUrl.trim() : null,
    faviconUrl: typeof value.faviconUrl === "string" && value.faviconUrl.trim() ? value.faviconUrl.trim() : null,
  };
}

export const getFoundationBranding = cache(async (): Promise<FoundationBranding> => {
  await connection();
  const baseUrl = resolveAdminFoundationBaseUrl({
    INTERNAL_ADMIN_API_URL: process.env.INTERNAL_ADMIN_API_URL,
    ADMIN_PUBLIC_API_URL: process.env.ADMIN_PUBLIC_API_URL,
    FOUNDATION_API_URL: process.env.FOUNDATION_API_URL,
    NEXT_PUBLIC_ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL,
  });
  if (!baseUrl) return fallback;

  try {
    const response = await fetch(`${baseUrl}/api/public/foundation-settings`, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
      return fallback;
    }

    return normalizeFoundationBranding(await response.json()) || fallback;
  } catch {
    return fallback;
  }
});
