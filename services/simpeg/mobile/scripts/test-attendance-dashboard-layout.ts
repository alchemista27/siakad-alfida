import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const app = await readFile(resolve(process.cwd(), "App.tsx"), "utf8");

  assert.match(app, /styles\.attendanceHero/);
  assert.match(app, /styles\.statusRing/);
  assert.match(app, /styles\.attendanceMetrics/);
  assert.match(app, /styles\.metricCard/);
  assert.match(app, /Riwayat hari ini/);
  assert.match(app, /Jadwal kerja/);
  assert.doesNotMatch(app, /face recognition|face-recognition|biometric|kamera verifikasi/i);

  console.log("attendance dashboard layout contract passed");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
