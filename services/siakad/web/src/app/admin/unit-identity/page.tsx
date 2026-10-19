import { AppShell } from "@/components/app-shell";
import { SiakadAuthGate } from "@/components/siakad-auth-gate";
import { UnitIdentityForm } from "@/components/unit-identity-form";

export default function UnitIdentityPage() {
  return (
    <SiakadAuthGate>
      <AppShell activePath="/admin/unit-identity">
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0f7f6d]">Administrasi unit</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#454545]">Identitas unit pendidikan</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#454545]/75">
              Perbarui informasi pimpinan dan aset visual yang dipakai dalam dokumen akademik. Akses unit ditentukan oleh sesi Anda.
            </p>
          </div>
          <UnitIdentityForm />
        </section>
      </AppShell>
    </SiakadAuthGate>
  );
}
