import assert from "node:assert/strict";
import {
  mapYmqEmployeeProjection,
  shouldApplyEmployeeProjection,
} from "../src/employees/ymq-employee-projection.policy";

const source = {
  userId: "11111111-1111-4111-8111-111111111111",
  fullName: "Pegawai Contoh",
  email: "pegawai@example.test",
  unitId: "22222222-2222-4222-8222-222222222222",
  unitName: "SD Islam Terpadu Iqra 1",
  isActive: true,
  sourceUpdatedAt: "2026-10-22T00:00:00.000Z",
};

assert.deepEqual(mapYmqEmployeeProjection(source), source);
assert.throws(() => mapYmqEmployeeProjection({ ...source, passwordHash: "not-allowed" }));
assert.equal(shouldApplyEmployeeProjection(null, source.sourceUpdatedAt), true);
assert.equal(shouldApplyEmployeeProjection(new Date("2026-10-22T00:00:00.000Z"), source.sourceUpdatedAt), false);
assert.equal(shouldApplyEmployeeProjection(new Date("2026-10-23T00:00:00.000Z"), source.sourceUpdatedAt), false);
assert.equal(shouldApplyEmployeeProjection(new Date("2026-10-21T00:00:00.000Z"), source.sourceUpdatedAt), true);

console.log("SIYAUM YMQ employee projection contract passed");
