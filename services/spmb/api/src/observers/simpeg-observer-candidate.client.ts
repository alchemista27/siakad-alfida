import { BadGatewayException, BadRequestException, Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";

export type SimpegObserverCandidate = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
};

export const SPMB_SIMPEG_OBSERVER_FETCH = Symbol("SPMB_SIMPEG_OBSERVER_FETCH");

function parseCandidate(value: unknown): SimpegObserverCandidate {
  if (!value || typeof value !== "object") throw new BadGatewayException("Respons kandidat SIMPEG tidak valid.");
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.fullName !== "string" || typeof item.email !== "string") {
    throw new BadGatewayException("Respons kandidat SIMPEG tidak valid.");
  }
  if (item.avatarUrl !== null && item.avatarUrl !== undefined && typeof item.avatarUrl !== "string") {
    throw new BadGatewayException("Respons kandidat SIMPEG tidak valid.");
  }
  return { id: item.id, fullName: item.fullName, email: item.email, avatarUrl: (item.avatarUrl as string | null | undefined) ?? null };
}

@Injectable()
export class SimpegObserverCandidateClient {
  constructor(@Inject(SPMB_SIMPEG_OBSERVER_FETCH) private readonly fetchImplementation: typeof fetch) {}

  private getConfig() {
    const baseUrl = process.env.INTERNAL_SIMPEG_API_URL?.trim();
    const secret = process.env.INTERNAL_SERVICE_SECRET?.trim();
    if (!baseUrl || !secret) throw new ServiceUnavailableException("Integrasi data karyawan SIMPEG belum tersedia.");
    return { baseUrl: baseUrl.replace(/\/$/, ""), secret };
  }

  async findCandidates(unitId: string, search: string): Promise<SimpegObserverCandidate[]> {
    const { baseUrl, secret } = this.getConfig();
    const url = new URL(`${baseUrl}/api/internal/employees/observer-candidates`);
    url.searchParams.set("unitId", unitId);
    url.searchParams.set("search", search.slice(0, 100));

    let response: Response;
    try {
      response = await this.fetchImplementation(url, {
        headers: { "x-internal-service-key": secret, accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new ServiceUnavailableException("Data karyawan SIMPEG tidak dapat dihubungi.");
    }
    if (!response.ok) throw new BadGatewayException("Data karyawan SIMPEG tidak tersedia.");
    const payload = await response.json().catch(() => null);
    if (!Array.isArray(payload)) throw new BadGatewayException("Respons kandidat SIMPEG tidak valid.");
    return payload.map(parseCandidate);
  }

  async assertCurrentUnitEmployee(unitId: string, userId: string): Promise<void> {
    const { baseUrl, secret } = this.getConfig();
    const url = new URL(`${baseUrl}/api/internal/employees/${encodeURIComponent(userId)}/observer-eligibility`);
    url.searchParams.set("unitId", unitId);

    let response: Response;
    try {
      response = await this.fetchImplementation(url, {
        headers: { "x-internal-service-key": secret, accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new ServiceUnavailableException("Data karyawan SIMPEG tidak dapat dihubungi.");
    }
    if (!response.ok) throw new BadGatewayException("Status penugasan karyawan SIMPEG tidak dapat diverifikasi.");
    const payload = await response.json().catch(() => null);
    if (!payload || typeof payload !== "object" || (payload as { eligible?: unknown }).eligible !== true) {
      throw new BadRequestException("Karyawan atau guru tersebut tidak memiliki penugasan aktif pada unit ini.");
    }
  }
}
