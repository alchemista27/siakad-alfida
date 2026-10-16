-- CreateTable
CREATE TABLE "unit_admin_assignments" (
    "id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "app" VARCHAR(30) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "assigned_by_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ,
    "revoked_by_id" UUID,
    "auth_assignment_id" UUID,

    CONSTRAINT "unit_admin_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unit_admin_assignments_unit_id_user_id_app_role_key"
  ON "unit_admin_assignments"("unit_id", "user_id", "app", "role");

-- CreateIndex
CREATE INDEX "unit_admin_assignments_unit_id_is_active_idx"
  ON "unit_admin_assignments"("unit_id", "is_active");

-- CreateIndex
CREATE INDEX "unit_admin_assignments_user_id_is_active_idx"
  ON "unit_admin_assignments"("user_id", "is_active");
