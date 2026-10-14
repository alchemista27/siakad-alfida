"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordMeter } from "@/components/password-meter";

export default function RegisterParentPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMessage("Semua kolom bertanda bintang (*) wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Kata sandi minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any = null;
      if (contentType.includes("application/json")) {
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Gagal memproses pendaftaran akun.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?registered=parent");
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan jaringan saat pendaftaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full font-body">
      {/* Panel Kiri: Gradien Branding Toska (40% di desktop) */}
      <div className="w-full md:w-[40%] bg-gradient-to-br from-[#0f7f6d] to-[#06bfa2] text-white flex flex-col justify-center items-center p-8 md:p-14 text-center shadow-inner">
        <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-6 shadow-md border border-white/20">
          <span className="material-symbols-rounded text-white text-[38px] select-none">
            family_restroom
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-heading tracking-tight mb-3">
          SIM-Alfida
        </h1>
        <p className="text-sm md:text-base text-white/90 max-w-xs font-normal leading-relaxed">
          Pendaftaran Akun Terpadu Orang Tua & Wali Santri Yayasan Alfida
        </p>
      </div>

      {/* Panel Kanan: Form Pendaftaran Putih Bersih (60% di desktop) */}
      <div className="w-full md:w-[60%] bg-white flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-[420px] py-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold font-heading text-primary">
              Daftar Akun Orang Tua
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Akun ini digunakan untuk Penerimaan Santri Baru (SPMB) dan memantau perkembangan nilai (SIAKAD).
            </p>
          </div>

          {success ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center space-y-3 shadow-sm">
              <span className="material-symbols-rounded text-emerald-600 text-[48px] block mx-auto">
                check_circle
              </span>
              <h4 className="font-bold text-lg font-heading text-emerald-950">
                Pendaftaran Berhasil!
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Akun orang tua Anda telah aktif dan siap digunakan. Mengalihkan ke halaman masuk dalam beberapa detik...
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="px-4 py-2 bg-tertiary text-white rounded text-xs font-semibold inline-block hover:bg-[#0b6355]"
                >
                  Masuk Sekarang
                </Link>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-5 p-3.5 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2"
                >
                  <span className="material-symbols-rounded text-red-600 text-[18px] flex-shrink-0">
                    error
                  </span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold text-primary mb-1"
                  >
                    Nama Lengkap Orang Tua / Wali *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sesuai KTP (Contoh: Ahmad Fauzi)"
                    className="w-full px-3.5 py-2.5 rounded border border-border text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] text-sm"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-primary mb-1"
                  >
                    Alamat Email Aktif *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-3.5 py-2.5 rounded border border-border text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] text-sm"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold text-primary mb-1"
                  >
                    Nomor WhatsApp / HP Aktif *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-2.5 rounded border border-border text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] text-sm"
                    disabled={loading}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-primary"
                    >
                      Kata Sandi *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-tertiary hover:underline font-medium"
                    >
                      {showPassword ? "Sembunyikan" : "Tampilkan"}
                    </button>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full px-3.5 py-2.5 rounded border border-border text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] text-sm"
                    disabled={loading}
                  />
                  <PasswordMeter password={password} />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold text-primary mb-1"
                  >
                    Konfirmasi Kata Sandi *
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full px-3.5 py-2.5 rounded border border-border text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] text-sm"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded bg-tertiary hover:bg-[#0b6355] text-white font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f7f6d] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center mt-2 shadow-sm"
                >
                  {loading ? (
                    <span className="inline-flex items-center space-x-2">
                      <span className="material-symbols-rounded animate-spin text-[18px]">
                        progress_activity
                      </span>
                      <span>Mendaftarkan Akun...</span>
                    </span>
                  ) : (
                    "Daftar Akun Sekarang"
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400">Sudah memiliki akun?</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-tertiary hover:underline inline-flex items-center gap-1"
                >
                  <span>Masuk ke Akun Terdaftar</span>
                  <span className="material-symbols-rounded text-[14px]">arrow_forward</span>
                </Link>
                <div className="text-[11px] text-gray-400">
                  Guru atau Staf Karyawan baru?{" "}
                  <Link href="/register-staff" className="text-gray-600 font-semibold hover:underline">
                    Daftar di sini
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
