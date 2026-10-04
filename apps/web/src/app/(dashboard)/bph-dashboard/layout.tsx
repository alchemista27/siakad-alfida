import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";

export default async function BphDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole([UserRole.pengawas_yayasan, UserRole.super_admin]);
  return <>{children}</>;
}
