"use server";

import { apiFetch } from "@/lib/api";

export async function getInventoryItems(params?: { search?: string; category?: string; condition?: string; departmentId?: string; unitId?: string }) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  if (params?.condition) query.set("condition", params.condition);
  if (params?.departmentId) query.set("departmentId", params.departmentId);
  if (params?.unitId) query.set("unitId", params.unitId);

  const qs = query.toString();
  return apiFetch(`/inventory${qs ? `?${qs}` : ""}`, { method: "GET", cache: "no-store" });
}

export async function getInventoryStats() {
  return apiFetch("/inventory/stats", { method: "GET", cache: "no-store" });
}

export async function getInventoryItem(id: string) {
  return apiFetch(`/inventory/${id}`, { method: "GET", cache: "no-store" });
}

export async function createInventoryItem(data: any) {
  return apiFetch("/inventory", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateInventoryItem(id: string, data: any) {
  return apiFetch(`/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteInventoryItem(id: string) {
  return apiFetch(`/inventory/${id}`, {
    method: "DELETE",
  });
}
