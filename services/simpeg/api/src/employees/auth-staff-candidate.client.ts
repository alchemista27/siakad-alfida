import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";

export const AUTH_STAFF_CANDIDATE_FETCH = Symbol("AUTH_STAFF_CANDIDATE_FETCH");

export type AuthStaffCandidate = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
};

@Injectable()
export class AuthStaffCandidateClient {
  constructor(@Inject(AUTH_STAFF_CANDIDATE_FETCH) private readonly fetchImplementation: typeof fetch) {}

  async find(search: string): Promise<AuthStaffCandidate[]> {
    const term = search.trim().slice(0, 100);
    if (!term) return [];
    const payload = await this.request(`/api/users/internal-staff-candidates?${new URLSearchParams({ search: term })}`);
    if (!Array.isArray(payload) || !payload.every((row) => this.isCandidate(row))) {
      throw new ServiceUnavailableException("Pencarian pegawai Auth mengembalikan data tidak valid.");
    }
    return payload;
  }

  async isEligible(userId: string): Promise<boolean> {
    const response = await this.fetch(`/api/users/internal-staff-candidates/${encodeURIComponent(userId)}`);
    if (response.status === 404) return false;
    if (!response.ok) throw new ServiceUnavailableException("Validasi pegawai Auth tidak tersedia.");
    const payload: unknown = await response.json().catch(() => null);
    if (!this.isCandidate(payload)) {
      throw new ServiceUnavailableException("Validasi pegawai Auth mengembalikan data tidak valid.");
    }
    return payload.id === userId;
  }

  async eligibleUserIds(userIds: string[]): Promise<string[]> {
    const ids = [...new Set(userIds.map((userId) => userId.trim()).filter(Boolean))].slice(0, 500);
    if (!ids.length) return [];
    const payload = await this.request("/api/users/internal-staff-candidates/eligible", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: ids }),
    });
    if (!Array.isArray(payload) || !payload.every((userId) => typeof userId === "string" && ids.includes(userId))) {
      throw new ServiceUnavailableException("Validasi pegawai Auth mengembalikan data tidak valid.");
    }
    return payload;
  }

  private isCandidate(value: unknown): value is AuthStaffCandidate {
    if (!value || typeof value !== "object") return false;
    const row = value as Record<string, unknown>;
    return typeof row.id === "string"
      && typeof row.fullName === "string"
      && typeof row.email === "string"
      && (row.avatarUrl === null || typeof row.avatarUrl === "string");
  }

  private async request(path: string, init: RequestInit = {}): Promise<unknown> {
    const response = await this.fetch(path, init);
    if (!response.ok) throw new ServiceUnavailableException("Pencarian pegawai Auth tidak tersedia.");
    const payload: unknown = await response.json().catch(() => null);
    if (payload === null) throw new ServiceUnavailableException("Pencarian pegawai Auth mengembalikan data tidak valid.");
    return payload;
  }

  private async fetch(path: string, init: RequestInit = {}): Promise<Response> {
    const baseUrl = process.env.AUTH_API_URL?.trim();
    const token = process.env.AUTH_INTERNAL_SERVICE_TOKEN?.trim() || process.env.INTERNAL_SERVICE_SECRET?.trim();
    if (!baseUrl || !token) throw new ServiceUnavailableException("Pencarian pegawai Auth belum dikonfigurasi.");
    try {
      return await this.fetchImplementation(new URL(path, baseUrl), {
        ...init,
        method: init.method || "GET",
        headers: {
          Accept: "application/json",
          "x-internal-service-token": token,
          ...(init.headers || {}),
        },
        signal: init.signal || AbortSignal.timeout(10_000),
      });
    } catch {
      throw new ServiceUnavailableException("Pencarian pegawai Auth tidak dapat dihubungi.");
    }
  }
}
