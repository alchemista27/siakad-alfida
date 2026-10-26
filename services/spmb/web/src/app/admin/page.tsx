"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@alfida/ui";
import { AdminNotice, type AdminNoticeState } from "@/components/admin/admin-notice";
import { PeriodManagementPanel, type AdminPeriodItem } from "@/components/admin/period-management-panel";
import { ObservationSchedulePanel } from "@/components/admin/observation-schedule-panel";
import { ObserverAssignmentPanel } from "@/components/admin/observer-assignment-panel";
import { RegistrationReviewPanel } from "@/components/admin/registration-review-panel";
import { DecisionPanel } from "@/components/admin/decision-panel";
import { getCurrentSsoUser, SsoClientError } from "@/lib/sso-client";

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

type RegistrationLoadState =
  | { kind: "loading" }
  | { kind: "ready"; data: Registration[] }
  | { kind: "forbidden"; message: string }
  | { kind: "error"; message: string };

export default function SpmbAdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [periods, setPeriods] = useState<AdminPeriodItem[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<{ fullName: string; role: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authRetry, setAuthRetry] = useState(0);
  const [userEmail, setUserEmail] = useState<string>("");
  const [adminTab, setAdminTab] = useState<"overview" | "registrations" | "verification" | "observations" | "decisions">("registrations");
  const [loading, setLoading] = useState(true);
  const [registrationLoadState, setRegistrationLoadState] = useState<RegistrationLoadState>({ kind: "loading" });
  const [notice, setNotice] = useState<AdminNoticeState | null>(null);


  const [waLinkModal, setWaLinkModal] = useState<{
    waLink: string;
    claimUrl: string;
    guardianName: string;
    studentName: string;
  } | null>(null);

  const notify = (type: "success" | "error", message: string) => {
    setNotice({ type, message });
  };

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (["overview", "registrations", "verification", "observations", "decisions"].includes(tab ?? "")) {
      setAdminTab(tab as "overview" | "registrations" | "verification" | "observations" | "decisions");
    }
  }, []);

  const fetchPeriods = async () => {
    try {
      const res = await fetch("/api/periods");
      if (res.ok) {
        const data = await res.json();
        setPeriods(data);
        if (data.length > 0 && !selectedPeriodId) {
          setSelectedPeriodId(data[0].id);

        }
      }
    } catch {
      notify("error", "Gagal memuat daftar periode.");
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    setRegistrationLoadState({ kind: "loading" });
    try {
      const params = new URLSearchParams();
      if (selectedPeriodId) params.append("periodId", selectedPeriodId);
      if (filterStatus) params.append("status", filterStatus);

      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/registrations?${params.toString()}`);
      if (res.status === 401 || res.status === 403) {
        setRegistrationLoadState({ kind: "forbidden", message: "Akses terbatas untuk panitia / admin unit SPMB." });
        return;
      }
      if (!res.ok) {
        setRegistrationLoadState({ kind: "error", message: "Gagal mengambil data pendaftar." });
        return;
      }
      const data = await res.json();
      const normalized = Array.isArray(data) ? data as Registration[] : [];
      setRegistrations(normalized);
      setRegistrationLoadState({ kind: "ready", data: normalized });
    } catch {
      setRegistrationLoadState({ kind: "error", message: "Gagal mengambil data pendaftar." });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.alfida.or.id";
    try {
      await fetch(`${authUrl}/api/auth/logout`, {
        credentials: "include",
        method: "POST",
      });
    } catch {}
    window.location.href = `${authUrl}/login`;
  };

  useEffect(() => {
    async function loadUserAndInit() {
      const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.alfida.or.id";
      try {
        const data = { user: await getCurrentSsoUser() };
        if (!data.user) {
          window.location.href = `${authUrl}/login?return_to=${encodeURIComponent(window.location.href)}`;
          return;
        }

        setUserEmail(data.user.email || "");

        // Validasi peran RBAC untuk portal Panitia SPMB
        const allowedRoles = ["super_admin", "admin_unit", "tim_ppdb"];
        const hasAccess = data.user.roles?.some((r: any) => {
          const roleName = typeof r === "string" ? r : r.role;
          const appName = typeof r === "string" ? "*" : r.app || "*";
          if (roleName === "super_admin" && (appName === "*" || appName === "auth" || appName === "core")) {
            return true;
          }
          if (appName === "*" || appName === "spmb") {
            return allowedRoles.includes(roleName);
          }
          return false;
        });

        if (!hasAccess) {
          setAccessDenied(true);
          setAuthLoading(false);
          return;
        }

        const primaryRole = data.user.roles?.find((r: any) => {
          const roleName = typeof r === "string" ? r : r.role;
          return allowedRoles.includes(roleName);
        });
        const roleRaw = (typeof primaryRole === "object" ? primaryRole?.role : primaryRole) || "PANITIA";
        const roleLabel = roleRaw.replace(/_/g, " ").toUpperCase();

        setCurrentUser({
          fullName: data.user.fullName || data.user.email || "Panitia SPMB",
          role: roleLabel,
        });
        setAuthLoading(false);
        fetchPeriods();
      } catch (error) {
        if (error instanceof SsoClientError && error.kind === "unauthorized") {
          window.location.href = `${authUrl}/login?return_to=${encodeURIComponent(window.location.href)}`;
          return;
        }
        setAuthError(error instanceof Error ? error.message : "Layanan identitas belum dapat dimuat.");
        setAuthLoading(false);
      }
    }
    void loadUserAndInit();
  }, [authRetry]);

  useEffect(() => {
    if (!authLoading && !accessDenied && !authError) {
      fetchRegistrations();
    }
  }, [selectedPeriodId, filterStatus, authLoading, accessDenied, authError]);

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
      ],
    },
    {
      title: "Portal",
      items: [
        {
          label: "Pengaturan Observer",
          href: "/admin?tab=observations",
          icon: "assignment_turned_in",
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] flex flex-col items-center justify-center p-6 text-[#454545] font-body">
        <div className="w-10 h-10 border-3 border-[#0f7f6d] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-600">Memverifikasi sesi & wewenang SPMB...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] flex items-center justify-center p-6 text-[#454545] font-body">
        <div className="spmb-card max-w-md w-full p-6 text-center space-y-4">
          <span className="material-symbols-rounded text-3xl text-red-600" aria-hidden="true">cloud_off</span>
          <h2 className="text-xl font-bold font-heading text-[#454545]">Akses SPMB Belum Dapat Dimuat</h2>
          <p className="text-xs text-gray-500 leading-relaxed">{authError}</p>
          <button
            type="button"
            onClick={() => {
              setAuthError(null);
              setAuthLoading(true);
              setAuthRetry((value) => value + 1);
            }}
            className="spmb-button-primary text-xs"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] flex items-center justify-center p-6 text-[#454545] font-body">
        <div className="spmb-card max-w-md w-full p-6 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <span className="material-symbols-rounded text-3xl">gpp_maybe</span>
          </div>
          <h2 className="text-xl font-bold font-heading text-[#454545]">Akses Ditolak</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Akun Anda ({userEmail || "pengguna"}) tidak memiliki wewenang Panitia SPMB (Super Admin, Admin Unit, atau Tim PPDB).
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <a
              href="https://auth.alfida.or.id/modules"
              className="spmb-button-primary text-xs"
            >
              Kembali ke Portal Modul
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="spmb-button-secondary text-xs"
            >
              Ganti Akun
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      serviceName="SPMB"
      userName={currentUser?.fullName || "Panitia SPMB"}
      userRole={currentUser?.role || "PANITIA"}
      sidebarGroups={sidebarGroups}
      onLogout={handleLogout}
      topbarActions={
        <a
          href="https://auth.alfida.or.id/modules"
          className="text-xs font-semibold text-tertiary hover:underline inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#e6f4f1]"
        >
          <span className="material-symbols-rounded text-[16px]">apps</span>
          <span className="hidden sm:inline">Pilih Modul</span>
        </a>
      }
    >
      <div className="max-w-7xl w-full mx-auto space-y-6">
        <div className="spmb-card rounded-md p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tertiary">Funnel seleksi santri</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-primary/75">
            {['Pendaftaran', 'Berkas', 'Observasi', 'Keputusan', 'SIAKAD'].map((stage, index) => <React.Fragment key={stage}><span className="rounded-sm border border-border bg-neutral px-2.5 py-1.5">{stage}</span>{index < 4 ? <span className="material-symbols-rounded text-base text-tertiary" aria-hidden="true">arrow_forward</span> : null}</React.Fragment>)}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-[#454545]">
              Pengelolaan SPMB & Seleksi Santri
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Kelola gelombang pendaftaran, verifikasi pembayaran & berkas, penjadwalan observasi, dan keputusan kelulusan.
            </p>
          </div>
        </div>

        <AdminNotice notice={notice} onDismiss={() => setNotice(null)} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="spmb-card p-4">
            <span className="text-gray-500 text-xs block">Total Pendaftar</span>
            <span className="text-2xl font-bold text-[#454545]">{totalCount}</span>
          </div>
          <div className="spmb-card p-4">
            <span className="text-gray-500 text-xs block">Dinyatakan Lulus</span>
            <span className="text-2xl font-bold text-emerald-700">{acceptedCount}</span>
          </div>
          <div className="spmb-card p-4">
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

        <div className="spmb-card flex flex-wrap items-center justify-between gap-3 p-4">
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
          {loading || registrationLoadState.kind === "loading" ? (
            <div className="py-12 text-center text-xs text-gray-500">Memuat data pendaftar...</div>
          ) : registrationLoadState.kind === "forbidden" ? (
            <div className="p-8 text-center text-xs text-red-700 bg-red-50">{registrationLoadState.message}</div>
          ) : registrationLoadState.kind === "error" ? (
            <div className="space-y-3 p-8 text-center text-xs text-red-700 bg-red-50">
              <p>{registrationLoadState.message}</p>
              <button type="button" onClick={fetchRegistrations} className="rounded-sm border border-red-200 bg-white px-3 py-1.5 font-semibold text-red-700">Coba lagi</button>
            </div>
          ) : registrations.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs">
              {!filterStatus && !searchQuery ? "Belum ada pendaftar" : "Tidak ada pendaftar yang sesuai filter."}
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
