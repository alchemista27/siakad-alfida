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
type EmployeePrimaryUnitSync = { userId: string; unitId: string; changed: boolean };

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

  async syncEmployeePrimaryUnit(userId: string, unitId: string): Promise<EmployeePrimaryUnitSync> {
    const payload = await this.request(
      "POST",
      { userId, unitId },
      "employee primary-unit sync",
      "/api/users/internal-organization-roles/employee-primary-unit",
    );
    if (
      !payload || typeof payload !== "object"
      || (payload as { userId?: unknown }).userId !== userId
      || (payload as { unitId?: unknown }).unitId !== unitId
      || typeof (payload as { changed?: unknown }).changed !== "boolean"
    ) {
      throw new Error("Auth employee primary-unit sync returned invalid payload.");
    }
    return payload as EmployeePrimaryUnitSync;
  }

  private async request(
    method: "POST" | "DELETE",
    input: AuthOrganizationRoleInput | { userId: string; unitId: string },
    operation: "grant" | "revoke" | "employee primary-unit sync",
    path = "/api/users/internal-organization-roles",
  ): Promise<unknown> {
    const baseUrl = process.env.AUTH_API_URL;
    const token = process.env.AUTH_INTERNAL_SERVICE_TOKEN;
    if (!baseUrl || !token) {
      throw new Error("Auth organization-role client is not configured.");
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
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
