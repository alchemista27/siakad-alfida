-- Additive only: legacy records deliberately retain their current workflow meaning.
CREATE TYPE "DepartmentSource" AS ENUM ('simpeg', 'simakin_legacy');
CREATE TYPE "StrategicWorkflowStatus" AS ENUM ('draft', 'submitted_to_biro', 'revision_requested_by_biro', 'accepted_by_biro', 'submitted_to_bidang', 'revision_requested_by_bidang', 'approved_by_bidang');
CREATE TYPE "StrategicResourceType" AS ENUM ('work_program', 'kpi', 'realization_log', 'evidence', 'issue');
CREATE TYPE "StrategicWorkflowAction" AS ENUM ('created', 'submitted', 'accepted', 'approved', 'revision_requested', 'resubmitted');
CREATE TYPE "ExecutiveInterventionStatus" AS ENUM ('open', 'acknowledged', 'resolved');

ALTER TABLE "users" ADD COLUMN "synced_at" TIMESTAMPTZ;
ALTER TABLE "departments" ADD COLUMN "code" VARCHAR(50), ADD COLUMN "source" "DepartmentSource" NOT NULL DEFAULT 'simakin_legacy', ADD COLUMN "source_updated_at" TIMESTAMPTZ, ADD COLUMN "archived_at" TIMESTAMPTZ;
CREATE UNIQUE INDEX "departments_code_key" ON "departments" ("code");
ALTER TABLE "work_programs" ADD COLUMN "workflow_status" "StrategicWorkflowStatus" NOT NULL DEFAULT 'draft', ADD COLUMN "submitted_at" TIMESTAMPTZ, ADD COLUMN "review_due_at" TIMESTAMPTZ, ADD COLUMN "last_reviewed_at" TIMESTAMPTZ;
ALTER TABLE "execution_kpis" ADD COLUMN "workflow_status" "StrategicWorkflowStatus" NOT NULL DEFAULT 'draft', ADD COLUMN "submitted_at" TIMESTAMPTZ, ADD COLUMN "review_due_at" TIMESTAMPTZ, ADD COLUMN "last_reviewed_at" TIMESTAMPTZ;
ALTER TABLE "execution_realization_logs" ADD COLUMN "department_id" UUID, ADD COLUMN "workflow_status" "StrategicWorkflowStatus" NOT NULL DEFAULT 'draft', ADD COLUMN "submitted_at" TIMESTAMPTZ, ADD COLUMN "review_due_at" TIMESTAMPTZ, ADD COLUMN "last_reviewed_at" TIMESTAMPTZ;
ALTER TABLE "execution_evidences" ADD COLUMN "department_id" UUID, ADD COLUMN "workflow_status" "StrategicWorkflowStatus" NOT NULL DEFAULT 'draft', ADD COLUMN "submitted_at" TIMESTAMPTZ, ADD COLUMN "review_due_at" TIMESTAMPTZ, ADD COLUMN "last_reviewed_at" TIMESTAMPTZ;
ALTER TABLE "execution_issues" ADD COLUMN "department_id" UUID, ADD COLUMN "workflow_status" "StrategicWorkflowStatus" NOT NULL DEFAULT 'draft', ADD COLUMN "submitted_at" TIMESTAMPTZ, ADD COLUMN "review_due_at" TIMESTAMPTZ, ADD COLUMN "last_reviewed_at" TIMESTAMPTZ;

CREATE TABLE "strategic_workflow_events" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "resource_type" "StrategicResourceType" NOT NULL, "resource_id" UUID NOT NULL, "department_id" UUID NOT NULL, "action" "StrategicWorkflowAction" NOT NULL, "from_status" "StrategicWorkflowStatus", "to_status" "StrategicWorkflowStatus" NOT NULL, "notes" TEXT, "actor_id" UUID NOT NULL, "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "strategic_workflow_events_resource_type_resource_id_created_at_idx" ON "strategic_workflow_events" ("resource_type", "resource_id", "created_at");
CREATE INDEX "strategic_workflow_events_department_id_to_status_idx" ON "strategic_workflow_events" ("department_id", "to_status");
CREATE TABLE "executive_interventions" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "department_id" UUID NOT NULL, "resource_type" "StrategicResourceType", "resource_id" UUID, "recipient_id" UUID NOT NULL, "issued_by_id" UUID NOT NULL, "message" TEXT NOT NULL, "status" "ExecutiveInterventionStatus" NOT NULL DEFAULT 'open', "acknowledged_at" TIMESTAMPTZ, "resolved_at" TIMESTAMPTZ, "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "executive_interventions_recipient_id_status_idx" ON "executive_interventions" ("recipient_id", "status");
CREATE INDEX "executive_interventions_department_id_status_idx" ON "executive_interventions" ("department_id", "status");
CREATE TABLE "strategic_notifications" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "user_id" UUID NOT NULL, "type" VARCHAR(80) NOT NULL, "title" VARCHAR(255) NOT NULL, "body" TEXT NOT NULL, "href" TEXT, "read_at" TIMESTAMPTZ, "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "strategic_notifications_user_id_read_at_created_at_idx" ON "strategic_notifications" ("user_id", "read_at", "created_at");

-- Backfill workflow states only after a reviewed, data-specific migration decision.
