CREATE TYPE "OrganizationSyncAggregate" AS ENUM ('department', 'user');
CREATE TYPE "OrganizationSyncStatus" AS ENUM ('pending', 'processing', 'delivered', 'failed');

CREATE TABLE "organization_sync_outbox" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "aggregate" "OrganizationSyncAggregate" NOT NULL,
  "aggregate_id" UUID NOT NULL,
  "event_type" VARCHAR(80) NOT NULL,
  "payload" JSONB NOT NULL,
  "idempotency_key" VARCHAR(180) NOT NULL UNIQUE,
  "status" "OrganizationSyncStatus" NOT NULL DEFAULT 'pending',
  "attempt_count" INTEGER NOT NULL DEFAULT 0,
  "last_error" TEXT,
  "available_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "delivered_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "organization_sync_outbox_status_available_at_idx" ON "organization_sync_outbox" ("status", "available_at");
CREATE INDEX "organization_sync_outbox_aggregate_aggregate_id_idx" ON "organization_sync_outbox" ("aggregate", "aggregate_id");
