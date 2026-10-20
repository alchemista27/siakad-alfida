ALTER TABLE "department_members"
  ADD COLUMN IF NOT EXISTS "source_updated_at" TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS "department_members_source_updated_at_idx"
  ON "department_members" ("source_updated_at");
