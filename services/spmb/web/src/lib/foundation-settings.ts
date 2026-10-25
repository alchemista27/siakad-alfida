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

export const getFoundationBranding = cache(async (): Promise<FoundationBranding> => {
  await connection();
  const baseUrl = process.env.ADMIN_PUBLIC_API_URL || process.env.INTERNAL_ADMIN_API_URL;
  if (!baseUrl) return fallback;

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/public/foundation-settings`, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
      return fallback;
    }

    const payload = (await response.json()) as Partial<FoundationBranding>;
    return {
      foundationName:
        typeof payload.foundationName === "string" && payload.foundationName.trim()
          ? payload.foundationName.trim()
          : fallback.foundationName,
      logoUrl: typeof payload.logoUrl === "string" && payload.logoUrl.trim() ? payload.logoUrl : null,
      faviconUrl: typeof payload.faviconUrl === "string" && payload.faviconUrl.trim() ? payload.faviconUrl : null,
    };
  } catch {
    return fallback;
  }
});
