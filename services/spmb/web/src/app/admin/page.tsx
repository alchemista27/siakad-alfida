"use client";

import React, { useState, useEffect, useTransition } from "react";
import { AppShell } from "@alfida/ui";

interface Registration {
  id: string;
  registrationNumber: string;
  externalRef: string | null;
  periodId: string;
  source: string;
  status: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string | null;
  inviteToken: string | null;
  claimedAt: string | null;
  handoffStatus: string;
  createdAt: string;
  period: {
    unitName: string;
    label: string;
    fee: number;
  };
  studentData: {
    fullName: string;
    gender: string;
    birthDate: string;
    nisn: string | null;
  } | null;
  payment: {
    status: string;
    amount: number;
    proofUrl: string | null;
  } | null;
  observationResult: {
    score: number;
    rank: number | null;
    notes: string | null;
  } | null;
}

interface Period {
  id: string;
  unitName: string;
  label: string;
  isOpen: boolean;
  quota: number;
}

export default function SpmbAdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterSource, setFilterSource] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [adminTab, setAdminTab] = useState<"overview" | "registrations" | "verification" | "observations" | "decisions">("registrations");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [activeRegForScore, setActiveRegForScore] = useState<Registration | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(80);
  const [scoreNotes, setScoreNotes] = useState("");

  // Offline Form States
  const [offlinePeriodId, setOfflinePeriodId] = useState("");
  const [offlineExtRef, setOfflineExtRef] = useState("");
  const [offlineGuardianName, setOfflineGuardianName] = useState("");
  const [offlineGuardianPhone, setOfflineGuardianPhone] = useState("");
  const [offlineStudentName, setOfflineStudentName] = useState("");
  const [offlineGender, setOfflineGender] = useState<"male" | "female">("male");
  const [offlineBirthPlace, setOfflineBirthPlace] = useState("");
  const [offlineBirthDate, setOfflineBirthDate] = useState("");
  const [offlineAddress, setOfflineAddress] = useState("");
  const [offlineIsPaid, setOfflineIsPaid] = useState(true);
  const [offlineScore, setOfflineScore] = useState<string>("");
  const [savingOffline, setSavingOffline] = useState(false);

  // Import CSV States
  const [importCsvText, setImportCsvText] = useState("");
  const [importPeriodId, setImportPeriodId] = useState("");
  const [importPreviewRows, setImportPreviewRows] = useState<any[]>([]);
  const [importSummary, setImportSummary] = useState<any>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importCommitting, setImportCommitting] = useState(false);

  // WA Modal State
  const [waLinkModal, setWaLinkModal] = useState<{
    waLink: string;
    claimUrl: string;
    guardianName: string;
    studentName: string;
  } | null>(null);

  // Load Periods & Registrations
  const fetchPeriods = async () => {
    try {
      const res = await fetch("/api/periods");
      if (res.ok) {
        const data = await res.json();
        setPeriods(data);
        if (data.length > 0 && !selectedPeriodId) {
          setSelectedPeriodId(data[0].id);
          setOfflinePeriodId(data[0].id);
          setImportPeriodId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedPeriodId) params.append("periodId", selectedPeriodId);
      if (filterStatus) params.append("status", filterStatus);
      if (filterSource) params.append("source", filterSource);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/registrations?${params.toString()}`);
      if (res.status === 401 || res.status === 403) {
        // Belum login atau unauthorized
        setError("Akses terbatas untuk panitia / admin unit SPMB. Silakan login dengan akun yang memiliki hak akses.");
        return;
      }
      if (!res.ok) {
        throw new Error("Gagal mengambil data pendaftar.");
      }
      const data = await res.json();
      setRegistrations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [selectedPeriodId, filterStatus, filterSource]);

  // Handle Search Form
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRegistrations();
  };

  // Submit Offline Walk-in Registration
  const handleSaveOffline = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOffline(true);
    try {
      const payload: any = {
        periodId: offlinePeriodId || selectedPeriodId,
        externalRef: offlineExtRef || undefined,
        guardianName: offlineGuardianName,
        guardianPhone: offlineGuardianPhone,
        isPaid: offlineIsPaid,
        student: {
          fullName: offlineStudentName,
          gender: offlineGender,
          birthPlace: offlineBirthPlace || "Kota Asal",
          birthDate: offlineBirthDate || "2018-01-01",
          address: offlineAddress || "Alamat domisili",
        },
      };

      if (offlineScore) {
        payload.observationScore = Number(offlineScore);
      }

      const res = await fetch("/api/registrations/offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal menyimpan entri luring");
      }

      const created = await res.json();
      setShowOfflineModal(false);
      // Reset form
      setOfflineStudentName("");
      setOfflineGuardianName("");
      setOfflineGuardianPhone("");
      setOfflineExtRef("");
      setOfflineScore("");

      // Refresh data
      await fetchRegistrations();

      // Buka share WA jika nomor ada
      if (created.id) {
        openWaShare(created.id, offlineGuardianName, offlineStudentName);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSavingOffline(false);
    }
  };

  // WhatsApp Share Helper
  const openWaShare = async (regId: string, guardianName: string, studentName: string) => {
    try {
      const res = await fetch(`/api/invites/share/${regId}`);
      if (res.ok) {
        const data = await res.json();
        setWaLinkModal({
          waLink: data.waLink,
          claimUrl: data.claimUrl,
          guardianName,
          studentName,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Preview Import CSV
  const handlePreviewImport = async () => {
    if (!importCsvText.trim()) return;
    setImportLoading(true);
    try {
      const res = await fetch("/api/imports/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodId: importPeriodId || selectedPeriodId,
          csvContent: importCsvText,
        }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal memproses pratinjau CSV");
      }
      const data = await res.json();
      setImportPreviewRows(data.rows);
      setImportSummary({
        total: data.totalRows,
        valid: data.validRows,
        invalid: data.invalidRows,
      });
    } catch (err: any) {
      alert("Error Preview: " + err.message);
    } finally {
      setImportLoading(false);
    }
  };

  // Commit Import CSV
  const handleCommitImport = async () => {
    const validRows = importPreviewRows.filter((r) => r.isValid).map((r) => r.data);
    if (validRows.length === 0) return;

    setImportCommitting(true);
    try {
      const res = await fetch("/api/imports/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodId: importPeriodId || selectedPeriodId,
          rows: validRows,
        }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal menyimpan data impor");
      }
      const data = await res.json();
      alert(`Berhasil mengimpor ${data.importedCount} data pendaftar luring!`);
      setShowImportModal(false);
      setImportCsvText("");
      setImportPreviewRows([]);
      setImportSummary(null);
      await fetchRegistrations();
    } catch (err: any) {
      alert("Error Commit: " + err.message);
    } finally {
      setImportCommitting(false);
    }
  };

  // Submit Observasi Score
  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegForScore) return;

    try {
      const res = await fetch("/api/observations/submit-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: activeRegForScore.id,
          score: Number(scoreInput),
          notes: scoreNotes || undefined,
        }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal menyimpan nilai observasi");
      }
      setShowScoreModal(false);
      setActiveRegForScore(null);
      await fetchRegistrations();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Single Decision (Accept / Reject)
  const handleDecision = async (regId: string, status: "accepted" | "rejected") => {
    const confirmMsg =
      status === "accepted"
        ? "Yakin menetapkan pendaftar ini DITERIMA? Pendaftar akan siap diserahkan ke SIAKAD."
        : "Yakin menetapkan pendaftar ini DITOLAK?";
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch("/api/decisions/single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: regId, status }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal mengubah status kelulusan");
      }
      await fetchRegistrations();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Sync to Siakad Handoff
  const handleSyncSiakad = async (regId: string) => {
    try {
      const res = await fetch("/api/handoff/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: regId }),
      });
      const data = await res.json();
      if (!data.success) {
        alert("Gagal Sinkronisasi SIAKAD: " + data.message);
      } else {
        alert("Berhasil disinkronkan ke SIAKAD!");
      }
      await fetchRegistrations();
    } catch (err: any) {
      alert("Error Handoff: " + err.message);
    }
  };

  // Statistics Calculation
  const totalCount = registrations.length;
  const offlineCount = registrations.filter((r) => r.source === "offline").length;
  const onlineCount = totalCount - offlineCount;
  const acceptedCount = registrations.filter((r) => r.status === "accepted").length;
  const handedOffCount = registrations.filter((r) => r.handoffStatus === "done").length;

  const sidebarGroups = [
    {
      title: "Penerimaan Siswa",
      items: [
        {
          label: "Pendaftar & Seleksi",
          href: "/admin",
          icon: "school",
          active: true,
        },
        {
          label: "Entri Offline",
          href: "#offline",
          icon: "person_add",
          onClick: () => setShowOfflineModal(true),
        },
        {
          label: "Impor CSV",
          href: "#import",
          icon: "upload_file",
          onClick: () => setShowImportModal(true),
        },
      ],
    },
    {
      title: "Portal Publik",
      items: [
        {
          label: "Form Registrasi",
          href: "/register",
          icon: "how_to_reg",
        },
        {
          label: "Cek Status",
          href: "/status",
          icon: "manage_search",
        },
      ],
    },
    {
      title: "Sistem",
      items: [
        {
          label: "Portal Modul",
          href: "https://auth.alfida.or.id/modules",
          icon: "apps",
        },
      ],
    },
  ];

  return (
    <AppShell
      serviceName="SPMB"
      userName="Panitia SPMB"
      userRole="TIM PPDB / ADMIN"
      sidebarGroups={sidebarGroups}
      onLogout={() => {
        window.location.href = "https://auth.alfida.or.id/login";
      }}
      topbarActions={
        <div className="flex items-center gap-2">
          <a
            href="/observer"
            className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 inline-flex items-center gap-1 px-2.5 py-1 rounded transition-colors"
          >
            <span className="material-symbols-rounded text-[16px]">assignment_turned_in</span>
            <span className="hidden sm:inline">Portal Observer</span>
          </a>
          <a
            href="https://auth.alfida.or.id/modules"
            className="text-xs font-semibold text-tertiary hover:underline inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#e6f4f1]"
          >
            <span className="material-symbols-rounded text-[16px]">apps</span>
            <span className="hidden sm:inline">Pilih Modul</span>
          </a>
        </div>
      }
    >
      <div className="max-w-7xl w-full mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-block px-2.5 py-0.5 bg-teal-100 text-[#0f7f6d] font-bold text-xs rounded-full mb-1">
              PORTAL ADMINISTRASI & PANITIA UNIT
            </div>
            <h1 className="text-2xl font-black text-gray-900">
              Pengelolaan SPMB & Seleksi Santri
            </h1>
            <p className="text-xs text-gray-500">
              Kelola pendaftar luring (offline walk-in), impor massal berkas, observasi, kelulusan, dan handoff SIAKAD.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowOfflineModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#06bfa2] hover:bg-[#05a88e] text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              + Entri Offline (Walk-in)
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              <svg className="w-4 h-4 fill-current text-gray-500" viewBox="0 0 24 24">
                <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
              </svg>
              Impor CSV Massal
            </button>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-gray-400 text-xs font-medium block">Total Pendaftar</span>
            <span className="text-2xl font-black text-gray-900">{totalCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-gray-400 text-xs font-medium block">Pendaftar Offline</span>
            <span className="text-2xl font-black text-amber-600">{offlineCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-gray-400 text-xs font-medium block">Pendaftar Online</span>
            <span className="text-2xl font-black text-teal-600">{onlineCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-gray-400 text-xs font-medium block">Dinyatakan Lulus</span>
            <span className="text-2xl font-black text-emerald-600">{acceptedCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-gray-400 text-xs font-medium block">Masuk ke SIAKAD</span>
            <span className="text-2xl font-black text-[#0f7f6d]">{handedOffCount}</span>
          </div>
        </div>

        {/* Tab Navigasi SPMB Admin */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-1 text-xs font-semibold">
          <button
            onClick={() => { setAdminTab("overview"); setFilterStatus(""); }}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              adminTab === "overview"
                ? "border-[#0f7f6d] text-[#0f7f6d] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="material-symbols-rounded text-[18px]">dashboard</span>
            <span>1. Overview & Gelombang</span>
          </button>

          <button
            onClick={() => { setAdminTab("registrations"); setFilterStatus(""); }}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              adminTab === "registrations"
                ? "border-[#0f7f6d] text-[#0f7f6d] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="material-symbols-rounded text-[18px]">payments</span>
            <span>2. Pendaftar & Pembayaran</span>
          </button>

          <button
            onClick={() => { setAdminTab("verification"); setFilterStatus("documents_uploaded"); }}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              adminTab === "verification"
                ? "border-[#0f7f6d] text-[#0f7f6d] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="material-symbols-rounded text-[18px]">folder_shared</span>
            <span>3. Verifikasi Berkas</span>
          </button>

          <button
            onClick={() => { setAdminTab("observations"); setFilterStatus("observation_scheduled"); }}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              adminTab === "observations"
                ? "border-[#0f7f6d] text-[#0f7f6d] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="material-symbols-rounded text-[18px]">event_note</span>
            <span>4. Jadwal & Hasil Observasi</span>
          </button>

          <button
            onClick={() => { setAdminTab("decisions"); setFilterStatus("observation_done"); }}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              adminTab === "decisions"
                ? "border-[#0f7f6d] text-[#0f7f6d] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="material-symbols-rounded text-[18px]">how_to_reg</span>
            <span>5. Kelulusan & Handoff SIAKAD</span>
          </button>
        </div>

        {/* Tab 1: Overview & Gelombang Table */}
        {adminTab === "overview" && (
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold font-heading text-primary flex items-center gap-2">
                  <span className="material-symbols-rounded text-tertiary text-[20px]">calendar_month</span>
                  <span>Gelombang Penerimaan & Kuota Unit Sekolah</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Daftar periode pendaftaran aktif, kuota daya tampung, dan status buka/tutup pendaftaran.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F7F8F8] border-b border-border text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Nama Unit Sekolah</th>
                    <th className="py-3 px-4">Label Gelombang</th>
                    <th className="py-3 px-4 text-center">Daya Tampung (Kuota)</th>
                    <th className="py-3 px-4 text-center">Pendaftar Terisi</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {periods.map((p) => {
                    const pRegs = registrations.filter((r) => r.periodId === p.id);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-primary">{p.unitName}</td>
                        <td className="py-3.5 px-4 font-medium text-gray-700">{p.label}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold">{p.quota} Kursi</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-tertiary">
                          {pRegs.length} ({Math.round((pRegs.length / (p.quota || 1)) * 100)}%)
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              p.isOpen
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {p.isOpen ? "Dibuka" : "Ditutup"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedPeriodId(p.id);
                              setAdminTab("registrations");
                            }}
                            className="px-3 py-1 rounded bg-[#e6f4f1] text-tertiary hover:bg-[#d0ece6] font-semibold text-xs"
                          >
                            Lihat Pendaftar →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#06bfa2]"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.unitName} - {p.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#06bfa2]"
            >
              <option value="">Semua Status</option>
              <option value="pending_payment">Menunggu Pembayaran</option>
              <option value="payment_uploaded">Bukti Bayar Diunggah</option>
              <option value="payment_verified">Pembayaran Terverifikasi</option>
              <option value="documents_uploaded">Berkas Diunggah</option>
              <option value="observation_scheduled">Jadwal Observasi Ditentukan</option>
              <option value="observation_done">Observasi Selesai</option>
              <option value="accepted">Diterima (Lulus)</option>
              <option value="rejected">Ditolak</option>
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#06bfa2]"
            >
              <option value="">Semua Jalur</option>
              <option value="offline">Luring (Offline Walk-in)</option>
              <option value="online">Daring (Online Mandiri)</option>
            </select>
          </div>

          <form onSubmit={handleSearch} className="flex gap-1.5 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Cari siswa, nomor, wali..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#06bfa2] flex-1 sm:w-56"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-[#06bfa2] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-gray-500">Memuat data pendaftar...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-xs text-rose-600 bg-rose-50">
              {error}
            </div>
          ) : registrations.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-xs">
              Tidak ada data pendaftar yang sesuai filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 font-bold">No. Registrasi</th>
                    <th className="py-3 px-4 font-bold">Calon Siswa</th>
                    <th className="py-3 px-4 font-bold">Wali / WhatsApp</th>
                    <th className="py-3 px-4 font-bold">Jalur</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Observasi</th>
                    <th className="py-3 px-4 font-bold">SIAKAD</th>
                    <th className="py-3 px-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                        {reg.registrationNumber}
                        {reg.externalRef && (
                          <span className="block text-[10px] text-gray-400 font-normal">
                            Ref: {reg.externalRef}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">
                          {reg.studentData?.fullName || "Calon Siswa"}
                        </div>
                        <div className="text-[11px] text-gray-500 capitalize">
                          {reg.studentData?.gender === "female" ? "Perempuan" : "Laki-laki"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-800">{reg.guardianName}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <span>{reg.guardianPhone}</span>
                          <button
                            onClick={() =>
                              openWaShare(
                                reg.id,
                                reg.guardianName,
                                reg.studentData?.fullName || "Calon Siswa"
                              )
                            }
                            title="Kirim Link Klaim via WhatsApp"
                            className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.92-9.91-9.92z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            reg.source === "offline"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-teal-100 text-[#0f7f6d]"
                          }`}
                        >
                          {reg.source}
                        </span>
                        {reg.claimedAt && (
                          <span className="block text-[10px] text-emerald-600 mt-0.5 font-medium">
                            ✓ Akun Diklaim
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800 uppercase">
                          {reg.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {reg.observationResult ? (
                          <div>
                            <span className="font-bold text-gray-900">
                              Skor: {reg.observationResult.score}
                            </span>
                            {reg.observationResult.rank && (
                              <span className="text-[10px] text-gray-500 block">
                                Peringkat #{reg.observationResult.rank}
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveRegForScore(reg);
                              setScoreInput(80);
                              setShowScoreModal(true);
                            }}
                            className="text-xs text-[#06bfa2] font-semibold hover:underline"
                          >
                            + Input Skor
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {reg.handoffStatus === "done" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            ✓ Tersinkron
                          </span>
                        ) : reg.status === "accepted" ? (
                          <button
                            onClick={() => handleSyncSiakad(reg.id)}
                            className="px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-[#0f7f6d] font-bold text-[10px] transition-colors"
                          >
                            Sync ke SIAKAD
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400">Belum Lulus</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {reg.status !== "accepted" && reg.status !== "rejected" && (
                            <>
                              <button
                                onClick={() => handleDecision(reg.id, "accepted")}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded transition-colors"
                              >
                                Terima
                              </button>
                              <button
                                onClick={() => handleDecision(reg.id, "rejected")}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded transition-colors"
                              >
                                Tolak
                              </button>
                            </>
                          )}
                          <a
                            href={`/status?registrationNumber=${reg.registrationNumber}`}
                            target="_blank"
                            className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
                            title="Buka Kartu Pelacak"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Entri Pendaftar Offline (Walk-in) */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                + Entri Pendaftar Offline (Walk-in)
              </h2>
              <button
                onClick={() => setShowOfflineModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOffline} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Pilih Gelombang / Unit</label>
                  <select
                    value={offlinePeriodId}
                    onChange={(e) => setOfflinePeriodId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    {periods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.unitName} - {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nomor Formulir Fisik / Ref Lama</label>
                  <input
                    type="text"
                    placeholder="Contoh: REG-OFF-012"
                    value={offlineExtRef}
                    onChange={(e) => setOfflineExtRef(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nama Calon Siswa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap anak"
                    value={offlineStudentName}
                    onChange={(e) => setOfflineStudentName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={offlineGender}
                    onChange={(e) => setOfflineGender(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={offlineBirthDate}
                    onChange={(e) => setOfflineBirthDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nama Orang Tua / Wali *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama ayah/ibu"
                    value={offlineGuardianName}
                    onChange={(e) => setOfflineGuardianName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">No WhatsApp Wali *</label>
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={offlineGuardianPhone}
                    onChange={(e) => setOfflineGuardianPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Alamat Domisili</label>
                  <textarea
                    rows={2}
                    placeholder="Alamat rumah singkat"
                    value={offlineAddress}
                    onChange={(e) => setOfflineAddress(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="col-span-2 p-3 bg-gray-50 rounded-xl space-y-2 border">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                    <input
                      type="checkbox"
                      checked={offlineIsPaid}
                      onChange={(e) => setOfflineIsPaid(e.target.checked)}
                      className="rounded text-[#06bfa2]"
                    />
                    Tandai Langsung Lunas (Bayar Tunai di Kantor)
                  </label>

                  <div className="flex items-center gap-3 mt-2">
                    <label className="font-semibold text-gray-700 whitespace-nowrap">
                      Skor Observasi Langsung (Jika Ada):
                    </label>
                    <input
                      type="number"
                      placeholder="0-100"
                      min="0"
                      max="100"
                      value={offlineScore}
                      onChange={(e) => setOfflineScore(e.target.value)}
                      className="w-24 px-2 py-1 border rounded bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowOfflineModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingOffline}
                  className="px-5 py-2 bg-[#06bfa2] hover:bg-[#05a88e] text-white font-bold rounded-xl transition-colors disabled:opacity-60"
                >
                  {savingOffline ? "Menyimpan..." : "Simpan & Buat Tautan Klaim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Impor Massal CSV */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                Impor Pendaftar Luring Massal (CSV)
              </h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Unit & Periode</label>
                <select
                  value={importPeriodId}
                  onChange={(e) => setImportPeriodId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.unitName} - {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Tempel Konten CSV (Format: guardianName, guardianPhone, studentName, gender, birthDate, isPaid)
                </label>
                <textarea
                  rows={6}
                  placeholder={`guardianName,guardianPhone,studentName,gender,birthDate,isPaid\nBudi Santoso,08123456789,Muhammad Rizky,male,2018-05-12,true\nSiti Rahma,08129876543,Aisyah Humaira,female,2018-08-20,true`}
                  value={importCsvText}
                  onChange={(e) => setImportCsvText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handlePreviewImport}
                  disabled={importLoading || !importCsvText.trim()}
                  className="px-4 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                >
                  {importLoading ? "Memvalidasi..." : "Pratinjau Validasi"}
                </button>

                {importSummary && (
                  <span className="text-xs font-semibold text-gray-600">
                    Total: {importSummary.total} baris | Valid:{" "}
                    <span className="text-emerald-600">{importSummary.valid}</span> | Gagal:{" "}
                    <span className="text-rose-600">{importSummary.invalid}</span>
                  </span>
                )}
              </div>

              {/* Preview Table */}
              {importPreviewRows.length > 0 && (
                <div className="border rounded-lg overflow-x-auto max-h-48 text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-2">Baris</th>
                        <th className="p-2">Wali</th>
                        <th className="p-2">No WA</th>
                        <th className="p-2">Siswa</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {importPreviewRows.map((r, i) => (
                        <tr key={i} className={r.isValid ? "bg-white" : "bg-rose-50"}>
                          <td className="p-2 font-bold">{r.rowNumber}</td>
                          <td className="p-2">{r.data.guardianName}</td>
                          <td className="p-2">{r.data.guardianPhone}</td>
                          <td className="p-2">{r.data.studentName}</td>
                          <td className="p-2 font-bold">
                            {r.isValid ? (
                              <span className="text-emerald-600">Siap Impor</span>
                            ) : (
                              <span className="text-rose-600">{r.errors.join(", ")}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleCommitImport}
                  disabled={importCommitting || !importSummary || importSummary.valid === 0}
                  className="px-5 py-2 bg-[#06bfa2] hover:bg-[#05a88e] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {importCommitting ? "Menyimpan ke DB..." : "Komit & Simpan Seluruh Data"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Input Nilai Observasi */}
      {showScoreModal && activeRegForScore && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-base font-bold text-gray-900 mb-1">
              Input Hasil Observasi Santri
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {activeRegForScore.studentData?.fullName || "Calon Siswa"} (
              {activeRegForScore.registrationNumber})
            </p>

            <form onSubmit={handleSaveScore} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Skor Total (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={scoreInput}
                  onChange={(e) => setScoreInput(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Catatan Penguji / Observasi</label>
                <textarea
                  rows={3}
                  placeholder="Catatan kemampuan membaca Quran, motorik, atau adab..."
                  value={scoreNotes}
                  onChange={(e) => setScoreNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowScoreModal(false)}
                  className="px-4 py-2 border rounded-lg font-bold text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#06bfa2] hover:bg-[#05a88e] text-white font-bold rounded-lg transition-colors"
                >
                  Simpan Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Share WhatsApp Link */}
      {waLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.92-9.91-9.92z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Tautan Klaim Akun WhatsApp</h2>
            <p className="text-xs text-gray-500 mb-4">
              Kirim tautan resmi ini kepada wali murid <strong>{waLinkModal.guardianName}</strong> untuk calon siswa <strong>{waLinkModal.studentName}</strong>.
            </p>

            <div className="p-3 bg-gray-50 border rounded-xl text-left text-xs mb-4 select-all break-all font-mono">
              {waLinkModal.claimUrl}
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setWaLinkModal(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Tutup
              </button>
              <a
                href={waLinkModal.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors inline-flex items-center gap-1.5"
              >
                Buka WhatsApp (wa.me)
              </a>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
