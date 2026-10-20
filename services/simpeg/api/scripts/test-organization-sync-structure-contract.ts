import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { OrganizationSyncOutboxPolicy } from "../src/organization-sync/organization-sync.policy";
import { OrganizationSyncProcessor } from "../src/organization-sync/organization-sync.processor";
import { SimakinSyncClient } from "../src/organization-sync/simakin-sync.client";

const root = resolve(__dirname, "..");
const schema = readFileSync(resolve(root, "prisma/schema.prisma"), "utf8");
const migrationPath = resolve(
  root,
  "prisma/migrations/20261020231000_add_organization_import_structures/migration.sql"
);
const migration = readFileSync(migrationPath, "utf8");

async function main() {
  assert.ok(
    existsSync(migrationPath),
    "organization import migration must exist"
  );
  for (const fragment of [
    "department_member",
    "unitId      String?",
    "parentId    String?",
    "leaderId    String?",
    "model DepartmentMember",
    "role            String?",
    "sourceCreatedAt DateTime?",
    "sourceUpdatedAt DateTime",
    "model OrganizationImportReceipt",
    "payloadHash   String",
    "sourceVersion DateTime",
    "@@unique([source, entity, sourceId])",
  ])
    assert.ok(schema.includes(fragment), `schema is missing ${fragment}`);
  for (const fragment of [
    "ALTER TYPE \"OrganizationSyncAggregate\" ADD VALUE IF NOT EXISTS 'department_member'",
    'CREATE TABLE IF NOT EXISTS "department_members"',
    'CREATE TABLE IF NOT EXISTS "organization_import_receipts"',
    '"payload_hash" VARCHAR(64) NOT NULL',
    '"source_version" TIMESTAMPTZ NOT NULL',
  ])
    assert.ok(migration.includes(fragment), `migration is missing ${fragment}`);

  const policy = new OrganizationSyncOutboxPolicy();
  const version = new Date("2026-10-20T12:00:00.000Z");
  const department = policy.departmentEvent({
    id: "00000000-0000-4000-8000-000000000201",
    unitId: "00000000-0000-4000-8000-000000000202",
    parentId: "00000000-0000-4000-8000-000000000203",
    leaderId: "00000000-0000-4000-8000-000000000204",
    name: "Departemen Induk",
    code: "DI",
    description: null,
    isActive: true,
    updatedAt: version,
  });
  assert.deepEqual(department.payload, {
    id: "00000000-0000-4000-8000-000000000201",
    unitId: "00000000-0000-4000-8000-000000000202",
    parentId: "00000000-0000-4000-8000-000000000203",
    leaderId: "00000000-0000-4000-8000-000000000204",
    name: "Departemen Induk",
    code: "DI",
    description: null,
    isActive: true,
    updatedAt: version.toISOString(),
  });
  const member = policy.departmentMemberEvent({
    id: "00000000-0000-4000-8000-000000000205",
    departmentId: "00000000-0000-4000-8000-000000000201",
    userId: "00000000-0000-4000-8000-000000000204",
    role: "member",
    sourceCreatedAt: new Date("2026-10-20T11:00:00.000Z"),
    sourceUpdatedAt: version,
  });
  assert.equal(member.aggregate, "department_member");
  assert.equal(member.eventType, "department-member.upserted");
  assert.equal(
    policy.idempotencyKey(member),
    `department_member:${member.aggregateId}:${version.toISOString()}`,
    "outbox idempotency must be derived from the source version"
  );
  assert.equal(
    policy.departmentDeletionEvent({ id: department.aggregateId }).updatedAt,
    "1970-01-01T00:00:00.000Z",
    "legacy deletion retries must use a stable fallback version, never a fresh retry clock"
  );
  const user = policy.userEvent({
    id: "00000000-0000-4000-8000-000000000204",
    fullName: "Pegawai Alfida",
    email: "pegawai@example.test",
    username: "pegawai",
    avatarUrl: null,
    isActive: true,
    updatedAt: version,
  });
  assert.deepEqual(user.payload, {
    id: "00000000-0000-4000-8000-000000000204",
    fullName: "Pegawai Alfida",
    email: "pegawai@example.test",
    username: "pegawai",
    avatarUrl: null,
    isActive: true,
    sourceUpdatedAt: version.toISOString(),
  });
  assert.equal(
    policy.idempotencyKey(user),
    `user:${user.aggregateId}:${version.toISOString()}`,
    "user projections must be idempotent by their explicit source version"
  );

  const orderingProcessor = new OrganizationSyncProcessor({} as any, {} as any);
  const orderedEventTypes = [member, department, user]
    .sort(
      (left, right) =>
        (orderingProcessor as any).deliveryPriority(left) -
        (orderingProcessor as any).deliveryPriority(right)
    )
    .map((event) => event.eventType);
  assert.deepEqual(
    orderedEventTypes,
    ["user.projected", "department.upserted", "department-member.upserted"],
    "users must be delivered before department leaders and member edges"
  );
  const processorSource = readFileSync(
    resolve(root, "src/organization-sync/organization-sync.processor.ts"),
    "utf8"
  );
  assert.match(
    processorSource,
    /\[\.\.\.rows\]\.sort\([\s\S]*this\.deliveryPriority\(left\) - this\.deliveryPriority\(right\)/,
    "the processor must apply the delivery priority rather than merely defining it"
  );

  const requests: Array<{ url: string; method?: string }> = [];
  const originalFetch = globalThis.fetch;
  const originalBaseUrl = process.env.SIMAKIN_API_URL;
  const originalToken = process.env.AUTH_INTERNAL_SERVICE_TOKEN;
  process.env.SIMAKIN_API_URL = "https://simakin.example.test";
  process.env.AUTH_INTERNAL_SERVICE_TOKEN = "test-token";
  globalThis.fetch = (async (url, init) => {
    requests.push({ url: String(url), method: init?.method });
    return new Response(null, { status: 204 });
  }) as typeof fetch;
  try {
    await new SimakinSyncClient().deliver(user);
    await new SimakinSyncClient().deliver(member);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalBaseUrl === undefined) delete process.env.SIMAKIN_API_URL;
    else process.env.SIMAKIN_API_URL = originalBaseUrl;
    if (originalToken === undefined)
      delete process.env.AUTH_INTERNAL_SERVICE_TOKEN;
    else process.env.AUTH_INTERNAL_SERVICE_TOKEN = originalToken;
  }
  assert.deepEqual(
    requests,
    [
      {
        url: `https://simakin.example.test/api/strategic/organization-sync/users/${user.aggregateId}`,
        method: "PUT",
      },
      {
        url: `https://simakin.example.test/api/strategic/organization-sync/department-members/${member.aggregateId}`,
        method: "PUT",
      },
    ],
    "only the outbox processor's SIMAKIN client may deliver department-member events"
  );

  const row: any = {
    id: "00000000-0000-4000-8000-000000000206",
    aggregate: member.aggregate,
    aggregateId: member.aggregateId,
    eventType: member.eventType,
    payload: member.payload,
    status: "pending",
    attemptCount: 0,
    availableAt: new Date(0),
    createdAt: new Date(0),
  };
  const delivered: any[] = [];
  const outbox = {
    async findMany() {
      return row.status === "pending" ? [{ ...row }] : [];
    },
    async updateMany({ where, data }: any) {
      if (where.id && where.id !== row.id) return { count: 0 };
      const expectedStatuses = Array.isArray(where.status?.in)
        ? where.status.in
        : where.status
          ? [where.status]
          : null;
      if (expectedStatuses && !expectedStatuses.includes(row.status))
        return { count: 0 };
      if (where.availableAt?.lte && row.availableAt > where.availableAt.lte)
        return { count: 0 };
      Object.assign(row, data);
      return { count: 1 };
    },
  };
  const processor = new OrganizationSyncProcessor(
    { organizationSyncOutbox: outbox } as any,
    {
      async deliver(event: any) {
        delivered.push(event);
      },
    } as any
  );
  await processor.processBatch();
  assert.equal(
    delivered.length,
    1,
    "the processor must route department-member events through the SIMAKIN delivery client"
  );
  assert.equal(row.status, "delivered");

  console.log("Organization sync structure contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
