-- Add date-specific Saturday duty assignments and enforce one global holiday per UTC date.
CREATE TABLE "saturday_duty_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unit_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saturday_duty_assignments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "saturday_duty_assignments_date_must_be_saturday"
      CHECK (EXTRACT(DOW FROM "date") = 6)
);

CREATE UNIQUE INDEX "saturday_duty_assignments_unit_id_user_id_date_key"
  ON "saturday_duty_assignments"("unit_id", "user_id", "date");
CREATE INDEX "saturday_duty_assignments_unit_id_date_idx"
  ON "saturday_duty_assignments"("unit_id", "date");
CREATE INDEX "saturday_duty_assignments_user_id_date_idx"
  ON "saturday_duty_assignments"("user_id", "date");
CREATE INDEX "holidays_date_idx" ON "holidays"("date");

-- PostgreSQL unique constraints permit multiple NULLs; this closes that gap for national holidays.
CREATE UNIQUE INDEX "holidays_global_date_unique"
  ON "holidays"("date")
  WHERE "unit_id" IS NULL;
