import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SiakadAuthGate } from "@/components/siakad-auth-gate";

export default function HomePage() {
  return (
    <SiakadAuthGate>
      <AppShell activePath="/">
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0f7f6d]">Operasional akademik</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#454545]">Selamat datang di SIAKAD</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#454545]/75">
              Kelola informasi unit pendidikan sebagai dasar dokumen dan proses akademik yang konsisten.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-lg border border-[#E3E8E7] bg-white p-5">
              <span className="material-symbols-rounded text-[#0f7f6d]" aria-hidden="true">account_balance</span>
              <h2 className="mt-3 text-xl font-semibold text-[#454545]">Identitas unit</h2>
              <p className="mt-2 text-sm leading-6 text-[#454545]/75">
                Perbarui nama pimpinan, logo, dan tanda tangan pimpinan unit untuk kebutuhan dokumen akademik.
              </p>
              <Link href="/admin/unit-identity" className="mt-5 inline-flex items-center gap-2 rounded bg-[#0f7f6d] px-4 py-3 text-sm font-semibold text-[#F7F8F8] hover:bg-[#0b695a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f7f6d]">
                Kelola identitas unit
                <span className="material-symbols-rounded text-[18px]" aria-hidden="true">arrow_forward</span>
              </Link>
            </article>
            <article className="rounded-lg border border-[#E3E8E7] bg-white p-5">
              <span className="material-symbols-rounded text-[#0f7f6d]" aria-hidden="true">verified_user</span>
              <h2 className="mt-3 text-xl font-semibold text-[#454545]">Akses terjaga</h2>
              <p className="mt-2 text-sm leading-6 text-[#454545]/75">
                Setiap perubahan identitas ditautkan ke unit dari sesi Anda dan diperiksa kembali oleh layanan SIAKAD.
              </p>
            </article>
          </div>
        </section>
      </AppShell>
    </SiakadAuthGate>
  );
}
