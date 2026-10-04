"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { apiFetch } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePassword(password: string) {
  throw new Error("Pembaruan password lewat Better Auth harus menggunakan old password, belum diimplementasikan di UI");
}

export async function updateEmail(email: string, currentPassword?: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  
  await apiFetch("/auth/update-email", {
    method: "POST",
    body: JSON.stringify({ email: email.toLowerCase(), password: currentPassword })
  });
  
  return { success: true };
}

export async function activateParentFeature() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  
  const existingRole = await prisma.userRoleAssignment.findFirst({
    where: { userId: session.user.id, role: "orang_tua" }
  });

  if (!existingRole) {
    await prisma.userRoleAssignment.create({
      data: {
        userId: session.user.id,
        role: "orang_tua"
      }
    });
  }
  
  revalidatePath("/profile");
  revalidatePath("/modules");
  return { success: true };
}
