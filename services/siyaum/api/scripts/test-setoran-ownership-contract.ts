import assert from "node:assert/strict";
import { ForbiddenException } from "@nestjs/common";
import { SetoranService } from "../src/setoran/setoran.service";
import type { YmqPrincipal } from "../src/ymq/ymq-access.policy";

const verification = { status: "verified" as const, catatanPembina: "Baik" };
const pembina: YmqPrincipal = { id: "pembina-1", roles: [{ app: "siyaum", role: "pembina_ymq" }] };
const admin: YmqPrincipal = { id: "admin-1", roles: [{ app: "siyaum", role: "admin_ymq" }] };

function createService(groupAccess: "assigned" | "denied" | "unexpected") {
  const calls = { groupLookup: 0 };
  const prisma = {
    ymqSetoran: { findUnique: async () => ({ id: "setoran-1", userId: "peserta-1" }), update: async (args: unknown) => args },
    ymqGroup: {
      findFirst: async () => {
        calls.groupLookup += 1;
        if (groupAccess === "unexpected") throw new Error("Admin must not need a group lookup");
        return groupAccess === "assigned" ? { id: "group-1" } : null;
      },
    },
  };
  return { service: new SetoranService(prisma as never), calls };
}

async function main() {
  const assigned = createService("assigned");
  const assignedResult = await assigned.service.verify("setoran-1", pembina as never, verification);
  assert.equal((assignedResult as unknown as { data: { verifiedById: string } }).data.verifiedById, pembina.id);
  assert.equal(assigned.calls.groupLookup, 1);

  const denied = createService("denied");
  await assert.rejects(() => denied.service.verify("setoran-1", pembina as never, verification), ForbiddenException);
  assert.equal(denied.calls.groupLookup, 1);

  const administrator = createService("unexpected");
  const adminResult = await administrator.service.verify("setoran-1", admin as never, verification);
  assert.equal((adminResult as unknown as { data: { verifiedById: string } }).data.verifiedById, admin.id);
  assert.equal(administrator.calls.groupLookup, 0);

  console.log("SIYAUM setoran ownership contract passed");
}

void main();
