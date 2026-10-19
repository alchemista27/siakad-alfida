CREATE SCHEMA IF NOT EXISTS "siskeu";

CREATE TABLE "siskeu"."spp_invoices" (
  "id" UUID NOT NULL,
  "unit_id" UUID NOT NULL,
  "academic_year_id" UUID NOT NULL,
  "enrollment_id" UUID NOT NULL,
  "student_name" VARCHAR(160) NOT NULL,
  "billing_period" VARCHAR(7) NOT NULL,
  "reference" VARCHAR(80) NOT NULL,
  "description" VARCHAR(300) NOT NULL,
  "amount" DECIMAL(15,0) NOT NULL,
  "currency" CHAR(3) NOT NULL DEFAULT 'IDR',
  "due_date" DATE NOT NULL,
  "status" VARCHAR(16) NOT NULL DEFAULT 'unpaid',
  "payment_provider_reference" VARCHAR(200),
  "paid_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "spp_invoices_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "spp_invoices_reference_key" UNIQUE ("reference"),
  CONSTRAINT "spp_invoices_enrollment_id_billing_period_key" UNIQUE ("enrollment_id", "billing_period"),
  CONSTRAINT "spp_invoices_payment_provider_reference_key" UNIQUE ("payment_provider_reference"),
  CONSTRAINT "spp_invoices_amount_check" CHECK ("amount" > 0),
  CONSTRAINT "spp_invoices_currency_check" CHECK ("currency" = 'IDR'),
  CONSTRAINT "spp_invoices_status_check" CHECK ("status" IN ('unpaid', 'pending', 'paid', 'overdue', 'cancelled')),
  CONSTRAINT "spp_invoices_paid_state_check" CHECK (("status" = 'paid' AND "paid_at" IS NOT NULL AND "payment_provider_reference" IS NOT NULL) OR ("status" <> 'paid' AND "paid_at" IS NULL))
);

CREATE INDEX "spp_invoices_enrollment_id_status_idx"
  ON "siskeu"."spp_invoices" ("enrollment_id", "status");

CREATE INDEX "spp_invoices_unit_id_academic_year_id_billing_period_idx"
  ON "siskeu"."spp_invoices" ("unit_id", "academic_year_id", "billing_period");
