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

interface ObserverCandidate {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

export function ObserverAssignmentPanel({
  periodId,
  unitId,
  onNotify,
}: {
  periodId: string;
  unitId?: string;
  onNotify: (type: "success" | "error", message: string) => void;
}) {
  const [observers, setObservers] = useState<ObserverAssignmentRow[]>([]);
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<ObserverCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<ObserverCandidate | null>(null);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateError, setCandidateError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadObservers = async () => {
    if (!periodId) return;
    const res = await fetch(`/api/observers?periodId=${encodeURIComponent(periodId)}`);
    if (res.ok) setObservers(await res.json());
  };

  useEffect(() => {
    loadObservers().catch(() => {});
  }, [periodId]);

  useEffect(() => {
    const query = search.trim();
    if (selectedCandidate || query.length < 2 || !unitId) {
      setCandidates([]);
      setCandidateLoading(false);
      setCandidateError(null);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setCandidateLoading(true);
      setCandidateError(null);
      try {
        const res = await fetch(
          `/api/observers/candidates?unitId=${encodeURIComponent(unitId)}&search=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Pencarian observer gagal.");
        setCandidates(Array.isArray(data) ? data : []);
      } catch (error) {
        if (controller.signal.aborted) return;
        setCandidates([]);
        setCandidateError(error instanceof Error ? error.message : "Pencarian observer gagal.");
      } finally {
        if (!controller.signal.aborted) setCandidateLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [search, selectedCandidate, unitId]);

  const handleAssign = async (event: FormEvent) => {
    event.preventDefault();
    if (!periodId) return;
    if (!unitId) {
      onNotify("error", "Unit periode belum tersedia. Muat ulang daftar periode lalu coba lagi.");
      return;
    }
    if (!selectedCandidate) {
      onNotify("error", "Pilih observer dari hasil pencarian terlebih dahulu.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/observers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedCandidate.id,
          unitId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Gagal menugaskan observer.");
      setSearch("");
      setCandidates([]);
      setSelectedCandidate(null);
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

      <form onSubmit={handleAssign} className="pt-3 border-t border-[#E3E8E7] space-y-2">
        <label className="block text-xs font-semibold text-[#454545]" htmlFor="observer-search">
          Cari observer aktif
        </label>
        <div className="relative">
          <input
            id="observer-search"
            autoComplete="off"
            placeholder="Ketik nama atau email observer (min. 2 karakter)"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSelectedCandidate(null);
            }}
            className="w-full px-3 py-2 border border-[#E3E8E7] rounded text-xs"
          />
          {!selectedCandidate && search.trim().length >= 2 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded border border-[#E3E8E7] bg-white">
              {candidateLoading ? (
                <p className="px-3 py-2 text-xs text-gray-500">Mencari observer...</p>
              ) : candidateError ? (
                <p className="px-3 py-2 text-xs text-red-700">{candidateError}</p>
              ) : candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => {
                      setSelectedCandidate(candidate);
                      setSearch(`${candidate.fullName} — ${candidate.email}`);
                      setCandidates([]);
                    }}
                    className="block w-full px-3 py-2 text-left text-xs hover:bg-[#F7F8F8] border-b last:border-b-0 border-[#E3E8E7]"
                  >
                    <span className="block font-semibold text-[#454545]">{candidate.fullName}</span>
                    <span className="block text-gray-500">{candidate.email}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-gray-500">Observer aktif tidak ditemukan.</p>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-gray-500">
            {selectedCandidate ? `Dipilih: ${selectedCandidate.fullName}` : "Hanya akun aktif dengan peran Observer SPMB yang ditampilkan."}
          </p>
          <button
            type="submit"
            disabled={busy || !selectedCandidate || !unitId}
            className="px-3 py-1.5 bg-[#0f7f6d] disabled:bg-[#9dbdb6] text-white rounded text-xs font-semibold"
          >
            Tugaskan Observer
          </button>
        </div>
      </form>
    </section>
  );
}
