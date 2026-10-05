import { prisma } from "./prisma";

export async function getActiveAcademicYears() {
  const allYears = await prisma.academicYear.findMany({
    orderBy: { startDate: 'desc' }
  });
  
  const activeYears = [];
  const seenUnits = new Set<string>();
  
  for (const year of allYears) {
    if (!seenUnits.has(year.unitId)) {
      seenUnits.add(year.unitId);
      activeYears.push(year);
    }
  }
  
  return activeYears;
}
