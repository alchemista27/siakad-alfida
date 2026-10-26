CREATE TABLE "unit_work_schedules" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "unit_id" UUID NOT NULL,
  "weekday" INTEGER NOT NULL,
  "is_workday" BOOLEAN NOT NULL DEFAULT false,
  "start_time" VARCHAR(5),
  "late_grace_minutes" INTEGER,
  "end_time" VARCHAR(5),
  "overtime_start_time" VARCHAR(5),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "unit_work_schedules_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "unit_work_schedules_valid" CHECK (
    "weekday" BETWEEN 0 AND 6 AND
    ((NOT "is_workday" AND "start_time" IS NULL AND "late_grace_minutes" IS NULL AND
      "end_time" IS NULL AND "overtime_start_time" IS NULL) OR
     ("is_workday" AND "start_time" IS NOT NULL AND "end_time" IS NOT NULL AND
      "overtime_start_time" IS NOT NULL AND "late_grace_minutes" IS NOT NULL AND
      "start_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' AND
      "end_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' AND
      "overtime_start_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' AND
      "late_grace_minutes" BETWEEN 0 AND 180 AND
      (substring("start_time", 1, 2)::integer * 60 + substring("start_time", 4, 2)::integer + "late_grace_minutes") < 1440 AND
      "start_time" < "end_time" AND "end_time" <= "overtime_start_time"))
  )
);
CREATE UNIQUE INDEX "unit_work_schedules_unit_id_weekday_key" ON "unit_work_schedules"("unit_id", "weekday");
CREATE INDEX "unit_work_schedules_unit_id_idx" ON "unit_work_schedules"("unit_id");
