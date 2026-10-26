-- Global holidays already in use remain effective; provenance records who may update them.
ALTER TABLE "holidays" ADD COLUMN "source" VARCHAR(16) NOT NULL DEFAULT 'manual';
ALTER TABLE "holidays" ADD COLUMN "provider_key" VARCHAR(160);
ALTER TABLE "holidays" ADD COLUMN "provider_synced_at" TIMESTAMPTZ;
UPDATE "holidays" SET "source" = 'legacy' WHERE "unit_id" IS NULL;
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_source_valid"
  CHECK ("source" IN ('manual', 'provider', 'legacy'));
CREATE UNIQUE INDEX "holidays_provider_key_key" ON "holidays"("provider_key");
