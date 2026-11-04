import { Inject, Injectable } from "@nestjs/common";

export const FOUNDATION_BRANDING_FETCH = Symbol("FOUNDATION_BRANDING_FETCH");

export type FoundationBranding = {
  foundationName: string;
  logoUrl: string | null;
  logo: Buffer | null;
};

const FALLBACK: FoundationBranding = {
  foundationName: "Yayasan Alfida",
  logoUrl: null,
  logo: null,
};

const LOGO_MAX_BYTES = 3 * 1024 * 1024;

function foundationLogoUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "hb1ropwm";
    return url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      url.pathname.startsWith(`/${cloudName}/image/upload/`) &&
      url.pathname.includes("/foundation/logo/")
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function baseUrl(): string | null {
  const value = process.env.ADMIN_PUBLIC_API_URL || process.env.INTERNAL_ADMIN_API_URL;
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString().replace(/\/$/, "") : null;
  } catch {
    return null;
  }
}

@Injectable()
export class FoundationBrandingClient {
  constructor(@Inject(FOUNDATION_BRANDING_FETCH) private readonly fetchImpl: typeof fetch) {}

  async getForPdf(): Promise<FoundationBranding> {
    const adminBaseUrl = baseUrl();
    if (!adminBaseUrl) return FALLBACK;
    try {
      const settings = await this.fetchImpl(`${adminBaseUrl}/api/public/foundation-settings`, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(5_000),
      });
      if (!settings.ok || !settings.headers.get("content-type")?.includes("application/json")) return FALLBACK;
      const payload = await settings.json() as { foundationName?: unknown; logoUrl?: unknown };
      const foundationName = typeof payload.foundationName === "string" && payload.foundationName.trim()
        ? payload.foundationName.trim()
        : FALLBACK.foundationName;
      const logoUrl = foundationLogoUrl(payload.logoUrl);
      if (!logoUrl) return { foundationName, logoUrl: null, logo: null };

      const logoResponse = await this.fetchImpl(logoUrl, { signal: AbortSignal.timeout(5_000) });
      const contentLength = Number(logoResponse.headers.get("content-length") || "0");
      if (!logoResponse.ok || !logoResponse.headers.get("content-type")?.startsWith("image/") ||
        !Number.isFinite(contentLength) || contentLength > LOGO_MAX_BYTES) {
        return { foundationName, logoUrl, logo: null };
      }
      const logo = Buffer.from(await logoResponse.arrayBuffer());
      if (logo.length > LOGO_MAX_BYTES) return { foundationName, logoUrl, logo: null };
      return { foundationName, logoUrl, logo };
    } catch {
      return FALLBACK;
    }
  }
}
