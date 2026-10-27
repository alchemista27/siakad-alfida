import assert from "node:assert/strict";
import { ForbiddenException } from "@nestjs/common";
import { PATH_METADATA, METHOD_METADATA } from "@nestjs/common/constants";
import { RequestMethod } from "@nestjs/common/enums/request-method.enum";
import { YmqRoleAdministrationController } from "../src/ymq-role-administration/ymq-role-administration.controller";
import { YmqRoleAdministrationService } from "../src/ymq-role-administration/ymq-role-administration.service";

const ids = {
  actor: "11111111-1111-4111-8111-111111111111",
  target: "22222222-2222-4222-8222-222222222222",
};

async function main() {
  const calls: Array<{ operation: string; actorId?: string; userId?: string }> = [];
  const controller = new YmqRoleAdministrationController({
    listAdmins: async () => [{ id: ids.target }],
    assignAdminYmq: async (actorId: string, userId: string) => { calls.push({ operation: "assign", actorId, userId }); return { changed: true }; },
    revokeAdminYmq: async (actorId: string, userId: string) => { calls.push({ operation: "revoke", actorId, userId }); return { deleted: true }; },
  } as any);
  const req = { user: { id: ids.actor } };
  assert.deepEqual(await controller.listAdmins(), [{ id: ids.target }]);
  await controller.assignAdminYmq(req, { userId: ids.target });
  await controller.revokeAdminYmq(req, ids.target);
  assert.deepEqual(calls, [
    { operation: "assign", actorId: ids.actor, userId: ids.target },
    { operation: "revoke", actorId: ids.actor, userId: ids.target },
  ]);

  assert.equal(Reflect.getMetadata(PATH_METADATA, YmqRoleAdministrationController), "ymq/roles");
  assert.equal(Reflect.getMetadata(PATH_METADATA, YmqRoleAdministrationController.prototype.listAdmins), "admins");
  assert.equal(Reflect.getMetadata(METHOD_METADATA, YmqRoleAdministrationController.prototype.listAdmins), RequestMethod.GET);
  assert.equal(Reflect.getMetadata(METHOD_METADATA, YmqRoleAdministrationController.prototype.assignAdminYmq), RequestMethod.POST);
  assert.equal(Reflect.getMetadata(METHOD_METADATA, YmqRoleAdministrationController.prototype.revokeAdminYmq), RequestMethod.DELETE);

  const requests: Array<{ url: string; init: RequestInit }> = [];
  process.env.AUTH_API_URL = "https://auth.internal.test";
  process.env.AUTH_INTERNAL_SERVICE_TOKEN = "broker-token";
  const service = new YmqRoleAdministrationService(
    { user: { findMany: async () => [{ id: ids.target, fullName: "Pegawai Uji", email: "uji@example.test", isActive: true }] } } as any,
    new (await import("../src/ymq-role-administration/auth-ymq-role-broker.client")).AuthYmqRoleBrokerClient(async (url, init) => {
      requests.push({ url: String(url), init: init ?? {} });
      return new Response(JSON.stringify([{ userId: ids.target, role: "admin_ymq" }]), { status: 200, headers: { "content-type": "application/json" } });
    }),
  );
  assert.deepEqual(await service.listAdmins(), [{ id: ids.target, fullName: "Pegawai Uji", email: "uji@example.test", isActive: true }]);
  assert.equal(requests[0].url, "https://auth.internal.test/api/internal/ymq-role-broker/roles/admin_ymq");
  assert.equal(new Headers(requests[0].init.headers).get("x-internal-service-key"), "broker-token");

  const guard = new (await import("../src/common/guards/simpeg-roles.guard")).SimpegRolesGuard({ getAllAndOverride: () => ["super_admin"] } as any);
  const context = (roles: unknown[]) => ({ getHandler: () => ({}), getClass: () => ({}), switchToHttp: () => ({ getRequest: () => ({ user: { roles } }) }) });
  assert.equal(guard.canActivate(context([{ app: "auth", role: "super_admin" }]) as any), true);
  assert.throws(() => guard.canActivate(context([{ app: "simpeg", role: "admin_kepegawaian" }]) as any), ForbiddenException);

  console.log("SIMPEG YMQ role administration contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
