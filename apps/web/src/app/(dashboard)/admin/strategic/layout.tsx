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
  const isPengawas = roles.some((r: any) => r.role === "pengawas_yayasan");
  const isAdminBiro = roles.some((r: any) => r.role === "admin_biro");

  if (!isSuperAdmin && !isAdminKepegawaian && !isPengawas && !isAdminBiro) {
    redirect("/modules");
  }

  return <>{children}</>;
}
