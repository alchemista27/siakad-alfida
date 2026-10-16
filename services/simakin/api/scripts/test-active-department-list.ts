import assert from "node:assert/strict";
import "reflect-metadata";
import { StrategicDepartmentService } from "../src/strategic/strategic-department/strategic-department.service";

const calls: any[] = [];
const prisma = {
  department: {
    async findMany(input: any) { calls.push(input); return []; },
  },
};

async function main() {
  const service = new StrategicDepartmentService(prisma as any, {} as any, {} as any);
  await service.findAll();
  assert.deepEqual(calls[0].where, { isActive: true }, "active department lists must exclude tombstones");
  console.log("SIMAKIN active department list contract passed");
}
void main().catch((error) => { console.error(error); process.exitCode = 1; });
