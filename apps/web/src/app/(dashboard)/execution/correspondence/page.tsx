import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { getCorrespondences, getMyDispositions } from "@/actions/secretariat";
import { CorrespondenceClient } from "./client";

export const metadata = { title: "Surat Menyurat & Disposisi" };

export default async function CorrespondencePage() {
  await requireRole([UserRole.super_admin, UserRole.admin_bidang, UserRole.pengawas_yayasan]);

  const [correspondences, myDispositions] = await Promise.all([
    getCorrespondences(),
    getMyDispositions()
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-primary">Surat Menyurat & Disposisi</h1>
        <p className="text-sm text-gray-500">Modul pengelolaan surat masuk, surat keluar, dan status penugasan.</p>
      </div>

      <CorrespondenceClient 
        correspondences={correspondences} 
        myDispositions={myDispositions} 
      />
    </div>
  );
}
