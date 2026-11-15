ALTER TABLE "siakad"."admission_receipts"
  ADD COLUMN IF NOT EXISTS "payload_hash" VARCHAR(128),
  ADD COLUMN IF NOT EXISTS "enrollment_id" UUID;

ALTER TABLE "siakad"."spmb_confirmation_outbox"
  ADD COLUMN IF NOT EXISTS "receipt_id" UUID;

CREATE UNIQUE INDEX IF NOT EXISTS "admission_receipts_enrollment_id_key"
  ON "siakad"."admission_receipts" ("enrollment_id");

ALTER TABLE "siakad"."students"
  ADD COLUMN IF NOT EXISTS "nickname" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "religion" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "address" TEXT,
  ADD COLUMN IF NOT EXISTS "siblings_count" INTEGER,
  ADD COLUMN IF NOT EXISTS "transportation" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "hobby" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "ambition" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "nik" VARCHAR(16),
  ADD COLUMN IF NOT EXISTS "birth_certificate_number" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "family_card_number" VARCHAR(16),
  ADD COLUMN IF NOT EXISTS "street_address" TEXT,
  ADD COLUMN IF NOT EXISTS "rt" VARCHAR(3),
  ADD COLUMN IF NOT EXISTS "rw" VARCHAR(3),
  ADD COLUMN IF NOT EXISTS "hamlet" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "village" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "subdistrict" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "city" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "province" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "postal_code" VARCHAR(5),
  ADD COLUMN IF NOT EXISTS "residence_status" VARCHAR(30),
  ADD COLUMN IF NOT EXISTS "special_needs" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "pip_eligible" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "kip_number" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "previous_school_name" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "previous_school_npsn" VARCHAR(8),
  ADD COLUMN IF NOT EXISTS "graduation_document_number" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "graduation_year" INTEGER,
  ADD COLUMN IF NOT EXISTS "height_cm" DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS "weight_kg" DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS "head_circumference_cm" DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS "immunization_status" VARCHAR(20);

CREATE TABLE IF NOT EXISTS "siakad"."student_guardians" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "student_id" UUID NOT NULL,
  "type" VARCHAR(20) NOT NULL,
  "full_name" VARCHAR(200) NOT NULL,
  "nik" VARCHAR(20),
  "birth_place" VARCHAR(100),
  "birth_date" DATE,
  "education" VARCHAR(50),
  "occupation" VARCHAR(100),
  "phone" VARCHAR(30),
  "income_range" VARCHAR(50),
  "address" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "student_guardians_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "student_guardians_student_id_type_key" UNIQUE ("student_id", "type"),
  CONSTRAINT "student_guardians_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "siakad"."students"("id") ON DELETE CASCADE
);
