import { apiFetch } from "@/lib/api";

export type WorkflowResourceType = "work_program" | "kpi" | "realization_log" | "evidence" | "issue";
export type WorkflowStatus =
  | "draft"
  | "submitted_to_biro"
  | "accepted_by_biro"
  | "revision_requested_by_biro"
  | "submitted_to_bidang"
  | "revision_requested_by_bidang"
  | "approved_by_bidang";

export interface WorkflowResource {
  id: string;
  departmentId?: string | null;
  workflowStatus?: WorkflowStatus | string | null;
  submittedAt?: string | null;
  reviewDueAt?: string | null;
  lastReviewedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  title?: string;
  name?: string;
  description?: string | null;
  program?: { id: string; title: string; department?: { id: string; name: string } } | null;
  department?: { id: string; name: string } | null;
  [key: string]: unknown;
}

export interface StrategicNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  href?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface ExecutiveInterventionInput {
  departmentId: string;
  recipientId: string;
  message: string;
  resourceType?: WorkflowResourceType;
  resourceId?: string;
}

export interface ExecutiveIntervention {
  id: string;
  departmentId: string;
  recipientId: string;
  message: string;
  status: "open" | "acknowledged" | "resolved" | string;
  resourceType?: WorkflowResourceType | null;
  resourceId?: string | null;
  createdAt: string;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
}

export interface AttentionQueue {
  overdue_pic_tasks: Array<Record<string, unknown>>;
  overdue_biro_reviews: WorkflowResource[];
  overdue_bidang_reviews: WorkflowResource[];
  open_interventions: ExecutiveIntervention[];
}

export interface DepartmentMember {
  userId?: string;
  departmentId?: string;
  user: { id: string; fullName: string; email?: string | null; username?: string | null };
  department?: { id: string; name: string };
  role?: string | null;
}

export interface ScopedBureau {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  parentId?: string | null;
  admins?: Array<{
    user: { id: string; fullName: string; email?: string | null };
    createdAt?: string | null;
  }>;
  members?: Array<{ user: { id: string; fullName: string } }>;
}

// -------------------------------------------------------------
// 1. Departemen & Struktur Organisasi
// -------------------------------------------------------------
export async function getDepartments() {
  return apiFetch("/strategic/departments", { method: "GET" });
}

export async function createDepartment(data: unknown) {
  return apiFetch("/strategic/departments", { method: "POST", body: JSON.stringify(data) });
}

export async function updateDepartment(id: string, data: unknown) {
  return apiFetch(`/strategic/departments/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteDepartment(id: string) {
  return apiFetch(`/strategic/departments/${id}`, { method: "DELETE" });
}

export async function getDepartmentOverview() {
  return apiFetch("/strategic/departments/overview", { method: "GET" });
}

export async function getMyMembers(): Promise<DepartmentMember[]> {
  return apiFetch("/strategic/departments/my-members", { method: "GET" });
}

export async function getMySubdepartments(): Promise<ScopedBureau[]> {
  return apiFetch("/strategic/departments/my-subdepartments", { method: "GET" });
}

export async function createBureau(
  bidangId: string,
  data: { name: string; code: string; description?: string; adminUserId: string },
): Promise<ScopedBureau> {
  return apiFetch(`/strategic/departments/${bidangId}/bureaus`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function assignBureauAdmin(biroId: string, userId: string) {
  return apiFetch(`/strategic/departments/${biroId}/admins`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function removeBureauAdmin(biroId: string, userId: string) {
  return apiFetch(`/strategic/departments/${biroId}/admins/${userId}`, { method: "DELETE" });
}

export async function addDepartmentMember(departmentId: string, data: { userId: string; role?: string }) {
  return apiFetch(`/strategic/departments/${departmentId}/members`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function removeDepartmentMember(departmentId: string, userId: string) {
  return apiFetch(`/strategic/departments/${departmentId}/members/${userId}`, { method: "DELETE" });
}

// -------------------------------------------------------------
// 2. Program Kerja (Work Programs)
// -------------------------------------------------------------
export async function getPrograms(departmentId?: string) {
  const query = departmentId ? `?departmentId=${departmentId}` : "";
  return apiFetch(`/strategic/programs${query}`, { method: "GET" });
}

export async function getProgramById(id: string) {
  return apiFetch(`/strategic/programs/${id}`, { method: "GET" });
}

export async function createProgram(data: unknown) {
  return apiFetch("/strategic/programs", { method: "POST", body: JSON.stringify(data) });
}

export async function updateProgram(id: string, data: unknown) {
  return apiFetch(`/strategic/programs/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteProgram(id: string) {
  return apiFetch(`/strategic/programs/${id}`, { method: "DELETE" });
}

export async function batchImportProgramsAction(programs: unknown[]) {
  return apiFetch("/strategic/programs/batch-import", {
    method: "POST",
    body: JSON.stringify({ programs }),
  });
}

// -------------------------------------------------------------
// 3. Matriks Capaian KPI & Baseline
// -------------------------------------------------------------
export async function getKPIs(programId?: string) {
  const query = programId ? `?programId=${programId}` : "";
  return apiFetch(`/strategic/kpis${query}`, { method: "GET" });
}

export async function getKPIById(id: string) {
  return apiFetch(`/strategic/kpis/${id}`, { method: "GET" });
}

export async function createKPI(data: unknown) {
  return apiFetch("/strategic/kpis", { method: "POST", body: JSON.stringify(data) });
}

export async function updateKPI(id: string, data: unknown) {
  return apiFetch(`/strategic/kpis/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteKPI(id: string) {
  return apiFetch(`/strategic/kpis/${id}`, { method: "DELETE" });
}

export async function submitKPIBaseline(id: string, evidenceId: string) {
  return apiFetch(`/strategic/kpis/${id}/submit-baseline`, {
    method: "POST",
    body: JSON.stringify({ evidenceId }),
  });
}

export async function verifyKPIBaseline(id: string, status: string, notes?: string) {
  return apiFetch(`/strategic/kpis/${id}/verify-baseline`, {
    method: "POST",
    body: JSON.stringify({ status, notes }),
  });
}

export async function batchImportKpisAction(kpis: unknown[]) {
  return apiFetch("/strategic/kpis/batch-import", {
    method: "POST",
    body: JSON.stringify({ kpis }),
  });
}

// -------------------------------------------------------------
// 4. Rapat, Notulensi & Action Items
// -------------------------------------------------------------
export async function getMeetings() {
  return apiFetch("/strategic/execution-meetings", { method: "GET" });
}

export async function createMeeting(data: unknown) {
  return apiFetch("/strategic/execution-meetings", { method: "POST", body: JSON.stringify(data) });
}

export async function updateMeeting(id: string, data: unknown) {
  return apiFetch(`/strategic/execution-meetings/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteMeeting(id: string) {
  return apiFetch(`/strategic/execution-meetings/${id}`, { method: "DELETE" });
}

export async function getActionItems() {
  return apiFetch("/strategic/execution-action-items", { method: "GET" });
}

export async function getMyExecutionTasks() {
  return apiFetch("/strategic/execution-tasks/me", { method: "GET" });
}

/** Backend-owned, record-scoped action-item feed for the current user. */
export async function getMyActionItems() {
  return apiFetch("/strategic/execution-action-items/me", { method: "GET" });
}

export async function getExecutionTasks() {
  return apiFetch("/strategic/execution-tasks", { method: "GET" });
}

export async function createActionItem(data: unknown) {
  return apiFetch("/strategic/execution-action-items", { method: "POST", body: JSON.stringify(data) });
}

export async function updateActionItemStatus(id: string, data: unknown) {
  return apiFetch(`/strategic/execution-action-items/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// -------------------------------------------------------------
// 5. Kendala, Bukti, & Realisasi
// -------------------------------------------------------------
export async function getIssues() {
  return apiFetch("/strategic/execution-issues", { method: "GET" });
}

export async function createIssue(data: unknown) {
  return apiFetch("/strategic/execution-issues", { method: "POST", body: JSON.stringify(data) });
}

export async function updateIssue(id: string, data: unknown) {
  return apiFetch(`/strategic/execution-issues/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteIssue(id: string) {
  return apiFetch(`/strategic/execution-issues/${id}`, { method: "DELETE" });
}

export async function getEvidences() {
  return apiFetch("/strategic/execution-evidences", { method: "GET" });
}

export async function createEvidence(data: unknown) {
  return apiFetch("/strategic/execution-evidences", { method: "POST", body: JSON.stringify(data) });
}

export async function getLogs() {
  return apiFetch("/strategic/execution-logs", { method: "GET" });
}

export async function createLog(data: unknown) {
  return apiFetch("/strategic/execution-logs", { method: "POST", body: JSON.stringify(data) });
}

// -------------------------------------------------------------
// 6. Workflow, notifications, and executive monitoring
// -------------------------------------------------------------
export async function transitionWorkflow(
  resourceType: WorkflowResourceType,
  resourceId: string,
  toStatus: WorkflowStatus,
  notes?: string,
): Promise<WorkflowResource> {
  return apiFetch(`/strategic/workflow/${resourceType}/${resourceId}/transition`, {
    method: "POST",
    body: JSON.stringify({ toStatus, notes }),
  });
}

export async function getNotifications(unreadOnly = true): Promise<StrategicNotification[]> {
  return apiFetch(`/strategic/notifications${unreadOnly ? "?unreadOnly=true" : ""}`, { method: "GET" });
}

export async function markNotificationRead(id: string): Promise<StrategicNotification> {
  return apiFetch(`/strategic/notifications/${id}/read`, { method: "POST" });
}

export async function getAttentionQueue(): Promise<AttentionQueue> {
  return apiFetch("/strategic/executive/attention-queue", { method: "GET" });
}

export async function createExecutiveIntervention(
  data: ExecutiveInterventionInput,
): Promise<ExecutiveIntervention> {
  return apiFetch("/strategic/executive/interventions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function acknowledgeExecutiveIntervention(id: string): Promise<ExecutiveIntervention> {
  return apiFetch(`/strategic/executive/interventions/${id}/acknowledge`, { method: "POST" });
}

export async function resolveExecutiveIntervention(id: string): Promise<ExecutiveIntervention> {
  return apiFetch(`/strategic/executive/interventions/${id}/resolve`, { method: "POST" });
}

// -------------------------------------------------------------
// 7. Dasbor Eksekutif & Traffic Light
// -------------------------------------------------------------
export async function getDashboardSummary() {
  return apiFetch("/strategic/dashboard/summary", { method: "GET" });
}

export async function getTrafficLightDashboard() {
  return apiFetch("/strategic/dashboard/traffic-light", { method: "GET" });
}

export async function getProgressPerDepartment(academicYearId?: string) {
  const query = academicYearId ? `?academicYearId=${academicYearId}` : "";
  return apiFetch(`/strategic/dashboard/progress${query}`, { method: "GET" });
}

export async function getBureauRankings(academicYearId?: string) {
  const query = academicYearId ? `?academicYearId=${academicYearId}` : "";
  return apiFetch(`/strategic/dashboard/rankings${query}`, { method: "GET" });
}

export async function getKpiStats(departmentId?: string) {
  const query = departmentId ? `?departmentId=${departmentId}` : "";
  return apiFetch(`/strategic/dashboard/kpi${query}`, { method: "GET" });
}
