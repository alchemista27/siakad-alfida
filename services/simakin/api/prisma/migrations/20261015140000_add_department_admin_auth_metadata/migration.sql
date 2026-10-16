ALTER TABLE "department_admins"
  ADD COLUMN "auth_assignment_id" UUID,
  ADD COLUMN "assigned_by_id" UUID,
  ADD COLUMN "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "revoked_at" TIMESTAMPTZ,
  ADD COLUMN "revoked_by_id" UUID;
