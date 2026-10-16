import assert from "node:assert/strict";
import { BadRequestException, HttpException } from "@nestjs/common";
import { OrganizationRoleAdminService } from "../src/users/organization-role-admin.service";

const userId = "00000000-0000-4000-8000-000000000001";
const departmentId = "00000000-0000-4000-8000-000000000002";
const roleAssignmentId = "00000000-0000-4000-8000-000000000003";

type FetchCall = { url: string; init?: RequestInit };

async function main() {
  const oldUrl = process.env.SIMPEG_API_URL;
  process.env.SIMPEG_API_URL = "https://simpeg.example.test/";
  const calls: FetchCall[] = [];
  const fetchOk: typeof fetch = (async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify({ success: true, message: "Synced" }), {
      status: 201,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
  const prisma = {
    roleAssignment: {
      findUnique: async () => ({
        id: roleAssignmentId,
        userId,
        app: "simakin",
        role: "admin_bidang",
        unitId: null,
        departmentId,
      }),
    },
  };
  const service = new OrganizationRoleAdminService(prisma as never, fetchOk);

  await service.assign(userId, { scope: "department", departmentId }, "Bearer caller-token");
  assert.deepEqual(calls[0], {
    url: `https://simpeg.example.test/api/departments/${departmentId}/admins`,
    init: {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer caller-token" },
      body: JSON.stringify({ userId }),
    },
  });

  await service.revoke(roleAssignmentId, "Bearer caller-token");
  assert.equal(calls[1]?.url, `https://simpeg.example.test/api/departments/${departmentId}/admins/${userId}`);
  assert.equal(calls[1]?.init?.method, "DELETE");
  assert.equal((calls[1]?.init?.headers as Record<string, string>).authorization, "Bearer caller-token");

  await assert.rejects(
    () => service.assign(userId, { scope: "unit", unitId: departmentId } as never, "Bearer caller-token"),
    (error: unknown) => error instanceof BadRequestException && /unit/i.test(error.message),
  );
  (prisma.roleAssignment.findUnique as any) = async () => ({
    id: roleAssignmentId,
    userId,
    app: "simpeg",
    role: "pegawai",
    unitId: null,
    departmentId: null,
  });
  await assert.rejects(
    () => service.revoke(roleAssignmentId, "Bearer caller-token"),
    /berscope/i,
  );

  const fetchNotFound: typeof fetch = (async () => new Response(JSON.stringify({ message: "Bidang tidak ditemukan" }), {
    status: 404,
    headers: { "content-type": "application/json" },
  })) as typeof fetch;
  const failing = new OrganizationRoleAdminService(prisma as never, fetchNotFound);
  (prisma.roleAssignment.findUnique as any) = async () => ({
    id: roleAssignmentId,
    userId,
    app: "simakin",
    role: "admin_bidang",
    unitId: null,
    departmentId,
  });
  await assert.rejects(
    () => failing.assign(userId, { scope: "department", departmentId }, "Bearer caller-token"),
    (error: unknown) => error instanceof HttpException && error.getStatus() === 404 && /Bidang tidak ditemukan/.test(error.message),
  );

  if (oldUrl === undefined) delete process.env.SIMPEG_API_URL;
  else process.env.SIMPEG_API_URL = oldUrl;
  console.log("Admin organization role proxy contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
