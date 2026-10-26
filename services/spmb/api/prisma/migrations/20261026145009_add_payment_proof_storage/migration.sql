-- Preserve legacy proof_url records while adding private object metadata for new payment-proof uploads.
ALTER TABLE "payments"
  ADD COLUMN "proof_object_key" TEXT,
  ADD COLUMN "proof_file_name" VARCHAR(255),
  ADD COLUMN "proof_file_size" INTEGER,
  ADD COLUMN "proof_mime_type" VARCHAR(100);
