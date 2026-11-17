import assert from "node:assert/strict";
import { ForbiddenException } from "@nestjs/common";
import { SiakadRolesGuard } from "../src/common/guards/siakad-roles.guard";

const guard = new SiakadRolesGuard({ getAllAndOverride: () => ["admin_unit"] } as any);
const context = (method: string) => ({
  getHandler: () => ({}),
  getClass: () => ({}),
  switchToHttp: () => ({ getRequest: () => ({ method, user: { roles: [{ app: "simpeg", role: "pimpinan" }] } }) }),
});

assert.equal(guard.canActivate(context("GET") as any), true, "Foundation leadership must read SIAKAD dashboard sources");
assert.throws(() => guard.canActivate(context("POST") as any), ForbiddenException, "Foundation leadership must not inherit SIAKAD mutations");

console.log("SIAKAD Foundation Leader read-only RBAC contract passed");