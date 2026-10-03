"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./user";
import { revalidatePath } from "next/cache";

export async function createCharacterIndicator(unitId: string, name: string, description: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Validate user is admin of this unit

  await prisma.characterIndicator.create({
    data: {
      unitId,
      name,
      description
    }
  });

  revalidatePath("/unit/character-indicators");
}

export async function deleteCharacterIndicator(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.characterIndicator.delete({
    where: { id }
  });

  revalidatePath("/unit/character-indicators");
}
