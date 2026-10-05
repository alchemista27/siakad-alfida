import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CharacterAssessmentsClient } from "./character-client";

export const metadata = {
  title: "Penilaian Karakter BPI | SIM-Alfida",
};

export default async function TeacherCharacterAssessmentsPage() {
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
        select: { id: true, name: true, unitId: true }
      }
    },
    orderBy: { studentData: { fullName: 'asc' } }
  });

  // Get indicators for these units
  const unitIds = [...new Set(homerooms.map(h => h.class.unitId))];
  const indicators = await prisma.characterIndicator.findMany({
    where: {
      unitId: { in: unitIds }
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Penilaian Karakter Harian</h1>
        <p className="text-sm text-gray-500 mt-1">Sebagai Wali Kelas (Tahun Ajaran: {activeYear.name})</p>
      </div>

      <CharacterAssessmentsClient 
        homerooms={homerooms}
        students={students}
        indicators={indicators}
      />
    </div>
  );
}
