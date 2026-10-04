import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { ReactNode } from "react";

export default async function SupervisorLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole([UserRole.admin_bidang, UserRole.super_admin]);
  return <>{children}</>;
}
