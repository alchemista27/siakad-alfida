"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@alfida/ui";
import { AdminNotice, type AdminNoticeState } from "@/components/admin/admin-notice";
import { PeriodManagementPanel, type AdminPeriodItem } from "@/components/admin/period-management-panel";
import { ObservationSchedulePanel } from "@/components/admin/observation-schedule-panel";
import { ObserverAssignmentPanel } from "@/components/admin/observer-assignment-panel";
import { RegistrationReviewPanel } from "@/components/admin/registration-review-panel";
import { DecisionPanel } from "@/components/admin/decision-panel";

interface Registration {
  id: string;
  registrationNumber: string;
  externalRef: string | null;
  periodId: string;
  source: string;
  status: string;
  dossierReviewStatus?: string;
  dossierRevisionNote?: string | null;
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

export default function SpmbAdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [periods, setPeriods] = useState<AdminPeriodItem[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterSource, setFilterSource] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<{ fullName: string; role: string } | null>(null);
  const [adminTab, setAdminTab] = useState<"overview" | "registrations" | "verification" | "observations" | "decisions">("registrations");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<AdminNoticeState | null>(null);

  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

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
  const [savingOffline, setSavingOffline] = useState(false);

  const [importCsvText, setImportCsvText] = useState("");
  const [importPeriodId, setImportPeriodId] = useState("");
  const [importPreviewRows, setImportPreviewRows] = useState<any[]>([]);
  const [importSummary, setImportSummary] = useState<any>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importCommitting, setImportCommitting] = useState(false);

  const [waLinkModal, setWaLinkModal] = useState<{
    waLink: string;
    claimUrl: string;
    guardianName: string;
    studentName: string;
  } | null>(null);

  const notify = (type: "success" | "error", message: string) => {
    setNotice({ type, message });
  };

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
    } catch {
      notify("error", "Gagal memuat daftar periode.");
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
        setError("Akses terbatas untuk panitia / admin unit SPMB.");
        return;
      }
      if (!res.ok) throw new Error("Gagal mengambil data pendaftar.");
      const data = await res.json();
      setRegistrations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setCurrentUser({
              fullName: data.user.fullName || data.user.name || "Panitia SPMB",
              role: data.user.role || "PANITIA",
            });
          }
        }
      } catch {}
    }
    loadUser();
    fetchPeriods();
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [selectedPeriodId, filterStatus, filterSource]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRegistrations();
  };

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
    } catch {
      notify("error", "Gagal memuat tautan klaim WhatsApp.");
    }
  };

  const handleSaveOffline = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOffline(true);
    try {
      const payload = {
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
      setOfflineStudentName("");
      setOfflineGuardianName("");
      setOfflineGuardianPhone("");
      setOfflineExtRef("");
      await fetchRegistrations();
      notify("success", "Pendaftar luring berhasil ditambahkan.");
      if (created.id) {
        await openWaShare(created.id, offlineGuardianName, offlineStudentName);
      }
    } catch (err: any) {
      notify("error", err.message || "Gagal menyimpan entri luring.");
    } finally {
      setSavingOffline(false);
    }
  };

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
      notify("error", err.message || "Gagal memproses CSV.");
    } finally {
      setImportLoading(false);
    }
  };

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
      setShowImportModal(false);
      setImportCsvText("");
      setImportPreviewRows([]);
      setImportSummary(null);
      await fetchRegistrations();
      notify("success", `Berhasil mengimpor ${data.importedCount} data pendaftar luring.`);
    } catch (err: any) {
      notify("error", err.message || "Gagal menyimpan data impor.");
    } finally {
      setImportCommitting(false);
    }
  };

  const handleSyncSiakad = async (regId: string) => {
    try {
      const res = await fetch("/api/handoff/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: regId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        notify("error", data.message || "Gagal sinkronisasi ke SIAKAD.");
      } else {
        notify("success", "Data santri berhasil disinkronkan ke SIAKAD.");
      }
      await fetchRegistrations();
    } catch (err: any) {
      notify("error", err.message || "Gagal melakukan sinkronisasi SIAKAD.");
    }
  };

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
      title: "Portal Penguji",
      items: [
        {
          label: "Portal Observer",
          href: "/observer",
          icon: "assignment_turned_in",
        },
      ],
    },
  ];

  return (
    <AppShell
      serviceName="SPMB"
      userName={currentUser?.fullName || "Panitia SPMB"}
      userRole={currentUser?.role || "PANITIA"}
      sidebarGroups={sidebarGroups}
      onLogout={() => {
        window.location.href = "/login";
      }}
    >
      <div className="max-w-7xl w-full mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-[#454545]">
              Pengelolaan SPMB & Seleksi Santri
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Kelola gelombang pendaftaran, verifikasi pembayaran & berkas, penjadwalan observasi, dan keputusan kelulusan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOfflineModal(true)}
              className="px-3.5 py-2 bg-[#0f7f6d] text-white font-semibold text-xs rounded-md"
            >
              + Entri Offline (Walk-in)
            </button>
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 bg-white border border-[#E3E8E7] text-[#454545] font-semibold text-xs rounded-md"
            >
              Impor CSV Massal
            </button>
          </div>
        </div>

        <AdminNotice notice={notice} onDismiss={() => setNotice(null)} />

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-lg border border-[#E3E8E7]">
            <span className="text-gray-500 text-xs block">Total Pendaftar</span>
            <span className="text-2xl font-bold text-[#454545]">{totalCount}</span>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#E3E8E7]">
            <span className="text-gray-500 text-xs block">Pendaftar Offline</span>
            <span className="text-2xl font-bold text-amber-700">{offlineCount}</span>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#E3E8E7]">
            <span className="text-gray-500 text-xs block">Pendaftar Online</span>
            <span className="text-2xl font-bold text-[#0f7f6d]">{onlineCount}</span>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#E3E8E7]">
            <span className="text-gray-500 text-xs block">Dinyatakan Lulus</span>
            <span className="text-2xl font-bold text-emerald-700">{acceptedCount}</span>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#E3E8E7]">
            <span className="text-gray-500 text-xs block">Masuk ke SIAKAD</span>
            <span className="text-2xl font-bold text-[#0f7f6d]">{handedOffCount}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#E3E8E7] pb-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setAdminTab("overview"); setFilterStatus(""); }}
            className={`px-3 py-1.5 rounded ${adminTab === "overview" ? "bg-[#0f7f6d] text-white" : "bg-white border border-[#E3E8E7]"}`}
          >
            1. Periode & Gelombang
          </button>
          <button
            type="button"
            onClick={() => { setAdminTab("registrations"); setFilterStatus(""); }}
            className={`px-3 py-1.5 rounded ${adminTab === "registrations" ? "bg-[#0f7f6d] text-white" : "bg-white border border-[#E3E8E7]"}`}
          >
            2. Daftar Pendaftar
          </button>
          <button
            type="button"
            onClick={() => { setAdminTab("verification"); setFilterStatus(""); }}
            className={`px-3 py-1.5 rounded ${adminTab === "verification" ? "bg-[#0f7f6d] text-white" : "bg-white border border-[#E3E8E7]"}`}
          >
            3. Verifikasi Pembayaran & Berkas
          </button>
          <button
            type="button"
            onClick={() => { setAdminTab("observations"); setFilterStatus(""); }}
            className={`px-3 py-1.5 rounded ${adminTab === "observations" ? "bg-[#0f7f6d] text-white" : "bg-white border border-[#E3E8E7]"}`}
          >
            4. Jadwal & Penugasan Penguji
          </button>
          <button
            type="button"
            onClick={() => { setAdminTab("decisions"); setFilterStatus(""); }}
            className={`px-3 py-1.5 rounded ${adminTab === "decisions" ? "bg-[#0f7f6d] text-white" : "bg-white border border-[#E3E8E7]"}`}
          >
            5. Keputusan & Handoff SIAKAD
          </button>
        </div>

        {adminTab === "overview" && (
          <PeriodManagementPanel
            periods={periods}
            onChanged={fetchPeriods}
            onNotify={notify}
          />
        )}

        {adminTab === "verification" && (
          <RegistrationReviewPanel
            registrations={registrations}
            onChanged={fetchRegistrations}
            onNotify={notify}
          />
        )}

        {adminTab === "observations" && (
          <div className="space-y-5">
            <ObservationSchedulePanel periodId={selectedPeriodId} onNotify={notify} />
            <ObserverAssignmentPanel periodId={selectedPeriodId} onNotify={notify} />
          </div>
        )}

        {adminTab === "decisions" && (
          <DecisionPanel
            candidates={registrations}
            onChanged={fetchRegistrations}
            onNotify={notify}
          />
        )}

        <div className="bg-white p-4 rounded-lg border border-[#E3E8E7] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-[#E3E8E7] rounded bg-white"
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
              className="px-3 py-1.5 text-xs font-semibold border border-[#E3E8E7] rounded bg-white"
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
              className="px-3 py-1.5 text-xs font-semibold border border-[#E3E8E7] rounded bg-white"
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
              className="px-3 py-1.5 text-xs border border-[#E3E8E7] rounded flex-1 sm:w-56"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#F7F8F8] border border-[#E3E8E7] text-[#454545] text-xs font-semibold rounded"
            >
              Cari
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg border border-[#E3E8E7] overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">Memuat data pendaftar...</div>
          ) : error ? (
            <div className="p-8 text-center text-xs text-red-700 bg-red-50">{error}</div>
          ) : registrations.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs">
              Tidak ada data pendaftar yang sesuai filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#454545]">
                <thead className="bg-[#F7F8F8] text-gray-500 uppercase text-[11px] border-b border-[#E3E8E7]">
                  <tr>
                    <th className="py-3 px-4">No. Registrasi</th>
                    <th className="py-3 px-4">Calon Siswa</th>
                    <th className="py-3 px-4">Wali</th>
                    <th className="py-3 px-4">Jalur</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Observasi</th>
                    <th className="py-3 px-4">SIAKAD</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8E7]">
                  {registrations.map((reg) => (
                    <tr key={reg.id}>
                      <td className="py-3 px-4 font-mono font-semibold">
                        {reg.registrationNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {reg.studentData?.fullName || "Calon Siswa"}
                      </td>
                      <td className="py-3 px-4">
                        <div>{reg.guardianName}</div>
                        <div className="text-[11px] text-gray-500">{reg.guardianPhone}</div>
                      </td>
                      <td className="py-3 px-4 uppercase text-[11px]">{reg.source}</td>
                      <td className="py-3 px-4">{reg.status}</td>
                      <td className="py-3 px-4">
                        {reg.observationResult ? `Skor ${reg.observationResult.score}` : "-"}
                      </td>
                      <td className="py-3 px-4">{reg.handoffStatus}</td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => openWaShare(reg.id, reg.guardianName, reg.studentData?.fullName || "Calon Siswa")}
                          className="px-2.5 py-1 rounded border border-[#E3E8E7] text-[11px] font-semibold"
                        >
                          Tautan Klaim
                        </button>
                        {reg.status === "accepted" && reg.handoffStatus !== "done" && (
                          <button
                            type="button"
                            onClick={() => handleSyncSiakad(reg.id)}
                            className="px-2.5 py-1 rounded bg-[#0f7f6d] text-white text-[11px] font-semibold"
                          >
                            Kirim SIAKAD
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showOfflineModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 border border-[#E3E8E7]">
            <h2 className="font-heading font-bold text-base text-[#454545] mb-4">Entri Pendaftar Offline (Walk-in)</h2>
            <form onSubmit={handleSaveOffline} className="space-y-3 text-xs">
              <input
                required
                placeholder="Nama Calon Siswa"
                value={offlineStudentName}
                onChange={(e) => setOfflineStudentName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E3E8E7] rounded"
              />
              <input
                required
                placeholder="Nama Orang Tua / Wali"
                value={offlineGuardianName}
                onChange={(e) => setOfflineGuardianName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E3E8E7] rounded"
              />
              <input
                required
                placeholder="No. WhatsApp Wali"
                value={offlineGuardianPhone}
                onChange={(e) => setOfflineGuardianPhone(e.target.value)}
                className="w-full px-3 py-2 border border-[#E3E8E7] rounded"
              />
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E3E8E7]">
                <button type="button" onClick={() => setShowOfflineModal(false)} className="px-4 py-2 border border-[#E3E8E7] rounded">
                  Batal
                </button>
                <button type="submit" disabled={savingOffline} className="px-4 py-2 bg-[#0f7f6d] text-white rounded font-semibold">
                  {savingOffline ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 border border-[#E3E8E7] space-y-4 text-xs">
            <h2 className="font-heading font-bold text-base text-[#454545]">Impor Pendaftar Luring Massal (CSV)</h2>
            <textarea
              rows={5}
              value={importCsvText}
              onChange={(e) => setImportCsvText(e.target.value)}
              className="w-full px-3 py-2 border border-[#E3E8E7] rounded font-mono"
            />
            <div className="flex justify-between">
              <button type="button" onClick={handlePreviewImport} disabled={importLoading} className="px-3 py-1.5 border border-[#E3E8E7] rounded font-semibold">
                Pratinjau
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowImportModal(false)} className="px-3 py-1.5 border border-[#E3E8E7] rounded">
                  Tutup
                </button>
                <button type="button" onClick={handleCommitImport} disabled={importCommitting} className="px-4 py-1.5 bg-[#0f7f6d] text-white rounded font-semibold">
                  Simpan Impor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {waLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 border border-[#E3E8E7] space-y-3 text-xs">
            <h3 className="font-heading font-bold text-base text-[#454545]">Tautan Klaim Akun Wali</h3>
            <p className="text-gray-600">
              Wali: <strong>{waLinkModal.guardianName}</strong> · Santri: <strong>{waLinkModal.studentName}</strong>
            </p>
            <div className="p-3 bg-[#F7F8F8] border border-[#E3E8E7] rounded font-mono break-all">
              {waLinkModal.claimUrl}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setWaLinkModal(null)} className="px-3 py-1.5 border border-[#E3E8E7] rounded">
                Tutup
              </button>
              <a href={waLinkModal.waLink} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#0f7f6d] text-white rounded font-semibold">
                Buka WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
