import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const schema = readFileSync(resolve(import.meta.dirname, "../prisma/schema.prisma"), "utf8");

assert.match(schema, /enum AttendanceSource\s*\{[\s\S]*?gps[\s\S]*?fingerprint[\s\S]*?backfill[\s\S]*?\}/, "attendance source enum must preserve GPS and distinguish fingerprint/backfill");
assert.match(schema, /fingerprintEnrollmentId\s+String\?\s+@unique\s+@map\("fingerprint_enrollment_id"\)/, "employee profile needs unique external enrollment ID");
assert.match(schema, /model FingerprintAttendanceEvent\s*\{[\s\S]*?sourceKey\s+String\s+@unique[\s\S]*?@@index\(\[deviceId, occurredAt\]\)[\s\S]*?@@index\(\[userId, localDate\]\)/, "fingerprint events need idempotency and query indexes");
assert.match(schema, /model FingerprintSyncRun\s*\{[\s\S]*?fetchedCount\s+Int[\s\S]*?insertedCount\s+Int[\s\S]*?unmatchedCount\s+Int[\s\S]*?skippedConflict\s+Int/, "sync runs must retain operational counters");
assert.match(schema, /model GpsAttendance\s*\{[\s\S]*?source\s+AttendanceSource\s+@default\(gps\)/, "daily attendance must retain source precedence");

console.log("SIMPEG fingerprint schema contract passed");
