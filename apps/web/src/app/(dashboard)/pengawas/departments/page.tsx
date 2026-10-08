import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { HeatmapKPI } from "@/components/ui/heatmap-kpi";
import { AccordionDepartments } from "@/components/ui/accordion-departments";

interface ModuleCardProps {
  title: string;
  subtitle: string;
  icon: string;
  active?: boolean;
  href?: string;
}

function ModuleCard({
  title,
  subtitle,
  icon,
  active = false,
  href = "#",
}: ModuleCardProps) {
  return (
    <Card
      className={`flex flex-col justify-between p-6 transition-all ${
        active
          ? "border-tertiary shadow-sm hover:shadow-md"
          : "opacity-75 bg-neutral/50 border-border"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              active ? "bg-teal-50 text-tertiary" : "bg-gray-100 text-gray-400"
            }`}
          >
            <Icon name={icon} className="text-2xl" />
          </div>
          {active ? (
            <Badge variant="teal">AKTIF</Badge>
          ) : (
            <Badge variant="gray">Segera Hadir</Badge>
          )}
        </div>
        <h3 className="font-heading font-bold text-lg text-primary mb-1">
          {title}
        </h3>
        <p className="text-xs text-gray-500 mb-6">{subtitle}</p>
      </div>

      <div>
        {active ? (
          <Link
            href={href}
            className="w-full py-2.5 px-4 bg-tertiary text-on-tertiary rounded text-xs font-semibold flex items-center justify-center gap-2 hover:bg-tertiary/90 transition-colors"
          >
            <span>Buka Laporan</span>
            <Icon name="arrow_forward" className="text-sm" />
          </Link>
        ) : (
          <button
            disabled
            className="w-full py-2.5 px-4 bg-gray-200 text-gray-400 rounded text-xs font-semibold cursor-not-allowed"
          >
            Belum Tersedia
          </button>
        )}
      </div>
    </Card>
  );
}

export default async function PengawasDepartmentsPage() {
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
        <h1 className="font-heading font-bold text-3xl text-primary">
          Laporan KPI Per Bidang & Biro
        </h1>
        <p className="text-sm text-gray-500 mt-2 font-body">
          Pantau progres sasaran strategis yayasan secara menyeluruh melalui ringkasan di bawah ini.
        </p>
      </div>

      <HeatmapKPI departments={departments} />

      <h3 className="font-heading font-bold text-xl text-primary mt-8 mb-4">Rincian Laporan Departemen</h3>
      
      {departments.length === 0 ? (
        <p className="text-gray-500 italic text-sm">Belum ada data bidang terdaftar di sistem.</p>
      ) : (
        <AccordionDepartments departments={departments} />
      )}
    </div>
  );
}
