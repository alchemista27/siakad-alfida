import { SpmbNavbar } from "@/components/SpmbNavbar";

const parentPortalUrl = "https://spmb.alfida.or.id/parent";

export default function RegisterInfoPage() {
  return (
    <div className="min-h-screen bg-neutral text-primary font-body">
      <SpmbNavbar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-wider text-tertiary uppercase">Akun Orang Tua</p>
          <h1 className="font-heading font-bold text-3xl mt-2">Pendaftaran SPMB dilakukan melalui Portal Orang Tua</h1>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            Akun orang tua diperlukan agar data anak, bukti pembayaran, berkas persyaratan, hasil kesehatan,
            jadwal observasi, dan pengumuman tetap terhubung dalam satu proses PPDB yang aman.
          </p>

          <ol className="mt-6 space-y-3 text-sm text-gray-700">
            <li className="flex gap-3"><span className="w-6 h-6 shrink-0 rounded-full bg-[#e6f4f1] text-tertiary text-xs font-bold inline-flex items-center justify-center">1</span><span>Buat akun orang tua pada Alfida ID, atau masuk jika sudah memiliki akun.</span></li>
            <li className="flex gap-3"><span className="w-6 h-6 shrink-0 rounded-full bg-[#e6f4f1] text-tertiary text-xs font-bold inline-flex items-center justify-center">2</span><span>Pilih unit dan gelombang PPDB pada Portal Orang Tua.</span></li>
            <li className="flex gap-3"><span className="w-6 h-6 shrink-0 rounded-full bg-[#e6f4f1] text-tertiary text-xs font-bold inline-flex items-center justify-center">3</span><span>Ikuti tahapan pembayaran, biodata, berkas, kesehatan, observasi, hingga keputusan.</span></li>
          </ol>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a href="https://auth.alfida.or.id/register" className="inline-flex justify-center items-center px-4 py-2 bg-tertiary text-white hover:bg-[#0b6355] rounded-sm text-sm font-semibold">Buat Akun Orang Tua</a>
            <a href={`https://auth.alfida.or.id/login?return_to=${encodeURIComponent(parentPortalUrl)}`} className="inline-flex justify-center items-center px-4 py-2 border border-tertiary text-tertiary hover:bg-[#e6f4f1] rounded-sm text-sm font-semibold">Masuk ke Portal PPDB</a>
          </div>
        </section>
      </main>
    </div>
  );
}
