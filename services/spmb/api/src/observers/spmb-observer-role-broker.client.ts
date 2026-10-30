import { BadGatewayException, Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";

export const SPMB_AUTH_OBSERVER_ROLE_FETCH = Symbol("SPMB_AUTH_OBSERVER_ROLE_FETCH");

@Injectable()
export class SpmbObserverRoleBrokerClient {
  constructor(@Inject(SPMB_AUTH_OBSERVER_ROLE_FETCH) private readonly fetchImplementation: typeof fetch) {}

  async grant(unitId: string, userId: string) {
    return this.request("POST", { userId, scope: "unit", unitId, app: "spmb", role: "observer" });
  }

  async revoke(unitId: string, userId: string) {
    return this.request("DELETE", { userId, scope: "unit", unitId, app: "spmb", role: "observer" });
  }

  private async request(method: "POST" | "DELETE", body: Record<string, string>) {
    const baseUrl = (
      process.env.AUTH_API_URL?.trim()
      || process.env.INTERNAL_AUTH_API_URL?.trim()
      || process.env.AUTH_PUBLIC_API_URL?.trim()
      || process.env.NEXT_PUBLIC_AUTH_URL?.trim()
    );
    const token = process.env.AUTH_INTERNAL_SERVICE_TOKEN?.trim() || process.env.INTERNAL_SERVICE_SECRET?.trim();
    if (!baseUrl || !token) throw new ServiceUnavailableException("Role observer Auth belum dikonfigurasi.");

    let response: Response;
    try {
      response = await this.fetchImplementation(`${baseUrl.replace(/\/$/, "")}/api/users/internal-organization-roles`, {
        method,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "x-internal-service-token": token,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new ServiceUnavailableException("Role observer Auth tidak dapat dihubungi.");
    }
    if (!response.ok) throw new BadGatewayException("Role observer Auth menolak perubahan penugasan.");
    return response.json().catch(() => ({}));
  }
}
