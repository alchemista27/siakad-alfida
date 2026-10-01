import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="w-full flex flex-col items-center text-center">
      <h2 className="font-heading text-2xl font-bold text-primary mb-1">
        Masuk ke SIM Alfida
      </h2>
      <p className="text-xs text-gray-500 mb-6">
        Sistem Informasi Manajemen Terpadu Yayasan Alfida
      </p>

      <LoginForm />

      <div className="mt-6 pt-4 border-t border-border w-full max-w-sm text-xs text-gray-600 flex flex-col gap-2">
        <div>
          Belum punya akun orang tua?{" "}
          <Link
            href="/register"
            className="text-tertiary font-semibold hover:underline"
          >
            Daftar di sini
          </Link>
        </div>
        <div>
          Pegawai / Guru baru?{" "}
          <Link
            href="/register-staff"
            className="text-tertiary font-semibold hover:underline"
          >
            Daftar akun pegawai
          </Link>
        </div>
      </div>
    </div>
  );
}
