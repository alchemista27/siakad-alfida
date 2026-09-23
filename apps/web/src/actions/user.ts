"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { apiFetch } from "@/lib/api";

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user) return null;

  try {
    const { prisma } = await import("@/lib/prisma");
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { roles: true }
    });
    
    return {
      ...user,
      name: dbUser?.fullName || user.name || user.email?.split("@")[0],
      fullName: dbUser?.fullName,
      roles: dbUser?.roles && dbUser.roles.length > 0 ? dbUser.roles : [{ role: "orang_tua" }]
    };
  } catch (error) {
    console.error("Failed to fetch user roles from database:", error);
    return {
      ...user,
      name: user.name || user.email?.split("@")[0],
      roles: [{ role: "orang_tua" }]
    };
  }
}
