import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getTodayAttendance, nextAttendanceAction, overtimeStatus, submitAttendance } from "../src/lib/attendance-api";

async function main() {
  const base = { date: "2026-10-23", unitName: "Unit", workday: { required: true, reason: "Hari kerja" } };
  assert.equal(nextAttendanceAction({ ...base, attendance: null }), "check-in");
  assert.equal(nextAttendanceAction({ ...base, attendance: { checkInTime: "2026-10-23T01:00:00Z", checkOutTime: null, status: "present" } }), "check-out");
  assert.equal(nextAttendanceAction({ ...base, attendance: { date: "2026-10-23T00:00:00.000Z", checkInTime: "2026-10-23T01:00:00Z", checkOutTime: null } }), "check-out", "Prisma dates arrive as ISO timestamps");
  assert.equal(nextAttendanceAction({ ...base, attendance: { checkInTime: "2026-10-23T01:00:00Z", checkOutTime: "2026-10-23T08:00:00Z", status: "present" } }), null);
  assert.equal(nextAttendanceAction({ ...base, workday: { required: false, reason: "Libur" }, attendance: null }), null);
  assert.equal(nextAttendanceAction({ ...base, attendance: { date: "2026-10-22", checkInTime: "2026-10-22T01:00:00Z", checkOutTime: null } }), "check-in", "Never offer a backdated checkout");
  assert.equal(nextAttendanceAction({ ...base, attendance: { date: "2026-10-22T00:00:00.000Z", checkInTime: "2026-10-22T01:00:00Z", checkOutTime: "2026-10-22T08:00:00Z" } }), "check-in", "A completed prior day must not suppress today's check-in");

  const checkedIn = { ...base, attendance: { checkInTime: "2026-10-23T01:00:00Z", checkOutTime: null, status: "present", overtimeMinutes: 0 } };
  assert.match(overtimeStatus(checkedIn), /Lembur belum dihitung.*clock out hari ini/i);
  assert.match(overtimeStatus({ ...checkedIn, attendance: { ...checkedIn.attendance, checkOutTime: "2026-10-23T11:00:00Z", overtimeMinutes: 60 } }), /60 menit/);
  assert.match(overtimeStatus({ ...base, attendance: null, previousAttendance: { date: "2026-10-22", checkInTime: "2026-10-22T01:00:00Z", checkOutTime: null, overtimeMinutes: 0 } }), /Lupa clock out.*0 menit/i);

  const oldFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: false, status: 401, json: async () => ({ message: "Sesi habis" }) }) as Response;
    await assert.rejects(getTodayAttendance("https://api.test", "token"), (error: unknown) => error instanceof Error && "status" in error && error.status === 401);
    globalThis.fetch = async () => ({ ok: false, status: 503, json: async () => ({ message: "Server sibuk" }) }) as Response;
    await assert.rejects(getTodayAttendance("https://api.test", "token"), (error: unknown) => error instanceof Error && "status" in error && error.status === 503);
    globalThis.fetch = async (url) => ({ ok: true, status: 200, json: async () => String(url).includes("my-history")
      ? [{ date: "2026-10-22T00:00:00.000Z", checkInTime: "2026-10-22T01:00:00Z", checkOutTime: null, overtimeMinutes: 0 }]
      : { ...base, attendance: null } }) as Response;
    assert.match(overtimeStatus(await getTodayAttendance("https://api.test", "token")), /Lupa clock out.*0 menit/i);
    let submitted: Record<string, unknown> | undefined;
    globalThis.fetch = async (_url, init) => { submitted = JSON.parse(String(init?.body)); return { ok: true, status: 200, json: async () => ({}) } as Response; };
    await submitAttendance("https://api.test", "token", "check-in", { latitude: -6, longitude: 106, accuracyMeters: 10, capturedAt: "2026-10-23T01:00:00.000Z", mocked: false });
    assert.deepEqual(submitted, { latitude: -6, longitude: 106, accuracyMeters: 10, capturedAt: "2026-10-23T01:00:00.000Z", mocked: false });
  } finally { globalThis.fetch = oldFetch; }

  const [app, mobileAuth, attendanceApi] = await Promise.all([
    readFile(resolve(process.cwd(), "App.tsx"), "utf8"),
    readFile(resolve(process.cwd(), "src/lib/mobile-auth.ts"), "utf8"),
    readFile(resolve(process.cwd(), "src/lib/attendance-api.ts"), "utf8"),
  ]);
  assert.match(app, /startMobileLogin/, "The app must use the Auth PKCE handoff instead of a local credential form");
  assert.match(mobileAuth, /expo-secure-store/, "Access tokens must be stored in native secure storage");
  assert.match(mobileAuth, /code_verifier/, "The mobile handoff must exchange a PKCE verifier");
  assert.match(attendanceApi, /\/attendance\/context/, "Mobile must reuse SIMPEG attendance context");
  assert.match(app, /validateLocationFix\(position/, "Every submission must validate the fresh GPS fix");
  assert.match(app, /getCurrentPositionAsync\(\{ accuracy: Location\.Accuracy\.High \}\)/);
  assert.match(app, /submitAttendance\(SIMPEG_API_URL, token, action, location\)/);
  assert.match(app, /overtimeStatus\(context\)/);
  assert.match(app, /workSchedule/);
  assert.match(app, /radiusMeters/);
  assert.match(app, /AppState\.addEventListener\("change"/, "Resume must refresh context after a day change");
  assert.match(app, /const current = await getTodayAttendance\(SIMPEG_API_URL, token\)/, "Never submit using a stale context");
  assert.match(app, /mockStatus === "tidak dapat diverifikasi"/, "An absent mock flag must be labeled unverifiable in the UI");
  assert.doesNotMatch(app, /\bAlert\.alert\(|\bconsole\.(?:log|error)\(/);
  assert.doesNotMatch(app, /TextInput|password|fetch\([^)]*\/login/i, "The client must not implement a password-grant login flow");
  console.log("SIMPEG mobile attendance foundation contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
