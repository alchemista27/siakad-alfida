"use server";

import { apiFetch } from "@/lib/api";

// Departments
export async function getDepartments() {
  return apiFetch("/strategic/departments", { method: "GET", cache: "no-store" });
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

export async function getMyMembers() {
  return apiFetch("/strategic/departments/my-members", { method: "GET", cache: "no-store" });
}

export async function addDepartmentMember(departmentId: string, data: { userId: string; role?: string }) {
  return apiFetch(`/strategic/departments/${departmentId}/members`, { 
    method: "POST", 
    body: JSON.stringify(data) 
  });
}

export async function removeDepartmentMember(departmentId: string, userId: string) {
  return apiFetch(`/strategic/departments/${departmentId}/members/${userId}`, { method: "DELETE" });
}

// Programs
export async function getPrograms() {
  return apiFetch("/strategic/programs", { method: "GET", cache: "no-store" });
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

// KPIs
export async function getKPIs() {
  return apiFetch("/strategic/kpis", { method: "GET", cache: "no-store" });
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
    body: JSON.stringify({ evidenceId }) 
  });
}

export async function verifyKPIBaseline(id: string, status: string, notes?: string) {
  return apiFetch(`/strategic/kpis/${id}/verify-baseline`, { 
    method: "POST", 
    body: JSON.stringify({ status, notes }) 
  });
}

// Users for PIC dropdown
export async function getStrategicUsers() {
  return apiFetch("/admin/users", { method: "GET", cache: "no-store" });
}

// Milestones
export async function getMilestones() {
  return apiFetch("/strategic/execution-milestones", { method: "GET", cache: "no-store" });
}

export async function createMilestone(data: any) {
  return apiFetch("/strategic/execution-milestones", { method: "POST", body: JSON.stringify(data) });
}

export async function updateMilestone(id: string, data: any) {
  return apiFetch(`/strategic/execution-milestones/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteMilestone(id: string) {
  return apiFetch(`/strategic/execution-milestones/${id}`, { method: "DELETE" });
}

// Tasks
export async function getTasks() {
  return apiFetch("/strategic/execution-tasks", { method: "GET", cache: "no-store" });
}

export async function createTask(data: any) {
  return apiFetch("/strategic/execution-tasks", { method: "POST", body: JSON.stringify(data) });
}

export async function updateTask(id: string, data: any) {
  return apiFetch(`/strategic/execution-tasks/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteTask(id: string) {
  return apiFetch(`/strategic/execution-tasks/${id}`, { method: "DELETE" });
}

// Logs
export async function getLogs() {
  return apiFetch("/strategic/execution-logs", { method: "GET", cache: "no-store" });
}

export async function createLog(data: any) {
  return apiFetch("/strategic/execution-logs", { method: "POST", body: JSON.stringify(data) });
}

export async function updateLog(id: string, data: any) {
  return apiFetch(`/strategic/execution-logs/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteLog(id: string) {
  return apiFetch(`/strategic/execution-logs/${id}`, { method: "DELETE" });
}

// Evidences
export async function getEvidences() {
  return apiFetch("/strategic/execution-evidences", { method: "GET", cache: "no-store" });
}

export async function createEvidence(data: any) {
  return apiFetch("/strategic/execution-evidences", { method: "POST", body: JSON.stringify(data) });
}

export async function updateEvidence(id: string, data: any) {
  return apiFetch(`/strategic/execution-evidences/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteEvidence(id: string) {
  return apiFetch(`/strategic/execution-evidences/${id}`, { method: "DELETE" });
}

// Dashboards
export async function getTrafficLightDashboard() {
  return apiFetch("/strategic/dashboard/traffic-light", { method: "GET", cache: "no-store" });
}

// --- SPRINT 42: RISK & MEETING MANAGEMENT ---

export async function getExecutionIssues(token: string) {
  const res = await fetch(`${process.env.API_URL}/strategic/execution-issues`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch execution issues");
  return res.json();
}

export async function createExecutionIssue(token: string, data: any) {
  const res = await fetch(`${process.env.API_URL}/strategic/execution-issues`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create execution issue");
  return res.json();
}

export async function getExecutionMeetings(token: string) {
  const res = await fetch(`${process.env.API_URL}/strategic/execution-meetings`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch execution meetings");
  return res.json();
}

export async function createExecutionMeeting(token: string, data: any) {
  const res = await fetch(`${process.env.API_URL}/strategic/execution-meetings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create execution meeting");
  return res.json();
}

export async function updateExecutionMeetingDecision(token: string, decisionId: string, data: any) {
  const res = await fetch(`${process.env.API_URL}/strategic/execution-meetings/decisions/${decisionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update execution meeting decision");
  return res.json();
}

// --- Sub-Department (Biro) Actions ---
export async function getMyBiros() {
  return apiFetch("/strategic/departments/my-subdepartments", { method: "GET", cache: "no-store" });
}

export async function createSubDepartment(data: { name: string; description?: string; parentId: string; adminUserId?: string }) {
  return apiFetch("/strategic/departments/subdepartment", { 
    method: "POST", 
    body: JSON.stringify(data) 
  });
}
