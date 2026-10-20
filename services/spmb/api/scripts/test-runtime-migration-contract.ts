import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const serviceRoot = resolve(__dirname, "../..");
const dockerfile = readFileSync(resolve(serviceRoot, "Dockerfile"), "utf8");
const startScript = readFileSync(resolve(serviceRoot, "start.sh"), "utf8");
const migration = readFileSync(
  resolve(serviceRoot, "api/prisma/migrations/20261018110000_handoff_outbox_dispatcher/migration.sql"),
  "utf8",
);

function assertIncludes(source: string, expected: string, message: string) {
  assert.ok(source.includes(expected), message);
}

function assertBefore(source: string, first: string, second: string, message: string) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  assert.ok(firstIndex >= 0, `Missing required text: ${first}`);
  assert.ok(secondIndex >= 0, `Missing required text: ${second}`);
  assert.ok(firstIndex < secondIndex, message);
}

assert.match(
  dockerfile,
  /RUN apk add --no-cache\s+libc6-compat\s+openssl\s+\\/,
  "the runtime base image must install openssl alongside libc6-compat",
);
assertIncludes(
  dockerfile,
  "COPY --from=builder --chown=appuser:nodejs /app ./",
  "the non-root runner must own copied application files",
);

const prismaMigration =
  "./services/spmb/api/node_modules/.bin/prisma migrate deploy --schema services/spmb/api/prisma/schema.prisma";
assertIncludes(
  startScript,
  prismaMigration,
  "startup must invoke the service-local Prisma binary directly",
);
assertBefore(
  startScript,
  prismaMigration,
  "PORT=3001 node services/spmb/api/dist/main.js",
  "Prisma migrations must finish before the API starts",
);

assertBefore(
  migration,
  'CREATE TABLE IF NOT EXISTS "handoff_outbox"',
  'ALTER TABLE "handoff_outbox"',
  "the migration must create a missing outbox before altering it",
);

for (const field of [
  '"id" UUID NOT NULL',
  '"registration_id" UUID NOT NULL',
  '"idempotency_key" UUID NOT NULL',
  '"payload_hash" VARCHAR(128) NOT NULL',
  '"status" VARCHAR(30) NOT NULL DEFAULT \'pending\'',
  '"attempts" INTEGER NOT NULL DEFAULT 0',
  '"available_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP',
  '"leased_at" TIMESTAMPTZ',
  '"lease_owner" VARCHAR(100)',
  '"last_error" TEXT',
  '"destination_enrollment_id" UUID',
  '"delivered_at" TIMESTAMPTZ',
  '"created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP',
  '"updated_at" TIMESTAMPTZ',
]) {
  assertIncludes(migration, field, `missing HandoffOutbox field definition: ${field}`);
}

assertIncludes(migration, 'PRIMARY KEY ("id")', "the outbox must have a primary key");
assertIncludes(
  migration,
  'UNIQUE ("registration_id")',
  "the outbox must allow one message per registration",
);
assertIncludes(
  migration,
  'UNIQUE ("idempotency_key")',
  "the outbox must enforce idempotency keys",
);
assertIncludes(
  migration,
  'FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE',
  "the outbox must reference registrations(id) with cascade cleanup",
);
assertIncludes(
  migration,
  'CREATE INDEX IF NOT EXISTS "handoff_outbox_status_available_at_idx"',
  "the dispatcher availability index must exist",
);
assertIncludes(
  migration,
  'CREATE INDEX IF NOT EXISTS "handoff_outbox_status_leased_at_idx"',
  "the dispatcher lease index must exist",
);

console.log("SPMB runtime and migration lifecycle contract passed");
