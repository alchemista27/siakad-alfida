CREATE TABLE "siakad"."student_development_records" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "enrollment_id" UUID NOT NULL,
  "academic_year_id" UUID NOT NULL,
  "homeroom_assignment_id" UUID NOT NULL,
  "kind" VARCHAR(20) NOT NULL,
  "occurred_at" DATE NOT NULL,
  "summary" VARCHAR(300) NOT NULL,
  "details" TEXT,
  "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
  "recorded_by_user_id" UUID NOT NULL,
  "approved_by_user_id" UUID,
  "approved_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "student_development_records_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "student_development_records_kind_check" CHECK ("kind" IN ('character', 'violation', 'bpi')),
  CONSTRAINT "student_development_records_status_check" CHECK ("status" IN ('draft', 'approved', 'rejected')),
  CONSTRAINT "student_development_records_enrollment_id_fkey"
    FOREIGN KEY ("enrollment_id") REFERENCES "siakad"."enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "student_development_records_academic_year_id_fkey"
    FOREIGN KEY ("academic_year_id") REFERENCES "siakad"."academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "student_development_records_homeroom_assignment_id_fkey"
    FOREIGN KEY ("homeroom_assignment_id") REFERENCES "siakad"."homeroom_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "student_development_records_homeroom_assignment_id_occurred_at_idx"
  ON "siakad"."student_development_records" ("homeroom_assignment_id", "occurred_at");

CREATE INDEX "student_development_records_enrollment_id_status_idx"
  ON "siakad"."student_development_records" ("enrollment_id", "status");
