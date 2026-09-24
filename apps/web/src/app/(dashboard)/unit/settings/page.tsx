import React from "react";
import { UnitSettingsForm } from "@/components/unit/unit-settings-form";
import { requireRole } from "@/lib/auth-guard";
import { resolveUnitId } from "@/lib/unit-context";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@sim/database";

export default async function UnitSettingsPage() {
  await requireRole([UserRole.admin_unit, UserRole.super_admin]);
  const unitId = await resolveUnitId();

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { unitSettings: true },
  });

  if (!unit) {
    return (
      <div className="p-8 text-center text-gray-500">Unit tidak ditemukan.</div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs text-tertiary font-semibold uppercase tracking-wider mb-1">
          Admin Unit
        </p>
        <h1 className="font-heading font-bold text-2xl text-primary">
          Settings Unit
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola profil kepala sekolah, logo, dan informasi pembayaran unit pendidikan Anda.
        </p>
      </div>

      <UnitSettingsForm
        unitId={unitId}
        unitName={unit.name}
        unitLevel={unit.level}
        defaultValues={{
          principalName: unit.unitSettings?.principalName ?? "",
          principalNip: unit.unitSettings?.principalNip ?? "",
          registrationFee: unit.unitSettings?.registrationFee ?? 250000,
          bankName: unit.unitSettings?.bankName ?? "",
          bankAccountNumber: unit.unitSettings?.bankAccountNumber ?? "",
          bankAccountHolder: unit.unitSettings?.bankAccountHolder ?? "",
        }}
        logoUrl={unit.unitSettings?.logoUrl ?? undefined}
        signatureUrl={unit.unitSettings?.principalSignatureUrl ?? undefined}
      />
    </div>
  );
}
