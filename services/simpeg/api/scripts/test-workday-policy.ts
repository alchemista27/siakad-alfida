import assert from "node:assert/strict";
import { resolveWorkdayPolicy, toUtcDateKey } from "../src/attendance/workday-policy";

function policy(date: string, overrides: Partial<Parameters<typeof resolveWorkdayPolicy>[0]> = {}) {
  return resolveWorkdayPolicy({ date, ...overrides });
}

function main() {
  assert.equal(toUtcDateKey(new Date("2026-01-01T23:30:00-08:00")), "2026-01-02", "date keys must use UTC rather than local timezone");

  assert.deepEqual(policy("2026-01-04"), { required: false, reason: "sunday" }, "Sunday must always be exempt");
  assert.deepEqual(policy("2026-01-05"), { required: true, reason: "weekday" }, "Monday through Friday must be required when not otherwise exempt");
  assert.deepEqual(policy("2026-01-10"), { required: false, reason: "saturday_without_duty" }, "Saturday without a dated duty assignment must be exempt");
  assert.deepEqual(policy("2026-01-10", { hasSaturdayDuty: true }), { required: true, reason: "saturday_duty" }, "Saturday duty must make that exact date required");
  assert.deepEqual(policy("2026-01-10", { hasSaturdayDuty: true, hasHoliday: true }), { required: false, reason: "holiday" }, "a holiday must override Saturday duty");
  assert.deepEqual(policy("2026-01-05", { hasApprovedLeave: true }), { required: false, reason: "approved_leave" }, "approved leave must exempt a weekday");

  console.log("UTC workday policy contract passed");
}

main();
