DO $$
BEGIN
  CREATE TYPE "DossierReviewStatus" AS ENUM ('pending', 'approved', 'revision_required');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "admission_periods"
  ADD COLUMN IF NOT EXISTS "source_academic_year_id" UUID;

ALTER TABLE "registrations"
  ADD COLUMN IF NOT EXISTS "dossier_review_status" "DossierReviewStatus" NOT NULL DEFAULT 'pending';
