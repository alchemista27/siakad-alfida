-- Durable compensation records make failed Auth role revocations recoverable.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ;
UPDATE "users" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;

DO $$ BEGIN
  CREATE TYPE "AuthRoleCompensationScope" AS ENUM ('unit', 'department');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AuthRoleCompensationStatus" AS ENUM ('armed', 'pending', 'processing', 'delivered', 'failed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "auth_role_compensations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "local_assignment_id" UUID NOT NULL UNIQUE,
  "scope" "AuthRoleCompensationScope" NOT NULL,
  "user_id" UUID NOT NULL,
  "scope_id" UUID NOT NULL,
  "app" VARCHAR(30) NOT NULL,
  "role" VARCHAR(50) NOT NULL,
  "requested_by_id" UUID,
  "auth_assignment_id" UUID,
  "idempotency_key" VARCHAR(220) NOT NULL UNIQUE,
  "status" "AuthRoleCompensationStatus" NOT NULL DEFAULT 'armed',
  "attempt_count" INTEGER NOT NULL DEFAULT 0,
  "last_error" TEXT,
  "available_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "delivered_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "auth_role_compensations_status_available_at_idx"
  ON "auth_role_compensations" ("status", "available_at");
