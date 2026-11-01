import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { UnitsService } from "../src/units/units.service";

async function main() {
  const controllerPath = resolve(import.meta.dirname, "../src/units/internal-unit-catalog.controller.ts");
  assert.ok(existsSync(controllerPath), "internal unit-catalog controller must exist");
  const controller = readFileSync(controllerPath, "utf8");
  assert.match(controller, /@Controller\("internal\/units"\)/);
  assert.match(controller, /@UseGuards\(InternalServiceAuthGuard\)/);
  assert.match(controller, /@Get\("active"\)/);

  const calls: unknown[] = [];
  const prisma = {
    unit: {
      async findMany(args: unknown) {
        calls.push(args);
        return [{ id: "unit-lksa", name: "LKSA Asrama Yatim Alfida" }];
      },
    },
  };
  const service = new UnitsService(prisma as never, {} as never, {} as never);
  const units = await (service as any).listActiveForInternal();
  assert.deepEqual(units, [{ id: "unit-lksa", name: "LKSA Asrama Yatim Alfida" }]);
  assert.deepEqual(calls, [{
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  }]);

  console.log("SIMPEG internal active-unit catalog contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
