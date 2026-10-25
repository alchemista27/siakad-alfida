import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const root = resolve(import.meta.dirname, "..");
  const [service, module] = await Promise.all([
    readFile(resolve(root, "src/users/organization-role-admin.service.ts"), "utf8"),
    readFile(resolve(root, "src/users/users.module.ts"), "utf8"),
  ]);

  assert.match(
    service,
    /export const ORGANIZATION_ROLE_FETCH = Symbol\(/,
    "fetch runtime dependency must have a unique Nest injection token",
  );
  assert.match(
    service,
    /@Inject\(ORGANIZATION_ROLE_FETCH\)[\s\S]*fetchImpl:\s*FetchLike/,
    "OrganizationRoleAdminService must inject fetch via its token, not Function metadata",
  );
  assert.match(
    module,
    /ORGANIZATION_ROLE_FETCH/,
    "UsersModule must import the fetch injection token",
  );
  assert.match(
    module,
    /provide:\s*ORGANIZATION_ROLE_FETCH[\s\S]*useValue:\s*fetch/,
    "UsersModule must provide the runtime fetch implementation",
  );

  console.log("Organization-role fetch provider contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
