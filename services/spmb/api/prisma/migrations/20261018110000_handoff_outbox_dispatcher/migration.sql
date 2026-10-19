ALTER TABLE "handoff_outbox"
  ADD COLUMN IF NOT EXISTS "available_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "leased_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "lease_owner" VARCHAR(100);

CREATE INDEX IF NOT EXISTS "handoff_outbox_status_available_at_idx"
  ON "handoff_outbox" ("status", "available_at");

CREATE INDEX IF NOT EXISTS "handoff_outbox_status_leased_at_idx"
  ON "handoff_outbox" ("status", "leased_at");
