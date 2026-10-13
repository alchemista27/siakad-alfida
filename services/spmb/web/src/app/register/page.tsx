"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SpmbNavbar } from "@/components/SpmbNavbar";

interface Period {
  id: string;
  unitName: string;
  unitSlug: string;
  label: string;
  fee: number;
  bankName: string | null;
  bankNumber: string | null;
  bankHolder: string | null;
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultPeriodId = searchParams.get("periodId") || "";

  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState(defaultPeriodId);
  const [loadingPeriods, setLoadingPeriods] = useState(true);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [nisn, setNisn] = useState("");
  const [address, setAddress] = useState("");

  const [fatherName, setFatherName] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");
  const [fatherNik, setFatherNik] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");

  const [motherName, setMotherName] = useState("");
  const [motherPhone, setMotherPhone] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    registrationNumber: string;
    unitName: string;
    fee: number;
    bankName: string | null;
    bankNumber: string | null;
    bankHolder: string | null;
  } | null>(null);

  useEffect(() => {
    async function loadPeriods() {
      try {
        const res = await fetch("/api/periods/active");
        if (res.ok) {
          const data = await res.json();
          setPeriods(data);
          if (!selectedPeriodId && data.length > 0) {
            setSelectedPeriodId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Gagal memuat periode", err);
      } finally {
        setLoadingPeriods(false);
      }
    }
    loadPeriods();
  }, [selectedPeriodId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriodId) {
      setError("Silakan pilih unit/periode pendaftaran terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Inisiasi pendaftaran online
      const regRes = await fetch("/api/registrations/online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodId: selectedPeriodId }),
      });

      if (regRes.status === 401) {
        // Arahkan ke SSO
        const returnUrl = window.location.href;
        window.location.href = `https://auth.alfida.or.id/login?callbackUrl=${encodeURIComponent(returnUrl)}`;
        return;
      }

      if (!regRes.ok) {
        const errJson = await regRes.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal membuat pendaftaran.");
      }

      const regData = await regRes.json();
      const regId = regData.id;

      // 2. Simpan biodata siswa
      await fetch(`/api/registrations/${regId}/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          nickname: nickname || undefined,
          gender,
          birthPlace,
          birthDate,
          nisn: nisn || undefined,
          address,
        }),
      });

      // 3. Simpan data orang tua
      await fetch(`/api/registrations/${regId}/parent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          father: fatherName
            ? {
                fullName: fatherName,
                phone: fatherPhone || undefined,
                nik: fatherNik || undefined,
                occupation: fatherOccupation || undefined,
              }
            : undefined,
          mother: motherName
            ? {
                fullName: motherName,
                phone: motherPhone || undefined,
                occupation: motherOccupation || undefined,
              }
            : undefined,
        }),
      });

      const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);
      setSuccessResult({
        registrationNumber: regData.registrationNumber,
        unitName: selectedPeriod?.unitName || "Unit Alfida",
        fee: Number(selectedPeriod?.fee || 0),
        bankName: selectedPeriod?.bankName || null,
        bankNumber: selectedPeriod?.bankNumber || null,
        bankHolder: selectedPeriod?.bankHolder || null,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F8]">
      <SpmbNavbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10">
        {successResult ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md text-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-gray-900">Pendaftaran Berhasil Dikirim!</h1>
            <p className="text-sm text-gray-600 mt-2">
              Terima kasih telah mendaftar di {successResult.unitName}. Simpan nomor registrasi Anda di bawah ini:
            </p>

            <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-xl max-w-sm mx-auto">
              <span className="text-xs text-teal-700 font-bold uppercase tracking-wider block">
                Nomor Pendaftaran Resmi
              </span>
              <div className="text-2xl font-black text-[#0f7f6d] tracking-wider mt-1">
                {successResult.registrationNumber}
              </div>
            </div>

            {successResult.fee > 0 && (
              <div className="mt-6 p-5 bg-gray-50 border border-gray-200 rounded-xl text-left text-xs max-w-md mx-auto space-y-2">
                <div className="font-bold text-gray-900 text-sm mb-1">Instruksi Pembayaran Biaya SPMB:</div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jumlah Biaya:</span>
                  <span className="font-bold text-gray-900">
                    Rp {successResult.fee.toLocaleString("id-ID")}
                  </span>
                </div>
                {successResult.bankName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bank Tujuan:</span>
                    <span className="font-semibold text-gray-900">{successResult.bankName}</span>
                  </div>
                )}
                {successResult.bankNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nomor Rekening:</span>
                    <span className="font-bold text-gray-900">{successResult.bankNumber}</span>
                  </div>
                )}
                {successResult.bankHolder && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Atas Nama:</span>
                    <span className="font-semibold text-gray-900">{successResult.bankHolder}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex gap-3 justify-center">
              <button
                onClick={() => router.push(`/status?registrationNumber=${successResult.registrationNumber}`)}
                className="px-6 py-2.5 bg-[#06bfa2] hover:bg-[#05a88e] text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
              >
                Lihat Status & Upload Bukti Bayar
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <span className="text-xs font-bold text-[#0f7f6d] uppercase tracking-wider">
                Formulir Pendaftaran Daring
              </span>
              <h1 className="text-2xl font-black text-gray-900 mt-1">
                Registrasi Calon Peserta Didik Baru
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Lengkapi data identitas calon siswa dan data orang tua secara benar dan akurat.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="font-bold">✕</button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pilihan Periode */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  UNIT PENDIDIKAN & GELOMBANG <span className="text-rose-500">*</span>
                </label>
                {loadingPeriods ? (
                  <div className="text-xs text-gray-400">Memuat gelombang aktif...</div>
                ) : periods.length === 0 ? (
                  <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    Tidak ada gelombang pendaftaran yang sedang dibuka saat ini.
                  </div>
                ) : (
                  <select
                    value={selectedPeriodId}
                    onChange={(e) => setSelectedPeriodId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#06bfa2] bg-white"
                  >
                    {periods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.unitName} - {p.label} (Biaya: Rp {Number(p.fee).toLocaleString("id-ID")})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Data Calon Siswa */}
              <div className="pt-4 border-t border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 text-[#0f7f6d]">
                  1. Biodata Calon Siswa
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nama Lengkap Calon Siswa <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Sesuai Akta Kelahiran"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06bfa2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nama Panggilan
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Nama panggilan sehari-hari"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06bfa2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Jenis Kelamin <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as "male" | "female")}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06bfa2] bg-white"
                    >
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tempat Lahir <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      placeholder="Contoh: Jakarta"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06bfa2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tanggal Lahir <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06bfa2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      NISN (Jika Ada)
                    </label>
                    <input
                      type="text"
                      value={nisn}
                      onChange={(e) => setNisn(e.target.value)}
                      placeholder="Nomor Induk Siswa Nasional"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06bfa2]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Alamat Tempat Tinggal <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Alamat lengkap domisili saat ini"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06bfa2]"
                    />
                  </div>
                </div>
              </div>

              {/* Data Orang Tua */}
              <div className="pt-4 border-t border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 text-[#0f7f6d]">
                  2. Data Orang Tua / Wali
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nama Ayah Kandung <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="Nama lengkap ayah"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06bfa2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nomor HP/WhatsApp Ayah <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={fatherPhone}
                      onChange={(e) => setFatherPhone(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06bfa2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nama Ibu Kandung
                    </label>
                    <input
                      type="text"
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                      placeholder="Nama lengkap ibu"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06bfa2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nomor HP/WhatsApp Ibu
                    </label>
                    <input
                      type="tel"
                      value={motherPhone}
                      onChange={(e) => setMotherPhone(e.target.value)}
                      placeholder="Contoh: 08129876543"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06bfa2]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <a
                  href="/"
                  className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Batal
                </a>
                <button
                  type="submit"
                  disabled={submitting || periods.length === 0}
                  className="px-6 py-2.5 bg-[#06bfa2] hover:bg-[#05a88e] text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyimpan Data Pendaftaran...
                    </>
                  ) : (
                    <>Kirim Formulir Pendaftaran</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default function RegisterOnlinePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F8F8]">
          <div className="w-8 h-8 border-4 border-[#06bfa2] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <RegisterForm />
    </React.Suspense>
  );
}

