import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { BpiSiswaClient } from "./bpi-siswa-client";

export const metadata = {
  title: "Catatan BPI Siswa | SIM-Alfida",
};

export default async function TeacherBpiSiswaPage() {
  await requireRole([UserRole.guru]);
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  
  if (!user) return <div>Unauthorized</div>;
  const { getActiveAcademicYears } = await import("@/lib/academic-year");
  const activeYears = await getActiveAcademicYears();

  if (activeYears.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="p-6 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg">
          Tidak ada Tahun Ajaran aktif.
        </div>
      </div>
    );
  }
  const activeYearIds = activeYears.map(y => y.id);
  const activeYearNames = Array.from(new Set(activeYears.map(y => y.name))).join(', ');


  // Get homeroom assignments
  const homerooms = await prisma.homeroomAssignment.findMany({
    where: { 
      teacherId: user.id,
      academicYearId: { in: activeYearIds },
    },
    include: {
      class: true,
    }
  });

  const classIds = homerooms.map(h => h.classId);
  const students = await prisma.studentEnrollment.findMany({
    where: {
      academicYearId: { in: activeYearIds },
      classId: { in: classIds },
      status: 'active',
    },
    include: {
      studentData: {
        select: { id: true, fullName: true, nisn: true }
      },
      class: {
        select: { id: true, name: true }
      }
    },
    orderBy: { studentData: { fullName: 'asc' } }
  });

  // Get recent BPI Reports for these classes
  const recentBpiReports = await prisma.studentBpiReport.findMany({
    where: {
      enrollment: {
        academicYearId: { in: activeYearIds },
        classId: { in: classIds }
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
    orderBy: { date: 'desc' },
    take: 20
  });

  const formattedReports = recentBpiReports.map(i => ({
    id: i.id,
    date: i.date,
    activity: i.activity,
    notes: i.notes,
    studentName: i.enrollment.studentData.fullName,
    className: i.enrollment.class.name
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Laporan BPI Siswa</h1>
        <p className="text-sm text-gray-500 mt-1">Sebagai Wali Kelas (Tahun Ajaran: {activeYearNames})</p>
      </div>

      <BpiSiswaClient 
        homerooms={homerooms}
        students={students}
        recentReports={formattedReports}
      />
    </div>
  );
}
