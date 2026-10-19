import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthRoleCompensationClient {
  async revoke(record: { scope: "unit" | "department"; userId: string; scopeId: string; app: string; role: string }) {
    const baseUrl = process.env.AUTH_API_URL;
    const authorization = process.env.AUTH_ROLE_RECONCILER_AUTHORIZATION;
    if (!baseUrl || !authorization) {
      throw new Error("Auth role reconciler credentials are not configured.");
    }
    const body = record.scope === "unit"
      ? { scope: "unit", userId: record.userId, unitId: record.scopeId, app: record.app, role: record.role }
      : { scope: "department", userId: record.userId, departmentId: record.scopeId, app: record.app, role: record.role };
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/users/organization-roles`, {
      method: "DELETE",
      headers: { "content-type": "application/json", authorization },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Auth role compensation revoke rejected with HTTP ${response.status}`);
  }
}
