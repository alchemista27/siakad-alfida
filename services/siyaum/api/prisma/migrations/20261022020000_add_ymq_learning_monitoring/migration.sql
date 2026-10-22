-- Add YMQ learning monitoring without changing legacy ymq_setoran semantics.
CREATE TYPE "YmqGroupLevel" AS ENUM ('pra_tahsin', 'tahsin', 'tahfiz');
CREATE TYPE "IwrLevel" AS ENUM ('iwr_1', 'iwr_2');
CREATE TYPE "AttendanceStatus" AS ENUM ('hadir', 'izin', 'sakit', 'alpa');
CREATE TYPE "LearningTrack" AS ENUM ('pra_tahsin', 'tahsin', 'ziyadah');
CREATE TYPE "YmqGroupStaffRole" AS ENUM ('admin_kelompok');

ALTER TABLE "users"
  ADD COLUMN "unit_id" UUID,
  ADD COLUMN "source_updated_at" TIMESTAMPTZ;
CREATE INDEX "users_unit_id_is_active_idx" ON "users"("unit_id", "is_active");

ALTER TABLE "ymq_groups"
  ALTER COLUMN "musyrif_id" DROP NOT NULL,
  ADD COLUMN "pembina_user_id" UUID,
  ADD COLUMN "level" "YmqGroupLevel",
  ADD COLUMN "unit_id" UUID,
  ADD COLUMN "unit_name" VARCHAR(150);
UPDATE "ymq_groups"
SET "pembina_user_id" = "musyrif_id"
WHERE "pembina_user_id" IS NULL AND "musyrif_id" IS NOT NULL;
CREATE INDEX "ymq_groups_unit_id_level_idx" ON "ymq_groups"("unit_id", "level");
CREATE INDEX "ymq_groups_pembina_user_id_idx" ON "ymq_groups"("pembina_user_id");

ALTER TABLE "ymq_members"
  ADD COLUMN "left_at" TIMESTAMPTZ;
CREATE INDEX "ymq_members_user_id_left_at_idx" ON "ymq_members"("user_id", "left_at");

CREATE TABLE "ymq_iwr_curriculum_units" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "iwr_level" "IwrLevel" NOT NULL,
  "topic_code" VARCHAR(40) NOT NULL,
  "topic_title" VARCHAR(200) NOT NULL,
  "page_start" INTEGER NOT NULL,
  "page_end" INTEGER NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ymq_iwr_curriculum_units_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ymq_iwr_curriculum_units_iwr_level_topic_code_key" UNIQUE ("iwr_level", "topic_code")
);

CREATE TABLE "ymq_group_admin_assignments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "group_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "role" "YmqGroupStaffRole" NOT NULL DEFAULT 'admin_kelompok',
  "assigned_by_id" UUID NOT NULL,
  "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revoked_at" TIMESTAMPTZ,
  CONSTRAINT "ymq_group_admin_assignments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ymq_group_admin_assignments_user_id_revoked_at_idx"
  ON "ymq_group_admin_assignments"("user_id", "revoked_at");
CREATE UNIQUE INDEX "ymq_group_admin_assignments_active_group_user_key"
  ON "ymq_group_admin_assignments" ("group_id", "user_id")
  WHERE "revoked_at" IS NULL;

CREATE TABLE "ymq_learning_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "group_id" UUID NOT NULL,
  "session_date" DATE NOT NULL,
  "notes" TEXT,
  "created_by_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ymq_learning_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ymq_learning_sessions_group_id_session_date_key" UNIQUE ("group_id", "session_date")
);
CREATE INDEX "ymq_learning_sessions_session_date_idx" ON "ymq_learning_sessions"("session_date");

CREATE TABLE "ymq_session_attendance" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "session_id" UUID NOT NULL,
  "member_id" UUID NOT NULL,
  "status" "AttendanceStatus" NOT NULL,
  "note" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ymq_session_attendance_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ymq_session_attendance_session_id_member_id_key" UNIQUE ("session_id", "member_id")
);

CREATE TABLE "ymq_learning_progress" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "session_id" UUID NOT NULL,
  "member_id" UUID NOT NULL,
  "track" "LearningTrack" NOT NULL,
  "sequence" INTEGER NOT NULL DEFAULT 1,
  "iwr_curriculum_unit_id" UUID,
  "surah_number" INTEGER,
  "ayah_start" INTEGER,
  "ayah_end" INTEGER,
  "note" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ymq_learning_progress_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ymq_learning_progress_session_id_member_id_track_sequence_key" UNIQUE ("session_id", "member_id", "track", "sequence"),
  CONSTRAINT "ymq_learning_progress_track_shape_check" CHECK (
    ("track" = 'pra_tahsin' AND "iwr_curriculum_unit_id" IS NOT NULL AND "surah_number" IS NULL AND "ayah_start" IS NULL AND "ayah_end" IS NULL)
    OR
    ("track" = 'tahsin' AND "iwr_curriculum_unit_id" IS NULL AND "surah_number" BETWEEN 1 AND 114 AND "ayah_start" IS NOT NULL AND "ayah_end" IS NOT NULL AND "ayah_end" >= "ayah_start")
    OR
    ("track" = 'ziyadah' AND "iwr_curriculum_unit_id" IS NULL AND "surah_number" BETWEEN 1 AND 114 AND "ayah_start" IS NULL AND "ayah_end" IS NULL)
  ),
  CONSTRAINT "ymq_learning_progress_sequence_check" CHECK ("sequence" >= 1)
);
CREATE INDEX "ymq_learning_progress_track_surah_number_idx" ON "ymq_learning_progress"("track", "surah_number");

CREATE TABLE "ymq_progress_evidence" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "progress_id" UUID NOT NULL,
  "cloudinary_public_id" VARCHAR(500) NOT NULL,
  "secure_url" TEXT NOT NULL,
  "resource_type" VARCHAR(20) NOT NULL,
  "original_filename" VARCHAR(255),
  "bytes" INTEGER,
  "uploaded_by_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ymq_progress_evidence_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ymq_progress_evidence_progress_id_cloudinary_public_id_key" UNIQUE ("progress_id", "cloudinary_public_id")
);

ALTER TABLE "ymq_groups"
  ADD CONSTRAINT "ymq_groups_pembina_user_id_fkey"
  FOREIGN KEY ("pembina_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ymq_group_admin_assignments"
  ADD CONSTRAINT "ymq_group_admin_assignments_group_id_fkey"
  FOREIGN KEY ("group_id") REFERENCES "ymq_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ymq_group_admin_assignments_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ymq_learning_sessions"
  ADD CONSTRAINT "ymq_learning_sessions_group_id_fkey"
  FOREIGN KEY ("group_id") REFERENCES "ymq_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ymq_session_attendance"
  ADD CONSTRAINT "ymq_session_attendance_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "ymq_learning_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ymq_session_attendance_member_id_fkey"
  FOREIGN KEY ("member_id") REFERENCES "ymq_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ymq_learning_progress"
  ADD CONSTRAINT "ymq_learning_progress_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "ymq_learning_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ymq_learning_progress_member_id_fkey"
  FOREIGN KEY ("member_id") REFERENCES "ymq_members"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ymq_learning_progress_iwr_curriculum_unit_id_fkey"
  FOREIGN KEY ("iwr_curriculum_unit_id") REFERENCES "ymq_iwr_curriculum_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ymq_progress_evidence"
  ADD CONSTRAINT "ymq_progress_evidence_progress_id_fkey"
  FOREIGN KEY ("progress_id") REFERENCES "ymq_learning_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
