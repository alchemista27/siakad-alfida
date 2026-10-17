"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SpmbNavbar } from "@/components/SpmbNavbar";
import { ParentRegistrationStepper } from "@/components/parent/parent-registration-stepper";
import {
  apiRequest,
  getStageRouteForRegistration,
  loadParentRegistration,
  type ParentRegistration,
} from "@/lib/spmb-registration";

interface ObservationScheduleItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  quota: number;
  booked: number;
  _count?: { bookings: number };
}

export default function ParentObservationPage() {
  const [registration, setRegistration] = useState<ParentRegistration | null>(null);
  const [schedules, setSchedules] = useState<ObservationScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const refresh = async () => {
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const reg = await loadParentRegistration(params?.get("registrationId"));
    setRegistration(reg);
    if (reg?.period?.id && (reg.dossierReviewStatus === "approved" || reg.status === "observation_scheduled")) {
      const list = await apiRequest<ObservationScheduleItem[]>(`/api/observations/schedules/${encodeURIComponent(reg.period.id)}`).catch(() => []);
      setSchedules(Array.isArray(list) ? list : []);
    }
  };

  useEffect(() => {
    refresh()
      .catch((err) => setNotice({ type: "error", message: err instanceof Error ? err.message : "Gagal memuat jadwal observasi." }))
      .finally(() => setLoading(false));
  }, []);

  const handleBook = async (scheduleId: string) => {
    if (!registration) return;
    setBusy(true);
    setNotice(null);
    try {
      await apiRequest("/api/observations/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: registration.id,
          observationScheduleId: scheduleId,
        }),
      });
      await refresh();
      setNotice({ type: "success", message: "Jadwal observasi berhasil dipilih." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Gagal memilih jadwal observasi." });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-neutral"><span className="material-symbols-rounded animate-spin text-tertiary text-3xl">progress_activity</span></div>;
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-neutral text-primary font-body">
        <SpmbNavbar />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <Link href="/parent" className="text-xs font-semibold text-tertiary hover:underline">Kembali ke Daftar Pendaftaran</Link>
        </main>
      </div>
    );
  }

  const canSelectSchedule =
    (registration.status === "verification" && registration.dossierReviewStatus === "approved") ||
    registration.status === "observation_scheduled";

  return (
    <div className="min-h-screen bg-neutral text-primary font-body">
      <SpmbNavbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <ParentRegistrationStepper registration={registration} />

        {notice && (
          <div className={`mt-6 border rounded-md p-4 text-sm ${notice.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-[#e6f4f1] border-[#b9ded7] text-[#0b6355]"}`}>
            {notice.message}
          </div>
        )}

        <section className="mt-6 bg-surface border border-border rounded-lg p-6">
          <h1 className="font-heading font-bold text-2xl">Tahap 5 — Jadwal Observasi</h1>
          {registration.observationBooking?.schedule && (
            <div className="mt-4 border border-[#b9ded7] bg-[#e6f4f1] text-[#0b6355] rounded-md p-4 text-sm">
              Jadwal terpilih: <strong>{new Date(registration.observationBooking.schedule.date).toLocaleDateString("id-ID")}</strong> pukul{" "}
              <strong>{registration.observationBooking.schedule.startTime} – {registration.observationBooking.schedule.endTime}</strong>
            </div>
          )}

          {canSelectSchedule ? (
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              {schedules.map((item) => {
                const used = Math.max(item.booked, item._count?.bookings ?? 0);
                const full = used >= item.quota;
                return (
                  <div key={item.id} className="border border-border rounded-md p-4 bg-white flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">{new Date(item.date).toLocaleDateString("id-ID")}</p>
                      <p className="text-xs text-gray-600">{item.startTime} – {item.endTime} · Kuota {used}/{item.quota}</p>
                    </div>
                    <button
                      type="button"
                      disabled={busy || full}
                      onClick={() => handleBook(item.id)}
                      className="px-3 py-1.5 bg-tertiary hover:bg-[#0b6355] disabled:opacity-50 text-white rounded-sm text-xs font-semibold"
                    >
                      {full ? "Penuh" : "Pilih Jadwal"}
                    </button>
                  </div>
                );
              })}
              {schedules.length === 0 && <p className="text-sm text-gray-500">Belum ada jadwal observasi yang dibuka untuk periode ini.</p>}
            </div>
          ) : registration.status === "observation_done" ? (
            <div className="mt-5 border border-border bg-neutral rounded-md p-4 text-sm">
              <p>Observasi telah selesai dilaksanakan. Hasil seleksi akan diumumkan pada halaman Keputusan.</p>
            </div>
          ) : (
            <div className="mt-5 border border-border bg-neutral rounded-md p-4 text-sm">
              <p>Jadwal observasi baru dapat dipilih setelah seluruh berkas dan pemeriksaan kesehatan disetujui panitia.</p>
              <Link href={getStageRouteForRegistration(registration)} className="mt-3 inline-block text-xs font-semibold text-tertiary hover:underline">
                Buka Tahap Aktif Saat Ini
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
