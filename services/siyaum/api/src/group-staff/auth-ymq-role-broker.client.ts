import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";

export const AUTH_YMQ_BROKER_FETCH = Symbol("AUTH_YMQ_BROKER_FETCH");
export type YmqManagedRole = "admin_ymq" | "peserta" | "pembina_ymq" | "admin_kelompok" | "pengawas" | "pimpinan";
export type YmqOperationalRole = Extract<YmqManagedRole, "pembina_ymq" | "admin_kelompok">;
type BrokerAssignResult = { userId?: string; role?: YmqManagedRole; changed?: boolean; deleted?: boolean };
type BrokerRoleListItem = { userId: string; role: YmqManagedRole };

@Injectable()
export class AuthYmqRoleBrokerClient {
  constructor(@Inject(AUTH_YMQ_BROKER_FETCH) private readonly fetchImplementation: typeof fetch) {}

  async assign(actorId: string, targetUserId: string, role: YmqManagedRole): Promise<BrokerAssignResult> {
    const payload = await this.request<BrokerAssignResult>("/api/internal/ymq-role-broker/assign", {
      method: "POST",
      body: JSON.stringify({ actorUserId: actorId, userId: targetUserId, role }),
    });
    if (typeof payload?.changed !== "boolean") {
      throw new ServiceUnavailableException("Role broker Auth mengembalikan respons perubahan peran yang tidak valid.");
    }
    return payload;
  }

  async revoke(actorId: string, targetUserId: string, role: YmqManagedRole): Promise<void> {
    await this.request(`/api/internal/ymq-role-broker/users/${encodeURIComponent(targetUserId)}/roles/${role}`, {
      method: "DELETE",
      body: JSON.stringify({ actorUserId: actorId }),
    });
  }

  async list(role: YmqManagedRole): Promise<BrokerRoleListItem[]> {
    const payload = await this.request<unknown>(`/api/internal/ymq-role-broker/roles/${role}`, { method: "GET" });
    if (!Array.isArray(payload) || payload.some((item) => !item || typeof item !== "object" || typeof (item as BrokerRoleListItem).userId !== "string" || (item as BrokerRoleListItem).role !== role)) {
      throw new ServiceUnavailableException("Role broker Auth mengembalikan daftar peran YMQ yang tidak valid.");
    }
    return payload as BrokerRoleListItem[];
  }

  private async request<T = unknown>(path: string, init: RequestInit): Promise<T> {
    const baseUrl = process.env.AUTH_INTERNAL_API_URL?.trim();
    const secret = process.env.INTERNAL_SERVICE_SECRET?.trim();
    if (!baseUrl || !secret) throw new ServiceUnavailableException("Role broker Auth belum dikonfigurasi.");
    const response = await this.fetchImplementation(new URL(path, baseUrl), {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        "x-internal-service-key": secret,
      },
      signal: AbortSignal.timeout(10_000),
    });
    const payload = await response.json().catch(() => null) as T;
    if (!response.ok) throw new ServiceUnavailableException("Role broker Auth menolak perubahan peran YMQ.");
    return payload;
  }
}
