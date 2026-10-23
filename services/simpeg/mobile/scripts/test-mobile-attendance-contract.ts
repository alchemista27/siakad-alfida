import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { nextAttendanceAction } from "../src/lib/attendance-api";

async function main() {
  const base = { date: "2026-10-23", unitName: "Unit", workday: { required: true, reason: "Hari kerja" } };
  assert.equal(nextAttendanceAction({ ...base, attendance: null }), "check-in");
  assert.equal(nextAttendanceAction({ ...base, attendance: { checkInTime: "2026-10-23T01:00:00Z", checkOutTime: null, status: "present" } }), "check-out");
  assert.equal(nextAttendanceAction({ ...base, attendance: { checkInTime: "2026-10-23T01:00:00Z", checkOutTime: "2026-10-23T08:00:00Z", status: "present" } }), null);
  assert.equal(nextAttendanceAction({ ...base, workday: { required: false, reason: "Libur" }, attendance: null }), null);

  const [app, mobileAuth, attendanceApi] = await Promise.all([
    readFile(resolve(process.cwd(), "App.tsx"), "utf8"),
    readFile(resolve(process.cwd(), "src/lib/mobile-auth.ts"), "utf8"),
    readFile(resolve(process.cwd(), "src/lib/attendance-api.ts"), "utf8"),
  ]);
  assert.match(app, /startMobileLogin/, "The app must use the Auth PKCE handoff instead of a local credential form");
  assert.match(mobileAuth, /expo-secure-store/, "Access tokens must be stored in native secure storage");
  assert.match(mobileAuth, /code_verifier/, "The mobile handoff must exchange a PKCE verifier");
  assert.match(attendanceApi, /\/attendance\/context/, "Mobile must reuse SIMPEG attendance context");
  assert.doesNotMatch(app, /TextInput|password|fetch\([^)]*\/login/i, "The client must not implement a password-grant login flow");
  console.log("SIMPEG mobile attendance foundation contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
