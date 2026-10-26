CREATE TABLE IF NOT EXISTS "admission_period_counters" (
  "period_id" UUID NOT NULL,
  "next_sequence" INTEGER NOT NULL DEFAULT 1,
  "intake_reserved" INTEGER NOT NULL DEFAULT 0,
  "accepted_count" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "admission_period_counters_pkey" PRIMARY KEY ("period_id"),
  CONSTRAINT "admission_period_counters_period_id_fkey"
    FOREIGN KEY ("period_id") REFERENCES "admission_periods"("id") ON DELETE CASCADE
);

INSERT INTO "admission_period_counters" (
  "period_id",
  "next_sequence",
  "intake_reserved",
  "accepted_count"
)
SELECT
  p."id",
  COALESCE(MAX((regexp_match(r."registration_number", '([0-9]+)$'))[1]::INTEGER), 0) + 1,
  COUNT(r."id")::INTEGER,
  COUNT(r."id") FILTER (WHERE r."status" IN ('accepted', 'enrolled'))::INTEGER
FROM "admission_periods" AS p
LEFT JOIN "registrations" AS r ON r."period_id" = p."id"
GROUP BY p."id"
ON CONFLICT ("period_id") DO NOTHING;
