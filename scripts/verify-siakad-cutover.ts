import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function main() {
  const root = resolve(import.meta.dirname, "..");

  // 1. Verify schema migration file exists
  const migrationSqlPath = resolve(root, "services/siakad/api/prisma/migrations/0_init/migration.sql");
  assert(existsSync(migrationSqlPath), "migration.sql must exist");
  const sql = readFileSync(migrationSqlPath, "utf8");
  assert(sql.includes('CREATE SCHEMA IF NOT EXISTS "siakad"'), "SQL must create siakad schema");
  assert(sql.includes('CREATE TABLE "siakad"."academic_years"'), "SQL must create academic_years");
  assert(sql.includes('CREATE TABLE "siakad"."students"'), "SQL must create students");
  assert(sql.includes('CREATE TABLE "siakad"."enrollments"'), "SQL must create enrollments");

  // 2. Verify parity matrix exists
  const matrixPath = resolve(root, "docs/siakad-parity-matrix.md");
  assert(existsSync(matrixPath), "docs/siakad-parity-matrix.md must exist");

  // 3. Verify cutover guide exists
  const guidePath = resolve(root, "docs/siakad-cutover-guide.md");
  assert(existsSync(guidePath), "docs/siakad-cutover-guide.md must exist");

  console.log("SIAKAD cutover verification passed");
}

main();
