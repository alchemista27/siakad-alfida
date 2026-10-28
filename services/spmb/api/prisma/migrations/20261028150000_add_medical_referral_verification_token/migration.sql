ALTER TABLE "medical_referrals"
  ADD COLUMN IF NOT EXISTS "verification_token" VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS "medical_referrals_verification_token_key"
  ON "medical_referrals" ("verification_token");
