import { prisma } from "@/lib/prisma";
import { SupervisorClient } from "./supervisor-client";
import { UnitLevel } from "@sim/database";

export const metadata = {
  title: "Dasbor Supervisor Kesiswaan | SIM-Alfida",
};

export default async function SupervisorPage() {
  const units = await prisma.unit.findMany({
    where: { 
      level: { notIn: [UnitLevel.kantor_yayasan, UnitLevel.non_pendidikan] }
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-primary">
          Dasbor Supervisor Kesiswaan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau statistik akademik, kehadiran, dan penilaian karakter BPI siswa di setiap unit pendidikan.
        </p>
      </div>
      
      <SupervisorClient units={units} />
    </div>
  );
}
