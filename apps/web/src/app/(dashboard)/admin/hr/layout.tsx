import { getCurrentUser } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function HrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const roles = user?.roles || [];
  const isSuperAdmin = roles.some((r: any) => r.role === "super_admin");
  const isAdminBidang = roles.some((r: any) => r.role === "admin_bidang");
  const isAdminUnit = roles.some((r: any) => r.role === "admin_unit" || r.role === "admin_unit_nondik");

  if (!isSuperAdmin && !isAdminBidang && !isAdminUnit) {
    redirect("/modules");
  }

  return <>{children}</>;
}
