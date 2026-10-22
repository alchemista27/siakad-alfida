import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { mapYmqEmployeeProjection, type YmqEmployeeProjection } from "./ymq-employee-projection.policy";

export const SIMPEG_YMQ_FETCH = Symbol("SIMPEG_YMQ_FETCH");

@Injectable()
export class SimpegYmqProjectionClient {
  constructor(@Inject(SIMPEG_YMQ_FETCH) private readonly fetchImplementation: typeof fetch) {}

  async list(query: { unitId?: string; updatedAfter?: string }): Promise<YmqEmployeeProjection[]> {
    const baseUrl = process.env.SIMPEG_INTERNAL_API_URL?.trim();
    const secret = process.env.INTERNAL_SERVICE_SECRET?.trim();
    if (!baseUrl || !secret) {
      throw new ServiceUnavailableException("Integrasi proyeksi SIMPEG belum dikonfigurasi.");
    }

    const url = new URL("/api/internal/ymq/employee-projections", baseUrl);
    if (query.unitId) url.searchParams.set("unitId", query.unitId);
    if (query.updatedAfter) url.searchParams.set("updatedAfter", query.updatedAfter);
    const response = await this.fetchImplementation(url, {
      headers: { Accept: "application/json", "x-internal-service-key": secret },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new ServiceUnavailableException("SIMPEG tidak dapat menyediakan proyeksi pegawai.");
    }

    const payload = await response.json() as unknown;
    const rows = Array.isArray(payload)
      ? payload
      : payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)
        ? (payload as { data: unknown[] }).data
        : null;
    if (!rows) throw new ServiceUnavailableException("Respons proyeksi SIMPEG tidak valid.");
    return rows.map(mapYmqEmployeeProjection);
  }
}
