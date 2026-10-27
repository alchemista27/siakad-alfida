import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";

export const AUTH_YMQ_ROLE_BROKER_FETCH = Symbol("AUTH_YMQ_ROLE_BROKER_FETCH");

export type AuthYmqManagedRole = "admin_ymq" | "peserta" | "pembina_ymq" | "admin_kelompok" | "pengawas" | "pimpinan";

type BrokerAssignment = { userId: string; role: AuthYmqManagedRole; changed?: boolean; deleted?: boolean };

@Injectable()
export class AuthYmqRoleBrokerClient {
  constructor(@Inject(AUTH_YMQ_ROLE_BROKER_FETCH) private readonly fetchImplementation: typeof fetch) {}

  async assign(actorUserId: string, userId: string, role: AuthYmqManagedRole) {
    return this.request<BrokerAssignment>("/api/internal/ymq-role-broker/assign", {
      method: "POST",
      body: JSON.stringify({ actorUserId, userId, role }),
    });
  }

  async revoke(actorUserId: string, userId: string, role: AuthYmqManagedRole) {
    return this.request<BrokerAssignment>(`/api/internal/ymq-role-broker/users/${encodeURIComponent(userId)}/roles/${role}`, {
      method: "DELETE",
      body: JSON.stringify({ actorUserId }),
    });
  }

  async list(role: AuthYmqManagedRole) {
    return this.request<Array<Pick<BrokerAssignment, "userId" | "role">>>(`/api/internal/ymq-role-broker/roles/${role}`, { method: "GET" });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const baseUrl = process.env.AUTH_API_URL?.trim();
    const token = process.env.AUTH_INTERNAL_SERVICE_TOKEN?.trim() || process.env.INTERNAL_SERVICE_SECRET?.trim();
    if (!baseUrl || !token) throw new ServiceUnavailableException("Role broker Auth belum dikonfigurasi.");

    let response: Response;
    try {
      response = await this.fetchImplementation(new URL(path, baseUrl), {
        ...init,
        headers: {
          Accept: "application/json",
          ...(init.body ? { "Content-Type": "application/json" } : {}),
          "x-internal-service-key": token,
        },
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new ServiceUnavailableException("Role broker Auth tidak dapat dihubungi.");
    }

    const payload = await response.json().catch(() => null) as T | null;
    if (!response.ok || payload === null) throw new ServiceUnavailableException("Role broker Auth menolak perubahan peran YMQ.");
    return payload;
  }
}
