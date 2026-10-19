-- Add a safe deterministic label for historical grade rows before enforcing it.
ALTER TABLE "siakad"."grades"
  ADD COLUMN "label" VARCHAR(100) NOT NULL DEFAULT 'Legacy';

ALTER TABLE "siakad"."grades"
  ALTER COLUMN "label" DROP DEFAULT;

CREATE UNIQUE INDEX "grades_enrollment_id_teacher_assignment_id_category_label_key"
  ON "siakad"."grades"("enrollment_id", "teacher_assignment_id", "category", "label");
