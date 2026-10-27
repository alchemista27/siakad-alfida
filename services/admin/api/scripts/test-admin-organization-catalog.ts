import assert from "node:assert/strict";
import { UsersController } from "../src/users/users.controller";
import { UsersService } from "../src/users/users.service";
import { OrganizationRoleAdminService } from "../src/users/organization-role-admin.service";

async function main() {
  console.log("Starting test-admin-organization-catalog...");

  // 1. Test UsersService & Controller for Units & Departments
  const mockUnits = [
    { id: "0f3505db-ba0b-48e3-a500-2de9790bdd63", name: "TK Islam Terpadu Auladuna 1", slug: "tk-auladuna-1" },
    { id: "dcaa14b2-b20c-416a-ba90-9367016ce295", name: "SD Islam Terpadu Iqra 1", slug: "sd-iqra-1" },
  ];
  const mockDepartments = [
    { id: "3ac9abae-27ec-40e2-9032-e17724fc5b5e", name: "Bidang Kepegawaian" },
    { id: "0946afff-c8c2-4b6c-bccf-b6802b034938", name: "Bidang Pendidikan" },
  ];

  const mockUsersService = {
    getUnits: async () => mockUnits,
    getDepartments: async () => mockDepartments,
  };

  const controller = new UsersController(mockUsersService as any, {} as any);

  assert.equal(typeof (controller as any).getUnits, "function", "controller must expose getUnits");
  assert.equal(typeof (controller as any).getDepartments, "function", "controller must expose getDepartments");

  const unitsResult = await (controller as any).getUnits();
  assert.equal(unitsResult.success, true);
  assert.deepEqual(unitsResult.data, mockUnits);

  const deptsResult = await (controller as any).getDepartments();
  assert.equal(deptsResult.success, true);
  assert.deepEqual(deptsResult.data, mockDepartments);

  // 2. Test OrganizationRoleAdminService for unit scope
  let fetchCalledUrl = "";
  let fetchCalledInit: any = null;
  const mockFetch = async (url: string, init: any) => {
    fetchCalledUrl = url;
    fetchCalledInit = init;
    return {
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: "Unit admin assigned" }),
    } as any;
  };

  process.env.SIMPEG_API_URL = "http://simpeg-api:3000";
  const mockPrisma = {
    roleAssignment: {
      findUnique: async () => ({
        id: "assignment-1",
        userId: "user-1",
        unitId: "0f3505db-ba0b-48e3-a500-2de9790bdd63",
        departmentId: null,
        app: "spmb",
        role: "admin_unit",
      }),
    },
  };

  const orgService = new OrganizationRoleAdminService(mockPrisma as any, mockFetch as any);

  // Unit assign
  const assignResult = await orgService.assign(
    "user-1",
    {
      scope: "unit",
      unitId: "0f3505db-ba0b-48e3-a500-2de9790bdd63",
      app: "spmb",
      role: "admin_unit",
    },
    "Bearer token",
  );
  assert.ok(assignResult);
  assert.match(fetchCalledUrl, /\/api\/units\/0f3505db-ba0b-48e3-a500-2de9790bdd63\/admins/);
  assert.equal(fetchCalledInit.method, "POST");

  // Unit revoke
  const revokeResult = await orgService.revoke("assignment-1", "Bearer token");
  assert.ok(revokeResult);
  assert.match(fetchCalledUrl, /\/api\/units\/0f3505db-ba0b-48e3-a500-2de9790bdd63\/admins\/user-1\/spmb/);
  assert.equal(fetchCalledInit.method, "DELETE");

  console.log("Admin organization catalog contract passed!");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
