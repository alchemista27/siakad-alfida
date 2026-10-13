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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Email atau password tidak cocok");
      }

      // Periksa parameter redirect
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get("callbackUrl") || urlParams.get("return_to");

      if (callbackUrl && (callbackUrl.startsWith("http://") || callbackUrl.startsWith("https://"))) {
        window.location.href = callbackUrl;
      } else if (callbackUrl && callbackUrl.startsWith("/")) {
        router.push(callbackUrl);
      } else {
        // Cek peran untuk pengalihan modul default
        const roles = data.user?.roles || [];
        const isSuperAdmin = roles.some((r: any) => r.role === "super_admin");
        if (isSuperAdmin) {
          router.push("/admin/users");
        } else {
          window.location.href = "https://sim.alfida.or.id";
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mb-4 font-bold text-2xl border border-emerald-100">
            A
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Alfida ID
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Masuk ke Layanan Terpadu Yayasan Alfida
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start space-x-2"
          >
            <span className="font-semibold text-red-800">Perhatian:</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="emailOrUsername"
              className="block text-sm font-medium text-gray-700 mb-1.5"
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
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors sm:text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium focus:outline-none focus:underline"
              >
                {showPassword ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password Anda"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors sm:text-sm"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
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
              "Masuk ke Akun"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
          Masalah login akun? Hubungi administrator kepegawaian yayasan.
        </div>
      </div>
    </div>
  );
}
