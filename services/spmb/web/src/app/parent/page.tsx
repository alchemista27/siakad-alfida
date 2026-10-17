"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { SpmbNavbar } from "@/components/SpmbNavbar";
import {
  apiRequest,
  getStageRouteForRegistration,
  STATUS_LABELS,
  type ParentRegistration,
  type PeriodSummary,
} from "@/lib/spmb-registration";

export default function ParentSpmbPage() {
  const [registrations, setRegistrations] = useState<ParentRegistration[]>([]);
  const [periods, setPeriods] = useState<PeriodSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [applicantForm, setApplicantForm] = useState({
    applicantFullName: "",
    applicantGender: "male" as "male" | "female",
    applicantBirthPlace: "",
    applicantBirthDate: "",
  });

  const refresh = async () => {
    const [regList, publicPeriods] = await Promise.all([
      apiRequest<ParentRegistration[]>("/api/registrations/parent"),
      apiRequest<PeriodSummary[]>("/api/periods/public").catch(() => []),
    ]);
    setRegistrations(Array.isArray(regList) ? regList : []);
    setPeriods(Array.isArray(publicPeriods) ? publicPeriods : []);
    if (!selectedPeriodId && publicPeriods?.[0]?.id) {
      setSelectedPeriodId(publicPeriods[0].id);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch (error) {
        setNotice({
          type: "error",
          message: error instanceof Error ? error.message : "Gagal memuat daftar pendaftaran.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedPeriodId) {
      setNotice({ type: "error", message: "Pilih unit dan gelombang pendaftaran terlebih dahulu." });
      return;
    }
    if (!applicantForm.applicantFullName.trim()) {
      setNotice({ type: "error", message: "Nama lengkap calon siswa wajib diisi." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      await apiRequest("/api/registrations/online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodId: selectedPeriodId,
          applicantFullName: applicantForm.applicantFullName.trim(),
          applicantGender: applicantForm.applicantGender,
          applicantBirthPlace: applicantForm.applicantBirthPlace.trim() || undefined,
          applicantBirthDate: applicantForm.applicantBirthDate || undefined,
        }),
      });
      setApplicantForm({
        applicantFullName: "",
        applicantGender: "male",
        applicantBirthPlace: "",
        applicantBirthDate: "",
      });
      await refresh();
      setNotice({
        type: "success",
        message: "Pendaftaran calon siswa berhasil dibuat. Silakan lanjutkan tahap pembayaran.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Gagal membuat pendaftaran.",
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-neutral text-primary font-body">
        <span className="material-symbols-rounded animate-spin text-tertiary text-3xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral text-primary font-body">
      <SpmbNavbar />
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
        <header className="border-b border-border pb-6">
          <p className="text-xs font-semibold tracking-wider text-tertiary uppercase">Portal Orang Tua</p>
          <h1 className="font-heading font-bold text-3xl mt-1">Daftar Pendaftaran Putra/Putri</h1>
          <p className="mt-2 text-sm text-gray-600">
            Kelola pendaftaran PPDB untuk setiap putra/putri Anda secara terpisah dan terverifikasi.
          </p>
        </header>

        {notice && (
          <div
            className={`mt-6 border rounded-md p-4 text-sm ${
              notice.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-[#e6f4f1] border-[#b9ded7] text-[#0b6355]"
            }`}
          >
            {notice.message}
          </div>
        )}

        {registrations.length > 0 && (
          <section className="mt-6 space-y-4">
            <h2 className="font-heading font-bold text-xl">Berkas Pendaftaran Aktif</h2>
            <div className="grid gap-4">
              {registrations.map((reg) => {
                const nextHref = getStageRouteForRegistration(reg);
                return (
                  <div
                    key={reg.id}
                    className="bg-surface border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading font-bold text-lg">
                          {reg.studentData?.fullName || "Calon Siswa"}
                        </h3>
                        <span className="font-mono text-xs bg-neutral border border-border px-2 py-0.5 rounded-sm">
                          {reg.registrationNumber}
                        </span>
                        <span className="text-xs font-semibold bg-[#e6f4f1] text-tertiary px-2 py-0.5 rounded-sm">
                          {reg.period.unitName} · {reg.period.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1.5">
                        Status saat ini: <strong>{STATUS_LABELS[reg.status]}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={nextHref}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-tertiary hover:bg-[#0b6355] text-white rounded-sm text-xs font-semibold"
                      >
                        Lanjutkan Tahapan
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-8 bg-surface border border-border rounded-lg p-6">
          <h2 className="font-heading font-bold text-xl">Tambah Pendaftaran Anak Baru</h2>
          <p className="text-sm text-gray-600 mt-1">
            Pilih unit pendidikan dan masukkan identitas calon siswa untuk memulai berkas pendaftaran baru.
          </p>
          <form onSubmit={handleCreate} className="mt-5 space-y-5">
            <div className="grid md:grid-cols-2 gap-3">
              {periods.map((period) => (
                <button
                  key={period.id}
                  type="button"
                  onClick={() => setSelectedPeriodId(period.id)}
                  className={`text-left border rounded-md p-4 transition-colors ${
                    selectedPeriodId === period.id
                      ? "border-tertiary bg-[#e6f4f1]"
                      : "border-border bg-white hover:border-[#b9ded7]"
                  }`}
                >
                  <div className="flex justify-between gap-3">
                    <strong className="text-sm">{period.unitName}</strong>
                    <span className="text-xs text-tertiary font-semibold">{period.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Biaya formulir: Rp {Number(period.fee).toLocaleString("id-ID")} · Kuota {period.quota}
                  </p>
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-xs">
                <span className="font-semibold block mb-1">Nama Lengkap Calon Siswa *</span>
                <input
                  type="text"
                  required
                  value={applicantForm.applicantFullName}
                  onChange={(e) =>
                    setApplicantForm((cur) => ({ ...cur, applicantFullName: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-sm bg-white text-sm"
                  placeholder="Contoh: Ahmad Fauzi"
                />
              </label>
              <label className="block text-xs">
                <span className="font-semibold block mb-1">Jenis Kelamin *</span>
                <select
                  value={applicantForm.applicantGender}
                  onChange={(e) =>
                    setApplicantForm((cur) => ({
                      ...cur,
                      applicantGender: e.target.value as "male" | "female",
                    }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-sm bg-white text-sm"
                >
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
              </label>
              <label className="block text-xs">
                <span className="font-semibold block mb-1">Tempat Lahir</span>
                <input
                  type="text"
                  value={applicantForm.applicantBirthPlace}
                  onChange={(e) =>
                    setApplicantForm((cur) => ({ ...cur, applicantBirthPlace: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-sm bg-white text-sm"
                />
              </label>
              <label className="block text-xs">
                <span className="font-semibold block mb-1">Tanggal Lahir</span>
                <input
                  type="date"
                  value={applicantForm.applicantBirthDate}
                  onChange={(e) =>
                    setApplicantForm((cur) => ({ ...cur, applicantBirthDate: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-sm bg-white text-sm"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={busy || !selectedPeriodId}
              className="inline-flex items-center gap-2 px-4 py-2 bg-tertiary hover:bg-[#0b6355] disabled:opacity-50 text-white rounded-sm text-sm font-semibold"
            >
              {busy ? "Memproses..." : "Buat Pendaftaran Anak"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
