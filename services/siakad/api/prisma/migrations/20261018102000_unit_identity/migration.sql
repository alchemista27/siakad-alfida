ALTER TABLE "siakad"."unit_projections"
  ADD COLUMN "category" VARCHAR(30) NOT NULL DEFAULT 'unknown',
  ADD COLUMN "source_updated_at" TIMESTAMPTZ;

CREATE TABLE "siakad"."unit_identities" (
  "unit_id" UUID NOT NULL,
  "logo_url" TEXT,
  "principal_name" VARCHAR(150),
  "principal_signature_url" TEXT,
  "updated_by_user_id" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "unit_identities_pkey" PRIMARY KEY ("unit_id"),
  CONSTRAINT "unit_identities_unit_id_fkey"
    FOREIGN KEY ("unit_id")
    REFERENCES "siakad"."unit_projections"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE INDEX "unit_projections_category_status_idx"
  ON "siakad"."unit_projections" ("category", "status");
