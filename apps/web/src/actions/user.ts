"use server";

import { cache } from "react";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const getCurrentUser = cache(async () => {
  try {
    // 1. Dapatkan validasi sesi langsung dari Better Auth server engine
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.session || !session.user) return null;

    // 2. Fetch data roles secara utuh dari Prisma berdasarkan ID user yang dijamin valid
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        roles: {
          include: { unit: true }
        }
      }
    });

    if (!dbUser) return null;

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.fullName || dbUser.email?.split("@")[0],
      fullName: dbUser.fullName,
      roles: dbUser.roles && dbUser.roles.length > 0 ? dbUser.roles : [{ role: "orang_tua" }]
    };
  } catch (error) {
    return null;
  }
});

export async function forceClearCookies() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete("better-auth.session_token");
  cookieStore.delete("__Secure-better-auth.session_token");
}
