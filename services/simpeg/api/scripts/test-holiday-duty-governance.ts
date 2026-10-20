import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { validate } from "class-validator";
import { UpsertHolidayDto, UpsertSaturdayDutyAssignmentDto } from "../src/attendance/attendance.dto";
import { AttendanceService } from "../src/attendance/attendance.service";

const unitId = "00000000-0000-4000-8000-000000000010";
const otherUnitId = "00000000-0000-4000-8000-000000000011";
const userId = "00000000-0000-4000-8000-000000000020";
const otherUserId = "00000000-0000-4000-8000-000000000021";

const unitAdmin = { roles: [{ app: "simpeg", role: "admin_unit", unitId }] };
const hrAdmin = { roles: [{ app: "simpeg", role: "admin_kepegawaian" }] };

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

async function main() {
  const validHoliday = Object.assign(new UpsertHolidayDto(), { unitId, date: "2026-01-06", name: "Libur Unit" });
  assert.equal((await validate(validHoliday)).length, 0, "valid holiday input must pass DTO validation");
  for (const invalid of [
    { date: "06-01-2026", name: "Libur" },
    { date: "2026-01-06", name: "" },
    { unitId: "not-a-uuid", date: "2026-01-06", name: "Libur" },
  ]) {
    assert.ok((await validate(Object.assign(new UpsertHolidayDto(), invalid))).length > 0, "holiday DTO must reject malformed input");
  }

  const validDuty = Object.assign(new UpsertSaturdayDutyAssignmentDto(), { unitId, userId, date: "2026-01-10", notes: "Piket gerbang" });
  assert.equal((await validate(validDuty)).length, 0, "valid Saturday duty input must pass DTO validation");
  assert.ok((await validate(Object.assign(new UpsertSaturdayDutyAssignmentDto(), { unitId, userId, date: "2026-01-09" }))).length > 0, "duty DTO must reject non-Saturday dates");

  const audit: string[] = [];
  const holidays = [
    { id: "global", unitId: null, date: date("2026-01-06"), name: "Hari Libur Nasional", description: null },
    { id: "own", unitId, date: date("2026-01-07"), name: "Libur Unit", description: null },
    { id: "other", unitId: otherUnitId, date: date("2026-01-08"), name: "Libur Unit Lain", description: null },
  ];
  const duties = [{ id: "duty", unitId, userId, date: date("2026-01-10"), notes: "Piket" }];
  const prisma: any = {
    unit: {
      async findUnique({ where }: any) {
        audit.push(`unit:${where.id}`);
        return where.id === unitId || where.id === otherUnitId ? { id: where.id, isActive: true } : null;
      },
    },
    employeeUnitAssignment: {
      async findFirst({ where }: any) {
        audit.push(`assignment:${where.userId}:${where.unitId}`);
        return where.userId === userId && where.unitId === unitId ? { id: "assignment", unitId, userId, unitName: "Unit A", isPrimary: true } : null;
      },
    },
    holiday: {
      async findMany() { return holidays; },
      async findUnique({ where }: any) { audit.push(`holiday:${where.id}`); return holidays.find((item) => item.id === where.id) ?? null; },
      async create({ data }: any) { audit.push("holiday:create"); return { id: "created", ...data }; },
      async update({ where, data }: any) { audit.push(`holiday:update:${where.id}`); return { ...holidays.find((item) => item.id === where.id), ...data }; },
      async delete({ where }: any) { audit.push(`holiday:delete:${where.id}`); return { id: where.id }; },
    },
    saturdayDutyAssignment: {
      async findMany() { return duties; },
      async findUnique({ where }: any) { audit.push(`duty:${where.id}`); return duties.find((item) => item.id === where.id) ?? null; },
      async create({ data }: any) { audit.push("duty:create"); return { id: "created-duty", ...data }; },
      async update({ where, data }: any) { audit.push(`duty:update:${where.id}`); return { ...duties.find((item) => item.id === where.id), ...data }; },
      async delete({ where }: any) { audit.push(`duty:delete:${where.id}`); return { id: where.id }; },
    },
  };
  const service = new AttendanceService(prisma);

  const visibleToUnitAdmin = await service.getHolidays(undefined, unitAdmin);
  assert.deepEqual(visibleToUnitAdmin.map((item: any) => item.id), ["global", "own"], "unit admins may read global holidays and only their own unit holidays");
  await assert.rejects(
    () => service.getHolidays(otherUnitId, unitAdmin),
    (error: unknown) => error instanceof ForbiddenException,
    "unit admins must not request another unit's holidays",
  );
  await assert.rejects(
    () => service.upsertHoliday({ date: "2026-01-09", name: "Global" }, unitAdmin),
    (error: unknown) => error instanceof ForbiddenException,
    "only HR or super admin may create a global national holiday",
  );
  await service.upsertHoliday({ unitId, date: "2026-01-09", name: "Libur Unit" }, unitAdmin);
  assert.equal(audit.at(-1), "holiday:create", "unit admin may create a holiday for their own unit");

  audit.length = 0;
  await assert.rejects(
    () => service.upsertHoliday({ id: "other", unitId: otherUnitId, date: "2026-01-08", name: "Mutasi" }, unitAdmin),
    (error: unknown) => error instanceof ForbiddenException,
    "resource scope must be authorized before cross-unit holiday update",
  );
  assert.deepEqual(audit, ["holiday:other"], "holiday update must resolve the resource before authorizing and must not write on denial");

  audit.length = 0;
  await assert.rejects(
    () => service.deleteHoliday("other", unitAdmin),
    (error: unknown) => error instanceof ForbiddenException,
    "resource scope must be authorized before cross-unit holiday delete",
  );
  assert.deepEqual(audit, ["holiday:other"], "holiday delete must resolve the resource before authorizing and must not delete on denial");
  await service.upsertHoliday({ date: "2026-01-09", name: "Hari Libur Nasional" }, hrAdmin);

  await service.upsertSaturdayDutyAssignment(validDuty, unitAdmin);
  assert.equal(audit.at(-1), "duty:create", "unit admin may create dated duty for an actively assigned employee in their own unit");
  await assert.rejects(
    () => service.upsertSaturdayDutyAssignment({ unitId, userId: otherUserId, date: "2026-01-10" }, unitAdmin),
    (error: unknown) => error instanceof BadRequestException,
    "Saturday duty staff must have an active assignment in that unit on the duty date",
  );

  audit.length = 0;
  await assert.rejects(
    () => service.deleteSaturdayDutyAssignment("duty", { roles: [{ app: "simpeg", role: "admin_unit", unitId: otherUnitId }] }),
    (error: unknown) => error instanceof ForbiddenException,
    "duty delete must be constrained to the resource unit",
  );
  assert.deepEqual(audit, ["duty:duty"], "duty delete must resolve before authorization and never delete on denial");

  const recapPrisma: any = {
    user: { async findMany() { return [{ id: userId, fullName: "Pegawai A", unitAssignments: [{ unitId, unitName: "Unit A", role: "Staff", isPrimary: true, startDate: date("2020-01-01"), endDate: null }] }]; } },
    gpsAttendance: {
      async findMany() { return [{ id: "present", userId, unitId, date: date("2026-01-05"), status: "present" }]; },
      async create() { throw new Error("recap must not create automatic absent records"); },
    },
    leaveRequest: { async findMany() { return [{ userId, status: "approved", startDate: date("2026-01-07"), endDate: date("2026-01-07") }]; } },
    holiday: { async findMany() { return [{ id: "national", unitId: null, date: date("2026-01-06"), name: "Libur Nasional" }]; } },
    saturdayDutyAssignment: { async findMany() { return [{ id: "duty", unitId, userId, date: date("2026-01-10"), notes: null }]; } },
  };
  const recap = await new AttendanceService(recapPrisma).getAttendanceRecap("2026-01-04", "2026-01-10");
  assert.deepEqual(
    recap[0],
    {
      userId,
      fullName: "Pegawai A",
      unitName: "Unit A",
      role: "Staff",
      present: 1,
      late: 0,
      leave: 1,
      totalLogs: 1,
      expectedWorkdays: 4,
      exemptWorkdays: 3,
      unrecordedRequiredDays: 3,
    },
    "recap must calculate workday obligations without creating absent rows",
  );

  console.log("holiday, duty, and recap governance contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
