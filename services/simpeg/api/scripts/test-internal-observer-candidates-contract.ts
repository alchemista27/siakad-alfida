import assert from "node:assert/strict";
import { EmployeesService } from "../src/employees/employees.service";

async function main() {
  const calls: unknown[] = [];
  const service = new EmployeesService({
    user: {
      findMany: async (args: unknown) => {
        calls.push(args);
        return [{ id: "teacher-1", fullName: "Guru Unit", email: "guru@example.test", avatarUrl: null }];
      },
    },
  } as any);

  const candidates = await service.observerCandidates("unit-a", "guru");

  assert.deepEqual(candidates, [{ id: "teacher-1", fullName: "Guru Unit", email: "guru@example.test", avatarUrl: null }]);
  const query = calls[0] as any;
  assert.equal(query.where.unitAssignments.some.unitId, "unit-a", "only staff assigned to the selected unit may be candidates");
  assert.equal(query.where.unitAssignments.some.startDate.lte instanceof Date, true, "candidate assignment must already be effective");
  assert.equal(query.where.unitAssignments.some.OR[0].endDate, null, "current assignments may not have an end date");
  assert.equal(query.take, 10, "candidate results must be bounded");

  console.log("SIMPEG observer candidate contract passed");
}

void main();
