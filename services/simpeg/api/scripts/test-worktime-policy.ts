import assert from 'node:assert/strict';
import { resolveWorkdayPolicy } from '../src/attendance/workday-policy';
import { jakartaDateKey, jakartaMinutes, hhmmMinutes } from '../src/attendance/jakarta-worktime';

assert.equal(jakartaDateKey(new Date('2026-10-23T18:00:00Z')), '2026-10-24');
assert.equal(jakartaMinutes(new Date('2026-10-23T18:00:00Z')), 60);
assert.equal(hhmmMinutes('08:10'), 490);
assert.throws(() => hhmmMinutes('24:00'));
const saturday = '2026-10-24';
assert.deepEqual(resolveWorkdayPolicy({date: saturday, hasSaturdayDuty: true, hasHoliday: true}), {required: false, reason: 'holiday'});
assert.deepEqual(resolveWorkdayPolicy({date: saturday, hasSaturdayDuty: true, hasApprovedLeave: true}), {required: false, reason: 'approved_leave'});
assert.deepEqual(resolveWorkdayPolicy({date: saturday, hasSaturdayDuty: true, configuredIsWorkday: false}), {required: true, reason: 'saturday_duty'});
assert.deepEqual(resolveWorkdayPolicy({date: saturday, configuredIsWorkday: false}), {required: false, reason: 'configured_nonworkday'});
assert.deepEqual(resolveWorkdayPolicy({date: '2026-10-25', configuredIsWorkday: true}), {required: true, reason: 'configured_workday'});
assert.deepEqual(resolveWorkdayPolicy({date: '2026-10-26', configuredIsWorkday: false}), {required: false, reason: 'configured_nonworkday'});
console.log('worktime policy passed');
