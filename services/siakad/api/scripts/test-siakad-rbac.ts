import { ForbiddenException } from "@nestjs/common";
import { SiakadRolesGuard, SiakadRoles } from "../src/common/guards/siakad-roles.guard";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function makeContext(user: unknown, requiredRoles?: string[]) {
  const handler = { requiredRoles };
  return {
    getHandler: () => handler,
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  };
}

function expectForbidden(label: string, action: () => boolean) {
  try {
    action();
    throw new Error(`${label}: expected access to be denied`);
  } catch (error) {
    if (!(error instanceof ForbiddenException)) throw error;
  }
}

const guard = new SiakadRolesGuard({
  getAllAndOverride: (_key: string, targets: unknown[]) =>
    (targets[0] as { requiredRoles?: string[] })?.requiredRoles,
} as never);

// Decorator remains part of the public route contract for future controllers.
assert(typeof SiakadRoles === "function", "SiakadRoles decorator must be exported");

assert(
  guard.canActivate(makeContext({ roles: [{ app: "siakad", role: "guru" }] }, ["guru"]) as never),
  "SIAKAD guru claim must satisfy the matching SIAKAD role",
);
assert(
  guard.canActivate(makeContext({ roles: [{ app: "*", role: "super_admin" }] }, ["admin_unit"]) as never),
  "super_admin wildcard claim must bypass SIAKAD role checks",
);
assert(
  guard.canActivate(makeContext({ roles: [{ app: "spmb", role: "orang_tua" }] }) as never),
  "unannotated handlers must remain available to authenticated users",
);

expectForbidden("foreign app claim", () =>
  guard.canActivate(makeContext({ roles: [{ app: "spmb", role: "guru" }] }, ["guru"]) as never),
);
expectForbidden("privilege escalation", () =>
  guard.canActivate(makeContext({ roles: [{ app: "siakad", role: "orang_tua" }] }, ["admin_unit"]) as never),
);
expectForbidden("missing roles", () => guard.canActivate(makeContext({}, ["guru"]) as never));

console.log("SIAKAD RBAC contract passed");
