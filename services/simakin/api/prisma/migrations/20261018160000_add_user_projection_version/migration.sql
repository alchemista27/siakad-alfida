-- Receiver-side source version lets SIMAKIN reject stale SIMPEG user projections atomically.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "source_updated_at" TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS "users_source_updated_at_idx" ON "users" ("source_updated_at");
