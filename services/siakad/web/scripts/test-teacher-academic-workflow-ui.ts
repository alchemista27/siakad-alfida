import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const webRoot = join(import.meta.dirname, "..");
const pages = [
  join(webRoot, "src/app/(dashboard)/teacher/attendance/page.tsx"),
  join(webRoot, "src/app/(dashboard)/teacher/grades/page.tsx"),
];

for (const page of pages) {
  assert.ok(existsSync(page), `teacher workflow page missing: ${page}`);
  const source = readFileSync(page, "utf8");
  assert.match(source, /siakadApiFetch/);
  assert.match(source, /loading|Memuat/);
  assert.match(source, /error|Gagal/);
  assert.match(source, /empty|Belum ada|Tidak ada/);
  assert.doesNotMatch(source, /\balert\s*\(/);
}

const attendance = readFileSync(pages[0], "utf8");
assert.match(attendance, /\/attendance\/schedules\//);
assert.match(attendance, /\/batch/);

const grades = readFileSync(pages[1], "utf8");
assert.match(grades, /\/teaching\/assignments\//);
assert.match(grades, /\/grades/);
assert.match(grades, /\/journals/);

console.log("Teacher academic workflow UI contract passed");
