ALTER TABLE "saturday_duty_assignments" ADD COLUMN "start_time" VARCHAR(5);
ALTER TABLE "saturday_duty_assignments" ADD COLUMN "late_grace_minutes" INTEGER;
ALTER TABLE "saturday_duty_assignments" ADD COLUMN "end_time" VARCHAR(5);
ALTER TABLE "saturday_duty_assignments" ADD COLUMN "overtime_start_time" VARCHAR(5);
ALTER TABLE "saturday_duty_assignments" ADD CONSTRAINT "saturday_duty_times_valid" CHECK (
  ("start_time" IS NULL AND "late_grace_minutes" IS NULL AND "end_time" IS NULL AND "overtime_start_time" IS NULL) OR
  ("start_time" IS NOT NULL AND "late_grace_minutes" IS NOT NULL AND "end_time" IS NOT NULL AND "overtime_start_time" IS NOT NULL AND
   "start_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' AND
   "end_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' AND
   "overtime_start_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' AND
   "late_grace_minutes" BETWEEN 0 AND 180 AND
   (substring("start_time", 1, 2)::integer * 60 + substring("start_time", 4, 2)::integer + "late_grace_minutes") < 1440 AND
   "start_time" < "end_time" AND "end_time" <= "overtime_start_time")
);
ALTER TABLE "gps_attendances" ADD COLUMN "work_schedule_snapshot" JSONB;
ALTER TABLE "gps_attendances" ADD COLUMN "overtime_minutes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "gps_attendances" ADD CONSTRAINT "gps_attendances_overtime_nonnegative" CHECK ("overtime_minutes" >= 0);
