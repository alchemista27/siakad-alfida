import { BadGatewayException, Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";

export type FoundationBranding = {
  foundationName: string;
  logoUrl: string | null;
};
export const SPMB_FOUNDATION_BRANDING_FETCH = Symbol("SPMB_FOUNDATION_BRANDING_FETCH");

@Injectable()
export class FoundationBrandingClient {
  constructor(@Inject(SPMB_FOUNDATION_BRANDING_FETCH) private readonly fetchImplementation: typeof fetch) {}

  async getBranding(): Promise<FoundationBranding> {
    const baseUrl = process.env.ADMIN_PUBLIC_API_URL?.trim();
    if (!baseUrl) throw new ServiceUnavailableException("Konfigurasi logo yayasan belum tersedia.");
    let response: Response;
    try {
      response = await this.fetchImplementation(`${baseUrl.replace(/\/$/, "")}/api/public/foundation-settings`, {
        headers: { accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new ServiceUnavailableException("Logo yayasan tidak dapat dihubungi.");
    }
    if (!response.ok) throw new BadGatewayException("Logo yayasan tidak tersedia.");
    const payload = await response.json().catch(() => null);
    if (!payload || typeof payload !== "object" || typeof (payload as { foundationName?: unknown }).foundationName !== "string") {
      throw new BadGatewayException("Data logo yayasan tidak valid.");
    }
    const nullableString = (key: string) => {
      const value = (payload as Record<string, unknown>)[key];
      if (value === null || typeof value === "string") return value as string | null;
      throw new BadGatewayException("Data identitas yayasan tidak valid.");
    };
    return {
      foundationName: (payload as { foundationName: string }).foundationName,
      logoUrl: nullableString("logoUrl"),
    };
  }
}
