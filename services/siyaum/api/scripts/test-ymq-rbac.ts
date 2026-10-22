import assert from "node:assert/strict";
import { ForbiddenException } from "@nestjs/common";
import { YmqRolesGuard } from "../src/ymq/ymq-roles.guard";
import {
  canManageGroup,
  canReadExecutiveDashboard,
  canReadGroup,
  canReadOwnMembership,
  type YmqPrincipal,
} from "../src/ymq/ymq-access.policy";

const group = {
  id: "group-a",
  pembinaUserId: "pembina",
  groupAdmins: [{ userId: "group-admin", revokedAt: null }],
};
const principal = (id: string, role: string, app = "siyaum"): YmqPrincipal => ({
  id,
  roles: [{ app, role }],
});

assert.equal(canManageGroup(principal("admin", "admin_ymq"), group), true);
assert.equal(canManageGroup(principal("pembina", "pembina_ymq"), group), true);
assert.equal(canManageGroup(principal("pembina-other", "pembina_ymq"), group), false);
assert.equal(canManageGroup(principal("group-admin", "admin_kelompok"), group), true);
assert.equal(canManageGroup(principal("other", "admin_kelompok"), group), false);
assert.equal(canManageGroup(principal("root", "super_admin", "auth"), group), true);
assert.equal(canReadExecutiveDashboard(principal("pengawas", "pengawas")), true);
assert.equal(canReadExecutiveDashboard(principal("pimpinan", "pimpinan")), true);
assert.equal(canReadExecutiveDashboard(principal("peserta", "peserta")), false);
assert.equal(canReadOwnMembership(principal("peserta", "peserta"), "peserta"), true);
assert.equal(canReadOwnMembership(principal("peserta", "peserta"), "other"), false);

const participantGroup = { ...group, members: [{ userId: "peserta" }] };
assert.equal(canReadGroup(principal("peserta", "peserta"), participantGroup), true);
assert.equal(canReadGroup(principal("other-peserta", "peserta"), participantGroup), false);
assert.equal(canReadGroup(principal("pengawas", "pengawas"), participantGroup), true);
assert.equal(canReadGroup(principal("pembina", "pembina_ymq"), participantGroup), true);

const reflector = {
  getAllAndOverride: () => ["admin_ymq", "pembina_ymq"],
};
const guard = new YmqRolesGuard(reflector as any);
const context = (user: YmqPrincipal) => ({
  getHandler: () => ({}),
  getClass: () => ({}),
  switchToHttp: () => ({ getRequest: () => ({ user }) }),
});
assert.equal(guard.canActivate(context(principal("admin", "admin_ymq")) as any), true);
assert.equal(guard.canActivate(context(principal("pembina", "pembina_ymq")) as any), true);
assert.throws(() => guard.canActivate(context(principal("foreign", "admin_ymq", "simakin")) as any), ForbiddenException);
assert.equal(new YmqRolesGuard({ getAllAndOverride: () => undefined } as any).canActivate(context(principal("x", "peserta")) as any), true);

console.log("SIYAUM YMQ RBAC contract passed");
