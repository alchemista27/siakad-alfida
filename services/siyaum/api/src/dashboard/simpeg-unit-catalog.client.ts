import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { z } from "zod";

export const SIMPEG_UNIT_CATALOG_FETCH = Symbol("SIMPEG_UNIT_CATALOG_FETCH");

const ActiveUnitSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(150),
}).strict();

export type ActiveSimpegUnit = { id: string; name: string };

@Injectable()
export class SimpegUnitCatalogClient {
  constructor(@Inject(SIMPEG_UNIT_CATALOG_FETCH) private readonly fetchImplementation: typeof fetch) {}

  async listActive(): Promise<ActiveSimpegUnit[]> {
    const baseUrl = process.env.SIMPEG_INTERNAL_API_URL?.trim();
    const secret = process.env.INTERNAL_SERVICE_SECRET?.trim();
    if (!baseUrl || !secret) {
      throw new ServiceUnavailableException("Integrasi katalog unit SIMPEG belum dikonfigurasi.");
    }

    const response = await this.fetchImplementation(new URL("/api/internal/units/active", baseUrl), {
      headers: { Accept: "application/json", "x-internal-service-key": secret },
      signal: AbortSignal.timeout(10_000),
    });
    const payload = await response.json().catch(() => null);
    const parsed = z.array(ActiveUnitSchema).safeParse(payload);
    if (!response.ok || !parsed.success) {
      throw new ServiceUnavailableException("Katalog unit aktif SIMPEG tidak dapat dibaca.");
    }

    return parsed.data
      .map((unit): ActiveSimpegUnit => ({ id: unit.id!, name: unit.name! }))
      .sort((left, right) => left.name.localeCompare(right.name, "id"));
  }
}
