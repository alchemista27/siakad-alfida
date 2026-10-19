import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const apiRoot = join(import.meta.dirname, "..");
const schema = readFileSync(join(apiRoot, "prisma/schema.prisma"), "utf8");
const migrationPath = join(apiRoot, "prisma/migrations/20261018133000_grade_label_invariant/migration.sql");

assert.match(schema, /model Grade\s*{[\s\S]*?label\s+String\s+@db\.VarChar\(100\)[\s\S]*?@@unique\(\[enrollmentId, teacherAssignmentId, category, label\]\)/);
assert.ok(existsSync(migrationPath), "grade-label invariant must have an additive migration");

const migration = readFileSync(migrationPath, "utf8");
assert.match(migration, /ADD COLUMN "label" VARCHAR\(100\) NOT NULL DEFAULT 'Legacy'/);
assert.match(migration, /DROP DEFAULT/);
assert.match(migration, /CREATE UNIQUE INDEX "grades_enrollment_id_teacher_assignment_id_category_label_key"/);

console.log("Academic invariants contract passed");
