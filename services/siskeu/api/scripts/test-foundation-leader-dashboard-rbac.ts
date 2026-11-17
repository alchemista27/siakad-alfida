import assert from "node:assert/strict";
import { ForbiddenException } from "@nestjs/common";
import { SiskeuRolesGuard } from "../src/auth/siskeu-roles.guard";

const leader = { roles: [{ app: "simpeg", role: "pimpinan" }] };
const context = (requiredRoles: string[]) => ({
  getHandler: () => ({}),
  getClass: () => ({}),
  switchToHttp: () => ({ getRequest: () => ({ user: leader }) }),
});

assert.equal(new SiskeuRolesGuard({ getAllAndOverride: () => ["foundation_leader"] } as any).canActivate(context(["foundation_leader"]) as any), true, "Foundation leadership must read the SISKEU dashboard");
assert.throws(
  () => new SiskeuRolesGuard({ getAllAndOverride: () => ["admin_keuangan", "super_admin"] } as any).canActivate(context(["admin_keuangan", "super_admin"]) as any),
  ForbiddenException,
  "Foundation leadership must not inherit SISKEU operational actions",
);

console.log("SISKEU Foundation Leader dashboard RBAC contract passed");