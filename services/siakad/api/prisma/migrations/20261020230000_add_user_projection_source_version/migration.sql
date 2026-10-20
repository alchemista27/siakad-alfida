ALTER TABLE "siakad"."user_projections"
  ADD COLUMN IF NOT EXISTS "source_updated_at" TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS "user_projections_source_updated_at_idx"
  ON "siakad"."user_projections" ("source_updated_at");
