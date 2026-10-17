"use client";

import React, { useEffect, useState } from "react";
import { SpmbNavbar } from "../components/SpmbNavbar";

interface AdmissionPeriod {
  id: string;
  unitId: string;
  unitName: string;
  unitSlug: string;
  label: string;
  isOpen: boolean;
  quota: number;
  fee: number;
  bankName: string | null;
  bankNumber: string | null;
  bankHolder: string | null;
  opensAt: string | null;
  closesAt: string | null;
}

export default function SpmbHomePage() {
  const [periods, setPeriods] = useState<AdmissionPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimTokenInput, setClaimTokenInput] = useState("");

  useEffect(() => {
    async function fetchActivePeriods() {
      try {
        const res = await fetch("/api/periods/public");
        if (res.ok) {
          const data = await res.json();
          setPeriods(data);
        }
      } catch (err) {
        console.error("Gagal memuat periode pendaftaran", err);
      } finally {
        setLoading(false);
      }
    }
    fetchActivePeriods();
  }, []);

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (claimTokenInput.trim()) {
      window.location.href = `/claim/${encodeURIComponent(claimTokenInput.trim())}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F8]">
      <SpmbNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-teal-50/70 via-white to-[#F7F8F8] py-14 md:py-20 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100 text-[#0f7f6d] text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-[#06bfa2] animate-pulse"></span>
              Tahun Ajaran 2026/2027 Telah Dibuka
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight max-w-3xl mx-auto leading-tight">
              Penerimaan Peserta Didik Baru Yayasan Alfida
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Mendidik generasi Qurani berkarakter tangguh, berprestasi, dan berwawasan global. Pendaftaran dapat dilakukan secara mandiri atau melalui konfirmasi panitia unit.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/parent"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#06bfa2] text-white font-semibold text-sm hover:bg-[#05a88e] shadow-md transition-all"
              >
                Mulai Pendaftaran Online
              </a>
              <a
                href="#claim-section"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 shadow-sm transition-all"
              >
                Klaim Pendaftar Offline
              </a>
              <a
                href="/status"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 shadow-sm transition-all"
              >
                Cek Status Registrasi
              </a>
            </div>
          </div>
        </section>

        {/* Claim Account Section (Penting untuk pendaftar luring yang sudah berjalan) */}
        <section id="claim-section" className="py-12 bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-teal-900 to-[#0f7f6d] rounded-2xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="inline-block px-2.5 py-1 bg-teal-800 text-teal-200 rounded text-xs font-semibold uppercase tracking-wider mb-2">
                  Sudah Mendaftar di Sekolah atau via WA?
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
                  Klaim Akun Pendaftaran Anda
                </h2>
                <p className="mt-2 text-teal-100 text-sm leading-relaxed">
                  Jika Anda telah mengisi formulir langsung di sekolah atau dihubungi panitia lewat WhatsApp, masukkan kode klaim yang Anda terima untuk mengaktifkan akun dan melengkapi berkas observasi.
                </p>
              </div>

              <form
                onSubmit={handleClaimSubmit}
                className="w-full md:w-auto flex-1 max-w-md bg-white p-4 rounded-xl shadow-inner text-gray-900"
              >
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  KODE KLAIM / TOKEN KLAIM
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={claimTokenInput}
                    onChange={(e) => setClaimTokenInput(e.target.value)}
                    placeholder="Contoh: a8f9c1e2b4..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06bfa2]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#06bfa2] text-white font-semibold text-sm rounded-lg hover:bg-[#05a88e] transition-colors whitespace-nowrap"
                  >
                    Klaim Akun
                  </button>
                </div>
                <span className="text-[11px] text-gray-500 mt-2 block">
                  Kode klaim tercantum pada tautan undangan resmi yang dikirimkan oleh panitia SPMB Alfida.
                </span>
              </form>
            </div>
          </div>
        </section>

        {/* Gelombang / Unit Pendaftaran Tersedia */}
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Unit & Gelombang Pendaftaran Dibuka
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Pilih unit pendidikan di bawah naungan Yayasan Alfida yang sesuai untuk putra/putri Anda.
            </p>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-[#06bfa2] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">Memuat periode pendaftaran yang aktif...</p>
            </div>
          ) : periods.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md mx-auto">
              <div className="w-12 h-12 bg-teal-50 text-[#0f7f6d] rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V8H19V19M19 6H5V5H19V6Z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900">Belum Ada Gelombang Dibuka</h3>
              <p className="text-xs text-gray-500 mt-1">
                Saat ini gelombang pendaftaran baru sedang dalam persiapan oleh panitia. Silakan hubungi sekretariat atau cek kembali secara berkala.
              </p>
              <a
                href="/admin"
                className="mt-4 inline-block text-xs font-semibold text-[#0f7f6d] hover:underline"
              >
                Buka Portal Panitia untuk Buat Gelombang Baru
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {periods.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0f7f6d] bg-teal-50 px-2.5 py-1 rounded">
                        {p.unitName}
                      </span>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Buka
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{p.label}</h3>
                    <div className="mt-4 space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Biaya Pendaftaran:</span>
                        <span className="font-semibold text-gray-900">
                          Rp {Number(p.fee).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kuota Siswa:</span>
                        <span className="font-semibold text-gray-900">{p.quota} Siswa</span>
                      </div>
                      {p.bankName && (
                        <div className="flex justify-between">
                          <span>Rekening Tujuan:</span>
                          <span className="font-medium text-gray-800">
                            {p.bankName} - {p.bankNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <a
                      href="/parent"
                      className="w-full inline-flex items-center justify-center py-2.5 rounded-lg bg-[#06bfa2] text-white font-semibold text-xs hover:bg-[#05a88e] transition-colors"
                    >
                      Daftar Unit Ini
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6 Tahap Alur Pendaftaran */}
        <section className="py-14 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Alur Tahapan SPMB Alfida
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Proses seleksi dan penerimaan dilakukan secara transparan, mudah, dan terstruktur.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                {
                  step: "1",
                  title: "Registrasi Awal",
                  desc: "Isi data identitas calon siswa dan kontak wali murid baik secara online atau offline.",
                },
                {
                  step: "2",
                  title: "Biaya & Verifikasi",
                  desc: "Kirim bukti transfer biaya pendaftaran atau bayar langsung ke bendahara panitia.",
                },
                {
                  step: "3",
                  title: "Biodata & Berkas",
                  desc: "Lengkapi data siswa, kartu keluarga, akta kelahiran, dan riwayat kesehatan.",
                },
                {
                  step: "4",
                  title: "Rujukan Medis",
                  desc: "Pemeriksaan kesehatan di klinik mitra Yayasan Alfida dengan surat rujukan resmi.",
                },
                {
                  step: "5",
                  title: "Observasi & Wawancara",
                  desc: "Penjadwalan dan pelaksanaan observasi kemampuan dasar, Al-Quran, dan wawancara wali.",
                },
                {
                  step: "6",
                  title: "Kelulusan & SIAKAD",
                  desc: "Pengumuman hasil akhir. Pendaftar diterima disinkronisasi ke sistem akademik SIAKAD.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-[#F7F8F8] rounded-xl p-5 border border-gray-200 flex flex-col justify-between"
                >
                  <div>
                    <span className="w-7 h-7 rounded-full bg-[#06bfa2] text-white font-bold text-xs flex items-center justify-center mb-3">
                      {item.step}
                    </span>
                    <h3 className="font-bold text-sm text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            &copy; {new Date().getFullYear()} Yayasan Alfida. Seluruh hak cipta dilindungi.
          </div>
          <div className="flex gap-4">
            <a href="https://sim.alfida.or.id" className="hover:underline">
              SIM Alfida
            </a>
            <a href="https://auth.alfida.or.id" className="hover:underline">
              Layanan Identitas Terpadu
            </a>
            <a href="/admin" className="hover:underline">
              Portal Panitia
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
