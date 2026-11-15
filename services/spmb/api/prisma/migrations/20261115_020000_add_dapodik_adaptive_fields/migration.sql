CREATE TYPE "EducationLevel" AS ENUM ('tk', 'sd', 'smp', 'sma');
CREATE TYPE "TkGroup" AS ENUM ('a', 'b');
CREATE TYPE "ResidenceStatus" AS ENUM ('with_parents', 'with_guardian', 'boarding', 'rented', 'other');
CREATE TYPE "ImmunizationStatus" AS ENUM ('complete', 'incomplete', 'unknown');

ALTER TABLE "admission_periods"
  ADD COLUMN "education_level" "EducationLevel",
  ADD COLUMN "tk_group" "TkGroup";

ALTER TABLE "student_data"
  ADD COLUMN "nik" VARCHAR(16),
  ADD COLUMN "birth_certificate_number" VARCHAR(100),
  ADD COLUMN "family_card_number" VARCHAR(16),
  ADD COLUMN "street_address" TEXT,
  ADD COLUMN "rt" VARCHAR(3),
  ADD COLUMN "rw" VARCHAR(3),
  ADD COLUMN "hamlet" VARCHAR(100),
  ADD COLUMN "village" VARCHAR(100),
  ADD COLUMN "subdistrict" VARCHAR(100),
  ADD COLUMN "city" VARCHAR(100),
  ADD COLUMN "province" VARCHAR(100),
  ADD COLUMN "postal_code" VARCHAR(5),
  ADD COLUMN "residence_status" "ResidenceStatus",
  ADD COLUMN "special_needs" VARCHAR(200),
  ADD COLUMN "pip_eligible" BOOLEAN,
  ADD COLUMN "kip_number" VARCHAR(100),
  ADD COLUMN "previous_school_name" VARCHAR(200),
  ADD COLUMN "previous_school_npsn" VARCHAR(8),
  ADD COLUMN "graduation_document_number" VARCHAR(100),
  ADD COLUMN "graduation_year" INTEGER,
  ADD COLUMN "height_cm" DECIMAL(5,2),
  ADD COLUMN "weight_kg" DECIMAL(5,2),
  ADD COLUMN "head_circumference_cm" DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS "immunization_status" "ImmunizationStatus";

CREATE INDEX "student_data_nik_idx" ON "student_data" ("nik");
CREATE INDEX "student_data_previous_school_npsn_idx" ON "student_data" ("previous_school_npsn");
