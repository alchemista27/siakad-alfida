"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { revalidatePath } from "next/cache";

export async function updateDepartmentInstruction(departmentId: string, notes: string) {
  await requireRole([UserRole.pimpinan_yayasan, UserRole.super_admin]);

  await prisma.department.update({
    where: { id: departmentId },
    data: { notes },
  });

  revalidatePath(`/pimpinan/department/${departmentId}`);
  revalidatePath(`/pengawas/department/${departmentId}`);
  revalidatePath("/pimpinan/departments");
  return { success: true };
}
