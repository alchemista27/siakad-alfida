import { PrismaClient } from "../src/generated/prisma";

type OutboxRow = {
  id: string;
  aggregate: string;
  eventType: string;
  status: string;
  payload: unknown;
};

type OutboxStore = {
  findMany(input: unknown): Promise<OutboxRow[]>;
  updateMany(input: {
    where: { id: string; status: { in: string[] } };
    data: Record<string, unknown>;
  }): Promise<{ count: number }>;
};

type RepairPrisma = {
  organizationSyncOutbox: OutboxStore;
  $disconnect?: () => Promise<void>;
};

function isPayloadWithLegacySourceCreatedAt(value: unknown): value is Record<string, unknown> {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.prototype.hasOwnProperty.call(value, "sourceCreatedAt"),
  );
}

export async function repairDepartmentMemberOutboxPayloads(
  prisma: RepairPrisma,
  apply: boolean,
) {
  const rows = await prisma.organizationSyncOutbox.findMany({
    where: {
      aggregate: "department_member",
      eventType: "department-member.upserted",
      status: { in: ["failed", "pending"] },
    },
    select: { id: true, aggregate: true, eventType: true, status: true, payload: true },
  });
  const candidates = rows.filter(
    (row) =>
      row.aggregate === "department_member" &&
      row.eventType === "department-member.upserted" &&
      ["failed", "pending"].includes(row.status) &&
      isPayloadWithLegacySourceCreatedAt(row.payload),
  );
  if (!apply) return { candidates: candidates.length, repaired: 0 };

  let repaired = 0;
  for (const row of candidates) {
    const { sourceCreatedAt: _legacyField, ...payload } = row.payload as Record<string, unknown>;
    const result = await prisma.organizationSyncOutbox.updateMany({
      where: { id: row.id, status: { in: ["failed", "pending"] } },
      data: {
        payload,
        status: "pending",
        availableAt: new Date(),
        lastError: null,
        deliveredAt: null,
      },
    });
    repaired += result.count;
  }
  return { candidates: candidates.length, repaired };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  for (const argument of args) {
    if (argument !== "--apply") throw new Error(`Unknown argument: ${argument}`);
  }
  const prisma = new PrismaClient();
  try {
    console.log(JSON.stringify({ mode: args.has("--apply") ? "apply" : "dry-run", ...(await repairDepartmentMemberOutboxPayloads(prisma as unknown as RepairPrisma, args.has("--apply"))) }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
