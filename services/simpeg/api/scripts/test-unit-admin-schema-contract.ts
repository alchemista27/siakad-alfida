import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const schema = readFileSync(join(root, "prisma/schema.prisma"), "utf8");
const migrationPath = join(root, "prisma/migrations/20261016110000_unit_admin_assignments/migration.sql");

assert.match(schema, /model UnitAdminAssignment/);
assert.match(schema, /userId\s+String/);
assert.match(schema, /unitId\s+String/);
assert.match(schema, /app\s+String/);
assert.match(schema, /role\s+String/);
assert.match(schema, /authAssignmentId\s+String\?/);
assert.match(schema, /@@unique\(\[unitId, userId, app, role\]\)/);
assert.equal(existsSync(migrationPath), true, "additive UnitAdminAssignment migration must exist");

const migration = readFileSync(migrationPath, "utf8");
assert.match(migration, /CREATE TABLE "unit_admin_assignments"/);
assert.match(migration, /CREATE UNIQUE INDEX "unit_admin_assignments_unit_id_user_id_app_role_key"/);
assert.match(migration, /CREATE INDEX "unit_admin_assignments_unit_id_is_active_idx"/);
assert.match(migration, /CREATE INDEX "unit_admin_assignments_user_id_is_active_idx"/);

console.log("Unit admin schema contract passed");
