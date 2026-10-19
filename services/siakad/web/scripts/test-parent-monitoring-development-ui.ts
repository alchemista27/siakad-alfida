import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const pages = [
  ["src/app/(dashboard)/parent/page.tsx", "/parent-portal/overview"],
  ["src/app/(dashboard)/parent/extracurriculars/page.tsx", "/parent-portal/overview"],
  ["src/app/(dashboard)/parent/development/page.tsx", "/student-development/parent"],
  ["src/app/(dashboard)/homeroom/student-development/page.tsx", "/student-development"],
  ["src/app/(dashboard)/admin/monitoring/page.tsx", "/monitoring/academic"],
] as const;

for (const [relativePath, endpoint] of pages) {
  const path = join(root, relativePath);
  assert.ok(existsSync(path), `page missing: ${relativePath}`);
  const source = readFileSync(path, "utf8");
  assert.match(source, /siakadApiFetch/, `${relativePath} must use siakadApiFetch`);
  assert.match(source, new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${relativePath} must call ${endpoint}`);
  assert.match(source, /Memuat|loading/, `${relativePath} must render loading state`);
  assert.match(source, /Gagal|error/, `${relativePath} must render error state`);
  assert.match(source, /Belum ada|empty/, `${relativePath} must render empty state`);
  assert.doesNotMatch(source, /\b(?:alert|confirm)\s*\(/, `${relativePath} must not use native dialogs`);
  assert.doesNotMatch(source, /\b(?:spp|payment|payments|billing)\b/i, `${relativePath} must not add billing or SPP scope`);
}
console.log("Parent, monitoring, and student development UI contract passed");
