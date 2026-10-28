export type UnitCategory = "pendidikan" | "nondik";

export interface OrganizationUnit {
  id: string;
  name: string;
  code: string;
  category: UnitCategory;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  principalName?: string | null;
  isActive: boolean;
}

export interface OrganizationDepartment {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
}

export interface OrganizationEmployee {
  id: string;
  fullName: string;
  email?: string | null;
  isActive?: boolean;
}

export interface UnitAdminAssignment {
  id: string;
  userId: string;
  app: "siakad" | "spmb" | "simpeg";
  role: string;
  isActive?: boolean;
  user?: OrganizationEmployee;
}

export interface DepartmentAdminAssignment {
  id: string;
  userId: string;
  role: string;
  isActive?: boolean;
  user?: OrganizationEmployee;
}

export function responseMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const message = (payload as { message?: unknown }).message;
  if (Array.isArray(message)) return message.join(" ");
  return typeof message === "string" && message.trim() ? message : fallback;
}
