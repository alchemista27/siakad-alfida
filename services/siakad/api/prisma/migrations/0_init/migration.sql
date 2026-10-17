-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "siakad";

-- CreateTable
CREATE TABLE "siakad"."unit_projections" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_projections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."user_projections" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "roles" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'active',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_projections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."academic_years" (
    "id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."admission_receipts" (
    "id" UUID NOT NULL,
    "spmb_registration_id" UUID NOT NULL,
    "registration_number" TEXT NOT NULL,
    "unit_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'received',
    "payload" JSONB NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "received_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ,

    CONSTRAINT "admission_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."students" (
    "id" UUID NOT NULL,
    "admission_receipt_id" UUID,
    "unit_id" UUID NOT NULL,
    "nis" VARCHAR(50),
    "nisn" VARCHAR(50),
    "full_name" VARCHAR(120) NOT NULL,
    "gender" VARCHAR(20) NOT NULL,
    "birth_place" VARCHAR(80),
    "birth_date" DATE,
    "parent_user_id" UUID,
    "parent_name" VARCHAR(120),
    "parent_phone" VARCHAR(50),
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."enrollments" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "class_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'pending_placement',
    "enrolled_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."classrooms" (
    "id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "grade_level" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 30,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."subjects" (
    "id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "kkm" DOUBLE PRECISION NOT NULL DEFAULT 75,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."teacher_assignments" (
    "id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "teacher_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "teacher_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."homeroom_assignments" (
    "id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "teacher_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "homeroom_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."class_schedules" (
    "id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" VARCHAR(10) NOT NULL,
    "end_time" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "class_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."attendances" (
    "id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "schedule_id" UUID,
    "date" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."grades" (
    "id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "teacher_assignment_id" UUID NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."teaching_journals" (
    "id" UUID NOT NULL,
    "teacher_assignment_id" UUID NOT NULL,
    "schedule_id" UUID,
    "date" DATE NOT NULL,
    "topic" VARCHAR(200) NOT NULL,
    "notes" TEXT,
    "student_count_present" INTEGER NOT NULL DEFAULT 0,
    "student_count_absent" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "teaching_journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."lesson_plans" (
    "id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "objectives" TEXT,
    "materials" TEXT,
    "file_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "lesson_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."extracurriculars" (
    "id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "extracurriculars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."extracurricular_coaches" (
    "id" UUID NOT NULL,
    "extracurricular_id" UUID NOT NULL,
    "coach_user_id" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'head_coach',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "extracurricular_coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."extracurricular_memberships" (
    "id" UUID NOT NULL,
    "extracurricular_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extracurricular_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."extracurricular_journals" (
    "id" UUID NOT NULL,
    "extracurricular_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "activity" VARCHAR(200) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "extracurricular_journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."extracurricular_grades" (
    "id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "semester" INTEGER NOT NULL DEFAULT 1,
    "grade" VARCHAR(5) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "extracurricular_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."lhbs_reports" (
    "id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "homeroom_assignment_id" UUID,
    "semester" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "summary" JSONB,
    "teacher_notes" TEXT,
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "lhbs_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siakad"."promotion_decisions" (
    "id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "homeroom_assignment_id" UUID,
    "decision" VARCHAR(30) NOT NULL,
    "target_class_level" INTEGER,
    "notes" TEXT,
    "decided_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "promotion_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unit_projections_slug_key" ON "siakad"."unit_projections"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_projections_email_key" ON "siakad"."user_projections"("email");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_unit_id_name_key" ON "siakad"."academic_years"("unit_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "admission_receipts_spmb_registration_id_key" ON "siakad"."admission_receipts"("spmb_registration_id");

-- CreateIndex
CREATE UNIQUE INDEX "admission_receipts_idempotency_key_key" ON "siakad"."admission_receipts"("idempotency_key");

-- CreateIndex
CREATE INDEX "admission_receipts_unit_id_status_idx" ON "siakad"."admission_receipts"("unit_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "students_admission_receipt_id_key" ON "siakad"."students"("admission_receipt_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_nis_key" ON "siakad"."students"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "students_nisn_key" ON "siakad"."students"("nisn");

-- CreateIndex
CREATE INDEX "students_unit_id_status_idx" ON "siakad"."students"("unit_id", "status");

-- CreateIndex
CREATE INDEX "enrollments_class_id_status_idx" ON "siakad"."enrollments"("class_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_student_id_academic_year_id_key" ON "siakad"."enrollments"("student_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "classrooms_unit_id_academic_year_id_name_key" ON "siakad"."classrooms"("unit_id", "academic_year_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_unit_id_code_key" ON "siakad"."subjects"("unit_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_assignments_class_id_subject_id_academic_year_id_key" ON "siakad"."teacher_assignments"("class_id", "subject_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "homeroom_assignments_class_id_key" ON "siakad"."homeroom_assignments"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "homeroom_assignments_class_id_academic_year_id_key" ON "siakad"."homeroom_assignments"("class_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_enrollment_id_schedule_id_date_key" ON "siakad"."attendances"("enrollment_id", "schedule_id", "date");

-- CreateIndex
CREATE INDEX "grades_enrollment_id_category_idx" ON "siakad"."grades"("enrollment_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "extracurriculars_academic_year_id_name_key" ON "siakad"."extracurriculars"("academic_year_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "extracurricular_coaches_extracurricular_id_coach_user_id_key" ON "siakad"."extracurricular_coaches"("extracurricular_id", "coach_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "extracurricular_memberships_extracurricular_id_student_id_key" ON "siakad"."extracurricular_memberships"("extracurricular_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "extracurricular_grades_membership_id_semester_key" ON "siakad"."extracurricular_grades"("membership_id", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "lhbs_reports_enrollment_id_academic_year_id_semester_key" ON "siakad"."lhbs_reports"("enrollment_id", "academic_year_id", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_decisions_enrollment_id_key" ON "siakad"."promotion_decisions"("enrollment_id");

-- AddForeignKey
ALTER TABLE "siakad"."academic_years" ADD CONSTRAINT "academic_years_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "siakad"."unit_projections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."students" ADD CONSTRAINT "students_admission_receipt_id_fkey" FOREIGN KEY ("admission_receipt_id") REFERENCES "siakad"."admission_receipts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."enrollments" ADD CONSTRAINT "enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "siakad"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."enrollments" ADD CONSTRAINT "enrollments_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "siakad"."academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."enrollments" ADD CONSTRAINT "enrollments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "siakad"."classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."classrooms" ADD CONSTRAINT "classrooms_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "siakad"."unit_projections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."classrooms" ADD CONSTRAINT "classrooms_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "siakad"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."subjects" ADD CONSTRAINT "subjects_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "siakad"."unit_projections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "siakad"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "siakad"."classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "siakad"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_teacher_user_id_fkey" FOREIGN KEY ("teacher_user_id") REFERENCES "siakad"."user_projections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."homeroom_assignments" ADD CONSTRAINT "homeroom_assignments_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "siakad"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."homeroom_assignments" ADD CONSTRAINT "homeroom_assignments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "siakad"."classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."homeroom_assignments" ADD CONSTRAINT "homeroom_assignments_teacher_user_id_fkey" FOREIGN KEY ("teacher_user_id") REFERENCES "siakad"."user_projections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."class_schedules" ADD CONSTRAINT "class_schedules_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "siakad"."classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."class_schedules" ADD CONSTRAINT "class_schedules_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "siakad"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."attendances" ADD CONSTRAINT "attendances_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "siakad"."enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."attendances" ADD CONSTRAINT "attendances_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "siakad"."class_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."grades" ADD CONSTRAINT "grades_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "siakad"."enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."grades" ADD CONSTRAINT "grades_teacher_assignment_id_fkey" FOREIGN KEY ("teacher_assignment_id") REFERENCES "siakad"."teacher_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."teaching_journals" ADD CONSTRAINT "teaching_journals_teacher_assignment_id_fkey" FOREIGN KEY ("teacher_assignment_id") REFERENCES "siakad"."teacher_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."teaching_journals" ADD CONSTRAINT "teaching_journals_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "siakad"."class_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."lesson_plans" ADD CONSTRAINT "lesson_plans_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "siakad"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."extracurriculars" ADD CONSTRAINT "extracurriculars_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "siakad"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."extracurricular_coaches" ADD CONSTRAINT "extracurricular_coaches_extracurricular_id_fkey" FOREIGN KEY ("extracurricular_id") REFERENCES "siakad"."extracurriculars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."extracurricular_coaches" ADD CONSTRAINT "extracurricular_coaches_coach_user_id_fkey" FOREIGN KEY ("coach_user_id") REFERENCES "siakad"."user_projections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."extracurricular_memberships" ADD CONSTRAINT "extracurricular_memberships_extracurricular_id_fkey" FOREIGN KEY ("extracurricular_id") REFERENCES "siakad"."extracurriculars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."extracurricular_memberships" ADD CONSTRAINT "extracurricular_memberships_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "siakad"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."extracurricular_journals" ADD CONSTRAINT "extracurricular_journals_extracurricular_id_fkey" FOREIGN KEY ("extracurricular_id") REFERENCES "siakad"."extracurriculars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."extracurricular_grades" ADD CONSTRAINT "extracurricular_grades_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "siakad"."extracurricular_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."lhbs_reports" ADD CONSTRAINT "lhbs_reports_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "siakad"."enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."lhbs_reports" ADD CONSTRAINT "lhbs_reports_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "siakad"."academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."lhbs_reports" ADD CONSTRAINT "lhbs_reports_homeroom_assignment_id_fkey" FOREIGN KEY ("homeroom_assignment_id") REFERENCES "siakad"."homeroom_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."promotion_decisions" ADD CONSTRAINT "promotion_decisions_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "siakad"."enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."promotion_decisions" ADD CONSTRAINT "promotion_decisions_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "siakad"."academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siakad"."promotion_decisions" ADD CONSTRAINT "promotion_decisions_homeroom_assignment_id_fkey" FOREIGN KEY ("homeroom_assignment_id") REFERENCES "siakad"."homeroom_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

