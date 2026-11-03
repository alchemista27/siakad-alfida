import assert from "node:assert/strict";
import { normalizeFingerprintEvent, selectDailyFingerprintWindow, isOfficeWeekday } from "../src/attendance/fingerprint-attendance.utils";

function main() {
  const event = normalizeFingerprintEvent("solution-x100c", "serial-1", {
    enrollmentId: "0012",
    occurredAt: "2026-10-05T07:15:00+07:00",
    punch: 0,
    status: 0,
  });

  assert.equal(event.occurredAt.toISOString(), "2026-10-05T00:15:00.000Z");
  assert.equal(event.localDate.toISOString(), "2026-10-05T00:00:00.000Z");
  assert.match(event.sourceKey, /^[a-f0-9]{64}$/);
  assert.equal(
    normalizeFingerprintEvent("solution-x100c", "serial-1", {
      enrollmentId: "0012",
      occurredAt: "2026-10-05T07:15:00+07:00",
      punch: 0,
      status: 0,
    }).sourceKey,
    event.sourceKey,
    "identical device events must have the same idempotency key",
  );

  const checkout = normalizeFingerprintEvent("solution-x100c", "serial-1", {
    enrollmentId: "0012",
    occurredAt: "2026-10-05T16:01:00+07:00",
    punch: 1,
    status: 0,
  });
  assert.deepEqual(selectDailyFingerprintWindow([checkout, event]), {
    checkInTime: event.occurredAt,
    checkOutTime: checkout.occurredAt,
  });

  assert.equal(isOfficeWeekday("2026-10-05"), true, "Monday is an office workday");
  assert.equal(isOfficeWeekday("2026-10-10"), false, "Saturday must be excluded");
  assert.equal(isOfficeWeekday("2026-10-11"), false, "Sunday must be excluded");
  assert.throws(
    () => normalizeFingerprintEvent("solution-x100c", null, { enrollmentId: " ", occurredAt: "invalid", punch: 0, status: 0 }),
    /enroll|waktu/i,
  );

  console.log("SIMPEG fingerprint attendance utilities contract passed");
}

main();
