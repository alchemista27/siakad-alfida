"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@alfida/ui";
import { AdminNotice, type AdminNoticeState } from "@/components/admin/admin-notice";
import {
  ObserverWorklist,
  type ObserverCandidateItem,
} from "@/components/observer/observer-worklist";
import { ObserverScoreModal } from "@/components/observer/observer-score-modal";
import { getCurrentSsoUser, SsoClientError } from "@/lib/sso-client";

interface Period {
  id: string;
  unitName: string;
  label: string;
  isOpen: boolean;
  quota: number;
}

interface RankingItem {
  rank: number;
  registrationId: string;
  registrationNumber: string;
  studentName: string;
  score: number;
  notes: string | null;
  status: string;
}

export default function ObserverPage() {
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.alfida.or.id";
  const modulePortalUrl = `${authUrl}/modules`;
  const [currentUser, setCurrentUser] = useState<{ fullName: string; role: string; email?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authRetry, setAuthRetry] = useState(0);
  const [userEmail, setUserEmail] = useState<string>("");
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"assess" | "rankings">("assess");
  const [candidates, setCandidates] = useState<ObserverCandidateItem[]>([]);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<AdminNoticeState | null>(null);
  const [activeCandidate, setActiveCandidate] = useState<ObserverCandidateItem | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(85);
  const [notesInput, setNotesInput] = useState<string>("");

  const sidebarGroups = [
    {
      title: "Portal",
      items: [
        {
          label: "Portal Admin",
          href: "/admin",
          icon: "admin_panel_settings",
        },
      ],
    },
    {
      title: "Sistem",
      items: [
        {
          label: "Portal Modul",
          href: modulePortalUrl,
          icon: "apps",
        },
      ],
    },
  ];

  const handleLogout = async () => {
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
      try {
        const data = { user: await getCurrentSsoUser() };
        if (!data.user) {
          window.location.href = `${authUrl}/login?return_to=${encodeURIComponent(window.location.href)}`;
          return;
        }

        setUserEmail(data.user.email || "");

        const roleEntries = Array.isArray(data.user.roles) ? data.user.roles : [];
        const hasRole = (wanted: string) => roleEntries.some((entry: any) => {
          const role = typeof entry === "string" ? entry : entry?.role;
          const app = typeof entry === "string" ? "*" : entry?.app || "*";
          return role === wanted && (app === "*" || app === "spmb");
        });
        const hasObserverRole = hasRole("observer") || roleEntries.some((entry: any) => {
          const role = typeof entry === "string" ? entry : entry?.role;
          const app = typeof entry === "string" ? "*" : entry?.app || "*";
          return role === "super_admin" && ["*", "auth", "core", "spmb"].includes(app);
        });
        const hasAdminUnitRole = hasRole("admin_unit");

        if (!hasObserverRole && hasAdminUnitRole) {
          window.location.replace("/admin?tab=observations");
          return;
        }
        if (!hasObserverRole) {
          setAccessDenied(true);
          setAuthLoading(false);
          return;
        }

        const primaryRole = roleEntries.find((entry: any) => {
          const roleName = typeof entry === "string" ? entry : entry?.role;
          return roleName === "observer" || roleName === "super_admin";
        });
        const roleRaw = (typeof primaryRole === "object" ? primaryRole?.role : primaryRole) || "OBSERVER";
        const roleLabel = roleRaw.replace(/_/g, " ").toUpperCase();

        setCurrentUser({
          fullName: data.user.fullName || data.user.email || "Penguji SPMB",
          role: roleLabel,
        });
        setAuthLoading(false);

        try {
          const resPeriods = await fetch("/api/periods");
          if (resPeriods.ok) {
            const dataPeriods = await resPeriods.json();
            setPeriods(dataPeriods);
            if (dataPeriods.length > 0) setSelectedPeriodId(dataPeriods[0].id);
          }
        } catch {
          setNotice({ type: "error", message: "Gagal memuat daftar periode." });
        }
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

  const fetchData = async () => {
    if (!selectedPeriodId) return;
    setLoading(true);
    try {
      if (activeTab === "assess") {
        const res = await fetch(`/api/observers/me/worklist?periodId=${encodeURIComponent(selectedPeriodId)}`);
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data?.message || "Gagal memuat daftar kerja penguji.");
        setCandidates(Array.isArray(data) ? data : []);
      } else {
        const res = await fetch(`/api/observers/me/rankings?periodId=${encodeURIComponent(selectedPeriodId)}`);
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data?.message || "Gagal memuat peringkat observasi.");
        setRankings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setNotice({
        type: "error",
        message: err instanceof Error ? err.message : "Gagal memuat data observasi.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !accessDenied && !authError) {
      fetchData();
    }
  }, [selectedPeriodId, activeTab, authLoading, accessDenied, authError]);

  const handleOpenScoreModal = (candidate: ObserverCandidateItem) => {
    setActiveCandidate(candidate);
    setScoreInput(candidate.observationResult?.score ?? 80);
    setNotesInput(candidate.observationResult?.notes ?? "");
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCandidate) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/observers/me/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: activeCandidate.id,
          score: Number(scoreInput),
          notes: notesInput.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Gagal menyimpan hasil penilaian.");
      setNotice({
        type: "success",
        message: `Penilaian untuk ${activeCandidate.studentData?.fullName || "calon santri"} berhasil disimpan.`,
      });
      setActiveCandidate(null);
      await fetchData();
    } catch (err) {
      setNotice({
        type: "error",
        message: err instanceof Error ? err.message : "Gagal menyimpan penilaian.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] flex flex-col items-center justify-center p-6 text-[#454545] font-body">
        <div className="w-10 h-10 border-3 border-[#0f7f6d] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-600">Memverifikasi sesi & wewenang penguji...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] flex items-center justify-center p-6 text-[#454545] font-body">
        <div className="spmb-card max-w-md w-full p-6 text-center space-y-4">
          <span className="material-symbols-rounded text-3xl text-red-600" aria-hidden="true">cloud_off</span>
          <h2 className="text-xl font-bold font-heading text-[#454545]">Akses Penguji Belum Dapat Dimuat</h2>
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
            Akun Anda ({userEmail || "pengguna"}) tidak terdaftar sebagai Penguji Observasi atau Panitia SPMB.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <a
              href={modulePortalUrl}
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
      serviceName="SPMB · Penguji"
      userName={currentUser?.fullName || "Penguji SPMB"}
      userRole={currentUser?.role || "OBSERVER"}
      sidebarGroups={sidebarGroups}
      onLogout={handleLogout}
      topbarActions={
        <>
          <a
            href="/admin"
            className="text-xs font-semibold text-tertiary hover:underline inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#e6f4f1]"
          >
            <span className="material-symbols-rounded text-[16px]">admin_panel_settings</span>
            <span className="hidden sm:inline">Portal Admin</span>
          </a>
          <a
            href={modulePortalUrl}
            className="text-xs font-semibold text-tertiary hover:underline inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#e6f4f1]"
          >
            <span className="material-symbols-rounded text-[16px]">apps</span>
            <span className="hidden sm:inline">Portal Modul</span>
          </a>
        </>
      }
    >
      <div className="max-w-6xl w-full mx-auto space-y-5">
        <div className="spmb-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-xl text-[#454545]">Penilaian & Observasi Calon Santri</h1>
            <p className="text-xs text-gray-500 mt-1">
              Daftar kandidat terbatas pada unit tempat Anda ditugaskan sebagai penguji.
            </p>
          </div>
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="spmb-input max-w-xs font-semibold"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.unitName} · {p.label}
              </option>
            ))}
          </select>
        </div>

        <AdminNotice notice={notice} onDismiss={() => setNotice(null)} />

        <div className="flex gap-2 border-b border-[#E3E8E7] pb-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("assess")}
            className={`px-3 py-1.5 rounded ${activeTab === "assess" ? "bg-[#0f7f6d] text-white" : "bg-white border border-[#E3E8E7]"}`}
          >
            Daftar Kandidat Observasi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rankings")}
            className={`px-3 py-1.5 rounded ${activeTab === "rankings" ? "bg-[#0f7f6d] text-white" : "bg-white border border-[#E3E8E7]"}`}
          >
            Peringkat Hasil Observasi
          </button>
        </div>

        {loading ? (
          <div className="bg-white border border-[#E3E8E7] rounded-lg p-8 text-center text-xs text-gray-500">
            Memuat data observasi...
          </div>
        ) : activeTab === "assess" ? (
          <ObserverWorklist candidates={candidates} onSelectCandidate={handleOpenScoreModal} />
        ) : (
          <div className="bg-white border border-[#E3E8E7] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8F8] border-b border-[#E3E8E7] text-[11px] uppercase text-gray-500">
                <tr>
                  <th className="py-3 px-4">Peringkat</th>
                  <th className="py-3 px-4">No. Registrasi</th>
                  <th className="py-3 px-4">Nama Santri</th>
                  <th className="py-3 px-4 text-center">Skor</th>
                  <th className="py-3 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8E7]">
                {rankings.map((item) => (
                  <tr key={item.registrationId}>
                    <td className="py-3 px-4 font-bold">#{item.rank}</td>
                    <td className="py-3 px-4 font-mono">{item.registrationNumber}</td>
                    <td className="py-3 px-4 font-semibold">{item.studentName}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#0f7f6d]">{item.score}</td>
                    <td className="py-3 px-4 text-gray-600">{item.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ObserverScoreModal
        candidate={activeCandidate}
        score={scoreInput}
        notes={notesInput}
        submitting={submitting}
        onScoreChange={setScoreInput}
        onNotesChange={setNotesInput}
        onClose={() => setActiveCandidate(null)}
        onSubmit={handleSubmitScore}
      />
    </AppShell>
  );
}
