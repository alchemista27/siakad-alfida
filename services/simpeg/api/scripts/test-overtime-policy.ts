import assert from 'node:assert/strict';
import { BadRequestException } from '@nestjs/common';
import { overtimeMinutesFor } from '../src/attendance/jakarta-worktime';
import { AttendanceService } from '../src/attendance/attendance.service';

const date = '2026-10-26';
const checkIn = new Date('2026-10-26T01:11:00Z');
const at = (hhmm: string) => new Date(`${date}T${hhmm}:00+07:00`);
assert.equal(overtimeMinutesFor({date, checkIn, checkOut: null, overtimeStartTime: '17:00'}), 0);
assert.equal(overtimeMinutesFor({date, checkIn, checkOut: at('16:59'), overtimeStartTime: '17:00'}), 0);
assert.equal(overtimeMinutesFor({date, checkIn, checkOut: at('17:00'), overtimeStartTime: '17:00'}), 0);
assert.equal(overtimeMinutesFor({date, checkIn, checkOut: at('18:00'), overtimeStartTime: '17:00'}), 60);
assert.equal(overtimeMinutesFor({date, checkIn, checkOut: new Date('2026-10-26T17:00:00Z'), overtimeStartTime: '17:00'}), 0);
assert.equal(overtimeMinutesFor({date, checkIn: at('17:30'), checkOut: at('18:00'), overtimeStartTime: '17:00'}), 30);

async function main() {
  let saved: any = null;
  let updates = 0;
  const snapshot = {startTime: '08:00', lateGraceMinutes: 10, endTime: '16:00', overtimeStartTime: '17:00', timezone: 'Asia/Jakarta', source: 'unit'};
  const prisma: any = {
    employeeUnitAssignment: {findFirst: async () => ({unitId: 'unit', unitName: 'Unit', isPrimary: true})},
    gpsAttendanceConfig: {findUnique: async () => ({latitude: 0, longitude: 0, radiusMeters: 50})},
    holiday: {findFirst: async () => null}, saturdayDutyAssignment: {findUnique: async () => null},
    leaveRequest: {findFirst: async () => null},
    unitWorkSchedule: {findUnique: async () => ({...snapshot, isWorkday: true})},
    gpsAttendance: {
      findUnique: async () => saved,
      create: async ({data}: any) => {saved = {id: 'row', ...data, checkOutTime: null}; return saved;},
      updateMany: async ({where, data}: any) => {
        if (saved.checkOutTime || where.checkOutTime !== null) return {count: 0};
        Object.assign(saved, data); updates++; return {count: 1};
      },
      findFirst: async () => saved,
    },
  };
  const service = new AttendanceService(prisma);
  const coords = {latitude: 0, longitude: 0};
  const result = await service.checkIn('user', coords, checkIn);
  assert.equal(result.status, 'late');
  assert.deepEqual(result.workScheduleSnapshot, snapshot);
  assert.equal(result.overtimeMinutes, 0);
  prisma.unitWorkSchedule.findUnique = async () => ({...snapshot, startTime: '09:00', overtimeStartTime: '19:00', isWorkday: true});
  await assert.rejects(() => service.checkOut('user', coords, new Date('2026-10-26T17:00:00Z')), BadRequestException);
  assert.equal(saved.checkOutTime, null);
  await service.checkOut('user', coords, at('18:00'));
  assert.equal(saved.overtimeMinutes, 60, 'check-out uses check-in snapshot');
  await assert.rejects(() => service.checkOut('user', coords, at('18:01')), BadRequestException);
  assert.equal(updates, 1);
  console.log('overtime policy passed');
}
void main().catch(error => {console.error(error); process.exitCode = 1;});
