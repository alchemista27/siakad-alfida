"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./user";
import { revalidatePath } from "next/cache";

export async function addInfraction(enrollmentId: string, description: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.studentInfraction.create({
    data: {
      enrollmentId,
      teacherId: user.id,
      description,
      date: new Date()
    }
  });

  revalidatePath("/teacher/infractions");
}

export async function addCharacterAssessment(
  assessments: { enrollmentId: string; indicatorId: string; score: number; notes: string }[]
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const date = new Date();

  // Create all assessments
  await prisma.$transaction(
    assessments.map(a => 
      prisma.studentCharacterAssessment.create({
        data: {
          enrollmentId: a.enrollmentId,
          indicatorId: a.indicatorId,
          teacherId: user.id,
          score: a.score,
          notes: a.notes,
          date
        }
      })
    )
  );

  revalidatePath("/teacher/character-assessments");
}

export async function addBpiReport(enrollmentId: string, activity: string, notes: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.studentBpiReport.create({
    data: {
      enrollmentId,
      teacherId: user.id,
      activity,
      notes,
      date: new Date()
    }
  });

  revalidatePath("/teacher/bpi-siswa");
}
