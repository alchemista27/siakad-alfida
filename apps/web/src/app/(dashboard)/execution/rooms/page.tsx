import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Jadwal & Penggunaan Ruangan" };

export default async function RoomsPage() {
  await requireRole([UserRole.super_admin, UserRole.admin_bidang]);

  const rooms = await prisma.facilityRoom.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-primary">Jadwal & Penggunaan Ruangan</h1>
        <p className="text-sm text-gray-500">Daftar ruangan rapat/diklat dan kalender penggunaannya.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {rooms.map((room) => (
          <Card key={room.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="material-symbols-outlined text-primary">meeting_room</span>
                {room.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 flex flex-col gap-1">
                <div className="flex justify-between border-b border-border pb-1">
                  <span>Kapasitas:</span>
                  <span className="font-semibold text-gray-900">{room.capacity} Orang</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Lokasi:</span>
                  <span className="font-medium text-gray-900">{room.location || "-"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white p-8 rounded-xl shadow border border-border text-center">
        <span className="material-symbols-outlined text-5xl text-gray-400 mb-2">calendar_month</span>
        <h3 className="text-lg font-semibold">Sistem Peminjaman (Segera Hadir)</h3>
        <p className="text-gray-500 max-w-md mx-auto mt-2">
          Fitur untuk melakukan booking ruangan dan melihat ketersediaan jadwal secara real-time masih dalam tahap pengembangan.
        </p>
      </div>
    </div>
  );
}
