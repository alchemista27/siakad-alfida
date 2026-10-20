import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
const migrationPath = resolve(root, "prisma/migrations/20261020080000_add_organization_master_tables/migration.sql");
assert.ok(existsSync(migrationPath), "organization master migration must exist");
const migration = readFileSync(migrationPath, "utf8");

for (const required of [
  'CREATE TABLE IF NOT EXISTS "units"',
  'CREATE TABLE IF NOT EXISTS "departments"',
  '"id" UUID NOT NULL',
  '"name" VARCHAR(150) NOT NULL',
  '"code" VARCHAR(50) NOT NULL',
  '"category" VARCHAR(30) NOT NULL DEFAULT \'pendidikan\'',
  '"is_active" BOOLEAN NOT NULL DEFAULT true',
  '"created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP',
  '"updated_at" TIMESTAMPTZ',
  'CREATE UNIQUE INDEX IF NOT EXISTS "units_code_key"',
  'CREATE UNIQUE INDEX IF NOT EXISTS "departments_name_key"',
  'CREATE UNIQUE INDEX IF NOT EXISTS "departments_code_key"',
]) {
  assert.ok(migration.includes(required), `missing organization master migration clause: ${required}`);
}

assert.ok(
  migration.indexOf('CREATE TABLE IF NOT EXISTS "units"') < migration.indexOf('CREATE TABLE IF NOT EXISTS "departments"'),
  "units must be created before departments",
);

console.log("SIMPEG organization master migration contract passed");
