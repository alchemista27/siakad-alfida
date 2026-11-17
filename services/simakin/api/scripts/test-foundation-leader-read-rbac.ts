import assert from "node:assert/strict";
import { ForbiddenException } from "@nestjs/common";
import { SimakinRolesGuard } from "../src/common/guards/simakin-roles.guard";

const guard = new SimakinRolesGuard({ getAllAndOverride: () => ["pimpinan"] } as any);
const context = (method: string) => ({
  getHandler: () => ({}),
  getClass: () => ({}),
  switchToHttp: () => ({ getRequest: () => ({ method, user: { roles: [{ app: "simpeg", role: "pimpinan" }] } }) }),
});

assert.equal(guard.canActivate(context("GET") as any), true, "Foundation leadership must read SIMAKIN dashboard endpoints");
assert.throws(() => guard.canActivate(context("POST") as any), ForbiddenException, "Foundation leadership must not inherit SIMAKIN mutations");

console.log("SIMAKIN Foundation Leader read-only RBAC contract passed");