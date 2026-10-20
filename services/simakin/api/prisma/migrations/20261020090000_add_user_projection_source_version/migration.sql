-- User.sourceUpdatedAt is already required by the SIMAKIN Prisma model and
-- organization-sync upsert path. Existing databases predate that projection field.
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "source_updated_at" TIMESTAMPTZ;
