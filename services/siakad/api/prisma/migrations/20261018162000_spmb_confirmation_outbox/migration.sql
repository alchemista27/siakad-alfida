CREATE TABLE "siakad"."spmb_confirmation_outbox" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "enrollment_id" UUID NOT NULL,
  "source_registration_id" UUID NOT NULL,
  "academic_year_id" UUID NOT NULL,
  "class_id" UUID NOT NULL,
  "idempotency_key" VARCHAR(180) NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "available_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leased_until" TIMESTAMPTZ,
  "lease_token" VARCHAR(100),
  "last_error" TEXT,
  "delivered_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "spmb_confirmation_outbox_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "spmb_confirmation_outbox_enrollment_id_key" UNIQUE ("enrollment_id"),
  CONSTRAINT "spmb_confirmation_outbox_idempotency_key_key" UNIQUE ("idempotency_key"),
  CONSTRAINT "spmb_confirmation_outbox_status_check" CHECK ("status" IN ('pending', 'delivering', 'delivered')),
  CONSTRAINT "spmb_confirmation_outbox_enrollment_id_fkey"
    FOREIGN KEY ("enrollment_id") REFERENCES "siakad"."enrollments"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "spmb_confirmation_outbox_status_available_at_idx"
  ON "siakad"."spmb_confirmation_outbox"("status", "available_at");

CREATE INDEX "spmb_confirmation_outbox_source_registration_id_idx"
  ON "siakad"."spmb_confirmation_outbox"("source_registration_id");
