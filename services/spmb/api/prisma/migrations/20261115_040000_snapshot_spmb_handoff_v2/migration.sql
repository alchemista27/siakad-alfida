ALTER TABLE "handoff_outbox"
  ADD COLUMN IF NOT EXISTS "contract_version" INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS "payload" JSONB,
  ADD COLUMN IF NOT EXISTS "destination_receipt_id" UUID;
