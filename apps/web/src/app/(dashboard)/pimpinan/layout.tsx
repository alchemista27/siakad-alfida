import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";

export default async function PimpinanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole([UserRole.pimpinan_yayasan, UserRole.super_admin]);
  return <>{children}</>;
}
