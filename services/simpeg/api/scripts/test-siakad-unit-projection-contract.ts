import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as Contracts from "../../../../packages/contracts/src";
import { OrganizationSyncProcessor } from "../src/organization-sync/organization-sync.processor";
import { OrganizationSyncService } from "../src/organization-sync/organization-sync.service";
import { SiakadSyncClient } from "../src/organization-sync/siakad-sync.client";
import { UnitsService } from "../src/units/units.service";

const apiRoot = join(import.meta.dirname, "..");
const prismaSchema = readFileSync(join(apiRoot, "prisma/schema.prisma"), "utf8");
const migrationPath = join(apiRoot, "prisma/migrations/20261018150000_add_unit_organization_sync_aggregate/migration.sql");

const unitId = "11111111-1111-4111-8111-111111111111";
const createdAt = new Date("2026-10-18T10:00:00.000Z");
const archivedAt = new Date("2026-10-18T10:00:01.000Z");

type Unit = {
  id: string;
  name: string;
  code: string;
  category: "pendidikan" | "nondik";
  address: string | null;
  isActive: boolean;
  updatedAt: Date;
};

async function main() {
  const events: any[] = [];
  let transactionCalls = 0;
  let directWrites = 0;
  let current: Unit = {
    id: unitId,
    name: "SMP Alfida",
    code: "SMP-ALFIDA",
    category: "pendidikan",
    address: null,
    isActive: true,
    updatedAt: createdAt,
  };
  const write = (data: any, updatedAt: Date) => {
    const defined = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
    current = { ...current, ...defined, updatedAt };
    return { ...current };
  };
  const tx = {
    unit: {
      async create({ data }: any) { return write({ id: unitId, ...data }, createdAt); },
      async update({ data }: any) { return write(data, archivedAt); },
    },
    organizationSyncOutbox: {
      async upsert({ create }: any) { events.push(create); return create; },
    },
  };
  const prisma = {
    unit: {
      async create({ data }: any) { directWrites += 1; return write({ id: unitId, ...data }, createdAt); },
      async update({ data }: any) { directWrites += 1; return write(data, archivedAt); },
      async findUnique() { return { ...current }; },
    },
    async $transaction(callback: any) {
      transactionCalls += 1;
      return callback(tx);
    },
  };

  const service = new UnitsService(prisma as any, new OrganizationSyncService());
  await service.create({ name: " SMP Alfida ", code: " smp-alfida ", category: "pendidikan" });
  await service.update(unitId, { name: "SMP Alfida", isActive: false });

  assert.equal(transactionCalls, 2, "unit create and update must atomically include their outbox event");
  assert.equal(directWrites, 0, "unit writes must use the transaction client");
  assert.equal(events.length, 2, "every unit create and update must enqueue one durable event");
  assert.deepEqual(events.map((event) => event.eventType), ["unit.upserted", "unit.archived"]);
  assert.deepEqual(events.map((event) => event.aggregate), ["unit", "unit"], "unit events must use the canonical durable aggregate");

  const payloads = events.map((event) => event.payload);
  assert.deepEqual(payloads[0], {
    id: unitId,
    name: "SMP Alfida",
    slug: `unit-${unitId}`,
    status: "active",
    category: "pendidikan",
    sourceUpdatedAt: createdAt.toISOString(),
  });
  assert.deepEqual(payloads[1], {
    ...payloads[0],
    status: "archived",
    sourceUpdatedAt: archivedAt.toISOString(),
  });
  assert.equal(payloads[1].slug, payloads[0].slug, "slug must be stable even when mutable unit fields change");

  const schema = (Contracts as Record<string, any>).UnitProjectionPayloadSchema;
  assert.equal(schema.safeParse(payloads[0]).success, true, "outbox payload must satisfy the common contract");
  assert.equal(schema.safeParse(payloads[1]).success, true, "archive payload must satisfy the common contract");

  const originalFetch = globalThis.fetch;
  const originalSiakadApiUrl = process.env.SIAKAD_API_URL;
  const originalInternalToken = process.env.INTERNAL_SERVICE_TOKEN;
  const requests: Array<{ url: string; init: RequestInit | undefined }> = [];
  process.env.SIAKAD_API_URL = "https://siakad.example.test/";
  process.env.INTERNAL_SERVICE_TOKEN = "unit-projection-contract-token";
  globalThis.fetch = (async (input, init) => {
    requests.push({ url: String(input), init });
    return new Response(null, { status: 204 });
  }) as typeof fetch;
  try {
    await new SiakadSyncClient().deliver({
      aggregate: "unit",
      aggregateId: unitId,
      eventType: "unit.archived",
      payload: payloads[1],
    });
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, `https://siakad.example.test/api/internal/organization/units/${unitId}`);
    assert.equal(requests[0].init?.method, "PUT");
    assert.equal((requests[0].init?.headers as Record<string, string>)["x-internal-service-token"], "unit-projection-contract-token");
    assert.ok(requests[0].init?.signal, "SIAKAD delivery must set a timeout signal");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSiakadApiUrl === undefined) delete process.env.SIAKAD_API_URL;
    else process.env.SIAKAD_API_URL = originalSiakadApiUrl;
    if (originalInternalToken === undefined) delete process.env.INTERNAL_SERVICE_TOKEN;
    else process.env.INTERNAL_SERVICE_TOKEN = originalInternalToken;
  }

  const row: any = {
    id: "22222222-2222-4222-8222-222222222222",
    aggregate: "unit",
    aggregateId: unitId,
    eventType: "unit.upserted",
    payload: payloads[0],
    status: "pending",
    attemptCount: 0,
    availableAt: new Date(Date.now() - 1_000),
  };
  const outbox = {
    async findMany() { return ["pending", "failed"].includes(row.status) ? [{ ...row }] : []; },
    async updateMany({ where, data }: any) {
      const statusMatches = Array.isArray(where.status?.in)
        ? where.status.in.includes(row.status)
        : row.status === where.status;
      const availabilityMatches = where.availableAt?.lte instanceof Date
        ? row.availableAt <= where.availableAt.lte
        : where.availableAt instanceof Date
          ? row.availableAt.getTime() === where.availableAt.getTime()
          : true;
      const matches = (!where.id || where.id === row.id) && statusMatches && availabilityMatches;
      if (matches) Object.assign(row, data);
      return { count: matches ? 1 : 0 };
    },
    async update({ data }: any) { Object.assign(row, data); return { ...row }; },
  };
  const siakadDeliveries: any[] = [];
  const processor = new OrganizationSyncProcessor(
    { organizationSyncOutbox: outbox } as any,
    { async deliver() { throw new Error("SIMAKIN must not receive unit events"); } } as any,
    { async deliver(event: any) { siakadDeliveries.push(event); } } as any,
  );
  await processor.processBatch();
  assert.equal(siakadDeliveries.length, 1, "processor must route unit events to SIAKAD");
  assert.equal(siakadDeliveries[0].eventType, "unit.upserted");
  assert.equal(row.status, "delivered", "successful SIAKAD delivery must use the existing outbox delivery lifecycle");

  assert.match(prismaSchema, /enum OrganizationSyncAggregate\s*\{[\s\S]*\bunit\b/);
  assert.equal(existsSync(migrationPath), true, "additive unit aggregate migration must exist");
  const migration = readFileSync(migrationPath, "utf8");
  assert.match(migration, /ALTER TYPE "OrganizationSyncAggregate" ADD VALUE IF NOT EXISTS 'unit';/);

  console.log("SIMPEG SIAKAD unit projection producer contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
