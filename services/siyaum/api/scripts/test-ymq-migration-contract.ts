import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const apiRoot = join(import.meta.dirname, "..");
const migrationsRoot = join(apiRoot, "prisma", "migrations");
assert.equal(existsSync(migrationsRoot), true, "versioned Prisma migrations directory must exist");
const migrationDirectories = readdirSync(migrationsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.includes("add_ymq_learning_monitoring"));
assert.equal(migrationDirectories.length, 1, "YMQ learning monitoring migration must exist exactly once");
const sql = readFileSync(join(migrationsRoot, migrationDirectories[0].name, "migration.sql"), "utf8");
assert.match(sql, /CREATE TABLE "ymq_iwr_curriculum_units"/);
assert.match(sql, /CREATE TABLE "ymq_learning_sessions"/);
assert.match(sql, /CREATE TABLE "ymq_learning_progress"/);
assert.ok(sql.indexOf('CREATE TABLE "ymq_learning_progress"') < sql.indexOf('ymq_learning_progress_track_shape_check'));
assert.match(sql, /WHERE "revoked_at" IS NULL/);
const startScript = readFileSync(join(apiRoot, "..", "start.sh"), "utf8");
assert.ok(startScript.indexOf("prisma migrate deploy") < startScript.indexOf("node services/siyaum/api/dist/main.js"));
const packageJson = readFileSync(join(apiRoot, "package.json"), "utf8");
assert.match(packageJson, /"db:migrate:deploy"/);
assert.doesNotMatch(packageJson, /"db:push"/);
const appModule = readFileSync(join(apiRoot, "src", "app.module.ts"), "utf8");
for (const moduleName of ["CurriculumModule", "YmqEmployeesModule", "GroupStaffModule", "SessionsModule", "EvidenceModule"]) {
  assert.match(appModule, new RegExp(`\\b${moduleName}\\b`), `${moduleName} must be registered so its YMQ routes are reachable`);
}
const envExample = readFileSync(join(apiRoot, "..", ".env.example"), "utf8");
for (const variableName of ["AUTH_INTERNAL_API_URL", "SIMPEG_INTERNAL_API_URL", "INTERNAL_SERVICE_SECRET", "CLOUDINARY_CLOUD_NAME", "NEXT_PUBLIC_CLOUDINARY_YMQ_UPLOAD_PRESET"]) {
  assert.match(envExample, new RegExp(`^${variableName}=`, "m"), `${variableName} must be documented for SIYAUM deployment`);
}

console.log("SIYAUM YMQ migration lifecycle contract passed");
