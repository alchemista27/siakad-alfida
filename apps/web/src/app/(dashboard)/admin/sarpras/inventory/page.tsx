import React from "react";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { getInventoryItems, getInventoryStats } from "@/actions/inventory";
import { getDepartments } from "@/actions/strategic";
import { prisma } from "@/lib/prisma";
import { InventoryClient } from "./inventory-client";

export default async function SarprasInventoryPage() {
  await requireRole([UserRole.super_admin, UserRole.admin_biro, UserRole.admin_bidang]);

  const [{ items }, stats, departments, units] = await Promise.all([
    getInventoryItems().catch(() => ({ items: [] })),
    getInventoryStats().catch(() => null),
    getDepartments().catch(() => []),
    prisma.unit.findMany({ select: { id: true, name: true } }).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-primary">
          Manajemen Inventaris & Sarpras
        </h1>
        <p className="text-sm font-body text-gray-500 mt-1">
          Pencatatan, pemantauan kondisi, dan pengelolaan aset fasilitas Yayasan Alfida.
        </p>
      </div>

      <InventoryClient
        initialItems={items}
        stats={stats}
        departments={departments}
        units={units}
      />
    </div>
  );
}
