import assert from "node:assert/strict";
import { BadRequestException } from "@nestjs/common";
import { validateOrganizationRoleInput, validatePublicOrganizationRoleInput } from "../src/users/organization-roles.dto";
import { InternalOrganizationRolesGuard } from "../src/users/internal-organization-roles.guard";

const input = {
  userId: "11111111-1111-4111-8111-111111111111",
  scope: "unit" as const,
  unitId: "22222222-2222-4222-8222-222222222222",
  app: "spmb" as const,
  role: "observer" as const,
};

assert.deepEqual(validateOrganizationRoleInput(input), input, "internal services must be able to grant a scoped SPMB observer role");
assert.throws(() => validatePublicOrganizationRoleInput(input), BadRequestException, "browser callers may not grant observer roles directly");

const previousAuthToken = process.env.AUTH_INTERNAL_SERVICE_TOKEN;
const previousSharedToken = process.env.INTERNAL_SERVICE_SECRET;
delete process.env.AUTH_INTERNAL_SERVICE_TOKEN;
process.env.INTERNAL_SERVICE_SECRET = "shared-test-token";
try {
  const guard = new InternalOrganizationRolesGuard();
  assert.equal(guard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ header: () => "shared-test-token" }) }) } as any), true);
} finally {
  if (previousAuthToken === undefined) delete process.env.AUTH_INTERNAL_SERVICE_TOKEN;
  else process.env.AUTH_INTERNAL_SERVICE_TOKEN = previousAuthToken;
  if (previousSharedToken === undefined) delete process.env.INTERNAL_SERVICE_SECRET;
  else process.env.INTERNAL_SERVICE_SECRET = previousSharedToken;
}
console.log("Auth SPMB observer role contract passed");
