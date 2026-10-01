import Link from "next/link";
import { RegisterStaffForm } from "@/components/auth/register-staff-form";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function RegisterStaffPage() {
  const units = await prisma.unit.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="w-full flex flex-col items-center text-center">
      <h2 className="font-heading text-2xl font-bold text-primary mb-1">
        Daftar Akun Guru / Karyawan
      </h2>
      <p className="text-xs text-gray-500 mb-6">
        Lengkapi formulir pendaftaran akun untuk staf internal.
      </p>

      <RegisterStaffForm units={units} />

      <div className="mt-6 pt-4 border-t border-border w-full max-w-sm text-xs text-gray-600">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="text-tertiary font-semibold hover:underline"
        >
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
