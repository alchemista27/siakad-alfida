import { apiFetch } from "@/lib/api";

// -------------------------------------------------------------
// 1. Departemen & Struktur Organisasi
// -------------------------------------------------------------
export async function getDepartments() {
  return apiFetch("/strategic/departments", { method: "GET" });
}

export async function createDepartment(data: any) {
  return apiFetch("/strategic/departments", { method: "POST", body: JSON.stringify(data) });
}

export async function updateDepartment(id: string, data: any) {
  return apiFetch(`/strategic/departments/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteDepartment(id: string) {
  return apiFetch(`/strategic/departments/${id}`, { method: "DELETE" });
}

export async function getDepartmentOverview() {
  return apiFetch("/strategic/departments/overview", { method: "GET" });
}

export async function getMyMembers() {
  return apiFetch("/strategic/departments/my-members", { method: "GET" });
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

export async function createProgram(data: any) {
  return apiFetch("/strategic/programs", { method: "POST", body: JSON.stringify(data) });
}

export async function updateProgram(id: string, data: any) {
  return apiFetch(`/strategic/programs/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteProgram(id: string) {
  return apiFetch(`/strategic/programs/${id}`, { method: "DELETE" });
}

export async function batchImportProgramsAction(programs: any[]) {
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

export async function createKPI(data: any) {
  return apiFetch("/strategic/kpis", { method: "POST", body: JSON.stringify(data) });
}

export async function updateKPI(id: string, data: any) {
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

export async function batchImportKpisAction(kpis: any[]) {
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

export async function createMeeting(data: any) {
  return apiFetch("/strategic/execution-meetings", { method: "POST", body: JSON.stringify(data) });
}

export async function updateMeeting(id: string, data: any) {
  return apiFetch(`/strategic/execution-meetings/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteMeeting(id: string) {
  return apiFetch(`/strategic/execution-meetings/${id}`, { method: "DELETE" });
}

export async function getActionItems() {
  return apiFetch("/strategic/execution-action-items", { method: "GET" });
}

export async function createActionItem(data: any) {
  return apiFetch("/strategic/execution-action-items", { method: "POST", body: JSON.stringify(data) });
}

export async function updateActionItemStatus(id: string, data: any) {
  return apiFetch(`/strategic/execution-action-items/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// -------------------------------------------------------------
// 5. Kendala & Masalah (Issues)
// -------------------------------------------------------------
export async function getIssues() {
  return apiFetch("/strategic/execution-issues", { method: "GET" });
}

export async function createIssue(data: any) {
  return apiFetch("/strategic/execution-issues", { method: "POST", body: JSON.stringify(data) });
}

export async function updateIssue(id: string, data: any) {
  return apiFetch(`/strategic/execution-issues/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteIssue(id: string) {
  return apiFetch(`/strategic/execution-issues/${id}`, { method: "DELETE" });
}

// -------------------------------------------------------------
// 6. Bukti Dukung (Evidence) & Log Realisasi
// -------------------------------------------------------------
export async function getEvidences() {
  return apiFetch("/strategic/execution-evidences", { method: "GET" });
}

export async function createEvidence(data: any) {
  return apiFetch("/strategic/execution-evidences", { method: "POST", body: JSON.stringify(data) });
}

export async function getLogs() {
  return apiFetch("/strategic/execution-logs", { method: "GET" });
}

export async function createLog(data: any) {
  return apiFetch("/strategic/execution-logs", { method: "POST", body: JSON.stringify(data) });
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

export async function getKpiStats(departmentId?: string) {
  const query = departmentId ? `?departmentId=${departmentId}` : "";
  return apiFetch(`/strategic/dashboard/kpi${query}`, { method: "GET" });
}
