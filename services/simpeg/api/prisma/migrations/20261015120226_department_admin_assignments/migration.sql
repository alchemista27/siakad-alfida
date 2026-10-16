CREATE TYPE "DepartmentAdminRole" AS ENUM ('admin_bidang');
CREATE TABLE "department_admin_assignments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "department_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "role" "DepartmentAdminRole" NOT NULL DEFAULT 'admin_bidang',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "assigned_by_id" UUID NOT NULL,
  "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revoked_at" TIMESTAMPTZ,
  "revoked_by_id" UUID,
  "auth_assignment_id" UUID,
  CONSTRAINT "department_admin_assignments_department_id_user_id_role_key" UNIQUE ("department_id", "user_id", "role")
);
CREATE INDEX "department_admin_assignments_department_id_is_active_idx" ON "department_admin_assignments" ("department_id", "is_active");
CREATE INDEX "department_admin_assignments_user_id_is_active_idx" ON "department_admin_assignments" ("user_id", "is_active");
