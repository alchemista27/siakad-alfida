"use client";

import { isFoundationLeader } from "@alfida/contracts";
import { useEffect, useState } from "react";
import { getCurrentSsoUser, SsoClientError } from "@/lib/sso-client";

type Period = {
  id: string;
  unitName: string;
  label: string;
  educationLevel: string;
  isOpen: boolean;
  quota: number;
  _count?: { registrations?: number };
};

type Statistics = {
  total: number;
  acceptedCount: number;
  rejectedCount: number;
  observationDoneCount: number;
  pendingVerificationCount: number;
  handedOffCount: number;
};

type DashboardPeriod = Period & { statistics?: Statistics; error?: string };

function number(value: number | undefined) {
  return new Intl.NumberFormat("id-ID").format(value || 0);
}

export default function SpmbExecutivePage() {
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.alfida.or.id";
  const [name, setName] = useState("Pimpinan Yayasan");
  const [periods, setPeriods] = useState<DashboardPeriod[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "denied" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const user = await getCurrentSsoUser();
        if (!isFoundationLeader(user.roles || [])) {
          if (active) setState("denied");
          return;
        }
        if (active) setName(user.fullName || user.email || "Pimpinan Yayasan");

        const periodsResponse = await fetch("/api/periods", { credentials: "include", cache: "no-store" });
        if (!periodsResponse.ok) {
          throw new Error("Dashboard SPMB tidak dapat memuat daftar periode.");
        }
        const loadedPeriods = (await periodsResponse.json()) as Period[];
        const withStatistics = await Promise.all(loadedPeriods.map(async (period) => {
          const response = await fetch(`/api/decisions/statistics/${encodeURIComponent(period.id)}`, {
            credentials: "include",
            cache: "no-store",
          });
          if (!response.ok) {
            return { ...period, error: "Statistik belum dapat dimuat." };
          }
          return { ...period, statistics: await response.json() as Statistics };
        }));
        if (active) {
          setPeriods(withStatistics);
          setState("ready");
        }
      } catch (error) {
        if (!active) return;
        if (error instanceof SsoClientError && error.kind === "unauthorized") {
          window.location.replace(`${authUrl}/login?return_to=${encodeURIComponent(window.location.href)}`);
          return;
        }
        setMessage(error instanceof Error ? error.message : "Dashboard SPMB belum dapat dimuat.");
        setState("error");
      }
    }

    void load();
    return () => { active = false; };
  }, [authUrl]);

  const totalRegistrations = periods.reduce((sum, item) => sum + (item.statistics?.total || item._count?.registrations || 0), 0);
  const totalAccepted = periods.reduce((sum, item) => sum + (item.statistics?.acceptedCount || 0), 0);
  const totalHandedOff = periods.reduce((sum, item) => sum + (item.statistics?.handedOffCount || 0), 0);

  return (
    <main className="min-h-screen bg-neutral px-4 py-8 font-body text-primary sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-tertiary">SPMB · Read-only</p>
            <h1 className="mt-1 font-heading text-3xl font-bold">Dashboard Pimpinan</h1>
            <p className="mt-2 text-sm text-slate-600">Ringkasan penerimaan murid lintas unit tanpa akses pengelolaan operasional.</p>
          </div>
          <div className="text-sm text-slate-600"><span className="font-semibold text-primary">{name}</span><br />Pimpinan Yayasan</div>
        </header>

        {state === "loading" && <p className="py-16 text-center text-sm text-slate-500">Memuat dashboard SPMB…</p>}

        {state === "denied" && (
          <section className="mx-auto mt-10 max-w-xl rounded-lg border border-border bg-surface p-6 text-center">
            <h2 className="font-heading text-xl font-bold">Akses Pimpinan Tidak Ditemukan</h2>
            <p className="mt-2 text-sm text-slate-600">Dashboard ini hanya tersedia bagi akun dengan assignment Pimpinan Yayasan.</p>
            <a className="mt-5 inline-flex rounded-sm bg-tertiary px-4 py-2 text-sm font-semibold text-white" href={`${authUrl}/modules`}>Kembali ke Portal Modul</a>
          </section>
        )}

        {state === "error" && (
          <section className="mx-auto mt-10 max-w-xl rounded-lg border border-rose-200 bg-surface p-6 text-center">
            <h2 className="font-heading text-xl font-bold">Dashboard Belum Dapat Dimuat</h2>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
          </section>
        )}

        {state === "ready" && <>
          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <article className="rounded-lg border border-border bg-surface p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total pendaftar</p><p className="mt-2 font-heading text-3xl font-bold">{number(totalRegistrations)}</p></article>
            <article className="rounded-lg border border-border bg-surface p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Diterima</p><p className="mt-2 font-heading text-3xl font-bold text-tertiary">{number(totalAccepted)}</p></article>
            <article className="rounded-lg border border-border bg-surface p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Terserah ke SIAKAD</p><p className="mt-2 font-heading text-3xl font-bold">{number(totalHandedOff)}</p></article>
          </section>

          <section className="mt-6 overflow-hidden rounded-lg border border-border bg-surface">
            <div className="border-b border-border px-5 py-4"><h2 className="font-heading text-xl font-bold">Periode Penerimaan</h2></div>
            {periods.length === 0 ? <p className="px-5 py-10 text-sm text-slate-500">Belum ada periode penerimaan yang tercatat.</p> : (
              <div className="divide-y divide-border">
                {periods.map((period) => <article key={period.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1.5fr_repeat(5,minmax(0,1fr))] lg:items-center">
                  <div><p className="font-semibold text-primary">{period.unitName}</p><p className="mt-1 text-sm text-slate-600">{period.label} · {period.educationLevel.toUpperCase()} · {period.isOpen ? "Dibuka" : "Ditutup"}</p></div>
                  <Metric label="Pendaftar" value={period.statistics?.total ?? period._count?.registrations} />
                  <Metric label="Menunggu verifikasi" value={period.statistics?.pendingVerificationCount} />
                  <Metric label="Observasi" value={period.statistics?.observationDoneCount} />
                  <Metric label="Diterima" value={period.statistics?.acceptedCount} />
                  <Metric label="Handoff" value={period.statistics?.handedOffCount} />
                  {period.error && <p className="text-xs text-amber-700 lg:col-span-6">{period.error}</p>}
                </article>)}
              </div>
            )}
          </section>
        </>}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value?: number }) {
  return <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-primary">{number(value)}</p></div>;
}
