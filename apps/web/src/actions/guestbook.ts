"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitGuestbook(data: { name: string; institution?: string; purpose: string }) {
  if (!data.name || !data.purpose) {
    return { success: false, error: "Nama dan keperluan wajib diisi" };
  }

  try {
    await prisma.guestBookEntry.create({
      data: {
        name: data.name,
        institution: data.institution || null,
        purpose: data.purpose,
        visitDate: new Date(),
      }
    });
    
    revalidatePath("/execution/guestbook");
    return { success: true };
  } catch (error) {
    console.error("Guestbook error:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}
