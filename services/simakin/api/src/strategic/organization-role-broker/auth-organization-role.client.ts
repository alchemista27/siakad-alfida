import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthOrganizationRoleClient {
  private baseUrl() {
    const value = process.env.AUTH_API_URL;
    const token = process.env.AUTH_INTERNAL_SERVICE_TOKEN;
    if (!value || !token) throw new Error("Auth role broker is not configured.");
    return { value: value.replace(/\/$/, ""), token };
  }

  async grant(userId: string, departmentId: string) {
    const { value, token } = this.baseUrl();
    const response = await fetch(`${value}/api/users/internal-organization-roles`, { method: "POST", headers: { "content-type": "application/json", "x-internal-service-token": token }, body: JSON.stringify({ userId, departmentId, role: "admin_biro" }) });
    if (!response.ok) throw new Error(`Auth role grant rejected with HTTP ${response.status}`);
    const result = await response.json() as { id?: string };
    if (!result.id) throw new Error("Auth role grant returned no assignment id");
    return result.id;
  }

  async revoke(userId: string, departmentId: string) {
    const { value, token } = this.baseUrl();
    const response = await fetch(`${value}/api/users/internal-organization-roles/${userId}/${departmentId}/admin_biro`, { method: "DELETE", headers: { "x-internal-service-token": token } });
    if (!response.ok) throw new Error(`Auth role revoke rejected with HTTP ${response.status}`);
  }
}
