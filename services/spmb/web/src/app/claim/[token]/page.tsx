"use client";

import { SpmbTopbar } from "@/components/SpmbTopbar";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface InviteDetails {
  registrationId: string;
  registrationNumber: string;
  unitName: string;
  studentName: string;
  guardianName: string;
  status: string;
}

export default function ClaimInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [details, setDetails] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invites/${token}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Tautan klaim tidak valid atau sudah kedaluwarsa");
        }
        const data = await res.json();
        setDetails(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInvite();
  }, [token]);

  const handleClaim = async () => {
    setClaiming(true);
    setError(null);
    try {
      const res = await fetch(`/api/invites/${token}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 401) {
        // Belum login, redirect ke Auth service dengan callback URL
        const currentUrl = window.location.href;
        window.location.href = `https://auth.alfida.or.id/login?callbackUrl=${encodeURIComponent(currentUrl)}`;
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Gagal mengklaim pendaftaran");
      }

      setClaimSuccess(true);
      setTimeout(() => {
        router.push(`/status?registrationNumber=${details?.registrationNumber}`);
      }, 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F8]">


      <SpmbTopbar /><main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-8">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-[#06bfa2] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-500 font-medium">Memverifikasi tautan klaim...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Tautan Klaim Tidak Dapat Digunakan</h2>
              <p className="text-xs text-gray-600 mb-6">{error}</p>
              <div className="flex gap-2 justify-center">
                <a
                  href="/"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Kembali ke Beranda
                </a>
                <a
                  href="/status"
                  className="px-4 py-2 bg-[#06bfa2] hover:bg-[#05a88e] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Cek Status Registrasi
                </a>
              </div>
            </div>
          ) : claimSuccess ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Pendaftaran Berhasil Diklaim!</h2>
              <p className="text-xs text-gray-600 mb-4">
                Akun Anda telah ditautkan dengan pendaftaran {details?.studentName}. Mengalihkan ke pelacak status...
              </p>
              <div className="w-6 h-6 border-2 border-[#06bfa2] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-teal-50 text-[#0f7f6d] rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-extrabold text-gray-900">Klaim Pendaftaran Murid/Murid</h1>
                <p className="text-xs text-gray-500 mt-1">
                  Hubungkan data pendaftaran Anda dengan akun identitas Alfida untuk akses mandiri.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nomor Pendaftaran:</span>
                  <span className="font-bold text-gray-900">{details?.registrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nama Calon Murid:</span>
                  <span className="font-semibold text-gray-900">{details?.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Unit Pendidikan:</span>
                  <span className="font-semibold text-[#0f7f6d]">{details?.unitName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Wali Terdaftar:</span>
                  <span className="font-medium text-gray-800">{details?.guardianName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status Saat Ini:</span>
                  <span className="font-bold text-amber-600 uppercase text-[11px]">
                    {details?.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              <button
                onClick={handleClaim}
                disabled={claiming}
                className="w-full py-3 bg-[#06bfa2] hover:bg-[#05a88e] text-white font-semibold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {claiming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses Klaim...
                  </>
                ) : (
                  <>Tautkan & Klaim ke Akun Saya</>
                )}
              </button>

              <p className="text-[11px] text-gray-500 text-center mt-4 leading-normal">
                Jika Anda belum login, Anda akan diarahkan ke portal masuk Yayasan Alfida dan dikembalikan otomatis ke halaman ini.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
