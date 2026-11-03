CREATE TYPE "AttendanceSource" AS ENUM ('gps', 'fingerprint', 'backfill');

ALTER TABLE "employee_profiles" ADD COLUMN "fingerprint_enrollment_id" VARCHAR(50);
CREATE UNIQUE INDEX "employee_profiles_fingerprint_enrollment_id_key" ON "employee_profiles"("fingerprint_enrollment_id");

ALTER TABLE "gps_attendances"
  ADD COLUMN "source" "AttendanceSource" NOT NULL DEFAULT 'gps';

CREATE TABLE "fingerprint_attendance_events" (
  "id" UUID NOT NULL,
  "source_key" VARCHAR(128) NOT NULL,
  "device_id" VARCHAR(100) NOT NULL,
  "device_serial" VARCHAR(100),
  "enrollment_id" VARCHAR(50) NOT NULL,
  "occurred_at" TIMESTAMPTZ NOT NULL,
  "local_date" DATE NOT NULL,
  "punch" INTEGER,
  "status" INTEGER,
  "user_id" UUID,
  "imported_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fingerprint_attendance_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fingerprint_attendance_events_source_key_key" ON "fingerprint_attendance_events"("source_key");
CREATE INDEX "fingerprint_attendance_events_device_id_occurred_at_idx" ON "fingerprint_attendance_events"("device_id", "occurred_at");
CREATE INDEX "fingerprint_attendance_events_enrollment_id_occurred_at_idx" ON "fingerprint_attendance_events"("enrollment_id", "occurred_at");
CREATE INDEX "fingerprint_attendance_events_user_id_local_date_idx" ON "fingerprint_attendance_events"("user_id", "local_date");
ALTER TABLE "fingerprint_attendance_events"
  ADD CONSTRAINT "fingerprint_attendance_events_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "fingerprint_sync_runs" (
  "id" UUID NOT NULL,
  "device_id" VARCHAR(100) NOT NULL,
  "started_at" TIMESTAMPTZ NOT NULL,
  "completed_at" TIMESTAMPTZ,
  "status" VARCHAR(20) NOT NULL,
  "fetched_count" INTEGER NOT NULL DEFAULT 0,
  "inserted_count" INTEGER NOT NULL DEFAULT 0,
  "matched_count" INTEGER NOT NULL DEFAULT 0,
  "unmatched_count" INTEGER NOT NULL DEFAULT 0,
  "attendance_changed" INTEGER NOT NULL DEFAULT 0,
  "skipped_conflict" INTEGER NOT NULL DEFAULT 0,
  "error_message" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fingerprint_sync_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "fingerprint_sync_runs_device_id_started_at_idx" ON "fingerprint_sync_runs"("device_id", "started_at");
