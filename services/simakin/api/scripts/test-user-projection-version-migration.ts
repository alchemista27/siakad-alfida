import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const migrationPath = resolve(__dirname, "../prisma/migrations/20261020090000_add_user_projection_source_version/migration.sql");
assert.ok(existsSync(migrationPath), "SIMAKIN user projection version migration must exist");
const migration = readFileSync(migrationPath, "utf8");
assert.match(
  migration,
  /ALTER TABLE "users"\s+ADD COLUMN IF NOT EXISTS "source_updated_at" TIMESTAMPTZ;/s,
  "live SIMAKIN users must gain the schema field required by User.sourceUpdatedAt",
);
console.log("SIMAKIN user projection version migration contract passed");
