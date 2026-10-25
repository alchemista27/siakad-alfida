"use client";

import { useEffect, useId, useState } from "react";

export type EmployeeSuggestion = { id: string; fullName: string; email: string | null };
export function EmployeeSuggestionPicker({ selected, onSelect, unitId }: { selected: EmployeeSuggestion | null; onSelect: (value: EmployeeSuggestion | null) => void; unitId?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EmployeeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const listId = useId();

  useEffect(() => {
    if (selected || query.trim().length < 1) { setResults([]); setLoading(false); setError(null); return; }
    const controller = new AbortController();
    setLoading(true); setError(null); setResults([]); setActiveIndex(-1);
    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ search: query.trim() });
        if (unitId) params.set("unitId", unitId);
        const response = await fetch(`/api/employees/suggestions?${params.toString()}`, { signal: controller.signal });
        if (!response.ok) {
          const body = await response.json().catch(() => null) as { message?: string | string[] } | null;
          throw new Error(Array.isArray(body?.message) ? body.message.join(" ") : body?.message || `Pencarian pegawai gagal (${response.status}).`);
        }
        const payload: unknown = await response.json();
        if (!Array.isArray(payload) || !payload.every((row): row is EmployeeSuggestion =>
          row !== null && typeof row === "object" && typeof row.id === "string" && row.id.length > 0 &&
          typeof row.fullName === "string" && row.fullName.length > 0 &&
          (row.email === null || typeof row.email === "string"))) {
          throw new Error("Format saran pegawai tidak valid.");
        }
        if (!controller.signal.aborted) setResults(payload);
      } catch (caught) {
        if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "Pencarian pegawai gagal.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, 200);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [query, selected, unitId]);

  function choose(employee: EmployeeSuggestion) {
    onSelect(employee); setQuery(employee.fullName); setOpen(false); setActiveIndex(-1);
  }
  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") { setOpen(false); setActiveIndex(-1); return; }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault(); setOpen(true);
      setActiveIndex((current) => event.key === "ArrowDown" ? Math.min(current + 1, results.length - 1) : Math.max(current - 1, 0));
    }
    if (event.key === "Enter" && open && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault(); choose(results[activeIndex]);
    }
  }
  const showFeedback = open && query.trim().length >= 1 && !selected;
  const showList = showFeedback && !loading && !error && results.length > 0;
  const feedbackId = `${listId}-feedback`;
  return <div className="relative">
    <label htmlFor={`${listId}-input`} className="text-xs font-semibold text-primary">Pegawai aktif</label>
    <input id={`${listId}-input`} type="text" autoComplete="off" role="combobox" aria-autocomplete="list" aria-controls={showList ? listId : undefined} aria-expanded={showList} aria-describedby={showFeedback || selected ? feedbackId : undefined} aria-activedescendant={showList && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
      value={query} maxLength={100} placeholder="Ketik nama atau email (mulai 1 karakter)"
      onChange={(event) => { setQuery(event.target.value); setResults([]); setActiveIndex(-1); onSelect(null); setOpen(true); }}
      onFocus={() => { if (!selected && query.trim()) setOpen(true); }} onBlur={() => setOpen(false)} onKeyDown={onKeyDown}
      className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-primary focus-visible:outline-tertiary" />
    {selected && <p id={feedbackId} className="mt-1 text-xs text-tertiary" role="status">Dipilih: {selected.fullName} · {selected.email}</p>}
    {showFeedback && (loading ? <p id={feedbackId} className="mt-1 text-xs text-slate-600" role="status">Memuat saran pegawai...</p> : error ? <p id={feedbackId} className="mt-1 text-xs text-rose-800" role="alert">{error}</p> : results.length === 0 ? <p id={feedbackId} className="mt-1 text-xs text-slate-600" role="status">Tidak ada pegawai aktif yang cocok.</p> : <p id={feedbackId} className="sr-only" role="status">{results.length} saran tersedia. Gunakan tombol panah untuk memilih.</p>)}
    {showList && <div id={listId} role="listbox" aria-label="Saran pegawai" className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-surface p-1 text-sm text-primary">
      {results.map((employee, index) => <div key={employee.id} id={`${listId}-${index}`} role="option" aria-selected={activeIndex === index}
        onMouseDown={(event) => event.preventDefault()} onClick={() => choose(employee)}
        className={`cursor-pointer rounded-sm p-2 hover:bg-neutral ${activeIndex === index ? "bg-neutral text-tertiary" : ""}`}>
        <span className="block font-semibold">{employee.fullName}</span><span className="block text-xs">{employee.email}</span>
      </div>)}
    </div>}
  </div>;
}
