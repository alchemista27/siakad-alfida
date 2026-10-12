import React from "react";
import { prisma } from "@/lib/prisma";
import { HeatmapKPI } from "@/components/ui/heatmap-kpi";
import { AccordionDepartments } from "@/components/ui/accordion-departments";

export default async function PimpinanDepartmentsPage() {
  const departments = await prisma.department.findMany({
    where: { parentId: null },
    include: {
      workPrograms: {
        include: { kpis: true }
      },
      children: {
        include: {
          workPrograms: { include: { kpis: true } }
        },
        orderBy: { name: "asc" }
      }
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold mb-2">
          Portal Pimpinan Yayasan
        </div>
        <h1 className="font-heading font-bold text-3xl text-primary">
          Evaluasi & Arahan Kinerja Bidang
        </h1>
        <p className="text-sm text-gray-500 mt-2 font-body">
          Pantau capaian KPI serta berikan penilaian, arahan, dan instruksi strategis untuk masing-masing bidang dan biro.
        </p>
      </div>

      <HeatmapKPI departments={departments} basePath="/pimpinan/department" />

      <h3 className="font-heading font-bold text-xl text-primary mt-8 mb-4">
        Daftar Bidang & Biro
      </h3>
      
      {departments.length === 0 ? (
        <p className="text-gray-500 italic text-sm">Belum ada data bidang terdaftar di sistem.</p>
      ) : (
        <AccordionDepartments departments={departments} basePath="/pimpinan/department" />
      )}
    </div>
  );
}
