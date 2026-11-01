"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PasswordMeter } from "@/components/password-meter";

interface UnitOption {
  id: string;
  name: string;
}

function isUnitOption(value: unknown): value is UnitOption {
  if (!value || typeof value !== "object") return false;
  const unit = value as Record<string, unknown>;
  return typeof unit.id === "string" && unit.id.length > 0
    && typeof unit.name === "string" && unit.name.trim().length > 0;
}

export function RegisterStaffForm() {
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [role, setRole] = useState<"guru" | "karyawan">("guru");
  const [unitId, setUnitId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [unitCatalogError, setUnitCatalogError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isAccountActive, setIsAccountActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadUnits = async () => {
      try {
        const response = await fetch("/api/auth/units", { cache: "no-store" });
        const data: unknown = response.ok ? await response.json() : null;
        if (!Array.isArray(data) || data.length === 0 || !data.every(isUnitOption)) {
          throw new Error("Daftar unit kerja belum tersedia. Silakan muat ulang halaman ini.");
        }
        if (!cancelled) {
          setUnits(data);
          setUnitId((current) => (data.some((unit) => unit.id === current) ? current : data[0].id));
        }
      } catch {
        if (!cancelled) {
          setUnits([]);
          setUnitId("");
          setUnitCatalogError("Daftar unit kerja belum tersedia. Silakan muat ulang halaman ini.");
        }
      } finally {
        if (!cancelled) setUnitsLoading(false);
      }
    };

    void loadUnits();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (unitCatalogError || !unitId) {
      setErrorMessage("Daftar unit kerja belum tersedia. Silakan muat ulang halaman ini.");
      return;
    }

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
      const res = await fetch("/api/auth/register-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          role,
          unitId,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any = null;
      if (contentType.includes("application/json")) {
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Gagal memproses pendaftaran staf.");
      }

      setIsAccountActive(!!data?.isActive);
      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan jaringan saat pendaftaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
        <div className="w-full max-w-[440px] py-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold font-heading text-primary">
              Registrasi Guru & Staf
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Pendaftaran akun pegawai baru untuk akses SIMPEG, SIAKAD, dan SIYAUM.
            </p>
          </div>

          {success ? (
            isAccountActive ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl space-y-3 shadow-sm">
                <span className="material-symbols-rounded text-[#0f7f6d] text-[48px] block mx-auto text-center">
                  check_circle
                </span>
                <h4 className="font-bold text-lg font-heading text-emerald-950 text-center">
                  Pendaftaran Berhasil & Akun Aktif!
                </h4>
                <p className="text-xs text-emerald-900 leading-relaxed text-center">
                  Akun Anda telah aktif dan dapat langsung digunakan untuk masuk ke seluruh sistem Yayasan Alfida.
                </p>
                <div className="bg-white/90 p-3 rounded border border-emerald-200/60 text-[11px] text-gray-700 space-y-1">
                  <div><strong>Nama:</strong> {fullName}</div>
                  <div><strong>Email:</strong> {email}</div>
                  <div><strong>Penugasan:</strong> {role === "guru" ? "Tenaga Pengajar (Guru)" : "Staf Karyawan"}</div>
                </div>
                <div className="pt-3 text-center">
                  <Link
                    href="/login"
                    className="px-5 py-2.5 bg-tertiary text-white rounded text-xs font-semibold inline-block hover:bg-[#0b6355] shadow-xs"
                  >
                    Masuk ke SIM-Alfida Sekarang
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl space-y-3 shadow-sm">
                <span className="material-symbols-rounded text-amber-600 text-[48px] block mx-auto text-center">
                  pending_actions
                </span>
                <h4 className="font-bold text-lg font-heading text-amber-950 text-center">
                  Pendaftaran Telah Diterima!
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed text-center">
                  Akun Anda telah berhasil dibuat namun saat ini berstatus <strong>Menunggu Persetujuan</strong> oleh Administrator Kepegawaian Yayasan Alfida sebelum dapat digunakan untuk masuk.
                </p>
                <div className="bg-white/80 p-3 rounded border border-amber-200/60 text-[11px] text-gray-600 space-y-1">
                  <div><strong>Nama:</strong> {fullName}</div>
                  <div><strong>Email:</strong> {email}</div>
                  <div><strong>Penugasan:</strong> {role === "guru" ? "Tenaga Pengajar (Guru)" : "Staf Karyawan"}</div>
                </div>
                <div className="pt-3 text-center">
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-tertiary text-white rounded text-xs font-semibold inline-block hover:bg-[#0b6355]"
                  >
                    Kembali ke Halaman Masuk
                  </Link>
                </div>
              </div>
            )
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
                {/* Tipe Staf: Radio Pill */}
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5">
                    Jenis Penugasan *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("guru")}
                      className={`py-2 px-3 rounded text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                        role === "guru"
                          ? "bg-[#0f7f6d]/10 border-tertiary text-tertiary"
                          : "border-border text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="material-symbols-rounded text-[16px]">school</span>
                      <span>Guru (Pengajar)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("karyawan")}
                      className={`py-2 px-3 rounded text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                        role === "karyawan"
                          ? "bg-[#0f7f6d]/10 border-tertiary text-tertiary"
                          : "border-border text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="material-symbols-rounded text-[16px]">engineering</span>
                      <span>Staf Karyawan</span>
                    </button>
                  </div>
                </div>

                {/* Dropdown Unit */}
                <div>
                  <label
                    htmlFor="unitId"
                    className="block text-xs font-semibold text-primary mb-1"
                  >
                    Unit Kerja Penugasan *
                  </label>
                  <select
                    id="unitId"
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-border text-primary focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] text-xs bg-white"
                    disabled={loading || unitsLoading}
                  >
                    <option value="" disabled>
                      {unitsLoading ? "Memuat unit kerja..." : "Pilih unit kerja"}
                    </option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold text-primary mb-1"
                  >
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Ustadz Abdullah, S.Pd.I"
                    className="w-full px-3 py-2 rounded border border-border text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] text-xs"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold text-primary mb-1"
                    >
                      Email Aktif *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@alfida.or.id"
                      className="w-full px-3 py-2 rounded border border-border text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] text-xs"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-semibold text-primary mb-1"
                    >
                      No. WhatsApp / HP *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3 py-2 rounded border border-border text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] text-xs"
                      disabled={loading}
                    />
                  </div>
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
                      className="text-[11px] text-tertiary hover:underline font-medium"
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
                    className="w-full px-3 py-2 rounded border border-border text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] text-xs"
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
                    className="w-full px-3 py-2 rounded border border-border text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] text-xs"
                    disabled={loading}
                  />
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200/60 rounded text-[11px] text-blue-800 flex items-start gap-2">
                  <span className="material-symbols-rounded text-blue-600 text-[16px] flex-shrink-0 mt-0.5">
                    info
                  </span>
                  <span>
                    Akun staf baru memerlukan verifikasi administratif sebelum dapat digunakan untuk login.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || unitsLoading || !unitId}
                  className="w-full py-2.5 px-4 rounded bg-tertiary hover:bg-[#0b6355] text-white font-semibold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f7f6d] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center mt-2 shadow-sm"
                >
                  {loading ? (
                    <span className="inline-flex items-center space-x-2">
                      <span className="material-symbols-rounded animate-spin text-[16px]">
                        progress_activity
                      </span>
                      <span>Mendaftarkan Staf...</span>
                    </span>
                  ) : (
                    "Daftarkan Akun Staf"
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
                  <span>Masuk ke Akun Staf</span>
                  <span className="material-symbols-rounded text-[14px]">arrow_forward</span>
                </Link>
                <div className="text-[11px] text-gray-400">
                  Orang tua calon santri?{" "}
                  <Link href="/register" className="text-gray-600 font-semibold hover:underline">
                    Daftar Akun Orang Tua di sini
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
  );
}
