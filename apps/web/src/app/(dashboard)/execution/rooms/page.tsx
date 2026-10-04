import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { getRooms, getRoomBookings } from "@/actions/secretariat";
import { RoomsClient } from "./client";

export const metadata = { title: "Peminjaman Ruangan" };

export default async function RoomsPage() {
  await requireRole([UserRole.super_admin, UserRole.admin_bidang, UserRole.pengawas_yayasan, UserRole.karyawan, UserRole.guru]);

  const [rooms, bookings] = await Promise.all([
    getRooms(),
    getRoomBookings("", "")
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-primary">Fasilitas & Peminjaman Ruangan</h1>
        <p className="text-sm text-gray-500">Cek ketersediaan dan booking ruangan untuk kegiatan unit atau rapat yayasan.</p>
      </div>

      <RoomsClient rooms={rooms} bookings={bookings} />
    </div>
  );
}
