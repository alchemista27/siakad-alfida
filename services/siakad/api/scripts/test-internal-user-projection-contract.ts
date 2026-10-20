import assert from "node:assert/strict";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import * as Contracts from "../../../../packages/contracts/src";
import { InternalController } from "../src/internal/internal.controller";
import { InternalService } from "../src/internal/internal.service";

const userId = "11111111-1111-4111-8111-111111111111";
const unitId = "22222222-2222-4222-8222-222222222222";
const incomingAt = "2026-10-20T22:00:00.000Z";
const token = "user-projection-contract-token";

type Projection = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  roles: unknown;
  status: "active" | "archived";
  sourceUpdatedAt: Date;
};

function makePrisma(state: { users: Projection[]; upserts: number }) {
  return {
    userProjection: {
      async findUnique({ where }: any) {
        return state.users.find((user) => user.id === where.id) ?? null;
      },
      async upsert({ where, create, update }: any) {
        state.upserts += 1;
        const index = state.users.findIndex((user) => user.id === where.id);
        if (index < 0) {
          state.users.push({ ...create });
          return state.users.at(-1);
        }
        state.users[index] = { ...state.users[index], ...update };
        return state.users[index];
      },
    },
  };
}

async function main() {
  const schema = (Contracts as Record<string, unknown>).UserProjectionPayloadSchema as {
    safeParse?: (value: unknown) => { success: boolean };
  } | undefined;
  assert.ok(schema?.safeParse, "contracts must export UserProjectionPayloadSchema");

  const payload = {
    id: userId,
    name: "Guru Alfida",
    email: "guru@example.test",
    phone: null,
    roles: [{ app: "siakad", role: "guru", unitId, departmentId: null }],
    status: "active" as const,
    sourceUpdatedAt: incomingAt,
  };
  assert.equal(schema.safeParse(payload).success, true, "canonical user projection payload must validate");
  assert.equal(schema.safeParse({ ...payload, unexpected: true }).success, false, "canonical user payload must reject unknown fields");
  assert.equal(schema.safeParse({ ...payload, id: "bad" }).success, false, "canonical user projection requires a UUID");

  const state = { users: [] as Projection[], upserts: 0 };
  const service = new InternalService(makePrisma(state) as any);
  const controller = new InternalController(service);
  const originalToken = process.env.INTERNAL_SERVICE_TOKEN;
  const originalSecret = process.env.INTERNAL_SERVICE_SECRET;
  process.env.INTERNAL_SERVICE_TOKEN = token;
  delete process.env.INTERNAL_SERVICE_SECRET;

  try {
    await assert.rejects(() => (controller as any).putUserProjection(undefined, userId, payload), UnauthorizedException);
    await assert.rejects(() => (controller as any).putUserProjection(token, userId, { ...payload, roles: [{ app: "siakad", role: "guru", unitId: null, departmentId: null }] }), BadRequestException);
    await assert.rejects(() => (controller as any).putUserProjection(token, unitId, payload), BadRequestException);

    const applied = await (controller as any).putUserProjection(token, userId, payload);
    assert.equal(applied.status, "applied");
    assert.equal(state.users.length, 1);
    assert.equal(state.users[0].sourceUpdatedAt.toISOString(), incomingAt);
    assert.equal(state.upserts, 1);

    const stale = await (controller as any).putUserProjection(token, userId, payload);
    assert.equal(stale.status, "stale");
    assert.equal(state.upserts, 1, "same source version must not write twice");

    const newer = await (controller as any).putUserProjection(token, userId, {
      ...payload,
      name: "Guru Alfida Diperbarui",
      sourceUpdatedAt: "2026-10-20T22:00:01.000Z",
    });
    assert.equal(newer.status, "applied");
    assert.equal(state.users[0].name, "Guru Alfida Diperbarui");
    assert.equal(state.upserts, 2);
  } finally {
    if (originalToken === undefined) delete process.env.INTERNAL_SERVICE_TOKEN;
    else process.env.INTERNAL_SERVICE_TOKEN = originalToken;
    if (originalSecret === undefined) delete process.env.INTERNAL_SERVICE_SECRET;
    else process.env.INTERNAL_SERVICE_SECRET = originalSecret;
  }

  console.log("SIAKAD internal user projection contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
