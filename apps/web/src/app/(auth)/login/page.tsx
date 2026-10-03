import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Icon } from "@/components/ui/icon";

export default function LoginPage() {
  return (
    <div className="w-full flex flex-col items-center text-center">
      <h2 className="font-heading text-2xl font-bold text-primary mb-1">
        Masuk ke SIM Alfida
      </h2>
      <p className="text-xs text-gray-500 mb-6">
        Sistem Informasi dan Manajemen Yayasan Alfida
      </p>

      <LoginForm />

      <div className="w-full max-w-sm mt-4">
        <Link 
          href="/guestbook" 
          className="w-full flex items-center justify-center p-2 rounded-md border border-border bg-white text-sm font-medium text-primary hover:bg-gray-50 transition-colors"
        >
          <Icon name="menu_book" className="text-lg mr-2" />
          Isi Buku Tamu Online
        </Link>
      </div>

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
