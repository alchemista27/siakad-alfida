import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const root = resolve(import.meta.dirname, "..");
const schema = readFileSync(resolve(root, "prisma/schema.prisma"), "utf8");
const migrationPath = resolve(root, "prisma/migrations/20261026060000_add_admission_period_counters/migration.sql");

assert(schema.includes("model AdmissionPeriodCounter"), "Prisma schema must retain AdmissionPeriodCounter");
assert(schema.includes('@@map("admission_period_counters")'), "counter model must map to admission_period_counters");
assert(existsSync(migrationPath), "counter migration must exist");

const migration = readFileSync(migrationPath, "utf8");
assert(/CREATE TABLE IF NOT EXISTS\s+"admission_period_counters"/i.test(migration), "migration must create admission_period_counters idempotently");
assert(/"period_id"\s+UUID\s+NOT NULL/i.test(migration), "counter period_id must be a required UUID");
assert(/PRIMARY KEY\s*\("period_id"\)/i.test(migration), "period_id must be the one-to-one counter primary key");
assert(/FOREIGN KEY\s*\("period_id"\)\s*REFERENCES\s*"admission_periods"\("id"\)\s*ON DELETE CASCADE/i.test(migration), "counter must cascade with its period");
assert(/INSERT INTO\s+"admission_period_counters"/i.test(migration), "migration must backfill counters for existing periods");
assert(/ON CONFLICT\s*\("period_id"\)\s*DO NOTHING/i.test(migration), "backfill must be safe to re-run");

console.log("SPMB admission counter migration contract passed");
