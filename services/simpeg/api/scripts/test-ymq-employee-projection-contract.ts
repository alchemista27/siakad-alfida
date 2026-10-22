import assert from "node:assert/strict";
import {
  BadRequestException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { YmqEmployeeProjectionPayloadSchema } from "@alfida/contracts";
import {
  InternalServiceAuthGuard,
  parseUnitId,
  parseUpdatedAfter,
} from "../src/ymq-projection/internal-service-auth.guard";
import { YmqEmployeeProjectionService } from "../src/ymq-projection/ymq-employee-projection.service";

const userId = "11111111-1111-4111-8111-111111111111";
const unitId = "22222222-2222-4222-8222-222222222222";
const updatedAfter = "2026-10-01T00:00:00.000Z";

function httpContext(headers: Record<string, unknown>) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers }) }),
  } as any;
}

async function main() {
  const payload = {
    userId,
    fullName: "Pegawai YMQ",
    email: "pegawai@example.test",
    unitId,
    unitName: "Unit Tahfizh",
    isActive: true,
    sourceUpdatedAt: "2026-10-02T03:04:05.000Z",
  };
  assert.deepEqual(YmqEmployeeProjectionPayloadSchema.parse(payload), payload);
  assert.throws(() => YmqEmployeeProjectionPayloadSchema.parse({
    ...payload,
    passwordHash: "must-never-leak",
  }));
  assert.throws(() => YmqEmployeeProjectionPayloadSchema.parse({
    ...payload,
    roles: ["super_admin"],
  }));

  assert.equal(parseUpdatedAfter(updatedAfter)?.toISOString(), updatedAfter);
  assert.equal(parseUpdatedAfter(undefined), undefined);
  assert.throws(() => parseUpdatedAfter("not-a-date"), BadRequestException);
  assert.throws(() => parseUpdatedAfter([updatedAfter]), BadRequestException);
  assert.equal(parseUnitId(unitId), unitId);
  assert.equal(parseUnitId(undefined), undefined);
  assert.throws(() => parseUnitId(""), BadRequestException);
  assert.throws(() => parseUnitId([unitId]), BadRequestException);

  let receivedQuery: unknown;
  const service = new YmqEmployeeProjectionService({
    user: {
      findMany: async (query: unknown) => {
        receivedQuery = query;
        return [{
          id: userId,
          fullName: "Pegawai YMQ",
          email: "pegawai@example.test",
          isActive: true,
          createdAt: new Date("2026-09-01T00:00:00.000Z"),
          updatedAt: new Date("2026-10-02T03:04:05.000Z"),
          unitAssignments: [{
            unitId,
            unitName: "Unit Tahfizh",
            role: "musyrif",
            skNumber: "SECRET-SK-001",
          }],
        }];
      },
    },
  } as any);

  const result = await service.list({ unitId, updatedAfter });
  assert.deepEqual(result, { employees: [payload] });
  assert.deepEqual(Object.keys(result.employees[0]).sort(), [
    "email",
    "fullName",
    "isActive",
    "sourceUpdatedAt",
    "unitId",
    "unitName",
    "userId",
  ]);
  assert.deepEqual(receivedQuery, {
    where: {
      updatedAt: { gt: new Date(updatedAfter) },
      unitAssignments: { some: { isPrimary: true, unitId } },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      unitAssignments: {
        where: { isPrimary: true, unitId },
        select: { unitId: true, unitName: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { id: "asc" },
  });

  const originalSecret = process.env.INTERNAL_SERVICE_SECRET;
  delete process.env.INTERNAL_SERVICE_SECRET;
  const guard = new InternalServiceAuthGuard();
  assert.throws(() => guard.canActivate(httpContext({ "x-internal-service-key": "anything" })), ServiceUnavailableException);

  process.env.INTERNAL_SERVICE_SECRET = "shared-internal-secret";
  assert.throws(() => guard.canActivate(httpContext({ "x-internal-service-key": "wrong" })), UnauthorizedException);
  assert.throws(() => guard.canActivate(httpContext({})), UnauthorizedException);
  assert.equal(guard.canActivate(httpContext({ "x-internal-service-key": "shared-internal-secret" })), true);

  if (originalSecret === undefined) delete process.env.INTERNAL_SERVICE_SECRET;
  else process.env.INTERNAL_SERVICE_SECRET = originalSecret;

  console.log("SIMPEG YMQ employee projection contract passed");
}

void main();
