-- Ownership links for staff-created task artifacts. Existing records remain nullable.
ALTER TABLE "execution_realization_logs" ADD COLUMN "task_id" UUID;
ALTER TABLE "execution_issues" ADD COLUMN "task_id" UUID;

ALTER TABLE "execution_realization_logs"
  ADD CONSTRAINT "execution_realization_logs_task_id_fkey"
  FOREIGN KEY ("task_id") REFERENCES "execution_tasks"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "execution_issues"
  ADD CONSTRAINT "execution_issues_task_id_fkey"
  FOREIGN KEY ("task_id") REFERENCES "execution_tasks"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "execution_realization_logs_task_id_idx" ON "execution_realization_logs"("task_id");
CREATE INDEX "execution_issues_task_id_idx" ON "execution_issues"("task_id");
