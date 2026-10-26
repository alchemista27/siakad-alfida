import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ForbiddenException } from "@nestjs/common";
import { SetoranService } from "../src/setoran/setoran.service";
import type { YmqPrincipal } from "../src/ymq/ymq-access.policy";

const root = resolve(import.meta.dirname, "..");
const controller = readFileSync(resolve(root, "src/setoran/setoran.controller.ts"), "utf8");
const serviceSource = readFileSync(resolve(root, "src/setoran/setoran.service.ts"), "utf8");

assert.match(
  controller,
  /@UseGuards\(ServiceJwtAuthGuard,\s*YmqRolesGuard\)/,
  "Setoran must require the service JWT and the scoped YMQ roles guard",
);
assert.match(
  controller,
  /@Post\("my"\)\s*@YmqRoles\([^)]+"peserta"[^)]*\)/s,
  "Authenticated YMQ participants must be explicitly permitted to submit their own setoran",
);
assert.match(
  controller,
  /@Get\("my"\)\s*@YmqRoles\([^)]+"peserta"[^)]*\)/s,
  "Authenticated YMQ participants must be explicitly permitted to read their own setoran",
);
assert.match(
  controller,
  /@Get\("pending"\)\s*@YmqRoles\("admin_ymq",\s*"musyrif"\)/s,
  "Pending verification must be limited to the two legacy verifier roles",
);
assert.match(
  controller,
  /@Post\(":id\/verify"\)\s*@YmqRoles\("admin_ymq",\s*"musyrif"\)/s,
  "Verification must be limited to the two legacy verifier roles",
);
assert.doesNotMatch(
  controller,
  /r\.role\s*===/,
  "Controller must delegate role scope checks to YmqRolesGuard rather than comparing raw roles",
);
assert.match(serviceSource, /ForbiddenException/, "Service must reject a verifier outside the setoran owner's legacy group");
assert.match(
  serviceSource,
  /members:\s*\{\s*some:\s*\{\s*userId:/s,
  "Service must constrain a musyrif to groups containing the setoran owner",
);

const principal = (id: string, role: string): YmqPrincipal => ({
  id,
  roles: [{ app: "siyaum", role }],
});

const createPrisma = (assignedGroup: { id: string } | null) => {
  const updateCalls: unknown[] = [];
  return {
    updateCalls,
    prisma: {
      ymqSetoran: {
        findUnique: async () => ({ id: "setoran-1", userId: "peserta-1" }),
        update: async (args: unknown) => {
          updateCalls.push(args);
          return args;
        },
      },
      ymqGroup: {
        findFirst: async () => assignedGroup,
      },
    },
  };
};

const dto = { status: "verified", catatanMusyrif: null };

async function run() {
  {
    const { prisma, updateCalls } = createPrisma({ id: "group-1" });
    const service = new SetoranService(prisma as never);
    await service.verify("setoran-1", principal("musyrif-1", "musyrif"), dto);
    assert.equal(updateCalls.length, 1);
    assert.deepEqual((updateCalls[0] as { data: { verifiedById: string } }).data.verifiedById, "musyrif-1");
  }

  {
    const { prisma } = createPrisma(null);
    const service = new SetoranService(prisma as never);
    await assert.rejects(
      () => service.verify("setoran-1", principal("musyrif-lain", "musyrif"), dto),
      ForbiddenException,
    );
  }

  {
    const { prisma, updateCalls } = createPrisma(null);
    const service = new SetoranService(prisma as never);
    await service.verify("setoran-1", principal("admin-1", "admin_ymq"), dto);
    assert.equal(updateCalls.length, 1);
    assert.deepEqual((updateCalls[0] as { data: { verifiedById: string } }).data.verifiedById, "admin-1");
  }

  console.log("SIYAUM setoran auth contract passed");
}

void run();
