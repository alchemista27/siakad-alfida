ALTER TYPE "OrganizationSyncAggregate" ADD VALUE IF NOT EXISTS 'department_member';

ALTER TABLE "departments"
  ADD COLUMN IF NOT EXISTS "unit_id" UUID,
  ADD COLUMN IF NOT EXISTS "parent_id" UUID,
  ADD COLUMN IF NOT EXISTS "leader_id" UUID;

CREATE INDEX IF NOT EXISTS "departments_unit_id_idx" ON "departments"("unit_id");
CREATE INDEX IF NOT EXISTS "departments_parent_id_idx" ON "departments"("parent_id");
CREATE INDEX IF NOT EXISTS "departments_leader_id_idx" ON "departments"("leader_id");

ALTER TABLE "departments"
  ADD CONSTRAINT "departments_unit_id_fkey"
  FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL;

ALTER TABLE "departments"
  ADD CONSTRAINT "departments_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "departments"("id") ON DELETE SET NULL;

ALTER TABLE "departments"
  ADD CONSTRAINT "departments_leader_id_fkey"
  FOREIGN KEY ("leader_id") REFERENCES "users"("id") ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS "department_members" (
  "id" UUID NOT NULL,
  "department_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "role" VARCHAR(50),
  "source_created_at" TIMESTAMPTZ,
  "source_updated_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "department_members_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "department_members_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE,
  CONSTRAINT "department_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "department_members_department_id_user_id_key" ON "department_members"("department_id", "user_id");
CREATE INDEX IF NOT EXISTS "department_members_user_id_idx" ON "department_members"("user_id");
CREATE INDEX IF NOT EXISTS "department_members_source_updated_at_idx" ON "department_members"("source_updated_at");

CREATE TABLE IF NOT EXISTS "organization_import_receipts" (
  "id" UUID NOT NULL,
  "source" VARCHAR(80) NOT NULL,
  "entity" VARCHAR(80) NOT NULL,
  "source_id" VARCHAR(200) NOT NULL,
  "payload_hash" VARCHAR(64) NOT NULL,
  "source_version" TIMESTAMPTZ NOT NULL,
  "applied_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "organization_import_receipts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "organization_import_receipts_source_entity_source_id_key"
  ON "organization_import_receipts"("source", "entity", "source_id");
CREATE INDEX IF NOT EXISTS "organization_import_receipts_source_entity_source_version_idx"
  ON "organization_import_receipts"("source", "entity", "source_version");
