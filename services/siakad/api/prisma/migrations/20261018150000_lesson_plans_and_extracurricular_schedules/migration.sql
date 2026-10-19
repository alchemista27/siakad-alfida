-- Convert legacy subject/year lesson plans to an explicit teacher assignment owner.
-- The deterministic backfill only accepts plans where a matching assignment exists;
-- ambiguous matching assignments cannot preserve authorship and are rejected instead
-- of silently assigning a plan to the wrong teacher.
ALTER TABLE "siakad"."lesson_plans"
  ADD COLUMN "type" VARCHAR(10) NOT NULL DEFAULT 'rpp',
  ADD COLUMN "teacher_assignment_id" UUID;

ALTER TABLE "siakad"."lesson_plans"
  ADD CONSTRAINT "lesson_plans_type_check" CHECK ("type" IN ('prota', 'promes', 'rpp'));

UPDATE "siakad"."lesson_plans" AS plan
SET "teacher_assignment_id" = (
  SELECT assignment_row."id"
  FROM "siakad"."teacher_assignments" AS assignment_row
  WHERE assignment_row."subject_id" = plan."subject_id"
    AND assignment_row."academic_year_id" = plan."academic_year_id"
)
WHERE plan."teacher_assignment_id" IS NULL
  AND 1 = (
    SELECT COUNT(*)
    FROM "siakad"."teacher_assignments" AS candidate
    WHERE candidate."subject_id" = plan."subject_id"
      AND candidate."academic_year_id" = plan."academic_year_id"
  );

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "siakad"."lesson_plans" WHERE "teacher_assignment_id" IS NULL) THEN
    RAISE EXCEPTION 'Cannot migrate lesson plans without an owning teacher assignment';
  END IF;
END $$;

ALTER TABLE "siakad"."lesson_plans"
  ALTER COLUMN "teacher_assignment_id" SET NOT NULL,
  ADD CONSTRAINT "lesson_plans_teacher_assignment_id_fkey"
    FOREIGN KEY ("teacher_assignment_id") REFERENCES "siakad"."teacher_assignments"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "lesson_plans_teacher_assignment_id_idx"
  ON "siakad"."lesson_plans"("teacher_assignment_id");

CREATE TABLE "siakad"."extracurricular_schedules" (
  "id" UUID NOT NULL,
  "extracurricular_id" UUID NOT NULL,
  "day_of_week" INTEGER NOT NULL,
  "start_time" VARCHAR(10) NOT NULL,
  "end_time" VARCHAR(10) NOT NULL,
  "location" VARCHAR(150),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "extracurricular_schedules_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "extracurricular_schedules_day_of_week_check" CHECK ("day_of_week" BETWEEN 1 AND 7),
  CONSTRAINT "extracurricular_schedules_time_check" CHECK ("start_time" < "end_time")
);

CREATE UNIQUE INDEX "extracurricular_schedules_extracurricular_id_day_of_week_start_time_key"
  ON "siakad"."extracurricular_schedules"("extracurricular_id", "day_of_week", "start_time");

ALTER TABLE "siakad"."extracurricular_schedules"
  ADD CONSTRAINT "extracurricular_schedules_extracurricular_id_fkey"
  FOREIGN KEY ("extracurricular_id") REFERENCES "siakad"."extracurriculars"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
