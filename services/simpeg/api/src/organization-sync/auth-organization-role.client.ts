import { Injectable } from "@nestjs/common";

type AuthOrganizationRoleInput =
  | {
      scope: "unit";
      userId: string;
      unitId: string;
      app: "simpeg" | "siakad" | "spmb";
      role: "admin_unit" | "admin_unit_nondik";
    }
  | {
      scope: "department";
      userId: string;
      departmentId: string;
      app: "simakin";
      role: "admin_bidang" | "admin_biro";
    };

type AuthOrganizationRoleGrant = { id: string };

@Injectable()
export class AuthOrganizationRoleClient {
  async grant(input: AuthOrganizationRoleInput): Promise<AuthOrganizationRoleGrant> {
    const payload = await this.request("POST", input, "grant");
    if (!payload || typeof payload !== "object" || typeof (payload as { id?: unknown }).id !== "string" || !(payload as { id: string }).id) {
      throw new Error("Auth organization-role grant returned no assignment id.");
    }
    return { id: (payload as { id: string }).id };
  }

  async revoke(input: AuthOrganizationRoleInput): Promise<void> {
    await this.request("DELETE", input, "revoke");
  }

  private async request(method: "POST" | "DELETE", input: AuthOrganizationRoleInput, operation: "grant" | "revoke"): Promise<unknown> {
    const baseUrl = process.env.AUTH_API_URL;
    const token = process.env.AUTH_INTERNAL_SERVICE_TOKEN;
    if (!baseUrl || !token) {
      throw new Error("Auth organization-role client is not configured.");
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/users/internal-organization-roles`, {
        method,
        headers: {
          "content-type": "application/json",
          "x-internal-service-token": token,
        },
        body: JSON.stringify(input),
      });
    } catch {
      throw new Error(`Auth organization-role ${operation} request failed.`);
    }

    if (!response.ok) {
      throw new Error(`Auth organization-role ${operation} rejected with HTTP ${response.status}.`);
    }

    try {
      return await response.json();
    } catch {
      throw new Error(`Auth organization-role ${operation} returned invalid JSON.`);
    }
  }
}

export type { AuthOrganizationRoleInput };
