import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SiakadAuthGate } from "@/components/siakad-auth-gate";

const steps = [
  ["01", "Tetapkan identitas", "Pastikan nama unit, pimpinan, logo, dan tanda tangan siap digunakan."],
  ["02", "Gunakan satu rujukan", "Dokumen akademik berikutnya mengambil identitas unit yang sama."],
  ["03", "Jaga konsistensi", "Perubahan selalu ditautkan ke akses unit pada sesi Anda."],
];

export default function HomePage() {
  return (
    <SiakadAuthGate>
      <AppShell activePath="/">
        <section className="space-y-7">
          <div className="grid gap-6 border-b border-[#E3E8E7] pb-7 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f7f6d]">Ruang kendali akademik</p>
              <h1 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.03em] text-[#454545] sm:text-5xl">Landasan rapi untuk setiap proses belajar.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#454545]/75">SIAKAD menjaga informasi unit sebagai rujukan yang jelas untuk administrasi, dokumen, dan ritme pembelajaran.</p>
            </div>
            <div className="border-l-2 border-[#0f7f6d] bg-[#e6f4f1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0f7f6d]">Jejak data akademik</p>
              <p className="mt-2 font-serif text-xl font-semibold text-[#454545]">Satu identitas unit, dipakai dengan konsisten.</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="border border-[#E3E8E7] bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="material-symbols-rounded text-[#0f7f6d]" aria-hidden="true">account_balance</span>
                  <h2 className="mt-4 font-serif text-2xl font-semibold text-[#454545]">Identitas unit</h2>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0f7f6d]">Basis dokumen</span>
              </div>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#454545]/75">Kelola pimpinan, logo, dan tanda tangan yang akan menjadi fondasi dokumen akademik unit.</p>
              <Link href="/admin/unit-identity" className="mt-6 inline-flex items-center gap-2 border border-[#0f7f6d] bg-[#0f7f6d] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b695a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f7f6d]">
                Buka identitas unit
                <span className="material-symbols-rounded text-[18px]" aria-hidden="true">arrow_forward</span>
              </Link>
            </article>

            <article className="border border-[#E3E8E7] bg-[#454545] p-6 text-white">
              <span className="material-symbols-rounded text-[#a7d8cc]" aria-hidden="true">verified_user</span>
              <h2 className="mt-4 font-serif text-2xl font-semibold">Akses yang bertanggung jawab</h2>
              <p className="mt-3 text-sm leading-7 text-white/75">Perubahan tidak berdiri sendiri: akses Anda dan unit terkait diperiksa ulang oleh layanan SIAKAD.</p>
            </article>
          </div>

          <section aria-labelledby="next-steps" className="border border-[#E3E8E7] bg-white">
            <div className="border-b border-[#E3E8E7] px-6 py-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0f7f6d]">Langkah awal unit</p><h2 id="next-steps" className="mt-1 font-serif text-2xl font-semibold text-[#454545]">Mulai dari informasi yang paling mendasar.</h2></div>
            <ol className="grid divide-y divide-[#E3E8E7] md:grid-cols-3 md:divide-x md:divide-y-0">
              {steps.map(([number, title, description]) => <li key={number} className="p-6"><p className="text-xs font-semibold tracking-[0.14em] text-[#0f7f6d]">{number}</p><h3 className="mt-3 text-base font-semibold text-[#454545]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#454545]/70">{description}</p></li>)}
            </ol>
          </section>
        </section>
      </AppShell>
    </SiakadAuthGate>
  );
}
