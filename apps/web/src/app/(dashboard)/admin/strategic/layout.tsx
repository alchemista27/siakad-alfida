import { getCurrentUser } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function StrategicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const roles = user?.roles || [];
  const isSuperAdmin = roles.some((r: any) => r.role === "super_admin");
  const isAdminKepegawaian = roles.some((r: any) => r.role === "admin_bidang");

  if (!isSuperAdmin && !isAdminKepegawaian) {
    redirect("/modules");
  }

  return <>{children}</>;
}
