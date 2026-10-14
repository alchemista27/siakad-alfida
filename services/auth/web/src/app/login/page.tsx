"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!emailOrUsername.trim()) {
      setErrorMessage("Silakan masukkan email atau username");
      return;
    }

    if (!password) {
      setErrorMessage("Silakan masukkan password akun Anda");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailOrUsername, password }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any = null;

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        if (!res.ok) {
          throw new Error(
            "Layanan backend sedang tidak dapat diakses atau sedang memulai ulang. Silakan coba beberapa saat lagi."
          );
        }
      }

      if (!res.ok) {
        throw new Error(data?.message || "Email atau password tidak cocok");
      }

      // Periksa parameter redirect
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get("callbackUrl") || urlParams.get("return_to");

      if (callbackUrl && (callbackUrl.startsWith("http://") || callbackUrl.startsWith("https://"))) {
        window.location.href = callbackUrl;
      } else if (callbackUrl && callbackUrl.startsWith("/")) {
        router.push(callbackUrl);
      } else {
        // Arahkan ke portal modul terpadu
        router.push("/modules");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses login");
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
            hub
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-heading tracking-tight mb-3">
          SIM-Alfida
        </h1>
        <p className="text-sm md:text-base text-white/90 max-w-xs font-normal leading-relaxed">
          Sistem Informasi Manajemen Terpadu Yayasan Alfida
        </p>
      </div>

      {/* Panel Kanan: Form Login Putih Bersih (60% di desktop) */}
      <div className="w-full md:w-[60%] bg-white flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-6">
            <h2 className="text-2xl font-bold font-heading text-primary">
              Masuk ke SIM-Alfida
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Gunakan email atau username SSO Anda untuk masuk
            </p>
          </div>

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
                htmlFor="emailOrUsername"
                className="block text-xs font-semibold text-primary mb-1.5"
              >
                Email atau Username
              </label>
              <input
                id="emailOrUsername"
                type="text"
                required
                autoComplete="username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="nama@alfida.or.id atau username"
                className="w-full px-3.5 py-2.5 rounded border border-border text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] focus:border-[#0f7f6d] transition-colors text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-primary"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  className="w-full px-3.5 py-2.5 pr-10 rounded border border-border text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] focus:border-[#0f7f6d] transition-colors text-sm"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center justify-center focus:outline-none"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  <span className="material-symbols-rounded text-[20px] select-none">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded bg-tertiary hover:bg-[#0b6355] text-white font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f7f6d] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center mt-2"
            >
              {loading ? (
                <span className="inline-flex items-center space-x-2">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span>Sedang Memproses...</span>
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400">Belum punya akun?</span>
            </div>
          </div>

          <div className="text-center space-y-3">
            <a
              href="https://spmb.alfida.or.id/register"
              className="text-xs font-semibold text-tertiary hover:underline inline-flex items-center gap-1"
            >
              <span>Pendaftaran Murid Baru (SPMB)</span>
              <span className="material-symbols-rounded text-[14px]">arrow_forward</span>
            </a>
            <div className="text-[11px] text-gray-400">
              Karyawan atau Guru belum memiliki akun? Hubungi Admin Kepegawaian.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
