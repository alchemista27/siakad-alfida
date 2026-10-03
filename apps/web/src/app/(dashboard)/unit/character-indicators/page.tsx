import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { getCurrentUser } from "@/actions/user";
import { CharacterIndicatorsClient } from "./indicators-client";

export const metadata = {
  title: "Manajemen Indikator Karakter BPI | SIM-Alfida",
};

export default async function UnitCharacterIndicatorsPage() {
  await requireRole([UserRole.admin_unit, UserRole.super_admin]);
  const user = await getCurrentUser();
  
  if (!user) return <div>Unauthorized</div>;

  // Find admin's units
  const adminUnits = await prisma.userRoleAssignment.findMany({
    where: { 
      userId: user.id,
      role: { in: ["admin_unit", "super_admin"] }
    },
    include: {
      unit: true
    }
  });

  const unitIds = adminUnits.map(a => a.unitId).filter(Boolean) as string[];

  let units = [];
  if (user.roles.some((r:any) => r.role === "super_admin")) {
    units = await prisma.unit.findMany({
      where: { level: { notIn: ['kantor_yayasan', 'non_pendidikan'] } }
    });
  } else {
    units = await prisma.unit.findMany({
      where: { id: { in: unitIds } }
    });
  }

  if (units.length === 0) {
    return <div className="p-6">Anda tidak memiliki akses ke unit pendidikan manapun.</div>;
  }

  const indicators = await prisma.characterIndicator.findMany({
    where: { unitId: { in: units.map(u => u.id) } },
    include: { unit: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Indikator Karakter</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola indikator penilaian karakter (BPI) untuk setiap unit.</p>
      </div>

      <CharacterIndicatorsClient 
        units={units}
        indicators={indicators}
      />
    </div>
  );
}
