import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const pages = [
  ["src/app/(dashboard)/admin/extracurriculars/page.tsx", /\/extracurriculars/],
  ["src/app/(dashboard)/teacher/extracurriculars/page.tsx", /\/extracurriculars/],
  ["src/app/(dashboard)/parent/extracurriculars/page.tsx", /\/parent-portal\/overview/],
] as const;
for (const [relativePath, endpoint] of pages) {
  const page = join(root, relativePath);
  assert.ok(existsSync(page), `extracurricular persona page missing: ${page}`);
  const source = readFileSync(page, "utf8");
  assert.match(source, /siakadApiFetch/);
  assert.match(source, endpoint);
  assert.match(source, /Memuat|loading/);
  assert.match(source, /Gagal|error/);
  assert.match(source, /Belum ada|empty/);
  assert.doesNotMatch(source, /\b(?:alert|confirm)\s*\(/);
  if (relativePath.includes("/parent/")) {
    assert.doesNotMatch(source, /\/extracurriculars\/.*enrollments/);
    assert.doesNotMatch(source, /method:\s*["'](?:POST|DELETE)["']/);
  }
}
console.log("Extracurricular UI contract passed");
