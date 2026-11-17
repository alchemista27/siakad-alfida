CREATE TYPE "YmqExaminerTarget" AS ENUM ('pembina', 'peserta');
CREATE TYPE "YmqGender" AS ENUM ('ikhwan', 'akhwat');

CREATE TABLE "ymq_examiner_assignments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "examiner_user_id" UUID NOT NULL,
  "academic_year" VARCHAR(9) NOT NULL,
  "target" "YmqExaminerTarget" NOT NULL,
  "gender" "YmqGender" NOT NULL,
  "unit_id" UUID,
  "unit_name" VARCHAR(150),
  "levels" "YmqGroupLevel"[] NOT NULL DEFAULT ARRAY[]::"YmqGroupLevel"[],
  "assigned_by_id" UUID NOT NULL,
  "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revoked_at" TIMESTAMPTZ,
  CONSTRAINT "ymq_examiner_assignments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ymq_examiner_assignments_scope_shape_check" CHECK (
    ("target" = 'pembina' AND "unit_id" IS NULL AND "unit_name" IS NULL AND cardinality("levels") = 0)
    OR
    ("target" = 'peserta' AND "unit_id" IS NOT NULL AND "unit_name" IS NOT NULL AND cardinality("levels") > 0)
  ),
  CONSTRAINT "ymq_examiner_assignments_examiner_user_id_fkey"
    FOREIGN KEY ("examiner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ymq_examiner_assignments_assigned_by_id_fkey"
    FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "ymq_examiner_assignments_examiner_user_id_revoked_at_idx"
  ON "ymq_examiner_assignments"("examiner_user_id", "revoked_at");

CREATE INDEX "ymq_examiner_assignments_academic_year_target_gender_unit_id_revoked_at_idx"
  ON "ymq_examiner_assignments"("academic_year", "target", "gender", "unit_id", "revoked_at");

CREATE UNIQUE INDEX "ymq_examiner_assignments_one_active_scope"
  ON "ymq_examiner_assignments" (
    "academic_year", "target", "gender", COALESCE("unit_id", '00000000-0000-0000-0000-000000000000'::uuid)
  )
  WHERE "revoked_at" IS NULL;
