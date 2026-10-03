"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./user";

export async function getUnitStats(unitId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  const isSuperAdmin = user.roles.some((r: any) => r.role === "super_admin");
  const isSupervisor = user.roles.some((r: any) => r.role === "supervisor_kesiswaan");

  if (!isSuperAdmin && !isSupervisor) {
    throw new Error("Forbidden");
  }

  // Get active academic year for this unit
  const activeYear = await prisma.academicYear.findFirst({
    where: { unitId },
    orderBy: { startDate: 'desc' }
  });

  if (!activeYear) {
    return {
      totalStudents: 0,
      totalInfractions: 0,
      avgCharacterScore: 0,
      recentBpiReports: []
    };
  }

  // Count active students in this unit
  const totalStudents = await prisma.studentEnrollment.count({
    where: {
      academicYearId: activeYear.id,
      status: "active",
      class: { unitId }
    }
  });

  // Get infractions in the last 30 days for this unit
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const totalInfractions = await prisma.studentInfraction.count({
    where: {
      date: { gte: thirtyDaysAgo },
      enrollment: {
        academicYearId: activeYear.id,
        class: { unitId }
      }
    }
  });

  // Calculate average character score
  const characterStats = await prisma.studentCharacterAssessment.aggregate({
    _avg: { score: true },
    where: {
      enrollment: {
        academicYearId: activeYear.id,
        class: { unitId }
      }
    }
  });
  const avgCharacterScore = characterStats._avg.score || 0;

  // Get recent BPI Reports
  const recentBpiReportsRaw = await prisma.studentBpiReport.findMany({
    where: {
      enrollment: {
        academicYearId: activeYear.id,
        class: { unitId }
      }
    },
    include: {
      enrollment: {
        include: {
          studentData: true,
          class: true
        }
      }
    },
    orderBy: { date: "desc" },
    take: 5
  });

  const recentBpiReports = recentBpiReportsRaw.map(r => ({
    id: r.id,
    date: r.date,
    activity: r.activity,
    notes: r.notes,
    studentName: r.enrollment.studentData.fullName,
    className: r.enrollment.class.name
  }));

  return {
    totalStudents,
    totalInfractions,
    avgCharacterScore,
    recentBpiReports
  };
}
