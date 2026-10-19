import assert from "node:assert/strict";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import * as Contracts from "../../../../packages/contracts/src";
import { InternalController } from "../src/internal/internal.controller";
import { InternalService } from "../src/internal/internal.service";

const unitId = "11111111-1111-4111-8111-111111111111";
const incomingAt = "2026-10-18T10:00:00.000Z";
const token = "unit-projection-contract-token";

type Projection = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "archived";
  category: "pendidikan" | "nondik";
  sourceUpdatedAt: Date;
};

function makePrisma(state: { units: Projection[]; upserts: number }) {
  return {
    unitProjection: {
      async findUnique({ where }: any) {
        return state.units.find((unit) => unit.id === where.id) ?? null;
      },
      async upsert({ where, create, update }: any) {
        state.upserts += 1;
        const index = state.units.findIndex((unit) => unit.id === where.id);
        if (index < 0) {
          const created = { ...create };
          state.units.push(created);
          return created;
        }
        state.units[index] = { ...state.units[index], ...update };
        return state.units[index];
      },
    },
  };
}

async function main() {
  const schema = (Contracts as Record<string, unknown>).UnitProjectionPayloadSchema as {
    safeParse?: (value: unknown) => { success: boolean };
  } | undefined;
  assert.ok(schema?.safeParse, "contracts must export UnitProjectionPayloadSchema");

  const payload = {
    id: unitId,
    name: "SMP Alfida",
    slug: `unit-${unitId}`,
    status: "active" as const,
    category: "pendidikan" as const,
    sourceUpdatedAt: incomingAt,
  };
  assert.equal(schema.safeParse(payload).success, true, "canonical unit projection payload must validate");
  assert.equal(schema.safeParse({ ...payload, unexpected: true }).success, false, "canonical payload must reject unknown fields");

  const state = { units: [] as Projection[], upserts: 0 };
  const service = new InternalService(makePrisma(state) as any);
  const controller = new InternalController(service);
  const originalToken = process.env.INTERNAL_SERVICE_TOKEN;
  const originalSecret = process.env.INTERNAL_SERVICE_SECRET;
  process.env.INTERNAL_SERVICE_TOKEN = token;
  delete process.env.INTERNAL_SERVICE_SECRET;

  try {
    await assert.rejects(
      () => (controller as any).putUnitProjection(undefined, unitId, payload),
      UnauthorizedException,
      "unit projection receiver must require the internal service token",
    );
    await assert.rejects(
      () => (controller as any).putUnitProjection(token, unitId, { ...payload, category: "unknown" }),
      BadRequestException,
      "unit projection receiver must reject malformed payloads",
    );
    await assert.rejects(
      () => (controller as any).putUnitProjection(token, "22222222-2222-4222-8222-222222222222", payload),
      BadRequestException,
      "path unit id must equal payload id",
    );

    const applied = await (controller as any).putUnitProjection(token, unitId, payload);
    assert.equal(applied.status, "applied");
    assert.equal(state.units.length, 1);
    assert.equal(state.units[0].slug, `unit-${unitId}`);
    assert.equal(state.units[0].sourceUpdatedAt.toISOString(), incomingAt);
    assert.equal(state.upserts, 1);

    const idempotent = await (controller as any).putUnitProjection(token, unitId, payload);
    assert.equal(idempotent.status, "stale", "the same source timestamp must be idempotently stale");
    assert.equal(state.upserts, 1, "stale retries must not write");

    const older = await (controller as any).putUnitProjection(token, unitId, {
      ...payload,
      name: "Older name",
      sourceUpdatedAt: "2026-10-18T09:59:59.999Z",
    });
    assert.equal(older.status, "stale");
    assert.equal(state.units[0].name, "SMP Alfida", "older source data must not overwrite newer data");
    assert.equal(state.upserts, 1);

    const archived = await (controller as any).putUnitProjection(token, unitId, {
      ...payload,
      status: "archived",
      sourceUpdatedAt: "2026-10-18T10:00:01.000Z",
    });
    assert.equal(archived.status, "applied");
    assert.equal(state.units[0].status, "archived");
    assert.equal(state.upserts, 2, "newer source data must upsert");
  } finally {
    if (originalToken === undefined) delete process.env.INTERNAL_SERVICE_TOKEN;
    else process.env.INTERNAL_SERVICE_TOKEN = originalToken;
    if (originalSecret === undefined) delete process.env.INTERNAL_SERVICE_SECRET;
    else process.env.INTERNAL_SERVICE_SECRET = originalSecret;
  }

  console.log("SIAKAD internal unit projection contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
