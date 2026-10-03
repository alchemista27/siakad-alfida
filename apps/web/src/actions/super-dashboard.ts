"use server";

import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { apiFetch } from "@/lib/api";

export async function getBpiOverview() {
  await requireRole([UserRole.super_admin]);
  return apiFetch("/bpi/mutabaah-stats?start=2000-01-01T00:00:00Z&end=2100-01-01T00:00:00Z");
}

export async function getDepartmentOverview() {
  await requireRole([UserRole.super_admin]);
  return apiFetch("/strategic/departments/overview");
}

export async function getAttendanceOverview() {
  await requireRole([UserRole.super_admin]);
  return apiFetch("/hr/attendance-overview");
}
