import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";

export const metadata = { title: "Surat Menyurat" };

export default async function CorrespondencePage() {
  await requireRole([UserRole.super_admin, UserRole.admin_bidang]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-primary">Surat Menyurat (Kesekretariatan)</h1>
        <p className="text-sm text-gray-500">Modul pengelolaan surat masuk dan keluar (Dalam pengembangan).</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow border border-border text-center">
        <span className="material-symbols-outlined text-5xl text-gray-400 mb-2">construction</span>
        <h3 className="text-lg font-semibold">Fitur Sedang Dibangun</h3>
        <p className="text-gray-500 max-w-md mx-auto mt-2">
          Fitur pencatatan dan disposisi surat masuk serta surat keluar masih dalam tahap pengembangan.
        </p>
      </div>
    </div>
  );
}
