import { BadGatewayException, Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";

export type UnitLetterhead = {
  unitId: string;
  unitName: string;
  logoUrl: string | null;
};

export const SPMB_UNIT_LETTERHEAD_FETCH = Symbol("SPMB_UNIT_LETTERHEAD_FETCH");

function parseLetterhead(payload: unknown): UnitLetterhead {
  if (!payload || typeof payload !== "object") throw new BadGatewayException("Profil kop surat unit tidak valid.");
  const value = payload as Record<string, unknown>;
  if (typeof value.unitId !== "string" || typeof value.unitName !== "string") {
    throw new BadGatewayException("Profil kop surat unit tidak valid.");
  }
  const nullableString = (key: string): string | null => {
    const field = value[key];
    if (field === null || typeof field === "string") return field as string | null;
    throw new BadGatewayException("Profil kop surat unit tidak valid.");
  };
  return { unitId: value.unitId, unitName: value.unitName, logoUrl: nullableString("logoUrl") };
}

@Injectable()
export class UnitLetterheadClient {
  constructor(@Inject(SPMB_UNIT_LETTERHEAD_FETCH) private readonly fetchImplementation: typeof fetch) {}

  async getLetterhead(unitId: string): Promise<UnitLetterhead> {
    const baseUrl = process.env.INTERNAL_SIMPEG_API_URL?.trim();
    const secret = process.env.INTERNAL_SERVICE_SECRET?.trim();
    if (!baseUrl || !secret) throw new ServiceUnavailableException("Konfigurasi profil unit belum tersedia.");
    let response: Response;
    try {
      response = await this.fetchImplementation(`${baseUrl.replace(/\/$/, "")}/api/internal/units/${encodeURIComponent(unitId)}/letterhead`, {
        headers: { "x-internal-service-key": secret, accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new ServiceUnavailableException("Profil unit tidak dapat dihubungi.");
    }
    if (!response.ok) throw new BadGatewayException("Profil kop surat unit tidak tersedia.");
    return parseLetterhead(await response.json().catch(() => null));
  }
}
