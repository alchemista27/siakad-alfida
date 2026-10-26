-- Add a durable, idempotent key for staff placements provisioned by Admin approval.
ALTER TABLE "employee_unit_assignments"
  ADD COLUMN IF NOT EXISTS "source_key" VARCHAR(120);

CREATE UNIQUE INDEX IF NOT EXISTS "employee_unit_assignments_source_key_key"
  ON "employee_unit_assignments"("source_key");
