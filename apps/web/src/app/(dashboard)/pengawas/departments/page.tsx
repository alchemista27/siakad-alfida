import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

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
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-3xl text-primary">
          Laporan KPI Per Bidang
        </h1>
        <p className="text-sm text-gray-500 mt-2 font-body">
          Pilih bidang untuk melihat matriks KPI, sasaran kinerja, dan realisasi capaian program kerja.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <ModuleCard
            key={dept.id}
            title={`Laporan Bidang ${dept.name}`}
            subtitle={`Pantau progres program kerja dan ketercapaian KPI Bidang ${dept.name}.`}
            icon="domain"
            active={true}
            href={`/pengawas/department/${dept.id}`}
          />
        ))}
        {departments.length === 0 && (
          <p className="text-gray-500 italic text-sm">Belum ada data bidang terdaftar di sistem.</p>
        )}
      </div>
    </div>
  );
}
