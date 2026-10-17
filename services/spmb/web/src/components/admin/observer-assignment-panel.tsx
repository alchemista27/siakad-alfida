"use client";

import { FormEvent, useEffect, useState } from "react";

interface ObserverAssignmentRow {
  id: string;
  userId: string;
  unitId: string;
  userName: string;
  userEmail?: string | null;
  assignedAt?: string;
}

export function ObserverAssignmentPanel({
  periodId,
  onNotify,
}: {
  periodId: string;
  onNotify: (type: "success" | "error", message: string) => void;
}) {
  const [observers, setObservers] = useState<ObserverAssignmentRow[]>([]);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const loadObservers = async () => {
    if (!periodId) return;
    const res = await fetch(`/api/observers?periodId=${encodeURIComponent(periodId)}`);
    if (res.ok) setObservers(await res.json());
  };

  useEffect(() => {
    loadObservers().catch(() => {});
  }, [periodId]);

  const handleAssign = async (event: FormEvent) => {
    event.preventDefault();
    if (!periodId) return;
    setBusy(true);
    try {
      const res = await fetch("/api/observers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodId,
          userId: userId.trim(),
          userName: userName.trim(),
          userEmail: userEmail.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Gagal menugaskan observer.");
      setUserId("");
      setUserName("");
      setUserEmail("");
      await loadObservers();
      onNotify("success", "Observer berhasil ditugaskan ke unit ini.");
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Gagal menugaskan observer.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (row: ObserverAssignmentRow) => {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/observers/${encodeURIComponent(row.userId)}?unitId=${encodeURIComponent(row.unitId)}`,
        { method: "DELETE" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Gagal mencabut penugasan observer.");
      await loadObservers();
      onNotify("success", "Penugasan observer dicabut.");
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Gagal mencabut observer.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-white border border-[#E3E8E7] rounded-lg p-5 space-y-4">
      <h3 className="font-heading font-bold text-base text-[#454545]">Penugasan Penguji Observasi Unit</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {observers.map((item) => (
          <div key={item.id} className="border border-[#E3E8E7] rounded p-3 flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-[#454545]">{item.userName}</p>
              <p className="text-gray-500">{item.userEmail || item.userId}</p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleRemove(item)}
              className="text-red-700 hover:underline font-semibold"
            >
              Cabut
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={handleAssign} className="grid sm:grid-cols-4 gap-2 pt-2 border-t border-[#E3E8E7]">
        <input
          required
          placeholder="User ID Penguji"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="px-2.5 py-1.5 border border-[#E3E8E7] rounded text-xs"
        />
        <input
          required
          placeholder="Nama Penguji"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="px-2.5 py-1.5 border border-[#E3E8E7] rounded text-xs"
        />
        <input
          placeholder="Email Penguji (opsional)"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          className="px-2.5 py-1.5 border border-[#E3E8E7] rounded text-xs"
        />
        <button type="submit" disabled={busy} className="px-3 py-1.5 bg-[#0f7f6d] text-white rounded text-xs font-semibold">
          Tugaskan Observer
        </button>
      </form>
    </section>
  );
}
