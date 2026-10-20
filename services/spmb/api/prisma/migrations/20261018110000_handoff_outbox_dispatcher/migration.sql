CREATE TABLE IF NOT EXISTS "handoff_outbox" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "registration_id" UUID NOT NULL,
  "idempotency_key" UUID NOT NULL,
  "payload_hash" VARCHAR(128) NOT NULL,
  "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "available_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leased_at" TIMESTAMPTZ,
  "lease_owner" VARCHAR(100),
  "last_error" TEXT,
  "destination_enrollment_id" UUID,
  "delivered_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ,

  CONSTRAINT "handoff_outbox_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "handoff_outbox_registration_id_key" UNIQUE ("registration_id"),
  CONSTRAINT "handoff_outbox_idempotency_key_key" UNIQUE ("idempotency_key"),
  CONSTRAINT "handoff_outbox_registration_id_fkey"
    FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE
);

ALTER TABLE "handoff_outbox"
  ADD COLUMN IF NOT EXISTS "available_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "leased_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "lease_owner" VARCHAR(100);

CREATE INDEX IF NOT EXISTS "handoff_outbox_status_available_at_idx"
  ON "handoff_outbox" ("status", "available_at");

CREATE INDEX IF NOT EXISTS "handoff_outbox_status_leased_at_idx"
  ON "handoff_outbox" ("status", "leased_at");
