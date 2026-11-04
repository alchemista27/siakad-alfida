import "reflect-metadata";
import assert from "node:assert/strict";
import { FingerprintAttendanceService } from "../src/attendance/fingerprint-attendance.service";

const REQUIRED_KEYS = [
  "SIMPEG_FINGERPRINT_ENABLED",
  "SIMPEG_FINGERPRINT_DEVICE_ID",
  "SIMPEG_FINGERPRINT_HOST",
  "SIMPEG_FINGERPRINT_PORT",
  "SIMPEG_FINGERPRINT_COMM_KEY",
  "SIMPEG_FINGERPRINT_TIMEZONE",
  "SIMPEG_FINGERPRINT_SYNC_INTERVAL_MS",
] as const;

async function main() {
  const original = Object.fromEntries(REQUIRED_KEYS.map((key) => [key, process.env[key]]));
  try {
    for (const key of REQUIRED_KEYS) delete process.env[key];
    const noRunService = new FingerprintAttendanceService(
      { fingerprintSyncRun: { findFirst: async () => null } } as any,
      { getReadiness: () => ({ enabled: false, missingConfigurationKeys: [...REQUIRED_KEYS] }) } as any,
      {} as any,
    );

    const noRun = await noRunService.getStatus();
    assert.deepEqual(noRun, {
      lastRun: null,
      readiness: { enabled: false, missingConfigurationKeys: [...REQUIRED_KEYS] },
    }, "status must always use a JSON-safe envelope when no sync has run");

    const failedRun = {
      status: "failed",
      startedAt: new Date("2026-11-04T00:00:00.000Z"),
      completedAt: new Date("2026-11-04T00:00:01.000Z"),
      fetchedCount: 0,
      insertedCount: 0,
      matchedCount: 0,
      unmatchedCount: 0,
      attendanceChanged: 0,
      skippedConflict: 0,
      errorMessage: "SIMPEG_FINGERPRINT_ENABLED harus bernilai true untuk menjalankan sinkronisasi.",
    };
    const failedRunService = new FingerprintAttendanceService(
      { fingerprintSyncRun: { findFirst: async () => failedRun } } as any,
      { getReadiness: () => ({ enabled: false, missingConfigurationKeys: ["SIMPEG_FINGERPRINT_HOST"] }) } as any,
      {} as any,
    );

    const status = await failedRunService.getStatus();
    assert.equal(status.lastRun, failedRun, "status must preserve the latest run in its envelope");
    assert.deepEqual(status.readiness, { enabled: false, missingConfigurationKeys: ["SIMPEG_FINGERPRINT_HOST"] });
    assert.equal(JSON.stringify(status).includes("[REDACTED]"), false, "readiness must not contain secret values");

    console.log("SIMPEG fingerprint status readiness contract passed");
  } finally {
    for (const key of REQUIRED_KEYS) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
