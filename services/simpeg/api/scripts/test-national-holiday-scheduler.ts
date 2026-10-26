import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../../..");
const entry = resolve(root, "services/simpeg/api/src/attendance/sync-national-holidays.cli.ts");
assert.ok(existsSync(entry), "One-shot provider sync executable must exist");
const source = readFileSync(entry, "utf8");
assert.match(source, /pg_try_advisory_xact_lock/, "Runs across replicas need a DB transaction-scoped lock");
assert.match(source, /runNationalHolidaySync/, "CLI must fetch all years before persisting");
const startup = readFileSync(resolve(root, "services/simpeg/start.sh"), "utf8");
assert.match(startup, /API_INDONESIA_API_KEY/, "Scheduler must not start without provider credentials");
assert.match(startup, /sync-national-holidays\.cli\.js/, "Scheduler must call the compiled one-shot executable");
assert.doesNotMatch(startup, /seed-national-holidays-2026/, "Static seed must not run in production");
console.log("SIMPEG provider scheduler contract passed");
