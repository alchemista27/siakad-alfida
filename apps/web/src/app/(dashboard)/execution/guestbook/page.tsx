import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export const metadata = { title: "Buku Tamu Online" };

export default async function GuestbookPage() {
  await requireRole([UserRole.super_admin, UserRole.admin_bidang]);

  const guests = await prisma.guestBookEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-primary">Rekapitulasi Kunjungan Tamu</h1>
        <p className="text-sm text-gray-500">Daftar tamu yang mengisi Buku Tamu Online melalui halaman depan.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tamu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 rounded-tl-md">Nama Lengkap</th>
                  <th className="p-3">Asal Instansi</th>
                  <th className="p-3">Keperluan</th>
                  <th className="p-3">Tanggal Kunjungan</th>
                  <th className="p-3 rounded-tr-md">Waktu Input</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {guests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      Belum ada data kunjungan tamu.
                    </td>
                  </tr>
                ) : (
                  guests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{guest.name}</td>
                      <td className="p-3 text-gray-600">{guest.institution || "-"}</td>
                      <td className="p-3 text-gray-600 max-w-xs truncate" title={guest.purpose}>
                        {guest.purpose}
                      </td>
                      <td className="p-3 text-gray-600">
                        {guest.visitDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </td>
                      <td className="p-3 text-gray-600">
                        {guest.createdAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
