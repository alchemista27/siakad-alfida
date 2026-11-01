import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";

export const SIMPEG_UNIT_CATALOG_FETCH = Symbol("SIMPEG_UNIT_CATALOG_FETCH");

export type SimpegActiveUnit = {
  id: string;
  name: string;
};

@Injectable()
export class SimpegUnitCatalogClient {
  constructor(@Inject(SIMPEG_UNIT_CATALOG_FETCH) private readonly fetchImplementation: typeof fetch) {}

  async listActive(): Promise<SimpegActiveUnit[]> {
    const baseUrl = process.env.INTERNAL_SIMPEG_API_URL?.trim() || process.env.SIMPEG_API_URL?.trim();
    const token = process.env.INTERNAL_SERVICE_SECRET?.trim();
    if (!baseUrl || !token) {
      throw new ServiceUnavailableException("Katalog unit SIMPEG belum dikonfigurasi.");
    }

    let response: Response;
    try {
      response = await this.fetchImplementation(new URL("/api/internal/units/active", baseUrl), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-internal-service-key": token,
        },
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new ServiceUnavailableException("Katalog unit SIMPEG tidak dapat dihubungi.");
    }

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(payload) || !payload.every((unit): unit is SimpegActiveUnit => this.isActiveUnit(unit))) {
      throw new ServiceUnavailableException("Katalog unit SIMPEG tidak tersedia.");
    }
    return payload;
  }

  private isActiveUnit(value: unknown): value is SimpegActiveUnit {
    if (!value || typeof value !== "object") return false;
    const unit = value as Record<string, unknown>;
    return typeof unit.id === "string" && unit.id.length > 0
      && typeof unit.name === "string" && unit.name.trim().length > 0;
  }
}
