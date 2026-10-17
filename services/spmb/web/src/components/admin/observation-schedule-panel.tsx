"use client";

import { FormEvent, useEffect, useState } from "react";

interface ScheduleRow {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  quota: number;
  booked: number;
  _count?: { bookings: number };
}

export function ObservationSchedulePanel({
  periodId,
  onNotify,
}: {
  periodId: string;
  onNotify: (type: "success" | "error", message: string) => void;
}) {
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [quota, setQuota] = useState(15);
  const [busy, setBusy] = useState(false);

  const loadSchedules = async () => {
    if (!periodId) return;
    const res = await fetch(`/api/observations/schedules/${encodeURIComponent(periodId)}`);
    if (res.ok) setSchedules(await res.json());
  };

  useEffect(() => {
    loadSchedules().catch(() => {});
  }, [periodId]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!periodId) return;
    setBusy(true);
    try {
      const res = await fetch("/api/observations/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodId, date, startTime, endTime, quota: Number(quota) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Gagal membuat jadwal observasi.");
      await loadSchedules();
      onNotify("success", "Jadwal observasi berhasil ditambahkan.");
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Gagal membuat jadwal.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/observations/schedules/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Gagal menghapus jadwal observasi.");
      await loadSchedules();
      onNotify("success", "Jadwal observasi berhasil dihapus.");
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Gagal menghapus jadwal.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-white border border-[#E3E8E7] rounded-lg p-5 space-y-4">
      <h3 className="font-heading font-bold text-base text-[#454545]">Jadwal Sesi Observasi</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {schedules.map((item) => {
          const used = Math.max(item.booked, item._count?.bookings ?? 0);
          return (
            <div key={item.id} className="border border-[#E3E8E7] rounded p-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold">{new Date(item.date).toLocaleDateString("id-ID")}</p>
                <p className="text-gray-500">{item.startTime} – {item.endTime} · Peserta {used}/{item.quota}</p>
              </div>
              <button
                type="button"
                disabled={busy || used > 0}
                onClick={() => handleDelete(item.id)}
                className="text-red-700 hover:underline disabled:opacity-40 font-semibold"
              >
                Hapus
              </button>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleCreate} className="grid sm:grid-cols-5 gap-2 pt-2 border-t border-[#E3E8E7]">
        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="px-2.5 py-1.5 border border-[#E3E8E7] rounded text-xs" />
        <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="px-2.5 py-1.5 border border-[#E3E8E7] rounded text-xs" />
        <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="px-2.5 py-1.5 border border-[#E3E8E7] rounded text-xs" />
        <input type="number" min={1} required value={quota} onChange={(e) => setQuota(Number(e.target.value))} className="px-2.5 py-1.5 border border-[#E3E8E7] rounded text-xs" />
        <button type="submit" disabled={busy} className="px-3 py-1.5 bg-[#0f7f6d] text-white rounded text-xs font-semibold">
          Tambah Jadwal
        </button>
      </form>
    </section>
  );
}
