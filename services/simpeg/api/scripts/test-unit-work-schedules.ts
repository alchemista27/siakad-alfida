import assert from 'node:assert/strict';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { validate } from 'class-validator';
import { UpsertUnitWorkScheduleDto } from '../src/attendance/attendance.dto';
import { AttendanceService } from '../src/attendance/attendance.service';

const unitId = '00000000-0000-4000-8000-000000000010';
const other = '00000000-0000-4000-8000-000000000011';
const principal = { roles: [{ app: 'simpeg', role: 'admin_unit', unitId }] };
const active = { isWorkday: true, startTime: '08:00', lateGraceMinutes: 10, endTime: '16:00', overtimeStartTime: '17:00' };
async function main() {
  const rows: any[] = [];
  const prisma: any = {
    unit: { findUnique: async ({ where }: any) => ({ id: where.id, isActive: true }) },
    unitWorkSchedule: {
      findMany: async ({ where }: any) => rows.filter(row => row.unitId === where.unitId),
      upsert: async ({ where, update, create }: any) => {
        const old = rows.find(row => row.unitId === where.unitId_weekday.unitId && row.weekday === where.unitId_weekday.weekday);
        if (old) return Object.assign(old, update);
        rows.push(create); return create;
      },
    },
  };
  const service = new AttendanceService(prisma);
  assert.equal((await validate(Object.assign(new UpsertUnitWorkScheduleDto(), active))).length, 0);
  for (const invalid of [
    { ...active, startTime: '8:00' }, { ...active, endTime: '07:00' },
    { ...active, overtimeStartTime: '15:00' }, { ...active, lateGraceMinutes: -1 },
    { ...active, lateGraceMinutes: 181 }, { ...active, isWorkday: false },
    { isWorkday: false, startTime: '08:00' },
  ]) assert.ok((await validate(Object.assign(new UpsertUnitWorkScheduleDto(), invalid))).length, `reject ${JSON.stringify(invalid)}`);
  await service.upsertWorkSchedule(unitId, 1, Object.assign(new UpsertUnitWorkScheduleDto(), active), principal);
  await service.upsertWorkSchedule(unitId, 2, Object.assign(new UpsertUnitWorkScheduleDto(), { isWorkday: false }), principal);
  assert.deepEqual((await service.getWorkSchedules(unitId, principal)).map((row: any) => row.weekday), [1, 2]);
  assert.equal(rows[0].startTime, '08:00');
  await assert.rejects(() => service.upsertWorkSchedule(other, 1, Object.assign(new UpsertUnitWorkScheduleDto(), active), principal), ForbiddenException);
  await assert.rejects(() => service.getWorkSchedules(other, principal), ForbiddenException);
  await assert.rejects(() => service.upsertWorkSchedule(unitId, 7, Object.assign(new UpsertUnitWorkScheduleDto(), active), principal), BadRequestException);
  assert.equal(rows.length, 2);
  console.log('unit work schedules passed');
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
