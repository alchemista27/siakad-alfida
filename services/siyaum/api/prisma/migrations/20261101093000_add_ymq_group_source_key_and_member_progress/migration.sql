CREATE TYPE "YmqProgressLevel" AS ENUM ('pra_tahsin', 'tahsin', 'tahfiz');

ALTER TABLE "ymq_groups"
  ADD COLUMN "source_key" TEXT;

CREATE UNIQUE INDEX "ymq_groups_source_key_key"
  ON "ymq_groups"("source_key");

ALTER TABLE "ymq_members"
  ADD COLUMN "progress_level" "YmqProgressLevel";
