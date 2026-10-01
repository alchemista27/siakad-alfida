"use server";

import { cache } from "react";
import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api";

export const getCurrentUser = cache(async () => {
  try {
    const dbUser = await apiFetch("/auth/me");
    if (!dbUser) return null;

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.fullName || dbUser.email?.split("@")[0],
      fullName: dbUser.fullName,
      roles: dbUser.roles || [{ role: "orang_tua" }]
    };
  } catch (error) {
    // Abaikan log error agar terminal bersih saat token kedaluwarsa/belum login
    return null;
  }
});

export async function forceClearCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("better-auth.session_token");
  cookieStore.delete("__Secure-better-auth.session_token");
}
